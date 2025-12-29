import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// UPDATE school
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = params.id;
    const body = await request.json();
    const updated = await prisma.school.update({
      where: { id },
      data: {
        name: body.name,
        localGovId: body.localGovId,
        district: body.district,
        sector: body.sector,
        type: body.type,
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating school:', error);
    return NextResponse.json({ error: 'Failed to update school' }, { status: 500 });
  }
}

// DELETE school
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = params.id;
    await prisma.school.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting school:', error);
    if (error.code === 'P2003') {
      return NextResponse.json({
        error: 'Cannot delete: This school is still referenced by other records (e.g., placements, school groups, or fellowships). Please remove or reassign those records first.'
      }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to delete school' }, { status: 500 });
  }
}
