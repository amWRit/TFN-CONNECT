import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";

// UPDATE experience
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

    // Verify experience belongs to user
    const experience = await prisma.experience.findUnique({
      where: { id },
    });

    if (!experience || experience.personId !== person.id) {
      return NextResponse.json({ error: "Experience not found" }, { status: 404 });
    }

    const body = await request.json();

    // Build update data object
    const updateData: any = {};
    
    if (body.orgName !== undefined) updateData.orgName = body.orgName;
    if (body.title !== undefined) updateData.title = body.title;
    if (body.sector !== undefined) updateData.sector = body.sector;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.description !== undefined) updateData.description = body.description;
    
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

    const updatedExperience = await prisma.experience.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedExperience);
  } catch (error) {
    console.error("Error updating experience:", error);
    return NextResponse.json(
      { error: "Failed to update experience" },
      { status: 500 }
    );
  }
}

// DELETE experience
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

    // Verify experience belongs to user
    const experience = await prisma.experience.findUnique({
      where: { id },
    });

    if (!experience || experience.personId !== person.id) {
      return NextResponse.json({ error: "Experience not found" }, { status: 404 });
    }

    await prisma.experience.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting experience:", error);
    return NextResponse.json(
      { error: "Failed to delete experience" },
      { status: 500 }
    );
  }
}

