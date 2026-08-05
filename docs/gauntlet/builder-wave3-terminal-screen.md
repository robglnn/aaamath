# Builder — Wave 3 terminal screen texture

**Date:** 2026-08-05  
**Goal:** Make the Algebra Terminal screen feel alive with procedural canvas animation.

## Delivered

- **`src/game/TerminalScreen.tsx`** — self-contained screen plane component:
  - 256×148 canvas texture (sRGB, no repeat — single quad)
  - Soft cyan grid + major grid lines
  - Fake equation fragments (Courier, cyan/amber flicker)
  - Corner chrome brackets + amber status tick
  - Animated horizontal scanline sweep (2.4s cycle)
  - Radial vignette for depth
  - `useFrame` redraw throttled to every **4 frames**; `texture.needsUpdate = true`
- **`TrainingRange.tsx`** — Terminal screen plane replaced with `<TerminalScreen ref={screenMat} />`; `nearTerminal` emissive pulse unchanged on the material ref.

## Constraints honored

- No new dependencies
- Safari-safe 2D canvas only (no bloom, no postprocessing)
- Minimal `TrainingRange` diff — screen plane mesh children only
- Parallel-builder safe: floor/pad texture work stays in `TrainingRange` / `canvasTextures.ts`

## Build

`npm run build` — green before merge.
