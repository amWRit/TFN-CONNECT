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

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
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
    const updatedJob = await prisma.jobPosting.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        location: body.location,
        jobType: body.jobType,
        sector: body.sector,
        requiredSkills,
        status: body.status,
        deadline: body.deadline ? new Date(body.deadline) : null,
      },
    });
    return NextResponse.json(updatedJob);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error updating job posting:", errorMessage);
    return NextResponse.json(
      { error: "Failed to update job posting", details: errorMessage },
      { status: 500 }
    );
  }
}
