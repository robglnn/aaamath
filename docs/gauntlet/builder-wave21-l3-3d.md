# Builder — Wave 21 Lesson 3 unlocks as 3D world props

**Date:** 2026-08-05

## Goal

Lesson 3 mastery unlocks (`bp.relay.splitter`, `rank.riser.expert`, `zone.gamma.relay`) read as **real range props**, not just HUD chips — the wave-16 L2 pattern applied one rung up. Flag plumbing landed in `store.ts` / `App.tsx` / `GameView.tsx`; this wave also lands world geometry, player insignia, HUD, and path lights.

## Changes

### `src/game/store.ts`

- `UnlockFlags` extended: `relaySplitter`, `expertRank`, `gammaRelay` (L1/L2 flags untouched).
- New state flags `hasRelaySplitter`, `hasExpertRank`, `hasGammaRelay`; `applyMasteryUnlocks` sets all nine.

### `src/App.tsx`

- Derives L3 flags from `blob.unlocks` (+ `algebra-i-03` mastered fallback, same idiom as L1/L2):
  - `relaySplitter` ← `bp.relay.splitter`
  - `expertRank` ← `rank.riser.expert`
  - `gammaRelay` ← `zone.gamma.relay`
- Imports `LESSON_3_ID` from `loadLesson`.

### `src/game/GameView.tsx`

- Passes all nine flags into `applyMasteryUnlocks` (deps array extended).

### `src/game/world.ts`

- `GAMMA_RADIUS` (2.6), `GAMMA_CENTER` (west of Beta at `[-8.3, -15]` — exact mirror of the annex offset), `GAMMA_BRIDGE` slab rect spanning `x -6.2 → -4.5` at `z = -15`.
- `groundHeight(x, z, hasZoneBeta, blueprint, hasBetaAnnex = false, hasGammaRelay = false)` — relay hexagon (vertex east toward the bridge) + bridge strip return `PAD_TOP` when unlocked. Hex inside test on the two first-quadrant face normals: `qz <= h && 0.866·qx + 0.5·qz <= h`, inradius `h = (R - 0.15)·√3/2`. Optional 6th param keeps the old call signature source-compatible.

### `src/game/L3UnlockProps.tsx` (new, mounted from `TrainingRange`)

- **`SplitterProp`** (`hasRelaySplitter`): auto-present Y-splitter on the Alpha pad at `[-2.4, PAD_TOP, -1.6]`, yaw `-2.1` — well clear of the spawn→terminal→gate walk line. Steel feed post + cyan trunk bar into a cyan octa hub, two mirrored steel branch posts + amber bars + amber device tips: one charge in, two lines out. One-shot materialize FX (staggered easeOutBack pop + expanding additive ring), deferred until explore — same idiom as `PadRailProp`.
- **`GammaRelay`** (`hasGammaRelay`): hexagonal relay pad (6-sided cylinder, `thetaStart = π/6` so an east vertex meets the bridge — distinct from the diamond annex and octagonal Alpha/Beta), hex-pad top, 6 pulsing **violet** edge bars, center hex payoff marker, 2.6-tall relay mast with spinning amber torus + violet octa beacon tip, mini Y-bar splitter rack echoing the blueprint theme, `GAMMA RELAY` neon label, and a walkable bridge slab from the Beta west rim. Violet (`#b48cff`) accent family so L3 reads distinct from the cyan L2 annex at a glance. Renders nothing while locked.

### `src/game/Player.tsx`

- Expert insignia gated on `hasExpertRank`: violet third chevrons above the amber adept shoulder marks (continuing the curl back over the pauldron) + centered violet chest diamond between the cyan/amber adept pair. +3 tiny emissive pips. Distinct from initiate cyan and adept amber.
- `groundHeight` call passes `s.hasGammaRelay`.

### `src/game/Hud.tsx` + `src/game/game.css`

- Unlock flash fires on L3 transitions (expert → rank card, splitter → blueprint card, gamma → zone card), reusing the deferred-until-explore flash path.
- L3 HUD chips (rank ◆ / blueprint ⬡ / zone ◎) from `blob.unlocks`, titles via `pickLocalized` on the lesson-3 package — reuse `.gr-l2-chip` base layout with new `.gr-l3-chip` accent overrides (expert = magenta `#e85d9a`, splitter = violet `#b48cff`, gamma = bright teal).
- Objective text prefers new i18n key `objectiveGammaRelayOpen` when `hasGammaRelay`, falling back to annex → beta → blueprint → terminal.

### `src/game/TrainingRange.tsx`

- Mounts `<L3UnlockProps />` beside `<L2UnlockProps />`.
- `GatePathLights` gains a Gamma branch (`GAMMA_STUD_XS`, −1.2 → −7.2 inside-Beta → bridge → relay hex) when `hasGammaRelay`; violet studs continue the wave index after the annex studs, same pulse idiom.

### `src/i18n/ui.ts`

- New key `objectiveGammaRelayOpen` EN/ES/PL ("cross the bridge west of Beta").

## How each L3 unlock reads in-world

| Unlock | In-world read |
|---|---|
| `bp.relay.splitter` | Y-splitter materializes on the Alpha pad — cyan trunk feeding two amber branches (one pad cell → many devices) |
| `rank.riser.expert` | Player gains violet third shoulder chevrons over the amber adept tier + centered violet chest diamond |
| `zone.gamma.relay` | Labeled, walkable hexagonal relay pad west of Zone Beta with bridge, spinning relay mast, splitter rack, and violet path studs from the gate line |

## BOUNDS / groundHeight notes

- Gamma Relay placed **west** of Beta (`GAMMA_CENTER [-8.3, -15]`): pad spans `x -10.9 → -5.7`, `z -17.6 → -12.4` — fully inside existing `BOUNDS { x: ±12, zMin: -20.5 }`, so **no BOUNDS change was needed** (the southern `[0, -22]` option would have required extending `zMin`).
- Bridge strip covers `x -6.2 → -4.5`, overlapping the Beta west rim and reaching the hex's east vertex — continuous `PAD_TOP` from Beta onto the relay.
- Hex walkable test is exact (face-normal inequality), matching the diamond-annex idiom rather than an inscribed-circle approximation.
- Locked state: all Gamma geometry contributes ground `0` and renders nothing.

## Budget / constraints

~34 new small meshes (splitter 10, relay 21, label ~4 — inside the ~40 budget), all proc textures (`hexPad`, `panel`), **zero new point lights**, no new deps, no GLTF/CDN. KaTeX defer, cold shell, and Vite `base: '/aaamath/'` untouched. No pedagogy/content JSON changes.

## Parallel-wave coordination

Built alongside `builder-wave22-lesson4.md` (L4 content + `loadLesson` registry). That wave touched `loadLesson.ts`, `content/lessons/algebra-i-04/`, and `PIPELINE.md`; this wave stayed in `game/`, `i18n/`, and the L3 flag plumbing. Both changesets share the working tree and merge cleanly; verification below covers the merged state (4/4 packages).

## Verification

```bash
npm run build            # green (tsc -b + vite + spa-fallback)
npm run content:validate # 4/4 packages passed
```

`groundHeight` spot-check (math review): relay hex + bridge return `PAD_TOP` (0.12) when unlocked, 0 when locked; hex test verified exact at the east vertex `(R, 0)` and the 60° vertex `(0.5R, 0.866R)`; Beta/annex/deck paths unchanged.

## Follow-ups

- Placeable splitter via a blueprint slot (build mode) if the auto-present Y reads thin.
- L4 unlock ids (`bp.balance.beam`, `rank.riser.operator`, `zone.delta.balance`) should follow this pattern: flags in `UnlockFlags`, props in one `L4UnlockProps` module, next rung color TBD.
- `activeZone` still resolves `'beta'` on the Gamma pad; a `'gamma'` ZoneId would let the HUD zone chip light up on approach.
