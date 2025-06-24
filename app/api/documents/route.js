import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'
import { prisma } from '../../../lib/prisma/client'

export const runtime = 'nodejs'

/**
 * GET /api/documents
 * Returns: { documents: [{ id, name, type }] }
 */
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    const documents = await prisma.document.findMany({
      where: { userId: session.user.id },
      select: { id: true, name: true, type: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ documents })
  } catch (error) {
    console.error('[List Documents Error]:', error)
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
  }
} 