import { NextResponse } from "next/server";

// Returns enums for JobType and JobStatus from Prisma schema
export async function GET() {
  // These must match the enums in prisma/schema.prisma
  const jobTypes = [
    { value: "FULL_TIME", label: "Full Time" },
    { value: "PART_TIME", label: "Part Time" },
    { value: "CONTRACT", label: "Contract" },
    { value: "INTERNSHIP", label: "Internship" },
    { value: "VOLUNTEER", label: "Volunteer" },
    { value: "FREELANCE", label: "Freelance" },
    { value: "TEMPORARY", label: "Temporary" },
    { value: "REMOTE", label: "Remote" },
    { value: "HYBRID", label: "Hybrid" },
  ];
  const jobStatuses = [
    { value: "OPEN", label: "Open" },
    { value: "FILLED", label: "Filled" },
    { value: "CLOSED", label: "Closed" },
    { value: "PAUSED", label: "Paused" },
    { value: "DRAFT", label: "Draft" },
  ];
  return NextResponse.json({ jobTypes, jobStatuses });
}
