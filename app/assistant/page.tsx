'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Bot, Check, Loader2, SendHorizontal, User, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui-kit'
import { MarkdownLite } from '@/components/markdown-lite'
import { planResponse, SUGGESTIONS } from '@/lib/assistant'
import { useArchive, useJobs } from '@/lib/hooks'
import type { AssistantMessage, ToolCall } from '@/lib/types'
import { cn } from '@/lib/utils'

const GREETING: AssistantMessage = {
  id: 'greeting',
  role: 'assistant',
  content:
    "I'm your Archive Assistant. Paste a URL to inspect a source, or ask me about your archive — what you have, what's downloading, or which source is best. I only act through registered tools and never invent inventory.",
  createdAt: new Date().toISOString(),
}

export default function AssistantPage() {
  const { data: archiveData } = useArchive()
  const { data: jobs } = useJobs()
  const [messages, setMessages] = useState<AssistantMessage[]>([GREETING])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [action, setAction] = useState<Record<string, { label: string; href: string }>>({})
  const scrollRef = useRef<HTMLDivElement>(null)
  const composing = useRef(false)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  async function send(raw: string) {
    const content = raw.trim()
    if (!content || busy) return
    setInput('')
    setBusy(true)

    const userMsg: AssistantMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    }
    const plan = planResponse(content, {
      archive: archiveData?.items ?? [],
      jobs: jobs ?? [],
    })
    const asstId = `a-${Date.now()}`
    const running: ToolCall[] = plan.toolCalls.map((t) => ({ ...t, status: 'running' }))
    const asstMsg: AssistantMessage = {
      id: asstId,
      role: 'assistant',
      content: '',
      toolCalls: running,
      createdAt: new Date().toISOString(),
    }
    setMessages((m) => [...m, userMsg, asstMsg])

    // Step through tool calls, marking each done.
    for (let i = 0; i < plan.toolCalls.length; i++) {
      await wait(420)
      setMessages((m) =>
        m.map((msg) =>
          msg.id === asstId
            ? {
                ...msg,
                toolCalls: msg.toolCalls?.map((t, idx) =>
                  idx === i ? { ...t, status: 'done' } : t,
                ),
              }
            : msg,
        ),
      )
    }

    await wait(300)
    setMessages((m) =>
      m.map((msg) => (msg.id === asstId ? { ...msg, content: plan.content } : msg)),
    )
    if (plan.action) setAction((a) => ({ ...a, [asstId]: plan.action! }))
    setBusy(false)
  }

  return (
    <div className="flex h-svh flex-col">
      <PageHeader
        title="Assistant"
        description="Your intelligent archive operator. Ask in natural language or paste a link."
      />

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 md:px-6">
          {messages.map((msg) => (
            <div key={msg.id} className={cn('flex gap-3', msg.role === 'user' && 'flex-row-reverse')}>
              <div
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-md',
                  msg.role === 'assistant'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground',
                )}
              >
                {msg.role === 'assistant' ? <Bot className="size-4.5" /> : <User className="size-4.5" />}
              </div>

              <div className={cn('flex min-w-0 max-w-[85%] flex-col gap-2', msg.role === 'user' && 'items-end')}>
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div className="w-full rounded-lg border border-border bg-card/60 p-2.5">
                    <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      <Wrench className="size-3" />
                      Tool activity
                    </div>
                    <ul className="flex flex-col gap-1.5">
                      {msg.toolCalls.map((t, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs">
                          {t.status === 'done' ? (
                            <Check className="size-3.5 shrink-0 text-success" />
                          ) : (
                            <Loader2 className="size-3.5 shrink-0 animate-spin text-primary" />
                          )}
                          <span className="font-mono text-[11px] text-muted-foreground">{t.tool}</span>
                          <span className="truncate text-muted-foreground/80">— {t.label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {msg.content && (
                  <div
                    className={cn(
                      'rounded-lg px-3.5 py-2.5 text-sm',
                      msg.role === 'assistant'
                        ? 'bg-card text-card-foreground'
                        : 'bg-primary text-primary-foreground',
                    )}
                  >
                    <MarkdownLite text={msg.content} />
                  </div>
                )}

                {action[msg.id] && (
                  <Button
                    variant="outline"
                    size="sm"
                    nativeButton={false}
                    render={<Link href={action[msg.id].href} />}
                  >
                    {action[msg.id].label}
                    <ArrowUpRight className="size-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-3 md:px-6">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                disabled={busy}
                className="rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              send(input)
            }}
            className="flex items-end gap-2 rounded-xl border border-border bg-card p-2 focus-within:border-primary/50"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onCompositionStart={() => (composing.current = true)}
              onCompositionEnd={() => (composing.current = false)}
              onKeyDown={(e) => {
                if (
                  e.key === 'Enter' &&
                  !e.shiftKey &&
                  !composing.current &&
                  !e.nativeEvent.isComposing &&
                  e.keyCode !== 229
                ) {
                  e.preventDefault()
                  send(input)
                }
              }}
              rows={1}
              placeholder="Paste a URL or tell me what you want to do..."
              className="max-h-40 min-h-9 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground"
            />
            <Button type="submit" size="icon" disabled={busy || !input.trim()} aria-label="Send">
              <SendHorizontal className="size-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}
