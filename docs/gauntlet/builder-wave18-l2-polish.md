# Builder — Wave 18 L2 world-payoff polish

**Date:** 2026-08-05

## Goal

Close the wave-16 follow-ups (`builder-wave16-l2-3d.md`): film the rail-blueprint payoff in-camera (not only HUD chips), make the Beta Annex read as a navigable destination from the gate path, and give the annex a soft objective line. Placeable second blueprint slot stays deferred — auto-present rails got a one-shot materialization FX instead, per wave-18 brief.

## Changes

### `src/game/L2UnlockProps.tsx` — rail materialization FX (one-shot)

- `PadRailProp` now plays a brief **scale pop + emissive flash** on the Alpha rim rails when `hasRailBlueprint` flips true mid-session:
  - Same deferred-until-explore idiom as `UnlockCelebrationFx`: transition during `lesson` mode sets `pending`; the pop fires on the first explore frame so the payoff lands in-camera while the player stands on the Alpha pad.
  - No replay on cold load with the unlock already owned (`prev === null` guard) — matches gate-celebration behavior.
  - Six segment groups pop in with `easeOutBack` overshoot, staggered 85 ms apart (0.6 s per segment); bar emissive gets a decaying `+2.4` flash boost over 1.45 s on top of the existing pulse.
  - One additive cyan ring (`AdditiveBlending`, `depthWrite: false`) sweeps from r≈1.1 out to the rail line (`RAIL_R + 0.4`) as the flash decays; hidden outside the FX window.
- After the window: segments settle at scale 1 and the idle pulse resumes unchanged.
- Audio intentionally not duplicated — the HUD deferred unlock flash owns `playBlip('unlock')`.
- Budget: +1 mesh, zero new lights, zero new textures/deps.

### `src/game/TrainingRange.tsx` — `GatePathLights` annex branch

- New module const `ANNEX_STUD_XS`: six stud x-positions from inside the Beta pad (x=1.2) across the bridge to just inside the annex diamond (`ANNEX_CENTER[0] - 1.1`); derived from `ANNEX_CENTER` so it tracks world constants.
- When `hasBetaAnnex`, six cyan studs render along the bridge centerline (`ANNEX_BRIDGE.z`), riding `groundHeight(x, z, true, null, true) + 0.045` (pad top on Beta/bridge/annex).
- The traveling light wave **continues the gate-stud index sequence** (`studs.length + i`), so the pulse visibly runs gate → Beta → annex; the annex reads as the path's destination.
- Renders nothing while locked (zero clutter on locked Beta, same stance as `L2UnlockProps`); base gate studs untouched.

### `src/i18n/ui.ts` + `src/game/Hud.tsx` — soft objective copy

- New `UiKey` `objectiveAnnexOpen` with EN/ES/PL strings:
  - EN: “Beta Annex open — cross the bridge east of Beta”
  - ES: “Anexo Beta abierto — cruza el puente al este de Beta”
  - PL: “Aneks Beta otwarty — przejdź mostem na wschód od Bety”
- Objective priority: `hasBetaAnnex` → annex line, else existing Zone Beta / blueprint / terminal chain (L2 implies L1, so the annex line correctly supersedes `objectiveZoneBetaOpen`).

## Budget / constraints

+8 meshes total (6 studs + 1 ring + FX bookkeeping), all existing proc materials, **zero new point lights**, no new deps, no GLTF/CDN. Pedagogy wires untouched (`celebrating = masteryDone`, L1→L2 resolution, blueprint build mode). KaTeX defer, cold shell, lazy GameView split, and `base: '/aaamath/'` all hold — GameView chunk 84.21 kB raw / 22.60 kB gz (was 80.85 / 21.74 at wave 17).

## Parallel-wave coordination

Sibling builder owned Terminal/Player geometry this wave. This changeset deliberately touched only `L2UnlockProps.tsx`, `GatePathLights` + the world-import line in `TrainingRange.tsx`, `Hud.tsx` objective chain, and `i18n/ui.ts` — **no edits to `Player.tsx`, Terminal housing, `BlueprintGhost`, store, or App wiring**. L1 `BlueprintGhost` ramp placement is untouched and unaffected.

## Verification

```bash
npm run build   # green — tsc -b + vite 6.4.3 + spa-fallback (exit 0)
```

Code-level spot checks:

- Rail pop fires only on a live false→true `hasRailBlueprint` transition; deferred while `mode === 'lesson'`; settles to scale 1 / idle pulse after 1.45 s.
- Annex studs sit at `PAD_TOP + 0.045` on Beta pad, bridge strip, and annex diamond (all inside `groundHeight` walkable regions when `hasBetaAnnex`).
- Objective text switches to the annex line only when `hasBetaAnnex`; falls back through the existing chain otherwise. All three locales typed via `UiKey`.

## Follow-ups

- Placeable rail via a second blueprint slot remains the standing option if auto-present + pop still feels thin.
- Annex could use its own micro-celebration (critic-wave17 note: “L2 annex still lacks a dedicated celebration beat”) — the stud wave + HUD zone flash is a soft stand-in only.
- L3+ unlock ids: keep the wave-16 pattern (flags in `UnlockFlags`, props in one `L*UnlockProps` module, FX via the deferred-until-explore idiom).
