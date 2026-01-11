import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

// GET /api/events/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profileImage: true,
        },
      },
      rsvps: {
        include: {
          person: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImage: true,
            },
          },
        },
      },
      _count: {
        select: {
          rsvps: true,
        },
      },
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  // Fetch interests for this event
  const interests = await prisma.interest.findMany({
    where: { targetType: "EVENT", targetId: id },
    include: {
      person: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profileImage: true,
        },
      },
    },
  });

  // Map person to user for frontend compatibility
  const mappedInterests = interests.map((i) => ({
    ...i,
    user: i.person,
  }));

  return NextResponse.json({
    ...event,
    createdByName: event.createdBy ? `${event.createdBy.firstName} ${event.createdBy.lastName}` : null,
    rsvpCount: event._count?.rsvps ?? 0,
    interests: mappedInterests,
  });
}

// PUT /api/events/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existingEvent = await prisma.event.findUnique({ where: { id } });

  if (!existingEvent) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  // Check if user is the creator or admin
  const isAdmin = (session as any).user?.type === 'ADMIN';
  if (existingEvent.createdById !== session.user.id && !isAdmin) {
    return NextResponse.json({ error: "Not authorized to edit this event" }, { status: 403 });
  }

  const body = await request.json();
  const {
    title,
    slug,
    description,
    overview,
    location,
    address,
    latitude,
    longitude,
    imageUrl,
    tags,
    externalLink,
    sponsors,
    recurrenceRule,
    startDateTime,
    endDateTime,
    type,
    status,
    capacity,
    isFree,
    price,
    organizerName,
    organizerLink,
  } = body;

  try {
    const updated = await prisma.event.update({
      where: { id },
      data: {
        title,
        slug,
        description,
        overview,
        location,
        address,
        latitude: latitude !== undefined ? (latitude ? parseFloat(latitude) : null) : undefined,
        longitude: longitude !== undefined ? (longitude ? parseFloat(longitude) : null) : undefined,
        imageUrl,
        tags: tags || undefined,
        externalLink,
        sponsors: sponsors || undefined,
        recurrenceRule,
        startDateTime: startDateTime ? new Date(startDateTime) : undefined,
        endDateTime: endDateTime ? new Date(endDateTime) : null,
        type,
        status,
        capacity: capacity !== undefined ? (capacity ? parseInt(capacity, 10) : null) : undefined,
        isFree,
        price: price !== undefined ? (price ? parseFloat(price) : null) : undefined,
        organizerName,
        organizerLink,
      },
    });
    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("Failed to update event:", err);
    if (err.code === 'P2002') {
      return NextResponse.json({ error: "An event with this slug already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

// DELETE /api/events/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existingEvent = await prisma.event.findUnique({ where: { id } });

  if (!existingEvent) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  // Check if user is the creator or admin
  const isAdmin = (session as any).user?.type === 'ADMIN';
  if (existingEvent.createdById !== session.user.id && !isAdmin) {
    return NextResponse.json({ error: "Not authorized to delete this event" }, { status: 403 });
  }

  try {
    await prisma.event.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to delete event:", err);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
