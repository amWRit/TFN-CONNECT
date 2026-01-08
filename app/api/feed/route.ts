import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { PostType } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export async function GET(req: Request) {
  try {
    const posts = await prisma.post.findMany({
      include: {
        person: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            bio: true,
            profileImage: true,
          },
        },
        comments: {
          include: {
            person: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(posts);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error fetching posts:", errorMessage);
    return NextResponse.json(
      { error: "Failed to fetch posts", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const { content, postType, imageUrl } = await req.json();
    if (!content || !postType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!Object.values(PostType).includes(postType)) {
      return NextResponse.json({ error: "Invalid post type" }, { status: 400 });
    }
    const personId = session.user.id;
    const post = await prisma.post.create({
      data: {
        content,
        postType,
        imageUrl: imageUrl || null,
        personId,
      },
    });
    return NextResponse.json(post, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
