import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";
import sharp from "sharp";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

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

    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Image must be less than 5MB" }, { status: 400 });
    }

    // Create profileimages directory if it doesn't exist
    const uploadDir = join(process.cwd(), "public", "profileimages");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Resize and optimize image (max 400x400, maintain aspect ratio)
    const resizedBuffer = await sharp(buffer)
      .resize(400, 400, {
        fit: "cover",
        position: "center",
      })
      .jpeg({ quality: 85 })
      .toBuffer();

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${person.id}-${timestamp}.jpg`;
    const filepath = join(uploadDir, filename);

    // Save file
    await writeFile(filepath, resizedBuffer);

    // Update person's profileImage
    const imageUrl = `/profileimages/${filename}`;
    await prisma.person.update({
      where: { id: person.id },
      data: { profileImage: imageUrl },
    });

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}


