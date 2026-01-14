
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { Buffer } from 'buffer';

export async function POST(req: NextRequest) {
  // Parse multipart form data
  const formData = await req.formData();
  const file = formData.get('file');
  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  // Get file extension
  const originalName = (file as File).name || 'upload.jpg';
  const ext = path.extname(originalName) || '.jpg';
  const id = uuidv4();
  const fileName = `${id}${ext}`;
  const tempDir = path.join(process.cwd(), 'public', 'email', 'temp');
  const filePath = path.join(tempDir, fileName);

  // Ensure directory exists
  fs.mkdirSync(tempDir, { recursive: true });

  // Save file
  const arrayBuffer = await (file as File).arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  fs.writeFileSync(filePath, new Uint8Array(buffer));

  // Return public URL
  const url = `/email/temp/${fileName}`;
  return NextResponse.json({ url });
}
