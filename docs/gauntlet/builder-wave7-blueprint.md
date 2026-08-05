# Builder — Wave 7 blueprint pad/ramp fidelity

**Date:** 2026-08-05  
**Closes:** critic consensus gap — authored prop/material fidelity on the placeable blueprint piece

## Delivered (`src/game/BlueprintGhost.tsx`)

### Placed blueprint (solid)
- **Base slab** — `hexPad` proc map, cyan emissive tint; still the `baseMat` pop/flash target
- **Center plate** — inset `panel` circle + diamond glyph ring (emissive accent)
- **Edge rails** — four `panel`-mapped perimeter caps + corner post caps
- **Ramp** — `panel`-mapped body (`rampMat` pop/flash target) with five tread grooves + lip trim
- Outer payoff ring unchanged (post-pop settle)

### Ghost (hologram)
- Dual-layer shell (outer faint + inner core) with offset emissive pulse
- Wireframe top grid, moving additive scan band, diamond glyph ring
- Additive edge-rail wireframes + ramp tread ghosts
- Footprint ring + corner brackets retained; opacity bumped slightly for distance read
- Still fully translucent (`depthWrite: false`); no postprocessing

### Preserved
- `placeNonce` → `playBlip('place')` + `placeBlueprint` unchanged
- `easeOutBack` scale pop, emissive flash decay, shockwave ring, point-light pulse — same refs/timing on `baseMat` / `rampMat` / `popRef`

## Perf posture
- ~+22 meshes only while ghost visible or after place (single instance); shared `getProcTextureKit()` singleton — no extra bakes
- Ghost scan band animates in existing `useFrame` branch (build mode only); placed settle still zeroes per-frame work after ~0.7s

## Build
`npm run build` green (tsc + vite).
