import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const schoolGroups = await prisma.schoolGroup.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(schoolGroups);
  } catch (error) {
    console.error('Error fetching schoolGroups:', error);
    return NextResponse.json({ error: 'Failed to fetch school groups' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const schoolGroup = await prisma.schoolGroup.create({
      data: {
        name: body.name,
        localGovId: body.localGovId,
      },
    });
    return NextResponse.json(schoolGroup, { status: 201 });
  } catch (error) {
    console.error('Error creating schoolGroup:', error);
    return NextResponse.json({ error: 'Failed to create school group' }, { status: 500 });
  }
}
