import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// UPDATE local government
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = params.id;
    const body = await request.json();
    const updated = await prisma.localGov.update({
      where: { id },
      data: {
        name: body.name,
        province: body.province,
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating local government:', error);
    return NextResponse.json({ error: 'Failed to update local government' }, { status: 500 });
  }
}

// DELETE local government
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = params.id;
    await prisma.localGov.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting local government:', error);
    if (error.code === 'P2003') {
      return NextResponse.json({
        error: 'Cannot delete: This local government is still referenced by other records (e.g., schools, placements, or school groups). Please remove or reassign those records first.'
      }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to delete local government' }, { status: 500 });
  }
}
