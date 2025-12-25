import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const people = await prisma.person.findMany({
      include: {
        experiences: {
          include: {
            experienceSkills: {
              include: {
                skill: true,
              },
            },
          },
        },
        educations: true,
        fellowships: {
          include: {
            cohort: true,
          },
        },
        placements: {
          include: {
            school: true,
          },
        },
      },
    });

    return NextResponse.json(people);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error fetching people:", errorMessage);
    return NextResponse.json(
      { error: "Failed to fetch people", details: errorMessage },
      { status: 500 }
    );
  }
}
