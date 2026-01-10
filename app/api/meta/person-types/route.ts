import { NextResponse } from "next/server";
import { PersonType } from "@prisma/client";

export async function GET() {
  const types = Object.values(PersonType);
  return NextResponse.json({ types });
}
