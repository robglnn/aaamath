# Builder notes — Visual Gauntlet loops 6–10 (sculpted PBR)

**Date:** 2026-08-05  
**Base:** `5846083` (prior Fortnite visual loops 1–5)  
**Scope:** Visual/UI/feel only. Curriculum frozen (no L8+). Landscape-first mobile.

## Loop map

| Loop | Largest gap attacked | Change |
|------|----------------------|--------|
| **6** | Kitbash hero silhouettes | Blender rebuild: bevel+subdiv player/terminal/blueprint/zone; Principled PBR (navy/gold/cyan emissive); Draco GLB export |
| **7** | Flat night void lighting | ACES tone mapping + exposure 1.22; warmer key/rim lights; daylight sky bake + longer fog |
| **8** | Missing juice vs Fortnite refs | Soft god-ray wedges; denser motes/sparkles; ability-wheel pulse; gold minimap ring |
| **9** | Diegetic HUD / plaza read | Crest inner highlight; warmer plaza floor bake; runtime emissive boost on hero mats |
| **10** | Player surface still flat at distance | Panel albedo textures + smart UV; closer FOV 48 / dist 4.85 shoulder cam |

## Assets

| File | Approx size | Notes |
|------|-------------|-------|
| `public/models/riser-player.glb` | ~208 kB | Draco + panel maps |
| `public/models/algebra-terminal.glb` | ~51 kB | Draco PBR terminal |
| `public/models/blueprint-pad.glb` | ~28 kB | Hex pad + holo |
| `public/models/zone-marker.glb` | ~36 kB | Beacon |

Script: `tools/blender/rebuild_heroes_pbr.py`  
Draco decode: gstatic 1.5.7 via `HeroGltf.tsx`

## Guards

- `base: '/aaamath/'` unchanged
- KaTeX still deferred (LessonOverlay lazy)
- `npm run content:validate` → 7/7 passed
- No Lesson 8+ / no new KP waves
- LandscapeGate retained; critic shots at 844×390

## Shots

- `docs/gauntlet/_critic-shots/loop6-10-desktop.png`
- `docs/gauntlet/_critic-shots/loop6-10-mobile.png`
