import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(skills);
  } catch (error) {
    console.error("Error fetching skills:", error);
    return NextResponse.json(
      { error: "Failed to fetch skills" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // 1. Find or create the category
    let category = await prisma.category.findUnique({
      where: { name: body.category },
    });
    if (!category) {
      category = await prisma.category.create({
        data: { name: body.category },
      });
    }

    // 2. Create the skill
    const skill = await prisma.skill.create({
      data: {
        name: body.name,
        categories: {
          create: [{ categoryId: category.id }],
        },
      },
      include: {
        categories: {
          include: { category: true },
        },
      },
    });
    // 3. Return skill with category name for frontend compatibility
    const result = {
      id: skill.id,
      name: skill.name,
      category: skill.categories[0]?.category.name || body.category,
    };
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating skill:', error);
    return NextResponse.json({ error: 'Failed to create skill' }, { status: 500 });
  }
}
