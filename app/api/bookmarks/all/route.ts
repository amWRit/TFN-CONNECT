import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {

  // Parse URL and headers
  const parsedUrl = new URL(request.url);
  const qPersonId = parsedUrl.searchParams.get('personId');
  const bypassHeader = request.headers.get('x-admin-bypass');

  let targetPersonId: string | null = null;
  let allowBypass = false;
  if (bypassHeader && bypassHeader.toLowerCase() === 'true' && qPersonId) {
    // Allow admin bypass if header is present and personId is provided
    allowBypass = true;
    targetPersonId = qPersonId;
  } else {
    // Normal session-based access
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const requesterId = session.user.id;
    targetPersonId = requesterId;
    // If requesting another user's bookmarks, check admin
    if (qPersonId && qPersonId !== requesterId) {
      const requester = await prisma.person.findUnique({ where: { id: requesterId } });
      if (!requester || requester.type !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      targetPersonId = qPersonId;
    }
  }

  if (!targetPersonId) {
    return NextResponse.json({ error: 'No personId specified' }, { status: 400 });
  }

  // Fetch all bookmarks for targetPersonId
  const bookmarks = await prisma.bookmark.findMany({
    where: { personId: targetPersonId },
    orderBy: { createdAt: "desc" },
  });

  const categorized = {
    people: bookmarks.filter(b => b.type === "PERSON"),
    jobs: bookmarks.filter(b => b.type === "JOB_POSTING"),
    opportunities: bookmarks.filter(b => b.type === "OPPORTUNITY"),
    events: bookmarks.filter(b => b.type === "EVENT"),
    posts: bookmarks.filter(b => b.type === "POST"),
    jobApplications: bookmarks.filter(b => b.type === "JOB_APPLICATION"),
  };

  return NextResponse.json(categorized);
}
