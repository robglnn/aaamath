# Critic report — Visual Gauntlet loops 36–45 (Meshy skyline)

**Date:** 2026-08-05  
**Critic:** fresh-context (Builder ≠ Critic)  
**Method:** Pixel A/B vs `docs/gauntlet/bars/*` (esp. `grok-e13b…` ringed monolith, `grok-34c2…` floating islands, `ref-hud-ability-wheel.jpg`); Downloads UI refs folder empty/missing; native-res captures from **local** `http://127.0.0.1:5173/aaamath/` after ~8–10s GLB load  
**Shots:** `loop36-45-mobile.png` (844×390), `loop36-45-midwalk.png` (844×390), `loop36-45-desktop.png` (1280×720)  
**Baseline:** `loop36-baseline-mobile.png` · Prior tip: `0235b23` (loops 31–35)  
**Curriculum:** frozen — Algebra ignored

## Verdict: PASS_WITH_GAPS

All claimed Meshy skyline props are **on disk and wired** (`MESHY_V = 'm36'`), and local captures show a real delta vs tip `0235b23`: crystal lamps + gold posts populate the near corridor, rocky Meshy island silhouettes poke the teal sky (esp. midwalk/desktop upper-left), monolith moved closer (`z=-42` → `z=-30`) with tip bloom disc + additive halo, SKY/FOG teal-lifted (`#6eb8d8` / `#7ab0c0`), exposure `1.58`, key sun `3.45`, ability glyphs are filled solids (no longer pure stroke wireframes), minimap quadrant CSS/SVG opacities punched.

**Refs still win — clearly, and on the same axis this batch claimed to close.** Against `grok-e13b…` / `grok-34c2…`, the first ~10s composition hero is still our terracotta plaza arch + LOCKED gate + terminal starburst, **not** a spawn-readable ringed cyan monolith owning the skyline. Floating islands remain sparse brown/teal ghosts in fog — not verdant multi-tier landmasses with waterfall mist and triple-sun drama. Exposure+teal lift brightened the plate but also **washes the very skyline props** this batch shipped. HUD moves are real but still lose to `ref-hud-ability-wheel` (chunky circular icons, vivid pizza-slice minimap, populated plaza).

| Loop (inferred from claims/code) | Gap attacked | Did refs still win? |
|----------------------------------|--------------|---------------------|
| **36 Meshy floating islands (×5)** | Primitive cylinder rocks vs Fortnite island skyline | **Partial vs prior** — Draco GLB (~1.27 MB) replaces kitbash cylinders; rocky brown silhouettes readable in midwalk/desktop. **Refs still win hard** — no green tops, no density, no causeway drama; islands stay fog ornaments |
| **37 Meshy skyline monolith + closer place** | Unreadable primitive octahedron stack at z=-42 | **Nudged only** — Meshy mesh + move to z=-30 + tip bloom. From spawn, rings still do not read as the marquee beacon; arch/LOCKED owns midfield; monolith dies as a washed cyan column behind the gate |
| **38 Waterfall cliff** | Missing turquoise flank landmark | **Weak / unread in first-10s** — GLB present (`waterfall-cliff.glb` ~455 KB) at `[-24,0,-20]`, but shoulder-cam captures do not make it a hero read; fog + framing bury it |
| **39 Crystal bloom disc** | Monolith tip bloom / spawn beacon | **Partial** — `crystal-bloom.glb` + additive sphere/plane at tip. Competes with terminal gate bloom; does not convert monolith into `grok-e13b…`-class ringed hero |
| **40 Plaza floor Meshy tiles** | Matte navy plaza vs reflective Fortnite causeway | **Marginal** — only **4** flank `plaza-floor` instances; glowing hex read is still the prior deck. Not a plaza-wide Meshy floor |
| **41 Six crystal lamps** | Empty corridor / weak near-field POIs | **Win vs prior** — lamps readable in first-10s beside banners; best near-field prop win of the batch. Refs still denser (staff forest + NPC honor guard) |
| **42 SKY/FOG teal lift** | Cold navy / weak atmosphere vs island refs | **Partial** — teal horizon family closer to bars. Over-lift + exposure crush hurts skyline silhouette separation |
| **43 Exposure 1.58 / key sun 3.45** | Value ceiling after loop-35 golden hour | **Mixed** — plate is brighter; skyline detail paid for it. Not the multi-sun volumetric bar |
| **44 Filled HUD ability glyphs** | Wireframe slots 1–3 vs chunky Fortnite icons | **Partial** — filled octa/cube/tetra polygons ship; wire is active-only accent. Locked build slot still reads empty/dim; circular chunky ref icons still win |
| **45 Stronger minimap quads** | Whisper quadrant tints | **Overclaimed** — SVG quad opacity ↑ and CSS conic exists, but dark `.gr-minimap-disk` still covers most SVG quads; rim pizza stays soft vs ref vivid sectors |

## Landscape-first check (844×390)

- Captures verified **844×390** landscape (`loop36-45-mobile.png`, `loop36-45-midwalk.png`); desktop **1280×720**.
- **Readable:** AXIOM RISING / RANK·RISER, objective banner, EN/ES/PL, JUMP/DASH cluster (when shown), filled explore + progress glyphs, Meshy player, arch, terminal kiosk, banners, crystal lamps.
- **Marginal / fail at mobile scale:** skyline monolith rings, waterfall cliff, island-top albedo, Meshy plaza-floor tile identity (lost under hex deck), minimap quadrant color vs ref pizza.
- Hard UX constraint holds; **3D skyline legibility did not leap** the way loops 31–35 leaped near-field heroes.

## Pedagogy / Pages guards

- Curriculum frozen — no L8+; Algebra ignored this pass
- `vite.config.ts` `base: '/aaamath/'` intact
- KaTeX **absent** from `index.html`
- `HeroGltf.tsx`: `MESHY_V = 'm36'`; kinds include `monolith|island|waterfall|floor|bloom|lamp`
- `RangeDecor.tsx`: `FloatingIslands` / `CrystalMonolith` / `WaterfallLandmark` / `CrystalLamps` / `PlazaFloorTiles` all `HeroModel` Meshy paths
- Disk sizes (local):  
  `skyline-monolith.glb` 709,136 · `floating-island.glb` 1,268,608 · `waterfall-cliff.glb` 455,476 · `plaza-floor.glb` 407,816 · `crystal-bloom.glb` 312,996 · `crystal-lamp.glb` 271,816  
- Working tree still uncommitted vs tip `0235b23` (expected for critic pass)

## Did Meshy skyline props beat prior primitive islands/monolith in first-10s?

**Yes vs our own primitives — narrowly. No vs the Fortnite bars.**

Side-by-side vs tip `0235b23` / `loop31-35-mobile.png` / baseline: kitbash cylinder islands → Meshy rock silhouettes; octahedron monolith stack → authored GLB + closer placement + tip bloom; corridor gains six crystal lamps. That is a real mesh upgrade.

But the **first-10s pixel job** this batch was hired for — “spawn-readable ringed monolith + saturated floating-island skyline” — is **not** closed. Refs still put a blooming ringed crystal as the composition hero; we still put an orange arch. Islands still read as fog cutouts, not Fortnite landmasses. Waterfall is a ghost. Plaza-floor Meshy is a footnote.

## Remaining LARGEST single gap for loops 46+ (NOT Algebra)

**Spawn-readable skyline composition: make a ringed cyan monolith (or verdant island cluster) the first-viewport hero silhouette — scale/placement/contrast so rings+spire beat the arch/LOCKED/terminal bloom — and give island tops saturated albedo that survives teal fog + exposure 1.58.** Near-field lamps and filled glyphs are done enough; another corridor prop will not close the A/B.
