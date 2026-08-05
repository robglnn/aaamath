# Builder — Wave 15 L2 mastery HUD chips

**Date:** 2026-08-05

## Goal

When Lesson 2 unlocks are present in `blob.unlocks`, show small in-world HUD status chips so L2 mastery feels rewarded without new 3D props.

## Changes

### `src/game/Hud.tsx`

- Reads `blob.unlocks` from the progress store (not GameView flags — L2 is progress-only per wave 13).
- Renders up to three chips in `gr-hud-rail` when ids are present:
  - `bp.pad.rail` → blueprint chip (⬡)
  - `rank.riser.adept` → rank chip (◆)
  - `zone.beacon.cyan` **or** `zone.beta.annex` → zone chip (◎)
- Titles come from `lesson2.unlocks` via `pickLocalized`; legacy `zone.beacon.cyan` falls back to the L2 zone unlock title in the package.

### `src/game/game.css`

- Added `.gr-l2-chip` (+ `--rank`, `--blueprint`, `--zone`) — compact adept-tier styling distinct from L1 gold rank / teal zone chips.

## Out of scope

- No GameView / 3D prop wiring for L2 blueprint rail or zone annex.
- No unlock flash animation for L2 (L1 flash path still keyed on GameView flags).

## Verification

```bash
npm run build
```

Green.
