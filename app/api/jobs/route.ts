import { NextResponse } from 'next/server'
import { backend } from '@/lib/backend'

export async function GET() {
  return NextResponse.json(await backend.getJobs())
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  if (!body?.url || !body?.formatId) {
    return NextResponse.json({ error: 'url and formatId are required' }, { status: 400 })
  }
  const job = await backend.createDownloadJob(body.url, body.formatId, body.title ?? body.url)
  return NextResponse.json(job, { status: 201 })
}
