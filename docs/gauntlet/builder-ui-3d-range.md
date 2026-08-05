# Builder — UI/3D Range Readability Pass

**Role:** BUILDER (not critic). Scope: training-range readability, terminal affordance, Zone Beta payoff, blueprint place feedback, lighting. No lesson content/pedagogy changes; controls and pointer-lock untouched; still fully procedural R3F (no asset pipeline).

## Bar → what shipped

### Terminal reads as the obvious objective from a distance
- **Objective beam**: 7-unit open-ended additive cylinder rising from the terminal mast (`meshBasicMaterial`, additive blending — glows with zero bloom cost), slow opacity breathe.
- **Floating objective diamond**: emissive octahedron at ~y 8, spins/bobs/pulses — Fortnite-style "go here" marker visible over every pad.
- **Alive screen**: amber scanline sweeps the terminal screen on a 1.7s loop on top of the static scan bars.
- **Proximity feedback**: when `nearTerminal`, beam widens ~28% and doubles in opacity, ground ring scales/pulses brighter (emissive 0.4→1.5), screen pulse 1.3→2.1, point light 7→15, amber side fins brighten. Mirrored by the HUD `gr-prompt-pulse` button (styled by parallel UI work).

### Zone Beta unlock feels like a payoff
- **`GateUnlockFx`** (one-shot, ~1.5s, fires only on the false→true transition): expanding cyan shockwave ring (scale → 7), full-gate additive flash cylinder, and a 34-intensity light spike that decays quadratically. Guarded so persisted unlocks on load do **not** replay it.
- **Gate becomes an open door**: energy wall sinks *and fades* as it drops; posts/top beam switch amber→cyan and brighten; a cyan threshold glow strip stays on the floor where the wall used to be.
- **`GatePathLights`**: five floor studs between gate and Beta pad march a cyan pulse wave *toward* Beta ("this way" cue); dim amber static while locked. Heights derived from `groundHeight` so studs sit on pad or ground correctly.
- **Beta interior**: rotating tilted holo ring above the pad, looping scan-wave ring that expands across the pad, rim emissive 0.65→1.4, zone light 3→9. HUD banner (`gr-unlock-flash`) provides the screen-space beat.

### Blueprint place gives clear positive feedback
- **Ghost → solid pop**: placed group scales 0.55 → 1 with `easeOutBack` overshoot (~0.5s) — Fortnite build-piece feel.
- **Flash**: placed materials spike emissive (base 0.25→2.65, ramp 0.4→2.6) decaying over 0.7s.
- **Shockwave + light pulse**: additive ring expands 1.1→3.5 fading out; cyan point light pulses to 9 and decays. One-shot via mount-time refs, zero per-frame cost after ~0.7s.
- **Ghost affordance while aiming**: additive footprint outline (4-segment ring) + four emissive corner brackets, so the piece reads as a buildable before you commit.

### Lighting: readable without muddy flatness or mobile bloom
- Warm key 1.35→1.55 (`#ffe8c2`), cool cyan rim 0.35→0.5, hemisphere 0.55→0.62 with darker floor bounce, ambient 0.28→0.22 (restores contrast).
- Spawn pad gets a soft cyan point-light pool; pad albedo lifted (`#102736`→`#132e3f`) with a breathing rim torus.
- Ground plane and grid lines lifted slightly (`#081018`→`#0a141d`, grid `#122a36`→`#16323f` / `#1f6470`→`#267584`) so geometry separates from fog.
- Player palette brightened across legs/torso/arms/helm plus a new emissive chest core — character reads at range without an extra light.
- **No postprocessing/bloom** — all glow is emissive + additive transparent meshes (mobile-Safari safe).

## Perf budget
- ~+18 meshes worst case (gate FX hidden unless firing; ghost brackets only in build mode). Still well under mobile draw-call concern; lights: hemi + ambient + 2 dir + ≤4 low-distance point lights, no shadows, `dpr` already capped at 1.75.

## Files changed
- `src/game/TrainingRange.tsx` — lighting rig, terminal beam/diamond/scanline/proximity, `GateUnlockFx`, `GatePathLights`, `BetaBarrier` fade/cyan/threshold, `BetaZone` holo+scan payoff, AlphaPad pool light.
- `src/game/BlueprintGhost.tsx` — footprint outline + corner brackets, placement pop/flash/shockwave/light pulse.
- `src/game/Player.tsx` — brighter readable materials, emissive chest core.
- `src/game/game.css` — **untouched**: parallel UI work (same wave) already landed `gr-brand`, `gr-hud-rail`, `gr-rank-icon`, `gr-unlock-flash`, `gr-prompt-pulse` styles, so HUD cue CSS was left to that agent to avoid conflicts.
- `src/game/world.ts`, `src/game/store.ts` — untouched (all feedback derived from existing state transitions).

## Verification
- `npm run build` (tsc + vite) — green.
- No changes to lesson JSON, lesson runtime, controls, pointer-lock, or store shape.

## Follow-ups for critic
- Gate FX duration/intensity is tuned by feel; check on a physical phone for beam over-glow in dark scenes.
- Path studs use `groundHeight` at render time — if Beta geometry ever moves, they follow automatically, but verify stud/pad z-fighting on steep angles.
