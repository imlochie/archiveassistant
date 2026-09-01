/**
 * Archive Assistant — domain types.
 *
 * These mirror the SQLite/Prisma entities described in the spec
 * (PlexLibrary, PlexItem, ArchiveItem, DownloadJob, etc.). The mock
 * backend implements the same shapes the real local Node engine would
 * return, so screens and hooks never need to change when the real
 * backend is dropped in.
 */

export type MediaKind = 'movie' | 'show' | 'episode' | 'other'

export type QualityTier = '480p' | '720p' | '1080p' | '1440p' | '2160p' | '4320p'

export type JobStatus =
  | 'QUEUED'
  | 'INSPECTING'
  | 'DOWNLOADING'
  | 'DOWNLOADED'
  | 'PROCESSING'
  | 'VERIFYING'
  | 'MOVING'
  | 'PLEX_SCANNING'
  | 'COMPLETE'
  | 'FAILED'
  | 'CANCELLED'
  | 'PAUSED'

export type MatchLevel = 'EXACT MATCH' | 'LIKELY MATCH' | 'POSSIBLE MATCH' | 'NO MATCH'

export type HealthState = 'ok' | 'warn' | 'error' | 'unknown'

export interface PlexLibrary {
  id: string
  name: string
  type: MediaKind
  itemCount: number
  agent: string
}

export interface MediaTech {
  resolution: QualityTier
  width: number
  height: number
  videoCodec: string
  audioCodec: string
  bitrateMbps: number
  fps: number
  hdr: string | null
  container: string
  durationSec: number
  sizeGb: number
}

export interface ArchiveItem {
  id: string
  ratingKey: string
  title: string
  year: number
  kind: MediaKind
  libraryId: string
  summary: string
  addedAt: string
  updatedAt: string
  path: string
  source: string
  tech: MediaTech
  /** Present when a higher-quality source has been detected. */
  upgradeAvailable: {
    resolution: QualityTier
    bitrateMbps: number
    videoCodec: string
    sizeGb: number
  } | null
  inPlex: boolean
  thumbHue: number
}

export interface SourceFormat {
  formatId: string
  ext: string
  protocol: 'https' | 'm3u8' | 'dash'
  resolution: QualityTier | 'audio'
  width: number | null
  height: number | null
  fps: number | null
  vcodec: string | null
  acodec: string | null
  bitrateMbps: number
  filesizeGb: number | null
  approxFilesizeGb: number | null
  hdr: string | null
  audioLanguage: string | null
  videoOnly: boolean
  audioOnly: boolean
  muxed: boolean
  /** Deterministic archival quality score (0-100). */
  score: number
}

export interface SourceInspection {
  url: string
  title: string
  uploader: string
  durationSec: number
  uploadDate: string
  description: string
  thumbHue: number
  formats: SourceFormat[]
  recommendedFormatId: string
  recommendationReason: string
}

export interface DownloadJob {
  id: string
  title: string
  sourceUrl: string
  status: JobStatus
  progress: number
  speedMbps: number
  etaSec: number
  bytesDownloaded: number
  totalBytes: number
  selectedFormat: string
  quality: QualityTier | 'audio'
  destination: string
  error: string | null
  retryCount: number
  createdAt: string
  updatedAt: string
}

export interface SystemEvent {
  id: string
  ts: string
  level: 'info' | 'warn' | 'error'
  category: 'app' | 'download' | 'processing' | 'plex' | 'ai' | 'system'
  message: string
  detail?: string
}

export interface StorageVolume {
  id: string
  label: string
  path: string
  totalTb: number
  usedTb: number
}

export interface HealthCheck {
  id: string
  label: string
  state: HealthState
  detail: string
  version?: string
}

export interface DashboardSummary {
  archiveCount: number
  queueActive: number
  processingCount: number
  recentlyAdded: number
  storageFreeTb: number
  storageTotalTb: number
  plexConnected: boolean
  lastSyncMinutes: number
  inventory: { movies: number; shows: number; episodes: number; other: number }
}

export interface Settings {
  general: { port: number; theme: 'dark'; startMinimized: boolean }
  downloads: {
    downloadDir: string
    tempDir: string
    maxConcurrent: number
    maxBandwidthMbps: number
  }
  archive: {
    directories: string[]
    hashStrategy: 'fast' | 'full'
    movieTemplate: string
    tvTemplate: string
    preferredContainer: string
    preferredVideoCodec: string
    preferredAudioCodec: string
  }
  plex: {
    serverUrl: string
    tokenSet: boolean
    autoSync: boolean
    syncIntervalMin: number
    autoScan: boolean
    serverName: string
    machineId: string
  }
  ai: { provider: 'local' | 'openai'; localModel: string; openaiModel: string; openaiKeySet: boolean }
  ffmpeg: { hwAccel: 'auto' | 'cpu' | 'disabled'; detected: string }
  logging: { level: 'debug' | 'info' | 'warn' | 'error' }
  mockMode: boolean
}

export interface ToolCall {
  tool: string
  label: string
  status: 'running' | 'done' | 'error'
  result?: string
}

export interface AssistantMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  toolCalls?: ToolCall[]
  createdAt: string
}
