

import { google } from 'googleapis';
import type { NextApiRequest, NextApiResponse } from 'next';
import { parse } from 'cookie';
import { simpleParser } from 'mailparser';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Use admin Gmail token from cookie
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  const tokenStr = cookies['admin_gmail_token'];
  if (!tokenStr) {
    return res.status(401).json({ error: 'No Gmail token. Please authenticate as admin.' });
  }
  let tokens;
  try {
    tokens = JSON.parse(tokenStr);
  } catch {
    return res.status(400).json({ error: 'Invalid Gmail token.' });
  }

  const { draftId, recipients, cc, bcc, personalizeSalutation } = req.body;
  if (!draftId || !recipients || !Array.isArray(recipients) || recipients.length === 0) {
    console.log('DEBUG: Missing or empty recipients', { draftId, recipients });
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    `${process.env.NEXTAUTH_URL}/api/admin/gmail/callback`
  );
  oauth2Client.setCredentials(tokens);
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  try {
    // Batch send logic using raw draft
    const BATCH_SIZE = 100;
    let sentCount = 0;
    let failed = [];
    let batchResults = [];
    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
      const batch = recipients.slice(i, i + BATCH_SIZE);
      let batchSent = 0;
      let batchFailed = [];
      for (const recipient of batch) {
        if (!recipient.email || typeof recipient.email !== 'string' || !recipient.email.includes('@')) {
          batchFailed.push(recipient.email);
          continue;
        }
        try {
          // Fetch the draft in raw format for each send (preserves attachments)
          const draft = await gmail.users.drafts.get({ userId: 'me', id: draftId, format: 'raw' });
          let raw = draft.data.message?.raw;
          if (!raw) {
            // fallback: try to get the full message
            const fullDraft = await gmail.users.drafts.get({ userId: 'me', id: draftId, format: 'full' });
            if (fullDraft.data.message?.raw) {
              raw = fullDraft.data.message.raw;
            } else {
              throw new Error('Could not retrieve raw MIME message from draft');
            }
          }
          // Decode, update To/Cc/Bcc headers, and re-encode
          const buff = Buffer.from(raw.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
          let emailSource = buff.toString('utf-8');
          // Replace or add To header
          if (/^To:/m.test(emailSource)) {
            emailSource = emailSource.replace(/^(To:).*/m, `To: ${recipient.email}`);
          } else {
            // Insert To after first header line (after From)
            emailSource = emailSource.replace(/^(From:.*)$/m, `$1\nTo: ${recipient.email}`);
          }
          // Replace or add Cc header
          if (cc) {
            if (/^Cc:/m.test(emailSource)) {
              emailSource = emailSource.replace(/^(Cc:).*/m, `Cc: ${cc}`);
            } else {
              // Insert Cc after To
              if (/^To:.*$/m.test(emailSource)) {
                emailSource = emailSource.replace(/^(To:.*)$/m, `$1\nCc: ${cc}`);
              } else {
                // If To is missing, add Cc after From
                emailSource = emailSource.replace(/^(From:.*)$/m, `$1\nCc: ${cc}`);
              }
            }
          } else {
            // Remove Cc if present and not provided
            emailSource = emailSource.replace(/^Cc:.*\n?/m, '');
          }
          // Replace or add Bcc header
          if (bcc) {
            if (/^Bcc:/m.test(emailSource)) {
              emailSource = emailSource.replace(/^(Bcc:).*/m, `Bcc: ${bcc}`);
            } else {
              // Insert Bcc after Cc or To
              if (/^Cc:.*$/m.test(emailSource)) {
                emailSource = emailSource.replace(/^(Cc:.*)$/m, `$1\nBcc: ${bcc}`);
              } else if (/^To:.*$/m.test(emailSource)) {
                emailSource = emailSource.replace(/^(To:.*)$/m, `$1\nBcc: ${bcc}`);
              } else {
                // If To/Cc are missing, add Bcc after From
                emailSource = emailSource.replace(/^(From:.*)$/m, `$1\nBcc: ${bcc}`);
              }
            }
          } else {
            // Remove Bcc if present and not provided
            emailSource = emailSource.replace(/^Bcc:.*\n?/m, '');
          }

          // Personalize salutation if requested
          if (personalizeSalutation && recipient.name) {
            let parsed;
            try {
              parsed = await simpleParser(emailSource);
            } catch (err) {
              // If mailparser fails, fallback to previous logic
              parsed = null;
            }
            let body = '';
            let isHtml = false;
            let subject = '';
            let from = '';
            let to = recipient.email;
            let ccVal = cc || '';
            let bccVal = bcc || '';
            if (parsed) {
              subject = parsed.subject || '';
              from = parsed.from?.text || '';
              if (parsed.to) {
                if (Array.isArray(parsed.to)) {
                  to = parsed.to.map(addr => addr.text).join(', ');
                } else if ('text' in parsed.to) {
                  to = parsed.to.text;
                } else if (parsed.to && typeof parsed.to === 'object' && 'address' in parsed.to) {
                  to = (parsed.to as { address: string }).address;
                }
              }
              if (parsed.html) {
                body = `<p>Dear ${recipient.name},</p>` + parsed.html;
                isHtml = true;
              } else if (parsed.text) {
                body = `Dear ${recipient.name},\n\n${parsed.text}`;
                isHtml = false;
              } else {
                body = '';
              }
            } else {
              // Fallback: treat all as plain text
              body = `Dear ${recipient.name},\n\n` + emailSource;
              isHtml = false;
            }
            // Build new MIME message
            let mimeMessage = '';
            if (subject) mimeMessage += `Subject: ${subject}\r\n`;
            if (from) mimeMessage += `From: ${from}\r\n`;
            if (to) mimeMessage += `To: ${to}\r\n`;
            if (ccVal) mimeMessage += `Cc: ${ccVal}\r\n`;
            if (bccVal) mimeMessage += `Bcc: ${bccVal}\r\n`;
            if (isHtml) {
              mimeMessage += 'Content-Type: text/html; charset="UTF-8"\r\n';
              mimeMessage += '\r\n' + body;
            } else {
              mimeMessage += 'Content-Type: text/plain; charset="UTF-8"\r\n';
              mimeMessage += '\r\n' + body;
            }
            emailSource = mimeMessage;
          }

          // Re-encode to base64url
          const updatedRaw = Buffer.from(emailSource, 'utf-8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
          const message = { raw: updatedRaw };
          // Send as a new message (not as a draft)
          await gmail.users.messages.send({
            userId: 'me',
            requestBody: message
          });
          batchSent++;
        } catch (err) {
          batchFailed.push(recipient.email);
        }
      }
      sentCount += batchSent;
      failed.push(...batchFailed);
      batchResults.push({ batch: i/BATCH_SIZE+1, sent: batchSent, failed: batchFailed });
    }
    res.status(200).json({ success: true, sent: sentCount, failed, batchResults });
  } catch (err) {
    const errorMessage = (err instanceof Error) ? err.message : String(err);
    res.status(500).json({ error: 'Failed to send draft to recipients', details: errorMessage });
  }
}
