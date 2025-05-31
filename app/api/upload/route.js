import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '../../../lib/prisma/client';

export const runtime = 'nodejs';

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

    // Validate file type and size
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
    }
    if (file.size > 30 * 1024 * 1024) { // 10 MB
      return NextResponse.json({ error: 'File size must be less than 10 MB' }, { status: 400 });
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

    // Internally call the processing endpoint
    try {
      const processRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/documents/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': req.headers.get('cookie') || '', // pass session cookie for auth
        },
        body: JSON.stringify({ documentId: document.id }),
      });
      const processData = await processRes.json();
      if (!processRes.ok) {
        console.error('[Error] Document processing failed:', processData.error);
      }
    } catch (err) {
      console.error('[Error] Failed to call internal processing endpoint:', err);
    }

    return NextResponse.json({ success: true, documentId: document.id });

  } catch (error) {
    console.error('[Error] Upload handler failed:', error);
    return NextResponse.json({ error: 'Failed to process file' }, { status: 500 });
  }
}
