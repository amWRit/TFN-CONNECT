import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { PostType } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

// Change function signature to unwrap params from Promise
export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const { params } = context;
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const { content, postType } = await req.json();
    if (!content || !postType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!Object.values(PostType).includes(postType)) {
      return NextResponse.json({ error: "Invalid post type" }, { status: 400 });
    }
    const post = await prisma.post.update({
      where: { id, personId: session.user.id },
      data: { content, postType },
    });
    return NextResponse.json(post, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const { params } = context;
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    await prisma.post.delete({
      where: { id, personId: session.user.id },
    });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
