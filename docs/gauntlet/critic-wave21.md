# Critic report — Wave 21 (L3 unlocks as 3D world props)

**Date:** 2026-08-05  
**Critic:** fresh-context gauntlet CRITIC (Builder ≠ Critic; **no `src/` edits**)  
**Judged surface:** code + math review of working tree vs builder claim (read-only). No in-browser film this pass.  
**Builder doc:** `builder-wave21-l3-3d.md`  
**Parity bar:** `builder-wave16-l2-3d.md` / `L2UnlockProps.tsx`  
**Parallel wave:** `builder-wave22-lesson4.md` (content + `loadLesson` only — checked for merge collision)

## Verdict: PASS_WITH_GAPS

Lesson 3 mastery unlocks are **real range props** on the Wave 16 pattern — not HUD-only. Flag plumbing L1→L3 is complete, Gamma is walkable inside existing BOUNDS, budget constraints hold, and pedagogy/content is untouched by this wave. Gaps are fidelity/product polish (hex shell orientation vs walkable silhouette; no `gamma` ZoneId; thinner blueprint prop than L2 rails), not ship blockers.

## Checklist

| # | Criterion | Result |
|---|-----------|--------|
| 1 | L3 mastery feels like a **real world payoff** comparable to L2 rails/annex (not HUD-only) | [x] **Met** — Y-splitter on Alpha, Expert insignia on player, labeled walkable Gamma Relay + bridge + violet path studs. Splitter is thinner than the L2 rail ring (one Y vs six rim segments) but still in-world, same auto-present call W16 made. |
| 2 | Walkability: `groundHeight` + bridge continuous? BOUNDS allow reach? | [x] **Met** — Hex (pointy-east face-normal test) + `GAMMA_BRIDGE` return `PAD_TOP` when unlocked, `0` when locked. Bridge overlaps Beta west rim and hex east approach. Pad span ≈ `x ∈ [-10.9, -5.7]`, `z ∈ [-17.6, -12.4]` inside `BOUNDS { x: ±12, zMin: -20.5 }`. Player passes `hasGammaRelay`. |
| 3 | Visual distinctness: hex Gamma vs diamond Annex vs octagon Alpha/Beta? | [x] **Met with gap** — Intent and accent family clear (violet L3 vs cyan L2). Hex top disc, 6 edge bars, and walk test agree on **vertex-east**. Cylinder shell uses `thetaStart = π/6`, which in Three.js is **flat-east** (vertices at 30°/90°/…) — 30° off the rest of the prop. Still reads “hex vs diamond vs octagon” at range; silhouette of shell vs top/bars misaligned up close. |
| 4 | Expert rank readable vs Adept/Initiate? | [x] **Met** — Violet third shoulder chevrons above amber adept + centered violet chest diamond; cyan initiate / amber adept / violet expert stack is coherent. Same tiny-pip language as L2 — readable in close third-person, subtle at distance (shared plateau). |
| 5 | Flag wiring complete L1–L3? | [x] **Met** — Nine `UnlockFlags`; App derives L3 from blob ids + `algebra-i-03` mastered; GameView deps → `applyMasteryUnlocks`; store → Player / L3 props / Hud flash+chips+objective / GatePathLights. Content ids match (`bp.relay.splitter`, `rank.riser.expert`, `zone.gamma.relay`). |
| 6 | Budget: no new point lights, no GLTF, locked renders nothing? | [x] **Met** — `L3UnlockProps` has zero `pointLight`; proc textures only; `if (!unlocked) return null` on both props. No new deps / GLTF. |
| 7 | Pedagogy regressions? | [x] **None** — W21 stayed in `game/` + `i18n/` + L3 flag plumbing. Lesson JSON untouched. |
| 8 | Merge bugs from parallel L4 work? | [x] **None found** — W22 owns `loadLesson` + `algebra-i-04/`; W21 owns range props. Shared tree coexists; no L4 unlock flags leaking into game store yet (expected). |

## Spot-check notes

### Payoff parity (vs W16)

| Unlock | L2 bar | L3 wave 21 | Read |
|--------|--------|------------|------|
| Blueprint | Rim rails (6 segments) | Y-splitter on Alpha pad | In-world; thinner silhouette |
| Rank | Amber adept chevrons + dual chest | Violet expert third tier + center diamond | Clear rung |
| Zone | Diamond annex east + bridge + cyan studs | Hex relay west + bridge + violet studs + taller mast | Strongest parity |

### Hex orientation (largest concrete defect)

Builder claims `thetaStart = π/6` so “an east vertex meets the bridge.” In Three.js `CylinderGeometry`, `thetaStart = 0` places a vertex at +X (pointy-east); `π/6` places a **flat** at +X.

| Layer | Orientation |
|-------|-------------|
| `groundHeight` hex test | Pointy-east (vertex toward bridge) |
| Edge glow bars (`a = π/6 + k·π/3`) | Face midpoints of pointy-east |
| Top `circleGeometry` (default θ=0) | Pointy-east |
| Pad body `cylinderGeometry` θ=`π/6` | **Flat-east** — mismatches |

Walkability is unaffected (bridge + pointy walk test carry the approach). Visual body/top disagreement is real. One-line fix later: `thetaStart = 0` (or rotate the cylinder to match).

Builder’s “exact at full-R east / 60° vertices” note is slightly overstated: walk uses `R - 0.15`, so full circumradius vertices fail the hex inequality; the east full-R sample still stands via **bridge overlap**. Not a ship issue — same shrink idiom as the annex.

### Zone HUD soft gap

`ZoneId` remains `'alpha' | 'beta'`. Player zone resolve is still `z < GATE_Z → 'beta'`. Standing on Gamma lights the L1 Beta chip, not a Gamma-live state. Builder follow-up is correct; does not block walk-on payoff.

### Expert / chips / objective

- Unlock flash L3 transitions wired (expert→rank, splitter→blueprint, gamma→zone), deferred-until-explore preserved.
- L3 chips use `.gr-l2-chip` + `.gr-l3-chip` accent overrides (magenta / violet / teal) from blob unlock ids.
- `objectiveGammaRelayOpen` EN/ES/PL present; objective priority gamma → annex → beta → blueprint → terminal.

## Single largest gap

**Gamma Relay cylinder shell is rotated 30° relative to its walkable hex, top disc, and edge bars** (`thetaStart = π/6` → flat-east; everything else is vertex-east toward the bridge). Undermines the builder’s “east vertex meets the bridge” silhouette story and leaves a visible kitbash misalignment on the L3 zone hero prop — the strongest unlock of the wave.

Secondary (do not displace headline):

- No `'gamma'` `ZoneId` / HUD live chip on the relay pad
- Auto-present Y-splitter thinner than L2’s rail ring (same deferred-placeable tradeoff as W16)
- Expert pips remain small at camera distance (L2 plateau)

## Plateau / next recommendation

1. **Trivial fix (efficiency):** set Gamma pad cylinder `thetaStart` to `0` (or rotate +π/6) so shell/top/bars/walk share vertex-east.
2. **Small product beat:** add `ZoneId = 'gamma'`, resolve when on relay hex, optional HUD live chip — completes the zone payoff loop W16 left half-open for annex too.
3. **Then climb the rung:** L4 unlocks (`bp.balance.beam`, `rank.riser.operator`, `zone.delta.balance`) via the same `UnlockFlags` + `L4UnlockProps` module pattern — do not spend another wave on kitbash density.

Absolute AAA authored/GLTF ceiling remains open from overnight/W16–19; Wave 21 correctly spent budget on **curriculum→world payoff**, not another decor pass.

## Orchestrator polish (same overnight pass)

- Gamma pad cylinder `thetaStart` set to `0` so shell / top disc / edge bars / walkable hex share vertex-east toward the bridge. Largest gap closed in code.

## Continuity

| Prior | Wave 21 |
|-------|---------|
| W16: L2 unlocks as 3D props | **Pattern reused one rung up — closed for L3** |
| W16 follow-up: L3+ should follow flags + `L*UnlockProps` | **Done** |
| Authored/GLTF fidelity plateau | **Unchanged** (out of scope this wave) |
| W22 L4 content parallel | **No merge collision with W21 game props** |

## Out of scope this critic

No Playwright film / seeded-blob screenshots; no live Pages deploy watch; no mobile FPS bench; no code edits (orientation bug is correctness of silhouette, not a walkability ship-block).
