# Builder notes — Visual Gauntlet loops 16–25 (sculpt + plaza)

**Date:** 2026-08-05  
**Base:** `cba32f5` (loops 11–15 organic character)  
**Scope:** Visual/UI/feel only. Curriculum frozen (no L8+). Landscape-first mobile.

## Loop map

| Loop | Largest gap attacked | Change |
|------|----------------------|--------|
| **16** | Soft silhouette vs hard sphere seams | Higher subdiv body, waist/deltoid/elbow joint overlaps |
| **17** | Flat materials / no tech-suit read | Authored ORM (roughness/metallic) + cyan emissive piping (chest/arms/shins/spine) |
| **18** | Box-helm / no face | Skin head with eyes, pupils, brows, jaw; slim visor band only |
| **19** | Cone-spike hair vs Fortnite cards | Thin ribbon hair cards + volume clump + spike accents |
| **20** | Box armor plates | Contoured flattened-sphere armor hugging the body |
| **21** | Dark hub vs daylight plaza refs | Exposure 1.36, brighter hemi/ambient/key, warmer sky bake |
| **22** | Empty mid-field vs banner density | 8 Academy plaza banners (pole + cloth + gold crest + cyan trim) |
| **23** | Flat charcoal deck / sparse horizon | Warmer stone floor, brighter seal etch, crystal-ring distant spires |
| **24** | Circular HUD vs Fortnite ability/minimap juice | Hex ability slots + tray, quadrant minimap fill, stronger crest glow |
| **25** | Distant hero read / thin atmosphere | Closer cam (dist 4.05, FOV 44), stronger rims, denser motes (52) |

## Assets

| File | Approx size | Notes |
|------|-------------|-------|
| `public/models/riser-player.glb` | ~496 kB | Draco sculpt player + albedo/AO/normal/ORM |
| `tools/blender/rebuild_player_sculpt.py` | — | Rebuild script (loops 16–20) |

Terminal / blueprint / zone GLBs unchanged.

## Guards

- `base: '/aaamath/'` unchanged
- KaTeX still deferred; L1–L7 pedagogy untouched
- No Lesson 8+ / no new KP waves
- LandscapeGate retained; critic shots at 844×390
- Player GLB ~496 kB Draco — still iPhone-budget class

## Shots

- `docs/gauntlet/_critic-shots/loop16-25-desktop.png`
- `docs/gauntlet/_critic-shots/loop16-25-mobile.png`
- `docs/gauntlet/_critic-shots/loop16-25-midwalk.png`
