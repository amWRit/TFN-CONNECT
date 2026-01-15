import { getSession } from 'next-auth/react';
import { google } from 'googleapis';
import type { Session } from 'next-auth';

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {  
  const session = await getSession({ req }) as (Session & { accessToken?: string });
  if (!session || !session.accessToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing draft id' });
  const draftId = Array.isArray(id) ? id[0] : id;

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: session.accessToken });
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  try {
    const draftRes = await gmail.users.drafts.get({ userId: 'me', id: draftId });
    console.log('Gmail draft detail:', JSON.stringify(draftRes.data, null, 2));
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
    console.error('Error fetching Gmail draft:', errorMessage);
    res.status(500).json({ error: 'Failed to fetch draft', details: errorMessage });
  }
}
