'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Bot,
  Clapperboard,
  Library,
  ListVideo,
  ScrollText,
  Search,
  Server,
  Settings,
  LayoutDashboard,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/', label: 'Home', icon: LayoutDashboard },
  { href: '/assistant', label: 'Assistant', icon: Bot },
  { href: '/queue', label: 'Queue', icon: ListVideo },
  { href: '/archive', label: 'Archive', icon: Library },
  { href: '/plex', label: 'Plex', icon: Server },
  { href: '/sources', label: 'Sources', icon: Search },
  { href: '/history', label: 'History', icon: ScrollText },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-svh bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 flex w-16 flex-col border-r border-sidebar-border bg-sidebar lg:w-60">
        <div className="flex h-14 items-center gap-2.5 border-b border-sidebar-border px-3 lg:px-4">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Clapperboard className="size-4.5" />
          </div>
          <div className="hidden min-w-0 flex-col lg:flex">
            <span className="truncate text-sm font-semibold leading-tight text-sidebar-foreground">
              Archive Assistant
            </span>
            <span className="truncate text-[11px] leading-tight text-muted-foreground">
              Media Control Room
            </span>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 p-2">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'group flex h-9 items-center gap-3 rounded-md px-2.5 text-sm font-medium transition-colors',
                  'justify-center lg:justify-start',
                  active
                    ? 'bg-sidebar-accent text-sidebar-foreground'
                    : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
                )}
              >
                <Icon
                  className={cn(
                    'size-4.5 shrink-0',
                    active ? 'text-primary' : 'text-muted-foreground group-hover:text-sidebar-foreground',
                  )}
                />
                <span className="hidden lg:inline">{label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <div className="hidden items-center gap-2 lg:flex">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-success/60" />
              <span className="relative inline-flex size-2 rounded-full bg-success" />
            </span>
            <span className="text-[11px] font-medium text-muted-foreground">
              Mock mode active
            </span>
          </div>
          <span className="mx-auto block size-2 rounded-full bg-success lg:hidden" />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col pl-16 lg:pl-60">{children}</div>
    </div>
  )
}
