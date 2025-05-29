import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '../../../lib/prisma/client';
import { splitText } from '../../../lib/langchain/text-splitter';
import { generateEmbedding } from '../../../lib/gemini';

export const runtime = 'nodejs';

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { text: pdfText, filename } = await req.json();

    if (!pdfText || !filename) {
      return NextResponse.json({ error: 'Missing text or filename' }, { status: 400 });
    }

    const document = await prisma.document.create({
      data: {
        name: filename,
        type: 'PDF',
        userId: session.user.id,
      },
    });

    const chunks = await splitText(pdfText);

    const chunkEmbeddings = await Promise.all(
      chunks.map(async (textChunk) => {
        const embedding = await generateEmbedding(textChunk);
        return {
          text: textChunk,
          embedding,
          documentId: document.id,
        };
      })
    );

    await prisma.$transaction(
      chunkEmbeddings.map((chunkData) =>
        prisma.chunk.create({
          data: {
            text: chunkData.text,
            embedding: chunkData.embedding,
            documentId: chunkData.documentId,
          },
        })
      )
    );

    return NextResponse.json({ success: true, documentId: document.id });
  } catch (error) {
    console.error('[Error] Upload handler failed:', error);
    return NextResponse.json({ error: 'Failed to process PDF text' }, { status: 500 });
  }
}
