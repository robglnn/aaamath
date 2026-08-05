# Critic — Lesson terminal + Progress drawer UX wave

**Date:** 2026-08-05
**Artifact commit:** `9679f2b` (lesson terminal + progress drawer, game-native pass)
**Reviewer:** fresh-context critic (did not build this)
**Verdict: PASS_WITH_GAPS**

## Largest gap (single)

**Rank identity leaks raw IDs and hardcoded English in the drawer's centerpiece.**
`useProgressStore` persists rank unlocks as content IDs (`blob.unlocks.ranks` ← `unlock.id`), and `StandardsView.tsx:47,70` renders `unlocks.ranks[0]` directly as the rank name. Post-mastery every locale sees the raw slug **"rank.riser.initiate"** instead of the localized title that already exists in `content/lessons/algebra-i-01/package.json` ("Riser Initiate" / "Ascendente Iniciado" / "Wznoszący Inicjat"). Pre-mastery the fallback is hardcoded English `"Riser Initiate" / "Recruit"` (StandardsView.tsx:70), and Hud.tsx:102 hardcodes "Riser Initiate" + "Zone Beta · Active" in all locales. The rank standing card is the first card in the "House standing" drawer — the most visible surface this wave reframed — and it breaks bars 5 (game-native language) and 6 (EN/ES/PL parity) simultaneously.
**Fix sketch:** resolve `unlocks.ranks[0]` against `pkg.unlocks` (id → `pickLocalized(title, locale)`); add `recruitRank`, `reviewDue`, `zoneBeta` keys to `src/i18n/ui.ts`; use them in `StandardsView.tsx` and `Hud.tsx`.

## Bar-by-bar

### 1. KaTeX clear on mobile — PASS
- `.math-inline .katex` 1.12em → 1.18em and `.math-block .katex` 1.22em → 1.28em at ≤480px; high-contrast glyphs (`#f0fbfd`/`#f5fcfd`) on dark panels; element colors forced to `inherit`.
- `.math-block` is a padded panel with `overflow-x: auto` + `-webkit-overflow-scrolling: touch` — wide display math scrolls on narrow Safari instead of clipping.
- `.math-focus` (1.05em) and `.item-stem` (1.08rem mobile) bumps keep instruction prose at parity with math size.

### 2. I/We/You flow game-native, low cognitive load — PASS (nits)
- Phase rail (Brief → I do → We do → You do → Recall → Cleared) with lit connector links, teal active chip, amber cleared chips — reads as a run path; `aria-current="step"` present; horizontal no-scrollbar overflow on small screens.
- One focus job per state is real in code: `itemFocus` / `teachFocus` / `celebrating` gates hide the lesson title and non-essential chrome; coach note collapses into `<details>` on the first item only.
- Nits:
  - `mastery-hint` renders a cryptic unlabeled trailing number: "Solo challenges · 2/4 · 1" (`needed` with no label) — low-cognitive-load miss.
  - ≤480px chip labels truncate at 4.5rem — PL "Przypomnienie" ellipsizes ("Brief…" family survives).
  - you_do renders the clearance gate and the challenge panel simultaneously (defensible context, but two jobs on screen).

### 3. Feedback punchy + actionable — PASS (nits)
- Lead ("Nailed it" / "Not yet") + sub-line ("Clean hit — keep the streak." / "Miss — study the fix, then advance.") + per-choice/content feedback + action line + worked solution; scale-in motion, strong success/danger borders, `aria-live="assertive"`.
- Nits:
  - `tryAgainHint` is unreachable: `showSolution` is set true on every incorrect answer, so the ternary always picks `reviewSolutionHint`. Dead string in 3 locales.
  - Short-answer wrong feedback prefix is hardcoded inline in `useLessonSession.ts:163-168` (pre-existing; covers all 3 locales but bypasses `ui.ts`).

### 4. Mastery celebration → unlock → return-to-range — PASS
- Celebration is gated on independent-correct + KP evidence (feels earned), overlay stays open (`App.tsx` `onMastered` intentionally no-op), flare + "Clearance earned" + score, staggered unlock cards with blueprint/rank/zone tones, single localized footer CTA **Return to range**. Header × remains as an acceptable escape hatch.

### 5. Progress drawer game-native — GAPS (see largest gap)
- Good bones: House standing framing, rank card first, theorem count at a glance, θ tucked under collapsed "Ability estimate", KP list as "Theorem completeness" with status pips, standards collapsed under "Academy audit · Compact standards".
- Defects beyond the largest gap:
  - Drawer header duplicates itself: eyebrow (`houseStanding`) and h2 (`progress`) both resolve to "House standing" / "Posición de la casa" / "Pozycja domu" (`App.tsx:75-76`) — same string rendered twice stacked.
  - `due {date}` hardcoded EN prefix + `toLocaleDateString()` uses the browser locale, not the app locale (StandardsView.tsx:122).

### 6. EN/ES/PL string parity — GAPS
- `ui.ts` is structurally sound: `Record<Locale, Record<UiKey, string>>` makes parity compile-enforced; all new wave keys (rail, focus, celebration, standing, touch) exist in ES/PL with sensible game-native translations.
- Parity leaks found (all outside `ui.ts`):
  1. `StandardsView.tsx:70` — hardcoded `"Riser Initiate" / "Recruit"` rank fallback.
  2. `StandardsView.tsx:47` — post-mastery rank renders raw ID `rank.riser.initiate` in all locales (localized titles in content JSON unused).
  3. `StandardsView.tsx:122` — hardcoded `"due "` prefix.
  4. `Hud.tsx:102,110` — hardcoded "Riser Initiate", "Zone Beta · Active".
  5. `useLessonSession.ts:163-168` — wrong-answer prefixes inline (3 locales present, but off-book; pre-existing).
- Dead keys defined ×3 locales, never consumed: `next`, `masteryGate`, `kpStatusTitle`, `speechUnavailable`, `lessonComplete` (drift risk, not a parity break).

### 7. Touch controls on coarse pointer — PASS (nits)
- Coarse-pointer gate (`pointer: coarse` || `ontouchstart`); 152px stick with pointer capture and safe-area insets; 88px jump; ≥48px hold-sprint with capture + `pointercancel` cleanup; discrete Look L/R yaw buttons; canvas drag-look already exists as the primary touch-look path (`GameView` pointer drag → `setLookDelta`), so the buttons are secondary. z-index 6; prompt/build buttons raised in the coarse media query to clear the controls.
- Nits: look buttons fire one step per tap (no hold-repeat); `gr-look-cluster` group `aria-label` reuses `lookLeft`; builder doc claims 138px stick but CSS is 152px (doc drift).

## Build status caveat

`npm run build` is **red at the current worktree**, but every error is in in-flight wave2 3D-range files (`src/game/TrainingRange.tsx` modified; untracked `src/game/proc/`) that this artifact does not own — none of the artifact's 14 files appear in the error output. Did not isolate-verify `9679f2b` to avoid disturbing the active parallel worktree.

## Verdict

**PASS_WITH_GAPS** — the lesson terminal flow, feedback, celebration, KaTeX clarity, and touch layer meet the bar; the progress drawer ships with a raw-ID/hardcoded-English rank identity in its most prominent card (largest gap), plus small i18n leaks and a duplicated drawer heading.
