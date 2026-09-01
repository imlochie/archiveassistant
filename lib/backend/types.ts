import type {
  ArchiveItem,
  DashboardSummary,
  DownloadJob,
  HealthCheck,
  JobStatus,
  PlexLibrary,
  Settings,
  SourceInspection,
  StorageVolume,
  SystemEvent,
} from '@/lib/types'

/**
 * ArchiveBackend is the single seam between the UI and the engine.
 *
 * The v0 preview uses MockBackend. To go local, implement this same
 * interface against SQLite/Prisma + yt-dlp + FFmpeg + the Plex API and
 * swap the instance exported from `lib/backend/index.ts`. No screen,
 * hook, or API route needs to change.
 */
export interface ArchiveBackend {
  getDashboard(): Promise<DashboardSummary>
  getHealth(): Promise<HealthCheck[]>
  getStorage(): Promise<StorageVolume[]>

  getLibraries(): Promise<PlexLibrary[]>
  getArchive(): Promise<ArchiveItem[]>

  getJobs(): Promise<DownloadJob[]>
  updateJob(id: string, action: JobAction): Promise<DownloadJob | null>

  inspectSource(url: string): Promise<SourceInspection>
  createDownloadJob(url: string, formatId: string, title: string): Promise<DownloadJob>

  getEvents(): Promise<SystemEvent[]>

  getSettings(): Promise<Settings>
  updateSettings(patch: DeepPartial<Settings>): Promise<Settings>
}

export type JobAction = 'pause' | 'resume' | 'cancel' | 'retry'

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K]
}
