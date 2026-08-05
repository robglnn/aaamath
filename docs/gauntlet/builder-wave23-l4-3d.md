# Builder — Wave 23 Lesson 4 unlocks as 3D world props

**Date:** 2026-08-05

## Goal

Lesson 4 mastery unlocks (`bp.balance.beam`, `rank.riser.operator`, `zone.delta.balance`) read as **real range props**, not just HUD chips — the wave-16 L2 / wave-21 L3 pattern applied one rung up. This wave lands flag plumbing (`store.ts` / `App.tsx` / `GameView.tsx`), world geometry, a new `L4UnlockProps` module, player insignia, HUD, path studs, and i18n.

## Changes

### `src/game/store.ts`

- `UnlockFlags` extended: `balanceBeam`, `operatorRank`, `deltaBalance` (L1–L3 flags untouched in meaning).
- New state flags `hasBalanceBeam`, `hasOperatorRank`, `hasDeltaBalance`; `applyMasteryUnlocks` now sets all twelve.

### `src/App.tsx`

- Derives L4 flags from `blob.unlocks` (+ `algebra-i-04` mastered fallback, same idiom as L1–L3):
  - `balanceBeam` ← `bp.balance.beam`
  - `operatorRank` ← `rank.riser.operator`
  - `deltaBalance` ← `zone.delta.balance`
- Imports `LESSON_4_ID` from `loadLesson`.

### `src/game/GameView.tsx`

- Passes all twelve flags into `applyMasteryUnlocks` (deps array extended).

### `src/game/world.ts`

- `DELTA_RADIUS` (2.6 — square **half-side / apothem**), `DELTA_CENTER` (`[7.6, -9.1]`, northeast of Beta), `DELTA_BRIDGE` slab rect (`x 2.2 → 5.3` at `z = -10.7`, `halfWidth 0.95`) from the Beta northeast rim to the yard west edge.
- `groundHeight(x, z, hasZoneBeta, blueprint, hasBetaAnnex = false, hasGammaRelay = false, hasDeltaBalance = false)` — axis-aligned square test (`|dx| <= R-0.15 && |dz| <= R-0.15`) + bridge strip return `PAD_TOP` when unlocked. Optional 7th param keeps the old call signature source-compatible.

### `src/game/L4UnlockProps.tsx` (new, mounted from `TrainingRange`)

- **`BalanceBeamProp`** (`hasBalanceBeam`): auto-present dual-pan balance beam on the Alpha pad at `[2.7, PAD_TOP, 1.4]`, yaw `0.35` — east of the spawn→terminal→gate walk line (line x ≈ 0.87 at that z; beam x ≥ 1.9), clear of the east approach rail (~0.18 horizontal gap to the hanging pan) and the wave-21 splitter at `[-2.4, -1.6]`. Steel base + tapered fulcrum post, gold beam bar with pivot hub, and twin hanger-string pans — **cyan left weight vs amber right weight**: two sides of a one-step equation held level (L4 theme). The beam+pans ride one pivot with a gentle ±3° calibration sway. One-shot materialize FX (staggered easeOutBack pop + expanding additive ring), deferred until explore — copied from the W21 `SplitterProp` idiom.
- **`DeltaBalance`** (`hasDeltaBalance`): **axis-aligned square yard** (4-sided cylinder, `thetaStart = π/4` so flat sides face the axes — distinct from octagon Alpha/Beta, 45° diamond Annex, hex Gamma; body circumradius = apothem·√2), hex-pad top tinted warm (`#e8d9a8`), 4 pulsing **gold** edge bars, center square payoff marker, 2.6-tall calibration mast with spinning amber torus + gold octa beacon tip, mini balance rack echoing the beam theme, `DELTA BALANCE` neon label, and a walkable bridge slab from the Beta northeast rim. Accent family is **warm gold / amber-gold** (`#e8c56a`) so L4 reads distinct from cyan L2 and violet L3 at a glance. Renders nothing while locked.

### `src/game/Player.tsx`

- Operator insignia gated on `hasOperatorRank`: **gold fourth chevrons** above the violet expert shoulder marks (continuing the curl back over the pauldron: `y 1.121`, `rot -0.82`) + centered **gold chest mark** above the violet diamond. +3 tiny emissive pips. Distinct from initiate cyan / adept amber / expert violet.
- `groundHeight` call passes `s.hasDeltaBalance` (7th arg).

### `src/game/Hud.tsx` + `src/game/game.css`

- Unlock flash fires on L4 transitions (operator → rank card, beam → blueprint card, delta → zone card), reusing the deferred-until-explore flash path.
- L4 HUD chips (rank ◆ / blueprint ⬡ / zone ◎) from `blob.unlocks`, titles via `pickLocalized` on the lesson-4 package — reuse `.gr-l2-chip` base layout with new `.gr-l4-chip` accent overrides (gold family: rank `#e8c56a`, blueprint `#f2d98c`, zone `#d9a83e`), `data-tier="operator"`.
- Objective text prefers new i18n key `objectiveDeltaBalanceOpen` when `hasDeltaBalance` — highest priority over gamma → annex → beta → blueprint → terminal.

### `src/game/TrainingRange.tsx`

- Mounts `<L4UnlockProps />` beside `<L2UnlockProps />` / `<L3UnlockProps />`.
- `GatePathLights` gains a Delta branch (`DELTA_STUD_XS`, 1.2 → 6.5 inside-Beta → bridge → yard) when `hasDeltaBalance`; gold studs continue the wave index after the gamma studs, same pulse idiom.

### `src/i18n/ui.ts`

- New key `objectiveDeltaBalanceOpen` EN/ES/PL ("cross the bridge northeast of Beta").

## Placement — why northeast, not south

The brief preferred **south of Beta** (exemplar `[0, -18.5]`) with a bridge from the Beta south rim, keeping `BOUNDS { x: ±12, zMin: -20.5, zMax: 10 }`. Geometry rejects it:

- Beta (center `[0, -15]`, R 5) south rim sits at `z = -20`; `zMin = -20.5` leaves a **0.5-deep strip** — a 2.6-radius yard cannot fit.
- The exemplar `[0, -18.5]` lies **inside the Beta disc** (dist 3.5 < 5) — pads would overlap.
- SE/SW diagonals collide with the annex (south vertex `(8.3, -17.6)`) / gamma hex and `zMin`; corners east/west are out of room (`±12`).

**Chosen site: `DELTA_CENTER [7.6, -9.1]`** — northeast of Beta, flanking the approach corridor, with an axis-aligned bridge west to the Beta northeast rim. Clearance checks (square half-side 2.6, skirt 2.9):

| Neighbor | Check | Result |
|---|---|---|
| Beta disc | nearest yard corner `(5.0, -11.7)`: dist² = 25 + 10.9 → dist ≈ 5.99 vs R 5 | ✓ ~1.0 gap |
| Beta Annex | annex max z `-12.4` < yard min z `-11.7` (dz 3.3 > 2.6); skirts gap ~0.1 | ✓ no overlap |
| Gamma Relay | west side of Beta | ✓ far |
| Alpha pad | nearest corner `(5.0, -6.5)`: dist ≈ 8.2 > 6 | ✓ |
| Terminal pool | R 2.3 at `(2.5, -3.5)`; corner `(5.0, -6.5)` dist ≈ 3.9 | ✓ |
| Gate walk line | corridor x ≈ 0; yard min x 5.0 | ✓ |
| BOUNDS | x ≤ 10.2 (skirt 10.5) < 12; z `-11.7 → -6.5` inside | ✓ no BOUNDS change |

Bridge continuity: at `z = -10.7` the Beta rim is `x = 2.55`; `DELTA_BRIDGE.x0 = 2.2` overlaps the disc, `x1 = 5.3` overlaps the yard walk edge (`x ≥ 5.15`) — continuous `PAD_TOP` from Beta onto the yard.

Decor notes: the wave-9 floor plate at `(5.9, -6.6)` sits under the pad's east edge; its north half pokes past the skirt and reads as a flat approach apron (≤0.063 tall deck hardware vs pad top 0.12) — harmless. The gate-flank light post at `(4.5, -6.2)` clears the yard skirt by ~0.2.

## How each L4 unlock reads in-world

| Unlock | In-world read |
|---|---|
| `bp.balance.beam` | Dual-pan balance beam materializes on the Alpha pad — gold beam on a fulcrum, cyan vs amber pans held level (one-step equation balance) |
| `rank.riser.operator` | Player gains gold fourth shoulder chevrons over the violet expert tier + centered gold chest mark |
| `zone.delta.balance` | Labeled, walkable **square** balance yard northeast of Zone Beta with bridge, calibration mast, balance rack, and gold path studs from the gate line |

## BOUNDS / groundHeight spot-check (math review)

- Yard square: `|x - 7.6| <= 2.45 && |z + 9.1| <= 2.45` → `PAD_TOP` (0.12) unlocked, 0 locked.
  - Center `(7.6, -9.1)` → 0.12 ✓; corner `(10.05, -11.55)` → 0.12 (inclusive) ✓; `(10.06, -11.56)` → 0 ✓.
- Bridge strip: `x ∈ [2.2, 5.3]`, `|z + 10.7| <= 0.95` → 0.12; midpoint `(3.75, -10.7)` → 0.12 ✓.
- Chain continuity at `z = -10.7`: Beta disc covers `x ≤ 2.55`, bridge `2.2 → 5.3`, yard from `x = 5.15` — overlaps at both joints, no gap ✓.
- Square test is exact (axis-aligned), matching the annex diamond idiom; visual pad apothem 2.6 ≈ walk 2.45 (same slack as annex/gamma).
- Beta / annex / gamma / blueprint / deck paths unchanged (trailing optional param; old call sites source-compatible). Locked state contributes ground `0` and renders nothing.

## Budget / constraints

~33 prop meshes (beam 11: base, post, bar, hub, 2×[string+pan+weight], FX ring; yard 22: pad body, top disc, 4 edge bars, marker, 3 mast, 5 rack, ~4 label, 3 bridge) — inside the ~40 budget; +3 operator insignia pips and +6 gold path studs in the existing components. All proc textures (`hexPad`, `panel`), **zero new point lights**, no new deps, no GLTF/CDN. KaTeX defer, cold shell, and Vite `base: '/aaamath/'` untouched. No pedagogy/content JSON changes.

## Parallel-wave coordination

Built alongside `builder-wave24-lesson5.md` (L5 content + `loadLesson` registry + `PIPELINE.md`). That wave owned `loadLesson.ts`, `content/lessons/algebra-i-05/`, `content/PIPELINE.md`, and `scripts/gen-lesson5-wave24.ts`; this wave stayed in `game/`, `i18n/`, and the L4 flag plumbing in `App.tsx` / `store.ts`. Both changesets share the working tree; verification below covers the merged state (5/5 packages).

## Verification

```bash
npm run build            # green (tsc -b + vite + spa-fallback)
npm run content:validate # 5/5 packages passed
```

## Follow-ups

- Placeable balance beam via a blueprint slot (build mode) if the auto-present beam reads thin.
- L5 unlock ids (`bp.balance.calibrator`, `rank.riser.chief`, `zone.epsilon.cal`) should follow this pattern: flags in `UnlockFlags`, props in one `L5UnlockProps` module. Epsilon placement: the NE corridor is now taken — the mirror NW site (`[-7.6, -9.1]`) is the symmetric free slot, or south `zMin` must move.
- `activeZone` still resolves `'beta'` on the annex/gamma/delta pads; a real ZoneId per side zone would let the HUD zone chip light up on approach.
