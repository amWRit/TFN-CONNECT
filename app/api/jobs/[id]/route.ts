import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    console.log("Job detail API called with id:", id);
    const job = await prisma.jobPosting.findUnique({
      where: { id },
      include: {
        createdBy: true,
        applications: true,
      },
    });
    console.log("Job found:", job);
    if (!job) {
      return NextResponse.json({ error: "Not found", id }, { status: 404 });
    }
    return NextResponse.json(job);
  } catch (error) {
    console.error("Job detail API error:", error);
    return NextResponse.json({ error: "Failed to fetch job" }, { status: 500 });
  }
}
