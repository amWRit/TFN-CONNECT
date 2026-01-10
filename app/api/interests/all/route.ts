import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requesterId = session.user.id;

  const parsedUrl = new URL(request.url);
  const qPersonId = parsedUrl.searchParams.get("personId");
  let targetPersonId = requesterId;

  if (qPersonId && qPersonId !== requesterId) {
    // requester wants interests for another user; allow if NextAuth admin OR bypass header
    let allowBypass = false;
    try {
      const bypassHeader = request.headers.get("x-admin-bypass");
      if (bypassHeader && bypassHeader.toLowerCase() === "true") {
        allowBypass = true;
      }
    } catch {}

    const requester = await prisma.person.findUnique({ where: { id: requesterId } });
    if (!allowBypass && (!requester || requester.type !== "ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    targetPersonId = qPersonId;
  }

  const interests = await prisma.interest.findMany({
    where: { personId: targetPersonId },
    orderBy: { createdAt: "desc" },
  });

  const categorized = {
    jobs: interests.filter((i) => i.targetType === "JOB"),
    opportunities: interests.filter((i) => i.targetType === "OPPORTUNITY"),
  };

  return NextResponse.json(categorized);
}
