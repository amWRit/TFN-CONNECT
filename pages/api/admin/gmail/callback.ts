import { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import { serialize } from 'cookie';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    `${process.env.NEXTAUTH_URL}/api/admin/gmail/callback`
  );

  const { code } = req.query;
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Missing code' });
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    // Store tokens in a secure, httpOnly cookie (or session)
    res.setHeader('Set-Cookie', serialize('admin_gmail_token', JSON.stringify(tokens), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      sameSite: 'lax',
    }));
    res.redirect('/admin/auto-login'); // or wherever the admin UI is
  } catch (err) {
    res.status(500).json({ error: 'Failed to get Gmail token', details: String(err) });
  }
}
