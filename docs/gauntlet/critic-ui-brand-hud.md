# Critic report — First-viewport brand composition + HUD hierarchy/motion

**Artifact:** `src/App.tsx`, `src/game/GameView.tsx`, `src/game/Hud.tsx`, `src/styles/app.css`, `src/game/game.css` (builder notes: `docs/gauntlet/builder-ui-brand-hud.md`)
**Critic:** Gauntlet CRITIC (fresh context; did not build this)
**Date:** 2026-08-05
**Reviewed at:** HEAD `ffab87d` (brand/HUD slice landed around `9679f2b`; wave-2 HUD additions verified against HEAD). Working tree was hot with sibling wave-3 edits (`TrainingRange.tsx`, `src/game/proc/`); all findings below re-verified against HEAD via git/ripgrep after discarding two stale snapshot reads.

## Verdict: PASS_WITH_GAPS

Composition, hierarchy, touch targets, and overlay coexistence all land. The dent is motion: the slice's signature brand handoff is a stub that jump-cuts on every load.

## Bar comparison

| Bar | Status | Evidence |
|-----|--------|----------|
| 1. First viewport = one composition, brand hero-level, not dev panel | Pass (with polish dent) | Boot brand screen while hydrating (`App.tsx` 24–32); full-viewport `gr-root`/`app-root` (100dvh); floating chrome = locale + Progress only, translucent blur (`app.css` 135–161); in-world hero `gr-brand` → top-center watermark (`GameView.tsx` 170–175, `game.css` 23–60); no top-bar/dev panel anywhere. Dent: hero→watermark exit is a hard cut (see largest gap); desktop lock-hint button competes with hero center stage for the same 2.4s. |
| 2. HUD hierarchy clear (rank/zone > prompts > help) | Pass | Top-center objective pill + rank(amber)/zone(teal) rail top-left (`Hud.tsx` 96–123, `game.css` 109–198) > center-bottom 48px glowing prompt / buildbar (`Hud.tsx` 139–174) > 9px / 22%-opacity help hidden on coarse pointer (`game.css` 509–523, 696–699). Status "Blueprint online" secondary top-right; chrome reads as utility. Visual emphasis correctly runs prompt > rail when prompt present (Fortnite-familiar). |
| 3. 2–3 intentional motions, reduced-motion respected | Gap | Intended three: brand sequence, prompt pulse, unlock flash. Prompt pulse = gentle 2.4s border/glow loop ✓. Unlock flash = radial + card punch, deferred until after lesson via `pendingFlash`, first-mount guard prevents false fire on hydrate, `role="status"` aria-live ✓. **Brand hero→watermark transition is a no-op** (see largest gap) ✗. Reduced-motion coverage at HEAD is genuinely good: `game.css` 715–738 (brand, pulse, flash *card*, stick knob, `:active` transforms) + `app.css` 1187–1199 (lesson focus/feedback/celebrate/unlock cards). |
| 4. Touch targets ≥48px; readable on phone | Pass (conditional collision) | All interactive HUD/chrome ≥48px: prompt, buildbtn, buildbar buttons, lock-hint, look arrows 48×48, sprint, jump 88px, chrome-btn, locale-btn (`--tap-min` + explicit mins). Non-interactive pills are 40px (not targets — fine). Readability weakest at 11px Orbitron rail/objective text — glanceable, borderline-acceptable. **Conditional:** on ≤~360px coarse screens with unlocks present, `.gr-objective` (centered, max-width 86vw, top ≈3.35rem) overlaps the rank/zone rail pills and `.gr-status-placed` (top ≈2.75–3.25rem); no coarse media query repositions it. First-time players (empty rail) unaffected. |
| 5. Does not fight lesson overlay or 3D readability | Pass | Brand hides via `gr-brand-hidden`; `mode='lesson'` freezes input, exits pointer lock; unlock flash suppressed during lesson and replayed after close; objective hidden in lesson and near terminal (swaps cleanly to the E prompt); z-order sane: overlay 200 > drawer 100 > chrome 12 > flash 8 > controls 6 > hud 5 > brand 4; pointer-events disciplined (HUD/brand none, interactive children auto). |

## Largest gap

**The hero→watermark brand transition is not a motion — it's a jump cut, every load, on the product's title.**

`@keyframes gr-brand-to-watermark` animates nothing: `from { opacity: 1; filter: blur(0) }` → `to { opacity: 1; filter: blur(0) }` (`game.css` 89–98). Meanwhile `GameView.tsx` flips the class at 2.4s (`setBrandPhase('watermark')`, line 42), and the layout properties (`inset` → `top/left/translateX`, `game.css` 46–53) plus the title's `font-size` drop (clamp 2rem→0.7rem floor, line 56) apply **instantly** — there is no `transition` on `.gr-brand`. So the 9vw glowing hero holds at full opacity, then pops to a tiny watermark in a single frame. The keyframe name proves the motion was intended; the shipped implementation is a stub, and `builder-ui-brand-hud.md` claims it "animates to subtle top-center watermark," which is false as delivered.

This is the highest-frequency, highest-visibility motion in the game (every session, dead center of the first viewport), so it single-handedly keeps bar 3 — and the polish dimension of bar 1 — below the AAA bar.

**Fix direction:** simplest mobile-Safari-safe route is a cross-fade — render hero and watermark as separate elements, fade/scale the hero out (transform+opacity only) while fading the watermark in over ~0.5s. Alternatively drive the whole 0→3.3s sequence from one real CSS animation (interpolate font-size/translate), or FLIP-measure the two states. Either way, implement or delete the stub keyframes.

## Secondary gaps (by severity)

1. **Top-row collision on small phones:** `.gr-objective` vs `.gr-hud-rail` / `.gr-status-placed` overlap on ≤~360px coarse viewports once rank/status exist. Add a coarse media query: shrink objective max-width, drop it below the rail, or truncate rail pill text.
2. **Desktop first-viewport competition:** `.gr-lock-hint` (top 42%, centered) renders over the brand hero for the same 2.4s window. Sequence it — reveal the hint after watermark phase.
3. **Doc drift:** `.gr-objective` HUD tier (wave 2) is absent from `builder-ui-brand-hud.md`; the same doc asserts the watermark animates.
4. **Dead hooks:** `data-tier` attributes in `Hud.tsx` (98, 108) have no CSS consumers.
5. **Double brand reveal:** boot-screen reveal + in-game hero reveal play back-to-back within seconds. Consider skipping the in-game reveal when the boot screen already showed, or shortening it.
6. **Naming smell (regression seed):** keyframes `gr-unlock-flash-text` are applied to `.gr-unlock-flash-card` (`game.css` 234). The earlier reduced-motion selector miss on this element (fixed at HEAD) came from exactly this name/selector drift — rename keyframes to `gr-unlock-flash-card`.
7. *(Out of scope, flagged for the lesson pass)* `.lesson-close` sets `min-width: 2.5rem` (40px), overriding `.btn`'s 48px — sub-48 close target.

## Notes

Reduced-motion handling at HEAD deserves credit: both stylesheets now cover the in-world motions, the unlock-flash card, stick knob, `:active` transforms, and all lesson/celebrate animations — that bar item is the strongest part of the slice. Unlock-flash deferral across the lesson boundary (`pendingFlash` + first-mount `syncReady` guard) is the right design and works.
