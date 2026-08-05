# Critic report — Wave 16 (L2 3D unlocks + fidelity / FX / chrome)

**Date:** 2026-08-05  
**Critic:** fresh-context gauntlet CRITIC (Builder ≠ Critic; **no `src/` edits**)  
**Judged surface:** local `npm run build` + `npm run preview` (`127.0.0.1:4173/aaamath/`) — Wave 16 changes present in working tree / `dist` (HEAD tip `2737db5` plus uncommitted Wave 16). Live Pages may lag; preview preferred.  
**Builder docs:** `builder-wave16-l2-3d.md`, `builder-wave16-fidelity-fx.md`  
**Prior wrap:** `critic-overnight-final.md` → **PASS_WITH_GAPS** (authored fidelity headline; mastery→Beta FX unfilmed; L2 not yet 3D)

## Verdict: PASS_WITH_GAPS

Wave 16 **closes the functional overnight leftovers** that blocked a morning “L2 pays off in the range” demo: L2 unlocks are real world props (rails / adept marks / walkable annex), kitbash fidelity and gate FX are stronger on paper and in spawn reads, locked Beta / chrome hierarchy is quieter. Absolute Fortnite training-range **authored** fidelity remains open under the primitive + proc ceiling — improved, not closed.

## What closed vs overnight gaps

| Overnight leftover | Wave 16 evidence | Stance |
|--------------------|------------------|---------|
| L2 unlocks HUD-only (`bp.pad.rail`, `rank.riser.adept`, `zone.beta.annex`) | `UnlockFlags` + App → GameView → store; `L2UnlockProps` rails + annex; Player adept chevrons; `groundHeight(…, hasBetaAnnex)` diamond + bridge; seeded spawn shows Alpha rim rails + distant **BETA ANNEX** / **ZONE BETA** labels + L2 HUD chips | **Closed** |
| Authored prop / material fidelity (headline) | `AuthoredProps` kitbash (junctions / ducts / stenciled crates) + `makeSteelPlateTexture` / `makeStencilDecalTexture`; denser mid-field read | **Raised, not closed** — still primitives + canvas maps |
| Mastery→Beta unlock FX unfilmed | `UnlockCelebrationFx` (rings / beam / sparks / light + `rig.gateCelebration` camera nudge); deferred-until-explore preserved | **Code closed; not critic-filmed** (seeded already-unlocked skips transition). FX watches **L1 `hasZoneBeta` only** — annex appearance has no dedicated celebration beat |
| Loud web chrome / locked Beta competing with Terminal | `.app-chrome` / locale softer; locked label **BETA LOCKED** + `subdued` + lower light/emissive | **Closed enough** for hierarchy — cold spawn Terminal beam + objective still hero; locked Beta quieter |

## Spot-check (read-only)

| Area | Result |
|------|--------|
| `UnlockFlags` / `applyMasteryUnlocks` | Six flags; L2 trio wired |
| `App.tsx` | `railBlueprint` / `adeptRank` / `betaAnnex` (+ legacy `zone.beacon.cyan`) from blob or `algebra-i-02` mastered |
| `L2UnlockProps` | Auto-present Alpha rim rails; annex diamond + bridge + label; null when locked |
| `UnlockCelebrationFx` | Mounted from `TrainingRange`; camera nudge via `rig.gateCelebration` |
| `ZoneLabel` | Extracted; `subdued` / scale used for locked Beta |
| Pedagogy | `celebrating = masteryDone`; `youDoQueue` freeze intact; L1+L2 `content:validate` **2/2 PASSED** |
| Cold shell | HTML: no katex string / no katex modulepreload; entry + react-vendor only. Preview cold network: GameView/three — **no katex**. Lazy GameView ~78 kB. `base: '/aaamath/'` |

### Build / validate

```
npm run build            # green (tsc + vite + spa-fallback)
npm run content:validate # 2/2 passed (algebra-i-01 + algebra-i-02 unlocks match props)
```

### Playwright (preview)

| Shot | Path | What it shows |
|------|------|----------------|
| Cold locked spawn | `docs/gauntlet/_critic-shots/critic-wave16-cold-spawn.png` | Objective → Terminal; **BETA LOCKED**; no L2 chips; canvas up |
| Unlocked spawn (L1+L2 seeded) | `docs/gauntlet/_critic-shots/critic-wave16-unlocked-spawn.png` | Rim **rails**; **ZONE BETA** + **BETA ANNEX** labels; L2 chips (Adept / Pad rail / Annex) |
| Midwalk / Beta approach | `…/critic-wave16-midwalk.png`, `…-toward-beta.png`, `…-beta-view.png`, `…-annex.png` | Corridor walk; pointer-lock limits annex close-ups — spawn remains primary annex/rail proof |

Cold resource probe (performance entries): `index`, `GameView`, `three` — **katexCold: []**.

## Pedagogy / Pages / cold-shell status

| Mandate bar | Status |
|-------------|--------|
| Math Academy clarity / no pedagogy regression | **Hold** — celebrate tied to mastery; adaptive freeze; L2 content validates; KaTeX still lesson-deferred |
| Pages / `base: '/aaamath/'` | **Hold** in build graph; live deploy not re-judged this pass (preview = source of truth for Wave 16) |
| Cold shell: KaTeX off first paint; Three/GameView lazy | **Hold** — confirmed on preview cold load |

## Single largest remaining AAA gap

**Authored set fidelity still under a kitbash ceiling.**

Wave 16’s `AuthoredProps` + steel/stencil maps are a real densification win, but masses remain multi-mesh primitives + procedural canvases. Fortnite-grade training-range silhouettes (GLTF trim, material response, unique prop language) are still out of reach — same absolute bar the overnight critic left open, now with a higher floor.

Secondary (do not displace headline):

- Gate unlock FX not end-to-end filmed; L2 annex has no parallel in-camera celebration
- Auto-present rails (placeable second blueprint slot deferred)
- Playwright WASD without pointer-lock weak for annex walk-on proof (code `groundHeight` is sound; on-pad film incomplete)

## Continuity

| Prior largest gap | Wave 16 |
|-------------------|---------|
| Overnight: authored fidelity | **Open** — kitbash raised; GLTF bar stands |
| Overnight: mastery→Beta FX unfilmed | **Partial** — stronger FX module; film still owed |
| Post–wave 15: L2 not 3D | **Closed** |

## Out of scope this critic

No live Pages deploy watch; no mobile FPS bench; no full mastery playthrough film (seeded blob used for unlock presence).
