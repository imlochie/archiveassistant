import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { HealthState, JobStatus } from '@/lib/types'

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <header className="sticky top-0 z-20 flex min-h-14 flex-wrap items-center justify-between gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur md:px-6">
      <div className="min-w-0">
        <h1 className="text-balance text-lg font-semibold leading-tight tracking-tight">{title}</h1>
        {description ? (
          <p className="mt-0.5 text-pretty text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </header>
  )
}

export function Panel({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-xl border border-border bg-card text-card-foreground', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function PanelHeader({ title, aside }: { title: string; aside?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
      <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
      {aside}
    </div>
  )
}

export function Stat({
  label,
  value,
  sub,
  accent,
}: {
  label: string
  value: ReactNode
  sub?: ReactNode
  accent?: boolean
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span
        className={cn(
          'text-2xl font-semibold tabular-nums leading-none',
          accent && 'text-primary',
        )}
      >
        {value}
      </span>
      {sub ? <span className="text-xs text-muted-foreground">{sub}</span> : null}
    </div>
  )
}

const HEALTH_STYLES: Record<HealthState, string> = {
  ok: 'bg-success/15 text-success',
  warn: 'bg-warning/15 text-warning',
  error: 'bg-destructive/15 text-destructive',
  unknown: 'bg-muted text-muted-foreground',
}

export function Dot({ state }: { state: HealthState }) {
  const color =
    state === 'ok'
      ? 'bg-success'
      : state === 'warn'
        ? 'bg-warning'
        : state === 'error'
          ? 'bg-destructive'
          : 'bg-muted-foreground'
  return <span className={cn('inline-block size-2 shrink-0 rounded-full', color)} />
}

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode
  tone?: 'neutral' | 'primary' | 'success' | 'warning' | 'destructive'
  className?: string
}) {
  const tones: Record<string, string> = {
    neutral: 'bg-muted text-muted-foreground',
    primary: 'bg-primary/15 text-primary',
    success: 'bg-success/15 text-success',
    warning: 'bg-warning/15 text-warning',
    destructive: 'bg-destructive/15 text-destructive',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

const STATUS_TONE: Record<JobStatus, 'neutral' | 'primary' | 'success' | 'warning' | 'destructive'> = {
  QUEUED: 'neutral',
  INSPECTING: 'primary',
  DOWNLOADING: 'primary',
  DOWNLOADED: 'primary',
  PROCESSING: 'warning',
  VERIFYING: 'warning',
  MOVING: 'warning',
  PLEX_SCANNING: 'warning',
  COMPLETE: 'success',
  FAILED: 'destructive',
  CANCELLED: 'neutral',
  PAUSED: 'warning',
}

export function StatusBadge({ status }: { status: JobStatus }) {
  return <Badge tone={STATUS_TONE[status]}>{status.replace('_', ' ')}</Badge>
}

export function ProgressBar({ value, tone = 'primary' }: { value: number; tone?: 'primary' | 'warning' | 'destructive' }) {
  const bg = tone === 'warning' ? 'bg-warning' : tone === 'destructive' ? 'bg-destructive' : 'bg-primary'
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div className={cn('h-full rounded-full transition-all', bg)} style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }} />
    </div>
  )
}

export function Poster({ hue, label, className }: { hue: number; label: string; className?: string }) {
  return (
    <div
      className={cn('relative flex items-end overflow-hidden rounded-md', className)}
      style={{
        backgroundImage: `linear-gradient(150deg, oklch(0.35 0.09 ${hue}), oklch(0.2 0.05 ${(hue + 40) % 360}))`,
      }}
      aria-hidden
    >
      <span className="pointer-events-none absolute inset-0 opacity-25 [background:radial-gradient(circle_at_30%_20%,white,transparent_55%)]" />
      <span className="relative m-1.5 line-clamp-2 text-[10px] font-medium leading-tight text-white/90">
        {label}
      </span>
    </div>
  )
}
