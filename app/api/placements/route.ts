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

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    await prisma.placement.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete placement' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const updated = await prisma.placement.update({
      where: { id },
      data: {
        name: body.name,
        schoolId: body.schoolId,
        managerId: body.managerId,
        fellowCount: body.fellowCount || 0,
        subjects: body.subjects,
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update placement' }, { status: 500 });
  }
}
