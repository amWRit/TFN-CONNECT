import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";

// GET: Check if a job is already bookmarked by the current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ bookmarked: false });
    }
    const { searchParams } = new URL(request.url);
    const targetJobId = searchParams.get("targetJobId");
    if (!targetJobId) {
      return NextResponse.json({ bookmarked: false });
    }
    const bookmark = await prisma.bookmark.findUnique({
      where: {
        personId_type_targetId: {
          personId: session.user.id,
          type: "JOB_POSTING",
          targetId: targetJobId,
        },
      },
    });
    return NextResponse.json({ bookmarked: !!bookmark });
  } catch (error) {
    return NextResponse.json({ bookmarked: false });
  }
}

// POST: Add a bookmark for a job
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { targetJobId } = await request.json();
    if (!targetJobId) {
      return NextResponse.json({ error: "Missing targetJobId" }, { status: 400 });
    }
    // Create bookmark if not exists
    const bookmark = await prisma.bookmark.upsert({
      where: {
        personId_type_targetId: {
          personId: session.user.id,
          type: "JOB_POSTING",
          targetId: targetJobId,
        },
      },
      update: {},
      create: {
        personId: session.user.id,
        type: "JOB_POSTING",
        targetId: targetJobId,
      },
    });
    return NextResponse.json({ success: true, bookmark });
  } catch (error) {
    return NextResponse.json({ error: "Failed to bookmark job" }, { status: 500 });
  }
}

// DELETE: Remove a bookmark for a job
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { targetJobId } = await request.json();
    if (!targetJobId) {
      return NextResponse.json({ error: "Missing targetJobId" }, { status: 400 });
    }
    try {
      await prisma.bookmark.delete({
        where: {
          personId_type_targetId: {
            personId: session.user.id,
            type: "JOB_POSTING",
            targetId: targetJobId,
          },
        },
      });
    } catch (err: any) {
      // If record not found, treat as success (idempotent delete)
      if (err && typeof err === 'object' && 'code' in err && err.code === 'P2025') {
        return NextResponse.json({ success: true });
      }
      throw err;
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to remove bookmark" }, { status: 500 });
  }
}
