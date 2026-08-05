# Builder notes — Wave 5 lesson overlay delight

**Date:** 2026-08-05  
**Model tier:** efficiency  
**Scope:** Phase rail hierarchy, mastery bar celebration, celebrate panel motion/layout. No pedagogy / mastery criteria / adaptive freeze / content JSON changes.

## Goal

Polish the lesson overlay for Math Academy clarity (I → We → You ladder) and game-native delight on mastery fill + celebration — without touching `useLessonSession` logic, TrainingRange, or Player.

## Delivered

### Phase rail (`LessonOverlay.tsx`, `app.css`)

- **Track fill:** Bottom progress track reflects `phaseIndex / (phases - 1)`; fills to 100% on celebrate.
- **Teaching ladder:** `i_do` / `we_do` / `you_do` chips use `is-teach` — larger type, stronger active glow, thicker inter-step connectors.
- **Bookends:** Brief / Recall / Cleared use `is-bookend` — slightly smaller, muted until done.
- **You do emphasis:** `is-mastery` amber tint when active; distinct from teal teach phases.
- **Connectors:** `lit` for completed segments; `active-link` highlights the edge into the current step.

### Mastery bar (`LessonOverlay.tsx`, `app.css`)

- **Bump on progress:** `independentCorrect` increment triggers short `is-bump` on gate + fill pop + shine sweep (700ms).
- **Fill motion:** Wider bar, eased width transition, looping subtle shine; extra burst on bump.
- **Cleared state:** `is-met` when `masteryMet` — green-tinted gate border/background and tri-color fill gradient.
- **Reduced motion:** All bump/shine/transition animations disabled under `prefers-reduced-motion: reduce`.

### Celebrate panel (`LessonOverlay.tsx`, `app.css`)

- **Still gated on `masteryDone` only** — no change to unlock-card eligibility.
- **Backdrop:** Pulsing teal/amber rings + three staggered spark glyphs behind hero.
- **Hero stagger:** Title → sub → score badge animate in sequence after flare.
- Unlock card stagger + CTA timing unchanged from wave 2.

## Files touched

- `src/lesson/LessonOverlay.tsx`
- `src/styles/app.css` (phase rail, mastery gate, celebrate sections)

## Not touched (per assignment)

- `src/lesson/useLessonSession.ts` — mastery math, you_do freeze, adaptive ordering
- `src/game/TrainingRange.tsx`, `src/game/Player.tsx`
- Content JSON
- `src/i18n/ui.ts` — existing strings sufficient

## Build

`npm run build` — green (2026-08-05).

## QA checklist

- [ ] Phase rail: Brief → I do → We do → You do reads as a clear ladder; You do amber when active.
- [ ] Bottom track fill advances with phase; full on celebration.
- [ ] You do: each independent correct answer bumps bar; shine visible; no motion when reduced-motion on.
- [ ] Mastery threshold met → gate turns green-ish; celebration panel shows rings/sparks + staggered hero.
- [ ] Complete lesson **without** mastery → no celebrate unlock list (unchanged).
- [ ] EN / ES / PL phase labels still fit on narrow screens (ellipsis on chip label).
