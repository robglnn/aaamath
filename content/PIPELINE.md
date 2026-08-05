# Content Generation Pipeline

Repeatable stages for producing lesson packages (`content/lessons/<slug>/package.json`). Full vision: `docs/handoff.md` §9.

| Stage | Agent role | Output |
|-------|------------|--------|
| 1. Curriculum Architect | Order lessons, assign KP coverage | Lesson outline + `knowledgePointIds` |
| 2. Knowledge Point Spec | Atomic skills, prereqs, misconceptions | `knowledgePoints[]` with standards + IRT/SR defaults |
| 3. Lesson Designer | Groshell I/We/You sequence | `phases[]` with `tutorScript`, `bodyLatex` |
| 4. Item Author | Tagged items + diagnostic distractors | `items[]` (mcq, short, evaluate, translate) |
| 5. Pedagogy Critic | Gauntlet pass/fail | Critic report in `docs/gauntlet/` |
| 6. Localization | EN / ES / PL fidelity | All `LocalizedString` fields complete |
| 7. Integration | Game wiring | `mastery`, `unlocks`, `worldIntegration` |

## Commands

```bash
# Validate a lesson package (default: algebra-i-01)
npx tsx scripts/validate-content.ts

# Emit pipeline skeleton (stdout or file)
npx tsx scripts/generate-lesson-stub.ts
npx tsx scripts/generate-lesson-stub.ts --out content/lessons/_stub/package.json

# Both
npm run content:pipeline
```

## Schema

`content/schema/content-schema.v1.json` — JSON Schema draft-07 for `LessonPackage` (see `src/content/types.ts`).

## Runtime loader

`src/content/loadLesson.ts` exports `lesson1` and helpers `t`, `getItem`, `getKp`.
