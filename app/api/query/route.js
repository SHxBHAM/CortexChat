import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'
import { prisma } from '../../../lib/prisma/client'
import { generateCompletion } from '../../../lib/gemini/index'
// import { callLLM } from '../../../lib/gemini' // Placeholder for LLM call

export const runtime = 'nodejs'

/**
 * POST /api/query
 * Body: { query: string, source?: string, userId?: string }
 * Returns: { answer: string, sources: string[] }
 */
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    const body = await req.json()
    const { query, source, userId } = body
    const effectiveUserId = userId || session?.user?.id
    if (!effectiveUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Missing query' }, { status: 400 })
    }

    // 1. Find relevant chunks using vector similarity (pgvector)
    // If source is specified, filter by document
    let chunks = []
    if (source && source.startsWith('file-')) {
      // Find document by ID for this user
      const fileId = source.replace('file-', '')
      const document = await prisma.document.findFirst({
        where: { id: fileId, userId: effectiveUserId },
        select: { id: true, name: true }
      })
      if (!document) {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 })
      }
      chunks = await prisma.$queryRawUnsafe(
        `SELECT id, text, "documentId" FROM "Chunk" WHERE "documentId" = $1 ORDER BY embedding <#> (SELECT embedding FROM "Chunk" WHERE "documentId" = $1 ORDER BY random() LIMIT 1) LIMIT 5`,
        document.id
      )
      // Add documentName for sources
      chunks = chunks.map(chunk => ({ ...chunk, documentName: document.name }))
    } else {
      // All user documents
      chunks = await prisma.$queryRawUnsafe(
        `SELECT c.id, c.text, c."documentId", d.name as documentName FROM "Chunk" c JOIN "Document" d ON c."documentId" = d.id WHERE d."userId" = $1 ORDER BY c.embedding <#> (SELECT embedding FROM "Chunk" ORDER BY random() LIMIT 1) LIMIT 5`,
        effectiveUserId
      )
    }
    if (!chunks || chunks.length === 0) {
      return NextResponse.json({ error: 'No relevant context found' }, { status: 404 })
    }
    // 2. Compose context for LLM
    const context = chunks.map(chunk => chunk.text).join('\n---\n')
    const sources = chunks.map(chunk => chunk.documentName || chunk.documentId)
    const prompt = `You are an AI assistant. Use the following context to answer the user's question.\n\nContext:\n${context}\n\nQuestion: ${query}\n\nAnswer as helpfully as possible, and cite sources if relevant.`

    // 3. Call the Gemini LLM
    const answer = await generateCompletion(prompt)

    return NextResponse.json({ answer, sources })
  } catch (error) {
    console.error('[RAG Query Error]:', error)
    return NextResponse.json({ error: 'Failed to process query' }, { status: 500 })
  }
} 