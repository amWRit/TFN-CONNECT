import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const RECOVERY_PASS_HASH = process.env.RECOVERY_PASS_HASH;

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  console.log('[ADMIN LOGIN] Password received:', password);
  console.log('[ADMIN LOGIN] RECOVERY_PASS_HASH:', RECOVERY_PASS_HASH);
  if (!password) {
    console.log('[ADMIN LOGIN] Missing password');
    return NextResponse.json({ error: 'Missing password' }, { status: 400 });
  }
  if (!RECOVERY_PASS_HASH) {
    console.log('[ADMIN LOGIN] RECOVERY_PASS_HASH not set');
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
  }
  const hash = crypto.createHash('sha256').update(password).digest('hex');
  console.log('[ADMIN LOGIN] SHA256 hash:', hash);
  const match = hash === RECOVERY_PASS_HASH;
  console.log('[ADMIN LOGIN] Password match:', match);
  if (!match) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 403 });
  }
  // Set admin-session cookie
  return NextResponse.json({ success: true }, {
    headers: {
      'Set-Cookie': `admin-session=1; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`
    }
  });
}
