import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '../../../lib/prisma/client';

export const runtime = 'nodejs';

// This endpoint is currently disabled. PDF upload is not supported for now.
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const userId = session.user.id;
    const originalFilename = file.name;
    const uniqueFilename = `${randomUUID()}.pdf`;

    // Create a user-specific directory
    const userUploadDir = path.join(process.cwd(), 'uploads', `user_${userId}`);
    await mkdir(userUploadDir, { recursive: true });

    // Define the full file path for the uniquely named file
    const filePath = path.join(userUploadDir, uniqueFilename);
    const relativeFilePath = path.join('uploads', `user_${userId}`, uniqueFilename);

    // Save the file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(filePath, buffer);

    // Create a document record in the database
    const document = await prisma.document.create({
      data: {
        name: originalFilename,
        type: 'PDF',
        filePath: relativeFilePath,
        userId: userId,
      },
    });

    return NextResponse.json({ success: true, documentId: document.id });

  } catch (error) {
    console.error('[Error] Upload handler failed:', error);
    return NextResponse.json({ error: 'Failed to process file' }, { status: 500 });
  }
}
