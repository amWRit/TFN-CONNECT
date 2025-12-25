import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const person = await prisma.person.findUnique({
      where: { id },
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
        posts: {
          include: {
            comments: true,
          },
        },
      },
    });

    if (!person) {
      return NextResponse.json({ error: "Person not found" }, { status: 404 });
    }

    return NextResponse.json(person);
  } catch (error) {
    console.error("Error fetching person:", error);
    return NextResponse.json(
      { error: "Failed to fetch person" },
      { status: 500 }
    );
  }
}
