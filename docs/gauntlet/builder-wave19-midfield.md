# Builder — Wave 19: mid-field cast silhouettes

**Date:** 2026-08-05  
**Closes:** critic-wave18 remaining gap — *"mid-field cast (ducts, light masts, barrier pane) stays primitive."*

## A — `src/game/proc/authoredGeo.ts` (extended kit)

Four new shared geometries added to `getAuthoredGeoKit()` (distinct names to avoid collision with parallel Player.tsx work):

| Geometry | Profile language | Replaces |
|---|---|---|
| `ductPipe` | Flanged foot → cove → tubular run → rolled end lip, lathed 14 seg, unit segment 0 → 1 along +Y (scale Y for run length) | Floor conduit boxes + cable-trunk channel boxes |
| `mastFlange` | Foot flare → cove → tapered shaft → collar ring → neck, lathed 16 seg, 0 → 2.8 along +Y | 6-seg light-post cylinders |
| `mastLamp` | Beveled rounded-rect lamp cap (0.28 × 0.12 × 0.28, bevel 0.02) | Lamp housing box |
| `barrierPane` | Beveled translucent wall slab (5.8 × 1.9 × 0.14, bevel 0.022) | Beta gate energy wall box |

Wave 17–18 geometries (`dish`, `gatePillar`, `rack*`, `terminal*`, `crateLid`) unchanged.

## B — Mounts (upgrades in place, no clutter)

### 1. Energy conduits (`RangeDecor.tsx` `EnergyConduits`)

Three pulsing floor runs toward the terminal now use shared `ductPipe` geometry with non-uniform scale `[0.62, len, 0.62]` and `rotation={[π/2, rot, 0]}`. Same `useFrame` emissive pulse, same paths, same mesh count.

### 2. Cable trunks (`RangeDecor.tsx` `CableTrunks`)

Steel channel boxes swapped to scaled `ductPipe` (`scale={[4.8, len, 4.8]}`) for a flanged tray read. Cyan/amber cable strips remain thin emissive boxes on top.

### 3. Light posts (`RangeDecor.tsx` `LightPosts`)

All ten posts: turned `mastFlange` pole + beveled `mastLamp` cap. Point-light pools on the original six posts unchanged; emissive-only approach posts unchanged.

### 4. Beta barrier pane (`TrainingRange.tsx` `BetaBarrier`)

Energy wall mesh uses `barrierPane` bevel-extrude; `paneMat` opacity shimmer / sink fade logic unchanged. Turned `gatePillar` posts and lintel box untouched.

**Not touched:** `Player.tsx`, `AuthoredProps` hero racks/dishes, pedagogy, cold shell.

## C — Mesh budget delta

| Surface | Before (W18) | After (W19) | Δ |
|---|---|---|---|
| `EnergyConduits` | 3 box meshes | 3 lathe meshes (shared buffer) | **0** count |
| `CableTrunks` | 2 channel boxes | 2 lathe meshes (shared buffer) | **0** count |
| `LightPosts` | 10 cylinder + 10 box | 10 lathe + 10 bevel (shared buffers) | **0** count |
| `BetaBarrier` pane | 1 box | 1 bevel extrude (shared buffer) | **0** count |
| Shared geo buffers | 11 lathe/extrude | 15 lathe/extrude | +4 buffers (session singleton) |

No new lights, no new `useFrame` hooks, no new canvas bakes.

## D — Byte sizes

| Item | Size |
|---|---|
| `authoredGeo.ts` source | ~8.9 kB (was ~6.8 kB) |
| `GameView` chunk | **84.72 kB raw / 22.83 kB gz** (W18: 84.21 / 22.60 → **+0.51 kB raw**) |
| `three` chunk | 689.52 kB (unchanged) |
| Network assets added | **0 B** |

## E — Verify

- `npm run build` — **green** (tsc + vite 6.4.3 + spa-fallback).
- `dist/index.html` modulepreload: `_commonjsHelpers`, `react-vendor` only — **no `three`, no `katex`, no `GameView`**; `base: '/aaamath/'` intact.

## Untouched (coordination / guards)

`Player.tsx` (parallel builder), L1/L2 lesson flow, KaTeX defer, terminal proximity, unlock flags, cold-shell entry imports — all unchanged.
