# Builder — Wave 4 Web Audio stubs

**Date:** 2026-08-05

## Delivered
- `src/game/audio.ts` — zero-asset synth: `ensureAudio()`, `playBlip(kind)`, `setAmbient(on)`
  - Master gain gate (~9% peak; ~25% of that when `prefers-reduced-motion: reduce`)
  - Oscillator + noise blips; soft dual-sine + filtered noise ambient pad
  - `AudioContext` resume on first `pointerdown` / `keydown` (Safari/iOS)
- Wired hooks (minimal touch):
  - **Terminal prompt** — `Hud` plays `prompt` when `nearTerminal` becomes true
  - **Terminal open** — `GameView.openTerminal` plays `open` (E key or HUD button)
  - **Blueprint place** — `BlueprintGhost` plays `place` on successful placement
  - **Unlock flash** — `Hud.showFlash` plays `unlock`
  - **Ambient** — `GameView` enables pad in explore; fades out when `lessonOpen`

## Design choices
- No MP3s / no new deps; volumes kept low so STT/TTS in lessons stay usable
- Ambient pauses while lesson overlay is open (lesson speech gets the sound stage)
- Blips retry once after async `context.resume()` on first gesture

## Build
`npm run build` green.

## Files touched
- `src/game/audio.ts` (new)
- `src/game/GameView.tsx` — ambient lifecycle, `ensureAudio` on pointer down, open blip
- `src/game/Hud.tsx` — prompt + unlock blips
- `src/game/BlueprintGhost.tsx` — place blip
