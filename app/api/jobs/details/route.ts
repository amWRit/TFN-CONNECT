import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET job details for a list of job IDs (comma-separated)
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const idsParam = url.searchParams.get("ids");
  if (!idsParam) {
    return NextResponse.json([]);
  }
  const ids = idsParam.split(",");
  const jobs = await prisma.jobPosting.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      title: true,
      jobType: true,
    },
  });
  return NextResponse.json(jobs);
}
