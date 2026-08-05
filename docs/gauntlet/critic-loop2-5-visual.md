# Critic report — Loops 2–5 (lighting, GLTF, landscape, juice, compact HUD)

**Date:** 2026-08-05  
**Method:** Pixel A/B vs `docs/gauntlet/bars/*` on local preview; **landscape mobile 844×390** (hard UX)  
**Shots:** `loop2-3-landscape-desktop.png`, `loop2-3-landscape-mobile.png`

## Verdict: PASS_WITH_GAPS (5-loop budget exhausted)

| Loop | Gap attacked | Ref still wins? |
|------|--------------|-----------------|
| 2 Lighting | Cyan debug grid → warm horizon + soft sun + charcoal grid | Partial — atmosphere improved; still not volumetric Fortnite sky |
| 3 Heroes | Blender GLB player/terminal/zone/blueprint | Partial — silhouette more “prop hero” than Fortnite skin |
| Landscape UX | Portrait gate + landscape touch layout | Met for mandate — stick/jump/wheel/minimap readable in 844×390 |
| 4 Feel | FOV 52 + snappier camera follow | Partial |
| 5 HUD clutter | Compact rail when >3 unlocks | Improved vs spreadsheet chip stack |

## Landscape-first (hard constraint)

- `LandscapeGate` blocks portrait on coarse pointers (“Rotate to play”)
- Critic captures are landscape, not portrait
- Touch layout media: `(pointer: coarse) and (orientation: landscape)`

## Remaining largest gap (if another night)

Sculpted/textured PBR player + terminal (current GLBs are hard-surface kits) and optional bloom-safe juice. **Not more lessons.**
