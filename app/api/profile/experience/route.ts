import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";

// GET all experiences for current user
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

    const experiences = await prisma.experience.findMany({
      where: { personId: person.id },
      orderBy: { start: "desc" },
      include: {
        experienceSkills: {
          include: {
            skill: true,
          },
        },
      },
    });

    return NextResponse.json(experiences);
  } catch (error) {
    console.error("Error fetching experiences:", error);
    return NextResponse.json(
      { error: "Failed to fetch experiences" },
      { status: 500 }
    );
  }
}

// CREATE new experience
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
    if (!body.start || !body.orgName || !body.title || !body.sector || !body.type) {
      return NextResponse.json(
        { error: "Missing required fields: start, orgName, title, sector, type" },
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

    const experience = await prisma.experience.create({
      data: {
        personId: person.id,
        orgName: body.orgName,
        title: body.title,
        sector: body.sector,
        type: body.type,
        description: body.description || null,
        start: startDate,
        end: endDate,
      },
    });

    return NextResponse.json(experience, { status: 201 });
  } catch (error) {
    console.error("Error creating experience:", error);
    return NextResponse.json(
      { error: "Failed to create experience" },
      { status: 500 }
    );
  }
}

