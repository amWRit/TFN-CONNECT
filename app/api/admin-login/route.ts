import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const ADMIN_PASS_HASH = process.env.ADMIN_PASS_HASH;

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (!password) {
    return NextResponse.json({ error: 'Missing password' }, { status: 400 });
  }
  if (!ADMIN_PASS_HASH) {
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
  }
  const hash1 = crypto.createHash('sha256').update(password).digest('hex');
  if (hash1 !== ADMIN_PASS_HASH) {
    return NextResponse.json({ error: 'Invalid admin password' }, { status: 403 });
  }
  // Set admin-session cookie
  return NextResponse.json({ success: true }, {
    headers: {
      'Set-Cookie': `admin-session=1; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`
    }
  });
}
