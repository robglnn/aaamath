# Critic report — Overnight wave (progress reactivity + pointer-lock + adaptive stub + visuals + deploy)

**Date:** 2026-08-05
**Critic:** fresh-context gauntlet review (no code edits)
**Commits reviewed:** `a4b4bb8` (overnight progress wiring, pointer-lock, deploy path), `be9859a` (build placeable without pointer-lock; Pages CI fix)
**Method:** read source in `src/progress/*`, `src/lesson/*`, `src/game/*`, `content/lessons/algebra-i-01/package.json`, `docs/adr/004-standards-tags.md`, `.github/workflows/deploy-pages.yml`; hand-computed the 1PL ordering paths. Build not re-run by critic (builder notes + CI-fix commit claim green; treat as unverified-by-critic but plausible).

## Orchestrator follow-up (same night)

Closed largest gap: `you_do` queue now snapshots Rasch order on phase entry (`youDoQueue` in `useLessonSession.ts`); live θ no longer reshuffles under `itemIndex`. Pointer-lock rejection handled. Critic verdict below remains the pre-fix review; treat re-sort defect as **fixed pending next critic**.

## Verdict: PASS_WITH_GAPS

All eight claimed deliverables exist in real code and substantially work. Reference bars 1–3 are met on the happy path; bar 4 is met in mechanism but the adaptive implementation has a structural defect that can produce exactly the blocked grind the bar forbids. That defect is the single largest remaining gap (below).

## Claims checklist

| # | Claim | Status | Evidence |
|---|-------|--------|----------|
| 1 | Progress UI reactivity (kpStates subscription) | **Real** | `src/progress/StandardsView.tsx:28-30` subscribes `kpStates`/`lessonStates`/`thetaStub`; coverage recomputes per render (`:43`). `void kpStates` (`:44-45`) is ugly but functional. |
| 2 | introduceLessonKps on lesson open | **Real** | `src/lesson/LessonOverlay.tsx:38` fires on load; `src/progress/store.ts:189-208` moves `not_introduced → in_progress` for all 5 lesson KPs and lesson → `in_progress`. |
| 3 | Live 1PL thetaStub + you_do Rasch ordering | **Real but defective** | `store.ts:125-130` θ update (lr 0.35, clamp ±3); `src/lesson/useLessonSession.ts:76-91` sorts `you_do` by `raschInfo(θ, b)`, memo depends on `theta` (`:115-118`); content has varied b (-0.7/0/0.1/0.2 on the four `you_do` items). Defect = largest gap below. |
| 4 | Spaced nextReviewAt / due_review | **Real (stub-grade)** | `store.ts:147-153` (streak mastery schedules review), `:216-225` (completeLessonMastery schedules + grows interval ×ease, cap 30d), `:200-205` (past-due mastered → `due_review`, evaluated only at lesson open). UI: `StandardsView.tsx:102-104` "due" chip; i18n `statusDueReview` in en/es/pl (`src/i18n/ui.ts:90,139,188`). |
| 5 | Pointer-lock mouse-look + pitch | **Real** | `src/game/GameView.tsx:76-81,110-117` click-to-lock; `:57-61` movementX/Y → `setLookDelta`; `src/game/store.ts:69-73` yaw+pitch with clamps (-0.55..0.45, sens 0.0022); `src/game/TrainingRange.tsx:14-33` CameraRig applies yaw orbit + pitch (height `3.0+pitch*2.4`, lookAt offset). Esc release + Q/C yaw fallback (`GameView.tsx:88-104`). Touch stick/jump (`TouchControls.tsx`, coarse-only) and drag-orbit (`GameView.tsx:118-140`) retained. Build B / place F-or-Enter (`:94-97`), tap-place on touch. |
| 6 | Visual lift | **Real (qualitative pass)** | `src/game/Player.tsx:152-201` torso/limbs/pack/helm + amber visor, jump-scaled blob shadow; `TrainingRange.tsx` terminal w/ tilted emissive screen, scanlines, rotating beacon, proximity ring reactive to `nearTerminal` + point light; Beta zone locked/unlocked accents; animated barrier; hemisphere+ambient+2 directionals+fog+stars; HUD key-cap prompts, letterspaced chips (`src/game/game.css`). Clearly past bare cyan-grid + capsule. |
| 7 | GH Pages workflow | **Real** | `.github/workflows/deploy-pages.yml` — standard `upload-pages-artifact@v3` + `deploy-pages@v4`, correct permissions/concurrency; `vite.config.ts:10` `base: './'` suits project Pages. Not executed by critic. |
| 8 | ADR-004 standards tags | **Real** | `docs/adr/004-standards-tags.md` — honest best-effort-union decision, CCSS anchors, no-endorsement consequence. Content carries per-jurisdiction maps; selector has 13 jurisdictions (`StandardsView.tsx:8-22`). |

## Reference bars

| Bar | Status | Evidence / notes |
|-----|--------|------------------|
| 1. Pedagogy — after mastery, drawer shows KPs mastered + standards evidenced; opening lesson moves KPs off `not_introduced` | **PASS** | `introduceLessonKps` covers open-lesson transition. `completeLessonMastery` masters all `requiredKpIds`, which equal all 5 lesson KPs (`package.json:2125-2131` vs `:28-34`), so `getStandardsCoverage` (`store.ts:275-281`) flips codes to `evidenced` (`due_review` counted as mastered). Reactive re-render confirmed. Caveat: reaching mastery is jeopardized on some paths by the gap below. |
| 2. Controls — click pointer-lock mouse-look desktop; touch stick works; build B/F | **PASS** | See claim 5. Typing-target guards on both keyboard paths; `lessonOpen` freezes input and exits lock (`GameView.tsx:40-49`). Pitch is modest (camera height ±~1.1, lookAt ±0.27 — not a deep vertical look), acceptable for Fortnite-lite. |
| 3. Visuals — better than bare cyan-grid + capsule | **PASS** | Cohesive teal/amber sci-fi palette, reactive terminal lighting, limb/helm silhouette, animated gate. Remaining cheapness: in-world zone "labels" are abstract glyph bars — the strings `ZONE ALPHA`/`ZONE BETA` exist only as scene-graph names (`TrainingRange.tsx:134-154`), so signage isn't readable. HUD does carry a real "Zone Beta · Active" text chip (`Hud.tsx:23-27`). |
| 4. Adaptive — θ or item ordering live while mastery gate remains | **PASS in mechanism, AT RISK in practice** | θ is genuinely live: updates per answer, displayed in drawer (`StandardsView.tsx:71-74`), and re-orders `you_do` items (strong θ → harder items first; weak θ → easier first; verified by hand-computation). Mastery gate unchanged (3/4 independent + all required KPs evidenced, `useLessonSession.ts:121-129`). **But the live re-sort destabilizes the queue — see largest gap.** |

## Single largest remaining gap: mid-phase re-sort of `you_do` items vs positional `itemIndex`

`itemsForPhase` re-sorts the `you_do` queue on **every θ change** (memo dep `theta`, `useLessonSession.ts:115-118`), while progression is positional (`itemIndex`) and `answeredItemIds` is tracked but **never used to filter** (`:107`, `:164`). Root cause: the queue mutates under a positional cursor.

Consequences, all reachable in normal play (i_do/we_do answers warm θ before `you_do`, so exact behavior is path-dependent):

1. **Stem/feedback mismatch.** After each `recordAnswer`, θ shifts; when the sort order flips, `currentItem = phaseItems[itemIndex]` silently becomes a *different item* while the feedback banner still shows the previous item's feedback (controls disabled by `lastResult`).
2. **Duplicate presentation.** An already-answered item can slide back under the cursor and be answered again (nothing consults `answeredItemIds`).
3. **Skipped item → false blocked grind.** Worked example (mixed profile: intro items correct, two guided wrong, θ≈0.12 entering `you_do`): order starts `[translate, eval, distinguish, variable]`; first correct answer re-sorts to `[eval, translate, distinguish, variable]`; the student then advances through translate-again, distinguish, variable — 4/4 correct, but the **eval item is never answered**, so `kp.eval.expression` + `kp.orderops.with-vars` are never evidenced (`evidencedKpIds`, `:170-175`) and `masteryMet` stays false despite flawless independent work. Lesson drifts to `complete` with no mastery, no unlocks, and the complete panel still lists the unlock rewards (`LessonOverlay.tsx:292-305`) — the precise "talented path blocked grind" bar 4 exists to prevent. The pure all-correct canonical path (θ≈0.7 at entry) keeps a stable order and masteries correctly, which is why this still nets PASS_WITH_GAPS rather than FAIL — but the defect is structural, not numeric.

**Suggested fix (next wave, small):** freeze the adaptive order at `you_do` phase entry (snapshot θ once per phase entry instead of depending on live θ), and/or make progression item-keyed: filter `answeredItemIds` out of the sorted queue and derive `currentItem` as the first unanswered item. Either kills all three symptoms without touching the mastery gate.

## Smaller gaps (do not block Slice 0)

- **Zone labels unreadable** — glyph bars only (evidence above). Fine aesthetically, oversold in the claim wording.
- **`requestPointerLock()` rejection unhandled** (`GameView.tsx:80`) — Chrome's ~1.3s re-lock cooldown after Esc will throw unhandled promise rejections; console noise only.
- **`due_review` only evaluated at lesson open** (`store.ts:200-205`) — no timer/hydration sweep; a KP due mid-session waits for the next open. Disclosed stub behavior; acceptable.
- **Interval growth only in `completeLessonMastery`** (`store.ts:225`) — the streak-mastery path (`:147-153`) schedules but never grows `intervalDays`. Consistent-enough for a stub.
- **Unlock list renders on any completion** (`LessonOverlay.tsx:292-305`) — shown even when mastery wasn't met (pre-existing, now more visible via the skip bug).
- **θ updates on guided/i_do items too** — actually beneficial (warms the sort), but worth noting it means the "adaptive" ordering is sensitive to pre-`you_do` performance, which is the correct Rasch behavior.
- **`lessonStates[].phaseIndex` never written by the session** — mid-lesson resume isn't wired; fine for Slice 0 scope.

## What holds up (fair credit)

- The progress reactivity fix is the right shape: subscribe to data, recompute coverage; mastery → drawer evidence chain is complete end-to-end and jurisdiction-aware.
- Pointer-lock implementation is clean: coarse-pointer gating, lock-hint UI, lesson-mode freeze + lock release, keyboard fallbacks, HUD prompts that stop propagation. Touch path genuinely preserved.
- Visual pass is a real lift, not a recolor: reactive emissives, beacon animation, proximity ring, barrier sink animation, silhouette + visor, blob shadow physics.
- ADR-004 is admirably honest about unaudited standards codes.
- Deploy workflow is textbook-correct for Vite + Pages (`base: './'`).

## Bottom line

Ship-shape Slice 0 wave: every claimed feature exists, bars 1–3 pass, bar 4's mechanism is live. **PASS_WITH_GAPS.** Fix the `you_do` re-sort/positional-index interaction before any gauntlet demo that answers items at mixed difficulty — it is the only defect found that can convert a strong run into an unmastered, unrewarded lesson.
