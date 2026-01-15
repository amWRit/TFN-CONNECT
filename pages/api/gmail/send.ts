import { getSession } from 'next-auth/react';
import type { Session } from 'next-auth';
import { google } from 'googleapis';

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req }) as (Session & { accessToken?: string });
  if (!session || !session.accessToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { subject, body, recipients, cc, bcc } = req.body;
  if (!subject || !body || !recipients || !Array.isArray(recipients) || recipients.length === 0) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: session.accessToken });
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  function makeEmail({
    to,
    cc,
    bcc,
    subject,
    body,
  }: {
    to: string;
    cc?: string;
    bcc?: string;
    subject: string;
    body: string;
  }) {
    let headers = [];
    headers.push(`To: ${to}`);
    if (cc) headers.push(`Cc: ${cc}`);
    if (bcc) headers.push(`Bcc: ${bcc}`);
    headers.push(`Subject: ${subject}`);
    headers.push('Content-Type: text/plain; charset="UTF-8"');
    return `${headers.join('\r\n')}\r\n\r\n${body}`;
  }

  try {
    for (const recipient of recipients) {
      const raw = Buffer.from(makeEmail({
        to: recipient.email,
        cc,
        bcc,
        subject,
        body
      })).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
      await gmail.users.messages.send({
        userId: 'me',
        requestBody: { raw }
      });
    }
    res.status(200).json({ success: true });
  } catch (err) {
    const errorMessage = (err instanceof Error) ? err.message : String(err);
    res.status(500).json({ error: 'Failed to send email', details: errorMessage });
  }
}
