import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: { name: "asc" },
      include: { categories: { include: { category: true } } }, // categories is SkillCategory[]
    });
    const result = skills.map(skill => ({
      id: skill.id,
      name: skill.name,
      description: skill.description,
      categories: skill.categories.map((sc: any) => sc.category.name),
    }));
    return NextResponse.json(result);
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
    // body.categories is an array of { value: categoryId, label: categoryName }
    const categoryIds = Array.isArray(body.categories) ? body.categories.map((cat: any) => cat.value) : [];

    // 1. Create the skill
    const skill = await prisma.skill.create({
      data: {
        name: body.name,
        description: body.description,
        categories: {
          create: categoryIds.map((categoryId: string) => ({ categoryId })),
        },
      },
      include: {
        categories: { include: { category: true } },
      },
    });
    // 2. Return skill with all category names and description for frontend compatibility
    const result = {
      id: skill.id,
      name: skill.name,
      description: skill.description,
      categories: skill.categories.map((sc: any) => sc.category.name),
    };
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating skill:', error);
    return NextResponse.json({ error: 'Failed to create skill' }, { status: 500 });
  }
}
