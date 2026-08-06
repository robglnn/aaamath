# Gauntlet loops 56-65 - shared context (do not re-explore whole repo)

**Repo:** `C:\dev\aaamath` · **Live:** https://robglnn.github.io/aaamath/ · **base:** `/aaamath/`
**Curriculum FROZEN** — no L8+, don't regress L1-L6 / KaTeX defer / Web Speech.
**Landscape-first** critic shots: **844x390** + at least one odd resize for HUD loops.
**Models this batch:** builders prefer `kimi-k3-max`; critics prefer `composer-2.5` or fresh `cursor-grok-4.5-medium` (builder ≠ critic).
**Meshy mandatory** for new env/character meshes → Blender Draco ship → `public/models/` → wire. Rodin ≠ Meshy.
**Cache bump:** `MESHY_V` currently `m53` → bump to `m65` when shipping new GLBs.
**Ship script:** `tools/blender/ship_meshy_hero.py`
**Raw dir:** `tools/meshy_raw/`

## User priorities (ALL required — distribute)

1. **World density / not a holodeck** — floors, walls, trim, tiles, barriers. Refs: `docs/gauntlet/bars/` + `C:\Users\mithr\Downloads\aaamath UI references`
2. Prior critic: dead-center skyline hero, god-rays, verdant island/waterfall (weave where A/B says)
3. **Character locomotion:** walk, sprint, jump, crawl — wire to move state (WASD/stick, jump, add crawl if missing)
4. **Responsive resize** — all HUD controls visible at odd aspects

## Prior critic tip (loops 36-55)

Largest remaining gap was skyline composition hero vs arch — BUT user must-fix this batch is **holodeck/floor/walls**. Attack density first.

## Key files

- `src/game/HeroGltf.tsx` — `MESHY_V`, HERO_URLS
- `src/game/RangeDecor.tsx` — plaza tiles, banners, skyline, GroundBreakup
- `src/game/Player.tsx` — move + procedural limb anim (HeroModel static; limbs hidden)
- `src/game/Hud.tsx` + `src/game/game.css` — HUD / touch / landscape
- `src/game/TrainingRange.tsx`, `GameView.tsx`, `world.ts`, `store.ts`
- Existing floor GLB: `plaza-floor.glb` (only 4 instances — sparse)

## Loop plan (largest single gap each)

| Loop | Gap | Owner tier |
|------|-----|------------|
| 56 | Meshy wall module + first wall ring | kimi builder |
| 57 | Meshy corner + railing modules | kimi builder |
| 58 | Dense floor/wall tile layout (reuse) | kimi builder |
| 59 | T-pose character + Meshy rig (walk/run free) | kimi + Meshy |
| 60 | Jump + crawl clips + wire crawl input | kimi + Meshy |
| 61 | Skyline dead-center hero beat arch | composer/kimi |
| 62 | God-ray drama punch | kimi |
| 63 | Verdant island/waterfall identity | kimi |
| 64 | Responsive HUD resize (844x390 + odd) | kimi |
| 65 | Odd-viewport HUD + density polish | kimi |

## Meshy task ledger (fill as jobs complete)

| Asset | Preview | Refine | Rig/Anim | Notes |
|-------|---------|--------|----------|-------|
| wall-module | | | | |
| wall-corner | | | | |
| railing-barrier | | | | |
| riser-player-tpose | | | | pose_mode t-pose |
| player-rig | | | | includes walk+run |
| player-jump | | | | meshy_animate |
| player-crawl | | | | meshy_animate |

## Guards

- No Rodin/Hyper3D for new heroes
- Commit/push waves; confirm Pages green before finish
- Screenshots → `docs/gauntlet/_critic-shots/loop56-65-*`
