import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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
