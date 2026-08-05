# Builder — Wave 22 Lesson 4 content

**Date:** 2026-08-05

**Trigger:** curriculum continuation after Lesson 3 (Distributive Property). Follows wave-20 (L3 content) and wave-21 (L3 wiring) precedent: this wave ships **content + minimal runtime registry**.

## Delivered

- Complete `content/lessons/algebra-i-04/package.json` — **Solving One-Step Equations** (natural next skill after distributing).
- 4 atomic knowledge points, acyclic chain:
  - `kp.equation.one-step-addsub` — x + a = b / x − a = b via inverse add/sub
  - `kp.equation.one-step-multdiv` — ax = b / x/a = b via inverse mult/div
  - `kp.equation.one-step-signed` — negative coefficients and double negatives
  - `kp.equation.one-step-verify` — verify solution by substitution (chosen over fractional-reciprocal KP for stronger early pedagogy)
- Cross-lesson prerequisites use **qualified refs**:
  - `algebra-i-02:kp.combine.constants-signed` + `algebra-i-03:kp.distribute.basic` → `kp.equation.one-step-addsub`
  - `algebra-i-01:kp.orderops.with-vars` → `kp.equation.one-step-multdiv`
  - `algebra-i-02:kp.combine.constants-signed` → `kp.equation.one-step-signed`
- 12 items (2 i_do / 4 we_do / 4 you_do / 2 retrieval), matching L2/L3 shape. All items carry `stemLatex`, choice `latex`, `workedSolutionLatex`, diagnostic distractor tags (`wrong-inverse`, `partial-solve`, `divide-not-multiply`, `reciprocal-confusion`, `sign-slip`, `verify-skip`), IRT 1PL priors (b spans -1.2 retrieval → +0.8 verify), and difficulty aligned to phase.
- `item.wedo.4` bridges L3 vocabulary: a pre-simplified `x + (-5) = 3` after a splitter expanded a pad equation — still one-step add/sub with signed constant.
- Phases: objectives, i_do, we_do, you_do, retrieval, complete — each with localized title/body/tutorScript and KaTeX `bodyLatex` model lines. Narrative theme: balancing / isolating charge on both sides of a relay equation (balance beam).
- Mastery gate: **3/4 independent**; every required KP covered by a `you_do` item.
- Standards: 13-jurisdiction maps anchored on one-step equation cluster `6.EE.B.7` + `8.EE.C.7`; TX uses `A.5A` + `6.10B`; FL uses `MA.6.AR.2.3` + `MA.8.AR.2.1`. Best-effort honesty as L1–L3.
- Full EN/ES/PL localization on every `LocalizedString`.
- Unlocks (new ids, collision-free against L1–L3 and `src/`):
  - `bp.balance.beam` (blueprint) — balance beam for relay equations
  - `rank.riser.operator` (rank) — fourth rung: Initiate → Adept → Expert → Operator
  - `zone.delta.balance` (zone) — Delta Balance Yard calibration outpost
- `worldIntegration.terminalId`: `terminal.lesson4`
- `content/PIPELINE.md` lesson table updated with L4 row.

## Runtime wiring (minimal, this wave)

- `src/content/loadLesson.ts`: import `lesson4`, export `LESSON_4_ID` + `lesson4`, add to `LESSONS` registry.
- `resolveTerminalLessonId`: L3 mastered → L4; else L2 mastered → L3; else L1 mastered → L2; else L1.
- **Deferred** (wave-20→21 pattern): GameView 3D props for L4 unlocks, in-world `terminal.lesson4` placement, HUD display strings.

## Validation

```bash
npm run content:validate
```

→ **4/4 packages passed, 0 warnings** (expected after this wave).

## Open items for the Critic / orchestrator

1. **Standards audit** still owed course-wide: jurisdiction codes are anchored but approximate.
2. **Verify item form.** `item.youdo.4` tests substitution on `2x + 1 = 9` (two operations to solve, one to verify) — pedagogically sound for the verify KP but critic may prefer a strictly one-operation equation for verification only.
3. **Retrieval spread.** Both retrieval items are addsub/multdiv from this lesson; a future pass could pull one L3 distribute item for cross-lesson spacing.
4. **GameView wiring wave** (separate): place `terminal.lesson4`, surface `bp.balance.beam` / `rank.riser.operator` / `zone.delta.balance` props.
5. **Short-answer normalization.** `item.wedo.1` / `item.wedo.4` accept `11` or `x=11`; engine may need broader normalization when lesson overlay is wired to L4.

No commit, per builder handoff convention.

## Critic polish pass

- **Answer-key spread** — varied six items that clustered on x = 7 or x = 11 so independent/retrieval keys are now spread (anchors kept: `ido.1` = 7, `wedo.1` = 11, `youdo.4` verify = 4):
  - `youdo.1`: `x + 6 = 19` → **13**
  - `youdo.2`: `6x = 48` → **8**
  - `youdo.3`: `x − (−4) = 13` → **9**
  - `wedo.4`: `x + (−5) = 3` → **8**
  - `retr.1`: `x + 4 = 19` → **15**
  - `retr.2`: `9x = 54` → **6**
- **Standards** — added `CCSS.MATH.CONTENT.6.EE.B.5` (and mirrored jurisdiction codes) to `kp.equation.one-step-verify` and `item.youdo.4`.
- **Verify KP wording** — `successCriteria` now says “linear equation” instead of “one-step equation” (verify item stem is two-step to check).
- All stems, choices, `acceptableAnswers`, worked solutions, and feedback strings updated for consistency; IRT/difficulty/KP wiring unchanged.
