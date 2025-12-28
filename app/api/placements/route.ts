import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const placements = await prisma.placement.findMany({
      include: {
        school: true,
        manager: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(placements);
  } catch (error) {
    console.error('Error fetching placements:', error);
    return NextResponse.json({ error: 'Failed to fetch placements' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const placement = await prisma.placement.create({
      data: {
        name: body.name,
        schoolId: body.schoolId,
        managerId: body.managerId,
        fellowCount: body.fellowCount || 0,
        subjects: body.subjects,
      },
    });
    return NextResponse.json(placement, { status: 201 });
  } catch (error) {
    console.error('Error creating placement:', error);
    return NextResponse.json({ error: 'Failed to create placement' }, { status: 500 });
  }
}

// Removed PUT and DELETE handlers as they require an id param and should be in [id]/route.ts
