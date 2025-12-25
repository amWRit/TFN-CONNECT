import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const education = await prisma.education.create({
      data: {
        personId: body.personId,
        institution: body.institution,
        university: body.university,
        level: body.level,
        name: body.name,
        sector: body.sector,
        start: new Date(body.start),
        end: body.end ? new Date(body.end) : null,
      },
    });
    return NextResponse.json(education, { status: 201 });
  } catch (error) {
    console.error('Error creating education:', error);
    return NextResponse.json({ error: 'Failed to create education' }, { status: 500 });
  }
}
