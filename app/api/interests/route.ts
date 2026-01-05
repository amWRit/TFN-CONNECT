// GET /api/interests?targetType=JOB&targetId=j1
import { InterestTargetType } from '@prisma/client';
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetType = searchParams.get('targetType');
  const targetId = searchParams.get('targetId');
  if (!targetType || !targetId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  if (!Object.values(InterestTargetType).includes(targetType as InterestTargetType)) {
    return NextResponse.json({ error: 'Invalid targetType' }, { status: 400 });
  }
  try {
    const interests = await prisma.interest.findMany({
      where: { targetType: targetType as InterestTargetType, targetId },
      include: {
        person: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
    // For compatibility with frontend, rename 'person' to 'user' in each interest
    const result = interests.map((i) => ({
      ...i,
      user: i.person,
      person: undefined,
    }));
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch interests' }, { status: 500 });
  }
}
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
