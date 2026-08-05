# Builder — Wave 3 procedural materials + terminal screen

**Date:** 2026-08-05

## Delivered
- Canvas-baked floor maps + sky/horizon atmosphere in `TrainingRange.tsx` (offline-safe; no troika CDN font)
- Canvas neon `ZoneLabel` faces (readable from spawn, lighter than drei Text)
- `src/game/proc/canvasTextures.ts` kit: noise floor / panel / hex pad — wired onto Alpha/Beta pads + terminal body
- `TerminalScreen.tsx` — animated math-glyph screen (throttled canvas redraw)
- `GateUnlockFx` deferred until `mode !== 'lesson'` so payoff plays when player returns to range (critic-ui-3d-range gap)

## Build
`npm run build` green (~1.44MB JS).

## Notes
- Prefer canvas labels over troika for Safari/offline + bundle
- `proc-preview.html` is a local scratch preview — do not ship
