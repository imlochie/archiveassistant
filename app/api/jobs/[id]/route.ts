import { NextResponse } from 'next/server'
import { backend } from '@/lib/backend'
import type { JobAction } from '@/lib/backend/types'

const VALID: JobAction[] = ['pause', 'resume', 'cancel', 'retry']

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json().catch(() => null)
  const action = body?.action as JobAction
  if (!VALID.includes(action)) {
    return NextResponse.json({ error: 'invalid action' }, { status: 400 })
  }
  const job = await backend.updateJob(id, action)
  if (!job) return NextResponse.json({ error: 'job not found' }, { status: 404 })
  return NextResponse.json(job)
}
