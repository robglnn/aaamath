# Builder notes — loops 56–58 (world density: yard enclosure + paved plaza)

**Date:** 2026-08-05 · **Builder:** kimi-k3 (subagent) · **Scope:** Fortnite visual only; curriculum/KaTeX/speech untouched; `base` stays `/aaamath/`.

## Files changed

| File | Change |
|------|--------|
| `src/game/HeroGltf.tsx` | `MESHY_V` `m53` → **`m65`**; added kinds **`wall`** (`wall-module.glb`), **`wallCorner`** (`wall-corner.glb`), **`railing`** (`railing-barrier.glb`); added `HeroErrorBoundary` so a GLB wired before its ship lands (404/parse reject) renders `null` instead of unmounting the canvas; preloads for the 3 new URLs |
| `src/game/RangeDecor.tsx` | New `PlazaEnclosure` → `WallRing` + `RailingRing` (22 clones of 3 GLBs); `PlazaFloorTiles` densified **4 → 14** using existing `floor` kind; wired `PlazaEnclosure` into `RangeDecor` |
| `docs/gauntlet/builder-loop56-58-density.md` | this file |

**Verify:** `npx tsc -b` clean; `npx eslint` on both files clean (one pre-existing `react-refresh/only-export-components` warning on `preloadHeroModels`, unchanged).

## Placement layout (all positions verified against keep-outs)

Keep-outs respected: **walk path** spawn (0,4) → terminal (2.5,-3.5) → gate (0,-8); **Beta** pad r5 at (0,-15); **Delta/Epsilon** yards (squares, half 2.45) at (±7.6,-9.1) — they own the whole SE/SW quadrant z −6.5…−11.7, so **no south perimeter is possible** outside the gate lane; **Zeta** hex at (9.2,0) (x 6.6–11.8, z −3–3) breaks the east wall; existing banners/lamps/posts/dishes/crates/arch/hazard stripes.

- **WallRing — 12 walls** (scale `WALL_SCALE=1.3`):
  - West run ×6 at x=−9.2, z = −5.1, −2.94, −0.78, 1.38, 3.54, 5.7 (rotY π/2) — solid flank between Epsilon rim and NW post; dish (−8.2, 0.5) reads as a wall-side hardware bay.
  - East run ×2 at x=+9.2, z = −4.8, 4.5 (rotY −π/2) — only pockets clear of Zeta (z −3…3), Delta (z < −6.5), and the NE post (9.5, 7.5). The Zeta gap reads as the yard's east bastion annex; the L6 bridge entrance stays walkable.
  - Rear run ×4 at z=+8.4, x = −3.6, −1.2, 1.2, 3.6 (rotY 0) — spawn-side entrance left open at |x| ≈ 4.8–7.1, chained by railings.
- **WallRing — 4 corners** (scale `CORNER_SCALE=1.35`): rear bastions (±8.2, 7.8); **gate towers (±3.5, −8.4)** flanking the walk axis just behind the plaza arch — the arch now reads as a gateway between bastions (leans into the critic's arch-owns-composition note by making it a gate).
- **RailingRing — 6 railings** (scale `RAIL_SCALE=1.1`, all rotY 0): gate-lane pairs (±3.6, −5.8) and (±3.6, −7.2) extending the ApproachRails idiom toward the towers (walk line stays inside, ≥0.9 clearance); rear entrance edges (±5.9, 8.4) chaining rear wall (ends x ±4.8) to the bastions.
- **PlazaFloorTiles — 14 tiles** (was 4): kept the critic-verified 4; added spawn landing (0, 4.6), corridor chain (0.4, 1.9) → (1.6, −1.4) → (−0.2, −3.4), gate lane (−1.4, −5.9) → (0.3, −7.5), threshold (0.4, −9.9) (south edge tucks under the Beta pad rim when L2 unlocks — reads as laid pavement), pad-rim infill (−4.6, 3.4) / (4.9, 2.9) deliberately under the flank banner poles, (−5.0, −1.6). All pairs ≥ ~2.2m apart so coplanar +0.04 faces never z-fight.

**Instance budget:** 12 wall + 4 corner + 6 railing + 14 floor = **36 clones** of 4 cached GLBs (within the 20–40 brief; zero new lights, zero per-frame work).

## Blockers / waiting on Meshy

1. **GLBs not yet in `public/models/`** — `wall-module.glb`, `wall-corner.glb`, `railing-barrier.glb` (Meshy previews `019fd450-ae3e…`, `…-b304…`, `…-b816…` per ledger). Wiring is live now: pieces appear the moment the parent ships the GLBs (refine → download → `tools/blender/ship_meshy_hero.py` → `public/models/`). `MESHY_V=m65` already set, so the Pages cache-bust is ready.
2. **Fail-soft by construction:** `HeroErrorBoundary` catches the suspense rejection from a 404 and renders nothing — app/canvas never unmounts; one `console.warn` per missing kind.
3. **Retune after ship (one pass, constants only):** `WALL_SCALE` / `CORNER_SCALE` / `RAIL_SCALE` and per-piece `rotY` assume wall module long axis = local X, ~2.2m at scale 1 (targets: wall ≈3m × 2.6m tall, railing ≈2.4m × 1.1m). Corner rotYs are guesses until the corner GLB's local orientation is known. West-run spacing 2.16 < assumed module length 2.86 → intentional overlap for a solid-wall read; re-check seams once real dims land.
4. **Known tolerated kisses** (re-check in critic shots): NW/NE posts sit ~0.5–1.3m off wall/corner faces; gate-lane rail ends pass ~0.3m from hazard stripes / light posts.

## Findings for loops 59–60 (character anim) — how HeroModel loads today

- `HeroClone` destructures only `{ scene }` from `useGLTF(url, DRACO)`; **`animations` is available on the same result but ignored**. No `AnimationMixer` exists anywhere in the app.
- `scene.clone(true)` per instance — **this will break skinned rigs**: bones in the clone still bind to the original skeleton. For the rigged player, switch the player path to `SkeletonUtils.clone(scene)` (`three/examples/jsm/utils/SkeletonUtils.js`) or drei `useAnimations`.
- `Player.tsx` anim state is already computed per frame: `mag` (move amount), `sprinting`, `grounded`, `animPhase`; procedural limb swing drives the **hidden** profile-geo limbs (`visible={false}`) while the Meshy shell stays static. Wire clips there: idle ↔ walk (mag>0.05) ↔ sprint ↔ jump (!grounded) crossfade.
- **Crawl input does not exist** — loop 60 must add it: keyboard path in `Player.tsx` `keys` ref + touch control in `Hud.tsx` + likely a store flag; no crawl plumbing today.
- **Ship script risk:** `tools/blender/ship_meshy_hero.py` defaults `join=True` and calls `transform_apply` — fine for static props, but for the rigged player use `--no-join` and verify the armature/actions survive (export has no explicit `export_animations` flag; Blender glTF defaults to exporting them, but confirm clips land in the GLB before wiring).
- `riser-player.glb` (current) is a static Meshy gen — no rig; loops 59–60 need the `riser-player-tpose` → `player-rig` (walk+run included) → `player-jump` / `player-crawl` (meshy_animate) chain in the ledger.

## Guards held

- No curriculum/lesson/KaTeX/speech changes; `vite.config.ts` base untouched.
- No new lights, no per-frame work added (all enclosure pieces are static clones).
- No Rodin/Hyper3D; all new kinds are Meshy-pipeline GLBs via the standard ship script.
