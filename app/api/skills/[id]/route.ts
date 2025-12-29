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
    const updated = await prisma.skill.update({
      where: { id },
      data: {
        name: body.name,
        // Optionally update categories if provided
      },
    });
    return NextResponse.json(updated);
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
