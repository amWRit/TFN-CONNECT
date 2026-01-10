import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";

// UPDATE education
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const person = await prisma.person.findUnique({
      where: { email1: session.user.email },
    });

    if (!person) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Verify education belongs to user
    const education = await prisma.education.findUnique({
      where: { id },
    });

    if (!education || education.personId !== person.id) {
      return NextResponse.json({ error: "Education not found" }, { status: 404 });
    }

    const body = await request.json();

    // Build update data object
    const updateData: any = {};
    
    if (body.institution !== undefined) updateData.institution = body.institution;
    if (body.university !== undefined) updateData.university = body.university;
    if (body.level !== undefined) updateData.level = body.level;
    if (body.name !== undefined) updateData.name = body.name;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.sector !== undefined) updateData.sector = body.sector;
    
    // Validate and parse start date
    if (body.start !== undefined) {
      if (!body.start) {
        return NextResponse.json(
          { error: "Start date is required" },
          { status: 400 }
        );
      }
      const startDate = new Date(body.start);
      if (isNaN(startDate.getTime())) {
        return NextResponse.json(
          { error: "Invalid start date" },
          { status: 400 }
        );
      }
      updateData.start = startDate;
    }
    
    // Validate and parse end date
    if (body.end !== undefined) {
      if (body.end === "" || body.end === null) {
        updateData.end = null;
      } else {
        const endDate = new Date(body.end);
        if (isNaN(endDate.getTime())) {
          return NextResponse.json(
            { error: "Invalid end date" },
            { status: 400 }
          );
        }
        updateData.end = endDate;
      }
    }

    const updatedEducation = await prisma.education.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedEducation);
  } catch (error) {
    console.error("Error updating education:", error);
    return NextResponse.json(
      { error: "Failed to update education" },
      { status: 500 }
    );
  }
}

// DELETE education
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const person = await prisma.person.findUnique({
      where: { email1: session.user.email },
    });

    if (!person) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Verify education belongs to user
    const education = await prisma.education.findUnique({
      where: { id },
    });

    if (!education || education.personId !== person.id) {
      return NextResponse.json({ error: "Education not found" }, { status: 404 });
    }

    await prisma.education.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting education:", error);
    return NextResponse.json(
      { error: "Failed to delete education" },
      { status: 500 }
    );
  }
}

