# Builder — Wave 4: Progress drawer polish (House Standing / theorem seals)

**Date:** 2026-08-05
**Model tier:** efficiency (`kimi-k3-max`)
**Scope:** `src/progress/StandardsView.tsx`, `src/styles/app.css`, `src/i18n/ui.ts`, one-line drawer-head fix in `src/App.tsx`. No TrainingRange / lesson / content changes. No commit (parallel loop commits).

## Goal

Move the Progress drawer further from spreadsheet chrome toward game-native House Standing / theorem status, without losing standards honesty or KP clarity (Math Academy bar).

## What changed

### 1. Rank/standing hero (stronger hierarchy)

- Standing card is now a hero row: **rank sigil medallion** (hollow `◇` dim ring for Recruit, amber-filled `◆` with glow + radial tint once a rank is earned) beside eyebrow / rank name / status line.
- Rank name bumped to 1.35rem Orbitron with a soft amber text-shadow; card gains a faint amber outer glow.
- **Theorem meter** added under the hero: one segment per KP (teal gradient + glow when cleared, dim track otherwise) with visible `{cleared}/{total}` count — aria-hidden meter, numbers stay as real text. Replaces the cryptic `· 3/5` inline suffix on the meta line.
- θ stays tucked under the collapsed "Ability estimate" details (unchanged honesty).

### 2. KP rows → theorem seals (less table-ish)

- Dense border-bottom rows replaced with **seal cards**: rounded panel, 3px status-colored left edge, faint status-tinted gradient wash.
- Each theorem gets a circular **seal medallion** numbered with Roman numerals (I–V): dashed dim ring = Locked, solid amber ring = In training, amber ring + glow = Review due, filled green gradient + glow = Cleared.
- Text status badge kept on every card (Locked / In training / Review due / Cleared) — status is never iconography-only. Review-due date line preserved under the title (`reviewDuePrefix` + app-locale date, carried over from the gap-fix wave).
- Cards get a staggered 40ms fade/slide entrance, gated behind `prefers-reduced-motion: no-preference` (reduce users see no motion).
- Dead CSS removed: `.kp-row`, `.kp-main`, `.status-pip*`, `.standing-theorems`.

### 3. Standards honesty kept visible

- Jurisdiction selector untouched (same store wiring, same 13 jurisdictions), label restyled to an uppercase eyebrow; wrapped in `.academy-row` for spacing.
- Academy audit `<details>` unchanged in content (same `getStandardsCoverage` rows, same badges) but the summary now carries an **evidenced tally chip** (`3/5`) so coverage is visible without expanding.

### 4. Duplicated drawer heading fixed

- `App.tsx` drawer head rendered `houseStanding` (eyebrow) + `progress` (h2) — both resolve to "House standing" in every locale. Eyebrow now uses new key `compactRecord`: "Compact record" / "Registro del Compacto" / "Rejestr Kompaktu".

### 5. Touch + mobile

- All `<summary>` tap targets (Ability estimate, Academy audit, Clear conditions) now `min-height: var(--tap-min)` (48px) flex rows.
- `.badge` is `white-space: nowrap; flex-shrink: 0` — ES "Repaso pendiente" wrapped to two lines inside seal cards at 390px before the fix.
- Seal cards are 4rem min-height rows; medallion 2.75rem; verified at 390px viewport with audit expanded.

## i18n

- Added `compactRecord` (EN/ES/PL). All other keys (`recruitRank`, `reviewDuePrefix`, `theoremsTitle`, …) were already landed by the critic-gap-fix wave and are reused.

## Verification

- `npm run build` — green (tsc + vite) when the tree is stable (see incident note).
- Browser-checked against dev server: Recruit state (hollow sigil, 0/5 dim meter, dashed locked seals), seeded mastered state (earned amber sigil, 4/5 lit meter, green seals, due-review seal + date, in-training seal), ES locale at 390px with audit expanded (single-line badges, `Registro del Compacto` header, `vence 4/8/2026` localized date).

## Incident note (parallel-loop collision)

Mid-wave the orchestrator committed interim states (`ca415ab`, `08ced34`, `354195a`) from a buffer that predated some of my edits, which dropped the seal-card CSS block, the `.kp-details summary` rule, the `compactRecord` key, and the `App.tsx` eyebrow fix from the working tree (StandardsView.tsx markup survived). All four were re-applied in place; working tree is whole again.

## Left for critic

- Drawer still EN-hardcodes nothing new; `noStandardsMapped` path unchanged.
- Theorem meter is per-KP binary (cleared/not) — a partial-progress variant could reflect streaks later, but current honesty bar prefers exact cleared counts.
