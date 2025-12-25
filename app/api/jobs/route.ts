import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const jobs = await prisma.jobPosting.findMany({
      include: {
        school: true,
        createdBy: true,
        applications: {
          include: {
            person: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(jobs);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error fetching jobs:", errorMessage);
    return NextResponse.json(
      { error: "Failed to fetch jobs", details: errorMessage },
      { status: 500 }
    );
  }
}
