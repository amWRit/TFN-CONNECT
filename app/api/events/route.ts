import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

// GET /api/events?mine=true&type=WORKSHOP&status=PUBLISHED
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const url = new URL(request.url);
  const mine = url.searchParams.get('mine') === 'true';
  const type = url.searchParams.get('type');
  const status = url.searchParams.get('status');

  const validStatuses = ['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED'];
  const validTypes = ['WORKSHOP', 'CONFERENCE', 'NETWORKING', 'TRAINING', 'REUNION', 'WEBINAR', 'HACKATHON', 'SOCIAL', 'FUNDRAISER', 'GENERAL', 'OTHER'];

  const where: any = {};
  if (mine && session?.user?.id) {
    where.createdById = session.user.id;
  }
  if (type && validTypes.includes(type)) {
    where.type = type;
  }
  if (status && validStatuses.includes(status)) {
    where.status = status;
  }

  const events = await prisma.event.findMany({
    where,
    orderBy: { startDateTime: 'desc' },
    include: {
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      _count: {
        select: {
          rsvps: true,
        },
      },
    },
  });

  // Map to add createdByName and rsvpCount for easier frontend consumption
  const mapped = events.map((e) => ({
    ...e,
    createdByName: e.createdBy ? `${e.createdBy.firstName} ${e.createdBy.lastName}` : null,
    rsvpCount: e._count?.rsvps ?? 0,
  }));

  return NextResponse.json(mapped);
}

// POST /api/events
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  if (!title || !slug || !startDateTime) {
    return NextResponse.json({ error: "Missing required fields (title, slug, startDateTime)" }, { status: 400 });
  }

  try {
    const event = await prisma.event.create({
      data: {
        title,
        slug,
        description,
        overview,
        location,
        address,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        imageUrl,
        tags: tags || [],
        externalLink,
        sponsors: sponsors || [],
        recurrenceRule,
        startDateTime: new Date(startDateTime),
        endDateTime: endDateTime ? new Date(endDateTime) : null,
        type: type || 'GENERAL',
        status: status || 'DRAFT',
        capacity: capacity ? parseInt(capacity, 10) : null,
        isFree: isFree ?? true,
        price: price ? parseFloat(price) : null,
        organizerName,
        organizerLink,
        createdById: session.user.id,
      },
    });

    // Auto-trigger notifications (subscription-only)
    try {
      const notifyRes = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/events/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: event.id }),
      });
      const notifyJson = await notifyRes.json();
      // Optionally log or attach notifyJson to response
    } catch (notifyErr) {
      console.error('Event notification failed:', notifyErr);
      // Do not block event creation on notification failure
    }
    return NextResponse.json(event, { status: 201 });
  } catch (err: any) {
    console.error("Failed to create event:", err);
    if (err.code === 'P2002') {
      return NextResponse.json({ error: "An event with this slug already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
