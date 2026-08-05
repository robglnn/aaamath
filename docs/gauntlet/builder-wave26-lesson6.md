# Builder — Wave 26 Lesson 6 content

**Date:** 2026-08-05

**Trigger:** curriculum continuation after Lesson 5 (Two-Step Equations). Follows wave-22/24 precedent: **content + minimal runtime registry**.

## Delivered

- Complete `content/lessons/algebra-i-06/package.json` — **Equations with Variables on Both Sides**.
- 4 atomic KPs:
  - `kp.equation.both-sides-collect`
  - `kp.equation.both-sides-isolate`
  - `kp.equation.both-sides-signed`
  - `kp.equation.both-sides-verify`
- Cross-lesson prereqs from L5 two-step KPs (qualified refs).
- 12 items (2 i_do / 4 we_do / 4 you_do / 2 retrieval); mastery 3/4; EN/ES/PL.
- **Answer keys (all distinct):** 5, 4, 6, 7, 3, −3, 8, 2, −2, 9, 10, −4.
- **MCQ correct positions mixed:** c, a, b, c, d, a, b, c, a (addresses W24 all-a gap within this lesson).
- Unlocks: `bp.balance.mirror`, `rank.riser.vanguard`, `zone.zeta.mirror`
- `worldIntegration.terminalId`: `terminal.lesson6`
- Generator: `scripts/gen-lesson6-wave26.ts`

## Runtime wiring

- `loadLesson.ts`: `LESSON_6_ID`, `lesson6`, LESSONS registry; `resolveTerminalLessonId` L5→L6 (full L1→L6).
- `PIPELINE.md` updated.
- **Deferred:** GameView 3D for L6 unlocks (W25 owns L5 props).

## Validation

```bash
npm run content:validate   # expect 6/6
npm run build
```

No commit, per builder handoff convention (orchestrator ships).
