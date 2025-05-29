import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '../../../lib/prisma/client';
import { YoutubeTranscript } from 'youtube-transcript';
import { splitText } from '../../../lib/langchain/text-splitter';
import { generateEmbedding } from '../../../lib/gemini';

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
    }

    // 1. Fetch transcript
    const transcriptData = await YoutubeTranscript.fetchTranscript(url);
    const transcript = transcriptData.map(item => item.text).join(' ');
    
    // This is a rough way to get a title. A better method would be to use the YouTube Data API.
    const videoTitle = `YouTube Video: ${url.substring(url.indexOf('v=') + 2)}`;

    // 2. Create the Document record
    const document = await prisma.document.create({
      data: {
        name: videoTitle,
        type: 'YOUTUBE',
        url: url,
        userId: session.user.id,
      },
    });

    // 3. Chunk the text
    const chunks = await splitText(transcript);

    // 4. Embed each chunk and prepare for creation
    const chunkEmbeddings = await Promise.all(
        chunks.map(async (textChunk) => {
          const embedding = await generateEmbedding(textChunk);
          return {
            text: textChunk,
            embedding: embedding,
            documentId: document.id,
          };
        })
      );
  
    // 5. Save chunks to the database
    await prisma.$transaction(
        chunkEmbeddings.map((chunkData) => 
            prisma.chunk.create({
                data: {
                    text: chunkData.text,
                    documentId: chunkData.documentId,
                    embedding: chunkData.embedding,
                }
            })
        )
    );

    return NextResponse.json({ success: true, documentId: document.id });

  } catch (error) {
    console.error('Error processing YouTube URL:', error);
    return NextResponse.json({ error: 'Failed to process YouTube URL' }, { status: 500 });
  }
} 