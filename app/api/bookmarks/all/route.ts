import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // eslint-disable-next-line no-console
  console.log(`[BOOKMARKS API] Called with URL: ${request.url}`);
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requesterId = session.user.id;

  // Determine target person id: default to requester, allow override via ?personId=<id>
  const parsedUrl = new URL(request.url);
  const qPersonId = parsedUrl.searchParams.get('personId');
  let targetPersonId = requesterId;

  if (qPersonId && qPersonId !== requesterId) {
    // requester wants bookmarks for another user; allow if NextAuth admin OR bypass header
    let allowBypass = false;
    try {
      const bypassHeader = request.headers.get('x-admin-bypass');
      if (bypassHeader && bypassHeader.toLowerCase() === 'true') {
        allowBypass = true;
      }
    } catch {}
    const requester = await prisma.person.findUnique({ where: { id: requesterId } });
    if (!allowBypass && (!requester || requester.type !== 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    targetPersonId = qPersonId;
  }

  // Fetch all bookmarks for targetPersonId
  const bookmarks = await prisma.bookmark.findMany({
    where: { personId: targetPersonId },
    orderBy: { createdAt: "desc" },
  });

  // Debug log for admin requests
  if (qPersonId && qPersonId !== requesterId) {
    // eslint-disable-next-line no-console
    console.log(`[BOOKMARKS API] Admin ${requesterId} requested bookmarks for ${targetPersonId}. Found: ${bookmarks.length}`);
  }

  const categorized = {
    people: bookmarks.filter(b => b.type === "PERSON"),
    jobs: bookmarks.filter(b => b.type === "JOB_POSTING"),
    opportunities: bookmarks.filter(b => b.type === "OPPORTUNITY"),
    posts: bookmarks.filter(b => b.type === "POST"),
    jobApplications: bookmarks.filter(b => b.type === "JOB_APPLICATION"),
  };

  return NextResponse.json(categorized);
}
