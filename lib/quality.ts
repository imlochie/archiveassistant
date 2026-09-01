import type { SourceFormat } from './types'

/**
 * Deterministic archival quality scoring.
 *
 * The spec is explicit: do NOT simply pick the largest resolution, and do
 * NOT make m3u8 mandatory. Score across resolution, bitrate, codec, fps,
 * HDR, protocol/container practicality, and whether the source can be muxed
 * without transcoding. Returns 0-100.
 */
const RES_POINTS: Record<string, number> = {
  '480p': 20,
  '720p': 34,
  '1080p': 52,
  '1440p': 62,
  '2160p': 80,
  '4320p': 92,
  audio: 4,
}

export function scoreFormat(f: Omit<SourceFormat, 'score'>): number {
  let score = RES_POINTS[f.resolution] ?? 10

  // Bitrate contribution (capped so it can't dominate resolution).
  score += Math.min(f.bitrateMbps * 0.5, 12)

  // Codec efficiency — modern codecs preferred for archival.
  if (f.vcodec?.startsWith('av01')) score += 4
  else if (f.vcodec?.startsWith('vp9') || f.vcodec?.includes('hevc') || f.vcodec?.includes('265'))
    score += 3
  else if (f.vcodec?.includes('264')) score += 1

  // High frame rate.
  if ((f.fps ?? 0) >= 50) score += 2

  // HDR / dynamic range.
  if (f.hdr) score += 4

  // Practicality: a muxed direct-download stream needs no FFmpeg mux step.
  if (f.muxed) score += 3
  if (f.protocol === 'https') score += 2
  else if (f.protocol === 'dash') score += 1
  // m3u8 is fine but not privileged.

  return Math.round(Math.min(score, 100))
}

export function explainRecommendation(f: SourceFormat): string {
  const proto = f.protocol === 'https' ? 'a direct download' : f.protocol.toUpperCase()
  const codec = f.vcodec ?? 'unknown codec'
  const mux = f.muxed
    ? 'is already muxed so it needs no re-encoding'
    : 'can be muxed with the best audio track without transcoding'
  return `Selected ${f.resolution} ${proto} (${codec}, ${f.bitrateMbps} Mbps) because it offers the highest practical resolution and bitrate for archival while it ${mux}.`
}
