import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET: Check if event is bookmarked by current user
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const targetEventId = searchParams.get("targetEventId");
  if (!targetEventId) {
    return NextResponse.json({ error: "Missing targetEventId" }, { status: 400 });
  }
  const bookmark = await prisma.bookmark.findUnique({
    where: {
      personId_type_targetId: {
        personId: session.user.id,
        type: "EVENT",
        targetId: targetEventId,
      },
    },
  });
  return NextResponse.json({ bookmarked: !!bookmark });
}

// POST: Add bookmark for event
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const targetEventId = body.targetEventId;
  if (!targetEventId) {
    return NextResponse.json({ error: "Missing targetEventId" }, { status: 400 });
  }
  await prisma.bookmark.upsert({
    where: {
      personId_type_targetId: {
        personId: session.user.id,
        type: "EVENT",
        targetId: targetEventId,
      },
    },
    update: {},
    create: {
      personId: session.user.id,
      type: "EVENT",
      targetId: targetEventId,
    },
  });
  return NextResponse.json({ success: true });
}

// DELETE: Remove bookmark for event
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const targetEventId = body.targetEventId;
  if (!targetEventId) {
    return NextResponse.json({ error: "Missing targetEventId" }, { status: 400 });
  }
  await prisma.bookmark.deleteMany({
    where: {
      personId: session.user.id,
      type: "EVENT",
      targetId: targetEventId,
    },
  });
  return NextResponse.json({ success: true });
}
