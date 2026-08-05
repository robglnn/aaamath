# Builder — Wave 5 set density (mid-field authored fidelity)

**Date:** 2026-08-05
**Goal:** Close critic-wave3's largest remaining gap — *"mid-field set density and authored material fidelity"* — without asset packs. Thicken the middle distance (props / trim / ground breakup) rather than re-litigating signs or the terminal face.

**Surface:** `src/game/RangeDecor.tsx` only. No `TrainingRange.tsx` rewrite, no lighting-rig changes, no pedagogy edits.

## Provenance note

A partial wave-5 draft landed on disk mid-session (same brief, same file). Kept its family structure and most placements; fixed the budget, height, and light issues before shipping. This doc describes the **final** state.

## Delivered (all in `RangeDecor.tsx`)

- **Approach light posts** — 4 new posts (+8 meshes): cyan pair on the pad corridor `[-3.8,1.2]` / `[5.2,-1.5]`, amber pair flanking the gate approach `[±4.5,-6.2]`. Cyan corridor → amber gate threshold color rhythm matches the existing post language.
- **`ApproachRails`** — 4 low guide-rail segments (8 meshes) at `x ±3.2`, two pairs `z 2.5 / -2.5`, steel body + cyan emissive top strip. Frames the walk from spawn south toward the gate with a gap at pad center so east-west crossing stays open.
- **`EnergyConduits`** — 3 thin emissive runs (3 meshes) snaking from the spawn side of Alpha pad to the terminal pedestal edge, with phase-offset emissive pulse (0.1–0.8 intensity wave) so energy reads as *flowing toward* the terminal.
- **`HoloPillars`** — 3 pylons just off the Alpha rim (6 meshes): steel base + spinning amber holo torus. Warm accents near the cyan home pad.
- **`AntennaDishes`** — 2 masts (6 meshes) at `[-8.2,0.5]` / `[8.5,-3.2]`: pole + partial-sphere dish + tip beacon with a sharp phase-offset blink (`sin³` pulse) — reads as live hardware.
- **Ground clutter** — 2 new supply crates (`[2.8,6.8]`, `[-2.2,-4.8]`, +6 meshes) in the existing crate language.

## Fixes applied to the draft

- **Buried conduits (functional bug):** draft ran all 3 conduits at `y 0.04` — the Alpha pad drum top is at `0.12`, so the marquee conduit feature was inside solid geometry and invisible. All three runs are fully on-pad → now ride at `PAD_TOP + 0.02`.
- **Sink-into-pad pass:** new `surfaceY(x,z)` helper (pad deck vs base floor) applied to posts, rails, and crates — draft had feet/bases buried 0.12 wherever props stood on the pad.
- **Light budget:** draft added **7 point lights** (4 posts + 3 pillars) on top of the existing ~10-point-light scene — the real mobile cost, worse than mesh count. Wave-5 pieces are now **emissive-only** (`lit` flag on posts; pillars lost their amber lights). Zero new lights; props read inside the existing Alpha pad / terminal light pools.
- **Mesh budget:** draft was at 41 new meshes. Dropped the 2 far-field spires (`−4`) — they don't serve *mid-field* density, which is the critic's actual gap. Final: **37 new meshes, 0 new lights**.
- **Overlap:** moved one holo pillar (`[-5.1,5.5]` → `[-6.3,4.6]`) that sat 0.6 m from a crate.

## Constraints honored

- **Budget:** 37 new simple meshes (<40), ~37 new draw calls, zero new point lights, no postprocessing, no new deps, no per-frame allocations (refs + module-level tuples only). Animation cost: 3 tiny `useFrame` loops over material refs (conduit pulse, dish blink, torus spin).
- **Palette:** cyan `#3dd6c6` / amber `#f0a830` / steel `#1a3344` / navy bases only.
- `npm run build` — green (tsc + vite + spa-fallback). Bundle 1,453 kB (within the ~1.4–1.55 MB band already noted in activeContext).

## Notes / follow-ups

- New posts are emissive-capped markers, not light sources — if the gate approach ever feels dark, the correct spend is **one** amber pool at the gate throat, not per-post lights.
- Conduits stop at the pad rim; a terminal→gate continuation (with a step-down coupler at the rim) is the natural next beat if the critic wants more pre-gate read.
- Decor remains non-colliding, consistent with existing crates/posts.
- Not exercised end-to-end: mobile touch pass, unlock-fx playthrough (out of builder scope; visuals only verified via build + placement audit against `world.ts` constants).
