'use client'

import Link from 'next/link'
import {
  ArrowUpRight,
  Bot,
  Cpu,
  Download,
  HardDrive,
  RefreshCw,
  Server,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge, Dot, Panel, PanelHeader, PageHeader, Poster, ProgressBar, Stat, StatusBadge } from '@/components/ui-kit'
import { useArchive, useDashboard, useHealth, useJobs } from '@/lib/hooks'


export default function HomePage() {
  const { data: dash } = useDashboard()
  const { data: healthData } = useHealth()
  const { data: jobs } = useJobs()
  const { data: archiveData } = useArchive()

  const activeJobs = (jobs ?? []).filter((j) =>
    ['DOWNLOADING', 'PROCESSING', 'QUEUED', 'INSPECTING'].includes(j.status),
  )
  const recent = (archiveData?.items ?? []).slice(0, 6)

  return (
    <>
      <PageHeader
        title="Home"
        description="A live view of your archive, downloads, and system health."
        actions={
          <>
            <Button variant="outline" size="sm">
              <RefreshCw className="size-3.5" />
              Sync Plex
            </Button>
            <Button size="sm" nativeButton={false} render={<Link href="/assistant" />}>
              <Bot className="size-3.5" />
              Ask the assistant
            </Button>
          </>
        }
      />

      <main className="flex flex-col gap-4 p-4 md:p-6">
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Panel className="p-4">
            <Stat
              label="Archive"
              value={dash ? dash.archiveCount.toLocaleString() : '—'}
              sub="items tracked"
              accent
            />
          </Panel>
          <Panel className="p-4">
            <Stat label="Queue" value={dash?.queueActive ?? '—'} sub="active jobs" />
          </Panel>
          <Panel className="p-4">
            <Stat label="Processing" value={dash?.processingCount ?? '—'} sub="files in FFmpeg" />
          </Panel>
          <Panel className="p-4">
            <Stat label="Recently added" value={dash?.recentlyAdded ?? '—'} sub="last 7 days" />
          </Panel>
        </section>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <Panel className="xl:col-span-2">
            <PanelHeader
              title="Active downloads"
              aside={
                <Button variant="ghost" size="xs" nativeButton={false} render={<Link href="/queue" />}>
                  View queue
                  <ArrowUpRight className="size-3" />
                </Button>
              }
            />
            <div className="divide-y divide-border">
              {activeJobs.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No active downloads right now.
                </p>
              ) : (
                activeJobs.map((job) => (
                  <div key={job.id} className="flex flex-col gap-2 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <Download className="size-3.5 shrink-0 text-primary" />
                        <span className="truncate text-sm font-medium">{job.title}</span>
                      </div>
                      <StatusBadge status={job.status} />
                    </div>
                    <ProgressBar
                      value={job.progress}
                      tone={job.status === 'PROCESSING' ? 'warning' : 'primary'}
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground tabular-nums">
                      <span>{job.progress}%</span>
                      <span>
                        {job.status === 'DOWNLOADING'
                          ? `${job.speedMbps.toFixed(1)} Mbps`
                          : job.status === 'PROCESSING'
                            ? 'stream copy / mux'
                            : 'waiting'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Panel>

          <Panel>
            <PanelHeader
              title="System health"
              aside={<Badge tone="primary"><Cpu className="size-3" />Intel Ultra 5</Badge>}
            />
            <ul className="divide-y divide-border">
              {(healthData?.health ?? []).map((h) => (
                <li key={h.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <Dot state={h.state} />
                    <span className="text-sm font-medium">{h.label}</span>
                  </div>
                  <span className="truncate text-right text-xs text-muted-foreground">
                    {h.version ?? h.detail}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <Panel className="xl:col-span-2">
            <PanelHeader
              title="Recently added"
              aside={
                <Button variant="ghost" size="xs" nativeButton={false} render={<Link href="/archive" />}>
                  Browse archive
                  <ArrowUpRight className="size-3" />
                </Button>
              }
            />
            <div className="grid grid-cols-3 gap-3 p-4 sm:grid-cols-6">
              {recent.map((item) => (
                <div key={item.id} className="flex flex-col gap-1.5">
                  <Poster hue={item.thumbHue} label={item.title} className="aspect-[2/3]" />
                  <span className="truncate text-xs font-medium">{item.title}</span>
                  <span className="text-[11px] text-muted-foreground">
                    {item.year} · {item.tech.resolution}
                  </span>
                </div>
              ))}
            </div>
          </Panel>

          <div className="flex flex-col gap-4">
            <Panel className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="size-4 text-primary" />
                  <span className="text-sm font-semibold">Plex</span>
                </div>
                <Badge tone={dash?.plexConnected ? 'success' : 'destructive'}>
                  {dash?.plexConnected ? 'Connected' : 'Offline'}
                </Badge>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground">Last sync</div>
                  <div className="font-medium">{dash ? `${dash.lastSyncMinutes} min ago` : '—'}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Movies</div>
                  <div className="font-medium tabular-nums">
                    {dash?.inventory.movies.toLocaleString() ?? '—'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Episodes</div>
                  <div className="font-medium tabular-nums">
                    {dash?.inventory.episodes.toLocaleString() ?? '—'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Shows</div>
                  <div className="font-medium tabular-nums">
                    {dash?.inventory.shows.toLocaleString() ?? '—'}
                  </div>
                </div>
              </div>
            </Panel>

            <Panel className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="size-4 text-primary" />
                  <span className="text-sm font-semibold">Storage</span>
                </div>
                <span className="text-sm font-medium tabular-nums">
                  {dash ? `${dash.storageFreeTb} TB free` : '—'}
                </span>
              </div>
              <div className="mt-3 flex flex-col gap-3">
                {(healthData?.storage ?? []).map((v) => {
                  const pct = Math.round((v.usedTb / v.totalTb) * 100)
                  return (
                    <div key={v.id} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium">{v.label}</span>
                        <span className="text-muted-foreground tabular-nums">
                          {v.usedTb} / {v.totalTb} TB
                        </span>
                      </div>
                      <ProgressBar
                        value={pct}
                        tone={pct > 80 ? 'destructive' : pct > 60 ? 'warning' : 'primary'}
                      />
                    </div>
                  )
                })}
              </div>
            </Panel>
          </div>
        </div>
      </main>
    </>
  )
}
