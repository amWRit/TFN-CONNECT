import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

// DELETE /api/interests
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { targetType, targetId } = await request.json();
  if (!targetType || !targetId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  try {
    await prisma.interest.delete({
      where: {
        personId_targetType_targetId: {
          personId: session.user.id,
          targetType,
          targetId,
        },
      },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to remove interest' }, { status: 500 });
  }
}

// POST /api/interests
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { targetType, targetId } = await request.json();
  if (!targetType || !targetId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  try {
    const interest = await prisma.interest.upsert({
      where: {
        personId_targetType_targetId: {
          personId: session.user.id,
          targetType,
          targetId,
        },
      },
      update: {},
      create: {
        personId: session.user.id,
        targetType,
        targetId,
      },
    });
    return NextResponse.json(interest, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to register interest' }, { status: 500 });
  }
}
