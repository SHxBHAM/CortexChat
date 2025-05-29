import { NextResponse } from 'next/server';

// This endpoint is currently disabled. YouTube upload is not supported for now.
export async function POST(req) {
  return NextResponse.json({ error: 'YouTube upload is currently disabled.' }, { status: 404 });
} 