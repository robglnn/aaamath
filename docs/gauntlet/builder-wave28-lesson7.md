# Builder — Wave 28 Lesson 7 content

**Date:** 2026-08-05

**Trigger:** curriculum continuation after Lesson 6 (Variables on Both Sides). L6's complete-phase tutorScript already teased "next rung: inequalities." Follows wave-26 precedent: **content + minimal runtime registry**; GameView 3D deferred like W26 (W27 owns L6 props in parallel).

## Delivered

- Complete `content/lessons/algebra-i-07/package.json` — **Solving Linear Inequalities** (one-step / flip / two-step / verify).
- 4 atomic KPs, acyclic chain:
  - `kp.inequality.one-step` — x + b ? c, ax ? c with a > 0 (inverse ops, direction stays)
  - `kp.inequality.flip` — multiply/divide by a negative flips the sign
  - `kp.inequality.two-step` — undo constant, then coefficient; flip if coefficient negative
  - `kp.inequality.verify` — test boundary with equality + value inside the ray (solution-set membership)
- Cross-lesson prereqs (qualified refs, all resolve):
  - `algebra-i-05:kp.equation.two-step-mult-then-add` → one-step KP
  - `algebra-i-05:kp.equation.two-step-signed` → flip KP
  - `algebra-i-06:kp.equation.both-sides-isolate` → two-step KP
  - `algebra-i-06:kp.equation.both-sides-verify` → verify KP
- 12 items (2 i_do / 4 we_do / 4 you_do / 2 retrieval), mastery 3/4; every required KP covered by a `you_do` item. Full EN/ES/PL on every `LocalizedString`; `stemLatex`, choice `latex`, `workedSolutionLatex` throughout.
- **Answer keys (all distinct, 6 positive / 6 negative):** boundaries 7, −4, 5, −2, 4, −6, 9, −5, 3, 8, 6, −3.
- **MCQ correct positions mixed:** d, b, a, c, b, d, a, d, c, c (10 choice-bearing items; not all `a`).
- New distractor tags introduced alongside prior vocabulary: `flip-miss` (forgot to flip on negative ÷/×) and `false-flip` (flipped on add/subtract or positive ÷/×); plus `wrong-inverse`, `sign-slip`, `partial-solve`, `verify-skip`. **Every feedback string re-verified against its distractor's arithmetic** (W26 critic gap addressed at authoring time).
- IRT 1PL priors: items b spans −1.0 (retr.1) → +0.75 (youdo.4 verify); KP priors −0.2 / 0.1 / 0.4 / 0.6; difficulty aligned to phase (intro/guided/independent).
- Standards: 13-jurisdiction maps, three anchors — `7.EE.B.4` (one-step/flip), `7.EE.B.4` + `HSA.CED.A.1` (two-step), `6.EE.B.8` + `7.EE.B.4` (verify/solution-set). Best-effort per prior lessons (TX `7.11A`/`A.5B`, FL `MA.7.AR.2.2`/`MA.912.AR.2.6`, MN `7.2.4.1`).
- Phases with tutorScript + bodyLatex; narrative theme: Eta Threshold Gate (threshold, direction, inequality ray).
- Unlocks (new ids, collision-free vs L1–L6):
  - `bp.inequality.gate` (blueprint) — threshold gate
  - `rank.riser.marshal` (rank) — seventh rung: Initiate → Adept → Expert → Operator → Chief → Vanguard → **Marshal**
  - `zone.eta.gate` (zone) — Eta Threshold Gate (zone letters β→γ→δ→ε→ζ→**η**)
- `worldIntegration.terminalId`: `terminal.lesson7`
- Generator: `scripts/gen-lesson7-wave28.ts`

## Runtime wiring

- `src/content/loadLesson.ts`: import `lesson7`, export `LESSON_7_ID` + `lesson7`, add to `LESSONS`; `resolveTerminalLessonId` checks L6 mastered → L7 first, full chain L1→L7 preserved.
- `content/PIPELINE.md` lesson table + runtime loader note updated.
- **Deferred (like W26):** GameView 3D props for L7 unlocks — `App.tsx` `unlocked` entries (`bp.inequality.gate` / `rank.riser.marshal` / `zone.eta.gate` / `mastered7`) and in-world `terminal.lesson7` placement belong to the next 3D wave. Terminal routing, unlock application (`progress/store.ts` is data-driven), and `StandardsView` already work generically for L7.
- Untouched: game/ 3D files, L1–L6 packages, KaTeX defer, Vite `base: '/aaamath/'`.

## Validation

```bash
npm run content:validate   # 7/7 packages passed, no warnings
npm run build              # green (tsc -b && vite build && spa-fallback)
```

## Open items for the Critic / orchestrator

1. **Typed inequality answers.** `item.wedo.1`/`wedo.4` accept `x>5` / `x<-6` (+ reversed form `5<x`, `-6>x`); `item.retr.2` accepts `x<=-3` ASCII + `x≤-3` unicode. Engine normalization may need widening (e.g. `≥`/`<=` variants, whitespace) when L7 hits players.
2. **Standards audit** still owed course-wide — L7 codes are anchored but approximate, same flag as W24/W26.
3. **Verify item form.** `item.youdo.4` asks for a member of the solution set of `3x − 4 ≤ 20` rather than "check your own answer" — tests substitution + membership without a full solve; consistent with L5/L6 verify items.
4. **Retrieval spacing.** Both retrieval items are from L7 KPs; a future pass could pull one L5/L6 equation item for cross-lesson spacing (same note as W24).
5. **3D wave** (separate): `App.tsx` unlocked wiring + GameView props for the three L7 unlocks and `terminal.lesson7` placement.

No commit, per builder handoff convention (orchestrator ships).
