import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check for the admin_gmail_token cookie (httpOnly, server-side)
  const token = req.cookies['admin_gmail_token'];
  if (token) {
    res.status(200).json({ authenticated: true });
  } else {
    res.status(200).json({ authenticated: false });
  }
}
