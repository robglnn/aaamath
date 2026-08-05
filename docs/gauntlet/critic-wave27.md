# Critic report — Wave 27 (L6 unlocks as 3D world props)

**Date:** 2026-08-05  
**Critic:** fresh-context gauntlet CRITIC (Builder ≠ Critic; **no `src/` edits**)  
**Judged surface:** code + math review of working tree vs builder claim (read-only), incl. installed `three@0.172.0` geometry-source verification. No in-browser film this pass.  
**Builder doc:** `builder-wave27-l6-3d.md`  
**Parity bar:** `builder-wave25-l5-3d.md` / `critic-wave25.md` / `L5UnlockProps.tsx`  
**Parallel wave:** `builder-wave28-lesson7.md` (L7 content + registry — checked for merge collision)

## Verdict: PASS_WITH_GAPS

Lesson 6 mastery unlocks are **real range props** on the established L2→L5 pattern — not HUD-only. Flag plumbing L1→L6 is complete, the walkable layer of the Zeta Mirror Yard (half-plane walk mesh + top disc + bridge) is mathematically correct and continuous with Alpha at `PAD_TOP`, budget constraints hold, and pedagogy/content JSON is untouched by this wave. The headline gap is a **30° silhouette split inside the Zeta pad**: the walk mesh and top disc are the documented flat-top hex (flat faces ±X), but the skirt cylinder and all six ice edge bars are built on a pointy-±X hexagon — a `CylinderGeometry` vs `CircleGeometry` `thetaStart` convention mix-up that makes three builder-doc claims verifiably false and pushes the east skirt vertex outside `BOUNDS`. Same root cause retroactively explains smaller, uncaught rotations in the W21 gamma and W25 epsilon skirts.

## Checklist

| # | Criterion | Result |
|---|-----------|--------|
| 1 | L6 mastery feels like a **real world payoff** comparable to L2–L5 (not HUD-only) | [x] **Met** — Dual-facing mirror panels on Alpha (cyan lhs / amber rhs through ice glass — continues the L4 beam's lhs/rhs color idiom), Vanguard ice sixth chevrons on player, labeled walkable **Zeta Mirror Yard** hex east of Alpha + bridge + ice path studs. Zone yard is again the strongest payoff; mirror prop is thinner than the yard hero (same auto-present tradeoff as W16 rails / W21 splitter / W23 beam / W25 calibrator). |
| 2 | Walkability: `groundHeight` + bridge continuous? Inside BOUNDS? Clear of Delta/Epsilon/Annex/Alpha/terminal? | [x] **Met (walk layer)** — Six half-plane test (`dx·cos(kπ/3) + dz·sin(kπ/3) ≤ ZETA_RADIUS − 0.15`) + `ZETA_BRIDGE` strip return `PAD_TOP` when unlocked, `0` when locked. Chain at `z = 0`: Alpha disc covers to `x = 6.0`, bridge strip `x ∈ [5.8, 6.9]`, hex from `x = 6.75` — overlaps `[5.8, 6.0]` and `[6.75, 6.9]`, no gap, one height. Walk span `x ∈ [6.75, 11.65]`, `z ∈ [−2.83, 2.83]` inside `BOUNDS`. Player passes `hasZetaMirror` as 9th `groundHeight` arg. Clear of Delta (`Δz 9.1`), Epsilon (far), terminal pool (dist ≈ 7.6 from yard center). Caveat: the **visual skirt** east vertex (12.20 top / 12.55 bottom flare) exceeds `BOUNDS.x = 12` — cosmetic, see checklist 3. |
| 3 | Visual distinctness: flat-top hex Zeta vs Gamma pointy hex / pentagon Epsilon / square Delta? Ice accent distinct? | [~] **Gap** — Cross-pad distinctness holds: Zeta walk surface + top disc are genuinely flat-top (flat faces ±X) vs Gamma's pointy-east deck, and ice `#7eb8e8` reads apart from mint/gold/violet/cyan. **But internally the pad is two hexagons rotated 30° apart:** walk+disc flat-±X, while the body cylinder (`thetaStart = π/2` puts *vertices* on ±X, not flat faces) and all six ice edge bars (placed at the body's face apothems = the disc's *vertices*) trace a pointy-±X silhouette. Builder doc claims "thetaStart = π/2 so flat faces west" and "edge glow bars at six flat midpoints" — both false for the walkable hexagon. Full math below. |
| 4 | Vanguard rank readable vs Chief/Operator/Expert/Adept/Initiate stack? | [x] **Met** — Ice sixth shoulder chevrons at `y 1.18` / `rot −1.05` / scale `0.65×0.36` over the mint Chief tier (`1.152` / `−0.95`) + centered ice chest mark at `y 1.058`. Cyan → amber → violet → gold → mint → ice stack stays coherent with shrinking pip spacing; same tiny-pip plateau as L2–L5. |
| 5 | Flag wiring complete L1–L6? Ids match content (`bp.balance.mirror`, `rank.riser.vanguard`, `zone.zeta.mirror`)? | [x] **Met** — Eighteen `UnlockFlags`; App derives L6 from blob ids + `algebra-i-06` mastered (`LESSON_6_ID`); GameView deps → `applyMasteryUnlocks`; store → Player / L6 props / Hud flash+chips+objective / GatePathLights. Content ids match `algebra-i-06/package.json` `worldIntegration` exactly (`bp.balance.mirror`, `rank.riser.vanguard`, `zone.zeta.mirror`); `content:validate` 7/7. |
| 6 | Budget: no new point lights, no GLTF, locked renders nothing? | [x] **Met** — `L6UnlockProps` has zero `pointLight`; proc textures only; `if (!unlocked) return null` on both `MirrorProp` and `ZetaMirror`. ~33 meshes (MirrorProp ~10, ZetaMirror ~23) — under the ~40 target. No new deps / GLTF. |
| 7 | Pedagogy regressions? | [x] **None** — W27 stayed in `game/` + `i18n/` + flag plumbing. `algebra-i-06/package.json` is tracked and unmodified (git status shows zero modified tracked files; content owned by W26/W28). |
| 8 | Merge bugs with parallel L7 content wave? | [x] **None found** — W28 owns `algebra-i-07` + registry; its unlock ids (`bp.inequality.gate` / `rank.riser.marshal` / `zone.eta.gate`) are collision-free vs L1–L6 and have zero game-store fields yet (consistent with the deferred-3D pattern). `resolveTerminalLessonId` advances L5→L6→L7 correctly; `loadLesson` registers `lesson7` + `LESSON_7_ID`. Shared tree builds clean. |

## Spot-check notes

### Payoff parity (vs W16 / W21 / W23 / W25)

| Unlock | L2 bar | L3 bar | L4 bar | L5 bar | L6 wave 27 | Read |
|--------|--------|--------|--------|--------|------------|------|
| Blueprint | Rim rails | Y-splitter | Dual-pan beam | Dual-dial calibrator | Dual mirror panels (lhs cyan / rhs amber) | In-world; thematic (both sides of the equation); similar silhouette weight to prior auto-present props |
| Rank | Amber adept | Violet expert | Gold operator | Mint chief | Ice vanguard sixth tier | Clear rung |
| Zone | Diamond annex + bridge | Hex relay + bridge | Square yard + bridge | Pentagon forge + bridge | Flat-top hex yard + bridge + mast + mini mirror rack | Strong payoff; east-of-Alpha slot closes the W25 placement question without a `zMin` move — but see the 30° split below |

### `groundHeight` spot-check (math)

| Sample | Expected | Result |
|--------|----------|--------|
| `(9.2, 0)` center, unlocked | `0.12` | six half-planes pass ✓ |
| `(11.65, 0)` east flat walk edge, unlocked | `0.12` | `dx = 2.45 ≤ h` ✓ |
| `(11.66, 0)` just past east slack | `0` | `dx = 2.46 > h` ✓ |
| `(6.75, 0)` west flat walk edge, unlocked | `0.12` | `k=3` face: `2.45 ≤ h` ✓ |
| `(6.35, 0)` bridge mid, unlocked | `0.12` | bridge strip ✓ |
| `(5.8, 0)` bridge west end, unlocked | `0.12` | bridge strip; also inside Alpha disc (`5.8 ≤ 6`) ✓ |
| `(6.9, 0)` bridge east end, unlocked | `0.12` | bridge strip; hex also passes (`dx = −2.3`) ✓ overlap |
| `(9.2, 2.82)` north vertex walk tip, unlocked | `0.12` | `2.82·sin60° = 2.443 ≤ h` ✓ |
| `(9.2, 2.9)` past vertex tip | `0` | `2.51 > h` ✓ |
| Any zeta sample, locked | `0` | `hasZetaMirror` false → no hex/bridge contribution; `(9.2,0)` outside Alpha (`9.2² = 84.6 > 36`) ✓ |

`z = 0` chain: Alpha → bridge → yard all return exactly `PAD_TOP = 0.12` — continuous, one height. Vertex inset: walkable region stops `0.15` inside each face (same deliberate slack as all prior pads).

### Hex orientation — the 30° kitbash split (headline finding)

Installed `three@0.172.0` settles the convention: `CylinderGeometry` places ring vertices at `x = r·sinθ, z = r·cosθ` (**θ measured from +Z**); `CircleGeometry` uses `x = r·cosθ, y = r·sinθ` (**θ from +X**, preserved in-plane after the standard `rotX(−π/2)`). Reusing one numeric `thetaStart` across both classes is therefore **always off by 90°, which surfaces as `90° mod (360°/n)`**: square `90 mod 90 = 0` (Delta coherent — by symmetry, not by design), hexagon `90 mod 60 = 30`, pentagon `90 mod 72 = 18`.

Applied to `L6UnlockProps.tsx`:

| Layer | Construction | Actual orientation | Verdict |
|-------|--------------|--------------------|---------|
| Walk mesh | six half-planes, normals `k·π/3`, `h = 2.45` | flat faces ⊥ `k·60°` (±X flat); vertices `30°+k·60°` at r 2.83 | ✓ matches doc intent |
| Top disc | `circleGeometry [2.655, 6, π/2]` + `rotX(−π/2)` | flat faces ⊥ `k·60°` (east face midpoint `(0.866r, 0)`); apothem 2.30 | ✓ matches walk |
| Body cylinder | `cylinderGeometry [3.00 / 3.35, 6, θstart π/2]` | **vertices on `k·60°` — pointy ±X**; flat faces ⊥ `30°+k·60°`, apothem 2.60 | ✗ rotated 30° from walk/disc |
| Six ice edge bars | centers at bearing `π/2 + k·π/3`, radius 2.60, tangential | sit exactly along the **body's** faces (body face apothem = `3.0018·cos30° = 2.60` ✓) — i.e., at the walk/disc hexagon's **vertices** | ✗ trace the wrong hexagon |

Consequences:

- Builder doc "thetaStart = π/2 so flat faces west" — false for the cylinder (the west feature is a **vertex** aimed at the bridge). "Edge glow bars at six flat midpoints" — true only of the skirt's hexagon; on the walkable deck they are diagonal corner slashes, each 2.85-long bar spanning vertex to vertex with its ends hovering past the disc rim.
- Doc clearance "East flat edge x = 11.8 — inside BOUNDS x=12" holds for walk (11.65) and disc (11.50), but the built body east **vertex** reaches `9.2 + 3.00 = 12.20` (top) and `9.2 + 3.35 = 12.55` (bottom flare) — outside `BOUNDS.x`. Player clamp at 12 can stand at deck level beside/inside the ankle-height skirt. Cosmetic, reachable.
- West skirt vertex stabs to `x = 6.20` (top) / `5.85` (bottom): bottom tip buries inside Alpha's body cylinder (hidden); top vertex leaves a small dark flange between the Alpha rim and the bridge mouth.
- Bridge-mouth z-fight risk: body top cap (`y = 0.12`) and bridge slab top (`y = 0.12`) are coplanar over a ~0.85 × ~1.4 lens near `z = 0`, `x ∈ [6.2, 7.05]` — larger than prior pads' butt strips because a vertex (not a flat face) meets the slab. Same coplanar idiom exists on all bridges by design; verify in-browser whether the patch shimmers.
- Rim float at the six walk-hex vertex tips (e.g. `(9.2, ±2.83)`): walkable to 2.83 while the disc vertex stops at 2.655 and the skirt face at 2.60 — up to ~0.23 of air at the exact tips. Same magnitude as the gamma vertex tips (pre-existing slack class), now at six points.

**Chronic pattern, correcting the record:** this is the third occurrence of the cylinder/circle `thetaStart` trap. Gamma (W21) has the *inverse* mismatch — walk+disc+bars pointy-east, body flat-±X (30°, its comment "thetaStart 0 = vertex at +X" is likewise wrong: θ=0 puts the vertex at +Z); Epsilon (W25) body is rotated 18° — the W25 critic's "share one pentagon story (no W21-style shell/top mismatch)" was rubber-stamped in error. Delta (W23) is the only fully coherent pad, saved by square symmetry. W27 is the worst instance because the glowing accent layer (the six bars, the pad's most readable feature at distance) joined the wrong silhouette.

### Zone HUD soft gap (carried forward)

`ZoneId` remains `'alpha' | 'beta'` — no `'zeta'` (same as annex/gamma/delta/epsilon before it). Standing on the mirror yard lights no live zone chip; `activeZone` never reflects Zeta. Builder's soft-gap note is accurate; does not block the walk-on payoff.

### MirrorProp placement / terminal ring

- Clear of L5 calibrator `[−2.8, 1.2]` (Δx 5.2), L4 beam `[2.7, 1.4]` (Δz 2.9), L3 splitter `[−2.4, −1.6]` (Δx 4.8) ✓ as claimed.
- Unremarked by the builder: the pedestal at `[2.4, −1.5]` sits at distance ≈ 2.00 from the terminal `[2.5, −3.5]` — squarely on the proximity ring band (1.85–2.05) at `y 0.14`; the base (r ≤ 0.26, y 0.12–0.20) intersects the ring plane. Depth-tested, so the ring reads as passing under the prop — acceptable, but it is the first Alpha prop to stand on the terminal's pulse ring, and it lives inside `TERMINAL_RADIUS 2.3` (near-terminal prompt zone). Thematically defensible (mirror beside the terminal); worth a glance in-browser.

### Vanguard / chips / objective

- Unlock flash L6 transitions wired (vanguard → rank, mirror → blueprint, zeta → zone), deferred-until-explore preserved.
- L6 chips use `.gr-l2-chip` + `.gr-l6-chip` ice accent overrides from blob unlock ids; `data-tier="vanguard"` (attribute semantic only — no CSS targets `data-tier`, same as prior tiers).
- `objectiveZetaMirrorOpen` EN/ES/PL present; objective priority zeta → epsilon → delta → gamma → annex → beta → blueprint → terminal (zeta highest, as claimed).
- Ice path studs `x = 1.2, 2.58, 3.96, 5.34, 6.72, 8.10` at `z = 0` all sit on walkable surfaces (`(6.72, 0)` on bridge, `(8.10, 0)` on hex) and continue the gate-wave index after the epsilon studs.
- `l6UnlockTitle` pulls from `lesson6.unlocks` — titles stay content-driven.

### W26 / W28 coexistence

- `algebra-i-06` content tracked and untouched by W27; its `worldIntegration` ids match the store wiring one-for-one.
- `loadLesson.ts` imports `algebra-i-07`, exports `LESSON_7_ID` / `lesson7`, registers in `LESSONS`; `resolveTerminalLessonId` checks L6 mastered → L7 first, chain L1→L7 intact.
- L7 unlock ids distinct, zero game-store fields (3D deferred per W28 doc) — no id collisions, no shared-file conflicts with W27's game-layer edits.

## Build

```bash
npm run build            # exit 0 — tsc -b + vite + spa-fallback (2026-08-05 critic pass)
npm run content:validate # exit 0 — 7/7 packages including algebra-i-06 and algebra-i-07
```

## Single largest gap

**Zeta skirt + ice edge bars are rotated 30° from the walkable hexagon.** `CylinderGeometry` θ originates at +Z, `CircleGeometry` θ at +X; copying `HEXA_THETA = π/2` into both puts the disc's flat faces on ±X (correct) but the cylinder's *vertices* on ±X (wrong), and the six ice bars were placed on the skirt's face apothems — so the glow hexagon and the deck hexagon disagree by 30°, the east skirt vertex pokes past `BOUNDS.x`, and the west vertex stabs into the bridge mouth. Fix is small and local: cylinder `thetaStart` → `0` (flat faces ±X), bar bearings → `k·π/3` (radius idiom can stay); walk mesh, disc, and marker already agree and need no change. Same pass should re-check gamma (30° inverse) and epsilon (18°) skirts.

Secondary (do not displace headline):

- No `'zeta'` `ZoneId` / HUD live chip on the mirror yard — sixth recurrence of the half-open zone loop (annex, gamma, delta, epsilon, zeta)
- Mirror pedestal stands on the terminal proximity ring band (cosmetic, unremarked by builder)
- Bridge-mouth coplanar cap/slab lens — verify z-fight in-browser
- Vanguard ice pips remain small at camera distance (shared L2–L6 plateau)
- Walk vertex tips float ≤ 0.23 past skirt/disc at six points (pre-existing slack class, doubled count vs gamma)

## Plateau / next recommendation

1. **Small geometry fix (one wave, one file):** align `ZetaMirror` body + bars to the flat-top walk/disc orientation (`thetaStart 0` cylinder, bars at `k·π/3`); while there, apply the same convention audit to `GammaRelay` (30°) and `EpsilonCal` (18°) bodies — one shared helper (`ngonThetaStart(flatFaceBearing, n)` for cylinder vs circle) would kill the whole defect class.
2. **Small product beat:** add `ZoneId = 'zeta'` (and eventually `'epsilon'`, `'delta'`, `'gamma'`, `'annex'`), resolve when on side pads, optional HUD live chip — closes the zone payoff loop across L2–L6.
3. **Then climb the rung:** L7 unlocks (`bp.inequality.gate`, `rank.riser.marshal`, `zone.eta.gate`) via `L7UnlockProps` + flags; W28's Eta Threshold Gate theme suggests a gate/threshold arch — placement TBD (only Alpha-west and Beta-south fringes remain inside `BOUNDS`; may finally force the `zMin` move deferred since W25).
4. **Optional fidelity:** placeable mirror via blueprint slot if auto-present reads thin in-browser.

Absolute AAA authored/GLTF ceiling remains open from W16–19; Wave 27 correctly spent budget on **curriculum→world payoff**, not another decor pass.

## Continuity

| Prior | Wave 27 |
|-------|---------|
| W25: L5 unlocks as 3D props | **Pattern reused one rung up — closed for L6** |
| W25 follow-up: L6 placement TBD (south `zMin` or new slot) | **Done — east-of-Alpha slot; no `zMin` move needed** |
| W26 L6 content parallel | **No merge collision with W27 game props** |
| W25 critic: pentagon layers "share one silhouette story" | **Correction — epsilon body rotated 18°; same convention trap as zeta (30°) and gamma (30° inverse)** |
| W28 L7 content parallel | **Ids distinct, terminal advance L6→L7 verified; L7 3D deferred** |
| W27 new follow-up | **Fix zeta skirt/bar theta; audit gamma + epsilon bodies; `'zeta'` ZoneId** |

Prior tip `76903a5` (W25–W26). This wave closes L6 world payoff; W28 closes L7 content.

**Orchestrator pre-ship fix (after critic):** Zeta cylinder `thetaStart → 0`, ice bars at `k·π/3`; Gamma cylinder `θ → π/2`; Epsilon cylinder `θ → π/5 − π/2`. Headline silhouette split closed; remaining soft gaps (no `'zeta'` ZoneId, mirror-on-terminal-ring) unchanged.

## Out of scope this critic

No Playwright film / seeded-blob screenshots (bridge z-fight and terminal-ring read flagged for that pass); no live Pages deploy watch; no mobile FPS bench; no code edits at critic time (orchestrator applied geometry fix before ship).
