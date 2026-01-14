import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { SubscriptionType, PersonType } from '@prisma/client';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const personType = searchParams.get('personType') as PersonType | null;
  const emailPreference = searchParams.get('emailPreference') || 'primary';

  // Build query
  const where: any = {};
  if (personType) where.type = personType;

  let emails: string[] = [];
  let users: any[] = [];
  if (emailPreference === 'primary') {
    where.email1 = { not: '' };
    users = await prisma.person.findMany({ where, select: { id: true, firstName: true, email1: true, type: true } });
    emails = users.map(u => u.email1);
  } else if (emailPreference === 'secondary') {
    where.email2 = { not: '' };
    users = await prisma.person.findMany({ where, select: { id: true, firstName: true, email2: true, type: true } });
    emails = users.map(u => u.email2);
  } else {
    // both
    where.OR = [{ email1: { not: '' } }, { email2: { not: '' } }];
    users = await prisma.person.findMany({ where, select: { id: true, firstName: true, email1: true, email2: true, type: true } });
    emails = users.flatMap(u => [u.email1, u.email2].filter(Boolean));
  }

  return NextResponse.json({ count: emails.length, users });
}
