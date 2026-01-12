import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

const RECOVERY_PASS_HASH = process.env.RECOVERY_PASS_HASH;
const SUPER_ADMIN_EMAIL1 = process.env.SUPER_ADMIN_EMAIL1;
const SUPER_ADMIN_EMAIL2 = process.env.SUPER_ADMIN_EMAIL2;

import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
  }
  if (![SUPER_ADMIN_EMAIL1, SUPER_ADMIN_EMAIL2].includes(email)) {
    return NextResponse.json({ error: 'Unauthorized email' }, { status: 403 });
  }
  if (!RECOVERY_PASS_HASH || !(await bcrypt.compare(password, RECOVERY_PASS_HASH))) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 403 });
  }
  // Find first @teachfornepal.org user
  const user = await prisma.person.findFirst({
    where: {
      email1: { endsWith: '@teachfornepal.org' },
    },
    orderBy: { id: 'asc' },
  });
  if (!user) {
    return NextResponse.json({ error: 'No TFN user found' }, { status: 404 });
  }
  // Promote to STAFF_ADMIN
  await prisma.person.update({
    where: { id: user.id },
    data: { type: 'STAFF_ADMIN' },
  });
  // Log and return
  console.log(`[RECOVERY] Admin restored: ${user.email1}`);
  return NextResponse.json({ success: true, restored: user.email1 });
}
