'use client'

import useSWR from 'swr'
import type {
  ArchiveItem,
  DashboardSummary,
  DownloadJob,
  HealthCheck,
  PlexLibrary,
  Settings,
  StorageVolume,
  SystemEvent,
} from '@/lib/types'
import type { JobAction } from '@/lib/backend/types'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useDashboard() {
  return useSWR<DashboardSummary>('/api/dashboard', fetcher, { refreshInterval: 5000 })
}

export function useHealth() {
  return useSWR<{ health: HealthCheck[]; storage: StorageVolume[] }>('/api/health', fetcher)
}

export function useArchive() {
  return useSWR<{ items: ArchiveItem[]; libraries: PlexLibrary[] }>('/api/archive', fetcher)
}

export function usePlex() {
  return useSWR<{
    libraries: PlexLibrary[]
    items: ArchiveItem[]
    connection: {
      serverUrl: string
      autoSync: boolean
      syncIntervalMin: number
      autoScan: boolean
      serverName: string
      machineId: string
      tokenSet: boolean
    }
  }>('/api/plex', fetcher)
}

export function useJobs() {
  return useSWR<DownloadJob[]>('/api/jobs', fetcher, { refreshInterval: 3000 })
}

export function useEvents() {
  return useSWR<SystemEvent[]>('/api/events', fetcher)
}

export function useSettings() {
  return useSWR<Settings>('/api/settings', fetcher)
}

export async function jobAction(id: string, action: JobAction) {
  return fetch(`/api/jobs/${id}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ action }),
  }).then((r) => r.json())
}

export async function patchSettings(patch: unknown) {
  return fetch('/api/settings', {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(patch),
  }).then((r) => r.json())
}
