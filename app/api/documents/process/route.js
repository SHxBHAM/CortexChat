import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '../../../../lib/prisma/client';
import PDFParser from 'pdf2json';
import { splitText } from '../../../../lib/langchain/text-splitter';
import { generateEmbedding } from '../../../../lib/gemini/index';
import fs from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';

function extractTextFromPDF(buffer) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();
    
    pdfParser.on('pdfParser_dataError', errData => {
      console.error('[PDF Parser Error]:', errData);
      reject(new Error(`PDF parsing failed: ${errData.parserError || 'Unknown error'}`));
    });
    
    pdfParser.on('pdfParser_dataReady', pdfData => {
      try {
        // Defensive check for Pages with better error handling
        const pages = pdfData.Pages || (pdfData.formImage && pdfData.formImage.Pages);
        
        if (!Array.isArray(pages) || pages.length === 0) {
          console.error('[pdf2json] Unexpected structure or empty pages:', {
            hasPages: !!pdfData.Pages,
            hasFormImage: !!pdfData.formImage,
            pagesCount: pages ? pages.length : 0
          });
          return reject(new Error('Could not extract pages from PDF or PDF is empty'));
        }

        const text = pages.map(page => {
          if (!page.Texts || !Array.isArray(page.Texts)) {
            console.warn('[PDF Parser] Page has no texts array');
            return '';
          }
          
          return page.Texts.map(textObj => {
            if (!textObj.R || !Array.isArray(textObj.R)) {
              return '';
            }
            
            return textObj.R.map(r => {
              try {
                return decodeURIComponent(r.T || '');
              } catch (decodeError) {
                console.warn('[PDF Parser] Failed to decode text:', r.T);
                return r.T || '';
              }
            }).join('');
          }).join(' ');
        }).join('\n');

        // Validate extracted text
        if (!text || text.trim().length === 0) {
          return reject(new Error('No text content extracted from PDF'));
        }

        resolve(text.trim());
      } catch (processingError) {
        console.error('[PDF Processing Error]:', processingError);
        reject(new Error(`Failed to process PDF data: ${processingError.message}`));
      }
    });

    // Set a timeout for PDF parsing
    const timeout = setTimeout(() => {
      reject(new Error('PDF parsing timed out after 30 seconds'));
    }, 30000);

    pdfParser.on('pdfParser_dataReady', () => clearTimeout(timeout));
    pdfParser.on('pdfParser_dataError', () => clearTimeout(timeout));

    try {
      pdfParser.parseBuffer(buffer);
    } catch (parseError) {
      clearTimeout(timeout);
      reject(new Error(`Failed to start PDF parsing: ${parseError.message}`));
    }
  });
}

// Helper function to convert embedding array to pgvector format
function formatEmbeddingForPgVector(embedding) {
  if (!Array.isArray(embedding) || embedding.length === 0) {
    return null;
  }
  
  // pgvector expects a string in the format "[1.0,2.0,3.0]"
  return `[${embedding.join(',')}]`;
}

export async function POST(req) {
  let documentId;
  // 60s fallback timeout for the whole process
  const processTimeout = setTimeout(() => {
    throw new Error('Document processing timed out after 60 seconds');
  }, 60000);

  try {
    const body = await req.json();
    documentId = body.documentId;
    if (!documentId) {
      clearTimeout(processTimeout);
      return NextResponse.json({ error: 'Missing documentId' }, { status: 400 });
    }
    const document = await prisma.document.findUnique({ 
      where: { id: documentId },
      select: { id: true, filePath: true, name: true }
    });
    if (!document) {
      clearTimeout(processTimeout);
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    if (!document.filePath) {
      clearTimeout(processTimeout);
      return NextResponse.json({ error: 'Document has no file path' }, { status: 400 });
    }
    const existingChunks = await prisma.chunk.count({ where: { documentId: document.id } });
    if (existingChunks > 0) {
      clearTimeout(processTimeout);
      return NextResponse.json({ 
        success: true, 
        chunks: existingChunks, 
        message: 'Document already processed' 
      });
    }
    const filePath = path.join(process.cwd(), document.filePath);
    try {
      await fs.access(filePath);
    } catch (accessError) {
      clearTimeout(processTimeout);
      return NextResponse.json({ error: 'Document file not found on disk' }, { status: 404 });
    }
    console.log(`[Info] Processing document: ${document.name || documentId}`);
    const buffer = await fs.readFile(filePath);
    if (buffer.length === 0) {
      clearTimeout(processTimeout);
      return NextResponse.json({ error: 'Document file is empty' }, { status: 400 });
    }
    console.log(`[Info] Extracting text from PDF (${buffer.length} bytes)`);
    const fullText = await extractTextFromPDF(buffer);
    if (fullText.length < 10) {
      console.warn(`[Warning] Very short text extracted: "${fullText}"`);
    }
    console.log(`[Info] Splitting text into chunks (${fullText.length} characters)`);
    const chunks = await splitText(fullText);
    if (chunks.length === 0) {
      clearTimeout(processTimeout);
      return NextResponse.json({ error: 'No chunks generated from document' }, { status: 400 });
    }
    console.log(`[Info] Generated ${chunks.length} chunks`);

    // --- Embedding Generation (outside transaction, in batches) ---
    const BATCH_SIZE = 5;
    const chunksData = [];
    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);
      console.log(`[Info] Generating embeddings for batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(chunks.length / BATCH_SIZE)}`);
      for (const [batchIndex, chunkText] of batch.entries()) {
        const chunkNumber = i + batchIndex + 1;
        try {
          console.log(`[Info] Generating embedding for chunk ${chunkNumber}/${chunks.length}`);
          const embedding = await generateEmbedding(chunkText);
          if (!embedding || !Array.isArray(embedding) || embedding.length === 0) {
            throw new Error('Invalid embedding generated');
          }
          chunksData.push({
            text: chunkText,
            embedding: formatEmbeddingForPgVector(embedding),
            documentId: document.id,
            success: true
          });
        } catch (embeddingError) {
          console.error(`[Error] Failed to generate embedding for chunk ${chunkNumber}:`, embeddingError);
          chunksData.push({
            text: chunkText,
            embedding: null,
            documentId: document.id,
            success: false,
            error: embeddingError.message
          });
        }
      }
      if (i + BATCH_SIZE < chunks.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // --- DB Insertion (in transaction, with 30s timeout) ---
    console.log(`[Info] Storing ${chunksData.length} chunks in database`);
    let result = [];
    let transactionError = null;
    try {
      result = await Promise.race([
        prisma.$transaction(async (tx) => {
          const createdChunks = [];
          for (let i = 0; i < chunksData.length; i += BATCH_SIZE) {
            const batch = chunksData.slice(i, i + BATCH_SIZE);
            for (const chunkData of batch) {
              try {
                const [createdChunk] = await tx.$queryRawUnsafe(
                  `INSERT INTO "Chunk" (id, text, embedding, "documentId", "createdAt") VALUES (gen_random_uuid(), $1, $2::vector, $3, NOW()) RETURNING id, text, "documentId", "createdAt"`,
                  chunkData.text,
                  chunkData.embedding,
                  chunkData.documentId
                );
                createdChunks.push(createdChunk);
              } catch (sqlError) {
                console.error('[Error] Failed to insert chunk (transaction):', sqlError);
              }
            }
          }
          return createdChunks;
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('DB transaction timed out after 30 seconds')), 30000))
      ]);
    } catch (err) {
      transactionError = err;
      console.error('[Error] Transaction failed, will fallback to individual inserts:', err);
    }

    // --- Fallback: Insert individually if transaction fails ---
    if (transactionError) {
      result = [];
      for (let i = 0; i < chunksData.length; i += BATCH_SIZE) {
        const batch = chunksData.slice(i, i + BATCH_SIZE);
        for (const chunkData of batch) {
          try {
            const [createdChunk] = await prisma.$queryRawUnsafe(
              `INSERT INTO "Chunk" (id, text, embedding, "documentId", "createdAt") VALUES (gen_random_uuid(), $1, $2::vector, $3, NOW()) RETURNING id, text, "documentId", "createdAt"`,
              chunkData.text,
              chunkData.embedding,
              chunkData.documentId
            );
            result.push(createdChunk);
          } catch (sqlError) {
            console.error('[Error] Failed to insert chunk (fallback):', sqlError);
          }
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    const successfulChunks = chunksData.filter(chunk => chunk.success).length;
    const failedChunks = chunksData.filter(chunk => !chunk.success).length;
    console.log(`[Success] Document processing completed: ${successfulChunks} chunks stored successfully${failedChunks > 0 ? `, ${failedChunks} without embeddings` : ''}`);
    clearTimeout(processTimeout);
    return NextResponse.json({ 
      success: true, 
      chunks: result.length,
      successfulChunks,
      failedChunks,
      textLength: fullText.length
    });
  } catch (error) {
    clearTimeout(processTimeout);
    console.error(`[Error] Document processing failed for document ${documentId}:`, error);
    let errorMessage = 'Failed to process document';
    let statusCode = 500;
    if (error.message.includes('PDF parsing')) {
      errorMessage = 'Failed to parse PDF file';
      statusCode = 422;
    } else if (error.message.includes('not found')) {
      errorMessage = 'Document or file not found';
      statusCode = 404;
    } else if (error.message.includes('No text content')) {
      errorMessage = 'PDF contains no readable text content';
      statusCode = 422;
    } else if (error.message.includes('empty')) {
      errorMessage = 'Document file is empty or corrupted';
      statusCode = 422;
    }
    return NextResponse.json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: statusCode });
  }
}