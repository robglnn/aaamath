/**
 * Validates lesson content packages against structural rules and locale coverage.
 * Usage: npx tsx scripts/validate-content.ts [path/to/package.json]
 * Default: content/lessons/algebra-i-01/package.json
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type {
  ContentItem,
  KnowledgePoint,
  LessonPackage,
  LessonPhaseKind,
  Locale,
  LocalizedString,
} from '../src/content/types.ts'

const LOCALES: Locale[] = ['en', 'es', 'pl']
const PHASE_KINDS: LessonPhaseKind[] = [
  'objectives',
  'i_do',
  'we_do',
  'you_do',
  'retrieval',
  'complete',
]

const defaultPath = resolve('content/lessons/algebra-i-01/package.json')
const packagePath = resolve(process.argv[2] ?? defaultPath)

const errors: string[] = []
const warnings: string[] = []

function fail(msg: string): void {
  errors.push(msg)
}

function warn(msg: string): void {
  warnings.push(msg)
}

function isLocalizedString(value: unknown, path: string): value is LocalizedString {
  if (!value || typeof value !== 'object') {
    fail(`${path}: expected LocalizedString object`)
    return false
  }
  const obj = value as Record<string, unknown>
  let ok = true
  for (const loc of LOCALES) {
    if (typeof obj[loc] !== 'string' || obj[loc].trim().length === 0) {
      fail(`${path}.${loc}: missing or empty`)
      ok = false
    }
  }
  return ok
}

function checkLocalizedArray(arr: unknown, path: string): void {
  if (!Array.isArray(arr) || arr.length === 0) {
    fail(`${path}: expected non-empty array of LocalizedString`)
    return
  }
  arr.forEach((item, i) => isLocalizedString(item, `${path}[${i}]`))
}

function loadPackage(): LessonPackage {
  let raw: string
  try {
    raw = readFileSync(packagePath, 'utf8')
  } catch {
    fail(`Cannot read package at ${packagePath}`)
    process.exit(1)
  }

  let pkg: unknown
  try {
    pkg = JSON.parse(raw)
  } catch (e) {
    fail(`Invalid JSON: ${e instanceof Error ? e.message : String(e)}`)
    process.exit(1)
  }

  return pkg as LessonPackage
}

function validateTopLevel(pkg: LessonPackage): void {
  if (pkg.schemaVersion !== '1.0.0') {
    fail(`schemaVersion must be "1.0.0", got ${String(pkg.schemaVersion)}`)
  }
  if (!pkg.id || typeof pkg.id !== 'string') {
    fail('id: missing')
  } else if (!/^(lesson\.|algebra-)/.test(pkg.id)) {
    fail(`id should be lesson.* or algebra-*, got ${String(pkg.id)}`)
  }
  if (!pkg.courseId) fail('courseId is required')
  if (typeof pkg.order !== 'number' || pkg.order < 1) fail('order must be a positive integer')
  isLocalizedString(pkg.title, 'title')
  checkLocalizedArray(pkg.objectives, 'objectives')
  if (!Array.isArray(pkg.knowledgePointIds) || pkg.knowledgePointIds.length === 0) {
    fail('knowledgePointIds must be a non-empty array')
  }
  if (!Array.isArray(pkg.phases) || pkg.phases.length === 0) fail('phases must be non-empty')
  if (!Array.isArray(pkg.items) || pkg.items.length === 0) fail('items must be non-empty')
  if (!Array.isArray(pkg.knowledgePoints) || pkg.knowledgePoints.length === 0) {
    fail('knowledgePoints must be non-empty')
  }
  if (!pkg.mastery) fail('mastery is required')
  if (!Array.isArray(pkg.unlocks) || pkg.unlocks.length === 0) fail('unlocks must be non-empty')
  if (!pkg.worldIntegration) fail('worldIntegration is required')
}

function validateKnowledgePoints(pkg: LessonPackage): Set<string> {
  const kpIds = new Set<string>()

  for (const kp of pkg.knowledgePoints) {
    if (!kp.id?.startsWith('kp.')) fail(`KP id must start with "kp.": ${kp.id}`)
    if (kpIds.has(kp.id)) fail(`Duplicate KP id: ${kp.id}`)
    kpIds.add(kp.id)

    isLocalizedString(kp.title, `knowledgePoints[${kp.id}].title`)
    isLocalizedString(kp.description, `knowledgePoints[${kp.id}].description`)
    isLocalizedString(kp.successCriteria, `knowledgePoints[${kp.id}].successCriteria`)
    if (!Array.isArray(kp.prerequisites)) {
      fail(`knowledgePoints[${kp.id}].prerequisites must be an array`)
    } else {
      for (const prereq of kp.prerequisites) {
        if (!prereq.startsWith('kp.')) {
          warn(`KP ${kp.id} prerequisite "${prereq}" does not start with kp.`)
        }
      }
    }
    if (!Array.isArray(kp.misconceptions) || kp.misconceptions.length === 0) {
      fail(`knowledgePoints[${kp.id}].misconceptions must be non-empty`)
    } else {
      kp.misconceptions.forEach((m, i) =>
        isLocalizedString(m, `knowledgePoints[${kp.id}].misconceptions[${i}]`),
      )
    }
    if (!kp.standards || Object.keys(kp.standards).length === 0) {
      fail(`knowledgePoints[${kp.id}].standards must be non-empty`)
    }
    if (typeof kp.irtPriors?.a !== 'number' || typeof kp.irtPriors?.b !== 'number') {
      fail(`knowledgePoints[${kp.id}].irtPriors must have numeric a and b`)
    }
    if (
      typeof kp.srDefaults?.initialIntervalDays !== 'number' ||
      typeof kp.srDefaults?.easeFactor !== 'number' ||
      typeof kp.srDefaults?.masteryThreshold !== 'number'
    ) {
      fail(`knowledgePoints[${kp.id}].srDefaults incomplete`)
    }
  }

  for (const id of pkg.knowledgePointIds) {
    if (!kpIds.has(id)) fail(`knowledgePointIds references missing KP: ${id}`)
  }

  for (const kp of pkg.knowledgePoints) {
    for (const prereq of kp.prerequisites) {
      if (prereq.startsWith('kp.') && !kpIds.has(prereq)) {
        fail(`KP ${kp.id} prerequisite ${prereq} not found in package`)
      }
    }
  }

  return kpIds
}

function validateItems(pkg: LessonPackage, kpIds: Set<string>): Map<string, ContentItem> {
  const itemMap = new Map<string, ContentItem>()

  for (const item of pkg.items) {
    if (itemMap.has(item.id)) fail(`Duplicate item id: ${item.id}`)
    itemMap.set(item.id, item)

    if (!PHASE_KINDS.includes(item.phase)) {
      fail(`Item ${item.id}: invalid phase ${item.phase}`)
    }
    if (!item.kpIds?.length) fail(`Item ${item.id}: kpIds must be non-empty`)
    for (const kpId of item.kpIds) {
      if (!kpIds.has(kpId)) fail(`Item ${item.id}: unknown kpId ${kpId}`)
    }
    isLocalizedString(item.stem, `items[${item.id}].stem`)
    isLocalizedString(item.workedSolution, `items[${item.id}].workedSolution`)
    if (!item.standards || Object.keys(item.standards).length === 0) {
      fail(`Item ${item.id}: standards must be non-empty`)
    }
    if (typeof item.irtPriors?.a !== 'number' || typeof item.irtPriors?.b !== 'number') {
      fail(`Item ${item.id}: irtPriors must have a and b`)
    }

    if (item.type === 'mcq') {
      if (!item.choices?.length) fail(`Item ${item.id}: mcq requires choices`)
      const correct = item.choices.filter((c) => c.isCorrect)
      if (correct.length !== 1) fail(`Item ${item.id}: mcq must have exactly one correct choice`)
      for (const choice of item.choices) {
        isLocalizedString(choice.text, `items[${item.id}].choices[${choice.id}].text`)
        isLocalizedString(choice.feedback, `items[${item.id}].choices[${choice.id}].feedback`)
      }
    }

    if (item.type === 'short' || item.type === 'evaluate' || item.type === 'translate') {
      if (item.answer === undefined && !item.acceptableAnswers?.length) {
        fail(`Item ${item.id}: ${item.type} requires answer or acceptableAnswers`)
      }
    }

    if (item.phase === 'you_do' && item.difficulty !== 'independent') {
      warn(`Item ${item.id}: you_do item should have difficulty "independent"`)
    }
    if (item.phase === 'we_do' && item.difficulty !== 'guided') {
      warn(`Item ${item.id}: we_do item should have difficulty "guided"`)
    }
  }

  return itemMap
}

function validatePhases(pkg: LessonPackage, itemMap: Map<string, ContentItem>): void {
  const phaseKinds = new Set<LessonPhaseKind>()

  for (const phase of pkg.phases) {
    if (!PHASE_KINDS.includes(phase.kind)) fail(`Phase ${phase.id}: invalid kind`)
    phaseKinds.add(phase.kind)
    isLocalizedString(phase.title, `phases[${phase.id}].title`)
    isLocalizedString(phase.body, `phases[${phase.id}].body`)
    isLocalizedString(phase.tutorScript, `phases[${phase.id}].tutorScript`)
    if (!Array.isArray(phase.itemIds)) fail(`Phase ${phase.id}: itemIds must be an array`)
    for (const itemId of phase.itemIds) {
      if (!itemMap.has(itemId)) fail(`Phase ${phase.id}: unknown itemId ${itemId}`)
      const item = itemMap.get(itemId)!
      if (item.phase !== phase.kind) {
        fail(`Phase ${phase.id} (${phase.kind}) references item ${itemId} with phase ${item.phase}`)
      }
    }
  }

  const expectedPhases: LessonPhaseKind[] = [
    'objectives',
    'i_do',
    'we_do',
    'you_do',
    'retrieval',
    'complete',
  ]
  for (const kind of expectedPhases) {
    if (!phaseKinds.has(kind)) warn(`Missing phase kind: ${kind}`)
  }
}

function validateMastery(pkg: LessonPackage, itemMap: Map<string, ContentItem>, kpIds: Set<string>): void {
  const { mastery } = pkg
  if (mastery.minIndependentCorrect > mastery.minIndependentTotal) {
    fail('mastery.minIndependentCorrect cannot exceed minIndependentTotal')
  }
  if (mastery.minIndependentCorrect < 1) fail('mastery.minIndependentCorrect must be >= 1')

  const youDoItems = [...itemMap.values()].filter((i) => i.phase === 'you_do')
  if (youDoItems.length < mastery.minIndependentTotal) {
    fail(
      `Need at least ${mastery.minIndependentTotal} you_do items, found ${youDoItems.length}`,
    )
  }

  for (const kpId of mastery.requiredKpIds) {
    if (!kpIds.has(kpId)) fail(`mastery.requiredKpIds references unknown KP: ${kpId}`)
  }

  const coveredKps = new Set(youDoItems.flatMap((i) => i.kpIds))
  for (const kpId of mastery.requiredKpIds) {
    if (!coveredKps.has(kpId)) {
      warn(`required KP ${kpId} not covered by any you_do item`)
    }
  }
}

function validateUnlocks(pkg: LessonPackage): void {
  const unlockIds = new Set(pkg.unlocks.map((u) => u.id))
  const { worldIntegration } = pkg

  for (const key of [
    'unlockBlueprintId',
    'unlockRankId',
    'unlockZoneId',
  ] as const) {
    const id = worldIntegration[key]
    if (!unlockIds.has(id)) {
      fail(`worldIntegration.${key} (${id}) not found in unlocks`)
    }
  }

  if (!worldIntegration.terminalId) fail('worldIntegration.terminalId is required')

  for (const unlock of pkg.unlocks) {
    isLocalizedString(unlock.title, `unlocks[${unlock.id}].title`)
    isLocalizedString(unlock.description, `unlocks[${unlock.id}].description`)
  }
}

function main(): void {
  console.log(`Validating: ${packagePath}\n`)

  const pkg = loadPackage()
  validateTopLevel(pkg)
  const kpIds = validateKnowledgePoints(pkg)
  const itemMap = validateItems(pkg, kpIds)
  validatePhases(pkg, itemMap)
  validateMastery(pkg, itemMap, kpIds)
  validateUnlocks(pkg)

  if (warnings.length > 0) {
    console.log('Warnings:')
    warnings.forEach((w) => console.log(`  ⚠ ${w}`))
    console.log()
  }

  if (errors.length > 0) {
    console.error('FAILED\n')
    errors.forEach((e) => console.error(`  ✗ ${e}`))
    process.exit(1)
  }

  console.log('PASSED')
  console.log(`  Lesson: ${pkg.id} — ${pkg.title.en}`)
  console.log(`  Knowledge points: ${pkg.knowledgePoints.length}`)
  console.log(`  Items: ${pkg.items.length}`)
  console.log(`  Phases: ${pkg.phases.length}`)
  console.log(
    `  Mastery gate: ${pkg.mastery.minIndependentCorrect}/${pkg.mastery.minIndependentTotal} independent`,
  )
  console.log(`  Locales: ${LOCALES.join(', ')}`)
  console.log(`  Unlocks: ${pkg.unlocks.map((u) => u.id).join(', ')}`)
}

main()
