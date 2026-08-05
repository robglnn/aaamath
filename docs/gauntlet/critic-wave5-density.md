# Critic report — Wave 5 set density (mid-field dressing)

**Date:** 2026-08-05  
**Critic:** fresh-context gauntlet CRITIC (Builder ≠ Critic; **no `src/` edits**)  
**Judged commit:** `354195a` — *Ship wave 5: denser mid-field set and lesson overlay delight.*  
**Judged surface:** **live** `https://robglnn.github.io/aaamath/` after Actions deploy `30996243242` (headSha `354195ac8151f920465e65ac1201271780a5259f`) **success**. Brief CDN `503 Unicorn` on first Playwright hit immediately post-deploy; retry landed clean `Axiom Rising` with new assets.  
**Method:** Playwright screenshots (spawn, mid-walk toward terminal); HTTP/asset probe; live JS coord spot-check; read-only `git show 354195a` of `RangeDecor.tsx` / `LessonOverlay.tsx` vs wave-3 baseline `94d60a7`.  
**Prior critic:** `docs/gauntlet/critic-wave3-materials.md` — largest remaining gap was **mid-field set density**. This pass judges whether wave 5 closed that gap without breaking Fortnite-lite readability or pedagogy.

## Verdict: PASS_WITH_GAPS

Wave 5 **meaningfully densifies** the Alpha → gate → terminal corridor (rails, conduits, holo pillars, dishes, extra posts/crates/spires) while keeping the walk **readable, not mush**. Pages ship is healthy on `354195a`. Celebrate UI remains **`masteryDone`-only**. Gaps vs a Fortnite training-range AAA bar have **moved up a tier**: mid-field emptiness is no longer the headline; **authored prop/material fidelity** (still kitbashed primitives + emissive accents) is.

## Continuity vs `critic-wave3-materials.md`

| Wave 3 finding | Wave 5 evidence | Stance |
|----------------|-----------------|--------|
| Mid-field sparse — “simple primitives + emissive accents on a wide empty deck” | Live spawn/mid-walk: approach rails with cyan caps, floor conduits toward terminal, amber holo pillars near Alpha, flank dishes, denser light-post line, extra crates/spires | **Agree + upgrade** — named density gap **substantially closed** as a checklist item |
| Zone labels / terminal literacy OK | Unchanged story: ZONE BETA LOCKED + live terminal face still own the frame | **Agree** — density did not obscure literacy |
| Pages healthy at `94d60a7` | Pages healthy at `354195a` (`index-BlA89mhL.js` / `index-V_Y9mWL_.css`) | **Agree** |
| Celebrate / mastery not re-judged in wave 3 | Code spot-check: `celebrating = masteryDone`; unlock cards still gated | **Pass** (see §4) |

## Focus answers

### 1. Mid-field density improved? (rails, conduits, pillars, dishes, extra posts)

**Yes — clear, shippable improvement.**

Ship `RangeDecor` at `354195a` adds `ApproachRails`, `EnergyConduits`, `HoloPillars`, `AntennaDishes`, and thickens existing kits:

| Kit | Wave 3 (`94d60a7`) | Wave 5 (`354195a`) |
|-----|--------------------|--------------------|
| Light posts | 6 | **10** (+ corridor / gate flanks) |
| Approach rails | — | **4** low steel segments + cyan caps |
| Energy conduits | — | **3** pulsing floor runs toward terminal |
| Holo pillars | — | **3** amber spinning tori near Alpha |
| Antenna dishes | — | **2** flank dishes |
| Supply crates | 5 | **7** |
| Distant spires | 6 | **8** |

**In-camera (live):**

- **Spawn:** Amber holo pillars left of Alpha; cyan-capped rail stubs framing the walk; flank dish silhouette; denser post line — mid-field no longer reads as empty deck + gate + beam alone.
- **Mid-walk (sprint toward terminal):** Rails form a clear corridor; cyan floor conduits lead the eye to the Algebra Terminal; posts/crates/dishes occupy flanks without filling the playable path. This is the strongest density evidence shot.

Builder claim in `builder-wave5-set-density.md` matches what shipped and what Pages serves (live bundle contains wave-5 post coords `-3.8` / `5.2`, pillar `-5.6`, dish `8.5`).

### 2. Still Fortnite-lite readable (not cluttered mush)?

**Yes.**

- Playable center stays open; props hug corridor edges and Alpha flanks.
- Hierarchy preserved: **Objective strip** → **ZONE BETA LOCKED** → **terminal beam/screen** still win the first read; new dressing supports, does not compete as noise.
- Color language stays disciplined (cyan path / amber gate accents) — not a rainbow prop dump.
- Mild note: from default spawn, Beta lock billboard still dominates over Alpha dressing (pre-existing hierarchy issue; density did not fix or worsen it into mush).

### 3. Pages health

**Pass** (after brief post-deploy CDN blip).

| Check | Result |
|-------|--------|
| Deploy | Actions “Ship wave 5…” `30996243242` **success**, headSha `354195a` |
| `https://robglnn.github.io/aaamath/` | **200**, title `Axiom Rising`, boots into training range |
| Vite `base` `/aaamath/` | HTML refs `/aaamath/assets/index-BlA89mhL.js` + `index-V_Y9mWL_.css` |
| Asset HEAD | JS **200**, CSS **200**, favicon **200** |
| Transient | First Playwright navigate immediately after deploy hit GitHub Pages **503 Unicorn**; immediate retry OK — treat as CDN lag, not a ship defect |

### 4. Pedagogy: celebrate still `masteryDone`-only?

**Pass — code spot-check at `354195a`.**

```ts
const celebrating = masteryDone
const lessonFinished = celebrating || phaseKind === 'complete'
```

- Celebrate panel + unlock cards render only under `{celebrating && (…)}`.
- Exit without mastery still uses `{lessonFinished && !celebrating && (…)}` — continue-to-range **without** unlock reveal.
- Wave 5 lesson polish (phase rail / mastery bar motion / celebrate rings) is CSS/overlay delight only; builder notes correctly claim no mastery-criteria change. Critic did **not** re-run a full lesson playthrough; judgment is ship-source gating, consistent with prior wave-2 critic method.

### 5. Single largest remaining gap vs AAA bar

**Authored prop / material fidelity (kitbash ceiling) — not empty mid-field.**

Wave 5 answered wave 3’s “thicken the middle distance” ask with more primitive kits. The corridor now *has* density, but every new piece is still **box / cylinder / torus / partial sphere + emissive accent**. Fortnite-grade training ranges sell **authored silhouette, trim, decals, ground breakup, and material response** under light. Next visual spend should raise **fidelity of mid-field masses** (even a small authored prop kit or richer baked materials on existing geo), not add another dozen identical posts.

Secondary (unchanged, out of density checklist): locale / House Standing chrome still reads web-app vs diegetic HUD; Zone Beta lock can overpower primary objective on first viewport.

## Screenshot notes (what I saw)

Playwright captures under MCP output (`~/.playwright-mcp/` naming), not committed:

| Shot | Observation |
|------|-------------|
| `critic-wave5-live-spawn.png` (and re-reads) | Hex pad, **ZONE BETA LOCKED**, terminal beam; **new** amber holo pillars left, rail caps, flank dish, denser posts vs wave-3 spawn |
| Mid-walk toward terminal | Strongest density shot: cyan-capped **approach rails**, **floor conduits**, corridor posts, crates, dishes; terminal screen alive; path remains clear |
| Compared to `critic-wave3-live-spawn.png` | Wave 3 mid-field = posts + crates + gate + beam; wave 5 fills the same sightline with corridor architecture |

HUD: Orbitron **Axiom Rising**; **Objective · Reach the Algebra Terminal**; EN/ES/PL + House Standing; footer controls. DOM: objective `status` present after settle.

## Bar comparison

| Bar | Status | Evidence |
|-----|--------|----------|
| Mid-field denser (rails / conduits / pillars / dishes / posts) | **Pass** | Live screenshots + `RangeDecor` delta vs `94d60a7` |
| Still Fortnite-lite readable, not mush | **Pass** | Clear corridor; POI hierarchy intact |
| Pages health on `354195a` | **Pass** | Deploy green; HTML/JS/CSS/favicon 200 (post-CDN settle) |
| Celebrate gated on `masteryDone` only | **Pass** | Ship `LessonOverlay`: `celebrating = masteryDone` |
| Fortnite training-range AAA set fidelity | **Gap** | Density kits remain primitive + emissive; materials/authored massing still thin |

## Scope note

Spawn + mid-corridor training-range density + Pages + celebrate gating. Did not run full lesson → mastery → Zone Beta unlock playthrough, mobile touch pass, or offline stress. Lesson-delight CSS was not visually scored beyond confirming it does not change mastery eligibility.
