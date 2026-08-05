/**
 * Emits a minimal lesson skeleton for pipeline stage 1–2 output.
 *
 * Pipeline stages (docs/handoff.md §9):
 *  1. Curriculum Architect — course goals → ordered lessons + KP coverage
 *  2. Knowledge Point Spec — atomic KP defs, prereqs, success criteria, misconceptions
 *  3. Lesson Designer — explicit teach script, I/We/You phases, cognitive-load notes
 *  4. Item Author — tagged items with distractors and IRT priors
 *  5. Pedagogy Critic / Gauntlet — explicit-teaching + mastery review
 *  6. Localization — EN/ES/PL with mathematical fidelity
 *  7. Integration — package.json + world unlock wiring
 *
 * Usage:
 *   npx tsx scripts/generate-lesson-stub.ts
 *   npx tsx scripts/generate-lesson-stub.ts --out content/lessons/_stub/package.json
 *   npx tsx scripts/generate-lesson-stub.ts --lesson-id algebra-i-02 --order 2
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

interface StubOptions {
  lessonSlug: string
  order: number
  outPath: string | null
}

function parseArgs(): StubOptions {
  const args = process.argv.slice(2)
  let lessonSlug = 'algebra-i-stub'
  let order = 99
  let outPath: string | null = null

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === '--out' && args[i + 1]) {
      outPath = resolve(args[++i])
    } else if (arg === '--lesson-id' && args[i + 1]) {
      lessonSlug = args[++i]
    } else if (arg === '--order' && args[i + 1]) {
      order = Number(args[++i])
    }
  }

  return { lessonSlug, order, outPath }
}

function loc(en: string): { en: string; es: string; pl: string } {
  return {
    en,
    es: `[ES TODO] ${en}`,
    pl: `[PL TODO] ${en}`,
  }
}

function buildStub(opts: StubOptions) {
  const lessonId = `lesson.${opts.lessonSlug}`
  const kpId = 'kp.stub.placeholder'

  return {
    schemaVersion: '1.0.0' as const,
    id: lessonId,
    courseId: 'course.algebra-i',
    order: opts.order,
    title: loc('Lesson Title (stub)'),
    objectives: [loc('State the lesson objective here.')],
    knowledgePointIds: [kpId],
    knowledgePoints: [
      {
        id: kpId,
        title: loc('Placeholder knowledge point'),
        description: loc('Atomic skill description — replace via KP Spec stage.'),
        prerequisites: [],
        successCriteria: loc('Learner can demonstrate the skill on independent items.'),
        misconceptions: [loc('Common error pattern to diagnose.')],
        standards: {
          CCSS: ['CCSS.MATH.CONTENT.HSA-SSE.A.1'],
        },
        irtPriors: { a: 1.0, b: 0.0 },
        srDefaults: {
          initialIntervalDays: 1,
          easeFactor: 2.5,
          masteryThreshold: 0.85,
        },
      },
    ],
    phases: [
      {
        id: 'phase-objectives',
        kind: 'objectives' as const,
        title: loc('Objectives'),
        body: loc('What you will learn and how success is measured.'),
        itemIds: [],
        tutorScript: loc('Welcome. Today we will…'),
      },
      {
        id: 'phase-i-do',
        kind: 'i_do' as const,
        title: loc('I Do — Worked Example'),
        body: loc('Teacher models the skill with think-aloud.'),
        bodyLatex: ['x + 3'],
        itemIds: [],
        tutorScript: loc('Watch how I translate this phrase step by step.'),
      },
      {
        id: 'phase-we-do',
        kind: 'we_do' as const,
        title: loc('We Do — Guided Practice'),
        body: loc('Try with immediate feedback.'),
        itemIds: ['item-stub-01'],
        tutorScript: loc('Your turn — I will help if you get stuck.'),
      },
      {
        id: 'phase-you-do',
        kind: 'you_do' as const,
        title: loc('You Do — Independent Practice'),
        body: loc('Demonstrate mastery without scaffolding.'),
        itemIds: ['item-stub-02'],
        tutorScript: loc('Show what you can do on your own.'),
      },
      {
        id: 'phase-retrieval',
        kind: 'retrieval' as const,
        title: loc('Retrieval Check'),
        body: loc('Quick prerequisite refresh.'),
        itemIds: [],
        tutorScript: loc('Before we finish, let us warm up prior skills.'),
      },
      {
        id: 'phase-complete',
        kind: 'complete' as const,
        title: loc('Complete'),
        body: loc('Lesson complete — world unlocks apply.'),
        itemIds: [],
        tutorScript: loc('Excellent work. New build options are now available.'),
      },
    ],
    items: [
      {
        id: 'item-stub-01',
        kpIds: [kpId],
        phase: 'we_do' as const,
        type: 'mcq' as const,
        stem: loc('Stub guided item — replace in Item Author stage.'),
        stemLatex: '2 + 2',
        choices: [
          {
            id: 'a',
            text: loc('3'),
            isCorrect: false,
            diagnosticTag: 'miscount',
            feedback: loc('Count again carefully.'),
          },
          {
            id: 'b',
            text: loc('4'),
            isCorrect: true,
            feedback: loc('Correct.'),
          },
        ],
        workedSolution: loc('2 + 2 = 4'),
        workedSolutionLatex: '2 + 2 = 4',
        standards: { CCSS: ['CCSS.MATH.CONTENT.HSA-SSE.A.1'] },
        irtPriors: { a: 1.0, b: -1.0 },
        difficulty: 'guided' as const,
      },
      {
        id: 'item-stub-02',
        kpIds: [kpId],
        phase: 'you_do' as const,
        type: 'short' as const,
        stem: loc('Stub independent item.'),
        answer: '4',
        acceptableAnswers: ['4'],
        workedSolution: loc('4'),
        standards: { CCSS: ['CCSS.MATH.CONTENT.HSA-SSE.A.1'] },
        irtPriors: { a: 1.0, b: 0.0 },
        difficulty: 'independent' as const,
      },
    ],
    mastery: {
      minIndependentCorrect: 1,
      minIndependentTotal: 1,
      requiredKpIds: [kpId],
    },
    unlocks: [
      {
        id: 'bp.stub.placeholder',
        kind: 'blueprint' as const,
        title: loc('Stub blueprint'),
        description: loc('Replace with real world unlock.'),
      },
      {
        id: 'rank.stub.placeholder',
        kind: 'rank' as const,
        title: loc('Stub rank'),
        description: loc('Replace with real rank promotion.'),
      },
      {
        id: 'zone.stub.placeholder',
        kind: 'zone' as const,
        title: loc('Stub zone'),
        description: loc('Replace with real zone unlock.'),
      },
    ],
    worldIntegration: {
      terminalId: 'terminal.stub',
      unlockBlueprintId: 'bp.stub.placeholder',
      unlockRankId: 'rank.stub.placeholder',
      unlockZoneId: 'zone.stub.placeholder',
    },
    _pipelineMeta: {
      stage: 'Knowledge Point Spec (skeleton)',
      generatedAt: new Date().toISOString(),
      nextStages: [
        'Lesson Designer',
        'Item Author',
        'Pedagogy Critic',
        'Localization',
        'Integration',
      ],
    },
  }
}

function main(): void {
  const opts = parseArgs()
  const stub = buildStub(opts)
  const json = JSON.stringify(stub, null, 2)

  if (opts.outPath) {
    mkdirSync(dirname(opts.outPath), { recursive: true })
    writeFileSync(opts.outPath, json, 'utf8')
    console.log(`Wrote stub to ${opts.outPath}`)
  } else {
    console.log(json)
  }
}

main()
