# Critic report — Wave 10 cold load (KaTeX off first paint)

**Date:** 2026-08-05  
**Critic:** fresh-context gauntlet CRITIC (Builder ≠ Critic; **no `src/` edits**)  
**Judged commit:** `7db51fa` — *Ship wave 10: keep KaTeX off the cold training-range load.*  
**Judged surface:** **live** `https://robglnn.github.io/aaamath/` after Actions deploy `30998363501` (headSha `7db51fa6ec417b9fa73d29d90aa61f32fcfccc3d`) **success**. Cold HTML Last-Modified `2026-08-05 10:40:59Z`; entry `index-CtCmxeCV.js` (~20 kB).  
**Follow-on note:** During this critic session Pages also shipped `94b1277` (*Polish ground breakup…*, deploy `30998589856`). Re-probed current HTML (`index-CNmDgJMn.js`, Last-Modified `10:44:35Z`): **still no katex** in cold document or modulepreload list. Wave-10 lazy lesson/progress path remains intact under the polish tip.  
**Method:** HTTP fetch of cold HTML + entry; HEAD of split assets under `/aaamath/`; Playwright cold boot + network/perf resource filter; open House Standing; open Algebra Terminal via `onOpenTerminal` (proximity WASD unreliable under Playwright without pointer-lock); screenshots under `docs/gauntlet/_critic-shots/`. Read-only `git show 7db51fa` / builder note.  
**Prior critic:** `docs/gauntlet/critic-wave8-codesplit.md` — KaTeX was a separate chunk but still **eagerly modulepreloaded** on first paint because `LessonOverlay` was a sync import.

## Verdict: PASS_WITH_GAPS

Wave 10 **closes the wave-8 KaTeX cold-load gap**. Live cold HTML has **zero** `katex` strings and **no** katex `modulepreload`. App boots to the training range; House Standing and Algebra Terminal still open, and **katex JS/CSS arrive only on demand**. Pages stay healthy. Overnight AAA lift vs capsule-era is large and cumulative; the **largest remaining gap is still authored prop / material fidelity** (primitive + proc kitbash ceiling) — unchanged by this load-path wave.

## Continuity vs `critic-wave8-codesplit.md`

| Wave 8 finding | Wave 10 evidence | Stance |
|----------------|------------------|---------|
| Pages healthy; shell → 3D | Deploy `30998363501` green; boot → canvas; brand/objective/pad intact | **Agree** |
| Split chunks under `/aaamath/` | Entry / three / r3f / katex / LessonOverlay / StandardsView all **200** | **Agree** |
| KaTeX eagerly modulepreloaded on cold visit | Cold HTML modulepreloads only `_commonjsHelpers` + `react-vendor`; runtime preloads three/r3f/GameView/`loadLesson` — **never katex until Progress/Terminal** | **Closed** |
| Largest AAA gap = authored fidelity | Mid-field still kitbash; wave 10 is deferral, not art | **Agree — gap stands** |

## Focus answers

### 1. Cold HTML has NO katex modulepreload?

**Pass.**

Live document after `7db51fa` (and again after `94b1277`):

| Check | Result |
|-------|--------|
| `katex` substring in HTML | **Absent** |
| `link rel="modulepreload"` | `_commonjsHelpers-*.js`, `react-vendor-*.js` only |
| Entry script | `index-CtCmxeCV.js` (~20 kB) at wave-10 tip; later `index-CNmDgJMn.js` same shell shape |
| Cold network (Playwright) | No `katex-*.js` / `katex-*.css` until Progress or Terminal |
| Runtime modulepreloads after GameView eval | `GameView`, `r3f`, `three`, `extends`, `loadLesson` — **still no katex** |

Entry retains string references to the katex chunk name for dynamic `import()` — expected; that is not a preload.

**Non-blocking note:** `Hud` still statically imports lesson content (`loadLesson` chunk), so content warms with the range. That is **not** KaTeX and does not reopen the wave-8 gap.

### 2. App boots to training range?

**Pass.**

| Stage | Evidence |
|-------|----------|
| HTML / title | `200`, title `Axiom Rising` |
| 3D up | Canvas present; spawn screenshot shows Alpha pad, player, ZONE BETA LOCKED, objective strip |
| Chrome | EN/ES/PL + House standing; “Click to look”; WASD / E terminal footer |
| Blank forever? | **No** |

### 3. Opening Progress / Terminal still works (katex on demand)?

**Pass.**

| Action | UI | Network |
|--------|-----|---------|
| **House standing** | Compact Record drawer — rank Recruit, theorems list, jurisdiction chips | On open: `StandardsView-*.js`, `MathText-*.js`, `katex-*.js`, `katex-*.css` (absent before click) |
| **Algebra Terminal** | Lesson overlay — *Variables, Expressions, and the Language of Algebra*; BRIEF / mission objectives / Enter briefing | Fresh session open Terminal only: `LessonOverlay-*.js` + katex + MathText fire **together on open**; `katexResources === 0` on cold range beforehand |

Terminal proximity prompt (`E` / Open Algebra Terminal) was not reliably reached under Playwright WASD without pointer-lock; open path verified by invoking live `onOpenTerminal` (same App warm+`setLessonOpen` path the HUD button uses). Overlay DOM + screenshots confirm lesson UI.

### 4. Pages health?

**Pass.**

| Probe | Result |
|-------|--------|
| Deploy `30998363501` | **success** on `7db51fa` |
| Site URL | `200` |
| Assets under `/aaamath/assets/` | entry, react-vendor, three, r3f, katex, LessonOverlay, StandardsView, favicon — **200** |
| `base: '/aaamath/'` | No root `/assets/` leaks in cold HTML |
| Follow-on `94b1277` | Also green; cold-load katex invariant holds |

### 5. Overnight AAA progress + largest remaining gap?

**Progress: large, cumulative win — still not Fortnite AAA.**

Capsule-era → waves 1–10: proc deck/sky, readable ZONE signs, densified mid-field, motes, blueprint materials, ground breakup, audio stubs, code-split shell (~20 kB), and now **true KaTeX deferral**. First viewport reads as a mission training range, not a cyan grid + capsule.

**Largest remaining gap: authored prop / material fidelity (kitbash ceiling).**

Rails, crates, posts, hazard plates, and pads remain **primitive meshes + procedural/canvas textures + emissives**. Closing that gap needs GLTF-grade massing / trim / material response — out of Slice 0 procedural kitbash. Secondary backlog (not wave-10 blockers): Lesson 2 pipeline, speech locale voices, full mastery→Beta unlock critic film, Three.js weight once the range loads (~689 kB — expected).

## Screenshot notes

Local captures under `docs/gauntlet/_critic-shots/`:

| Shot | Observation |
|------|-------------|
| `critic-wave10-cold-spawn.png` | Training range first viewport; no lesson/progress overlay; confirms boot |
| `critic-wave10-progress.png` | House Standing drawer over live range |
| `critic-wave10-terminal.png` | Algebra Terminal lesson overlay (mission brief) after on-demand open |

## Bar comparison

| Bar | Status | Evidence |
|-----|--------|----------|
| Cold HTML: no katex modulepreload | **Pass** | HTML + runtime preload list + cold network |
| Boots to training range | **Pass** | Canvas + spawn screenshot |
| Progress / Terminal on demand + katex | **Pass** | Drawer + lesson overlay; katex only after open |
| Pages healthy | **Pass** | Deploy green; asset 200s under `/aaamath/` |
| Fortnite training-range AAA set fidelity | **Gap** | Kitbash ceiling stands; wave 10 is load-path only |

## Scope note

Cold-load / on-demand KaTeX / Pages / first-viewport / Progress+Terminal open only. Did not re-score mastery celebrate, adaptive you_do freeze, mobile FPS, or full walk-to-terminal film under pointer-lock.
