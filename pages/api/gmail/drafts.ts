import { getSession } from 'next-auth/react';
import { google } from 'googleapis';
import type { Session } from 'next-auth';

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {  
  const session = await getSession({ req }) as (Session & { accessToken?: string });
  if (!session || !session.accessToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: session.accessToken });
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  try {
    const draftsRes = await gmail.users.drafts.list({ userId: 'me', maxResults: 20 });
    console.log('Gmail drafts API response:', JSON.stringify(draftsRes.data, null, 2));
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
    console.error('Error fetching Gmail drafts:', errorMessage);
    res.status(500).json({ error: 'Failed to fetch drafts', details: errorMessage });
  }
}
