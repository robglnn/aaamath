# Builder — Wave 18: terminal + player hero silhouettes

**Date:** 2026-08-05  
**Closes:** critic-wave17 remaining gap — *"player, terminal, … still reads kitbash / primitive."*

## A — `src/game/proc/authoredGeo.ts` (extended kit)

Five new shared geometries added to `getAuthoredGeoKit()` (same lazy singleton, zero network):

| Geometry | Profile language | Replaces |
|---|---|---|
| `terminalPedestal` | Turned foot flare → cove → collar lip → taper, lathed 20 seg, 0 → 0.36 along +Y | 8-seg pedestal cylinder |
| `terminalCollar` | Short neck ring between pedestal and housing, lathed 16 seg | *(new trim read)* |
| `terminalHousing` | Beveled rounded-rect console carcass (1.35 × 0.7 × 0.8, bevel 0.04) | Housing box |
| `terminalBezel` | Beveled screen frame (1.12 × 0.72 × 0.08, bevel 0.025) | Bezel box |
| `terminalKeydeck` | Beveled keyboard deck plate (0.82 × 0.14 × 0.02) | Keydeck box |
| `crateLid` | Beveled horizontal lid slab (0.8 × 0.8 × 0.05) | StenciledCrate lid box |

Wave 17 geometries (`dish`, `gatePillar`, `rack*`) unchanged.

## B — Mounts

### 1. Algebra Terminal (`TrainingRange.tsx` `Terminal`)

Pedestal, collar, housing, keydeck, and screen bezel now use authored kit geometry with existing panel/steel materials. `TerminalScreen` live canvas, scanline sweep, LEDs, beacon/diamond objective stack, proximity ring, `TERMINAL_POS`, and `TERMINAL_RADIUS` interaction are **unchanged**.

### 2. Player (`Player.tsx`)

Modest silhouette pass — no new materials, adept insignia (wave 16) preserved:

- **Helm brow ridge** — angled shade plate above visor band
- **Pack profile** — side angled housings + lower vent block behind the main pack
- **Boot bevels** — toe-cap wedges on both legs

### 3. Stenciled crate (`AuthoredProps.tsx`)

Lid swapped to shared `crateLid` bevel-extrude (2 placements, one geometry buffer).

## C — Mesh budget delta

| Surface | Before (W17) | After (W18) | Δ |
|---|---|---|---|
| `Terminal` | ~24 meshes (cylinder + 3 boxes) | ~25 meshes (+collar trim) | **+1** |
| `Player` | ~28 meshes | ~34 meshes (brow, pack×3, toe×2) | **+6** |
| `AuthoredProps` | ~42 meshes | ~42 meshes (lid geometry swap) | **0** |
| Shared geo buffers | 5 lathe/extrude | 11 lathe/extrude | +6 buffers (session singleton) |

No new lights, `useFrame` hooks, or canvas bakes.

## D — Byte sizes

| Item | Size |
|---|---|
| `authoredGeo.ts` source | ~6.8 kB (was ~4.5 kB) |
| `GameView` chunk | **82.55 kB raw / 22.16 kB gz** (W17: 80.85 / 21.74 → **+1.7 kB raw**) |
| `three` chunk | 689.52 kB (unchanged) |
| Network assets added | **0 B** |

## E — Verify

- `npm run build` — **green** (tsc + vite 6.4.3 + spa-fallback).
- `dist/index.html` modulepreload: `_commonjsHelpers`, `react-vendor` only — **no `three`, no `katex`, no `GameView`**; `base: '/aaamath/'` intact.

## Untouched (pedagogy / shell guards)

L1/L2 lesson flow, KaTeX defer, terminal proximity store wire, unlock flags, cold-shell entry imports — all unchanged.
