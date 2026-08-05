# Builder report — Visual Gauntlet loops 31–35 (MESHY-FIRST)

**Date:** 2026-08-05  
**Builder:** this session (Meshy MCP + Blender ship + R3F wire)  
**Mandate:** Meshy-authored player + environment — not Algebra, not another primitive rebuild.

## Meshy task ledger

| Asset | Preview task | Refine task | Remesh (opt) | Credits |
|-------|--------------|-------------|--------------|---------|
| Player riser | `019fd3fc-bc65-745a-a28f-b7e13c4d1b5c` | `019fd3fe-3b38-741f-beb8-a285371cb8bd` | `019fd400-74f9-7525-a408-43941b41cfc2` | 20+10+5 |
| Algebra terminal | `019fd3fc-c203-745c-8d7a-a4c9c7a0ccf2` | `019fd3fe-517b-749a-b398-93ba8fd68153` | — | 20+10 |
| Zone beacon | `019fd3fc-c7fd-745e-a5dd-0c8dc8900804` | `019fd3fe-5508-742e-bccb-6bc7931b9a96` | — | 20+10 |
| Plaza mid-arch | `019fd3fc-c89b-745f-a709-e64d01a1abb3` | `019fd3ff-e766-7487-9f60-7f661d6cadbf` | — | 5+10 |
| Plaza banner | `019fd3fc-e352-7c7a-bcf7-309e93706bbc` | `019fd3ff-ed2a-7489-9880-1a13001cc682` | — | 5+10 |

**Prompts (abbrev):**
- Player: Fortnite-like athletic teen, A-pose, navy tech-suit + cyan piping/chest gem, pauldrons, messy hair, readable face, cape; meshy-6; 20k tris; GLB
- Terminal: holographic cyan screen gold frame crystalline antenna; meshy-6; 12k
- Zone beacon: cyan crystal monolith + floating metallic rings; meshy-6; 10k
- Arch: stone plaza gateway cyan crystal + gold trim; meshy-5; 8k
- Banner: red/gold wing crest flag on pole + cyan crystal base; meshy-5; 5k

Raw downloads: `tools/meshy_raw/*-meshy.glb`  
Ship script: `tools/blender/ship_meshy_hero.py` (scale, origin bottom, tex≤1024, Draco L6)

## Shipped GLBs (`public/models/`, cache `?v=m31`)

| File | Size |
|------|------|
| `riser-player.glb` | 600,600 B (~587 KB) |
| `algebra-terminal.glb` | 540,372 B |
| `zone-marker.glb` | 674,636 B |
| `plaza-arch.glb` | 347,388 B |
| `plaza-banner.glb` | 245,480 B |

## Loops

| Loop | Gap | Change |
|------|-----|--------|
| **31** | Primitive/kitbash player vs Fortnite organic hero | Meshy player → Draco `riser-player.glb`; HeroGltf emission-map punch + albedo lift |
| **32** | Terminal still tiny kitbash | Meshy terminal → `algebra-terminal.glb` |
| **33** | Zone marker + monolith unread from spawn | Meshy zone beacon → `zone-marker.glb`; monolith emissive ≥1.65 |
| **34** | Plaza depth / banner saturation | Meshy arch + banner; `PlazaMidArch` + 6× Meshy banners in RangeDecor |
| **35** | Value/saturation ceiling (critic 26–30) | Sky golden-hour gradient, SKY/FOG lift, lights+hemi, exposure 1.39→1.52 |

## Guards

- Curriculum frozen; `base: '/aaamath/'`; KaTeX defer; speech/touch untouched
- Player under 1–2 MB target (587 KB Draco)
- `tsc -b` clean

## Out of scope

No L8+; blueprint pad left as prior Blender GLB (still wired).
