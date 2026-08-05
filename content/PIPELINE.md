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
# Validate all lesson packages under content/lessons/ (skips _-prefixed scratch dirs)
npm run content:validate

# Validate one package explicitly
npx tsx scripts/validate-content.ts content/lessons/algebra-i-02/package.json

# Emit pipeline skeleton (stdout or file)
npx tsx scripts/generate-lesson-stub.ts
npx tsx scripts/generate-lesson-stub.ts --lesson-id algebra-i-03 --order 3 --out content/lessons/algebra-i-03/package.json

# Both
npm run content:pipeline
```

## Lesson packages

| Package | Status | Notes |
|---------|--------|-------|
| `algebra-i-01` | Shipped in game | Variables, expressions, evaluation |
| `algebra-i-02` | Draft on disk | Combining like terms / simplifying; pending Item Author + Critic stages (see `docs/gauntlet/builder-wave12-lesson2.md`) |

Cross-lesson prerequisite links (e.g. lesson 2 KPs building on lesson 1 KPs) are recorded in each package's `_pipelineMeta.externalPrerequisites`; the validator requires `prerequisites[]` refs to resolve inside the same package, so graph stitching across packages is a future pipeline step.

## Schema

`content/schema/content-schema.v1.json` — JSON Schema draft-07 for `LessonPackage` (see `src/content/types.ts`).

## Runtime loader

`src/content/loadLesson.ts` exports `lesson1` and helpers `t`, `getItem`, `getKp`.
