// POST /api/opportunities
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { title, description, types, location, status } = await request.json();
  if (!title || !description || !types || types.length === 0) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  try {
    const opportunity = await prisma.opportunity.create({
      data: {
        title,
        description,
        types,
        location,
        status,
        createdById: session.user.id,
      },
    });
    return NextResponse.json(opportunity, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create opportunity" }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

// GET /api/opportunities?mine=true&type=MENTORSHIP
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const url = new URL(request.url);
  const mine = url.searchParams.get('mine') === 'true';
  const type = url.searchParams.get('type');
  const status = url.searchParams.get('status');

  // Only allow valid JobStatus enum values (for compatibility with frontend filter)
  const validStatuses = ['OPEN', 'FILLED', 'CLOSED', 'PAUSED', 'DRAFT'];

  const where: any = {};
  if (mine && session?.user?.id) {
    where.createdById = session.user.id;
  }
  if (type) {
    where.types = { has: type };
  }
  if (status && validStatuses.includes(status)) {
    where.status = status;
  }

  const opportunities = await prisma.opportunity.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(opportunities);
}
