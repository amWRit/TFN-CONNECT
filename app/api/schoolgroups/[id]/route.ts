import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// UPDATE school group
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = params.id;
    const body = await request.json();
    const updated = await prisma.schoolGroup.update({
      where: { id },
      data: {
        name: body.name,
        localGovId: body.localGovId,
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating school group:', error);
    return NextResponse.json({ error: 'Failed to update school group' }, { status: 500 });
  }
}

// DELETE school group
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = params.id;
    await prisma.schoolGroup.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting school group:', error);
    if (error.code === 'P2003') {
      return NextResponse.json({
        error: 'Cannot delete: This school group is still referenced by other records (e.g., schools, placements, or fellowships). Please remove or reassign those records first.'
      }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to delete school group' }, { status: 500 });
  }
}
