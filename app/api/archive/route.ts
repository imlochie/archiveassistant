import { NextResponse } from 'next/server'
import { backend } from '@/lib/backend'

export async function GET() {
  const [items, libraries] = await Promise.all([backend.getArchive(), backend.getLibraries()])
  return NextResponse.json({ items, libraries })
}
