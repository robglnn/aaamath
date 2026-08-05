# Critic report — Wave 2 visuals (signs, decor, player)

**Date:** 2026-08-05  
**Critic:** fresh-context gauntlet CRITIC (Builder ≠ Critic; no `src/` edits)  
**Judged commits:** `ffab87d` (wave 2 ship) and prior `2e6db91` (wave 1 range FX)  
**Judged surface:** **live** `https://robglnn.github.io/aaamath/` after Actions deploy `30994591166` (headSha `ffab87d`) succeeded. Local `npm run dev` was running but the working tree had **uncommitted** `TrainingRange.tsx` WIP during review — local was **not** treated as the ship artifact.  
**Method:** Playwright first-viewport screenshots (live primary); HTTP/asset probe of Pages; code spot-check of mastery celebration gating in `LessonOverlay.tsx` at `ffab87d`.

## Verdict: PASS_WITH_GAPS

Wave 2 closes wave-1’s largest gap: in-world **ZONE ALPHA / ZONE BETA LOCKED** are readable text (drei/troika `Text` in the shipped commit), and the HUD adds a real **Objective · …** mission strip. Decor, sky/fog, and a chunkier Riser silhouette clear the remaining wave-1 bars. Gaps remain around **runtime CDN font dependence** for those signs and mid-distance set density.

## Single largest remaining visual gap

**Zone sign literacy still depends on a runtime jsDelivr/troika font fetch.**  
Live network shows troika resolving Latin WOFF via `cdn.jsdelivr.net/gh/lojjic/unicode-font-resolver@…`. When that path succeeds, signs read; if CDN is blocked, slow, or offline, plates go mute and wave-1’s “glyph bar” failure mode returns. HUD objectives survive that failure; in-world Fortnite-style signage does not.

## Screenshot notes (what I saw)

**Live** (`critic-wave2-live-range.png`, Playwright; cold load post-deploy of `ffab87d`):

- Soft navy sky / stars / fog; teal grid floor; warm key + cyan rim — not a flat unlit void.
- **ZONE ALPHA** cyan plaque left of spawn — readable string (not a glyph slab).
- **ZONE BETA LOCKED** amber plaque on/near the amber gate — readable; partially crowded by gate frame from spawn camera.
- Terminal: cyan beam + diamond beacon still strongest interactable cue.
- Pad rings under player; light posts, crates, distant spires / horizon ring present (RangeDecor).
- Player: boxy helm, amber visor band, cyan chest/shoulder accents, backpack volume, limb segments — clearly past naked capsule.
- HUD: Orbitron **Axiom Rising**; center **Objective · Reach the Algebra Terminal**; footer WASD/Shift/Space/look/yaw/E. DOM confirm: `.gr-objective` present after settle.

**Local** during review was contaminated by dirty-tree WIP (canvas-bake experiments / missing `Text` import in the working copy) and produced Canvas `Text` constructor errors — **ignored for ship judgment**. Judge live = `ffab87d`.

## Pages URL health

| Check | Result |
|-------|--------|
| `https://robglnn.github.io/aaamath/` | **200**, title `Axiom Rising`, boots into training range |
| Vite `base` `/aaamath/` | Correct — HTML refs `/aaamath/assets/index-rX5159w1.js` / `index-3OUEhARM.css` |
| Asset HEAD | JS **200**, CSS **200**, favicon **200**; Google Fonts CSS/WOFF2 **200** |
| Deploy | Actions “Ship wave 2…” `30994591166` **success**, headSha `ffab87d` |
| Bundle spot-check | Live JS contains `ZONE ALPHA`, `gr-objective`, `Reach the Algebra`; ZoneLabel uses drei Text (`fontSize:0.22`, outline) |

No broken base-path 404s on app assets observed. Troika font CDN is an **external** dependency (see largest gap), not a Pages 404.

## Bar comparison

| Bar | Status | Evidence |
|-----|--------|----------|
| Fortnite training-range — readable objectives (ZONE ALPHA/BETA text + HUD strip) | **Pass (fragile)** | Live screenshots + DOM: text signs + `.gr-objective`. Fragility: troika CDN fonts. |
| Valerian optimistic sci-fi readability (decor, sky, lighting) | **Pass** | Soft sky/fog/stars, RangeDecor posts/crates/spires/horizon, teal/amber emissives, clear beacons. |
| Player silhouette past capsule | **Pass** | Chunk torso/helm/visor/pack/limbs in live viewport and shipped `Player.tsx`. |
| Pedagogy non-regression (mastery celebration unlocks) | **Pass (code spot-check)** | `celebrating = masteryDone`; unlock cards render only under `celebrating`; `lessonFinished && !celebrating` still offers exit without unlock reveal. No lesson playthrough exercised. |
| Pages health | **Pass** | Deploy green; HTML/JS/CSS/favicon 200; app boots. |

## What improved vs wave-1 critic (glyph labels)

| Wave 1 (`critic-wave1-visuals.md`) | Wave 2 (`ffab87d`) |
|------------------------------------|--------------------|
| Zone “labels” = emissive glyph slabs; strings only in scene-graph names | drei `Text` signs: **ZONE ALPHA** / **ZONE BETA LOCKED** readable in-camera |
| No objective/mission card in first viewport | HUD **Objective · Reach the Algebra Terminal** (then blueprint / Zone Beta copy as unlocks progress) |
| Hierarchy OK; signage literacy fail | Signage literacy **met** when troika fonts load |
| Player past capsule but primitive | Clearer Riser kit (visor, pack, shoulders, limb swing) |
| Bare-ish mid-field | RangeDecor + soft sky dome / horizon |

## Scope note

First-viewport / cold-load training range + code read of celebration gating. Did not run a full lesson→mastery playthrough, unlock walkthrough of Zone Beta payoff FX, or mobile touch pass. Dirty working-tree edits after `ffab87d` were out of scope for this verdict.
