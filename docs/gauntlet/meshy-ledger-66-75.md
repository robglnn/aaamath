# Meshy task ledger — loops 66-75
Updated: 2026-08-05

| Asset | Task | Notes | Credits |
|-------|------|-------|---------|
| liked-player remesh (source) | `019fd400-74f9-7525-a408-43941b41cfc2` | Loop-31 remesh — preferred athletic suit | (prior) |
| liked-player-rig | `019fd48e-a43a-7fd3-83e5-8316c3d05d09` | walk+run free | 5 |
| liked-player-jump | `019fd48f-8ede-7790-8e8f-94818a1c6ecf` | action_id 86 | 3 |
| liked-player-crawl | `019fd48f-8ef7-7727-b6b5-909ce178cc4c` | action_id 622 Crawl_Backward_inplace | 3 |

Pipeline: remesh(prior) → rig → download walk/run → animate jump/crawl → Blender ship (strip Icosphere helpers) → `public/models/` → `MESHY_V=m67`

## White-rect note
Meshy rig GLBs include a material-less `Icosphere` bone-display helper. Blender re-export tends to resurrect it; durable fix is `stripMeshyHelpers()` in `HeroGltf.tsx` / `PlayerLoco.tsx`.
