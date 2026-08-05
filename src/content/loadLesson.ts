import lesson1Package from '../../content/lessons/algebra-i-01/package.json'
import lesson2Package from '../../content/lessons/algebra-i-02/package.json'
import type {
  ContentItem,
  KnowledgePoint,
  LessonPackage,
  Locale,
  LocalizedString,
} from './types'

export const LESSON_ID = 'algebra-i-01'

export const lesson1 = lesson1Package as LessonPackage
export const lesson2 = lesson2Package as LessonPackage

/** All packaged lessons by id. The game still plays LESSON_ID only. */
export const LESSONS: Record<string, LessonPackage> = {
  [lesson1.id]: lesson1,
  [lesson2.id]: lesson2,
}

/** Async loader used by LessonOverlay (same package, Promise wrapper). */
export async function loadLesson(id: string = LESSON_ID): Promise<LessonPackage | null> {
  return LESSONS[id] ?? null
}

export function t(locale: Locale, value: LocalizedString): string {
  return value[locale] || value.en
}

export function getItem(itemId: string): ContentItem | undefined {
  return lesson1.items.find((item) => item.id === itemId)
}

export function getKp(kpId: string): KnowledgePoint | undefined {
  return lesson1.knowledgePoints.find((kp) => kp.id === kpId)
}
