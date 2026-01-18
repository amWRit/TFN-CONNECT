

import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { google } from 'googleapis';
import type { NextApiRequest, NextApiResponse } from 'next';
import { authOptions } from '../auth/[...nextauth]';
import { parse } from 'cookie';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Try to get admin Gmail token from httpOnly cookie
  let tokens = null;
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  const tokenStr = cookies['admin_gmail_token'];
  if (tokenStr) {
    try {
      tokens = JSON.parse(tokenStr);
    } catch {
      return res.status(400).json({ error: 'Invalid Gmail token.' });
    }
  }

  let oauth2Client;
  let userEmail = null;
  if (tokens) {
    // Use admin Gmail token
    oauth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      `${process.env.NEXTAUTH_URL}/api/admin/gmail/callback`
    );
    oauth2Client.setCredentials(tokens);
    // Try to get the authenticated user's email from the token info
    try {
      const tokenInfo = await oauth2Client.getTokenInfo(tokens.access_token);
      userEmail = tokenInfo.email || null;
    } catch {
      userEmail = null;
    }
  } else {
    // Fallback to NextAuth session (user login)
    const session = await getServerSession(req, res, authOptions) as (Session & { accessToken?: string, user?: { email?: string } });
    if (!session || !(session as any).accessToken) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: session.accessToken });
    userEmail = session.user?.email;
  }
  if (!userEmail) {
    return res.status(400).json({ error: 'No user email available' });
  }
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  try {
    // Fetch the draft in raw format (preserves all attachments and structure)
    const draft = await gmail.users.drafts.get({ userId: 'me', id: req.body.draftId, format: 'raw' });
    let raw = draft.data.message?.raw;
    if (!raw) {
      // fallback: try to get the full message
      const fullDraft = await gmail.users.drafts.get({ userId: 'me', id: req.body.draftId, format: 'full' });
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
      emailSource = emailSource.replace(/^(To:).*/m, `To: ${userEmail}`);
    } else {
      // Insert To after first header line (after From)
      emailSource = emailSource.replace(/^(From:.*)$/m, `$1\nTo: ${userEmail}`);
    }
    // Replace or add Cc header
    const cc = req.body.cc || '';
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
    const bcc = req.body.bcc || '';
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
    // Re-encode to base64url
    const updatedRaw = Buffer.from(emailSource, 'utf-8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const message = { raw: updatedRaw };

    // Send as a new message (not as a draft)
    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: message
    });
    res.status(200).json({ success: true, response });
  } catch (err) {
    const errorMessage = (err instanceof Error) ? err.message : String(err);
    res.status(500).json({ error: 'Failed to send draft', details: errorMessage });
  }
}
