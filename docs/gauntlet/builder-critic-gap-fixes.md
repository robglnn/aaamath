# Builder — Critic gap fixes (brand, i18n, gate FX)

**Date:** 2026-08-05  
**Scope:** Three largest critic gaps only (no scope expansion).

## 1. Brand hero → watermark cross-fade

- **Files:** `src/game/game.css`, `src/game/GameView.tsx`
- **Change:** Split hero and watermark into two layers. Hero runs `gr-brand-hero-exit` (scale down, fade, drift up); watermark runs `gr-brand-watermark-in` at top-center. Removed no-op `gr-brand-to-watermark` stub.
- **Result:** No hard jump-cut at 2.4s; `prefers-reduced-motion` still disables animations.

## 2. Rank / zone identity localization

- **Files:** `src/progress/StandardsView.tsx`, `src/game/Hud.tsx`, `src/i18n/ui.ts`, `src/content/loadLesson.ts`
- **Change:** Resolve rank from `pkg.unlocks` via `pickLocalized`; recruit fallback via `recruitRank` (EN/ES/PL). Hud rail uses package titles for rank + zone; objectives, blueprint status, zone-active suffix, and review-due prefix localized in all three locales.
- **Result:** No raw `rank.riser.initiate` slug; no hardcoded English in drawer centerpiece or HUD rail/objectives.

## 3. Zone Beta gate FX timing

- **File:** `src/game/TrainingRange.tsx`
- **Change:** `GateUnlockFx` reads `mode` from `useGameStore.getState()` inside `useFrame` (avoids stale closure). Existing `prev === null` init skips replay on hydrate; `pending` defers burst while `mode === 'lesson'`.
- **Result:** Burst fires when player returns to explore, not under lesson overlay; no replay on already-unlocked saves.

## Build

`npm run build` — green after these changes.

## Left uncommitted

- `docs/gauntlet/builder-wave2-proc-textures.png` (untracked asset)
- `docs/gauntlet/critic-wave2-visuals.md` (untracked critic report)
