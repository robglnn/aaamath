# Builder — Loops 59-60: character locomotion (walk/run/jump/crawl)

**Scope:** Meshy-rigged animated player hero driven by move state; crawl input.
**Status:** done + sweep-verified. Two waves touched this: `71236c5` (first cut) and
`13ad5af` (spawn-occlusion hotfix) landed mid-session; this pass is the correctness
wave on top — the hotfix's PlayerLoco still flew/crpled the character (FK-proven,
screenshot-proven), so the pinned-roots rewrite was reinstated.

## Files changed (this wave)

| File | Change |
|------|--------|
| `src/game/PlayerLoco.tsx` | Rewritten: SkeletonUtils clone, single scene+mixer, Hips root-motion pin, crawl reverse, soft-fail static fallback |
| `src/game/HeroGltf.tsx` | `boostHeroMaterials` exported (loco body reuses the player material punch) |
| `src/game/Player.tsx` | Crawl keys restructured (`crawlKey {ctrl,c}`); C only crawls when pointer-locked |
| `src/game/Hud.tsx` | Locked help line → `Ctrl/C crawl` |
| `docs/gauntlet/meshy-ledger-56-65.md` | Animation task IDs + decoded clip table |
| `docs/gauntlet/_critic-shots/` | Broken-vs-fixed sweep evidence + state shots (844×390) |

Already delivered by wave `71236c5` (kept): `HERO_URLS.playerWalk/playerRun/playerJump/playerCrawl`
+ preloads (`MESHY_V=m65`), `CRAWL_SPEED = 2.1` (~0.45× walk), `store.touchCrawl`,
TouchControls crawl button (momentary, violet, left of Jump), static-hero replacement
inside `Player.tsx`, rank pips kept on the animated body.

## Root-motion forensics (why the pin is mandatory)

Decoded + FK-evaluated the shipped GLBs (float32, tightly-packed, parent chain
identity ⇒ Hips track values are plain node-local translations):

| Clip | Hips world travel (FK probe) | Verdict |
|------|------------------------------|---------|
| `walking_man` (1.04 s) | y 0.19 → **−5.30** → −2.20, x 0.21 → +4.54, z 2.39 → 3.74 | crumples 5 m under, drifts ~5 m/cycle |
| `Basic_Jump` (5.92 s, 143 keys) | t=1.5 → y **−9.79**; track z → 132.9 | dives/flies tens of meters |
| `Crawl_Backward_inplace` (1.00 s) | y **−57.85**, x → **+25.92** | 58-unit-deep booth space |

Sweep screenshots of the hotfix build (`probe-sweep-*.png`): idle = crumpled float,
walk = airborne bicycle off-shadow, crawl = skydiver splay. With the pin
(`sweep-fixed-*.png`): every state plants on the physics shadow.

## Bugs found → fixed

1. **Skinned-clone freeze (critical).** Plain `scene.clone(true)` leaves SkinnedMesh
   bound to the source skeleton ⇒ bind-pose statue. Now `SkeletonUtils.clone`
   (the `13ad5af` hotfix got this one too).
2. **Root motion (critical).** `pinHipsTrack` rewrites the Hips position track to the
   skeleton rest offset (crawl: rest − `CRAWL_HIP_DROP 0.55`); rotations carry the clip.
3. **Double mixer step.** drei `useAnimations` already steps the mixer per frame; the
   extra per-clip `mixer.update(dt)` doubled playback speed. Removed.
4. **Crawl played backward.** Clip is authored backward; now `timeScale −1`.
5. **C key double-bind.** C was both crawl (Player) and yaw fallback (GameView,
   unlocked). Resolved: C crawls only while pointer-locked (yaw fallback is inert
   there); unlocked C keeps legacy yaw; Ctrl crawls everywhere.
6. **No soft-fail.** `LocoErrorBoundary` + Suspense fallback → static
   `HeroModel kind="player"` (itself soft-failed). 404/parse never unmounts the canvas.

Architecture: one cloned scene + one mixer + four retargeted clips (identical
skeletons across the rig's exports) ⇒ real crossfades (`crossFadeFrom`, 0.18 s)
instead of four mounted bodies toggled by `visible`.

## Loco state → clip map

`Player.tsx` computes per frame (React state, changes only on transitions):

| State | Condition (priority order) | Clip | Playback |
|-------|---------------------------|------|----------|
| `jump` | `!grounded` | `playerJump` | LoopOnce + clampWhenFinished; physics owns Y |
| `crawl` | grounded && (Ctrl ‖ C-locked ‖ touchCrawl) | `playerCrawl` | LoopRepeat, timeScale −1 |
| `run` | mag>0.05 && sprint (Shift ‖ touchSprint ‖ mag>0.92) && !crawling | `playerRun` | LoopRepeat, timeScale 1.12 |
| `walk` | mag>0.05 && mode≠lesson | `playerWalk` | LoopRepeat, timeScale 1 |
| `idle` | default | `playerWalk` | timeScale 0.14 at t=0.05 (slow weight-shift) |

Speed follows state: crawl `CRAWL_SPEED 2.1` (≈0.45× walk 4.6) · walk 4.6 · sprint 8.2.
Sprint suppressed while crawling. Lesson mode forces idle.

## Crawl controls

| Input | Behavior |
|-------|----------|
| `Ctrl` (either side) | Hold to crawl — works in every mode |
| `C` | Hold to crawl — pointer-locked only (avoids Q/C-yaw double-bind) |
| Touch `Crawl` button (left of Jump, violet) | Hold to crawl (store `touchCrawl`) |

Browser caveat: `Ctrl+W` is a reserved close-tab chord, so Ctrl-crawl + forward-W is
unsafe on some browsers; C is the safe crawl key while pointer-locked.

## Verification

- `npx tsc -b` clean; `npm run build` green (covers loops 56-58 `wall`/`wallCorner`/`railing`
  wiring in `RangeDecor.tsx` — compiles; hotfix reseat included).
- Playwright @ 844×390, clipped character probes (`docs/gauntlet/_critic-shots/`):
  - `sweep-fixed-idle/walk0-2/jump/crawl.png` — fixed build: planted idle, stride on
    shadow, tucked jump over lift-scaled shadow, low quadruped crawl
  - `probe-sweep-*.png` — pre-fix build evidence (crumple/bicycle/splay)
  - `loop59-60-c-unlocked.png` — unlocked C yaws, no crawl stance (double-bind resolved)
- Console: 0 errors; only pre-existing AudioContext autoplay warnings.

## Known gaps / for critic

- Pointer lock is unavailable in this headless Playwright, so C-crawl-while-locked was
  verified by inspection + the unlocked-C negative test; Ctrl-crawl verified live.
- Rank pips hold standing chest height during crawl (overlay, not bone-attached).
- Stationary crawl plays the reversed crawl cycle in place (reads as squirm-adjust).
- `CRAWL_HIP_DROP = 0.55` is hand-tuned from the crawl shot, not authored data.
- Session collision note: waves `71236c5`/`13ad5af` landed while this builder was
  mid-inspection; the first rewrite was clobbered by the hotfix, then reinstated here
  with the FK evidence that the hotfix alone was insufficient.
