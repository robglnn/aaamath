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
  introduceLessonKps: (pkg: LessonPackage) => void
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

    // Live 1PL/Rasch theta update (learning rate damped for Slice 0 stability).
    const b = item.irtPriors?.b ?? 0
    const p = 1 / (1 + Math.exp(-(blob.thetaStub - b)))
    const lr = 0.35
    blob.thetaStub += lr * ((correct ? 1 : 0) - p)
    blob.thetaStub = Math.max(-3, Math.min(3, blob.thetaStub))

    for (const kpId of item.kpIds) {
      const kp = ensureKpState(blob, kpId)
      kp.totalAttempts += 1
      if (correct) {
        kp.totalCorrect += 1
        kp.correctStreak += 1
      } else {
        kp.correctStreak = 0
        if (kp.status === 'mastered' || kp.status === 'due_review') {
          kp.status = 'in_progress'
          kp.nextReviewAt = undefined
        }
      }
      kp.lastSeenAt = new Date().toISOString()
      if (kp.status === 'not_introduced') kp.status = 'in_progress'
      if (kp.correctStreak >= 3 && kp.status !== 'due_review') {
        kp.status = 'mastered'
        const interval = Math.max(1, kp.intervalDays)
        const next = new Date()
        next.setDate(next.getDate() + interval)
        kp.nextReviewAt = next.toISOString()
      }
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
    if (kp.correctStreak >= 3) {
      kp.status = 'mastered'
      const next = new Date()
      next.setDate(next.getDate() + Math.max(1, kp.intervalDays))
      kp.nextReviewAt = next.toISOString()
    }
    set({ blob })
    schedulePersist(blob)
  },

  introduceLessonKps: (pkg) => {
    const blob = structuredClone(get().blob)
    const lesson = ensureLessonState(blob, pkg.id)
    if (lesson.status === 'locked' || lesson.status === 'available') {
      lesson.status = 'in_progress'
    }
    for (const kpId of pkg.knowledgePointIds) {
      const kp = ensureKpState(blob, kpId)
      if (kp.status === 'not_introduced') kp.status = 'in_progress'
    }
    // Mark due_review if nextReviewAt is in the past
    const now = Date.now()
    for (const kp of Object.values(blob.kpStates)) {
      if (kp.status === 'mastered' && kp.nextReviewAt && Date.parse(kp.nextReviewAt) <= now) {
        kp.status = 'due_review'
      }
    }
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
      // Schedule spaced retrieval (use KP defaults via existing intervalDays)
      const interval = Math.max(1, kp.intervalDays || 1)
      const next = new Date()
      next.setDate(next.getDate() + interval)
      kp.nextReviewAt = next.toISOString()
      kp.intervalDays = Math.min(30, Math.round(interval * (kp.easeFactor || 2.5)))
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
    for (const [code, rawKpIds] of codeToKps) {
      const kpIds = unique(rawKpIds)
      const statuses = kpIds.map((id) => get().getKpStatus(id))
      const masteredCount = statuses.filter((s) => s === 'mastered' || s === 'due_review').length
      let status: StandardCoverageStatus = 'missing'
      if (masteredCount === kpIds.length && kpIds.length > 0) status = 'evidenced'
      else if (masteredCount > 0 || statuses.some((s) => s === 'in_progress' || s === 'due_review')) {
        status = 'partial'
      }
      rows.push({ code, status, kpIds })
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
