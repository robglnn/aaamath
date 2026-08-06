# Builder report — Visual Gauntlet loops 66–75

**Date:** 2026-08-05  
**Builder:** this session (white-rect kill → liked-style loco restore → AAA polish)  
**Live:** https://robglnn.github.io/aaamath/  
**Cache:** `MESHY_V=m67`

## Loop map

| Loop | Theme | Change |
|------|--------|--------|
| **66** | Kill white rectangle | Root cause: Meshy rig exports a material-less `Icosphere` bone-display helper (~42 verts, no mats) that reads as a solid white blob under ACES. Also removed always-on cyan chest pip overlay that blew out. Runtime `stripMeshyHelpers()` on all player / loco loads; ship script strips helpers. Shot: `loop66-white-rect-fixed.png` / `loop66-75-spawn.png` |
| **67** | Restore liked player style | Re-rigged **loop-31 remesh** `019fd400-74f9-7525-a408-43941b41cfc2` (athletic navy tech-suit the user preferred) instead of the drifted t-pose remesh |
| **68** | Keep loco on restored mesh | Rig `019fd48e-a43a-7fd3-83e5-8316c3d05d09` (walk+run free); jump `019fd48f-8ede-7790-8e8f-94818a1c6ecf` (action 86); crawl `019fd48f-8ef7-7727-b6b5-909ce178cc4c` (action 622). Shipped Draco loco GLBs + static `riser-player.glb` |
| **69** | Skyline hero composition | Monolith → `[0.6,0,-23.2]` scale **1.78**; bloom tip raised; camera lookY **1.42** / height **2.48** so tip sits upper-third |
| **70** | Verdant saturation | Flower islands closer/larger; waterfall scale **1.52**; SKY/FOG teal-green; verdant fill light; grass albedo/emissive punch |
| **71** | God-ray punch | Primary/secondary/tertiary wedge opacity ↑ (~+0.06); exposure **1.56** |
| **72** | Loco crossfade | Walk↔run fade **0.28s**; general **0.22s**; jump **0.12s** |
| **73** | World density continuity | +5 Meshy floor tiles in mid-yard; grid fadeDistance **28** / fadeStrength **2.2** (less holodeck) |
| **74** | Polish / verify | Spawn screenshot confirm — player silhouette readable, no white blob |
| **75** | Ship | Commit + Pages deploy; workbench/critics updated |

## Meshy ledger (66–75)

| Asset | Task | Credits |
|-------|------|---------|
| Rig liked remesh | `019fd48e-a43a-7fd3-83e5-8316c3d05d09` | 5 (incl. walk+run) |
| Jump | `019fd48f-8ede-7790-8e8f-94818a1c6ecf` | 3 |
| Crawl | `019fd48f-8ef7-7727-b6b5-909ce178cc4c` | 3 |
| **Total** | | **11** |

## Guards held

- Curriculum frozen; `base: '/aaamath/'`; KaTeX defer; speech/touch/crawl input intact
- Loco walk/sprint/jump/crawl retained on restored mesh
- No corridor prop spam / no L8+

## Verify shots

- `docs/gauntlet/_critic-shots/loop66-white-rect-fixed.png` — post Icosphere strip (pre style restore)
- `docs/gauntlet/_critic-shots/loop66-75-spawn.png` — liked-style player, no white blob, skyline/god-ray read
