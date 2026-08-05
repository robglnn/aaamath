# Builder report — Visual Gauntlet loops 36–55 (Meshy skyline)

**Date:** 2026-08-05  
**Builder:** this session (Meshy MCP + Blender Draco ship + R3F wire)  
**Prior tip:** `0235b23` (loops 31–35)  
**Mandate:** Meshy-authored skyline / island / HUD diegesis — not Algebra.

## Meshy task ledger

| Asset | Preview task | Refine task | Credits (approx) |
|-------|--------------|-------------|------------------|
| Skyline monolith | `019fd423-6d3d-7856-ab5b-d8f4084df07e` | `019fd424-4b30-7a8c-8b97-0352631e2d27` | 20+10 |
| Floating island | `019fd423-7320-7857-a837-f36a994fe59e` | `019fd426-ba18-7b03-8b97-ea23a6ef7664` | 20+10 |
| Waterfall cliff | `019fd423-784d-7a29-b72c-e23fc837bf94` | `019fd426-beb1-72d3-9102-5b8a91c1074f` | 5+10 |
| Plaza floor tile | `019fd423-799f-7a2b-be24-921f7ba57bf5` | `019fd426-c086-78cf-8747-88e97d396e15` | 5+10 |
| Crystal bloom | `019fd426-fd2d-78e2-9ac1-afc8e3af26af` | `019fd42a-ae5b-7b18-a562-7289014868f4` | 5+10 |
| Crystal lamp | `019fd426-fd8e-7a91-8282-6cc84d819f1a` | `019fd42a-d5d3-794f-842d-dc512975736a` | 5+10 |
| Flower island | `019fd42c-a7d2-7989-a0a7-46d6d828512c` | `019fd432-5058-7cdf-a914-c2edf1017af3` | 5+10 |
| Supply crate | `019fd42c-b49b-73b9-8be7-f07dff169482` | `019fd432-5671-7a50-89fb-79ff27625a81` | 5+10 |
| Mesa cluster | `019fd432-57ac-7c02-8662-e8f426e52705` | `019fd436-418f-7c78-9044-3c2ecb0be92e` | 5+10 |

Raw: `tools/meshy_raw/*-meshy.glb` · Ship: `tools/blender/ship_meshy_hero.py`

## Shipped GLBs (`public/models/`, cache `?v=m53`)

| File | Size (B) | SHA256 prefix |
|------|----------|---------------|
| `skyline-monolith.glb` | 709136 | `37DA7F3B56B5` |
| `floating-island.glb` | 1268608 | `F69BA69AD743` |
| `flower-island.glb` | 452788 | `F03DC7D88CB0` |
| `waterfall-cliff.glb` | 455476 | `FA3F01E0C6DA` |
| `plaza-floor.glb` | 407816 | `89D3E0ACC5CF` |
| `crystal-bloom.glb` | 312996 | `BEF7B1D38C40` |
| `crystal-lamp.glb` | 271816 | `9F680A815284` |
| `supply-crate.glb` | 350412 | `825EE590797B` |
| `mesa-cluster.glb` | 379424 | `81BA94247806` |

## Loops

| Loop | Gap | Change |
|------|-----|--------|
| **36** | Primitive ringed monolith unread from spawn | Meshy `skyline-monolith` + tip bloom + rings; closer place |
| **37** | Kitbash floating islands | Meshy `floating-island` ×5 |
| **38** | Missing waterfall saturation | Meshy `waterfall-cliff` flank landmark |
| **39** | Weak monolith tip bloom | Meshy `crystal-bloom` disc + additive halo |
| **40** | Island/env saturation wash | SKY/FOG teal lift + key/hemi (later dialed for contrast) |
| **41** | Matte plaza floor | Meshy `plaza-floor` corridor tiles |
| **42** | Wireframe ability glyphs | Filled chunky SVG icons + wire accent when active |
| **43** | Whisper minimap quads | Stronger quadrant fills |
| **44** | Empty corridor POIs | 6× Meshy `crystal-lamp` |
| **45** | Value ceiling | Exposure/key sun lift (then refined in 49) |
| **46** | Arch still owns composition | Monolith to `[9,0,-19]` scale 1.55, thicker rings, larger bloom |
| **47** | Island tops unread | 3× Meshy `flower-island` closer into first-10s |
| **48** | Waterfall ghost | Move to `[-16,0,-14]` scale 1.35 facing spawn |
| **49** | Over-lift washes skyline | Exposure 1.50; fog 42/132; cooler FOG |
| **50** | Camera buries skyline | Cam height +0.16, lookY +0.10 |
| **51** | Primitive crates | Meshy `supply-crate` ×6 |
| **52** | Thin banner rhythm | +2 banners (8 total) |
| **53** | Sparse skyline mass | Meshy `mesa-cluster` ×2 |
| **54** | Soft god-rays | Ray/sun glow opacity juice |
| **55** | Minimap disk covers pizza | Disk alpha ↓; quad fills ↑ |

## Guards

- Curriculum frozen; `base: '/aaamath/'`; KaTeX defer; speech/touch untouched
- Draco via gstatic; no Rodin/Hyper3D kitbash fakes for new heroes
- `tsc -b` clean

## Out of scope

No L8+; pedagogy untouched.
