# Builder notes — Visual Gauntlet loops 11–15 (organic character)

**Date:** 2026-08-05  
**Base:** `6be29d0` (loops 6–10 sculpted PBR)  
**Scope:** Visual/UI/feel only. Curriculum frozen (no L8+). Landscape-first mobile.

## Loop map

| Loop | Largest gap attacked | Change |
|------|----------------------|--------|
| **11** | Hard-surface kitbash silhouette vs Fortnite organic skins | Blender organic rebuild: sphere/capsule athletic body, skin head, thin armor overlays, messy hair spikes |
| **12** | Flat unbaked materials | Procedural panel albedo + AO + normal maps mixed into cloth/armor Principled; Draco GLB |
| **13** | No cloth vs armor material split | `AR_SuitCloth` (fabric) vs `AR_ArmorPlate` (metal) + runtime boosts in `HeroGltf` for cloth/armor/hair/skin/visor |
| **14** | Character read at distance | Closer shoulder cam (dist 4.35, FOV 46), warm/cool hero rim lights, rank pip re-align |
| **15** | Hair silhouette + loud panel grid | Denser hair volume/spikes; subtler navy panel mix (sparse gold filigree) |

## Assets

| File | Approx size | Notes |
|------|-------------|-------|
| `public/models/riser-player.glb` | ~237 kB | Organic Draco player + embedded maps |
| `tools/blender/rebuild_player_organic.py` | — | Rebuild script (loops 11–15) |

Terminal / blueprint / zone GLBs unchanged from loops 6–10.

## Guards

- `base: '/aaamath/'` unchanged
- KaTeX still deferred; L1–L7 pedagogy untouched
- `npm run content:validate` → 7/7 passed
- No Lesson 8+ / no new KP waves
- LandscapeGate retained; critic shots at 844×390

## Shots

- `docs/gauntlet/_critic-shots/loop11-15-desktop.png`
- `docs/gauntlet/_critic-shots/loop11-15-mobile.png`
- `docs/gauntlet/_critic-shots/loop11-15-midwalk.png`
