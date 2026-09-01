import type { ArchiveBackend } from './types'
import { mockBackend } from './mock-backend'

/**
 * The active backend for the whole app.
 *
 * To run the real local engine, implement ArchiveBackend against
 * SQLite/yt-dlp/FFmpeg/Plex and export that instance here instead:
 *
 *   export const backend: ArchiveBackend = process.env.MOCK_MODE === 'false'
 *     ? new LocalEngineBackend()
 *     : mockBackend
 */
export const backend: ArchiveBackend = mockBackend

export type { ArchiveBackend }
