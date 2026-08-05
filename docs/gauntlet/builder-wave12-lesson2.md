# Builder — Wave 12 Lesson 2 content

**Date:** 2026-08-05

## Delivered

- Complete `content/lessons/algebra-i-02/package.json` — **Combining Like Terms**
- 3 lesson knowledge points: `kp.like-terms.identify`, `kp.like-terms.combine`, `kp.simplify.like-terms`
- Cross-lesson prerequisite KPs (`kp.variable.symbol`, `kp.orderops.with-vars`) embedded for graph validation only
- Phases: objectives, i_do (2), we_do (3), you_do (4), retrieval (1), complete
- Mastery: 3/4 independent; all three lesson KPs required
- Unlocks: `bp.pad.rail`, `rank.riser.adept`, `zone.beacon.cyan`
- `worldIntegration.terminalId`: `terminal.algebra`

## Content-only scope

Lesson 2 is **not wired into GameView** yet. The playable lesson in the range remains **algebra-i-01** (Lesson 1). L2 exists as validated content for the pipeline; runtime lesson selection / terminal routing to L2 is a follow-up integration task.

## Validation

```bash
npx tsx scripts/validate-content.ts content/lessons/algebra-i-02/package.json
```

→ PASSED (10 items, 6 phases, EN/ES/PL locales, 3 unlocks)

---

## Addendum — second-builder audit + pipeline infrastructure (2026-08-05)

### Provenance note

Two builders worked the same wave-12 brief concurrently (same pattern as waves 5 and 9). This builder's draft (5-KP atomic split: `kp.term.parts`, `kp.like-terms.identify`, `kp.combine.like-terms`, `kp.simplify.multi-var`, `kp.simplify.context`; unlocks `bp.bridge.span`/`zone.pad.gamma`) landed first; the version above replaced it on disk minutes later. Per the wave-9 precedent the on-disk version was **audited, not re-replaced**: all 10 items re-checked for math correctness (stems, answers, distractor tags), phase/mastery/unlock structure, and EN/ES/PL coverage. Math and structure are sound; the draft stays, with the fixes below applied in place.

### Fixes applied in place (PL localization only)

- Spelling: `zmieną` → `zmienną`; `w pierwszej potęgi` → `w pierwszej potędze`; `mają zmienne m` / `Zachowaj zmienne a` → `zmienną`.
- Lexicon: `niespodobnych wyrazów` (3×) → `wyrazów niepodobnych` (standard term; cf. "wyrazy podobne").
- Vocative: `Zasłużone, Adept.` → `Zasłużone, Adepcie.` (matches Lesson 1's "Inicjacie").
- Zone name: `Strefa Beacon Cyjan` (noun+noun clash) → `Strefa Cyjanowej Latarni` (all 4 occurrences).

### Pipeline infrastructure added (this builder's scope)

- `scripts/validate-content.ts` — no-arg `npm run content:validate` now discovers and validates **every** `content/lessons/*/package.json` (skips `_`-prefixed scratch dirs like the `_stub` example), reports per-package results, exits non-zero if any fail. Single-package arg mode unchanged. **2/2 packages passed.**
- `src/content/loadLesson.ts` — additive `lesson2` export + `LESSONS` registry; `loadLesson('algebra-i-02')` now resolves. `LESSON_ID`, `lesson1`, `getItem`, `getKp` untouched — the game still plays Lesson 1 exclusively; no `LessonOverlay`/`Hud`/`StandardsView` behavior change (verified: all consumers reference `LESSON_ID`/`lesson1`).
- `content/PIPELINE.md` — updated commands, lesson-package table, and the cross-package prerequisite note.

### Open items for the Critic / orchestrator

1. **Cross-lesson prerequisite representation.** The validator requires `prerequisites[]` to resolve inside the same package, so this draft embeds copies of Lesson 1 KPs (`kp.variable.symbol`, `kp.orderops.with-vars`) — real graph edges, but duplicated definitions that can drift from `algebra-i-01`. Alternative (rejected for now): external refs in `_pipelineMeta` only. Proper fix is validator/schema support for cross-package refs (`<lesson>:<kp>`); orchestrator decision.
2. **KP atomicity.** 3 lesson KPs vs. the handoff §4.2 atomic-KP bar (Lesson 1 has 5). Candidate split for a future pass: separate `simplify` into multi-variable and context/word-problem KPs.
3. **Standards audit (Item Author stage).** TX `A.12E` and FL `MA.6.AR.1.2`/`MA.912.AR.1.2` look off-target for combining like terms (FL equivalent-expressions is likely `MA.6.AR.1.4`); Lesson 1's own TX tags are approximate too. Needs a jurisdiction pass before ship.
4. **Retrieval depth.** 1 retrieval item vs. Lesson 1's 2; consider a second pull (evaluate-with-substitution) for spaced practice of `algebra-i-01` skills.
5. **`terminal.algebra` naming** differs from Lesson 1's `terminal.lesson1` convention; align when wiring world integration.

### Build status

`npm run content:validate` → 2/2 PASSED · `npm run build` → green (tsc + vite + spa-fallback). No commit (builder handoff).

---

## Addendum — third-builder authored package + merge conflict register (2026-08-05)

### Provenance

A third builder (this pass) was dispatched on the wave-12 brief while the working tree still showed the **skeleton stub** (`kp.stub.placeholder`, `_pipelineMeta` stage "Knowledge Point Spec"). The brief mandated: `id: lesson.algebra-i-02`, `courseId: course.algebra-i`, 3–4 atomic KPs with prereqs linking to Lesson 1 KP ids, 8–12 items, mastery ~3/4, one invented unlock, notes here, no commit. While this pass ran, the committed wave-12 package (`cb67008`) and its audit landed, and a **wave-13 builder began wiring L2 into the terminal against the committed package** (uncommitted working-tree changes to `loadLesson.ts`, `App.tsx`, `LessonOverlay.tsx` + `builder-wave13-wire-l2.md`).

This pass therefore did what the brief asked — replaced the on-disk stub-era file with its own fully authored package — and now registers the collision explicitly instead of silently reverting or silently overwriting. **The orchestrator must pick which L2 package ships.** Current disk state = this pass's package.

### Package on disk now (this pass)

- `id: lesson.algebra-i-02`, `courseId: course.algebra-i`, `order: 2` (per brief; `lesson.*` also matches the JSON-schema id pattern that `critic-lesson1-content.md` flagged L1 for missing).
- 4 atomic KPs, acyclic chain: `kp.term.structure` → `kp.combine.like-terms` → `kp.combine.constants-signed` → `kp.simplify.multi-var-expression`. **No embedded duplicate L1 KPs** — cross-lesson edge is one qualified ref `algebra-i-01:kp.variable.symbol` on `kp.term.structure` (validator warns, does not fail; resolves open item #1 above without definition drift).
- 12 items (2 i_do / 4 we_do / 4 you_do / 2 retrieval — resolves open item #4), all with KaTeX `stemLatex`/choice `latex`/`workedSolutionLatex`, diagnostic distractor tags, full EN/ES/PL translations.
- Mastery 3/4; every required KP covered by a you_do item (zero validator warnings there).
- Standards: 13-jurisdiction maps derived from Lesson 1's anchor pattern — parts-of-expression `6.EE.A.2b`+`HSA.SSE.A.1`; combining `6.EE.A.3`+`7.EE.A.1`; multi-variable `7.EE.A.1`+`HSA.SSE.A.2`. FL combining tag uses `MA.6.AR.1.4` (matches the audit's own suggestion in open item #3). Same ADR-004 best-effort honesty: representative, not audited.
- Unlocks: **`bp.pad.rail`** (the invented small unlock — slim pad-edge rail blueprint accent), `rank.riser.adept`, `zone.beta.annex`; `worldIntegration.terminalId: terminal.lesson2`. Declared per schema, **not wired into the game store**, per brief.

### Merge conflict register (orchestrator decision required)

| Field | Committed `cb67008` package | On-disk package (this pass) | Wave-13 working tree expects |
|---|---|---|---|
| Package id | `algebra-i-02` | `lesson.algebra-i-02` | `LESSON_2_ID = 'algebra-i-02'` |
| KPs | 3 lesson KPs + 2 embedded L1 KP copies | 4 lesson KPs + 1 qualified cross-ref | — |
| Items | 10 (1 retrieval) | 12 (2 retrieval) | — |
| Zone unlock | `zone.beacon.cyan` | `zone.beta.annex` | records `zone.beacon.cyan` (non-fatal: GameView flags not extended for L2) |
| Terminal id | `terminal.algebra` | `terminal.lesson2` | — |

**Hard break if shipped as-is together:** wave-13's `LESSONS` registry keys by package id, so with the on-disk package `resolveTerminalLessonId()` returns `'algebra-i-02'` → `loadLesson` → `null` after L1 mastery. One-line fixes, either side: change wave-13's `LESSON_2_ID` to `'lesson.algebra-i-02'`, or revert the package id to `algebra-i-02`. This pass did **not** touch the sibling's uncommitted wiring files.

**Also drifts if this package is adopted:** commit `b08e0cf` documented the committed package's KP ids in `memory-bank/` — those need a refresh.

### Validation evidence (this pass)

- `npx tsx scripts/validate-content.ts content/lessons/algebra-i-02/package.json` → **PASSED** (4 KPs, 12 items, 6 phases, gate 3/4, unlocks `bp.pad.rail`, `rank.riser.adept`, `zone.beta.annex`; 1 documented warning for the cross-lesson prereq qualifier).
- `npx tsx scripts/validate-content.ts` → **2/2 packages passed**; Lesson 1 untouched and green.
- `npm run build` → green (tsc + vite + spa-fallback) with the wave-13 working tree present.

No commit, per brief.

---

## Reconciliation — end-of-night ground truth (second-builder pass, final)

State after commits `cb67008`, `b08e0cf`, `96b6fb3`, `cec889c`:

- **The registered hard break is resolved on the package-id side.** The on-disk package now carries `id: "algebra-i-02"`, matching wave-13's committed `LESSON_2_ID`; `resolveTerminalLessonId()` → `loadLesson('algebra-i-02')` resolves the on-disk package after L1 mastery. (Earlier in the night this builder also slug-keyed the `LESSONS` registry as a belt-and-braces fix; the wave-13 commit superseded it with package-id keys. Fine while ids equal slugs — if the `lesson.*` id convention is adopted later, re-add slug aliases. Noted in `content/PIPELINE.md`.)
- **Qualified cross-lesson refs are now first-class in the validator** (this pass, `scripts/validate-content.ts`, uncommitted): `prerequisites[]` entries of the form `<lesson-slug>:<kp-id>` are resolved against `content/lessons/<slug>/package.json` and **fail** validation if the lesson or KP is missing. This supersedes the "1 documented warning" note in the third addendum and closes open item #1 from the second addendum. `npm run content:validate` → 2/2, **zero warnings**. The on-disk package's `_pipelineMeta.notes` was updated to match.
- **Lint clean.** Removed a newly-unused `KnowledgePoint` import in the validator; fixed a pre-existing `no-var` error on the committed `src/vite-env.d.ts` (`declare var` → `declare const`, type-only ambient declaration, no runtime effect).
- **PL localization.** The on-disk (4-KP) package internalized the PL fixes from the second addendum (`zmienną`, `wyrazy niepodobne`, `Adepcie`, standard "redukcja wyrazów podobnych" terminology); a grep sweep finds none of the flagged defects. The committed (3-KP) package still carries them if the orchestrator reverts that way — the fix list above stands ready.

### Remaining orchestrator decisions (unchanged, now sharper)

1. **Which L2 package ships.** Committed `cb67008` (3 KPs + 2 embedded L1-KP copies, `zone.beacon.cyan`, `terminal.algebra`) vs. on-disk (4 KPs, 1 qualified cross-ref, 12 items, `zone.beta.annex`, `terminal.lesson2`, `_pipelineMeta`). Both validate; the on-disk version resolves the atomicity, retrieval-depth, and terminal-naming open items.
2. **Zone unlock id mismatch.** Wave-13's committed wiring does not extend GameView unlock flags for L2 zones (declared non-fatal), but if the on-disk package ships, anything referencing `zone.beacon.cyan` from the committed package's consumers/docs needs a sweep.
3. **Memory bank.** `b08e0cf` documented the committed package's KP ids; refresh if the on-disk 4-KP set is adopted.
4. **Standards audit** still owed (Item Author stage): the on-disk package adopts `MA.6.AR.1.4` for FL combining per the second addendum's suggestion; TX codes remain approximate in both versions.

### Final verification (this pass)

- `npm run content:validate` → **2/2 PASSED, 0 warnings** (multi-package discovery is this pass's validator change; single-package arg mode unchanged).
- `npm run lint` → clean.
- `npm run build` → green (tsc + vite + spa-fallback), with the on-disk package and the committed wave-13 wiring together.

No commit, per brief.
