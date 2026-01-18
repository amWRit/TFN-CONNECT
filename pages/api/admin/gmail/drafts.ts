import { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import { parse } from 'cookie';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow admins (add your own admin check here)
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

  const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    `${process.env.NEXTAUTH_URL}/api/admin/gmail/callback`
  );
  oauth2Client.setCredentials(tokens);
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  // Example: list drafts for admin
  try {
    const draftsRes = await gmail.users.drafts.list({ userId: 'me', maxResults: 20 });
    res.status(200).json({ drafts: draftsRes.data.drafts || [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch drafts', details: String(err) });
  }
}
