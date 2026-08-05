# Builder — Wave 24 Lesson 5 content

**Date:** 2026-08-05

**Trigger:** curriculum continuation after Lesson 4 (One-Step Equations). Follows wave-22 (L4 content) and wave-23 (L4 3D props in parallel) precedent: this wave ships **content + minimal runtime registry**.

## Delivered

- Complete `content/lessons/algebra-i-05/package.json` — **Solving Two-Step Equations** (natural next skill after one-step isolation).
- 4 atomic knowledge points, acyclic chain:
  - `kp.equation.two-step-add-then-mult` — x/a + b = c: undo add/sub, then mult/div
  - `kp.equation.two-step-mult-then-add` — ax + b = c: undo add/sub, then divide by coefficient
  - `kp.equation.two-step-signed` — negative coefficients and rearranged terms in two-step
  - `kp.equation.two-step-verify` — verify two-step solution by substitution (chosen over parentheses — see below)
- Cross-lesson prerequisites use **qualified refs** from L4:
  - `algebra-i-04:kp.equation.one-step-addsub` + `algebra-i-04:kp.equation.one-step-multdiv` → add-then-mult KP
  - Same L4 one-step KPs → mult-then-add KP (after add-then-mult in-package)
  - `algebra-i-04:kp.equation.one-step-signed` → signed KP
  - `algebra-i-04:kp.equation.one-step-verify` → verify KP
- 12 items (2 i_do / 4 we_do / 4 you_do / 2 retrieval), matching L2–L4 shape. All items carry `stemLatex`, choice `latex`, `workedSolutionLatex`, diagnostic distractor tags (`wrong-inverse`, `wrong-order`, `partial-solve`, `sign-slip`, `verify-skip`), IRT 1PL priors (b spans −1.1 retrieval → +0.8 verify), and difficulty aligned to phase.
- **Fourth KP choice:** `kp.equation.two-step-verify` over `kp.equation.two-step-parentheses`. Parentheses would pull L3 distribute into a three-operation flow and blur the core two-step inverse-order lesson; L4 already introduced verify-by-substitution — L5 extends it to genuine two-step equations (`3x − 7 = 14`).
- Phases: objectives, i_do, we_do, you_do, retrieval, complete — each with localized title/body/tutorScript and KaTeX `bodyLatex` model lines. Narrative theme: two-step balance-beam calibration (sequence after L4 balance yard).
- Mastery gate: **3/4 independent**; every required KP covered by a `you_do` item.
- Standards: 13-jurisdiction maps anchored on two-step cluster `7.EE.B.4` + `8.EE.C.7`; TX uses `A.5A` + `7.11A`; FL uses `MA.7.AR.2.2` + `MA.8.AR.2.1`. Verify KP/item also carry `6.EE.B.5` family.
- Full EN/ES/PL localization on every `LocalizedString`.
- **Answer-key spread** (W22 critic gap addressed): independent keys **36, 6, −5, 7** (verify); retrieval **25, 3** — no clustering on 2–3 values.
- Unlocks (new ids, collision-free against L1–L4 and `src/`):
  - `bp.balance.calibrator` (blueprint) — dual-dial calibrator for two-step beams
  - `rank.riser.chief` (rank) — fifth rung: Initiate → Adept → Expert → Operator → Chief
  - `zone.epsilon.cal` (zone) — Epsilon Calibration Forge
- `worldIntegration.terminalId`: `terminal.lesson5`
- `content/PIPELINE.md` lesson table updated with L5 row.

## Runtime wiring (minimal, this wave)

- `src/content/loadLesson.ts`: import `lesson5`, export `LESSON_5_ID` + `lesson5`, add to `LESSONS` registry.
- `resolveTerminalLessonId`: L4 mastered → L5; else L3 mastered → L4; else L2 → L3; else L1 → L2; else L1.
- **Deferred** (wave-20→21 pattern): GameView 3D props for L5 unlocks, in-world `terminal.lesson5` placement, HUD display strings. Wave 23 owns L4 props in parallel.

## Validation

```bash
npm run content:validate
npm run build
```

→ **5/5 packages passed**; build green with `base: '/aaamath/'`.

## Open items for the Critic / orchestrator

1. **Standards audit** still owed course-wide: jurisdiction codes are anchored but approximate (TX `7.11A`, FL `MA.7.AR.2.2` are best-effort).
2. **Verify item form.** `item.youdo.4` tests substitution on `3x − 7 = 14` — students can verify without fully solving; pedagogically sound for the verify KP.
3. **Retrieval spread.** Both retrieval items are from this lesson's two-step KPs; a future pass could pull one L4 one-step item for cross-lesson spacing.
4. **GameView wiring wave** (separate): place `terminal.lesson5`, surface `bp.balance.calibrator` / `rank.riser.chief` / `zone.epsilon.cal` props.
5. **Short-answer normalization.** `item.wedo.1`, `item.wedo.4`, `item.retr.2` accept bare integer or `x=N`; engine may need broader normalization when lesson overlay is wired to L5.
6. **Generator script.** `scripts/gen-lesson5-wave24.ts` was used to emit the package; can be deleted after critic sign-off or kept for regeneration.

No commit, per builder handoff convention.
