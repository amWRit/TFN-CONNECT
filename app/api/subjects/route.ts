import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({ orderBy: { createdAt: 'asc' } });
    return NextResponse.json(subjects);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Subject name is required' }, { status: 400 });
    }
    // Check uniqueness
    const exists = await prisma.subject.findFirst({ where: { name: { equals: name.trim(), mode: 'insensitive' } } });
    if (exists) {
      return NextResponse.json({ error: 'Subject name must be unique' }, { status: 400 });
    }
    const subject = await prisma.subject.create({ data: { name: name.trim() } });
    return NextResponse.json(subject);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create subject' }, { status: 500 });
  }
}
