import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(req: Request, context: { params: { id: string } }) {
  try {
    const { id } = await context.params;
    const { name, description } = await req.json();
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Subject name is required' }, { status: 400 });
    }
    // Check uniqueness
    const exists = await prisma.subject.findFirst({ where: { name: { equals: name.trim(), mode: 'insensitive' }, NOT: { id } } });
    if (exists) {
      return NextResponse.json({ error: 'Subject name must be unique' }, { status: 400 });
    }
    const updated = await prisma.subject.update({ where: { id }, data: { name: name.trim(), description } });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update subject' }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: { id: string } }) {
  try {
    const { id } = await context.params;
    await prisma.subject.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete subject' }, { status: 500 });
  }
}
