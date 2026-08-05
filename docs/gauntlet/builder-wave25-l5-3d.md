# Builder — Wave 25 Lesson 5 unlocks as 3D world props

**Date:** 2026-08-05

## Goal

Lesson 5 mastery unlocks (`bp.balance.calibrator`, `rank.riser.chief`, `zone.epsilon.cal`) read as **real range props**, not just HUD chips — the wave-16/21/23 pattern one rung up.

## Changes

### `src/game/store.ts`
- `UnlockFlags` + state: `balanceCalibrator`, `chiefRank`, `epsilonCal` / `has*` (15 flags L1–L5).
- `applyMasteryUnlocks` sets all fifteen.

### `src/App.tsx` / `GameView.tsx`
- L5 flags from blob + `algebra-i-05` mastered fallback (`LESSON_5_ID`).

### `src/game/world.ts`
- `EPSILON_RADIUS` 2.6 (apothem), `EPSILON_CENTER` `[-7.6, -9.1]` (NW mirror of Delta), `EPSILON_BRIDGE` `x -5.3 → -2.2` at `z = -10.7`.
- `groundHeight` 8th param `hasEpsilonCal`: regular-pentagon half-planes (flat east) + bridge strip.

### `src/game/L5UnlockProps.tsx` (new)
- **CalibratorProp**: dual-dial tower at `[-2.8, PAD_TOP, 1.2]`, cyan+amber dials + mint tip, materialize FX.
- **EpsilonCal**: walkable pentagon forge, mint accents, mast, mini dial rack, `EPSILON CAL` label, bridge.

### Player / Hud / TrainingRange / i18n / css
- Chief mint fifth chevrons; L5 chips/flash; mint path studs; `objectiveEpsilonCalOpen` EN/ES/PL.

## Placement clearance (NW site)
| Neighbor | Result |
|---|---|
| Delta NE `[7.6,-9.1]` | Mirror — far |
| Gamma west of Beta | Clear |
| Annex east of Beta | Clear |
| BOUNDS ±12 / zMin -20.5 | Yard x≈[-10.2,-5.0] inside |

## Verification
```bash
npm run build
npm run content:validate
```

## Follow-ups
- L6 content unlocks (`bp.balance.mirror` / `rank.riser.vanguard` / `zone.zeta.mirror`) deferred 3D.
- No `'epsilon'` ZoneId yet (same soft gap as delta/gamma).
