// GET: Check if a person is already bookmarked by the current user
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ bookmarked: false });
    }
    const { searchParams } = new URL(request.url);
    const targetPersonId = searchParams.get("targetPersonId");
    if (!targetPersonId) {
      return NextResponse.json({ bookmarked: false });
    }
    const bookmark = await prisma.bookmark.findUnique({
      where: {
        personId_type_targetId: {
          personId: session.user.id,
          type: "PERSON",
          targetId: targetPersonId,
        },
      },
    });
    return NextResponse.json({ bookmarked: !!bookmark });
  } catch (error) {
    return NextResponse.json({ bookmarked: false });
  }
}

// POST: Add a bookmark for a person
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { targetPersonId } = await request.json();
    if (!targetPersonId) {
      return NextResponse.json({ error: "Missing targetPersonId" }, { status: 400 });
    }
    // Prevent self-bookmarking
    if (session.user.id === targetPersonId) {
      return NextResponse.json({ error: "Cannot bookmark yourself" }, { status: 400 });
    }
    // Create bookmark if not exists
    const bookmark = await prisma.bookmark.upsert({
      where: {
        personId_type_targetId: {
          personId: session.user.id,
          type: "PERSON",
          targetId: targetPersonId,
        },
      },
      update: {},
      create: {
        personId: session.user.id,
        type: "PERSON",
        targetId: targetPersonId,
      },
    });
    return NextResponse.json({ success: true, bookmark });
  } catch (error) {
    console.error("[BOOKMARK POST ERROR]", error);
    return NextResponse.json({ error: "Failed to bookmark", details: String(error) }, { status: 500 });
  }
}

// DELETE: Remove a bookmark for a person
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { targetPersonId } = await request.json();
    if (!targetPersonId) {
      return NextResponse.json({ error: "Missing targetPersonId" }, { status: 400 });
    }
    try {
      await prisma.bookmark.delete({
        where: {
          personId_type_targetId: {
            personId: session.user.id,
            type: "PERSON",
            targetId: targetPersonId,
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
    console.error("[BOOKMARK DELETE ERROR]", error);
    return NextResponse.json({ error: "Failed to remove bookmark", details: String(error) }, { status: 500 });
  }
}
