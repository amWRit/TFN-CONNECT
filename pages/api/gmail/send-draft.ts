
import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { google } from 'googleapis';
import type { NextApiRequest, NextApiResponse } from 'next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions) as (Session & { accessToken?: string, user?: { email?: string } });
  console.log('DEBUG: Session in send-draft:', session);
  if (!session || !(session as any).accessToken) {
    console.log('DEBUG: Not authenticated or missing accessToken', session);
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { draftId } = req.body;
  if (!draftId) {
    console.log('DEBUG: Missing draftId', req.body);
    return res.status(400).json({ error: 'Missing draftId' });
  }

  const userEmail = session.user?.email;
  if (!userEmail) {
    console.log('DEBUG: No user email in session', session);
    return res.status(400).json({ error: 'No user email in session' });
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: session.accessToken });
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
      emailSource = emailSource.replace(/^(To:).*/m, `To: ${userEmail}`);
    } else {
      // Insert To after first header line (after From)
      emailSource = emailSource.replace(/^(From:.*)$/m, `$1\nTo: ${userEmail}`);
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
    console.error('DEBUG: Error sending draft:', errorMessage);
    res.status(500).json({ error: 'Failed to send draft', details: errorMessage });
  }
}
