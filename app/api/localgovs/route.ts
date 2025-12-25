import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const localGovs = await prisma.localGov.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(localGovs);
  } catch (error) {
    console.error('Error fetching localGovs:', error);
    return NextResponse.json({ error: 'Failed to fetch local governments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const localGov = await prisma.localGov.create({
      data: {
        name: body.name,
        province: body.province,
      },
    });
    return NextResponse.json(localGov, { status: 201 });
  } catch (error) {
    console.error('Error creating localGov:', error);
    return NextResponse.json({ error: 'Failed to create local government' }, { status: 500 });
  }
}
