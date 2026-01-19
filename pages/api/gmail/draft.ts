
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

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing draft id' });
  const draftId = Array.isArray(id) ? id[0] : id;
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  try {
    const draftRes = await gmail.users.drafts.get({ userId: 'me', id: draftId });
    const headers = draftRes.data.message?.payload?.headers || [];
    const subjectHeader = headers.find(h => h.name === 'Subject');
    let body = '';
    const parts = draftRes.data.message?.payload?.parts;
    if (parts && parts.length) {
      // Try text/plain first
      const textPart = parts.find(p => p.mimeType === 'text/plain');
      if (textPart && textPart.body?.data) {
        body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
      } else {
        // Fallback to text/html if available
        const htmlPart = parts.find(p => p.mimeType === 'text/html');
        if (htmlPart && htmlPart.body?.data) {
          body = Buffer.from(htmlPart.body.data, 'base64').toString('utf-8');
        }
      }
    } else if (draftRes.data.message?.payload?.body?.data) {
      body = Buffer.from(draftRes.data.message.payload.body.data, 'base64').toString('utf-8');
    }
    res.status(200).json({ subject: subjectHeader?.value || '', body });
  } catch (err) {
    const errorMessage = typeof err === 'object' && err !== null && 'message' in err
      ? (err as { message: string }).message
      : String(err);
    res.status(500).json({ error: 'Failed to fetch draft', details: errorMessage });
  }
}
