# Critic report — Wave 19 (authored player + mid-field cast)

**Date:** 2026-08-05  
**Critic:** fresh-context gauntlet CRITIC (Builder ≠ Critic; **no `src/` edits**)  
**Judged surface:** local `npm run build` + `npm run preview` (`127.0.0.1:4173/aaamath/`) — Wave 19 present in working tree / `dist`.  
**Builder docs:** `builder-wave19-player.md`, `builder-wave19-midfield.md`  
**Prior:** `critic-wave18.md` → **PASS_WITH_GAPS** (largest gap: player kitbash garnish + mid-field ducts/masts/barrier pane primitive)

## Verdict: PASS_WITH_GAPS

Wave 19 **closes the Wave 18 player and mid-field gaps** under the zero-network profile-geo mandate. The Riser avatar is no longer stacked-box garnish — every avatar mesh pulls shared lathe/bevel kit geometry. Mid-field conduits, light masts, and the Beta barrier pane mount the same kit. Cold shell and pedagogy hold. Absolute Fortnite / sculpted-art AAA remains out of reach; **further kitbash visual waves are past the useful plateau**.

## Plateau recommendation: SWITCH to curriculum

**Confirm orchestrator belief:** visual AAA under zero-network profile-geo is **near plateau**.

| Option | Stance |
|--------|--------|
| **STOP visual** (more lathe/box swaps) | **Yes — stop as primary workstream.** Residual boxes (approach rails, L2 bridge/rails, BlueprintGhost, prop garnish) would be incremental only. |
| **CONTINUE** another visual wave | **No** under current constraints. Diminishing camera returns; GameView already ~84 kB. |
| **SWITCH to curriculum** | **Preferred next.** L3 lesson content / pedagogy depth. |
| True GLTF / PBR art packs | **Only** if deliberately leaving the zero-network profile-geo ceiling — that is a different mandate, not Wave 20 kitbash. |

## Judge answers

| Question | Answer |
|----------|--------|
| Full authored player silhouette (not box garnish)? | **Yes.** `Player.tsx` has **zero** `boxGeometry` / `capsuleGeometry`. Ten `player*` kit buffers (helm, visor, torso, pauldron, leg, boot, arm, pack, packRoll, pip). In-camera: helm dome + recessed amber/cyan visor read, tapered cuirass, pauldron domes, bedroll pack, lathed limbs — past Wave 18 stacked boxes. |
| Mid-field ducts / masts / barrier pane on authoredGeo? | **Yes (code + mounts).** `ductPipe` → EnergyConduits + CableTrunks; `mastFlange`/`mastLamp` → ten LightPosts; `barrierPane` → BetaBarrier pane. Mast caps readable in preview shots; ducts subtler at distance; barrier pane **code-verified** (unlocked save sinks pane — not cleanly filmed this session). |
| Cold shell + pedagogy hold? | **Hold.** HTML modulepreload: `_commonjsHelpers` + `react-vendor` only. Preview network: GameView/r3f/three present; **katex absent**. |
| Another visual wave worth it vs L3 / GLTF? | **No kitbash wave.** **SWITCH to L3 curriculum**; reserve GLTF for an explicit art-pack decision. |

## What closed vs Wave 18 gap

| Wave 18 leftover | Wave 19 evidence | Stance |
|------------------|------------------|--------|
| Player still stacked-box garnish | Shared kit `playerHelm`…`playerPip`; all avatar meshes `<mesh geometry={…}>`; mesh count 37→17 (−54 %) | **Closed** |
| Mid-field ducts / light masts / barrier pane primitive | `ductPipe`, `mastFlange`, `mastLamp`, `barrierPane` in `getAuthoredGeoKit()`; mounts in `RangeDecor` / `TrainingRange` | **Closed** for named cast |
| Absolute set-wide AAA | Residual boxes remain (rails, L2 props, ghost blueprint, crate bodies, hazard pads, AuthoredProps trim) | **Still open** — profile-geo ceiling |

## Spot-check (read-only)

| Area | Result |
|------|--------|
| `authoredGeo.ts` | Kit includes mid-field four + player ten; lathe profiles (helm recessed visor channel, leg/arm columns, mast flange, duct pipe); bevel extrudes (torso, boot, pack, barrier pane, mast lamp, pip) |
| `Player.tsx` | Import kit + panel clone for cuirass/pack; pivots/anim/collision/adept insignia preserved; **no** primitive geo constructors |
| `RangeDecor` | `EnergyConduits` / `CableTrunks` → `ductPipe`; `LightPosts` → `mastFlange` + `mastLamp`; cable strips remain thin boxes (intentional) |
| `TrainingRange` `BetaBarrier` | `barrierPane` mesh; `gatePillar` posts; lintel + threshold still boxes |
| Cold shell (HTML) | Entry + react-vendor preload only |
| Cold network (preview) | `GameView-CGMdTTM0.js`, r3f, three; **katexCold: []** |

### Build

```
npm run build   # green — tsc + vite 6.4.3 + spa-fallback
GameView chunk  # 84.20 kB raw / 23.37 kB gz (matches builder-wave19-player)
three chunk     # 689.52 kB (unchanged)
Network assets  # 0 B added
base            # '/aaamath/' intact in asset URLs / modulepreload
```

### Visual (preview + critic shots)

| Shot | Path | Read |
|------|------|------|
| Spawn (unlocked) | `docs/gauntlet/_critic-shots/critic-wave19-spawn.jpg` | Authored player on Alpha pad; masts with lamp caps; L2 chrome live |
| Player turn | `…/critic-wave19-player-front.jpg` | Rear/side silhouette — pack bedroll + aft strip, limbs, not box stack |
| Player framing | `…/critic-wave19-player-close.jpg` | Humanoid equipment read at spawn scale |
| Mid-field / walk | `…/critic-wave19-midfield.jpg`, `…/critic-wave19-barrier.jpg`, `…/critic-wave19-toward-terminal.jpg` | Mast flange + beveled lamp caps clear; floor conduits subtler; barrier sunk under unlocked Beta |

Silhouette verdict: **player authored vs Wave 18 boxes — yes.** Mid-field cast upgraded in kit; camera payoff strongest on masts, subtler on ducts.

## Pedagogy / Pages / cold-shell status

| Mandate bar | Status |
|-------------|--------|
| Celebrate ↔ masteryDone | **Not re-probed** (packages untouched; hold assumed) |
| L2 via `resolveTerminalLessonId` | **Hold** (UI shows annex objective / adept rank from prior unlocks) |
| KaTeX deferred; Three/GameView lazy | **Hold** — HTML + preview probe |
| Pages `base: '/aaamath/'` | **Hold** in build graph; live deploy not re-judged |

## Single largest remaining gap

**Absolute set fidelity still sits under the zero-network profile-geo ceiling** — residual box/cylinder cast (approach rails, L2 bridge/rails, BlueprintGhost, prop garnish) plus flat proc materials, not sculpted GLTF/PBR. Wave 19 correctly finished the Wave 18 player + named mid-field cast; it does **not** unlock Fortnite training-floor parity, and another profile-geo wave will not either.

Secondary (do not displace headline / plateau call):

- Barrier pane in-camera unverified on locked Beta (unlocked seed sinks wall)
- Approach rails still primitive boxes (outside Wave 19 claim)
- Rail materialization FX still unfilmed end-to-end (carried from W18)

## Continuity

| Prior largest gap | Wave 19 |
|-------------------|---------|
| W18: player kitbash + mid-field cast primitive | **Closed** for both named claims |
| W17→18: set-wide fidelity beyond heroes | **Partial** — heroes + player + named mid-field now authored; residual decor still primitive |
| Absolute Fortnite AAA | **Open by design under current constraints** → plateau |

## Out of scope this critic

Live Pages redeploy; ESLint / content:validate re-run; clearing localStorage for locked-Beta barrier film; GLTF art-pack design.
