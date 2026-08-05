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
| `algebra-i-03` | Draft on disk | Distributive property (expand, negative factors, distribute-then-combine, factor GCF); pending Critic stage + runtime wiring (see `docs/gauntlet/builder-wave20-lesson3.md`) |

Cross-lesson prerequisite links use qualified refs in `prerequisites[]`, e.g. `"algebra-i-01:kp.variable.symbol"`. The validator resolves `<lesson-slug>:<kp-id>` against `content/lessons/<slug>/package.json` and **fails** if the lesson package or KP is missing. Plain `kp.*` refs must still resolve inside the same package.

## Schema

`content/schema/content-schema.v1.json` — JSON Schema draft-07 for `LessonPackage` (see `src/content/types.ts`).

## Runtime loader

`src/content/loadLesson.ts` exports `lesson1`/`lesson2`, the `LESSONS` registry (keyed by package id), `resolveTerminalLessonId` (terminal routes to L2 after L1 mastery), and helpers `t`, `getItem`, `getKp` (search all packaged lessons). Note: registry keys follow each package's `id` field — if a future package adopts the `lesson.*` id convention, add directory-slug aliases to `LESSONS`.
