# Critic report — Visual Gauntlet loops 26–30 (skyline + sculpt)

**Date:** 2026-08-05  
**Critic:** fresh-context (Builder ≠ Critic judgment pass)  
**Method:** Pixel A/B vs `docs/gauntlet/bars/*` (9 grok refs + 2 named HUD bars) + Downloads UI refs; 2× native-res crops of HUD/scene regions; code diff vs `beb8ffc`; `tsc -b` clean  
**Shots:** `loop26-30-desktop.png` (1280×720), `loop26-30-midwalk.png` (844×390), `loop26-30-mobile.png` (844×390)  
**Prior tip:** `beb8ffc`

## Verdict: PASS_WITH_GAPS

All five claimed loops landed in code **and** are visible in captures. First-10s read is the best yet: floating islands with glowing crystals flank the plaza, a real god-ray starburst crowns the terminal gate, a second sun glows on the left horizon, the hero cam is closer, and the player now sports a cape, chest gem, and bigger pauldrons over a voxel-fused torso — the stacked-sphere crease rings are gone. Guards all held (curriculum frozen, `base: '/aaamath/'`, KaTeX deferred, GLB 529 kB still iPhone class, typecheck clean).

**But the refs still win — clearly.** Against the bright floating-island bars (`grok-34c2…`, `grok-cf26…`, `grok-8061…`) the scene is on a different value/saturation planet: ours still reads moonlit-navy; theirs are golden-hour green/teal/violet with vivid surface albedo, waterfalls, and saturated banners. Even against the *dark* ref family (`grok-e13b…` ringed-crystal night), the ref's monolith is a blooming cyan beacon while ours is an emissive-0.5 ghost that does not read from spawn — the batch's marquee skyline anchor is its weakest on-screen result. Absolute AAA sculpted single-mesh skins also still win on the hero: torso/hips fusion proved the path, but arms/legs/head remain separate primitives.

| Loop | Gap attacked | Did refs still win? |
|------|--------------|---------------------|
| 26 Voxel-fused torso/hips + cape + gem + pauldrons | Silhouette continuity, hero read | **Partial** — cape sweep, cyan gem, broader shoulders all visible in crops; crease rings gone. Refs still win: chunkier armor, stronger rim, saturated costume color; ours is navy-on-navy, gem reads as a dot at 844×390 |
| 27 Floating islands + ringed monolith + banner palette | Skyline architecture depth | **Yes** — islands genuinely read (left crystal obelisk, right amber wisps, causeways) and are the batch's best skyline gain; BUT rocks are desaturated blue-gray with faint anti-grav cones, no waterfalls/tops; the **ringed monolith does not read from spawn** (washed into the sun burst / behind gate; thin torus rings invisible at 40+ m); new banner palette dies under night lighting (reads maroon/navy, not Fortnite red/blue/yellow) |
| 28 Reflective plaza + hero material boosts | Floor specular, piping pop | **Yes, partially** — soft radial sheen around pad, arm piping pops at 4.0 emissive; but no sun specular streaks / polished-floor read of the refs; floor still reads matte navy at distance |
| 29 Multi-sun + god rays + closer cam + fog push | Atmosphere drama, framing | **Yes on value; rays are a legit win** — top-center starburst is strong, second sun glows on the horizon, cam framing clearly tighter than loop 16–25. But exposure 1.36→1.39 is a nudge: scene still reads night, not golden multi-sun daylight; sky dome + stars unchanged navy |
| 30 Wireframe glyphs + minimap quadrants + crest/mote juice | HUD juice vs ability-wheel/minimap refs | **Mixed — arguably sideways on icons** — wireframe octa/cube/tetra glyphs are a nice holo accent but *less* glanceable than the chunky filled icons in `ref-hud-ability-wheel`; at 844×390 slot-3 triangle is OK, slot-4 diamond is faint. Minimap quadrants + dashed paths + diamond zone pips present and correct, but tints (α≈0.24–0.28 under 0.55 opacity) whisper at 844×390. Crest gold+cyan dual glow visibly pops ✓; mote swirl + 10 orbit sparks add subtle pad life ✓ |

## Landscape-first check (844×390)

- Mobile capture is true 844×390 landscape; rotate-gate code untouched (GameView diff = exposure hunk only).
- **Readable:** MENU / SOUND / LEADERBOARD chips, WING PROGRESS 0/5 + green chip, giant countdown numeral, JUMP, DASH, joystick ring, ability slots 1–2 (sword, potion — strong).
- **Marginal:** wireframe glyphs slots 3–4 (1–1.4 px strokes at this size), minimap quadrant color tints (structure reads; colors barely).
- Verdict: hard UX constraint holds; two HUD elements sit at the legibility floor.

## Pedagogy / Pages guards

- Curriculum frozen — zero diff in lessons/content/data; no L8+
- `base: '/aaamath/'` intact; KaTeX still deferred (absent from index.html)
- Player GLB 495,744 → 529,192 B (+33 kB) — still iPhone-budget class
- `tsc -b` clean; only `src/game/*` + Blender tooling touched

## Continuity vs loops 16–25

| Prior largest gap (critic 16–25) | This batch |
|----------------------------------|------------|
| True single-mesh sculpt hero | **Moved half-way** — voxel fusion landed on torso and hips (two fused shells); arms/legs/head still primitive assemblage |
| Floating-island architecture depth | **Moved** — 5 islands + causeways + monolith now occupy the skyline; depth real, saturation/values not |
| Daylight / golden multi-sun | **Nudged** — multi-sun discs + stronger rays + brighter lights, but exposure +0.03 keeps the scene nocturnal |
| HUD juice | **Lateral** — minimap quadrants/paths in; wireframe glyphs trade glanceability for style |

Note: capture format improved too — 16–25 shots were portrait-ish crops; 26–30 are true landscape (1280×720 / 844×390), matching the landscape-first mandate. Delta is unambiguous: islands, ray starburst, second sun, cape, gem are all new; the value/saturation ceiling is unchanged.

## Remaining largest gap (if another night — NOT Algebra)

1. **Value/saturation ceiling (the gap).** One golden-hour pass: lift sky-dome gradient + exposure meaningfully (not +0.03), warm the key, saturate surface albedos (island tops, banners, floor), and turn the monolith into a blooming cyan beacon (emissive ≥1.5 + halo sprite) that reads from spawn. This single pass closes more A/B distance than any further sculpt work.
2. Full-body single-mesh fusion (extend the loop-26 voxel path to arms/legs/head) — diminishing returns but now a proven recipe.
3. Ability icons: filled chunky glyphs (wireframe as the *selected* state accent) + stronger minimap quadrant fill.

## Out of scope

No Lesson 8+; no pedagogy edits; no mastery film; no real-device FPS bench.
