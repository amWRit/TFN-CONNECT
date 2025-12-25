import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
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
