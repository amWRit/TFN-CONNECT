import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    if (!params.id) {
      return NextResponse.json({ error: 'Missing fellowship id' }, { status: 400 });
    }
    const body = await request.json();
    const fellowship = await prisma.fellowship.update({
      where: { id: params.id },
      data: {
        cohortId: body.cohortId,
        placementId: body.placementId,
        subjects: body.subjects,
      },
    });
    return NextResponse.json(fellowship);
  } catch (error) {
    console.error('Error updating fellowship:', error);
    return NextResponse.json({ error: 'Failed to update fellowship' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    await prisma.fellowship.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting fellowship:', error);
    return NextResponse.json({ error: 'Failed to delete fellowship' }, { status: 500 });
  }
}
