import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";
import { unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// GET current user's profile
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find or create person by email
    let person = await prisma.person.findUnique({
      where: { email1: session.user.email },
      include: {
        educations: {
          orderBy: { start: "desc" },
        },
        experiences: {
          orderBy: { start: "desc" },
          include: {
            experienceSkills: {
              include: {
                skill: true,
              },
            },
          },
        },
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
      },
    });

    // If person doesn't exist, create one with basic info from session
    if (!person) {
      const nameParts = (session.user.name || "").split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      person = await prisma.person.create({
        data: {
          firstName,
          lastName,
          email1: session.user.email,
          profileImage: session.user.image || null,
        },
        include: {
          educations: {
            orderBy: { start: "desc" },
          },
          experiences: {
            orderBy: { start: "desc" },
            include: {
              experienceSkills: {
                include: {
                  skill: true,
                },
              },
            },
          },
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
        },
      });
    }

    return NextResponse.json(person);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// UPDATE current user's profile
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Find person by email
    const existingPerson = await prisma.person.findUnique({
      where: { email1: session.user.email },
    });

    if (!existingPerson) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // If profileImage is being set to null, delete the old file
    if (body.profileImage === null && existingPerson.profileImage) {
      try {
        // Extract filename from the profileImage URL
        const imagePath = existingPerson.profileImage;
        if (imagePath.startsWith("/profileimages/")) {
          const filename = imagePath.replace("/profileimages/", "");
          const filepath = join(process.cwd(), "public", "profileimages", filename);
          
          // Delete the file if it exists
          if (existsSync(filepath)) {
            await unlink(filepath);
          }
        }
      } catch (error) {
        // Log error but don't fail the request if file deletion fails
        console.error("Error deleting old profile image file:", error);
      }
    }

    // Update person
    const updatedPerson = await prisma.person.update({
      where: { id: existingPerson.id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        phone1: body.phone1,
        phone2: body.phone2,
        email2: body.email2,
        linkedin: body.linkedin,
        bio: body.bio,
        dob: body.dob ? new Date(body.dob) : null,
        eduStatus: body.eduStatus,
        empStatus: body.empStatus,
        profileImage: body.profileImage !== undefined ? (body.profileImage || null) : undefined,
      },
      include: {
        educations: {
          orderBy: { start: "desc" },
        },
        experiences: {
          orderBy: { start: "desc" },
        },
      },
    });

    return NextResponse.json(updatedPerson);
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

