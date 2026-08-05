# Builder — Wave 3 procedural canvas textures

**Date:** 2026-08-05
**Goal:** Deepen range materials past flat colors with canvas-baked procedural textures. No new deps, no asset store.

## Delivered

- **`src/game/proc/canvasTextures.ts`** — completed the kit (hex stub was a syntax-error placeholder, build was red):
  - `noiseFloorTexture` (512): deep-navy deck plating — deterministic per-pixel teal-leaning noise, wrap-stamped wear blotches, 4×4 panel-seam lattice with rivets (seams/rivets on wrap-aligned lattice points → seamless under `RepeatWrapping`), anisotropy 4 for grazing angles.
  - `panelTexture` (256): unchanged sci-fi panel (beveled plate, seams, bolts, cyan strip, one amber tick); edge bevel tiles into a continuous panel wall.
  - `hexPadTexture` (256): flat-top honeycomb on dark teal, ~9% cyan-lit cells + exactly one amber cell. Grid is exactly size-periodic by construction (4 column-pairs × 7 rows, ~1% vertical squash) and every hex is drawn at all 9 wrap offsets, so each infinite-grid hex covers the tile exactly once — translucent fills stay uniform and tiling is seamless. Ships with `repeat.set(2, 2)` (~1.4 m hexes on Alpha pad).
  - All bakes use seeded `mulberry32` — deterministic across loads (the inline floor bake they replace used `Math.random()`).
  - Module-level singletons baked once at import; `getProcTextureKit()` returns them (no double-bake). `disposeProcTextureKit()` is permanent for the session — full-teardown only.
- **`src/game/proc/index.ts`** — re-exports makers + singletons + kit.

## Wiring (`TrainingRange.tsx`, merged with parallel builders' wave-3 work)

- **Ground (`DeckFloor`)** — `map` now `getProcTextureKit().floor` at repeat 11 (sole consumer, safe to mutate). Kept the inline canvas-baked `roughnessMap` companion (renamed to `bakeFloorRoughnessMap`, roughness-only); its 4×4 seam grid matches the floor lattice so both align. Replaces flat `#0a141d`.
- **AlphaPad / BetaZone** — pad top circles use `map={hexPad}` (already wired against the kit by the signs builder; locked Beta tint `#7a6a4a` kept). Side drums stay untextured, avoiding cylinder-side UV smear.
- **Terminal** — body box uses `panelTexture` (1 tile/face). Pedestal drum uses a `panel.clone()` with `repeat.set(4, 1)` so panels aren't smeared 14:1 around the circumference; clone shares the canvas image (one extra 256 px GPU upload, no re-bake).

## Constraints honored

- Palette: teal `#3dd6c6` / amber `#f0a830` (single amber cell + single amber tick only) / deep navy bases (`#0d1722`, `#0f2230`, `#0f2231`).
- Mobile-safe: 256–512 px bakes, anisotropy ≤ 8 (floor 4), no postprocessing, one-time bakes (no per-frame canvas redraws in this kit).
- No new npm deps. `ZoneLabel`, `RangeDecor`, `GateUnlockFx`, `TerminalScreen`, `Player`, `LessonOverlay`, `Hud` untouched.
- `npm run build` — green (tsc + vite + spa-fallback).

## Notes / follow-ups

- Pedestal panel clone is not disposed (Slice 0 lifetime, same as the singletons).
- Panel's cyan light strip is diffuse-only; an `emissiveMap` split would make it glow — cheap future win.
- Kit singletons are shared: mutate `repeat`/`offset` only where a texture has one consumer family (documented at `getProcTextureKit`).
