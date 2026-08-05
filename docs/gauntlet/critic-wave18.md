# Critic report — Wave 18 (terminal/player heroes + L2 polish)

**Date:** 2026-08-05  
**Critic:** fresh-context gauntlet CRITIC (Builder ≠ Critic; **no `src/` edits**)  
**Judged surface:** local `npm run build` + `npm run preview` (`127.0.0.1:4173/aaamath/`) — Wave 18 present in working tree / `dist`. Live Pages may lag; preview preferred.  
**Builder docs:** `builder-wave18-heroes.md`, `builder-wave18-l2-polish.md`  
**Prior:** `critic-wave17.md` → **PASS_WITH_GAPS** (largest gap: set-wide fidelity beyond three profile heroes)

## Verdict: PASS_WITH_GAPS

Wave 18 **closes the Wave 17 terminal gap** with real authored lathe/bevel geometry — the Algebra Terminal reads past box-kitbash in-camera. L2 polish lands: annex objective copy is live, Alpha rim rails stay readable, annex path studs + rail materialization FX are code-complete under the deferred-until-explore idiom. **Player does not clear the same authored bar** (modest box garnish only). Cold shell and pedagogy hold. Absolute set-wide AAA fidelity remains open.

## Judge answers

| Question | Answer |
|----------|--------|
| Do terminal / player read past box-kitbash? | **Terminal: yes.** Turned pedestal + collar + beveled housing/bezel/keydeck clear the primitive ceiling. **Player: no (partial).** Brow ridge / pack side housings / toe wedges improve silhouette but remain stacked `boxGeometry` — kitbash with garnish, not profile-authored. |
| Rail FX / annex path readable? | **Rails: yes** at unlocked spawn (cyan rim bars). **Materialization pop: code-verified, not filmed** (seeded already-unlocked skips `prev === null` one-shot — same stance as gate FX). **Annex studs: code-verified**; bridge walk under pointer-lock limits did not yield a clean stud close-up this session. **Objective copy: yes** — HUD shows “Beta Annex open — cross the bridge east of Beta”. |
| Cold shell + pedagogy hold? | **Hold.** HTML modulepreload: `_commonjsHelpers` + `react-vendor` only (no `three` / `katex` / `GameView`). Preview cold network: GameView/r3f/three present; **katex absent**. `celebrating = masteryDone`; `resolveTerminalLessonId` → L2 after L1 mastered. |

## What closed vs Wave 17 gap

| Wave 17 leftover | Wave 18 evidence | Stance |
|------------------|------------------|--------|
| Terminal still kitbash / primitive | `authoredGeo` `terminalPedestal` (lathe flare→cove→collar→taper), `terminalCollar`, beveled `terminalHousing` / `terminalBezel` / `terminalKeydeck`; mounted in `TrainingRange` `Terminal` | **Closed** for the terminal hero |
| Player still kitbash | Helm brow plate, pack side housings + vent block, toe-cap wedges (`Player.tsx`) — all boxes | **Raised, not closed** |
| Crate lids flat boxes | Shared `crateLid` bevel-extrude in `AuthoredProps` | **Minor close** |
| L2 annex soft destination / objective | `ANNEX_STUD_XS` cyan studs continue gate wave index; `objectiveAnnexOpen` EN/ES/PL supersedes Beta line when `hasBetaAnnex` | **Closed enough** for soft destination + copy |
| Rail payoff filmable in-camera | `PadRailProp` scale pop + emissive flash + additive ring; deferred-until-explore | **Code closed; not critic-filmed** |
| Cold shell / pedagogy | Unchanged guards; GameView **84.21 / 22.60 kB gz** (matches L2-polish builder) | **Hold** |

## Spot-check (read-only)

| Area | Result |
|------|--------|
| `authoredGeo.ts` | Kit extended to 11 buffers; terminal pedestal 20-seg lathe; housing bevel 0.04; bezel 0.025; keydeck; `crateLid` |
| `TrainingRange` `Terminal` | Pedestal/collar/housing/keydeck/bezel use kit; screen canvas / LEDs / beacon / `TERMINAL_POS` / proximity unchanged |
| `Player.tsx` | +6 box meshes (brow, pack×3, toe×2); adept insignia preserved; **no** lathe/extrude |
| `L2UnlockProps` `PadRailProp` | One-shot pop (`easeOutBack`, 85 ms stagger, 1.45 s flash); ring `AdditiveBlending`; no replay on cold owned unlock |
| `GatePathLights` | Six annex studs when `hasBetaAnnex`; wave index `studs.length + i` |
| `Hud` / `ui.ts` | `objectiveAnnexOpen` priority above Zone Beta / blueprint / terminal |
| Pedagogy | `LessonOverlay`: `celebrating = masteryDone`; `resolveTerminalLessonId`: L1 mastered → `algebra-i-02` |
| Cold shell (HTML) | Entry + react-vendor preload only |
| Cold network (preview) | GameView / r3f / three; **katexCold: []**; 0 console errors |

### Build

```
npm run build   # green — tsc + vite 6.4.3 + spa-fallback
GameView chunk  # 84.21 kB raw / 22.60 kB gz (matches builder-wave18-l2-polish)
three chunk     # 689.52 kB (unchanged)
Network assets  # 0 B added
base            # '/aaamath/' intact in asset URLs
```

### Visual (preview + critic shots)

| Shot | Path | Read |
|------|------|------|
| Cold-ish spawn | `docs/gauntlet/_critic-shots/critic-wave18-cold-spawn.jpg` | Player rear silhouette; Terminal beam ahead; objective → Terminal |
| Unlocked spawn | `…/critic-wave18-unlocked-spawn.jpg` | Alpha **rim rails**; L2 chips; objective **Beta Annex open…**; ZONE BETA / BETA ANNEX labels |
| Toward terminal | `…/critic-wave18-toward-terminal.jpg` | Approach framing |
| Terminal close | `…/critic-wave18-terminal.jpg` | **Turned pedestal + collar + beveled carcass/bezel** unmistakable vs old boxes; player brow/pack/toes visible |
| Annex attempt | `…/critic-wave18-annex-path.jpg` | Walk framing limited; studs not cleanly isolated — rely on code + objective for annex path claim |

Silhouette verdict: **terminal authored vs boxes — yes.** Player still kitbash with readable garnish. Rail presence yes; live materialization pop unfilmed.

## Pedagogy / Pages / cold-shell status

| Mandate bar | Status |
|-------------|--------|
| Celebrate ↔ masteryDone | **Hold** |
| L2 via `resolveTerminalLessonId` | **Hold** |
| KaTeX deferred; Three/GameView lazy | **Hold** — HTML + preview probe |
| Pages `base: '/aaamath/'` | **Hold** in build graph; live deploy not re-judged |

## Single largest remaining AAA gap

**Set-wide authored fidelity still incomplete — player remains kitbash garnish; mid-field cast (ducts, light masts, barrier pane, material response) stays primitive.**

Wave 18 correctly lifts the Algebra Terminal (and crate lids) onto the Wave 17 profile-geometry kit and soft-lands L2 destination UX. That does not finish the set: the player never left stacked boxes, and the range as a whole still reads multi-mesh primitives + proc maps more than a sculpted Fortnite training floor.

Secondary (do not displace headline):

- Rail materialization FX unfilmed end-to-end (seeded unlock skips one-shot)
- Annex still lacks a dedicated celebration beat (stud wave + HUD flash only)
- Placeable second blueprint rail still deferred

## Continuity

| Prior largest gap | Wave 18 |
|-------------------|---------|
| W17: set-wide fidelity beyond three profile heroes | **Partial close** — terminal (+ crate lid) joins the authored set; player/mid-field bar remains |
| W16→17: L2 annex soft destination | **Mostly closed** (studs + objective copy); celebration still soft |
| Overnight: mastery→Beta FX unfilmed | **Still open** (rail pop same pattern — code yes, film no) |

## Out of scope this critic

Live Pages redeploy lag; ESLint / content:validate re-run (pedagogy packages untouched); live mastery playthrough to film rail pop.
