import { Fragment } from 'react'

/** Minimal renderer: **bold**, newlines, and `- ` bullet lists. */
export function MarkdownLite({ text }: { text: string }) {
  const blocks = text.split('\n')
  const out: React.ReactNode[] = []
  let bullets: string[] = []

  const flush = (key: string) => {
    if (bullets.length) {
      out.push(
        <ul key={key} className="my-1 flex flex-col gap-1 pl-1">
          {bullets.map((b, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground" />
              <span>{inline(b)}</span>
            </li>
          ))}
        </ul>,
      )
      bullets = []
    }
  }

  blocks.forEach((line, i) => {
    if (line.startsWith('- ')) {
      bullets.push(line.slice(2))
    } else {
      flush(`ul-${i}`)
      if (line.trim()) out.push(<p key={i}>{inline(line)}</p>)
    }
  })
  flush('ul-end')

  return <div className="flex flex-col gap-2 leading-relaxed">{out}</div>
}

function inline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((p, i) =>
    p.startsWith('**') && p.endsWith('**') ? (
      <strong key={i} className="font-semibold text-foreground">
        {p.slice(2, -2)}
      </strong>
    ) : (
      <Fragment key={i}>{p}</Fragment>
    ),
  )
}
