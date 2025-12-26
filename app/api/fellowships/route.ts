import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const fellowships = await prisma.fellowship.findMany({
      include: {
        person: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        cohort: true,
        placement: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(fellowships);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error fetching fellowships:', errorMessage);
    return NextResponse.json(
      { error: 'Failed to fetch fellowships', details: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const fellowship = await prisma.fellowship.create({
      data: {
        personId: body.personId,
        cohortId: body.cohortId,
        placementId: body.placementId,
        subjects: body.subjects,
      },
    });
    return NextResponse.json(fellowship, { status: 201 });
  } catch (error) {
    console.error('Error creating fellowship:', error);
    return NextResponse.json({ error: 'Failed to create fellowship' }, { status: 500 });
  }
}
