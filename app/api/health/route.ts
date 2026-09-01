import { NextResponse } from 'next/server'
import { backend } from '@/lib/backend'

export async function GET() {
  const [health, storage] = await Promise.all([backend.getHealth(), backend.getStorage()])
  return NextResponse.json({ health, storage })
}
