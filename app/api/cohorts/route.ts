import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const cohorts = await prisma.cohort.findMany({
      include: {
        fellowships: {
          include: {
            person: true,
          },
        },
      },
    });

    return NextResponse.json(cohorts);
  } catch (error) {
    console.error("Error fetching cohorts:", error);
    return NextResponse.json(
      { error: "Failed to fetch cohorts" },
      { status: 500 }
    );
  }
}
