import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const RECOVERY_PASS1_HASH = process.env.RECOVERY_PASS1_HASH;
const RECOVERY_PASS2_HASH = process.env.RECOVERY_PASS2_HASH;
const SECURITY_Q1_HASH = process.env.SECURITY_Q1_HASH; // lowercase, no spaces
const SECURITY_Q2_HASH = process.env.SECURITY_Q2_HASH; // just year, e.g. '2013'
// Collect all super admin emails from env (SUPER_ADMIN_EMAIL1, SUPER_ADMIN_EMAIL2, ...)
const superAdminEmails = Object.entries(process.env)
  .filter(([key]) => key.startsWith('SUPER_ADMIN_EMAIL'))
  .map(([, value]) => value)
  .filter(Boolean);

import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const { email, password1, password2, answer1, answer2 } = await req.json();
  if (!email || !password1) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  if (!superAdminEmails.includes(email)) {
    return NextResponse.json({ error: 'Unauthorized email' }, { status: 403 });
  }
  if (!RECOVERY_PASS1_HASH || !RECOVERY_PASS2_HASH || !SECURITY_Q1_HASH || !SECURITY_Q2_HASH) {
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
  }
  const hash1 = crypto.createHash('sha256').update(password1).digest('hex');
  if (hash1 !== RECOVERY_PASS1_HASH) {
    return NextResponse.json({ error: 'Invalid first recovery password' }, { status: 403 });
  }

  // Step 1: Only email and password1 are checked
  if (
    (!answer1 || answer1 === '___') &&
    (!answer2 || answer2 === '___') &&
    (!password2 || password2 === '___')
  ) {
    return NextResponse.json({ success: true, step: 1 });
  }

  // Step 2: Check security questions
  if (
    answer1 && answer1 !== '___' &&
    answer2 && answer2 !== '___' &&
    (!password2 || password2 === '___')
  ) {
    const normalizedA1 = answer1.trim().toLowerCase().replace(/\s+/g, '');
    const normalizedA2 = answer2.trim();
    const a1hash = crypto.createHash('sha256').update(normalizedA1).digest('hex');
    const a2hash = crypto.createHash('sha256').update(normalizedA2).digest('hex');
    if (a1hash !== SECURITY_Q1_HASH) {
      return NextResponse.json({ error: 'Incorrect answer to security question 1' }, { status: 403 });
    }
    if (a2hash !== SECURITY_Q2_HASH) {
      return NextResponse.json({ error: 'Incorrect answer to security question 2' }, { status: 403 });
    }
    return NextResponse.json({ success: true, step: 2 });
  }

  // Step 3: Final step, check password2 and promote
  if (password2 && password2 !== '___') {
    const normalizedA1 = answer1.trim().toLowerCase().replace(/\s+/g, '');
    const normalizedA2 = answer2.trim();
    const a1hash = crypto.createHash('sha256').update(normalizedA1).digest('hex');
    const a2hash = crypto.createHash('sha256').update(normalizedA2).digest('hex');
    if (a1hash !== SECURITY_Q1_HASH) {
      return NextResponse.json({ error: 'Incorrect answer to security question 1' }, { status: 403 });
    }
    if (a2hash !== SECURITY_Q2_HASH) {
      return NextResponse.json({ error: 'Incorrect answer to security question 2' }, { status: 403 });
    }
    const hash2 = crypto.createHash('sha256').update(password2).digest('hex');
    if (hash2 !== RECOVERY_PASS2_HASH) {
      return NextResponse.json({ error: 'Invalid second recovery password' }, { status: 403 });
    }
    // Promote the super admin email to STAFF_ADMIN
    const user = await prisma.person.findUnique({
      where: { email1: email },
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    await prisma.person.update({
      where: { id: user.id },
      data: { type: 'STAFF_ADMIN' },
    });
    console.log(`[RECOVERY] Admin restored: ${user.email1}`);
    return NextResponse.json({ success: true, restored: user.email1 });
  }

  // Fallback: missing required fields for this step
  return NextResponse.json({ error: 'Missing required fields for this step' }, { status: 400 });
}
