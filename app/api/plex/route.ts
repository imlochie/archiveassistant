import { NextResponse } from 'next/server'
import { backend } from '@/lib/backend'

export async function GET() {
  const [libraries, items, settings] = await Promise.all([
    backend.getLibraries(),
    backend.getArchive(),
    backend.getSettings(),
  ])
  // Never expose the Plex token — only whether one is configured.
  const { serverUrl, autoSync, syncIntervalMin, autoScan, serverName, machineId, tokenSet } =
    settings.plex
  return NextResponse.json({
    libraries,
    items: items.filter((i) => i.inPlex),
    connection: { serverUrl, autoSync, syncIntervalMin, autoScan, serverName, machineId, tokenSet },
  })
}
