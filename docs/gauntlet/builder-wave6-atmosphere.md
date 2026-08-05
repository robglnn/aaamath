# Builder — Wave 6 atmosphere FX

**Date:** 2026-08-05  
**Closes:** cheap ambient VFX ask — floating dust near terminal / Alpha pad, no postprocessing

## Delivered (`src/game/AtmosphereFx.tsx`)
- 28 soft additive dust motes (16 over Alpha pad annulus, 12 boxing the terminal kiosk), slow 20–50 s sinusoidal drift + gentle per-mote twinkle
- 12 pad-edge sparkles on the Alpha rim — static positions, sharp pow-curve blink in the color channel only
- One shared 64px canvas-baked radial sprite; linear-space RGB constants matched to scene cyan/amber
- Mounted from `TrainingRange.tsx` (one import line + one JSX line, next to `RangeDecor`)

## Perf posture (mobile-safe)
- 2 `THREE.Points` draw calls, 40 vertices total, zero added lights, zero postprocessing
- Attribute writes throttled to 30 Hz via delta accumulator; positions derive from absolute clock so drift stays phase-correct
- `DynamicDrawUsage` on updated buffers; `depthWrite` off; `frustumCulled` off (bounds would go stale as motes drift)
- Sprite texture module-cached like the other canvas bakes; geometries disposed on unmount

## Build
`npm run build` green (tsc + vite).
