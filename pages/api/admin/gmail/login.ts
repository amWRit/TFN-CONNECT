import { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';

// This endpoint starts the admin Gmail OAuth flow
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    `${process.env.NEXTAUTH_URL}/api/admin/gmail/callback`
  );

  const scopes = [
    'openid',
    'email',
    'profile',
    'https://mail.google.com/'
  ];

  // Support prompt=select_account from query
  let promptParam = 'consent';
  if (typeof req.query.prompt === 'string') {
    promptParam = req.query.prompt;
  }
  // Google expects prompt as a space-separated string, not URL-encoded
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: decodeURIComponent(promptParam),
    scope: scopes,
  });
  res.redirect(url);
}
