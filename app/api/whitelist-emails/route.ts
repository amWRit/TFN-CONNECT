import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const emails = await prisma.whitelistEmail.findMany();
  return Response.json(emails);
}

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return Response.json({ error: "Email required" }, { status: 400 });
  const created = await prisma.whitelistEmail.create({ data: { email } });
  return Response.json(created);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  if (!email) return Response.json({ error: "Email required" }, { status: 400 });
  await prisma.whitelistEmail.delete({ where: { email } });
  return Response.json({ success: true });
}
