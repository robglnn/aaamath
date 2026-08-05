# Critic report — Wave 25 (L5 unlocks as 3D world props)

**Date:** 2026-08-05  
**Critic:** fresh-context gauntlet CRITIC (Builder ≠ Critic; **no `src/` edits**)  
**Judged surface:** code + math review of working tree vs builder claim (read-only). No in-browser film this pass.  
**Builder doc:** `builder-wave25-l5-3d.md`  
**Parity bar:** `builder-wave23-l4-3d.md` / `L4UnlockProps.tsx` / `critic-wave23.md`  
**Parallel wave:** `builder-wave24-lesson5.md` (L5 content + `algebra-i-06` registry — checked for merge collision)

## Verdict: PASS_WITH_GAPS

Lesson 5 mastery unlocks are **real range props** on the established L2→L4 pattern — not HUD-only. Flag plumbing L1→L5 is complete, Epsilon Calibration Forge is walkable inside BOUNDS with a continuous NW bridge, budget constraints hold, and pedagogy/content JSON is untouched by this wave. Gaps are product polish inherited from prior waves (no `epsilon` `ZoneId`; auto-present calibrator prop thinner than the zone hero), not ship blockers.

## Checklist

| # | Criterion | Result |
|---|-----------|--------|
| 1 | L5 mastery feels like a **real world payoff** comparable to L2–L4 (not HUD-only) | [x] **Met** — Dual-dial calibrator on Alpha (cyan/amber stacked dials + mint crown + unlock FX), Chief mint fifth chevrons on player, labeled walkable **Epsilon Calibration Forge** pentagon yard + bridge + mint path studs. Zone yard is the strongest payoff; calibrator is thinner than annex/relay/delta heroes (same auto-present tradeoff as W16 rails / W21 splitter / W23 beam). |
| 2 | Walkability: `groundHeight` + bridge continuous? Inside BOUNDS? Clear of Delta/Gamma/Annex? | [x] **Met** — Regular-pentagon five half-plane test (`dot(n_k, p-c) ≤ EPSILON_RADIUS − 0.15`) + `EPSILON_BRIDGE` strip return `PAD_TOP` when unlocked, `0` when locked. Bridge `x ∈ [−5.3, −2.2]` at `z = −10.7` overlaps Beta NW rim (`x ≈ −2.55`) and yard east walk edge (`x ≥ −5.15`). Pad span `x ≈ [−10.2, −5.0]`, `z ≈ [−11.6, −6.6]` inside `BOUNDS { x: ±12, zMin: −20.5 }`. Player passes `hasEpsilonCal` as 8th `groundHeight` arg. NW site mirrors Delta NE; center separation 15.2 units; Epsilon–Gamma center dist ~5.9 (clear). |
| 3 | Visual distinctness: pentagon Epsilon vs square Delta / hex Gamma / diamond Annex? Mint accent distinct? | [x] **Met** — Epsilon uses 5-gon cylinder (`thetaStart = π/5` → flat side east toward bridge), distinct from axis-aligned square Delta, pointy-east hex Gamma, 45° diamond Annex, and octagon Alpha/Beta. Walk test, pad body, top disc, and edge bars share one pentagon story (no W21-style shell/top mismatch). Mint `#5ecf9a` / warm pad `#b8e8d0` read apart from gold L4, violet L3, and cyan L2. |
| 4 | Chief rank readable vs Operator/Expert/Adept/Initiate? | [x] **Met** — Mint fifth shoulder chevrons at `y 1.152` / `rot −0.95` above gold operator tier + centered mint chest mark at `y 1.032`. Cyan initiate → amber adept → violet expert → gold operator → mint chief stack is coherent. Same tiny-pip language as L2–L4 — readable close-up, subtle at distance. |
| 5 | Flag wiring complete L1–L5? Ids match content? | [x] **Met** — Fifteen `UnlockFlags`; App derives L5 from blob ids + `algebra-i-05` mastered (`LESSON_5_ID`); GameView deps → `applyMasteryUnlocks`; store → Player / L5 props / Hud flash+chips+objective / GatePathLights. Content ids match (`bp.balance.calibrator`, `rank.riser.chief`, `zone.epsilon.cal` in `algebra-i-05/package.json` `worldIntegration`). |
| 6 | Budget: no new point lights, no GLTF, locked renders nothing? | [x] **Met** — `L5UnlockProps` has zero `pointLight`; proc textures only; `if (!unlocked) return null` on both `CalibratorProp` and `EpsilonCal`. No new deps / GLTF. |
| 7 | Pedagogy regressions? | [x] **None** — W25 stayed in `game/` + `i18n/` + L5 flag plumbing. Lesson JSON untouched (content quality belongs to W24 critic). |
| 8 | Merge bugs from parallel L5/L6 content wave? | [x] **None found** — W24 owns `algebra-i-05` + `loadLesson` registry; W25 owns range props and L5 flags. `algebra-i-06` is registered with distinct L6 unlock ids (`bp.balance.mirror` / `rank.riser.vanguard` / `zone.zeta.mirror`) and zero game-store fields yet — no id collisions. `resolveTerminalLessonId` advances L4→L5→L6 correctly. |

## Spot-check notes

### Payoff parity (vs W16 / W21 / W23)

| Unlock | L2 bar | L3 bar | L4 bar | L5 wave 25 | Read |
|--------|--------|--------|--------|------------|------|
| Blueprint | Rim rails | Y-splitter | Dual-pan beam | Dual-dial calibrator | In-world; thematic (two inverse steps); similar silhouette weight to prior auto-present props |
| Rank | Amber adept | Violet expert | Gold operator | Mint chief fifth tier | Clear rung |
| Zone | Diamond annex + bridge | Hex relay + bridge | Square yard + bridge | Pentagon forge + bridge + mast + mini dial rack | Strongest parity; NW mirror of Delta is sound geometry |

### `groundHeight` spot-check (math)

| Sample | Expected | Result |
|--------|----------|--------|
| `(−7.6, −9.1)` center, unlocked | `0.12` | five half-planes pass ✓ |
| east flat midpoint `(−5.15, −9.1)`, unlocked | `0.12` | `dx = 2.45 ≤ h` ✓ |
| `(−5.11, −9.1)` outside east slack | `0` | `dx = 2.49 > h` ✓ |
| `(−3.75, −10.7)` bridge mid, unlocked | `0.12` | bridge strip ✓ |
| `(−5.3, −10.7)` bridge west end, unlocked | `0.12` | bridge strip ✓ |
| `(−2.2, −10.7)` bridge east end, unlocked | `0.12` | bridge strip ✓ |
| `z = −10.7` chain | Beta rim → bridge → yard | overlaps at `x ≈ −2.55` and `−5.3` ✓ |
| Any epsilon sample, locked | `0` | `hasEpsilonCal` false → no pentagon/bridge contribution ✓ |

Vertex inset: walkable region stops `0.15` inside each face (apothem slack), so visual circumradius corners are slightly outside the walk mesh — same deliberate tradeoff as Delta square corners and prior pads.

### Pentagon orientation (contrast with W21 gamma fix)

Epsilon pad layers share one silhouette story: walk test uses five half-planes with east face first; 5-gon cylinder `thetaStart = π/5` places **flat side east** toward the bridge; top `circleGeometry` uses the same `thetaStart`; edge bars sit at apothem distance on face-midpoint bearings `k·2π/5`. No kitbash rotation gap like pre-fix Gamma.

### Zone HUD soft gap (carried forward)

`ZoneId` remains `'alpha' | 'beta'`. Player zone resolve is still `z < GATE_Z → 'beta'`. Standing on Epsilon lights the L1 Beta chip, not an Epsilon-live state. Builder follow-up is correct; does not block walk-on payoff.

### Chief / chips / objective

- Unlock flash L5 transitions wired (chief→rank, calibrator→blueprint, epsilon→zone), deferred-until-explore preserved.
- L5 chips use `.gr-l2-chip` + `.gr-l5-chip` mint accent overrides from blob unlock ids; `data-tier="chief"`.
- `objectiveEpsilonCalOpen` EN/ES/PL present; objective priority epsilon → delta → gamma → annex → beta → blueprint → terminal.
- `l5UnlockTitle` pulls from `lesson5.unlocks` — titles stay content-driven.

### W24 / L6 coexistence

- `loadLesson.ts` imports `algebra-i-05` and `algebra-i-06`, exports `LESSON_5_ID` / `LESSON_6_ID`, `lesson5` / `lesson6`.
- L6 unlock ids are distinct and have no game-store fields yet (expected — L6 props deferred per builder follow-up).
- Shared working tree builds clean; no id collisions between L5 game unlocks and L6 content package.

## Build

```bash
npm run build            # exit 0 — tsc -b + vite + spa-fallback (2026-08-05 critic pass)
npm run content:validate # exit 0 — 6/6 packages including algebra-i-05
```

## Single largest gap

**No `'epsilon'` `ZoneId` / HUD live chip on the calibration forge** — same half-open zone loop W16 left for annex, W21 for gamma, and W23 for delta. Player can walk the bridge and stand on the labeled pentagon pad, but `activeZone` never reflects Epsilon; the zone chip does not go “live” on approach.

Secondary (do not displace headline):

- Auto-present calibrator is a smaller silhouette than the Epsilon yard hero (parity with W16 rails / W21 splitter / W23 beam density)
- Chief mint pips remain small at camera distance (shared L2–L5 plateau)
- NW yard placement is the symmetric mirror of Delta NE — sound geometry, not a compromise defect
- L6 Zeta will need a free slot or `zMin` move when 3D props land (builder follow-up)

## Plateau / next recommendation

1. **Small product beat:** add `ZoneId = 'epsilon'` (and eventually `'delta'`, `'gamma'`, `'annex'`), resolve when on side pads, optional HUD live chip — closes the zone payoff loop across L2–L5.
2. **Then climb the rung:** L6 unlocks (`bp.balance.mirror`, `rank.riser.vanguard`, `zone.zeta.mirror`) via `L6UnlockProps` + flags — placement TBD (south `zMin` or new geometry slot).
3. **Optional fidelity:** placeable calibrator via blueprint slot if auto-present reads thin in-browser.

Absolute AAA authored/GLTF ceiling remains open from W16–19; Wave 25 correctly spent budget on **curriculum→world payoff**, not another decor pass.

## Continuity

| Prior | Wave 25 |
|-------|---------|
| W23: L4 unlocks as 3D props | **Pattern reused one rung up — closed for L5** |
| W23 follow-up: L5 should mirror NW `[-7.6, −9.1]` | **Done** |
| W24 L5 content parallel | **No merge collision with W25 game props** |
| W24 critic: GameView wiring wave needed | **Closed by W25** |

## Out of scope this critic

No Playwright film / seeded-blob screenshots; no live Pages deploy watch; no mobile FPS bench; no code edits (no ship-blockers found).
