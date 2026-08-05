# Critic report — Wave 3 materials (proc textures, labels, terminal screen)

**Date:** 2026-08-05  
**Critic:** fresh-context gauntlet CRITIC (Builder ≠ Critic; **no `src/` edits**)  
**Judged commit:** `94d60a7` — *Ship wave 3: procedural materials, live terminal screen, deferred gate FX.*  
**Judged surface:** **live** `https://robglnn.github.io/aaamath/` after Actions deploy `30995129366` (headSha `94d60a74e2c98f960c3f9995543173de74bf4d7a`) **success**. Local `http://127.0.0.1:5173/aaamath/` also booted and matched the same first-viewport story (ZONE BETA text, hex pad, glowing terminal). Port `5199` was down during review; live was treated as the ship artifact.  
**Method:** Playwright screenshots (spawn, yaw-to-Alpha, mid-walk, terminal-adjacent pairs); HTTP/asset probe; live JS string spot-check; read-only `git show 94d60a7` of `TrainingRange.tsx` / `TerminalScreen.tsx`.  
**Prior critic:** `docs/gauntlet/critic-wave2-visuals.md` **exists** (verdict PASS_WITH_GAPS). Wave 3 landed after that report — continuity notes below; no contradiction without new evidence.

## Verdict: PASS_WITH_GAPS

Wave 3 delivers what it claimed: **canvas-baked zone faces** that still read as text (and drop the wave-2 troika CDN fragility), **floor/sky maps that read less flat**, and a **live Algebra Terminal screen** (equations + scanline redraw). Pages deploy is healthy. Gaps vs a Fortnite training-range AAA bar remain in **set density / authored material fidelity**, not in the wave-3 checklist items themselves.

## Continuity vs `critic-wave2-visuals.md`

| Wave 2 finding | Wave 3 evidence | Stance |
|----------------|-----------------|---------|
| ZONE ALPHA / ZONE BETA LOCKED readable as drei/`Text` when troika fonts load | Live spawn: **ZONE BETA LOCKED** sharp in-camera; yaw-left: **ZONE ALPHA** sharp cyan plaque. Bundle at `index-Dutk-GAV.js` has `ZONE ALPHA` / `ZONE BETA LOCKED` + `fillText`; **no** `troika` / `jsdelivr` / `unicode-font` strings. Fresh reload: **0** troika CDN requests. | **Agree + upgrade** — literacy kept; wave-2’s largest gap (runtime font CDN) is **closed**. |
| Soft navy sky / teal grid — not an unlit void | Floor: deck bake + roughness + hex pad maps; sky/horizon gradient + distant silhouettes/spires still present | **Agree + deepen** — same direction, more material signal. |
| Terminal = beam + diamond beacon (no live screen face called out) | `TerminalScreen` in ship; mid-walk shows equation-like glyphs / bars; paired frames differ | **New bar met** — does not contradict wave 2; extends it. |
| Pages healthy at `ffab87d` | Pages healthy at `94d60a7` | **Agree**. |

## Focus answers

### 1. Do canvas zone labels read as text from spawn?

**Yes (Beta in first viewport; Alpha with slight yaw).**  
- Default spawn / gate sightline: **ZONE BETA LOCKED** is unambiguous high-contrast plaque text (not a glyph slab).  
- From spawn pad, yaw left: **ZONE ALPHA** equally readable (canvas neon face at `[-4.2,0,4.2]`, `faceY = π·0.75`).  
- Implementation at `94d60a7`: `bakeLabelTexture` → `CanvasTexture` on `ZoneLabel` (comment explicitly replaces troika CDN).  
Mild note: Alpha is easy to miss if the player never looks left; Beta owns the default frame. Still clearly **text**, not wave-1 emissive bars.

### 2. Does floor/sky feel less flat?

**Yes, meaningfully.**  
- Floor: procedural deck plating (noise/seams/rivets) + roughness map; Alpha/Beta pads use `hexPad`; terminal body uses `panel` kit. In screenshots: hex tiling inside the spawn ring, teal grid recession, slight material sheen — not a single flat color plane.  
- Sky: baked gradient dome + horizon haze band; distant monoliths / horizon silhouette + terminal beam break the void. Still a sparse silhouette sky vs AAA skydomes, but **less flat than pre-wave-3**.

### 3. Terminal screen alive?

**Yes.**  
- Ship includes `TerminalScreen.tsx`: throttled `useFrame` canvas redraw, equation flicker, scanline, chrome, `texture.needsUpdate`.  
- Live mid-walk / near-terminal shots: screen face shows cyan UI with equation-like fragments / horizontal bars (not a dead emissive quad).  
- Paired screenshots ~1.2–1.4s apart show measurable pixel change in the terminal region (scanline / flicker / near-emissive pulse). From far spawn the face is a bright cyan “on” panel; literacy of glyphs improves as you approach — acceptable for a training-range prop.

### 4. Pages health

**Pass.**

| Check | Result |
|-------|--------|
| `https://robglnn.github.io/aaamath/` | **200**, title `Axiom Rising`, boots into training range |
| Vite `base` `/aaamath/` | HTML refs `/aaamath/assets/index-Dutk-GAV.js` + `index-3OUEhARM.css` |
| Asset HEAD | JS **200**, CSS **200**, favicon **200** |
| Deploy | Actions “Ship wave 3…” `30995129366` **success**, headSha `94d60a7` |
| Wave-2 CDN fragility | Fresh reload: **no** jsDelivr/troika font fetches (wave-2 gap closed) |
| Local corroboration | `127.0.0.1:5173/aaamath/` **200**, same spawn readability story |

No broken base-path 404s on app assets observed.

### 5. Largest remaining gap vs Fortnite training-range AAA bar

**Mid-field set density and authored material fidelity.**  
The range is now a coherent, readable, offline-safe *stylized stage*: baked paints, hex pads, live terminal face, clear signs. It is still mostly **simple primitives + emissive accents + one layer of procedural maps** on a wide empty deck. Fortnite-grade training ranges sell density — layered props, deco trim, ground clutter, varied silhouette masses, richer PBR/response under light. Next visual spend should thicken the **middle distance** (prop kits / trim / ground breakup), not re-litigate sign literacy or a dead terminal face.

Secondary (out of first-viewport critic scope, noted only): Zone Beta unlock FX is deferred until `mode !== 'lesson'` in `GateUnlockFx` — correct vs prior overlay-eating concern; not re-exercised end-to-end in this pass.

## Screenshot notes (what I saw)

Saved under Playwright MCP root (`~/.playwright-mcp/`), not committed:

| Shot | Observation |
|------|-------------|
| `critic-wave3-live-spawn.png` / `critic-wave3-spawn-default.png` | Hex spawn pad, teal grid deck, **ZONE BETA LOCKED** readable, terminal glowing right, objective strip present |
| `critic-wave3-yaw-left.png` | **ZONE ALPHA** cyan plaque reads as text from spawn area |
| `critic-wave3-live-midwalk.png` | Terminal face shows equation-like content / alive chrome |
| Terminal face / close pairs | Screen remains powered; frame-to-frame change consistent with scanline/flicker |
| `critic-wave3-local-spawn.png` | Local matches live on Beta text + hex pad + terminal glow |

HUD: Orbitron **Axiom Rising**; **Objective · Reach the Algebra Terminal**; EN/ES/PL + House Standing; footer controls. DOM: `[role=status]` objective present after settle.

## Bar comparison

| Bar | Status | Evidence |
|-----|--------|----------|
| Zone labels read as text from spawn (canvas, offline-safe) | **Pass** | Live screenshots + no troika CDN on reload |
| Floor/sky less flat (proc materials) | **Pass** | Hex/deck maps + sky/horizon bake visible in-camera |
| Terminal screen alive | **Pass** | `TerminalScreen` ship + in-world glyphs/bars + frame deltas |
| Pages health | **Pass** | Deploy green; HTML/JS/CSS/favicon 200 |
| Fortnite training-range AAA density/materials | **Gap** | Sparse mid-field; procedural paints on simple geo |

## Scope note

First-viewport / spawn-adjacent training range + terminal approach. Did not run full lesson → mastery → Zone Beta unlock FX playthrough, mobile touch pass, or offline CDN-block stress (code path is canvas-only for labels; network probe only confirmed no troika fetch on healthy live).
