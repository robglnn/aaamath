# Builder — Wave 8 player material fidelity

**Date:** 2026-08-05  
**Closes:** critic gap — player torso reads flat vs authored props (terminal, blueprint)

## Delivered (`src/game/Player.tsx`)

### Panel texture on torso plates
- **Chest plate** — shared `getProcTextureKit().panel` map; `BODY` tint + existing `MAT_BODY` emissive/roughness
- **Backpack** — same `panel` map; lifted tint `#1a4255` (vs flat `SHADE`) + `MAT_PACK` metalness

### Preserved
- Silhouette geometry unchanged (chunk plates, pack volume, boot blocks, helm)
- Amber visor bands + cyan chest core / shoulder strips / pack accent — untouched
- Run / idle bob / jump pose animation — no physics or `useFrame` logic changes
- Blob shadow, movement, `groundHeight`, unlock logic — unchanged

## Perf posture
- Single shared proc kit singleton (no extra bakes); `useMemo` once per Player mount
- +0 meshes; only material `map` on two existing boxes

## Build
`npm run build` green (tsc + vite).

## Constraints honored
- `Player.tsx` only; `TrainingRange.tsx` not touched
- No commit (builder handoff)
