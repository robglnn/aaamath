import { InlineMath, BlockMath } from 'react-katex'
import type { Locale } from '@/content/types'
import { pickLocalized } from '@/progress/store'

interface MathTextProps {
  text?: string
  localized?: { en: string; es: string; pl: string }
  locale?: Locale
  latex?: string
  block?: boolean
  className?: string
}

export function MathText({
  text,
  localized,
  locale = 'en',
  latex,
  block = false,
  className,
}: MathTextProps) {
  const content = text ?? (localized ? pickLocalized(localized, locale) : '')

  const rootClass = ['math-text', className].filter(Boolean).join(' ')

  // Prefer prose + LaTeX twin so instruction verbs are not dropped (gauntlet seam fix).
  if (latex?.trim()) {
    const MathComponent = block ? BlockMath : InlineMath
    const prose = content.trim()
    const latexOnly = !prose || prose === latex.trim()
    return (
      <span className={rootClass}>
        {!latexOnly && <span className="math-prose">{prose} </span>}
        <span className={block ? 'math-block' : 'math-inline'}>
          <MathComponent math={latex} />
        </span>
      </span>
    )
  }

  const parts = splitMathSegments(content)
  if (parts.length === 1 && parts[0]?.type === 'text') {
    return <span className={rootClass}>{content}</span>
  }

  return (
    <span className={rootClass}>
      {parts.map((part, i) =>
        part.type === 'math' ? (
          <span key={i} className={part.block ? 'math-block' : 'math-inline'}>
            {part.block ? <BlockMath math={part.value} /> : <InlineMath math={part.value} />}
          </span>
        ) : (
          <span key={i} className="math-prose">
            {part.value}
          </span>
        ),
      )}
    </span>
  )
}

type Segment = { type: 'text'; value: string } | { type: 'math'; value: string; block: boolean }

function splitMathSegments(input: string): Segment[] {
  const segments: Segment[] = []
  const regex = /(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g
  let last = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(input)) !== null) {
    if (match.index > last) {
      segments.push({ type: 'text', value: input.slice(last, match.index) })
    }
    const token = match[0]
    const block = token.startsWith('$$')
    const value = block ? token.slice(2, -2).trim() : token.slice(1, -1).trim()
    segments.push({ type: 'math', value, block })
    last = match.index + token.length
  }

  if (last < input.length) {
    segments.push({ type: 'text', value: input.slice(last) })
  }

  if (segments.length === 0) {
    return [{ type: 'text', value: input }]
  }
  return segments
}
