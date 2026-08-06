# Meshy task ledger — loops 56-65
Updated: 2026-08-05

| Asset | Preview task | Refine | Rig/Anim | Credits |
|-------|--------------|--------|----------|---------|
| wall-module | 019fd450-ae3e-7f58-9ab9-5d9aa1d85395 | | | meshy-5 |
| wall-corner | 019fd450-b304-7ed8-998a-9cc07cdfecca | | | meshy-5 |
| railing-barrier | 019fd450-b816-7ed9-aa99-bfbaef19694d | | | meshy-5 |
| riser-player-tpose | 019fd450-b954-7131-b381-ecd797a977ac | 019fd453-6b05-7f2d-ae07-e9349728c5c0 | remesh 019fd455-b1b0-7fd9-a63c-4bb0e0fdbe62 | meshy-6 t-pose |
| player-rig | | | 019fd458-72a4-7fe2-b3ba-fbd6071494f5 | includes free walk+run |
| player-jump | | | 019fd459-4e72-7253-adf6-73791130ebe8 | meshy_animate action_id 86 |
| player-crawl | | | 019fd459-4fe8-7254-bccc-b5cf1b945ead | meshy_animate action_id 622 |

Pipeline: refine → download → Blender ship_meshy_hero.py → public/models/ → HeroGltf MESHY_V=m65

## Shipped GLB clip names (decoded from public/models/)

| GLB | Clip | Duration | Notes |
|-----|------|----------|-------|
| riser-player-walk.glb | `Armature\|walking_man\|baselayer` | 1.04 s | Hips T-track drifts z 1.19→5.81 — pinned at runtime (see PlayerLoco) |
| riser-player-run.glb | `Armature\|running\|baselayer` | ~1 s | loops (first==last) |
| riser-player-jump.glb | `Armature\|Basic_Jump\|baselayer` | ~5 s (143 keys) | root flies z→132 — pinned; physics owns Y |
| riser-player-crawl.glb | `Armature\|Crawl_Backward_inplace\|baselayer` | 1.00 s | authored backward → played at timeScale −1 |
