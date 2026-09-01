import { NextResponse } from 'next/server'
import { backend } from '@/lib/backend'

export async function GET() {
  return NextResponse.json(await backend.getSettings())
}

export async function PATCH(req: Request) {
  const patch = await req.json().catch(() => null)
  if (!patch || typeof patch !== 'object') {
    return NextResponse.json({ error: 'invalid patch' }, { status: 400 })
  }
  // Defensively strip any attempt to send secret values back through the API.
  if (patch.plex) delete patch.plex.token
  if (patch.ai) delete patch.ai.openaiKey
  return NextResponse.json(await backend.updateSettings(patch))
}
