# Builder — Wave 20 Lesson 3 content

**Date:** 2026-08-05

**Trigger:** critic-wave19 — visual AAA near plateau; switch to curriculum. Follows the wave-12 (L2 content) and wave-13 (L2 wiring) precedent: this wave is **content-only**.

## Delivered

- Complete `content/lessons/algebra-i-03/package.json` — **The Distributive Property** (natural next skill after Combining Like Terms).
- 4 atomic knowledge points, acyclic chain:
  - `kp.distribute.basic` — a(b + c) = ab + ac with a positive factor
  - `kp.distribute.negative-factor` — negative factors and the leading-minus-as-(-1) convention
  - `kp.distribute.then-combine` — expand first, then combine like terms (bridges L2 → L3)
  - `kp.factor.common` — reverse direction: factor out the GCF, verify by distributing back
- Cross-lesson prerequisites use **qualified refs only** (no embedded KP copies):
  - `algebra-i-02:kp.term.structure`, `algebra-i-01:kp.orderops.with-vars` → `kp.distribute.basic`
  - `algebra-i-02:kp.combine.constants-signed` → `kp.distribute.negative-factor`
  - `algebra-i-02:kp.combine.like-terms` + `algebra-i-02:kp.combine.constants-signed` → `kp.distribute.then-combine`
- 12 items (2 i_do / 4 we_do / 4 you_do / 2 retrieval), matching the L2 shape. All items carry `stemLatex`, choice `latex`, `workedSolutionLatex` (KaTeX), diagnostic distractor tags (`partial-distribute`, `skip-first`, `factor-add`, `sign-slip`, `second-sign`, `first-sign`, `drop-minus`, `const-sign`, `partial-combine`, `collapse`), IRT 1PL priors (b spans -1.2 retrieval → +0.8 factor), and difficulty aligned to phase.
- Phases: objectives, i_do, we_do, you_do, retrieval, complete — each with localized title/body/tutorScript and KaTeX `bodyLatex` model lines. Narrative theme: expanding/splitting charge (the inverse of L2's "compressing blueprints").
- Mastery gate: **3/4 independent**; every required KP is covered by a `you_do` item (zero validator warnings).
- Standards: 13-jurisdiction maps (CCSS/CA/NJ/MI/TX/NY/IL/MO/FL/WA/DC/OH/MN) anchored on the equivalent-expressions cluster `6.EE.A.3` + `7.EE.A.1`; TX uses `A.10D` (the distributive-property TEKS) + `A.10A`; FL uses `MA.6.AR.1.4` + `MA.7.AR.1.1`. Same best-effort honesty as L1/L2 — representative, not audited.
- Full EN/ES/PL localization on every `LocalizedString`.
- Unlocks (new ids, verified collision-free against L1/L2 packages and `src/`):
  - `bp.relay.splitter` (blueprint) — charge splitter
  - `rank.riser.expert` (rank) — third rung: Initiate → Adept → Expert
  - `zone.gamma.relay` (zone) — relay outpost on the Gamma approach
- `worldIntegration.terminalId`: `terminal.lesson3` (follows `terminal.lesson1`/`terminal.lesson2` convention).
- `content/PIPELINE.md` lesson table updated with the L3 row.

## Content-only scope

Lesson 3 is **not wired into the runtime** — `src/content/loadLesson.ts`, terminal routing, and GameView unlock flags are untouched (no `src/` changes this wave). Wiring is a follow-up wave, mirroring wave-13 for L2: add `lesson3` export + `LESSONS` registry entry, extend `resolveTerminalLessonId`, place `terminal.lesson3` in-world, and surface `bp.relay.splitter` / `rank.riser.expert` / `zone.gamma.relay` props.

Validator discovery needed **no changes**: `scripts/validate-content.ts` enumerates `content/lessons/*/package.json` via `readdirSync` (skipping `_`-prefixed dirs), so `algebra-i-03` was picked up automatically (requirement 7 verified).

## Validation

```bash
npm run content:validate
```

→ **3/3 packages passed, 0 warnings** (L1 + L2 untouched and green; L3: 4 KPs, 12 items, 6 phases, gate 3/4, unlocks `bp.relay.splitter`, `rank.riser.expert`, `zone.gamma.relay`).

## Open items for the Critic / orchestrator

1. **Standards audit** still owed course-wide (inherited from wave-12 open item): jurisdiction codes are anchored but approximate.
2. **Retrieval spread.** Both retrieval items pull `kp.distribute.basic`; a future pass could pull one L2 skill (`algebra-i-02` combining) for cross-lesson spacing.
3. **Factor item answer matching.** `item.youdo.4` (factor GCF) uses a fixed `acceptableAnswers` list; commutative/reordered forms beyond those listed (e.g. `4(3+x)`) are not accepted — consider normalizing in the lesson engine when wired.
4. **Wiring wave** (separate, per wave-13 pattern): `loadLesson` registry, terminal routing, GameView flags, in-world placement for `terminal.lesson3`, and HUD display strings for the three new unlock ids.

No commit, per builder handoff convention.
