import type { ArchiveItem, DownloadJob, ToolCall } from '@/lib/types'

/**
 * Scripted assistant engine (mock mode).
 *
 * Recognises intent from the user's message and produces a realistic
 * sequence of tool calls plus a grounded response. In local mode this is
 * replaced by an LLM with the same registered tool interface — the UI
 * renders tool activity identically either way.
 */

export interface AssistantPlan {
  toolCalls: ToolCall[]
  content: string
  /** Optional call-to-action rendered as a button under the message. */
  action?: { label: string; href: string }
}

const URL_RE = /https?:\/\/[^\s]+/i

function tc(tool: string, label: string, result: string): ToolCall {
  return { tool, label, status: 'done', result }
}

export function planResponse(
  message: string,
  ctx: { archive: ArchiveItem[]; jobs: DownloadJob[] },
): AssistantPlan {
  const text = message.toLowerCase()
  const url = message.match(URL_RE)?.[0]
  const active = ctx.jobs.filter((j) =>
    ['DOWNLOADING', 'PROCESSING', 'QUEUED', 'INSPECTING'].includes(j.status),
  )
  const failed = ctx.jobs.filter((j) => j.status === 'FAILED')

  // 1) A URL with an "archive" or "download best" intent → full workflow.
  if (url && (text.includes('archive') || text.includes('download') || text.includes('best'))) {
    return {
      toolCalls: [
        tc('inspect_url', 'Inspecting source', 'Title resolved: Orbital Mechanics — Restored 4K Master'),
        tc('get_available_formats', 'Reading available formats', 'Found 14 formats (audio + video)'),
        tc('check_duplicate', 'Checking archive & Plex for duplicates', 'No exact match found'),
        tc('select_best_source', 'Scoring sources', 'Best: 2160p60 HLS (HDR10), score 96'),
      ],
      content:
        'I inspected the source and scored all 14 formats. The strongest archival option is **2160p60 HLS (HEVC, HDR10, ~40 Mbps)** — it is the highest practical resolution and is already muxed, so FFmpeg can stream-copy it without transcoding. I found no existing copy in your archive or Plex. Want me to queue it?',
      action: { label: 'Open in Source Inspector', href: `/sources?url=${encodeURIComponent(url)}` },
    }
  }

  // 2) A bare URL → inspect + compare.
  if (url) {
    return {
      toolCalls: [
        tc('inspect_url', 'Inspecting source', 'Metadata extracted'),
        tc('get_available_formats', 'Reading available formats', '14 formats'),
        tc('search_plex', 'Searching Plex inventory', '1 likely match'),
      ],
      content:
        'I inspected that URL and cross-checked Plex. There is a **likely match** already in your library at 1080p H.264. The source offers a **2160p HDR10** version, which is a meaningful quality improvement. I would keep the existing copy until a new download is verified.',
      action: { label: 'Inspect formats', href: `/sources?url=${encodeURIComponent(url)}` },
    }
  }

  // 3) "Do I already have this / do I have"
  if (text.includes('already have') || text.includes('do i have') || text.includes('duplicate')) {
    const sample = ctx.archive[0]
    return {
      toolCalls: [
        tc('search_archive', 'Searching archive database', `${ctx.archive.length} items scanned`),
        tc('search_plex', 'Searching Plex inventory', '1 candidate'),
        tc('check_duplicate', 'Comparing normalized titles + year', 'Exact match'),
      ],
      content: sample
        ? `Yes — you already have **${sample.title} (${sample.year})** in your **${sample.tech.resolution} ${sample.tech.videoCodec.toUpperCase()}** archive (${sample.tech.sizeGb.toFixed(1)} GB). Paste a specific URL and I will compare it against this copy.`
        : 'Paste a URL or title and I will search your archive and Plex for an existing copy.',
    }
  }

  // 4) "What's happening / currently downloading / status"
  if (
    text.includes("what's happening") ||
    text.includes('whats happening') ||
    text.includes('currently downloading') ||
    text.includes('status') ||
    text.includes('what is downloading')
  ) {
    const lines = active.map((j) => `- **${j.title}** — ${j.status.toLowerCase()} (${j.progress}%)`)
    return {
      toolCalls: [
        tc('get_current_queue', 'Reading job queue', `${active.length} active`),
        tc('get_system_status', 'Checking processing + sync', 'nominal'),
      ],
      content: `Here is what's happening right now:\n\n${lines.join('\n')}\n\n${
        failed.length ? `${failed.length} job failed (${failed[0].title}). ` : ''
      }Plex last synced 2 minutes ago and one file is muxing in FFmpeg.`,
      action: { label: 'Open queue', href: '/queue' },
    }
  }

  // 5) "What's missing"
  if (text.includes('missing') || text.includes("what am i missing")) {
    return {
      toolCalls: [
        tc('search_archive', 'Scanning archive for gaps', 'ok'),
        tc('get_plex_library_stats', 'Reading Plex library stats', 'ok'),
      ],
      content:
        "To tell you what's missing I need a reference to compare against — a collection, a watchlist, or a season list. Point me at one (or paste a list) and I'll diff it against your archive and Plex. I won't guess at gaps without something to compare to.",
    }
  }

  // 6) "Why did you choose"
  if (text.includes('why') && (text.includes('choose') || text.includes('source') || text.includes('pick'))) {
    return {
      toolCalls: [tc('select_best_source', 'Re-explaining last selection', 'ok')],
      content:
        'I chose the **2160p60 HLS (HEVC, HDR10)** source because it scored highest across resolution, bitrate, and codec efficiency while remaining directly downloadable and already muxed — so no transcoding is required. A DASH 2160p option scored close but is video-only and would need an extra mux step.',
    }
  }

  // 7) "Recent downloads / recently added"
  if (text.includes('recent')) {
    const recent = ctx.archive.slice(0, 4).map((i) => `- ${i.title} (${i.year}) · ${i.tech.resolution}`)
    return {
      toolCalls: [tc('get_archive_history', 'Reading archive history', `${ctx.archive.length} items`)],
      content: `Your most recent additions:\n\n${recent.join('\n')}`,
      action: { label: 'Browse archive', href: '/archive' },
    }
  }

  // Fallback.
  return {
    toolCalls: [tc('get_system_status', 'Reading system status', 'ok')],
    content:
      "I'm your archive operator. Paste a URL to inspect a source, or ask things like \u201cDo I already have this?\u201d, \u201cDownload the best version\u201d, \u201cWhat's currently downloading?\u201d, or \u201cWhy did you choose that source?\u201d I only act through registered tools and never invent inventory.",
  }
}

export const SUGGESTIONS = [
  'What\u2019s currently downloading?',
  'Do I already have this?',
  'Download the best version',
  'Why did you choose that source?',
]
