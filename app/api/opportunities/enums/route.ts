import { NextResponse } from "next/server";

// Returns enums for OpportunityType and OpportunityStatus from Prisma schema
export async function GET() {
  // These must match the enums in prisma/schema.prisma
  const opportunityTypes = [
    { value: "EDUCATION", label: "Education" },
    { value: "COLLABORATION", label: "Collaboration" },
    { value: "TRAINING", label: "Training" },
    { value: "NETWORKING", label: "Networking" },
    { value: "FUNDING", label: "Funding" },
    { value: "GRANTS", label: "Grants" },
    { value: "MENTORSHIP", label: "Mentorship" },
    { value: "VOLUNTEERING", label: "Volunteering" },
    { value: "INTERNSHIPS", label: "Internships" },
    { value: "FELLOWSHIPS", label: "Fellowships" },
    { value: "EVENTS", label: "Events" },
    { value: "JOBS", label: "Jobs" },
    { value: "COMPETITIONS", label: "Competitions" },
    { value: "ACCELERATORS", label: "Accelerators" },
  ];
  const opportunityStatuses = [
    { value: "OPEN", label: "Open" },
    { value: "CLOSED", label: "Closed" },
  ];
  return NextResponse.json({ opportunityTypes, opportunityStatuses });
}
