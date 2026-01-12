import { NextResponse } from "next/server";

// Returns enums for EventType and EventStatus from Prisma schema
export async function GET() {
  // These must match the enums in prisma/schema.prisma
  const eventTypes = [
    { value: "WORKSHOP", label: "Workshop" },
    { value: "CONFERENCE", label: "Conference" },
    { value: "NETWORKING", label: "Networking" },
    { value: "TRAINING", label: "Training" },
    { value: "REUNION", label: "Reunion" },
    { value: "WEBINAR", label: "Webinar" },
    { value: "HACKATHON", label: "Hackathon" },
    { value: "SOCIAL", label: "Social" },
    { value: "FUNDRAISER", label: "Fundraiser" },
    { value: "GENERAL", label: "General" },
    { value: "OTHER", label: "Other" },
  ];
  const eventStatuses = [
    { value: "DRAFT", label: "Draft" },
    { value: "PUBLISHED", label: "Published" },
    { value: "CANCELLED", label: "Cancelled" },
    { value: "COMPLETED", label: "Completed" },
  ];
  return NextResponse.json({ eventTypes, eventStatuses });
}
