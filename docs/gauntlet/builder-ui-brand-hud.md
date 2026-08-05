# Builder notes — UI brand + HUD composition

**Date:** 2026-08-05  
**Model tier:** efficiency (`composer-2.5`)  
**Scope:** Slice 0 locked decisions (`docs/decisions.md`) — visual shell only; no pedagogy/content JSON changes.

## Goal

Raise first-viewport composition and HUD hierarchy toward Fortnite-familiar / AAA educational-game bar: one cohesive game world + brand, not a dev panel. Mobile Safari-friendly; touch targets ≥48px on interactive HUD/chrome.

## Delivered

### Composition (dev panel → game shell)

- **Removed** full-width `top-bar` with stacked brand + "Training Range · Slice 0" subtitle.
- **Game fills viewport** (`gr-root` = `100dvh`); `app-root` is a single full-screen layer.
- **Floating chrome** (`app-chrome`): locale switcher + Progress button only, top-right, translucent blur — utility, not spreadsheet header.
- **In-world brand hero** (`GameView`): large centered "Axiom Rising" on first load, animates to subtle top-center watermark after ~2.4s; hides during lesson overlay.

### HUD hierarchy

- **Rank / zone rail** (`gr-hud-rail`): left column below watermark; rank gets amber insignia + larger type; zone "Active" state gets teal glow.
- **Prompts** (terminal, build): center-bottom, 48px min-height, primary interaction tier.
- **Help text** (`gr-help`): 9px, 22% opacity teal — de-emphasized; hidden on coarse pointer (mobile).
- **Status** ("Blueprint online"): top-right, secondary tier.

### Motions (3 intentional, `prefers-reduced-motion` respected)

1. **Brand reveal** — boot screen (`brand-reveal-in` + scanline) and in-game hero (`gr-brand-reveal` → `gr-brand-to-watermark`).
2. **Prompt pulse** — terminal CTA (`gr-prompt-pulse`) gentle border/glow loop when near terminal.
3. **Mastery/unlock flash** — `Hud` detects `hasRank` / `hasBlueprint` / `hasZoneBeta` false→true; full-viewport amber radial + localized banner (`unlockRank` / `unlockBlueprint` / `unlockZone` from `ui.ts`).

### Palette / fonts

- Preserved Orbitron + Source Sans 3, teal/amber sci-fi palette; no new colors or deps.

## Files touched

- `src/App.tsx` — full-viewport layout, floating chrome, boot brand
- `src/game/GameView.tsx` — in-world brand overlay + phase state
- `src/game/Hud.tsx` — unlock flash detection, HUD rail structure, i18n unlock labels
- `src/styles/app.css` — boot reveal, floating chrome, removed legacy game-hud duplicates
- `src/game/game.css` — brand hero, HUD tiers, three motion keyframes, safe-area + reduced-motion

## Build

`npm run build` — verify before push.

## Not in scope

- Lesson overlay styling (separate pass)
- Content JSON / pedagogy
- New dependencies or gamepad
