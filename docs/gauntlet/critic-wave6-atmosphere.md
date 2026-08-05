# Critic report — Wave 6 atmosphere (motes + mid-field light budget)

**Date:** 2026-08-05  
**Critic:** fresh-context gauntlet CRITIC (Builder ≠ Critic; **no `src/` edits**)  
**Judged commit:** `56480ad` — *Ship wave 6: atmosphere motes and mid-field light budget.*  
**Judged surface:** **live** `https://robglnn.github.io/aaamath/` after Actions deploy `30996667362` (headSha `56480ad89884511779c0a74c5ed67303b259c866`) **success**. First Playwright session briefly served cached wave-5 HTML (`index-BlA89mhL.js`); cache-bust `?v=56480ad` landed wave-6 assets. Curl HTML already showed `index-CydCHFw8.js` / `index-fcnjOM6s.css` (Last-Modified `2026-08-05 10:15:44Z`).  
**Method:** Playwright screenshots (spawn + mid-corridor attempt); HTTP/asset probe; live script hash check; read-only `git show 56480ad` of `AtmosphereFx.tsx` / `RangeDecor.tsx` / `TrainingRange.tsx`; bundle string probe (`createRadialGradient`, `PointsMaterial`, `AdditiveBlending`).  
**Prior critic:** `docs/gauntlet/critic-wave5-density.md` — largest remaining gap was **authored prop/material fidelity**. This pass judges whether cheap ambient VFX + light-budget hygiene land cleanly without reopening density or Pages health.

## Verdict: PASS_WITH_GAPS

Wave 6 **ships visible Alpha-pad dust motes** (soft additive sprites) and **holds the mobile light count flat** by demoting wave-5 approach posts to emissive-only. Pages on `56480ad` is healthy. First-viewport AAA progress vs capsule-era start is **large and cumulative** (signs, materials, density, objective HUD, now air). Gaps vs a Fortnite training-range bar are **unchanged in kind**: kitbashed geo + emissive accents still cap fidelity; motes are atmosphere seasoning, not a materials upgrade.

## Continuity vs `critic-wave5-density.md`

| Wave 5 finding | Wave 6 evidence | Stance |
|----------------|-----------------|--------|
| Mid-field density substantially closed; corridor readable | Density kits still present (rails / conduits / pillars / dishes / posts); spawn still reads Alpha pad → Beta lock → terminal beam | **Agree** — atmosphere does not undo density or mush the corridor |
| Celebrate / mastery not re-opened | Out of atmosphere checklist; not re-judged this pass | **N/A** |
| Pages healthy at `354195a` | Pages healthy at `56480ad` (`index-CydCHFw8.js` / `index-fcnjOM6s.css`) | **Agree** |
| Largest gap = authored prop / material fidelity | Motes add air; props remain primitive kitbash | **Agree — gap stands** |

## Focus answers

### 1. Atmosphere motes — present, readable, not noisy?

**Yes — clear, tasteful pass on the cheap ambient ask.**

Ship `AtmosphereFx` at `56480ad` (mounted from `TrainingRange`):

| Kit | Spec | In-camera |
|-----|------|-----------|
| Drift motes | 28 `Points` (16 Alpha annulus, 12 terminal box), soft 64px radial sprite, additive, 20–50 s drift + twinkle | **Visible** at live spawn: soft cyan/white orbs in pad air volume and along the terminal beam column |
| Pad-edge sparkles | 12 rim points, sharp pow-curve blink in color only | Subtle rim life; does not compete with pad ring / objective strip |
| Perf posture | 2 draw calls, 40 verts, 30 Hz attribute throttle, **zero new lights / zero postprocessing** | Matches builder notes; no Pages/boot regressions observed |

**Readability:** Motes read as **dust / energy haze**, not UI sparkle spam. Spawn sightline stays clear (annulus placement). Hierarchy still wins: **Objective strip → ZONE BETA LOCKED → terminal beam**; motes support mood under that stack.

Mild note: from default spawn they are easiest to spot against the dark void and inside the beam; they are intentionally quiet — correct for “barely-there,” easy to miss on a quick glance if expecting Fortnite particle density.

### 2. Mid-field light budget?

**Pass — hygiene landed.**

`RangeDecor` LightPosts: original **6** keep `pointLight` pools; wave-5 approach densification posts (`-3.8/5.2`, `±4.5/-6.2`) are now **`lit: false`** (emissive mesh only). Holo pillar tip blips moved to emissive intensity animation (no extra lights). Decor also seats on `surfaceY` / `PAD_TOP` so Alpha-pad props no longer float at deck zero — small set-dressing correctness win alongside the budget cut.

### 3. Overall first-viewport AAA progress vs capsule-era start?

**Large, cumulative win — still not Fortnite AAA.**

| Era | First viewport reads as… |
|-----|--------------------------|
| Capsule-era start | Bare cyan grid + capsule body; no mission literacy; empty mid-field |
| Wave 1–2 | Pad / terminal / gate hierarchy; readable zone text; player silhouette |
| Wave 3–5 | Proc materials, live terminal face, densified corridor architecture, objective HUD |
| **Wave 6 (`56480ad`)** | Same set **plus** floating air (motes/sparkles) and cleaner light count |

Cold-load live spawn sells: Orbitron **Axiom Rising**, **Objective · Reach the Algebra Terminal**, hex Alpha pad, player silhouette, densified flanks, Beta lock plaque, terminal beam — **clearly past capsule-era**. Remaining shortfall is **authored massing / materials / ground breakup**, not “is there a world?”

### 4. Pages health

**Pass** (after brief client cache lag).

| Check | Result |
|-------|--------|
| Deploy | Actions “Ship wave 6…” `30996667362` **success**, headSha `56480ad` |
| `https://robglnn.github.io/aaamath/` | **200**, title `Axiom Rising`, boots into training range |
| Vite `base` `/aaamath/` | HTML refs `/aaamath/assets/index-CydCHFw8.js` + `index-fcnjOM6s.css` |
| Asset HEAD | JS **200** (~1.45MB), CSS **200**, favicon **200** |
| Transient | Playwright without cache-bust briefly ran wave-5 `index-BlA89mhL.js`; `?v=56480ad` + curl HTML confirm wave-6 ship — treat as browser/CDN HTML cache, not a broken deploy |

### 5. Single largest remaining gap vs AAA bar

**Authored prop / material fidelity (kitbash ceiling) — unchanged.**

Wave 6 correctly answered a **cheap ambient VFX** ask. It does **not** raise silhouette quality of rails, crates, posts, dishes, or ground breakup. Fortnite-grade ranges still want **authored props, trim/decals, and material response under light**. Next visual spend should stay on **fidelity of existing mid-field masses** (or a small authored kit), not more particle layers.

Secondary (unchanged): House Standing / locale chrome still web-app vs diegetic HUD; Zone Beta lock can overpower Alpha dressing on first viewport.

## Screenshot notes (what I saw)

Local captures under `docs/gauntlet/_critic-shots/` (not required in git):

| Shot | Observation |
|------|-------------|
| `critic-wave6-live-spawn.png` | Wave-6 bundle confirmed; soft floating motes in Alpha air + beam column; hex pad, objective strip, densified posts/rails, ZONE BETA LOCKED, terminal beacon — strongest atmosphere evidence |
| `critic-wave6-live-midwalk.png` | Same ship; WASD without pointer-lock did not advance far — treat as secondary frame, not a density re-score |

HUD: Orbitron **Axiom Rising**; **Objective · Reach the Algebra Terminal**; EN/ES/PL + House Standing; footer controls. Live script: `index-CydCHFw8.js`.

## Bar comparison

| Bar | Status | Evidence |
|-----|--------|----------|
| Atmosphere motes visible, tasteful, mobile-safe posture | **Pass** | Live spawn screenshots + `AtmosphereFx` (2 Points, no lights/PP) |
| Mid-field light budget flat (approach posts emissive-only) | **Pass** | `RangeDecor` `lit` flag; 6 pools kept, 4 approach posts demoted |
| First-viewport AAA vs capsule-era | **Pass (progress)** / **Gap (absolute AAA)** | Night-and-day vs bare grid+capsule; still kitbash vs Fortnite |
| Pages health on `56480ad` | **Pass** | Deploy green; HTML/JS/CSS/favicon 200 (post cache-bust) |
| Fortnite training-range AAA set fidelity | **Gap** | Wave-5 fidelity gap stands; motes do not close it |

## Scope note

Cold-load / spawn atmosphere + Pages + light-budget code review. Did not re-run lesson mastery → celebrate, mobile perf profiling, or offline stress. Drawer copy/`compactRecord` CSS polish in the same commit was not scored as atmosphere.
