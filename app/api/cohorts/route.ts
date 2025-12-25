import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const cohorts = await prisma.cohort.findMany({
      orderBy: { name: 'asc' },
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const cohort = await prisma.cohort.create({
      data: {
        name: body.name,
        description: body.description,
        start: body.start,
        end: body.end,
      },
    });
    return NextResponse.json(cohort, { status: 201 });
  } catch (error) {
    console.error('Error creating cohort:', error);
    return NextResponse.json({ error: 'Failed to create cohort' }, { status: 500 });
  }
}
