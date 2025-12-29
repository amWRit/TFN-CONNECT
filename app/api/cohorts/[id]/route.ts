import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// UPDATE cohort
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = params.id;
    const body = await request.json();
    const updated = await prisma.cohort.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        start: body.start,
        end: body.end,
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating cohort:', error);
    return NextResponse.json({ error: 'Failed to update cohort' }, { status: 500 });
  }
}

// DELETE cohort
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = params.id;
    await prisma.cohort.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting cohort:', error);
    if (error.code === 'P2003') {
      return NextResponse.json({
        error: 'Cannot delete: This cohort is still referenced by other records (e.g., fellowships, alumni, or placements). Please remove or reassign those records first.'
      }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to delete cohort' }, { status: 500 });
  }
}
