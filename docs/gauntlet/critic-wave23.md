# Critic report — Wave 23 (L4 unlocks as 3D world props)

**Date:** 2026-08-05  
**Critic:** fresh-context gauntlet CRITIC (Builder ≠ Critic; **no `src/` edits**)  
**Judged surface:** code + math review of working tree vs builder claim (read-only). No in-browser film this pass.  
**Builder doc:** `builder-wave23-l4-3d.md`  
**Parity bar:** `builder-wave16-l2-3d.md` / `builder-wave21-l3-3d.md` / `L2UnlockProps.tsx` / `L3UnlockProps.tsx`  
**Parallel wave:** `builder-wave24-lesson5.md` (L5 content + `loadLesson` registry — checked for merge collision)

## Verdict: PASS_WITH_GAPS

Lesson 4 mastery unlocks are **real range props** on the established L2/L3 pattern — not HUD-only. Flag plumbing L1→L4 is complete, Delta Balance is walkable inside existing BOUNDS with a continuous bridge, budget constraints hold, and pedagogy/content JSON is untouched by this wave. Gaps are product polish inherited from prior waves (no `delta` `ZoneId`; auto-present blueprint prop thinner than the zone hero), not ship blockers.

## Checklist

| # | Criterion | Result |
|---|-----------|--------|
| 1 | L4 mastery feels like a **real world payoff** comparable to L2/L3 (not HUD-only) | [x] **Met** — Dual-pan balance beam on Alpha (fulcrum + cyan/amber pans + unlock FX), Operator gold chevrons on player, labeled walkable **Delta Balance** square yard + bridge + gold path studs. Zone yard is the strongest payoff; beam is thinner than annex/relay heroes (same auto-present tradeoff as W16 rails / W21 splitter). |
| 2 | Walkability: `groundHeight` + bridge continuous? Inside BOUNDS? Clear of annex/gamma? | [x] **Met** — Axis-aligned square test (`\|dx\| <= R-0.15 && \|dz\| <= R-0.15`) + `DELTA_BRIDGE` strip return `PAD_TOP` when unlocked, `0` when locked. Bridge `x ∈ [2.2, 5.3]` at `z = -10.7` overlaps Beta NE rim (`x ≤ ~2.55`) and yard west walk edge (`x ≥ 5.15`). Pad span `x ∈ [5.15, 10.05]`, `z ∈ [-11.55, -6.65]` inside `BOUNDS { x: ±12, zMin: -20.5 }`. Player passes `hasDeltaBalance` as 7th `groundHeight` arg. NE site clears annex (dz gap), gamma (west), gate walk line (`x ≥ 5`). |
| 3 | Visual distinctness: square Delta vs hex Gamma vs diamond Annex vs octagon pads? Gold accent family distinct? | [x] **Met** — Delta uses axis-aligned 4-gon (`thetaStart = π/4` → flat sides on axes), distinct from annex diamond (`\|dx\|+\|dz\|`), gamma hex (pointy-east), and octagon Alpha/Beta. Walk test, pad body, top disc, and edge bars all agree on **axis-aligned square** (no W21-style shell/top mismatch). Gold/amber-gold L4 accents (`#e8c56a`, warm pad `#e8d9a8`) read apart from cyan L2 and violet L3. |
| 4 | Operator rank readable vs Expert/Adept/Initiate? | [x] **Met** — Gold fourth shoulder chevrons at `y 1.121` / `rot -0.82` above violet expert tier + centered gold chest mark at `y 1.005`. Cyan initiate → amber adept → violet expert → gold operator stack is coherent. Same tiny-pip language as L2/L3 — readable close-up, subtle at distance. |
| 5 | Flag wiring complete L1–L4? Ids match content? | [x] **Met** — Twelve `UnlockFlags`; App derives L4 from blob ids + `algebra-i-04` mastered (`LESSON_4_ID`); GameView deps → `applyMasteryUnlocks`; store → Player / L4 props / Hud flash+chips+objective / GatePathLights. Content ids match (`bp.balance.beam`, `rank.riser.operator`, `zone.delta.balance` in `algebra-i-04/package.json`). |
| 6 | Budget: no new point lights, no GLTF, locked renders nothing? | [x] **Met** — `L4UnlockProps` has zero `pointLight`; proc textures only; `if (!unlocked) return null` on both `BalanceBeamProp` and `DeltaBalance`. No new deps / GLTF. |
| 7 | Pedagogy regressions? | [x] **None** — W23 stayed in `game/` + `i18n/` + L4 flag plumbing. Lesson JSON untouched (content bugs belong to W24 critic). |
| 8 | Merge bugs from parallel L5 content wave? | [x] **None found** — W24 owns `loadLesson.ts` + `algebra-i-05/` + `PIPELINE.md`; W23 owns range props and L4 flags. `LESSONS` registry includes L5; `resolveTerminalLessonId` advances L4→L5; no conflicting unlock ids or store fields. |

## Spot-check notes

### Payoff parity (vs W16 / W21)

| Unlock | L2 bar | L3 bar | L4 wave 23 | Read |
|--------|--------|--------|------------|------|
| Blueprint | Rim rails (6 segments) | Y-splitter on Alpha | Dual-pan balance beam on Alpha | In-world; thematic (equation balance); similar silhouette weight to splitter |
| Rank | Amber adept chevrons | Violet expert third tier | Gold operator fourth tier | Clear rung |
| Zone | Diamond annex + bridge + cyan studs | Hex relay + bridge + violet studs | Square yard + bridge + gold studs + mast + rack | Strongest parity; NE placement is pragmatic vs brief's south (documented rejection) |

### `groundHeight` spot-check (math)

| Sample | Expected | Result |
|--------|----------|--------|
| `(7.6, -9.1)` center, unlocked | `0.12` | `dx=dz=0 ≤ 2.45` ✓ |
| `(10.05, -11.55)` corner, unlocked | `0.12` | `dx=dz=2.45` inclusive ✓ |
| `(10.06, -11.56)` outside | `0` | `dx=2.46` fails square; off bridge ✓ |
| `(3.75, -10.7)` bridge mid, unlocked | `0.12` | bridge strip ✓ |
| `z = -10.7` chain | Beta rim → bridge → yard | overlaps at `x ≈ 2.2–2.55` and `5.15–5.3` ✓ |
| Any delta sample, locked | `0` | `hasDeltaBalance` false → no square/bridge contribution ✓ |

### Square orientation (contrast with W21 gamma fix)

Delta pad layers share one silhouette story: walk test is axis-aligned; 4-gon cylinder `thetaStart = π/4` places **vertices at 45°** (flat sides on ±X/±Z); top `circleGeometry` uses the same `thetaStart`; edge bars sit at cardinal midpoints `(0, ±R)` / `(±R, 0)`. No kitbash rotation gap like pre-fix Gamma.

### Zone HUD soft gap (carried forward)

`ZoneId` remains `'alpha' | 'beta'`. Player zone resolve is still `z < GATE_Z → 'beta'`. Standing on Delta lights the L1 Beta chip, not a Delta-live state. Builder follow-up is correct; does not block walk-on payoff.

### Operator / chips / objective

- Unlock flash L4 transitions wired (operator→rank, beam→blueprint, delta→zone), deferred-until-explore preserved.
- L4 chips use `.gr-l2-chip` + `.gr-l4-chip` gold accent overrides from blob unlock ids; `data-tier="operator"`.
- `objectiveDeltaBalanceOpen` EN/ES/PL present; objective priority delta → gamma → annex → beta → blueprint → terminal.
- `l4UnlockTitle` pulls from `lesson4.unlocks` — titles stay content-driven.

### W24 coexistence

- `loadLesson.ts` imports `algebra-i-05`, exports `LESSON_5_ID`, `lesson5`, and `resolveTerminalLessonId` gates on L4 mastered → L5.
- No L5 unlock flags in game store yet (expected — L5 props are a future wave).
- Shared working tree builds clean; no id collisions between L4 game unlocks and L5 content package.

## Build

```bash
npm run build   # exit 0 — tsc -b + vite + spa-fallback (2026-08-05 critic pass)
```

## Single largest gap

**No `'delta'` `ZoneId` / HUD live chip on the balance yard** — same half-open zone loop W16 left for annex and W21 for gamma. Player can walk the bridge and stand on the labeled pad, but `activeZone` never reflects Delta; the zone chip does not go “live” on approach.

Secondary (do not displace headline):

- Auto-present balance beam is a smaller silhouette than the Delta yard hero (parity with W16 rails / W21 splitter density)
- Operator gold pips remain small at camera distance (shared L2–L4 plateau)
- NE yard placement is a sound geometry compromise, not the brief's preferred south-of-Beta site (builder documents why — not a defect)
- L5 Epsilon will need the mirror NW slot or a `zMin` move (builder follow-up)

## Plateau / next recommendation

1. **Small product beat:** add `ZoneId = 'delta'` (and eventually `'gamma'`, `'annex'`), resolve when on side pads, optional HUD live chip — closes the zone payoff loop across L2–L4.
2. **Then climb the rung:** L5 unlocks (`bp.balance.calibrator`, `rank.riser.chief`, `zone.epsilon.cal`) via `L5UnlockProps` + flags — mirror NW `[-7.6, -9.1]` per builder note.
3. **Optional fidelity:** placeable balance beam via blueprint slot if auto-present reads thin in-browser.

Absolute AAA authored/GLTF ceiling remains open from W16–19; Wave 23 correctly spent budget on **curriculum→world payoff**, not another decor pass.

## Continuity

| Prior | Wave 23 |
|-------|---------|
| W16: L2 unlocks as 3D props | **Pattern reused one rung up — closed for L4** |
| W21: L3 unlocks + gamma orientation fix | **Same module pattern; delta square avoids gamma shell mismatch** |
| W21 follow-up: L4+ should follow flags + `L*UnlockProps` | **Done** |
| W24 L5 content parallel | **No merge collision with W23 game props** |

## Out of scope this critic

No Playwright film / seeded-blob screenshots; no live Pages deploy watch; no mobile FPS bench; no code edits (no ship-blockers found).
