// DELETE /api/opportunities/[id]
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  try {
    await prisma.opportunity.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete opportunity' }, { status: 500 });
  }
}
// PUT /api/opportunities/[id]
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  const body = await request.json();
  try {
    const updated = await prisma.opportunity.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        types: body.types,
        location: body.location,
        status: body.status,
      },
    });
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update opportunity' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/opportunities/[id]
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  try {
    const opportunity = await prisma.opportunity.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true }
        }
      }
    });
    if (!opportunity) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    // Fetch interests for this opportunity
    const interestsRaw = await prisma.interest.findMany({
      where: {
        targetType: 'OPPORTUNITY',
        targetId: id
      },
      include: {
        person: { select: { id: true, firstName: true, lastName: true, email1: true, profileImage: true } }
      }
    });
    // Map 'person' to 'user' for frontend compatibility
    const interests = interestsRaw.map(i => ({
      ...i,
      user: i.person,
      person: undefined
    }));
    return NextResponse.json({ ...opportunity, interests });
    if (!opportunity) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(opportunity);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch opportunity' }, { status: 500 });
  }
}
