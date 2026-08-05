import lesson1Package from '../../content/lessons/algebra-i-01/package.json'
import lesson2Package from '../../content/lessons/algebra-i-02/package.json'
import lesson3Package from '../../content/lessons/algebra-i-03/package.json'
import type {
  ContentItem,
  KnowledgePoint,
  LessonPackage,
  Locale,
  LocalizedString,
} from './types'

export const LESSON_1_ID = 'algebra-i-01'
export const LESSON_2_ID = 'algebra-i-02'
export const LESSON_3_ID = 'algebra-i-03'
/** Default lesson id (L1) for progress views and legacy call sites. */
export const LESSON_ID = LESSON_1_ID

export const lesson1 = lesson1Package as LessonPackage
export const lesson2 = lesson2Package as LessonPackage
export const lesson3 = lesson3Package as LessonPackage

/** All packaged lessons by id. */
export const LESSONS: Record<string, LessonPackage> = {
  [lesson1.id]: lesson1,
  [lesson2.id]: lesson2,
  [lesson3.id]: lesson3,
}

/** Terminal lesson: highest mastered+1 in sequence, else L1. */
export function resolveTerminalLessonId(
  lessonStates: Record<string, { status?: string } | undefined>,
): string {
  if (lessonStates[LESSON_2_ID]?.status === 'mastered') {
    return LESSON_3_ID
  }
  if (lessonStates[LESSON_1_ID]?.status === 'mastered') {
    return LESSON_2_ID
  }
  return LESSON_1_ID
}

/** Async loader used by LessonOverlay (same package, Promise wrapper). */
export async function loadLesson(id: string = LESSON_ID): Promise<LessonPackage | null> {
  return LESSONS[id] ?? null
}

export function t(locale: Locale, value: LocalizedString): string {
  return value[locale] || value.en
}

export function getItem(itemId: string): ContentItem | undefined {
  for (const pkg of Object.values(LESSONS)) {
    const found = pkg.items.find((item) => item.id === itemId)
    if (found) return found
  }
  return undefined
}

export function getKp(kpId: string): KnowledgePoint | undefined {
  for (const pkg of Object.values(LESSONS)) {
    const found = pkg.knowledgePoints.find((kp) => kp.id === kpId)
    if (found) return found
  }
  return undefined
}
