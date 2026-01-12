export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = await prisma.person.update({
      where: { id },
      data: {
        firstName: body.firstName,
        middleName: body.middleName || null,
        lastName: body.lastName,
        email1: body.email1,
        email2: body.email2 || null,
        dob: body.dob || null,
        phone1: body.phone1 || null,
        phone2: body.phone2 || null,
        linkedin: body.linkedin || null,
        profileImage: body.profileImage || null,
        bio: body.bio || null,
        pronouns: body.pronouns || null,
        type: body.type || null,
        eduStatus: body.eduStatus || null,
        empStatus: body.empStatus || null,
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating person:', error);
    return NextResponse.json({ error: 'Failed to update person' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.person.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting person:', error);
    if (error.code === 'P2003') {
      return NextResponse.json({
        error: 'Cannot delete: This person is still referenced by other records (e.g., fellowships, experiences, or placements). Please remove or reassign those records first.'
      }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to delete person' }, { status: 500 });
  }
}
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
            placement: {
              include: {
                school: true,
              },
            },
          },
        },
        managedPlacements: {
          include: {
            school: true,
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
