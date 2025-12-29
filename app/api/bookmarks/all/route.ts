import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const personId = session.user.id;

  // Fetch all bookmarks for this user
  const bookmarks = await prisma.bookmark.findMany({
    where: { personId },
    orderBy: { createdAt: "desc" },
  });

  // Categorize bookmarks by type
  const categorized = {
    people: bookmarks.filter(b => b.type === "PERSON"),
    jobs: bookmarks.filter(b => b.type === "JOB_POSTING"),
    posts: bookmarks.filter(b => b.type === "POST"),
    jobApplications: bookmarks.filter(b => b.type === "JOB_APPLICATION"),
  };

  return NextResponse.json(categorized);
}
