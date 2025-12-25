import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');

    const people = await prisma.person.findMany({
      where: type ? { type: type as any } : undefined,
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
        managedPlacements: true,
      },
      orderBy: { createdAt: 'desc' },
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const person = await prisma.person.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email1: body.email1,
        email2: body.email2,
        dob: body.dob,
        phone1: body.phone1,
        phone2: body.phone2,
        linkedin: body.linkedin,
        profileImage: body.profileImage,
        bio: body.bio,
        type: body.type,
        eduStatus: body.eduStatus || 'COMPLETED',
        empStatus: body.empStatus || 'SEEKING',
      },
    });
    return NextResponse.json(person, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error creating person:', errorMessage);
    return NextResponse.json({ error: 'Failed to create person', details: errorMessage }, { status: 500 });
  }
}
