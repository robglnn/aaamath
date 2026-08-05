# Critic report — Wave 17 (authored hero-prop silhouettes)

**Date:** 2026-08-05  
**Critic:** fresh-context gauntlet CRITIC (Builder ≠ Critic; **no `src/` edits**)  
**Judged surface:** local `npm run build` + `npm run preview` (`127.0.0.1:4173/aaamath/`) — Wave 17 present in working tree / `dist`. Live Pages may lag; preview preferred.  
**Builder doc:** `docs/gauntlet/builder-wave17-gltf.md`  
**Prior:** `critic-wave16.md` → **PASS_WITH_GAPS** (largest gap: authored set fidelity still under kitbash / primitive ceiling)

## Verdict: PASS_WITH_GAPS

Wave 17 **closes the Wave 16 silhouette headline for three hero props** with real authored profile geometry (lathe / bevel-extrude) and zero network GLTF. Dishes, Beta gate pillars, and equipment racks read as authored silhouettes in spawn / gate frames — not stacked boxes. Cold shell, pedagogy wires, and build all hold. Absolute AAA set fidelity (sculpted cast / terminal / material response across the *whole* range) remains open; only the hero trio crossed the kitbash line.

## What closed vs Wave 16 gap

| Wave 16 leftover | Wave 17 evidence | Stance |
|------------------|------------------|---------|
| Authored set fidelity under kitbash ceiling (headline) | `proc/authoredGeo.ts` kit: paraboloid `dish` + rolled rim, turned `gatePillar` capital profile, beveled `rackCarcass` / `rackBlade` / `rackPlinth`; mounted in `RangeDecor` / `BetaBarrier` / `AuthoredProps` | **Raised and partially closed** — three heroes leave the primitive ceiling; set-wide kitbash still dominates |
| Literal GLTF required? | Builder correctly reframes bar as *silhouette language*; zero `public/` assets, zero loader, zero new deps | **Acceptable** — claim is anti-kitbash silhouette, not `.gltf` container format |
| Cold shell / lazy GameView | `dist/index.html` modulepreload: `_commonjsHelpers` + `react-vendor` only; no `three` / `katex` / `GameView` / `r3f` | **Hold** |
| Pedagogy non-regression | Untouched: `celebrating = masteryDone`; `resolveTerminalLessonId` → L2 after L1 mastered | **Hold** |

## Spot-check (read-only)

| Area | Result |
|------|--------|
| `authoredGeo.ts` | Shared lazy kit (`getAuthoredGeoKit`); dish 14-step parabola + rim lip (28 seg); gate pillar plinth→shaft→echinus→abacus (~1.88); rounded-rect extrude bevels 0.03 / 0.016 / 0.02 |
| `proc/index.ts` | Re-exports kit + type |
| `RangeDecor` `AntennaDishes` | Shared `dish` + steel map; mast/knuckle/hub/counterweight; tripod `Strut`s → horn + blinking tip; placements `[-8.2, 0.5]` / `[8.5, -3.2]` |
| `TrainingRange` `BetaBarrier` | Posts `geometry={gatePillar}` at `±2.9`; sink-on-unlock / emissive accent unchanged |
| `AuthoredProps` | `EquipmentRack` replaces `ServiceJunction` at `[-6.8, -1.2]` / `[7.1, -3.8]`; ducts + stenciled crates carry over |
| Pedagogy | `LessonOverlay`: `celebrating = masteryDone`; `loadLesson.resolveTerminalLessonId`: L1 `mastered` → `algebra-i-02` |
| Cold shell (HTML) | Entry script + react-vendor preload only — **no three, no katex** |
| Cold network (preview after canvas) | GameView / r3f / three load (expected); **katex absent**; 0 console errors (AudioContext autoplay warnings only — benign) |

### Build

```
npm run build   # green — tsc + vite 6.4.3 + spa-fallback
GameView chunk  # 80.85 kB raw / 21.74 kB gz (matches builder claim)
three chunk     # 689.52 kB (unchanged)
Network assets  # 0 B added under public/
base            # '/aaamath/' intact in asset URLs
```

### Visual (preview + builder shots)

| Shot | Path | Read |
|------|------|------|
| Critic spawn | `docs/gauntlet/_critic-shots/critic-wave17-spawn.jpg` | East dish shows **paraboloid bowl + feed**; gate posts show **turned capital** taper; mid-field racks show **blade stack** slits — authored vs box |
| Critic dish orbit | `…/critic-wave17-toward-dish.jpg` | Dish silhouette clearer after yaw; pillars + racks still readable |
| Critic gate | `…/critic-wave17-gate.jpg` | Close gate: capital trim / necking rings vs old pipe posts unmistakable |
| Builder spawn / gate | `builder-wave17-{spawn,gate}.jpg` | Corroborates same three heroes |
| Builder “dish-close” | `builder-wave17-dish-close.jpg` | **Mislabeled** — frame is gate approach, not dish close-up (cosmetic doc gap) |

Silhouette verdict: **yes, authored vs more boxes** for the three claimed heroes. Remaining mid-field (ducts, crates, player, terminal, barrier *pane*, light masts) still reads kitbash / primitive.

## Pedagogy / Pages / cold-shell status

| Mandate bar | Status |
|-------------|--------|
| Celebrate ↔ masteryDone | **Hold** |
| L2 via `resolveTerminalLessonId` | **Hold** |
| KaTeX deferred; Three/GameView lazy | **Hold** — confirmed HTML + preview probe |
| Pages `base: '/aaamath/'` | **Hold** in build graph; live deploy not re-judged |

## Single largest remaining AAA gap

**Set-wide authored fidelity still incomplete beyond three profile heroes.**

Wave 17 clears the Wave 16 *silhouette* ceiling for dishes / gate pillars / racks with zero-network profile geometry — a real, budget-correct win. The range as a whole is still mostly multi-mesh primitives + canvas steel/stencil maps (player, terminal, ducts, crates, barrier pane, mast hardware). Absolute Fortnite-grade set (sculpted cast / terminal, material response leap, unique massing across the field) remains the open bar.

Secondary (do not displace headline):

- Builder `dish-close` shot mislabeled (gate frame)
- Gate unlock FX still unfilmed end-to-end; L2 annex still lacks a dedicated celebration beat
- Placeable second blueprint rail still deferred

## Continuity

| Prior largest gap | Wave 17 |
|-------------------|---------|
| W16: authored set fidelity / kitbash ceiling | **Partial close** — three heroes authored; set-wide bar remains |
| Overnight: mastery→Beta FX unfilmed | **Still open** (unchanged this wave) |
| W15→16: L2 not 3D | **Still closed** |

## Out of scope this critic

Live Pages redeploy lag; ESLint run (builder claim only); content:validate re-run (pedagogy files untouched).
