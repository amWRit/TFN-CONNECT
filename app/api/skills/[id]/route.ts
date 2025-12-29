import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// UPDATE skill
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = params.id;
    const body = await request.json();
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Invalid or missing skill id" }, { status: 400 });
    }
    // body.categories is an array of { value: categoryId, label: categoryName }
    const categoryIds = Array.isArray(body.categories) ? body.categories.map((cat: any) => cat.value) : [];
    // Remove all existing category relations and set new ones
    const updated = await prisma.skill.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        categories: {
          deleteMany: {},
          create: categoryIds.map((categoryId: string) => ({ categoryId })),
        },
      },
      include: {
        categories: { include: { category: true } },
      },
    });
    // Return all category names and description for frontend compatibility
    const result = {
      id: updated.id,
      name: updated.name,
      description: updated.description,
      categories: updated.categories.map(sc => sc.category.name),
    };
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating skill:", error);
    return NextResponse.json({ error: "Failed to update skill" }, { status: 500 });
  }
}

// DELETE skill
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = params.id;
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Invalid or missing skill id" }, { status: 400 });
    }
    await prisma.skill.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting skill:", error);
    return NextResponse.json({ error: "Failed to delete skill" }, { status: 500 });
  }
}
