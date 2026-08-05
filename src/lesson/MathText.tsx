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

  if (latex?.trim()) {
    const MathComponent = block ? BlockMath : InlineMath
    return (
      <span className={className}>
        <MathComponent math={latex} />
      </span>
    )
  }

  const parts = splitMathSegments(content)
  if (parts.length === 1 && parts[0]?.type === 'text') {
    return <span className={className}>{content}</span>
  }

  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.type === 'math' ? (
          part.block ? (
            <BlockMath key={i} math={part.value} />
          ) : (
            <InlineMath key={i} math={part.value} />
          )
        ) : (
          <span key={i}>{part.value}</span>
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
