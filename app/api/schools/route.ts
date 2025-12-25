import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const schools = await prisma.school.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(schools);
  } catch (error) {
    console.error('Error fetching schools:', error);
    return NextResponse.json({ error: 'Failed to fetch schools' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const school = await prisma.school.create({
      data: {
        name: body.name,
        localGovId: body.localGovId,
        district: body.district,
        sector: body.sector,
        type: body.type,
      },
    });
    return NextResponse.json(school, { status: 201 });
  } catch (error) {
    console.error('Error creating school:', error);
    return NextResponse.json({ error: 'Failed to create school' }, { status: 500 });
  }
}
