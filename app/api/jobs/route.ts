import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const jobPostings = await prisma.jobPosting.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        applications: {
          select: {
            id: true,
            personId: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(jobPostings);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error fetching jobs:", errorMessage);
    return NextResponse.json(
      { error: "Failed to fetch jobs", details: errorMessage },
      { status: 500 }
    );
  }
}
