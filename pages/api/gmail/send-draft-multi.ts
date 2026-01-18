import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { google } from 'googleapis';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !(session as any).accessToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { draftId, recipients, cc, bcc } = req.body;
  if (!draftId || !recipients || !Array.isArray(recipients) || recipients.length === 0) {
    console.log('DEBUG: Missing or empty recipients', { draftId, recipients });
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: (session as any).accessToken });
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  try {
    // Fetch the draft
    const draftRes = await gmail.users.drafts.get({ userId: 'me', id: draftId });
    const message = draftRes.data.message;
    const headers = message?.payload?.headers || [];
    const subjectHeader = headers.find(h => h.name === 'Subject');
    const subject = subjectHeader?.value || '';
    // Prefer HTML body, fallback to plain text
    let body = '';
    const parts = message?.payload?.parts;
    if (parts && parts.length) {
      const htmlPart = parts.find(p => p.mimeType === 'text/html');
      if (htmlPart && htmlPart.body?.data) {
        body = Buffer.from(htmlPart.body.data, 'base64').toString('utf-8');
      } else {
        const textPart = parts.find(p => p.mimeType === 'text/plain');
        if (textPart && textPart.body?.data) {
          body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
        }
      }
    } else if (message?.payload?.body?.data) {
      body = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
    }

    // Compose and send to each recipient
    console.log('DEBUG: Recipients to send to:', recipients);
    for (const recipient of recipients) {
      if (!recipient.email || typeof recipient.email !== 'string' || !recipient.email.includes('@')) {
        console.log('DEBUG: Skipping recipient with invalid email:', recipient);
        continue;
      }
      console.log('DEBUG: Sending to:', recipient.email);
      const raw = Buffer.from([
        `To: ${recipient.email}`,
        cc ? `Cc: ${cc}` : '',
        bcc ? `Bcc: ${bcc}` : '',
        `Subject: ${subject}`,
        'Content-Type: text/html; charset="UTF-8"',
        '',
        body
      ].filter(Boolean).join('\r\n')).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
      await gmail.users.messages.send({
        userId: 'me',
        requestBody: { raw }
      });
    }
    res.status(200).json({ success: true });
  } catch (err) {
    const errorMessage = (err instanceof Error) ? err.message : String(err);
    res.status(500).json({ error: 'Failed to send draft to recipients', details: errorMessage });
  }
}
