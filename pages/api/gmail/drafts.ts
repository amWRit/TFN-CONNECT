
import { getSession } from 'next-auth/react';
import { google } from 'googleapis';
import type { Session } from 'next-auth';
import type { NextApiRequest, NextApiResponse } from 'next';
import { parse } from 'cookie';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
  if (tokens) {
    // Use admin Gmail token
    oauth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      `${process.env.NEXTAUTH_URL}/api/admin/gmail/callback`
    );
    oauth2Client.setCredentials(tokens);
  } else {
    // Fallback to NextAuth session (user login)
    const session = await getSession({ req }) as (Session & { accessToken?: string });
    if (!session || !session.accessToken) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: session.accessToken });
  }
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  try {
    const draftsRes = await gmail.users.drafts.list({ userId: 'me', maxResults: 20 });
    const drafts = (draftsRes.data.drafts || [])
      .filter((d) => typeof d.id === 'string')
      .map(async (d) => {
        const draftDetail = await gmail.users.drafts.get({ userId: 'me', id: d.id as string });
        const headers = draftDetail.data.message?.payload?.headers || [];
        const subjectHeader = headers.find(h => h.name === 'Subject');
        return { id: d.id, subject: subjectHeader?.value || '(No Subject)' };
      });
    const draftsList = await Promise.all(drafts);
    res.status(200).json({ drafts: draftsList });
  } catch (err) {
    const errorMessage = typeof err === 'object' && err !== null && 'message' in err ? (err as { message: string }).message : String(err);
    res.status(500).json({ error: 'Failed to fetch drafts', details: errorMessage });
  }
}
