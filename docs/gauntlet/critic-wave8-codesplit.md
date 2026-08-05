# Critic report — Wave 8 code-split (Three / R3F / KaTeX / GameView)

**Date:** 2026-08-05  
**Critic:** fresh-context gauntlet CRITIC (Builder ≠ Critic; **no `src/` edits**)  
**Judged commit:** `783e8f6` — *Ship wave 8: code-split Three/KaTeX and panel-mapped player.*  
**Judged surface:** **live** `https://robglnn.github.io/aaamath/` after Actions deploy `30997476381` (headSha `783e8f64df202e1189d660f371177d04c9c6ee7e`) **success**. Cache-bust `?v=783e8f6-*` after deploy; HTML Last-Modified `2026-08-05 10:28:02Z`.  
**Method:** Playwright cold load + 3G-throttled boot timeline; network filter on `/aaamath/assets/*`; HTTP HEAD of entry + split chunks; live DOM (`canvas`, `modulepreload`); screenshot spawn. Read-only `git show 783e8f6` of `vite.config.ts` / `App.tsx` / builder notes.  
**Prior critic:** `docs/gauntlet/critic-wave6-atmosphere.md` — largest remaining AAA gap was **authored prop / material fidelity**. This pass judges whether code-split lands cleanly on Pages under `/aaamath/` without blanking or breaking the first viewport.

## Verdict: PASS_WITH_GAPS

Wave 8 **ships a healthy split load path** on GitHub Pages: app shell → Suspense boot (“Loading training range…”) → 3D canvas, with `three` / `r3f` / `katex` / `GameView` chunks all **200** under `/aaamath/assets/`. First viewport still reads as the training range (brand, objective, Alpha pad, player, Beta lock, terminal beam). Gaps vs Fortnite AAA **stand in kind** — kitbashed mid-field fidelity — and codesplit does not claim to close them. Mild codesplit completeness note: KaTeX is a separate chunk but still **eagerly modulepreloaded** on first paint (LessonOverlay remains a sync import in `App`).

## Continuity vs prior critics

| Prior finding | Wave 8 evidence | Stance |
|---------------|-----------------|--------|
| Pages healthy through wave 6/7 | Deploy `30997476381` green; new entry `index-DfAD-2eM.js` | **Agree** |
| First viewport readable corridor | Spawn still Alpha pad → Beta lock → terminal beam + objective HUD | **Agree** |
| Largest AAA gap = authored prop / material fidelity | Player gets panel map on torso/pack; mid-field kits unchanged | **Agree — gap stands** (player bump is local, not set-wide) |

## Focus answers

### 1. Pages loads (app shell then 3D) — no blank forever?

**Pass.**

| Stage | Evidence |
|-------|----------|
| HTML / entry | `200`, title `Axiom Rising`, entry `/aaamath/assets/index-DfAD-2eM.js` (~72 kB raw) |
| Suspense boot | Throttled cold load observed `.boot-screen` text **“Axiom Rising / Loading training range…”** with **no canvas** |
| 3D up | Same session then **canvas present**, boot gone; WebGL viewport ~1814×1195 |
| Console | No errors on successful load |
| Blank forever? | **No** — boot → canvas within throttled samples; unthrottled load settles on interactive range |

Hydrate-only copy (“Initializing local progress…”) was too fast to catch under sampling; Suspense range boot is the durable visible shell for the heavy chunks.

### 2. Asset paths under `/aaamath/` for split chunks?

**Pass.**

Live HTML + network (all **200**, all prefixed `/aaamath/assets/`):

| Asset | Role | Raw size (HEAD) |
|-------|------|-----------------|
| `index-DfAD-2eM.js` | App shell entry | ~72 kB |
| `three-DBCz8YZr.js` | `manualChunks` → `three` | ~689 kB |
| `r3f-oRF3DRl_.js` | `manualChunks` → `r3f` | ~353 kB |
| `katex-qUbTFZUP.js` + `katex-CE5csDsv.css` | `manualChunks` → `katex` | ~274 kB + CSS |
| `GameView-Bd-92IaA.js` (+ `GameView-*.css`) | Lazy `GameView` | ~61 kB |

`link rel="modulepreload"` targets `three` / `katex` / `r3f` (and live DOM also showed `GameView` preload after entry eval). **No** root-absolute `/assets/...` leaks; favicon `/aaamath/favicon.svg` **200**. Matches builder chunk table and Vite `base: '/aaamath/'`.

**Gap (non-blocking):** KaTeX is correctly split for cache boundaries, but still preloaded on cold visit because lesson UI is not deferred — so first paint still pays KaTeX weight. Three/R3F/GameView lazy+prefetch pattern is the real TTI win.

### 3. First viewport still looks right?

**Pass.**

Live spawn after `783e8f6`:

- Orbitron **Axiom Rising**
- **Objective · Reach the Algebra Terminal**
- Hex Alpha pad + cyan ring, player silhouette (amber visor), densified flanks, **ZONE BETA LOCKED**, distant terminal beam / motes
- EN/ES/PL + House Standing; “Click to look”; footer controls

No missing textures, broken canvas, or chrome regression from the split. Panel map on chest/pack is a subtle material upgrade at spawn distance — does not disturb silhouette hierarchy.

### 4. Largest remaining AAA gap?

**Authored prop / material fidelity (kitbash ceiling) — unchanged as the headline.**

Wave 8 answered a **load architecture** ask (+ a small player material touch). Mid-field rails, crates, posts, dishes, and ground breakup remain **primitive kitbash + emissive accents**. Fortnite-grade ranges still want authored massing, trim/decals, and material response under light across the set — not more chunk boundaries.

Secondary: House Standing / locale chrome still web-app vs diegetic HUD; KaTeX not deferred until lesson open.

## Screenshot notes

Local captures under `docs/gauntlet/_critic-shots/`:

| Shot | Observation |
|------|-------------|
| `critic-wave8-live-spawn.png` | Post-deploy wave-8 spawn; full HUD + 3D range; confirms non-blank first viewport |
| `critic-wave8-after-boot.png` | Settled frame after throttled boot→canvas path |

Boot string evidence is from Playwright timeline (`.boot-screen` → canvas), not a frozen mid-boot PNG (transition is short).

## Bar comparison

| Bar | Status | Evidence |
|-----|--------|----------|
| App shell → 3D, no blank forever | **Pass** | Throttled boot text then canvas; live spawn screenshot |
| Split chunks under `/aaamath/` | **Pass** | HEAD + network 200 for three/r3f/katex/GameView/index |
| First viewport intact | **Pass** | Brand, objective, pad, lock, beam, chrome |
| Code-split defers KaTeX until lesson | **Gap** | Eager `LessonOverlay` → katex modulepreload on cold load |
| Fortnite training-range AAA set fidelity | **Gap** | Kitbash ceiling stands; codesplit is not a fidelity wave |

## Scope note

Cold-load / Pages path / first-viewport health only. Did not re-score lesson overlay KaTeX rendering, mastery celebrate, mobile FPS, or offline. Player panel map noted but not treated as closing the set-wide AAA gap.
