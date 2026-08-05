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
