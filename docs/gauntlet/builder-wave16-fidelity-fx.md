# Builder — Wave 16 fidelity, unlock FX, chrome hierarchy

**Date:** 2026-08-05  
**Closes:** critic-overnight-final headline gap — authored prop/material fidelity; secondary mastery→Beta unlock in-camera read; loud web chrome / locked Beta competing with Terminal POI.

## A — Higher fidelity (mobile budget)

### `src/game/proc/canvasTextures.ts`

- **`makeSteelPlateTexture`** — brushed diagonal grain, chamfer lip, rivet rows, stencil `SVC-07` ID. Tile-friendly for duct / junction surfaces.
- **`makeStencilDecalTexture`** — hazard chevron, bar ticks, `UNIT-42` label for 1:1 crate faces.

Exported via `proc/index.ts`.

### `src/game/AuthoredProps.tsx` (new)

Multi-mesh kitbash props mounted from `RangeDecor` (not `TrainingRange` core wiring):

| Prop | Meshes | Placement |
|------|--------|-----------|
| `ServiceJunction` ×2 | ~11 each | `[-6.8,-1.2]`, `[7.1,-3.8]` — panel housing, steel top plate, corner trim, LED strip, conduit stub + flange |
| `DuctCoupling` ×2 | ~10 each | `[-3.6,-5.4]`, `[3.8,-7.2]` — steel-mapped pipe, torus flanges, bolt ears |
| `StenciledCrate` ×2 | ~6 each | `[-7.4,5.8]`, `[6.2,-8.5]` — decal face, strap rivets, lid beacon |

**Budget:** ~38 meshes, 2 one-shot canvas bakes (shared per type), 0 point lights, 0 `useFrame`. Off walk diagonal; complements wave-9 ground breakup without overlapping rail corridor.

## B — Mastery unlock FX in-camera

### `src/game/UnlockCelebrationFx.tsx` (extracted from `TrainingRange`)

Replaces inline `GateUnlockFx` with a stronger deferred celebration:

- Twin expanding rings (cyan outer + amber inner)
- Additive vertical beam + floor flash burst
- 20 instanced spark motes orbiting the gate
- Point light pulse (48 → 0 over 2.4s)
- **`rig.gateCelebration`** decay — `CameraRig` blends look-at 25% toward `GATE_Z` while active (safe nudge, no position hijack)

Deferred-until-explore behavior preserved (lesson overlay won't eat the beat). Audio **not** duplicated — HUD `playBlip('unlock')` already fires with the deferred flash.

### `src/game/world.ts`

- `rig.gateCelebration: number` — shared 0–1 decay channel for camera nudge.

## C — Chrome / hierarchy

### `src/styles/app.css`

- `.app-chrome` / `.chrome-btn` / `.locale-btn` — lower opacity, no forced uppercase, thinner borders, inset diegetic panel feel vs floating toolbar.
- Active locale: translucent cyan tint instead of solid teal pill.

### `src/game/TrainingRange.tsx` — locked Beta subdued

- Label shortened to **BETA LOCKED**, `subdued` + lower `y` (1.55), 82% scale, 72% face opacity.
- Torus / diamond ring emissive cut (~0.65 → 0.42 / 0.35 → 0.22).
- Pad point light 3 → 1.8 when locked.
- Barrier pane shimmer 0.17 → 0.11 base; post emissive 0.7 → 0.45; lintel 1.1 → 0.75.

Terminal beam / diamond hierarchy unchanged — remains spawn POI hero.

## Conflicts avoided (parallel L2 builder)

| Area | This wave | Avoided |
|------|-----------|---------|
| `store.ts` / `App.tsx` unlock flags | untouched | L2 annex wiring |
| `Hud.tsx` L2 chips | untouched | L2 HUD / zone IDs |
| `Player.tsx` bounds | untouched | L2 movement |
| `TrainingRange` | FX + Beta visual hierarchy + `CameraRig` nudge only | No L2 3D unlock props |

New work lives in `AuthoredProps.tsx`, `UnlockCelebrationFx.tsx`, proc textures, `RangeDecor` mount, CSS.

## Build

`npm run build` — **green** (tsc + vite + spa-fallback). `content:validate` not required (no content edits).

## Palette / constraints

Cyan `#3dd6c6` / amber `#f0a830` / steel deck tones held. No new npm deps, no external GLTF/CDN. GameView chunk ~73 kB (+~10 kB authored props + FX module — still lazy with Three/R3F).
