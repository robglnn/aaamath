# Critic report — Visual Gauntlet loops 36–55 (final)

**Date:** 2026-08-05  
**Critic:** fresh-context (Builder ≠ Critic)  
**Prior critic:** `critic-loop36-45-skyline.md` (PASS_WITH_GAPS — spawn composition still arch-owned)  
**Method:** Pixel A/B vs `docs/gauntlet/bars/*` (`grok-e13b…` ringed monolith, `grok-34c2…` island plaza, `ref-hud-ability-wheel.jpg`) + delta vs `loop36-45-*.png`  
**Shots:** `loop36-55-mobile.png` (844×390), `loop36-55-desktop.png` (1280×720), `loop46-52-mobile.png` (844×390), `loop46-52-midwalk.png` (844×390)  
**Builder claims:** `builder-loop36-55-meshy-skyline.md` · Curriculum frozen — Algebra ignored

## Verdict: PASS_WITH_GAPS

Loops 46–55 are a **real composition delta** vs the loop-36–45 plate, and the disk/code ledger matches builder claims (`MESHY_V = 'm53'`, new GLBs, monolith `[9,0,-19]` scale 1.55, waterfall `[-16,0,-14]` scale 1.35, exposure `1.5`, fog `42/132`, minimap disk `rgba(…,0.32)`).

**But refs still win the job this wave was hired for.** Prior critic’s largest gap was: make a ringed cyan monolith (or verdant island cluster) the **first-viewport hero** — beat arch / LOCKED / terminal bloom. That gap is **narrowed, not closed**. The monolith is now a readable off-axis silhouette with tip bloom + overlay torii; mesas thicken the horizon; crates densify the pad. The terracotta plaza arch + LOCKED glyph still own dead-center composition. Flower-island “verdant tops” do not survive first-10s as Fortnite landmasses. God-ray juice is code-real and pixel-soft. Minimap disk alpha dropped, yet the CSS shell stays dark — pizza still loses to `ref-hud-ability-wheel`.

| Loop | Gap attacked | Pixel / disk result | Refs still win? |
|------|--------------|---------------------|-----------------|
| **46** Monolith `[9,0,-19]` · scale 1.55 · thicker rings · larger bloom | Arch owns composition; monolith unread behind gate | **Win vs prior** — large cyan tiered spire readable in mobile/desktop first-10s off the walk axis; tip bloom + torus overlays present in code. **Not the composition hero** — eye still locks player → orange arch → LOCKED | **Yes** — `grok-e13b…` puts ringed cyan as marquee center; we still put arch |
| **47** 3× `flower-island` closer | Island tops unread / fog ornaments | **Partial** — GLB on disk (452,788 · `F03DC7D88CB0`); 3 placements wired near `-16…-20` z. Spawn/midwalk read rocky/mesa silhouettes more than saturated flower tops | **Yes** — bars are verdant multi-tier landmasses |
| **48** Waterfall `[-16,0,-14]` · scale 1.35 | Waterfall ghost | **Weak in first-10s** — placement/scale verified; shoulder-cam captures do not make turquoise cliff a hero flank read (fog + framing) | **Yes** — unread vs bar waterfall/mist drama |
| **49** Exposure 1.50 · fog 42/132 · cooler FOG `#6a9cb0` | Over-lift washes skyline | **Held** — `toneMappingExposure: 1.5`, fog args `[FOG, 42, 132]` live. Plate still bright; skyline props survive better than loop-36–45 wash, but horizon haze still softens mesa/island albedo | **Partial** — atmosphere closer; not multi-sun volumetric bar |
| **50** Cam height +0.16 · lookY +0.10 | Camera buries skyline | **Nudged** — live rig `height = 2.28`, `lookY = p.y + 1.24`. Skyline mass more visible than 36–45 baseline; shoulder framing still plaza-first | **N/A vs bars** — framing improved vs self |
| **51** Meshy `supply-crate` ×6 | Primitive crates | **Win vs prior** — GLB (350,412 · `825EE590797B`); cyan/gold crates readable on pad flanks in all four shots | **Near-field only** — refs denser with NPCs/honor guard |
| **52** +2 banners (8 total) | Thin banner rhythm | **Held** — 8 Meshy banner placements in `PlazaBanners`; red/gold posts readable left/right of arch | **Partial** — bars use multi-color banner forests |
| **53** Meshy `mesa-cluster` ×2 | Sparse skyline mass | **Win vs prior** — GLB (379,424 · `81BA94247806`); rocky buttes readable left/rear horizon in mobile + midwalk (best skyline-mass win of 46–55) | **Partial** — mass helps; still not floating-island density of `grok-34c2…` |
| **54** Ray / sun-glow opacity juice | Soft god-rays | **Overclaimed in pixels** — additive wedges + sun halos present (`opacity ~0.11–0.14` / sun glow `0.30`). Captures read bright plate, **not** crepuscular streak drama of bars | **Yes — hard** — bars own volumetric rays |
| **55** Minimap disk alpha ↓ · quad fills ↑ | Disk covers pizza | **Partial** — SVG `.gr-minimap-disk` = `rgba(6,16,24,0.32)`; quads `opacity: 0.95` with ~0.6 fills. CSS `.gr-minimap` shell still `rgba(6,14,22,0.82)` — sectors stay muted vs ref vivid pizza | **Yes** — `ref-hud-ability-wheel` still wins |

## Disk / code ledger (verified)

| Claim | Result |
|-------|--------|
| `MESHY_V = 'm53'` | **Pass** — `HeroGltf.tsx` |
| New GLBs flower / crate / mesa | **Pass** — sizes + SHA256 prefixes match builder table exactly |
| Monolith `[9,0,-19]` scale 1.55 + bloom 2.0 + rings | **Pass** — `CrystalMonolith` |
| Waterfall `[-16,0,-14]` scale 1.35 | **Pass** — `WaterfallLandmark` |
| Exposure 1.50 | **Pass** — `GameView.tsx` `toneMappingExposure: 1.5` |
| Fog 42 / 132 · FOG `#6a9cb0` · SKY `#6eb8d8` | **Pass** — `TrainingRange.tsx` |
| Minimap disk transparency | **Pass (SVG)** / **Partial (shell)** — disk 0.32; container still 0.82 |

## Landscape-first check (844×390)

- Captures verified landscape mobile / midwalk **844×390**; desktop **1280×720**.
- **Readable:** AXIOM RISING / RANK·RISER, objective banner, EN/ES/PL, filled ability glyphs, Meshy player, arch, terminal, banners, crystal lamps, **monolith flank**, **mesa horizon**, **supply crates**, translucent minimap.
- **Marginal / fail at mobile scale:** waterfall identity, flower-island verdant albedo, god-ray streaks, minimap quadrant pizza vs ref, monolith rings-as-marquee (spire body reads; ringed-beacon read is soft).

## Pedagogy / Pages guards

- Curriculum frozen — no L8+; Algebra ignored this pass
- `vite.config.ts` `base` default `'/aaamath/'` intact
- KaTeX **absent** from `index.html`
- Draco Meshy heroes only for new skyline/pad props (no Rodin/Hyper3D kitbash fakes)
- Working tree uncommitted (expected for critic pass) — **no commit made**

## Did loops 46–55 close the prior critic’s largest gap?

**Partially.** Prior tip: spawn-readable ringed cyan monolith / verdant island cluster as first-viewport hero, beating arch. Monolith is now spawn-readable and mesas add mass — best skyline progress since loops 31–35 near-field heroes. Composition **hero slot** is still the orange arch + LOCKED. Verdant flower tops and bar-class rays remain unpaid.

---

**Remaining LARGEST single gap:** Convert first-viewport composition so a ringed cyan monolith (or saturated verdant island cluster) owns the dead-center skyline silhouette — scale/contrast/camera so it beats the terracotta arch + LOCKED + terminal bloom — and punch crepuscular god-ray / multi-sun drama until the plate matches `grok-e13b…` / `grok-34c2…`; near-field crates/banners/lamps and minimap alpha tweaks are done enough.
