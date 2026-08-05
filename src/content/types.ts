/**
 * Shared content + progress types for Axiom Rising Slice 0.
 * Sync-ready: fields mirror future account payload.
 */

export type Locale = 'en' | 'es' | 'pl'

export type Jurisdiction =
  | 'CCSS'
  | 'CA'
  | 'NJ'
  | 'MI'
  | 'TX'
  | 'NY'
  | 'IL'
  | 'MO'
  | 'FL'
  | 'WA'
  | 'DC'
  | 'OH'
  | 'MN'

export type MasteryStatus = 'not_introduced' | 'in_progress' | 'mastered' | 'due_review'

export type LessonPhaseKind =
  | 'objectives'
  | 'i_do'
  | 'we_do'
  | 'you_do'
  | 'retrieval'
  | 'complete'

export interface LocalizedString {
  en: string
  es: string
  pl: string
}

export interface IrtPriors1PL {
  /** Difficulty parameter b (Rasch / 1PL) */
  b: number
  /** Reserved for 2PL discrimination; 1.0 in Slice 0 */
  a: number
}

export interface SpacedRepetitionDefaults {
  initialIntervalDays: number
  easeFactor: number
  masteryThreshold: number
}

export interface KnowledgePoint {
  id: string
  title: LocalizedString
  description: LocalizedString
  prerequisites: string[]
  successCriteria: LocalizedString
  misconceptions: LocalizedString[]
  standards: Partial<Record<Jurisdiction, string[]>>
  irtPriors: IrtPriors1PL
  srDefaults: SpacedRepetitionDefaults
}

export interface ItemChoice {
  id: string
  text: LocalizedString
  /** LaTeX optional alternate display */
  latex?: string
  isCorrect: boolean
  diagnosticTag?: string
  feedback: LocalizedString
}

export interface ContentItem {
  id: string
  kpIds: string[]
  phase: LessonPhaseKind
  type: 'mcq' | 'short' | 'evaluate' | 'translate'
  stem: LocalizedString
  stemLatex?: string
  answer?: string | number
  acceptableAnswers?: string[]
  choices?: ItemChoice[]
  workedSolution: LocalizedString
  workedSolutionLatex?: string
  standards: Partial<Record<Jurisdiction, string[]>>
  irtPriors: IrtPriors1PL
  difficulty: 'intro' | 'guided' | 'independent'
}

export interface LessonPhase {
  id: string
  kind: LessonPhaseKind
  title: LocalizedString
  body: LocalizedString
  bodyLatex?: string[]
  itemIds: string[]
  tutorScript: LocalizedString
}

export interface UnlockDefinition {
  id: string
  kind: 'blueprint' | 'rank' | 'zone'
  title: LocalizedString
  description: LocalizedString
}

export interface LessonPackage {
  schemaVersion: '1.0.0'
  id: string
  courseId: string
  order: number
  title: LocalizedString
  objectives: LocalizedString[]
  knowledgePointIds: string[]
  phases: LessonPhase[]
  items: ContentItem[]
  knowledgePoints: KnowledgePoint[]
  mastery: {
    minIndependentCorrect: number
    minIndependentTotal: number
    requiredKpIds: string[]
  }
  unlocks: UnlockDefinition[]
  worldIntegration: {
    terminalId: string
    unlockBlueprintId: string
    unlockRankId: string
    unlockZoneId: string
  }
}

export interface KpProgressState {
  kpId: string
  status: MasteryStatus
  correctStreak: number
  totalAttempts: number
  totalCorrect: number
  lastSeenAt?: string
  nextReviewAt?: string
  easeFactor: number
  intervalDays: number
}

export interface LessonProgressState {
  lessonId: string
  status: 'locked' | 'available' | 'in_progress' | 'mastered'
  phaseIndex: number
  independentCorrect: number
  independentTotal: number
  completedAt?: string
}

export interface ItemResponseRecord {
  itemId: string
  correct: boolean
  rawAnswer: string
  at: string
  locale: Locale
}

export interface PlayerUnlocks {
  blueprints: string[]
  ranks: string[]
  zones: string[]
}

/** Sync-ready progress blob (ADR-002) */
export interface ProgressBlob {
  schemaVersion: '1.0.0'
  playerId: string
  locale: Locale
  jurisdiction: Jurisdiction
  thetaStub: number
  kpStates: Record<string, KpProgressState>
  lessonStates: Record<string, LessonProgressState>
  itemResponses: ItemResponseRecord[]
  unlocks: PlayerUnlocks
  updatedAt: string
}
