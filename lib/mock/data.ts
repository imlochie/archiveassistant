import type {
  ArchiveItem,
  DownloadJob,
  HealthCheck,
  PlexLibrary,
  Settings,
  SourceFormat,
  SourceInspection,
  StorageVolume,
  SystemEvent,
} from '@/lib/types'
import { explainRecommendation, scoreFormat } from '@/lib/quality'

function iso(minAgo: number) {
  return new Date(Date.now() - minAgo * 60_000).toISOString()
}

export const libraries: PlexLibrary[] = [
  { id: 'lib-movies', name: 'Movies', type: 'movie', itemCount: 612, agent: 'Plex Movie' },
  { id: 'lib-4k', name: '4K Movies', type: 'movie', itemCount: 148, agent: 'Plex Movie' },
  { id: 'lib-shows', name: 'TV Shows', type: 'show', itemCount: 94, agent: 'Plex Series' },
  { id: 'lib-docs', name: 'Documentaries', type: 'movie', itemCount: 203, agent: 'Plex Movie' },
]

const titles: Array<[string, number, ArchiveItem['kind'], string]> = [
  ['The Cartographer', 2024, 'movie', 'lib-4k'],
  ['Signals in the Deep', 2023, 'movie', 'lib-docs'],
  ['Neon Districts', 2022, 'movie', 'lib-movies'],
  ['Orbital Mechanics', 2024, 'movie', 'lib-4k'],
  ['The Long Static', 2021, 'movie', 'lib-movies'],
  ['Glass Harvest', 2023, 'movie', 'lib-docs'],
  ['Northbound', 2020, 'movie', 'lib-movies'],
  ['Analog Hearts', 2019, 'movie', 'lib-movies'],
  ['Cascade', 2024, 'movie', 'lib-4k'],
  ['Tidewater', 2022, 'movie', 'lib-docs'],
  ['The Quiet Engine', 2018, 'movie', 'lib-movies'],
  ['Meridian', 2023, 'movie', 'lib-movies'],
  ['Understory', 2021, 'movie', 'lib-docs'],
  ['Vantage', 2024, 'movie', 'lib-4k'],
  ['Slow Light', 2020, 'movie', 'lib-movies'],
  ['Field Notes', 2022, 'show', 'lib-shows'],
  ['The Repair Shop of Time', 2023, 'show', 'lib-shows'],
  ['Deep Focus', 2021, 'show', 'lib-shows'],
]

const codecs = ['h264', 'hevc', 'av01']
const audio = ['aac', 'eac3', 'truehd']

export const archive: ArchiveItem[] = titles.map((t, i) => {
  const [title, year, kind, libraryId] = t
  const is4k = libraryId === 'lib-4k'
  const res = is4k ? '2160p' : i % 4 === 0 ? '720p' : '1080p'
  const vcodec = codecs[i % codecs.length]
  const hasUpgrade = !is4k && i % 3 === 0
  const sizeGb = is4k ? 22 + (i % 5) * 3 : res === '720p' ? 2.4 : 5.1 + (i % 4)
  return {
    id: `arc-${i + 1}`,
    ratingKey: `${10420 + i}`,
    title,
    year,
    kind,
    libraryId,
    summary:
      'A locally archived title. Metadata is synchronized from Plex; the media file itself stays on disk and is never copied into the app database.',
    addedAt: iso((i + 1) * 220),
    updatedAt: iso((i + 1) * 40),
    path:
      kind === 'show'
        ? `D:\\Media\\TV\\${title}\\Season 01`
        : `${is4k ? 'E:' : 'D:'}\\Media\\Movies\\${title} (${year})\\${title} (${year}).mkv`,
    source: i % 2 === 0 ? 'archive.example.org' : 'direct upload',
    tech: {
      resolution: res as ArchiveItem['tech']['resolution'],
      width: is4k ? 3840 : res === '720p' ? 1280 : 1920,
      height: is4k ? 2160 : res === '720p' ? 720 : 1080,
      videoCodec: vcodec,
      audioCodec: audio[i % audio.length],
      bitrateMbps: is4k ? 55 : res === '720p' ? 6 : 12,
      fps: i % 5 === 0 ? 60 : 24,
      hdr: is4k ? 'HDR10' : null,
      container: 'mkv',
      durationSec: 3600 + (i % 6) * 900,
      sizeGb,
    },
    upgradeAvailable: hasUpgrade
      ? { resolution: '2160p', bitrateMbps: 48, videoCodec: 'hevc', sizeGb: sizeGb * 3.4 }
      : null,
    inPlex: i % 7 !== 6,
    thumbHue: (i * 37) % 360,
  }
})

export const jobs: DownloadJob[] = [
  {
    id: 'job-1',
    title: 'Orbital Mechanics — 2160p HDR',
    sourceUrl: 'https://archive.example.org/watch?v=orbital-4k',
    status: 'DOWNLOADING',
    progress: 63,
    speedMbps: 84.2,
    etaSec: 214,
    bytesDownloaded: 14_800_000_000,
    totalBytes: 23_500_000_000,
    selectedFormat: '315+251',
    quality: '2160p',
    destination: 'E:\\Media\\Movies\\Orbital Mechanics (2024)',
    error: null,
    retryCount: 0,
    createdAt: iso(28),
    updatedAt: iso(0),
  },
  {
    id: 'job-2',
    title: 'Glass Harvest — 1080p',
    sourceUrl: 'https://archive.example.org/watch?v=glass-harvest',
    status: 'PROCESSING',
    progress: 100,
    speedMbps: 0,
    etaSec: 0,
    bytesDownloaded: 5_600_000_000,
    totalBytes: 5_600_000_000,
    selectedFormat: '137+140',
    quality: '1080p',
    destination: 'D:\\Media\\Documentaries\\Glass Harvest (2023)',
    error: null,
    retryCount: 0,
    createdAt: iso(52),
    updatedAt: iso(1),
  },
  {
    id: 'job-3',
    title: 'Field Notes — S02E04',
    sourceUrl: 'https://archive.example.org/watch?v=field-notes-204',
    status: 'QUEUED',
    progress: 0,
    speedMbps: 0,
    etaSec: 0,
    bytesDownloaded: 0,
    totalBytes: 1_900_000_000,
    selectedFormat: 'best',
    quality: '1080p',
    destination: 'D:\\Media\\TV\\Field Notes\\Season 02',
    error: null,
    retryCount: 0,
    createdAt: iso(6),
    updatedAt: iso(6),
  },
  {
    id: 'job-4',
    title: 'Tidewater — 1080p',
    sourceUrl: 'https://archive.example.org/watch?v=tidewater',
    status: 'PAUSED',
    progress: 41,
    speedMbps: 0,
    etaSec: 0,
    bytesDownloaded: 2_100_000_000,
    totalBytes: 5_100_000_000,
    selectedFormat: '137+140',
    quality: '1080p',
    destination: 'D:\\Media\\Documentaries\\Tidewater (2022)',
    error: null,
    retryCount: 0,
    createdAt: iso(120),
    updatedAt: iso(35),
  },
  {
    id: 'job-5',
    title: 'Northbound — 1080p',
    sourceUrl: 'https://archive.example.org/watch?v=northbound',
    status: 'FAILED',
    progress: 12,
    speedMbps: 0,
    etaSec: 0,
    bytesDownloaded: 600_000_000,
    totalBytes: 4_800_000_000,
    selectedFormat: '137+140',
    quality: '1080p',
    destination: 'D:\\Media\\Movies\\Northbound (2020)',
    error: 'Source returned HTTP 403 after fragment 214. The host may require re-authentication.',
    retryCount: 2,
    createdAt: iso(180),
    updatedAt: iso(150),
  },
]

export const storage: StorageVolume[] = [
  { id: 'vol-c', label: 'System (C:)', path: 'C:\\', totalTb: 1, usedTb: 0.62 },
  { id: 'vol-d', label: 'Media (D:)', path: 'D:\\Media', totalTb: 4, usedTb: 2.9 },
  { id: 'vol-e', label: 'Archive 4K (E:)', path: 'E:\\Media', totalTb: 8, usedTb: 5.1 },
]

export const health: HealthCheck[] = [
  { id: 'node', label: 'Node.js', state: 'ok', detail: 'Runtime available', version: 'v20.11.1' },
  { id: 'ytdlp', label: 'yt-dlp', state: 'ok', detail: 'Extraction engine detected', version: '2024.08.06' },
  { id: 'ffmpeg', label: 'FFmpeg', state: 'ok', detail: 'Media processing available', version: '7.0.1' },
  { id: 'plex', label: 'Plex', state: 'ok', detail: 'Connected to Basement-Server', version: '1.40.2' },
  { id: 'storage', label: 'Storage', state: 'warn', detail: 'Archive 4K (E:) is 64% full' },
  { id: 'ai', label: 'Local AI', state: 'ok', detail: 'Ollama reachable', version: 'llama3.1:8b' },
]

export const events: SystemEvent[] = [
  { id: 'ev-1', ts: iso(0), level: 'info', category: 'download', message: 'Job orbital-4k reached 63% (84.2 Mbps)' },
  { id: 'ev-2', ts: iso(1), level: 'info', category: 'processing', message: 'Muxing Glass Harvest (video+audio, stream copy)' },
  { id: 'ev-3', ts: iso(2), level: 'info', category: 'plex', message: 'Plex sync complete — 1 new item, 0 removed' },
  { id: 'ev-4', ts: iso(9), level: 'info', category: 'ai', message: 'Tool call get_available_formats returned 14 formats' },
  { id: 'ev-5', ts: iso(35), level: 'warn', category: 'download', message: 'Job tidewater paused by user' },
  { id: 'ev-6', ts: iso(150), level: 'error', category: 'download', message: 'Job northbound failed: HTTP 403', detail: 'Source returned HTTP 403 after fragment 214.' },
  { id: 'ev-7', ts: iso(151), level: 'info', category: 'app', message: 'Job queue restored from disk (5 jobs)' },
  { id: 'ev-8', ts: iso(220), level: 'info', category: 'system', message: 'Filesystem watcher started on 3 directories' },
  { id: 'ev-9', ts: iso(240), level: 'info', category: 'plex', message: 'Scheduled Plex sync started' },
  { id: 'ev-10', ts: iso(280), level: 'warn', category: 'system', message: 'Archive 4K (E:) crossed 60% capacity' },
]

export const settings: Settings = {
  general: { port: 3000, theme: 'dark', startMinimized: false },
  downloads: { downloadDir: 'D:\\Downloads\\_incoming', tempDir: 'D:\\Downloads\\_temp', maxConcurrent: 2, maxBandwidthMbps: 0 },
  archive: {
    directories: ['C:\\Media', 'D:\\Media', 'E:\\Media'],
    hashStrategy: 'fast',
    movieTemplate: '{title} ({year})',
    tvTemplate: '{show} - S{season:02}E{episode:02} - {episode_title}',
    preferredContainer: 'mkv',
    preferredVideoCodec: 'hevc',
    preferredAudioCodec: 'eac3',
  },
  plex: {
    serverUrl: 'http://192.168.1.24:32400',
    tokenSet: true,
    autoSync: true,
    syncIntervalMin: 30,
    autoScan: true,
    serverName: 'Basement-Server',
    machineId: 'a1b2c3d4e5f6••••',
  },
  ai: { provider: 'local', localModel: 'llama3.1:8b', openaiModel: 'gpt-4o-mini', openaiKeySet: false },
  ffmpeg: { hwAccel: 'auto', detected: 'Intel Arc — QSV (H.264/HEVC/AV1)' },
  logging: { level: 'info' },
  mockMode: true,
}

/** Build a realistic 14-format inspection for any URL, scored deterministically. */
export function buildInspection(url: string): SourceInspection {
  const base: Array<Omit<SourceFormat, 'score'>> = [
    { formatId: '271', ext: 'webm', protocol: 'https', resolution: '1440p', width: 2560, height: 1440, fps: 30, vcodec: 'vp9', acodec: null, bitrateMbps: 18, filesizeGb: 3.2, approxFilesizeGb: 3.2, hdr: null, audioLanguage: null, videoOnly: true, audioOnly: false, muxed: false },
    { formatId: '313', ext: 'webm', protocol: 'https', resolution: '2160p', width: 3840, height: 2160, fps: 30, vcodec: 'vp9', acodec: null, bitrateMbps: 34, filesizeGb: 6.8, approxFilesizeGb: 6.8, hdr: null, audioLanguage: null, videoOnly: true, audioOnly: false, muxed: false },
    { formatId: '315', ext: 'webm', protocol: 'https', resolution: '2160p', width: 3840, height: 2160, fps: 60, vcodec: 'vp9', acodec: null, bitrateMbps: 44, filesizeGb: 8.9, approxFilesizeGb: 8.9, hdr: 'HDR10', audioLanguage: null, videoOnly: true, audioOnly: false, muxed: false },
    { formatId: '625', ext: 'mp4', protocol: 'https', resolution: '2160p', width: 3840, height: 2160, fps: 60, vcodec: 'av01.0.12M.10', acodec: null, bitrateMbps: 38, filesizeGb: 7.4, approxFilesizeGb: 7.4, hdr: 'HDR10', audioLanguage: null, videoOnly: true, audioOnly: false, muxed: false },
    { formatId: '137', ext: 'mp4', protocol: 'https', resolution: '1080p', width: 1920, height: 1080, fps: 30, vcodec: 'avc1.640028', acodec: null, bitrateMbps: 12, filesizeGb: 2.3, approxFilesizeGb: 2.3, hdr: null, audioLanguage: null, videoOnly: true, audioOnly: false, muxed: false },
    { formatId: 'hls-2160', ext: 'mp4', protocol: 'm3u8', resolution: '2160p', width: 3840, height: 2160, fps: 60, vcodec: 'hevc', acodec: 'aac', bitrateMbps: 40, filesizeGb: null, approxFilesizeGb: 8.1, hdr: 'HDR10', audioLanguage: 'en', videoOnly: false, audioOnly: false, muxed: true },
    { formatId: 'hls-1080', ext: 'mp4', protocol: 'm3u8', resolution: '1080p', width: 1920, height: 1080, fps: 30, vcodec: 'avc1', acodec: 'aac', bitrateMbps: 9, filesizeGb: null, approxFilesizeGb: 1.9, hdr: null, audioLanguage: 'en', videoOnly: false, audioOnly: false, muxed: true },
    { formatId: '18', ext: 'mp4', protocol: 'https', resolution: '720p', width: 1280, height: 720, fps: 30, vcodec: 'avc1.4d401f', acodec: 'mp4a.40.2', bitrateMbps: 4, filesizeGb: 0.9, approxFilesizeGb: 0.9, hdr: null, audioLanguage: 'en', videoOnly: false, audioOnly: false, muxed: true },
    { formatId: '248', ext: 'webm', protocol: 'https', resolution: '1080p', width: 1920, height: 1080, fps: 30, vcodec: 'vp9', acodec: null, bitrateMbps: 8, filesizeGb: 1.6, approxFilesizeGb: 1.6, hdr: null, audioLanguage: null, videoOnly: true, audioOnly: false, muxed: false },
    { formatId: '136', ext: 'mp4', protocol: 'https', resolution: '720p', width: 1280, height: 720, fps: 30, vcodec: 'avc1.4d401f', acodec: null, bitrateMbps: 5, filesizeGb: 1.0, approxFilesizeGb: 1.0, hdr: null, audioLanguage: null, videoOnly: true, audioOnly: false, muxed: false },
    { formatId: 'dash-2160', ext: 'mp4', protocol: 'dash', resolution: '2160p', width: 3840, height: 2160, fps: 60, vcodec: 'hevc', acodec: null, bitrateMbps: 42, filesizeGb: 8.3, approxFilesizeGb: 8.3, hdr: 'HDR10', audioLanguage: null, videoOnly: true, audioOnly: false, muxed: false },
    { formatId: '251', ext: 'webm', protocol: 'https', resolution: 'audio', width: null, height: null, fps: null, vcodec: null, acodec: 'opus', bitrateMbps: 0.16, filesizeGb: 0.05, approxFilesizeGb: 0.05, hdr: null, audioLanguage: 'en', videoOnly: false, audioOnly: true, muxed: false },
    { formatId: '140', ext: 'm4a', protocol: 'https', resolution: 'audio', width: null, height: null, fps: null, vcodec: null, acodec: 'mp4a.40.2', bitrateMbps: 0.13, filesizeGb: 0.04, approxFilesizeGb: 0.04, hdr: null, audioLanguage: 'en', videoOnly: false, audioOnly: true, muxed: false },
    { formatId: '774', ext: 'webm', protocol: 'https', resolution: 'audio', width: null, height: null, fps: null, vcodec: null, acodec: 'opus', bitrateMbps: 0.26, filesizeGb: 0.08, approxFilesizeGb: 0.08, hdr: null, audioLanguage: 'en', videoOnly: false, audioOnly: true, muxed: false },
  ]

  const formats: SourceFormat[] = base.map((f) => ({ ...f, score: scoreFormat(f) }))
  const best = [...formats].sort((a, b) => b.score - a.score)[0]

  return {
    url,
    title: 'Orbital Mechanics — Restored 4K Master',
    uploader: 'Archive Example Org',
    durationSec: 6420,
    uploadDate: '2024-03-18',
    description:
      'A restored master offered in multiple resolutions and protocols. This inspection is generated in mock mode; the real engine calls yt-dlp to enumerate formats.',
    thumbHue: 205,
    formats,
    recommendedFormatId: best.formatId,
    recommendationReason: explainRecommendation(best),
  }
}
