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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Accept requiredSkills as array or string, always pass as string[]
    let requiredSkills: string[] = [];
    if (Array.isArray(body.requiredSkills)) {
      requiredSkills = body.requiredSkills;
    } else if (typeof body.requiredSkills === 'string') {
      try {
        requiredSkills = JSON.parse(body.requiredSkills);
      } catch {
        requiredSkills = [];
      }
    }
    const job = await prisma.jobPosting.create({
      data: {
        title: body.title,
        overview: body.overview || body.description?.slice(0, 140) || '',
        description: body.description,
        location: body.location,
        jobType: body.jobType,
        sector: body.sector,
        requiredSkills,
        status: body.status,
        createdById: body.createdById,
        deadline: body.deadline ? new Date(body.deadline) : undefined,
      },
    });
    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error creating job posting:", errorMessage);
    return NextResponse.json(
      { error: "Failed to create job posting", details: errorMessage },
      { status: 500 }
    );
  }
}
