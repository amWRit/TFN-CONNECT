import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

// POST /api/events/rsvp - Create or update RSVP
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { eventId, status, note } = await request.json();
  if (!eventId) {
    return NextResponse.json({ error: 'Missing eventId' }, { status: 400 });
  }

  // Validate event exists
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  // Don't allow RSVP to own event
  if (event.createdById === session.user.id) {
    return NextResponse.json({ error: 'Cannot RSVP to your own event' }, { status: 400 });
  }

  try {
    const rsvp = await prisma.eventRsvp.upsert({
      where: {
        personId_eventId: {
          personId: session.user.id,
          eventId,
        },
      },
      update: {
        status: status || 'confirmed',
        note: note || null,
      },
      create: {
        personId: session.user.id,
        eventId,
        status: status || 'confirmed',
        note: note || null,
      },
    });
    return NextResponse.json(rsvp, { status: 201 });
  } catch (err) {
    console.error('Failed to create RSVP:', err);
    return NextResponse.json({ error: 'Failed to create RSVP' }, { status: 500 });
  }
}

// DELETE /api/events/rsvp - Cancel RSVP
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { eventId } = await request.json();
  if (!eventId) {
    return NextResponse.json({ error: 'Missing eventId' }, { status: 400 });
  }

  try {
    await prisma.eventRsvp.delete({
      where: {
        personId_eventId: {
          personId: session.user.id,
          eventId,
        },
      },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Failed to delete RSVP:', err);
    return NextResponse.json({ error: 'Failed to cancel RSVP' }, { status: 500 });
  }
}

// GET /api/events/rsvp?eventId=xxx - Check if current user has RSVPed
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ rsvped: false });
  }

  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get('eventId');
  if (!eventId) {
    return NextResponse.json({ error: 'Missing eventId' }, { status: 400 });
  }

  try {
    const rsvp = await prisma.eventRsvp.findUnique({
      where: {
        personId_eventId: {
          personId: session.user.id,
          eventId,
        },
      },
    });
    return NextResponse.json({ rsvped: !!rsvp, rsvp });
  } catch (err) {
    return NextResponse.json({ rsvped: false });
  }
}
