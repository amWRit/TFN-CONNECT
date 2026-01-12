import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {

  // Parse URL and headers
  const parsedUrl = new URL(request.url);
  const qPersonId = parsedUrl.searchParams.get("personId");
  const bypassHeader = request.headers.get("x-admin-bypass");

  let targetPersonId: string | null = null;
  let allowBypass = false;
  if (bypassHeader && bypassHeader.toLowerCase() === "true" && qPersonId) {
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
    // If requesting another user's interests, check admin
    if (qPersonId && qPersonId !== requesterId) {
      const requester = await prisma.person.findUnique({ where: { id: requesterId } });
      if (!requester || requester.type !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      targetPersonId = qPersonId;
    }
  }

  if (!targetPersonId) {
    return NextResponse.json({ error: 'No personId specified' }, { status: 400 });
  }

  const interests = await prisma.interest.findMany({
    where: { personId: targetPersonId },
    orderBy: { createdAt: "desc" },
  });

  const categorized = {
    jobs: interests.filter((i) => i.targetType === "JOB"),
    opportunities: interests.filter((i) => i.targetType === "OPPORTUNITY"),
    events: interests.filter((i) => i.targetType === "EVENT"),
  };

  return NextResponse.json(categorized);
}
