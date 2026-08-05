# Critic report — Wave 1 visuals (training range)

**Date:** 2026-08-05  
**Critic:** fresh-context gauntlet CRITIC (no product-code edits)  
**Judged surface:** **local** `http://localhost:5173/aaamath/` (`npm run dev`) **and** live Pages after deploy of `2e6db91` completed mid-review. Working tree had no uncommitted game WIP; live lagged only briefly while Actions run `30994054192` finished, then matched local.  
**Method:** Playwright screenshots of first viewport (live + local); HTTP probe of Pages HTML/assets; spot-check `TrainingRange` zone labeling vs what the camera actually shows.

## Verdict: PASS_WITH_GAPS

Wave 1 clears the “not capsule-era bare grid” bar and sells a readable pad → terminal → gate hierarchy in color/light. It still misses Fortnite-grade **readable objectives** because in-world zone “labels” are glyph bars, not text.

## Single largest remaining visual gap

**Objectives are color-coded, not readable.**  
`ZONE ALPHA` / `ZONE BETA` strings exist only as scene-graph names; `ZoneLabel` renders emissive slab glyphs (“stand in for text without font atlases”). A first-viewport player sees a floating teal bar and an amber gate, not named objectives or a mission strip. Hierarchy works; Fortnite training-range *signage literacy* does not.

## Screenshots notes (what I saw)

**Local** (`critic-wave1-local-range.png` under user Playwright root) and **live post-deploy** (`critic-wave1-live-postdeploy.png`) match:

- Dark void floor with subtle teal grid; soft key light from upper-right; not a flat unlit plane.
- Player: dark rounded body, amber pill eyes, chest plate — past a naked capsule, still primitive.
- **Pad:** concentric cyan floor rings under the avatar (clear spawn/home cue).
- **Terminal:** low console + vertical cyan beam + floating diamond marker — strongest interactable beacon in frame.
- **Gate:** translucent amber rectangular frame + ground ring — locked-zone / next-area cue, distinct from cyan pad/terminal.
- **“Zone label”:** thin horizontal teal slab to the left — reads as a prop, not “ZONE ALPHA”.
- HUD: Orbitron **AXIOM RISING**, EN/ES/PL + House Standing, center “Click to look · Esc releases”, footer WASD/Shift/Space/look/yaw/E terminal. No objective/mission card in the first viewport.
- Optimistic teal/amber sci-fi palette is coherent and high-contrast (Valerian-adjacent readability).

## Pages URL health

| Check | Result |
|-------|--------|
| `https://robglnn.github.io/aaamath/` | **200**, title `Axiom Rising`, app boots into training range |
| Vite `base` `/aaamath/` | Correct — HTML refs `/aaamath/assets/index-*.js` / `.css`, favicon `/aaamath/favicon.svg` |
| Asset HEAD | favicon **200**, JS **200**, CSS **200**; Google Fonts CSS **200** |
| Deploy | Actions “Deploy GitHub Pages” for `2e6db91` succeeded during review (`30994054192`); live ≈ local after refresh |

No broken base-path 404s on app assets observed.

## Bar comparison

| Bar | Status | Evidence |
|-----|--------|----------|
| Fortnite training-range feel — readable objectives, pad/terminal/gate hierarchy | **Partial** | Hierarchy **pass** (cyan pad / cyan terminal beam / amber gate). Readable objectives **gap** (glyph bars + no objective HUD). |
| Valerian optimistic sci-fi readability | **Pass** | Teal/amber emissives, Orbitron brand, dark atmospheric void, clear interactable beacons. |
| Not capsule-era bare grid | **Pass** | Terminal beam, gate FX, pad rings, key light/shadows, improved player silhouette — clearly past bare cyan grid + capsule. |

## Scope note

Judgment is first-viewport / cold-load training range only (no lesson overlay, no unlock walkthrough of Zone Beta payoff FX). Unlock-gated Beta holo/scan/path studs were not exercised in-camera this pass.
