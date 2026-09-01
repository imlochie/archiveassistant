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
import * as mock from '@/lib/mock/data'
import { buildInspection } from '@/lib/mock/data'
import type { ArchiveBackend, DeepPartial, JobAction } from './types'

/**
 * In-memory mock backend. Holds mutable copies so job actions and settings
 * updates persist for the life of the server process (resets on cold start,
 * which is fine for a demo). Mirrors the async signatures of a real engine.
 */
class MockBackend implements ArchiveBackend {
  private jobs: DownloadJob[] = mock.jobs.map((j) => ({ ...j }))
  private settings: Settings = structuredClone(mock.settings)

  async getDashboard(): Promise<DashboardSummary> {
    const inventory = mock.libraries.reduce(
      (acc, l) => {
        if (l.type === 'movie') acc.movies += l.itemCount
        else if (l.type === 'show') acc.shows += l.itemCount
        return acc
      },
      { movies: 0, shows: 0, episodes: 1284, other: 46 },
    )
    const totalTb = mock.storage.reduce((s, v) => s + v.totalTb, 0)
    const freeTb = mock.storage.reduce((s, v) => s + (v.totalTb - v.usedTb), 0)
    return {
      archiveCount: mock.archive.length + 1329,
      queueActive: this.jobs.filter((j) =>
        ['QUEUED', 'DOWNLOADING', 'PROCESSING', 'INSPECTING'].includes(j.status),
      ).length,
      processingCount: this.jobs.filter((j) => j.status === 'PROCESSING').length,
      recentlyAdded: 12,
      storageFreeTb: Math.round(freeTb * 10) / 10,
      storageTotalTb: totalTb,
      plexConnected: true,
      lastSyncMinutes: 2,
      inventory,
    }
  }

  async getHealth(): Promise<HealthCheck[]> {
    return mock.health
  }

  async getStorage(): Promise<StorageVolume[]> {
    return mock.storage
  }

  async getLibraries(): Promise<PlexLibrary[]> {
    return mock.libraries
  }

  async getArchive(): Promise<ArchiveItem[]> {
    return mock.archive
  }

  async getJobs(): Promise<DownloadJob[]> {
    return this.jobs
  }

  async updateJob(id: string, action: JobAction): Promise<DownloadJob | null> {
    const job = this.jobs.find((j) => j.id === id)
    if (!job) return null
    const next: Record<JobAction, JobStatus> = {
      pause: 'PAUSED',
      resume: 'DOWNLOADING',
      cancel: 'CANCELLED',
      retry: 'QUEUED',
    }
    job.status = next[action]
    if (action === 'retry') {
      job.error = null
      job.retryCount += 1
      job.progress = 0
    }
    job.updatedAt = new Date().toISOString()
    return job
  }

  async inspectSource(url: string): Promise<SourceInspection> {
    return buildInspection(url)
  }

  async createDownloadJob(url: string, formatId: string, title: string): Promise<DownloadJob> {
    const job: DownloadJob = {
      id: `job-${Date.now()}`,
      title,
      sourceUrl: url,
      status: 'QUEUED',
      progress: 0,
      speedMbps: 0,
      etaSec: 0,
      bytesDownloaded: 0,
      totalBytes: 8_000_000_000,
      selectedFormat: formatId,
      quality: '2160p',
      destination: this.settings.downloads.downloadDir,
      error: null,
      retryCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.jobs = [job, ...this.jobs]
    return job
  }

  async getEvents(): Promise<SystemEvent[]> {
    return mock.events
  }

  async getSettings(): Promise<Settings> {
    return this.settings
  }

  async updateSettings(patch: DeepPartial<Settings>): Promise<Settings> {
    this.settings = deepMerge(this.settings, patch)
    return this.settings
  }
}

function deepMerge<T>(base: T, patch: DeepPartial<T>): T {
  const out: any = Array.isArray(base) ? [...(base as any)] : { ...(base as any) }
  for (const key of Object.keys(patch ?? {})) {
    const pv = (patch as any)[key]
    const bv = (base as any)[key]
    out[key] =
      pv && typeof pv === 'object' && !Array.isArray(pv) && bv && typeof bv === 'object'
        ? deepMerge(bv, pv)
        : pv
  }
  return out
}

// Persist a single instance across hot reloads in dev.
const g = globalThis as unknown as { __archiveBackend?: MockBackend }
export const mockBackend = g.__archiveBackend ?? (g.__archiveBackend = new MockBackend())
