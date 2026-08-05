# Builder notes — Lesson terminal + Progress drawer UX

**Date:** 2026-08-05  
**Model tier:** efficiency (`cursor-grok-4.5-medium`)  
**Scope:** Lesson overlay, MathText/KaTeX, progress drawer, light touch controls. No lesson JSON / pedagogy structure changes.

## Goal

Raise Lesson terminal + Progress drawer toward AAA educational-game / Fortnite-familiar bar while staying mobile Safari-friendly. One focus job per screen state; game-native language over spreadsheet chrome.

## Priority A — Lesson terminal

### Phase rail (game-native, not form wizard)

- Replaced pill “tabs” with a connected **phase rail**: lit links + chips (Brief → I do → We do → You do → …).
- Active chip is high-contrast teal fill; cleared chips amber — reads as run path, not wizard steps.

### One focus job per state

| State | Focus |
|-------|--------|
| Objectives | Mission brief only |
| Teach (no item) | Tutor body + hear tutor |
| Challenge (item) | Stem + answer; coach note collapsed on first item |
| You-do | Clearance bar + challenge |
| Mastery | Celebration + unlock reveal only |

### Feedback

- Punchier banners: lead (“Nailed it” / “Not yet”) + actionable sub-line + solution hint when wrong.
- Scale-in motion; stronger success/danger borders.

### Mastery → unlock reveal → range CTA

- Celebration panel: flare + “Clearance earned” + staggered unlock cards (blueprint / rank / zone tones).
- Primary footer CTA: **Return to range** (EN/ES/PL synced). Overlay stays open until that CTA (critic gap closed earlier; celebration now visible and earned-feeling).

### KaTeX clarity

- `.math-text` / `.math-inline` / `.math-block` wrappers: larger type, high-contrast glyphs, block math in padded panels with horizontal scroll on narrow Safari.

## Priority B — Progress drawer

- Drawer framed as **House standing** (not admin Progress sheet).
- **Rank standing** card first; theorem cleared count at a glance; θ tucked under “Ability estimate”.
- KP list = **Theorem completeness** with status pips.
- Jurisdiction standards under **Academy audit · Compact standards** (collapsed details) — coverage kept, spreadsheet feel reduced.
- EN/ES/PL chrome updated in lockstep in `src/i18n/ui.ts`.

## Touch polish (quick wins)

- Larger stick (138px) + safe-area insets.
- Hold **Sprint** → `touchSprint` in game store.
- **Look L / Look R** yaw buttons on coarse pointer.
- Jump bump; build/prompt raised so they clear new controls.

## Files touched

- `src/lesson/LessonOverlay.tsx` — rail, focus states, celebration, feedback
- `src/lesson/MathText.tsx` — math wrapper classes
- `src/styles/app.css` — lesson + KaTeX + drawer standing styles
- `src/progress/StandardsView.tsx` — house/academy framing
- `src/App.tsx` — drawer eyebrow (merged with brand-HUD chrome)
- `src/i18n/ui.ts` — EN/ES/PL string sync + new keys
- `src/game/TouchControls.tsx`, `store.ts`, `Player.tsx`, `game.css` — sprint/yaw/stick

## Constraints honored

- No changes to `content/lessons/**` math/pedagogy structure
- EN/ES/PL keys kept in sync
- Parallel brand-HUD edits to `App.tsx` / `game.css` merged carefully

## Verify

```bash
npm run build
```
