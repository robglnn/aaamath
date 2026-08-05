# Builder notes — Wave 2 mobile touch + mastery celebration

**Date:** 2026-08-05  
**Model tier:** efficiency  
**Scope:** Touch controls, HUD unlock flash, lesson celebration polish. No pedagogy / mastery math / adaptive freeze changes.

## Goal

Polish mobile touch affordances and mastery→unlock celebration without regressing Math Academy lesson clarity. Touch targets ≥48px; Safari-friendly CSS; `prefers-reduced-motion` respected.

## Delivered

### Touch controls (`TouchControls.tsx`, `game.css`)

- **Stick:** 152px base with crosshair guides + dashed inner ring; active state glow on knob; behavior unchanged (`setStick`, pointer capture).
- **Look:** Icon-only `‹` / `›` buttons at 48×48px; full `aria-label` via `lookLeft` / `lookRight`.
- **Sprint / Jump:** min 48px targets; jump wired to new `jump` i18n key (was hardcoded `JUMP`).
- **Move group:** `moveStick` aria-label on stick container.
- **Clutter:** Removed heavy inset glows and uppercase look labels from visible UI.

### HUD unlock flash (`Hud.tsx`, `game.css`)

- **No spurious flash on load:** First sync from `applyMasteryUnlocks` seeds `prevUnlocks` without triggering animation.
- **Deferred during lesson:** Unlock transitions while `mode === 'lesson'` queue in `pendingFlash` and play when player returns to range (fixes flash firing behind overlay and expiring before visible).
- **Richer card:** Tier icon (◆ / ⬡ / ◎), kicker (`unlocksEarned`), localized headline; per-kind radial tint (rank amber, blueprint teal, zone blue).
- **Timing:** 3.2s flash duration.

### Lesson celebration (`LessonOverlay.tsx`, `app.css`)

- **Bug fix:** `celebrating` is now `masteryDone` only — reaching `complete` phase without mastery no longer shows unlock cards.
- **Hierarchy:** Hero block (flare → title → sub → clearance score badge); staggered unlock cards; delayed CTA entrance.
- **Mastery gate:** Slightly stronger bar + cleared-state micro-animation; success criteria / phase rail / KaTeX untouched.

### i18n (`ui.ts`)

- Added `jump`, `moveStick` for EN / ES / PL.

## Files touched

- `src/game/TouchControls.tsx`
- `src/game/Hud.tsx`
- `src/game/game.css`
- `src/lesson/LessonOverlay.tsx`
- `src/styles/app.css` (celebration + mastery gate only)
- `src/i18n/ui.ts`

## Not touched (per assignment)

- `TrainingRange.tsx`, `Player.tsx`
- `useLessonSession.ts` mastery criteria / you_do freeze
- Content JSON

## Build

`npm run build` — verify before merge.

## QA checklist

- [ ] Coarse pointer: stick moves player; look/sprint/jump respond; no overlap with terminal prompt on small screens.
- [ ] Complete lesson without mastery threshold → no celebration unlock list.
- [ ] Master lesson → in-overlay celebration; close overlay → HUD unlock flash visible on range.
- [ ] Reload with saved mastery → no unlock flash on boot.
- [ ] `prefers-reduced-motion: reduce` → animations disabled, content still readable.
- [ ] EN / ES / PL: jump, stick label, unlock strings.
