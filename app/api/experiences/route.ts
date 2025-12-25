import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const experience = await prisma.experience.create({
      data: {
        personId: body.personId,
        orgName: body.orgName,
        title: body.title,
        sector: body.sector,
        type: body.type,
        description: body.description,
        start: new Date(body.start),
        end: body.end ? new Date(body.end) : null,
      },
    });
    return NextResponse.json(experience, { status: 201 });
  } catch (error) {
    console.error('Error creating experience:', error);
    return NextResponse.json({ error: 'Failed to create experience' }, { status: 500 });
  }
}
