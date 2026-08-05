# Builder — Wave 27 Lesson 6 unlocks as 3D world props

**Date:** 2026-08-05

## Goal

Lesson 6 mastery unlocks (`bp.balance.mirror`, `rank.riser.vanguard`, `zone.zeta.mirror`) read as **real range props**, not just HUD chips — same W23/W25 pattern as L2–L5.

## Changes

### `src/game/store.ts`
- `UnlockFlags` + state: `balanceMirror`, `vanguardRank`, `zetaMirror` / `has*` (18 flags L1–L6).
- `applyMasteryUnlocks` sets all eighteen.

### `src/App.tsx` / `GameView.tsx`
- L6 flags from blob + `algebra-i-06` mastered fallback (`LESSON_6_ID`).
- `GameView` passes all 18 flags into `applyMasteryUnlocks`.

### `src/game/world.ts`
- `ZETA_RADIUS` 2.6 (apothem), `ZETA_CENTER` `[9.2, 0]`, `ZETA_BRIDGE` `x 5.8 → 6.9` at `z = 0`.
- `groundHeight` 9th param `hasZetaMirror`: flat-top hex half-planes (flat sides ±X) + bridge strip.

### `src/game/L6UnlockProps.tsx` (new)
- **MirrorProp**: dual-facing mirror panels at `[2.4, PAD_TOP, -1.5]`, cyan lhs / amber rhs through ice glass, materialize FX (deferred-until-explore, easeOutBack stagger, additive ring).
- **ZetaMirror**: walkable flat-top hex east of Alpha, ice `#7eb8e8` accents, mast, mini mirror rack, `ZETA MIRROR` label, bridge slab.

### `src/game/Player.tsx`
- Vanguard ice sixth chevrons (`y ≈ 1.18`, `rot ≈ -1.05`, scale 0.65×0.36) over mint Chief tier + centered ice chest mark.
- `groundHeight` passes `hasZetaMirror`.

### Hud / TrainingRange / i18n / css
- L6 flash transitions (vanguard → rank, mirror → blueprint, zeta → zone).
- `.gr-l6-chip` ice accents, `data-tier="vanguard"`.
- Objective prefers zeta when unlocked (highest priority).
- Ice path studs on Alpha→Zeta bridge when `hasZetaMirror`.
- `objectiveZetaMirrorOpen` EN/ES/PL.

## Placement math (locked east-of-Alpha site)

| Constant | Value | Notes |
|---|---|---|
| `ZETA_RADIUS` | 2.6 | Apothem (center → flat face on ±X) |
| `ZETA_CENTER` | `[9.2, 0]` | East of Alpha center |
| `ZETA_BRIDGE.x0` | 5.8 | Inside Alpha east rim (R=6) |
| `ZETA_BRIDGE.x1` | 6.9 | `9.2 − 2.6 + 0.3` — yard west edge slack |
| West flat edge | x = 6.6 | `9.2 − 2.6` |
| East flat edge | x = 11.8 | `9.2 + 2.6` — inside BOUNDS x=12 |
| Hex half-height (z) | ≈ 3.0 | circumradius `2.6 × 2/√3` |

**Hex walk test:** six outward normals at `k·π/3` for `k = 0…5`; inside when `dx·cos(a) + dz·sin(a) ≤ h` with `h = ZETA_RADIUS − 0.15`.

- **Cylinder body:** circumradius `ZETA_RADIUS / cos(π/6)`. CircleGeometry θ from +X uses `thetaStart = π/2` (flat ±X); CylinderGeometry θ from +Z uses `thetaStart = 0` (same flat ±X). Do **not** copy one theta into both — that rotates the skirt 30° and pushes the east vertex past BOUNDS.
- **Edge bars:** bearings `k·π/3` (walk face midpoints), not disc-theta-offset.

## Clearance

| Neighbor | Result |
|---|---|
| Delta NE `[7.6, −9.1]` | Clear — Δz 9.1, Δx 1.6 |
| Epsilon NW `[-7.6, −9.1]` | Clear — far |
| Terminal `[2.5, −3.5]` | Clear — dist ≈ 7.5 |
| Alpha R=6 | Bridge overlaps east rim by design; walk continuous at PAD_TOP |
| BOUNDS ±12 / zMin −20.5 / zMax 10 | Yard x ∈ [6.6, 11.8], z ∈ [−3.0, 3.0] — inside |

## MirrorProp clearance (Alpha pad)

| Prop | Position | Mirror at `[2.4, −1.5]` |
|---|---|---|
| L5 Calibrator | `[-2.8, 1.2]` | Clear — Δx 5.2 |
| L4 Beam | `[2.7, 1.4]` | Clear — Δz 2.9 |
| L3 Splitter | `[-2.4, −1.6]` | Clear — Δx 4.8 |

## Mesh budget

~38 meshes in `L6UnlockProps` (MirrorProp ~14, ZetaMirror ~24) — under ~40 target.

## Verification

```bash
npm run build      # green
npm run content:validate  # 7/7 passed
```

## Critic follow-up (orchestrator)
W27 critic found cylinder/circle thetaStart mix-up; fixed before ship: Zeta cyl θ=0 + bars at `k·π/3`; also aligned Gamma cyl θ=π/2 and Epsilon cyl θ=π/5−π/2.

## Soft gaps

- No `'zeta'` `ZoneId` yet (same pattern as delta/gamma/epsilon — objective string only).
- Zeta yard is east of Alpha, not tied to Beta gate flow — studs branch from Alpha east rim independently of gate path wave.
