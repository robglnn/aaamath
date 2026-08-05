import { create } from 'zustand'
import type {
  ContentItem,
  Jurisdiction,
  KnowledgePoint,
  LessonPackage,
  LessonProgressState,
  Locale,
  MasteryStatus,
  ProgressBlob,
} from '@/content/types'
import {
  createDefaultProgress,
  loadProgress,
  resetProgress as resetStorage,
  saveProgress,
} from './storage'

export type StandardCoverageStatus = 'evidenced' | 'partial' | 'missing'

export interface StandardCoverageRow {
  code: string
  status: StandardCoverageStatus
  kpIds: string[]
}

let persistTimer: ReturnType<typeof setTimeout> | null = null

function schedulePersist(blob: ProgressBlob): void {
  if (persistTimer) clearTimeout(persistTimer)
  persistTimer = setTimeout(() => {
    void saveProgress(blob)
  }, 400)
}

function ensureKpState(blob: ProgressBlob, kpId: string) {
  if (!blob.kpStates[kpId]) {
    blob.kpStates[kpId] = {
      kpId,
      status: 'not_introduced',
      correctStreak: 0,
      totalAttempts: 0,
      totalCorrect: 0,
      easeFactor: 2.5,
      intervalDays: 1,
    }
  }
  return blob.kpStates[kpId]
}

function ensureLessonState(blob: ProgressBlob, lessonId: string): LessonProgressState {
  if (!blob.lessonStates[lessonId]) {
    blob.lessonStates[lessonId] = {
      lessonId,
      status: 'available',
      phaseIndex: 0,
      independentCorrect: 0,
      independentTotal: 0,
    }
  }
  return blob.lessonStates[lessonId]
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)]
}

export interface ProgressStore {
  blob: ProgressBlob
  hydrated: boolean
  hydrate: () => Promise<void>
  setLocale: (locale: Locale) => void
  setJurisdiction: (jurisdiction: Jurisdiction) => void
  recordAnswer: (params: {
    item: ContentItem
    correct: boolean
    rawAnswer: string
    locale: Locale
    isIndependent?: boolean
    lessonId: string
  }) => void
  markKpProgress: (kpId: string, correct: boolean) => void
  completeLessonMastery: (pkg: LessonPackage) => void
  resetProgress: () => Promise<void>
  getKpStatus: (kpId: string) => MasteryStatus
  getStandardsCoverage: (
    pkg: LessonPackage | null,
    jurisdiction?: Jurisdiction,
  ) => StandardCoverageRow[]
  getLessonState: (lessonId: string) => LessonProgressState | undefined
}

export const useProgressStore = create<ProgressStore>((set, get) => ({
  blob: createDefaultProgress(),
  hydrated: false,

  hydrate: async () => {
    const blob = await loadProgress()
    set({ blob, hydrated: true })
  },

  setLocale: (locale) => {
    const blob = { ...get().blob, locale }
    set({ blob })
    schedulePersist(blob)
  },

  setJurisdiction: (jurisdiction) => {
    const blob = { ...get().blob, jurisdiction }
    set({ blob })
    schedulePersist(blob)
  },

  recordAnswer: ({ item, correct, rawAnswer, locale, isIndependent, lessonId }) => {
    const blob = structuredClone(get().blob)
    blob.itemResponses.push({
      itemId: item.id,
      correct,
      rawAnswer,
      at: new Date().toISOString(),
      locale,
    })

    for (const kpId of item.kpIds) {
      const kp = ensureKpState(blob, kpId)
      kp.totalAttempts += 1
      if (correct) {
        kp.totalCorrect += 1
        kp.correctStreak += 1
      } else {
        kp.correctStreak = 0
      }
      kp.lastSeenAt = new Date().toISOString()
      if (kp.status === 'not_introduced') kp.status = 'in_progress'
      if (kp.correctStreak >= 3) kp.status = 'mastered'
    }

    const lesson = ensureLessonState(blob, lessonId)
    lesson.status = 'in_progress'
    if (isIndependent) {
      lesson.independentTotal += 1
      if (correct) lesson.independentCorrect += 1
    }

    set({ blob })
    schedulePersist(blob)
  },

  markKpProgress: (kpId, correct) => {
    const blob = structuredClone(get().blob)
    const kp = ensureKpState(blob, kpId)
    kp.totalAttempts += 1
    if (correct) {
      kp.totalCorrect += 1
      kp.correctStreak += 1
    } else {
      kp.correctStreak = 0
    }
    kp.lastSeenAt = new Date().toISOString()
    if (kp.status === 'not_introduced') kp.status = 'in_progress'
    if (kp.correctStreak >= 3) kp.status = 'mastered'
    set({ blob })
    schedulePersist(blob)
  },

  completeLessonMastery: (pkg) => {
    const blob = structuredClone(get().blob)
    const lesson = ensureLessonState(blob, pkg.id)
    lesson.status = 'mastered'
    lesson.completedAt = new Date().toISOString()

    for (const kpId of pkg.mastery.requiredKpIds) {
      const kp = ensureKpState(blob, kpId)
      kp.status = 'mastered'
      kp.correctStreak = Math.max(kp.correctStreak, 3)
    }

    const pushUnique = (list: string[], id: string) => {
      if (!list.includes(id)) list.push(id)
    }

    for (const unlock of pkg.unlocks) {
      if (unlock.kind === 'blueprint') pushUnique(blob.unlocks.blueprints, unlock.id)
      if (unlock.kind === 'rank') pushUnique(blob.unlocks.ranks, unlock.id)
      if (unlock.kind === 'zone') pushUnique(blob.unlocks.zones, unlock.id)
    }

    const wi = pkg.worldIntegration
    if (wi.unlockBlueprintId) pushUnique(blob.unlocks.blueprints, wi.unlockBlueprintId)
    if (wi.unlockRankId) pushUnique(blob.unlocks.ranks, wi.unlockRankId)
    if (wi.unlockZoneId) pushUnique(blob.unlocks.zones, wi.unlockZoneId)

    set({ blob })
    schedulePersist(blob)
  },

  resetProgress: async () => {
    const blob = await resetStorage()
    set({ blob })
  },

  getKpStatus: (kpId) => {
    return get().blob.kpStates[kpId]?.status ?? 'not_introduced'
  },

  getStandardsCoverage: (pkg, jurisdiction) => {
    const j = jurisdiction ?? get().blob.jurisdiction
    if (!pkg) return []

    const codeToKps = new Map<string, string[]>()
    const collect = (kp: KnowledgePoint) => {
      const codes = kp.standards[j] ?? []
      for (const code of codes) {
        const existing = codeToKps.get(code) ?? []
        existing.push(kp.id)
        codeToKps.set(code, existing)
      }
    }
    pkg.knowledgePoints.forEach(collect)

    const rows: StandardCoverageRow[] = []
    for (const [code, kpIds] of codeToKps) {
      const statuses = unique(kpIds).map((id) => get().getKpStatus(id))
      const masteredCount = statuses.filter((s) => s === 'mastered').length
      let status: StandardCoverageStatus = 'missing'
      if (masteredCount === kpIds.length && kpIds.length > 0) status = 'evidenced'
      else if (masteredCount > 0 || statuses.some((s) => s === 'in_progress')) {
        status = 'partial'
      }
      rows.push({ code, status, kpIds: unique(kpIds) })
    }

    return rows.sort((a, b) => a.code.localeCompare(b.code))
  },

  getLessonState: (lessonId) => get().blob.lessonStates[lessonId],
}))

export function pickLocalized(
  value: { en: string; es: string; pl: string },
  locale: Locale,
): string {
  return value[locale] || value.en
}
