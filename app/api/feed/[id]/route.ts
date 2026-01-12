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
    const isSessionAdmin = (session?.user as any)?.type === 'ADMIN';
    const isLocalAdmin = req.headers.get('x-admin-auth') === 'true';
    if (!session && !isLocalAdmin) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const { content, postType } = await req.json();
    if (!content || !postType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!Object.values(PostType).includes(postType)) {
      return NextResponse.json({ error: "Invalid post type" }, { status: 400 });
    }
    let post;
    if (isSessionAdmin || isLocalAdmin) {
      // Admins can update any post
      post = await prisma.post.update({
        where: { id },
        data: { content, postType },
      });
    } else {
      // Normal users can only update their own post
      post = await prisma.post.update({
        where: { id, personId: session.user.id },
        data: { content, postType },
      });
    }
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
    const isSessionAdmin = (session?.user as any)?.type === 'ADMIN';
    const isLocalAdmin = req.headers.get('x-admin-auth') === 'true';
    if (!session && !isLocalAdmin) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    if (isSessionAdmin || isLocalAdmin) {
      // Admins can delete any post
      await prisma.post.delete({ where: { id } });
    } else {
      // Normal users can only delete their own post
      await prisma.post.delete({ where: { id, personId: session.user.id } });
    }
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
