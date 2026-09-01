import { NextResponse } from 'next/server'
import { backend } from '@/lib/backend'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const url = typeof body?.url === 'string' ? body.url.trim() : ''
  if (!url || !/^https?:\/\//i.test(url)) {
    return NextResponse.json(
      { error: "I couldn't extract media from this URL." },
      { status: 400 },
    )
  }
  return NextResponse.json(await backend.inspectSource(url))
}
