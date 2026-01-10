import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";

// GET all educations for current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const person = await prisma.person.findUnique({
      where: { email1: session.user.email },
    });

    if (!person) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const educations = await prisma.education.findMany({
      where: { personId: person.id },
      orderBy: { start: "desc" },
    });

    return NextResponse.json(educations);
  } catch (error) {
    console.error("Error fetching educations:", error);
    return NextResponse.json(
      { error: "Failed to fetch educations" },
      { status: 500 }
    );
  }
}

// CREATE new education
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const person = await prisma.person.findUnique({
      where: { email1: session.user.email },
    });

    if (!person) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.start || !body.institution || !body.level || !body.name) {
      return NextResponse.json(
        { error: "Missing required fields: start, institution, level, name" },
        { status: 400 }
      );
    }

    // Validate and parse dates
    const startDate = new Date(body.start);
    if (isNaN(startDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid start date" },
        { status: 400 }
      );
    }

    let endDate = null;
    if (body.end) {
      endDate = new Date(body.end);
      if (isNaN(endDate.getTime())) {
        return NextResponse.json(
          { error: "Invalid end date" },
          { status: 400 }
        );
      }
    }

    const education = await prisma.education.create({
      data: {
        personId: person.id,
        institution: body.institution,
        university: body.university || null,
        level: body.level,
        name: body.name,
        // type: body.type || "DEGREE", // Removed because 'type' is not a valid property
        sector: body.sector || null,
        start: startDate,
        end: endDate,
      },
    });

    return NextResponse.json(education, { status: 201 });
  } catch (error) {
    console.error("Error creating education:", error);
    return NextResponse.json(
      { error: "Failed to create education" },
      { status: 500 }
    );
  }
}

