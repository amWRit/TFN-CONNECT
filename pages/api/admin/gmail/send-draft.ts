import { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import { parse } from 'cookie';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Only allow admins (add your own admin check here if needed)
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

  const { draftId, to } = req.body;
  if (!draftId || !to) {
    return res.status(400).json({ error: 'Missing draftId or to' });
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    `${process.env.NEXTAUTH_URL}/api/admin/gmail/callback`
  );
  oauth2Client.setCredentials(tokens);
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  try {
    // Fetch the draft
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
    // Decode, update To header, and re-encode
    const buff = Buffer.from(raw.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
    let emailSource = buff.toString('utf-8');
    // Replace or add To header
    if (/^To:/m.test(emailSource)) {
      emailSource = emailSource.replace(/^(To:).*/m, `To: ${to}`);
    } else {
      // Insert To after first header line (after From)
      emailSource = emailSource.replace(/^(From:.*)$/m, `$1\nTo: ${to}`);
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
