import { useCallback, useEffect, useMemo, useState } from 'react'
import type {
  ContentItem,
  LessonPackage,
  LessonPhase,
  LessonPhaseKind,
  Locale,
} from '@/content/types'

const PHASE_ORDER: LessonPhaseKind[] = [
  'objectives',
  'i_do',
  'we_do',
  'you_do',
  'retrieval',
  'complete',
]

export interface AnswerResult {
  correct: boolean
  feedback: string
  choiceId?: string
}

export interface LessonSessionState {
  phaseIndex: number
  phase: LessonPhase | null
  phaseKind: LessonPhaseKind
  itemIndex: number
  currentItem: ContentItem | null
  phaseItems: ContentItem[]
  independentCorrect: number
  independentTotal: number
  masteryMet: boolean
  answeredItemIds: Set<string>
  lastResult: AnswerResult | null
  showSolution: boolean
  isComplete: boolean
}

function normalizeAnswer(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/×/g, 'x')
    .replace(/\*/g, '')
}

function checkShortAnswer(item: ContentItem, raw: string): boolean {
  const normalized = normalizeAnswer(raw)
  const candidates: string[] = []
  if (item.answer !== undefined) candidates.push(String(item.answer))
  if (item.acceptableAnswers) candidates.push(...item.acceptableAnswers)
  return candidates.some((c) => normalizeAnswer(c) === normalized)
}

function orderedPhases(pkg: LessonPackage): LessonPhase[] {
  const byKind = new Map(pkg.phases.map((p) => [p.kind, p]))
  return PHASE_ORDER.map((kind) => byKind.get(kind)).filter(
    (p): p is LessonPhase => Boolean(p),
  )
}

function collectPhaseItems(pkg: LessonPackage, phase: LessonPhase | null): ContentItem[] {
  if (!phase) return []
  const ids = new Set(phase.itemIds)
  return pkg.items.filter((item) => ids.has(item.id) || item.phase === phase.kind)
}

/** Order independent items once by 1PL information at θ (do not re-sort mid-phase). */
function orderByRaschInfo(items: ContentItem[], theta: number): ContentItem[] {
  return [...items].sort((a, b) => {
    const infoA = raschInfo(theta, a.irtPriors?.b ?? 0)
    const infoB = raschInfo(theta, b.irtPriors?.b ?? 0)
    return infoB - infoA
  })
}

/** Fisher information for 1PL at ability θ for item difficulty b. */
function raschInfo(theta: number, b: number): number {
  const z = theta - b
  const p = 1 / (1 + Math.exp(-z))
  return p * (1 - p)
}

function isIndependentItem(item: ContentItem): boolean {
  return item.difficulty === 'independent' || item.phase === 'you_do'
}

export function useLessonSession(
  pkg: LessonPackage | null,
  locale: Locale,
  theta: number = 0,
) {
  const phases = useMemo(() => (pkg ? orderedPhases(pkg) : []), [pkg])
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [itemIndex, setItemIndex] = useState(0)
  const [independentCorrect, setIndependentCorrect] = useState(0)
  const [independentTotal, setIndependentTotal] = useState(0)
  const [answeredItemIds, setAnsweredItemIds] = useState<Set<string>>(() => new Set())
  const [lastResult, setLastResult] = useState<AnswerResult | null>(null)
  const [showSolution, setShowSolution] = useState(false)
  const [masteryTriggered, setMasteryTriggered] = useState(false)
  const [evidencedKpIds, setEvidencedKpIds] = useState<Set<string>>(() => new Set())
  /** Frozen you_do queue — snapshot at phase entry so live θ cannot reshuffle under itemIndex. */
  const [youDoQueue, setYouDoQueue] = useState<ContentItem[] | null>(null)

  const phase = phases[phaseIndex] ?? null
  const phaseKind = phase?.kind ?? 'objectives'

  useEffect(() => {
    if (!pkg || !phase) {
      setYouDoQueue(null)
      return
    }
    if (phase.kind !== 'you_do') {
      setYouDoQueue(null)
      return
    }
    // Freeze on first enter; ignore later θ changes while still in you_do (prev stays).
    setYouDoQueue((prev) => prev ?? orderByRaschInfo(collectPhaseItems(pkg, phase), theta))
  }, [pkg, phase, theta])

  const phaseItems = useMemo(() => {
    if (!pkg || !phase) return []
    if (phase.kind === 'you_do' && youDoQueue) return youDoQueue
    return collectPhaseItems(pkg, phase)
  }, [pkg, phase, youDoQueue])

  const currentItem = phaseItems[itemIndex] ?? null

  const masteryMet = useMemo(() => {
    if (!pkg) return false
    const { minIndependentCorrect, minIndependentTotal, requiredKpIds } = pkg.mastery
    const countOk =
      independentCorrect >= minIndependentCorrect &&
      independentTotal >= minIndependentTotal
    const kpOk = requiredKpIds.every((id) => evidencedKpIds.has(id))
    return countOk && kpOk
  }, [pkg, independentCorrect, independentTotal, evidencedKpIds])

  const isComplete = phaseKind === 'complete' || (masteryMet && phaseKind === 'you_do')

  const submitAnswer = useCallback(
    (rawAnswer: string, choiceId?: string): AnswerResult | null => {
      if (!pkg || !currentItem) return null

      let correct = false
      let feedback = ''
      const solution = currentItem.workedSolution[locale] || currentItem.workedSolution.en
      const useChoices = Boolean(choiceId && currentItem.choices?.length)

      if (useChoices && currentItem.choices) {
        const choice = currentItem.choices.find((c) => c.id === choiceId)
        correct = Boolean(choice?.isCorrect)
        feedback = choice ? choice.feedback[locale] || choice.feedback.en : ''
      } else {
        correct = checkShortAnswer(currentItem, rawAnswer)
        if (correct) {
          feedback = solution
        } else {
          const hint =
            locale === 'es'
              ? 'No del todo. Revisa la solución trabajada: '
              : locale === 'pl'
                ? 'Nie do końca. Sprawdź rozwiązanie: '
                : 'Not quite. Check the worked solution: '
          feedback = hint + solution
        }
      }

      const result: AnswerResult = { correct, feedback, choiceId }
      setLastResult(result)
      setShowSolution(!correct)
      setAnsweredItemIds((prev) => new Set(prev).add(currentItem.id))

      if (isIndependentItem(currentItem)) {
        setIndependentTotal((n) => n + 1)
        if (correct) {
          setIndependentCorrect((n) => n + 1)
          setEvidencedKpIds((prev) => {
            const next = new Set(prev)
            for (const kpId of currentItem.kpIds) next.add(kpId)
            return next
          })
        }
      }

      return result
    },
    [pkg, currentItem, locale],
  )

  const advance = useCallback(() => {
    setLastResult(null)
    setShowSolution(false)

    if (itemIndex < phaseItems.length - 1) {
      setItemIndex((i) => i + 1)
      return
    }

    if (phaseIndex < phases.length - 1) {
      setPhaseIndex((i) => i + 1)
      setItemIndex(0)
      return
    }
  }, [itemIndex, phaseItems.length, phaseIndex, phases.length])

  const markMasteryTriggered = useCallback(() => {
    setMasteryTriggered(true)
  }, [])

  const state: LessonSessionState = {
    phaseIndex,
    phase,
    phaseKind,
    itemIndex,
    currentItem,
    phaseItems,
    independentCorrect,
    independentTotal,
    masteryMet: masteryMet || masteryTriggered,
    answeredItemIds,
    lastResult,
    showSolution,
    isComplete: isComplete || masteryTriggered,
  }

  return {
    state,
    phases,
    submitAnswer,
    advance,
    markMasteryTriggered,
    isIndependentItem,
  }
}

export { normalizeAnswer, checkShortAnswer }
