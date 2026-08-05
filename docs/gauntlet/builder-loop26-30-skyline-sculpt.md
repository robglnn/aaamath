# Builder notes — Visual Gauntlet loops 26–30 (skyline + sculpt)

**Date:** 2026-08-05  
**Base:** `beb8ffc` (loops 16–25 sculpt + plaza)  
**Scope:** Visual/UI/feel only. Curriculum frozen (no L8+). Landscape-first mobile.

## Loop map (claimed)

| Loop | Largest gap attacked | Change |
|------|----------------------|--------|
| **26** | Stacked-sphere silhouette vs single-mesh sculpt | Voxel-remesh fusion of torso (chest/abdomen/waist → `Player_TorsoSculpt`) and hips (pelvis/thighs → `Player_HipsSculpt`); broader chest / narrower waist; bigger pauldrons + rim skirts; faceted cyan chest gem in gold bezel; short flared cape card + piping trim + gold clasp |
| **27** | Flat horizon vs floating-island skyline | 5 floating islands (tapered 7-sided rocks, cyan anti-grav glow cones, crystal obelisks / amber wisp lamps, 2 causeway struts, gentle bob); ringed crystal monolith behind terminal (3 stacked octahedra, 2 counter-rotating tilted torus rings); banner palette → red/blue/yellow/green |
| **28** | Matte floor / flat hero materials | Floor roughness 1→0.68, metalness 0.22, warmer albedo + glossier worn patches; hero boosts: piping emissive 4.0, gem/crystal roughness 0.16, armor metalness 0.68, chest plate specular; pad ring emissive up |
| **29** | Single-sun thin atmosphere vs multi-sun refs | Secondary + tertiary sun discs with halos; ray wedges 5→7 + secondary ray fan; exposure 1.36→1.39; hemi/ambient/key up; fog 36–95→38–108; cam dist 4.05→3.9, height 2.12, lookY 1.14 (chest) |
| **30** | HUD juice vs ability-wheel/minimap refs | Wireframe octahedron/cube/tetra glyphs (explore/build/progress); minimap quadrant color blocks + dashed zone paths + diamond zone pips; crest dual gold+cyan glow + wing-glow filter; motes 52→58 + swirl; 10 orbiting cyan/amber spark trails |

## Assets

| File | Size | Notes |
|------|------|-------|
| `public/models/riser-player.glb` | ~529 kB (+33 kB) | Draco; fused torso/hips, cape, gem, pauldron skirts |
| `tools/blender/rebuild_player_sculpt.py` | — | Loops 16–26 rebuild script (voxel fuse + cape) |

Terminal / blueprint / zone GLBs unchanged.

## Guards

- `base: '/aaamath/'` unchanged; KaTeX still deferred
- L1–L7 pedagogy untouched; no Lesson 8+ / no new KP waves
- LandscapeGate retained; critic shots at 844×390 mobile / 1280×720 desktop
- `tsc -b` clean; scene adds zero new lights (emissive/basic/additive only)

## Shots

- `docs/gauntlet/_critic-shots/loop26-30-desktop.png`
- `docs/gauntlet/_critic-shots/loop26-30-mobile.png`
- `docs/gauntlet/_critic-shots/loop26-30-midwalk.png`
