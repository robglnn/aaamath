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
| `algebra-i-01` | Shipped in game | Variables, expressions, evaluation; L1 3D unlocks |
| `algebra-i-02` | Shipped in game | Combining like terms; L2 3D unlocks (rails / adept / annex) |
| `algebra-i-03` | Shipped in game | Distributive property; L3 3D unlocks (splitter / Expert / Gamma Relay) — see `builder-wave21-l3-3d.md` |
| `algebra-i-04` | Shipped in game | Solving one-step equations; L4 3D unlocks (beam / Operator / Delta Balance) — see `builder-wave22-lesson4.md`, `builder-wave23-l4-3d.md` |
| `algebra-i-05` | Shipped in game | Solving two-step equations; L5 3D unlocks (calibrator / Chief / Epsilon) — see `builder-wave24-lesson5.md`, `builder-wave25-l5-3d.md` |
| `algebra-i-06` | Shipped in game (content + terminal) | Variables on both sides; GameView 3D props deferred — see `builder-wave26-lesson6.md` |
| `algebra-i-07` | Shipped in game (content + terminal) | Solving linear inequalities; GameView 3D props deferred — see `builder-wave28-lesson7.md` |

Cross-lesson prerequisite links use qualified refs in `prerequisites[]`, e.g. `"algebra-i-01:kp.variable.symbol"`. The validator resolves `<lesson-slug>:<kp-id>` against `content/lessons/<slug>/package.json` and **fails** if the lesson package or KP is missing. Plain `kp.*` refs must still resolve inside the same package.

## Schema

`content/schema/content-schema.v1.json` — JSON Schema draft-07 for `LessonPackage` (see `src/content/types.ts`).

## Runtime loader

`src/content/loadLesson.ts` exports `lesson1`–`lesson7`, the `LESSONS` registry (keyed by package id), `resolveTerminalLessonId` (terminal routes to L2→L3→L4→L5→L6→L7 after prior mastery), and helpers `t`, `getItem`, `getKp` (search all packaged lessons). Note: registry keys follow each package's `id` field — if a future package adopts the `lesson.*` id convention, add directory-slug aliases to `LESSONS`.
