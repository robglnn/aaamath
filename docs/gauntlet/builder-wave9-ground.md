# Builder — Wave 9 ground breakup (Alpha→terminal corridor)

**Date:** 2026-08-05
**Closes:** critic gap — *ground breakup*: the hex pad + infinite grid still read as one endless sheet between Alpha and the terminal (critic-wave5-density / critic-wave6-atmosphere: "authored silhouette, trim, decals, ground breakup").

## Provenance note

A partial wave-9 draft landed on disk mid-session (same brief, same file — same pattern as wave 5). Its placements were unaudited: plates at `[-2.4,3.8]` / `[2.6,3.2]` sat on the spawn→terminal diagonal, two more clipped through both `ApproachRails`, and its cable trays ran *inside* the rail corridor on the walk line. Replaced with the audited placements below; kept the draft's gate-threshold stripe idea (realized as `HazardStripes` pad 3 with a real baked stripe texture instead of flat amber glow planes). Duplicate `GroundBreakup` definition + duplicate mount removed; build re-verified after the merge.

## Delivered

### `src/game/RangeDecor.tsx` — new `GroundBreakup` (17 meshes, 0 lights, 0 `useFrame`)

- **`FloorPlates`** (4 plates × 2 meshes = 8) — 5 cm deck service plates mapped with the shared proc `panel` bake (bevels, seams, bolts read as authored replacement panels), plus one inset cyan edge strip facing the corridor. Placements: `[-2.3,0.6]` west flank, `[-1.9,-2.9]` SW under the conduit run, `[4.1,-2.3]` terminal service apron (0.2 m clear of the pedestal), `[5.9,-6.6]` off-pad deck flanking the gate approach.
- **`CableTrunks`** (2 runs × 3 meshes = 6) — 5 cm steel channel + cyan feed / amber return cables, parallel to and *outside* both guide rails (`x −4.5` and `x 4.9`). Deliberately static so the pulsing `EnergyConduits` keep the motion role.
- **`HazardStripes`** (3 pads × 1 mesh = 3) — 2.2 cm pads at the terminal base SW/SE (`[1.3,-4.7]`, `[3.7,-4.0]`, angled to bracket the pedestal) + one pad-rim threshold at `[2.0,-6.5]` flanking the gate walk. Same bake drives `map` + `emissiveMap` (0.22): amber bands glow faintly, dark bands emit ~nothing.

### `src/game/proc/canvasTextures.ts` — `makeHazardStripeTexture(w=256,h=128)`

Deterministic (seeded `mulberry32`), sRGB, RepeatWrapping; 45° amber `#f0a830` / near-black bands + wear speckle. Exported via `proc/index.ts`. Mapped 1:1 per pad (no tiling requirement).

## Seating discipline (the wave-5 "buried conduits" lesson)

- All groups seat via `surfaceY(x,z)`; mesh bottoms sit at `surfaceY + 0.012` — on-pad that is 0.132, flush with the 0.13 hex circle; off-pad it is 0.012, just above the 0.01 grid plane. Nothing straddles the rim: on-pad footprints stay inside r 5.6 (hex circle), off-pad pieces stay beyond r 6.5 (clear of the r 6.0–6.35 pad skirt).
- Walk path stays open: every piece is off the `(0,4)→(2.5,-3.5)` diagonal and outside the `x ±3.2` rail corridor; spawn ring stays empty. All placements hand-audited against posts, rails, conduits, crates, pillars, terminal pedestal (r 0.85), and the pad skirt.

## Perf posture

+17 meshes / draw calls, +0 point lights, +0 per-frame work (no `useFrame`, no allocations), +1 one-shot 256×128 canvas bake (reuses the shared `panel` kit texture otherwise). No postprocessing; palette unchanged. Does not touch `AtmosphereFx` — floor hardware sits below the mote drift band and shares no buffers.

## Build

`npm run build` green (tsc + vite + spa-fallback).

## Constraints honored

- `RangeDecor.tsx` + one additive proc-texture export; `TrainingRange.tsx` untouched
- <25 new meshes (17); no commit (builder handoff)

## Notes / follow-ups

- **Bundled in the wave-9 commit (not this builder's surface):** vite `onlyExplicitManualChunks` + `react-vendor` chunk so lazy GameView stays lazy — see `builder-wave8-codesplit.md` / wave-10 notes. Preserved from the superseded stub version of this doc.
- **Observed while seating (pre-existing, out of scope):** the terminal proximity ring renders at world y 0.04 while the pad's hex circle surface is at 0.13 — the ring is inside the pad drum and likely occluded from above. If the critic confirms it's invisible in play, the fix is one line (raise ring local y to ~0.14), left for a future wave since it touches `Terminal` in `TrainingRange.tsx`.
- Natural next beat if more breakup is wanted: continue one cable trunk past the rim with a step-down coupler (wave-5 noted the same for conduits), or panel-map the two on-pad supply crates to match the plate language.
- Not exercised end-to-end: mobile touch pass / physical-device check of emissive levels (visuals verified via build + placement audit against `world.ts` constants).
