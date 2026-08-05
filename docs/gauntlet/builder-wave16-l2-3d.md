# Builder — Wave 16 Lesson 2 unlocks as 3D world props

**Date:** 2026-08-05

## Goal

Lesson 2 mastery unlocks (`bp.pad.rail`, `rank.riser.adept`, `zone.beta.annex`) read as **real range props**, not just HUD chips (wave 15). GameView wiring was deliberately deferred in wave 13; this wave lands it.

## Changes

### `src/game/store.ts`

- `UnlockFlags` extended: `railBlueprint`, `adeptRank`, `betaAnnex` (L1 `blueprint` / `rank` / `zoneBeta` untouched).
- New state flags `hasRailBlueprint`, `hasAdeptRank`, `hasBetaAnnex`; `applyMasteryUnlocks` sets all six.

### `src/App.tsx`

- Derives L2 flags from `blob.unlocks` (+ `algebra-i-02` mastered fallback, same idiom as L1):
  - `railBlueprint` ← `bp.pad.rail`
  - `adeptRank` ← `rank.riser.adept`
  - `betaAnnex` ← `zone.beta.annex` **or legacy `zone.beacon.cyan`** (wave-13-era blobs recorded the L2 zone under that id)
- Uses `LESSON_1_ID` / `LESSON_2_ID` constants.

### `src/game/GameView.tsx`

- Passes all six flags into `applyMasteryUnlocks` (deps array extended).

### `src/game/world.ts`

- `ANNEX_RADIUS` (2.6), `ANNEX_CENTER` (east of Beta at `[8.3, -15]`), `ANNEX_BRIDGE` slab rect.
- `groundHeight(x, z, hasZoneBeta, blueprint, hasBetaAnnex = false)` — annex diamond (`|dx|+|dz| <= R`) + bridge strip return `PAD_TOP` when unlocked. Optional 5th param keeps the old call signature source-compatible.

### `src/game/ZoneLabel.tsx` (new)

- Extracted `ZoneLabel` (+ `bakeLabelTexture`, `makeCanvas`) from `TrainingRange` so the annex can reuse the neon sign without a circular import. `scale`/`subdued` props (wave-16-fidelity addition) preserved verbatim.

### `src/game/L2UnlockProps.tsx` (new, mounted from `TrainingRange`)

- **`PadRailProp`** (`hasRailBlueprint`): auto-present slim safety rails on the Alpha pad rim — 6 segments (2 steel posts + 1 pulsing cyan bar each), angles chosen to keep the spawn→terminal→gate walk line visually open. Auto-present over placeable this wave: a second `BlueprintGhost` slot was heavier than the payoff.
- **`BetaAnnex`** (`hasBetaAnnex`): diamond side platform (4-sided cylinder — distinct from octagonal Alpha/Beta), hex-pad top, 4 pulsing cyan edge bars, center diamond payoff marker (same idiom as Beta), amber beacon pylon with spinning torus, rail-fit training rack echoing the rail theme, `BETA ANNEX` neon label, and a walkable bridge slab from the Beta rim. Renders nothing while locked (no clutter on locked Beta).

### `src/game/Player.tsx`

- Adept insignia gated on `hasAdeptRank`: amber second chevrons above the initiate cyan shoulder marks + cyan/amber dual chest mark. +4 tiny emissive boxes.
- `groundHeight` call passes `s.hasBetaAnnex`.

### `src/game/Hud.tsx`

- Unlock flash now also fires on L2 transitions (rail → blueprint card, adept → rank card, annex → zone card), reusing the existing deferred-until-explore flash path. Wave-15 L2 chips unchanged.

## How each L2 unlock reads in-world

| Unlock | In-world read |
|---|---|
| `bp.pad.rail` | Cyan-bar safety rail segments ring the Alpha pad edge (pulse-animated) |
| `rank.riser.adept` | Player gains amber chevrons over both shoulder marks + cyan/amber paired chest insignia |
| `zone.beta.annex` | Labeled, walkable diamond platform east of Zone Beta with bridge, beacon pylon, and training rack |

## Budget / constraints

~40 new small meshes, all proc textures (`hexPad`, `panel`), **zero new point lights**, no new deps, no GLTF/CDN. Locked state renders nothing. KaTeX defer, cold shell, and Vite `base: '/aaamath/'` untouched.

## Parallel-wave coordination

Built alongside `builder-wave16-fidelity-fx.md` (authored props + unlock FX + chrome). That wave touched `TrainingRange` (subdued locked Beta, `UnlockCelebrationFx` mount, `rig.gateCelebration` camera nudge) and explicitly stayed out of store/App/Hud/Player/L2 props; this wave stayed out of proc textures, `RangeDecor`, `AuthoredProps`, and CSS. Both changesets merge cleanly.

## Verification

```bash
npm run build            # green (tsc -b + vite + spa-fallback)
npm run content:validate # 2/2 packages passed
```

In-browser (preview + seeded mastered blob):

- Spawn: rail segments on Alpha rim, L1+L2 HUD chips present
- Beta: annex pad/label/pylon visible east, player walked the bridge onto the diamond pad (stands at `PAD_TOP`)
- Close-up: adept amber shoulder chevrons + cyan/amber chest pair on the player
- `groundHeight` spot-check: annex + bridge 0.12 when unlocked, 0 when locked; Beta/deck unchanged

## Follow-ups

- Placeable rail via a second blueprint slot (build mode) if the auto-present rails feel thin.
- Gate path lights could branch toward the annex once L2 is mastered.
- L3+ unlock ids should follow this pattern: flags in `UnlockFlags`, props in one `L*UnlockProps` module.
