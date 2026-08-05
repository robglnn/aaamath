# Critic report — Visual Gauntlet loops 31–35 (MESHY-FIRST)

**Date:** 2026-08-05  
**Critic:** fresh-context (Builder ≠ Critic judgment pass)  
**Method:** Pixel A/B vs `docs/gauntlet/bars/*` (9 grok refs + 2 named HUD bars) + Downloads UI refs; native-res captures at 1280×720 / 844×390; code + asset verification vs `58512dc`; `tsc -b` clean  
**Shots:** `loop31-35-desktop.png` (1280×720), `loop31-35-midwalk.png` (844×390), `loop31-35-mobile.png` (844×390) — captured from local dev (`127.0.0.1:5174/aaamath/`) after 8s GLB load  
**Prior tip:** `58512dc` (loops 26–30)  
**Builder report:** `builder-loop31-35-meshy.md`

## Verdict: PASS_WITH_GAPS

All five claimed loops landed in code **and** are visible in captures. This is the first batch where Meshy-authored heroes materially change the first-10s read: a full humanoid player in navy tech-suit + cyan piping, a legible holographic terminal kiosk, a crystalline Alpha zone beacon, saturated Meshy plaza banners, and a mid-field stone arch all read as authored props — not kitbash primitives. Loop 35’s golden-hour pass is the largest value/saturation jump since loop 21: warmer sky dome, lifted SKY/FOG, brighter key/hemi, exposure 1.39→1.52 — the scene finally reads dusk/golden-hour instead of moonlit-navy. Guards held (curriculum frozen, `base: '/aaamath/'`, KaTeX absent from `index.html`, player GLB 600,600 B / ~587 KB Draco, Meshy task ledger + `tools/meshy_raw/*-meshy.glb` present, `HeroGltf` wires player/terminal/zone/arch/banner at `?v=m31`).

**But the refs still win — clearly.** Against the bright floating-island bars (`grok-34c2…`, `grok-cf26…`, `grok-8061…`) ours now shares the warm-horizon *family* but lacks their vivid surface albedo, waterfall/island-top saturation, NPC crowd density, and triple-sun drama at ref strength. Against the dark ringed-crystal ref (`grok-e13b…`) the monolith emissive boost (0.5→1.65+) helps, yet the skyline anchor still competes with the terminal gate starburst and reads as a distant ghost, not a blooming beacon from spawn.

| Loop | Gap attacked | Did refs still win? |
|------|--------------|---------------------|
| **31 Meshy player** | Primitive/kitbash hero vs Fortnite organic teen | **Partial — Meshy wins vs our prior sculpt** — full humanoid silhouette, hair, pauldrons, cyan chest gem + suit piping visible at 844×390; A-pose reads clean in shoulder cam. Refs still win: chunkier Fortnite armor mass, stronger rim separation, more saturated costume color; ours remains navy-on-teal at distance |
| **32 Meshy terminal** | Tiny kitbash pedestal + sphere | **Partial — clear win vs prior** — gold-framed holographic kiosk with cyan screen/antenna reads as “Algebra Terminal” POI immediately (desktop + midwalk). Ref terminal is denser (mastery UI hologram, skill tree) — different bar, but our *mesh* bar is now met |
| **33 Meshy zone beacon** | Alpha marker unread / glyph-only | **Partial — win vs prior** — tiered crystalline monolith with cyan crystals at Alpha flank is the strongest near-field POI in the batch; “ZONE ALPHA” label still helps. Ringed skyline monolith (primitive, emissive-boosted) still **does not read from spawn** — torus rings invisible at 40+ m |
| **34 Meshy arch + banners** | Plaza depth / banner saturation | **Partial** — warm stone arch frames terminal corridor; red/gold crest banners pop under loop-35 lighting (visible left/right in midwalk). Refs win: 8+ banner colors at plaza density; we dropped 8 primitive banners → 6 Meshy instances (mobile-safe but thinner skyline color rhythm) |
| **35 Golden-hour value/saturation** | Critic 26–30 #1 gap — moonlit navy ceiling | **Partial — biggest lighting win yet** — orange horizon band, brighter floor bounce, warmer hemi/key, exposure +0.13; desktop no longer reads as night. Refs still win: their greens/teals/violets on island tops, waterfall mist, and multi-sun discs remain a full saturation tier above ours |

## Landscape-first check (844×390)

- Mobile capture is true 844×390 landscape; rotate-gate code untouched in this diff (`GameView` change = exposure only).
- **Readable:** MENU / SOUND / LEADERBOARD chips, WING PROGRESS + green chip, countdown numeral, JUMP, DASH, joystick ring, ability slots 1–2 (sword, potion — strong), Meshy player silhouette + terminal kiosk at midwalk scale.
- **Marginal:** wireframe glyphs slots 3–4 (unchanged from 26–30), minimap quadrant tints still whisper; Meshy arch crest detail soft at 844×390 but banner color blocks read.
- Verdict: hard UX constraint holds; HUD legibility floor unchanged; **3D hero/env legibility improved** — player + terminal + zone beacon no longer collapse to primitives at mobile scale.

## Pedagogy / Pages guards

- Curriculum frozen — zero diff in lessons/content/data; no L8+
- `base: '/aaamath/'` intact (`vite.config.ts`); KaTeX still deferred (absent from `index.html`)
- Player GLB 529,192 → 600,600 B (+71 kB) — still inside 1–2 MB Draco iPhone target; terminal 540,372 B; zone 674,636 B; arch 347,388 B; banner 245,480 B (all verified on disk)
- `HeroGltf.tsx`: `MESHY_V = 'm31'` on player, terminal, zone, arch, banner; blueprint pad left as prior Blender GLB (as claimed)
- Meshy provenance: builder task IDs + `tools/meshy_raw/{riser-player,algebra-terminal,zone-beacon,plaza-arch,plaza-banner}-meshy.glb` (8–11 MB raw → Draco ship via `ship_meshy_hero.py`)
- `tsc -b` clean; touched files limited to `src/game/*`, `public/models/*`, tooling

## Continuity vs loops 26–30

| Prior largest gap (critic 26–30) | This batch |
|----------------------------------|------------|
| Value/saturation ceiling (moonlit navy) | **Moved meaningfully** — golden-hour sky/lights/exposure; warm arch + banner albedo finally visible |
| Marquee monolith unread from spawn | **Nudged only** — emissive 0.5→1.65+ on primitive stack; still loses to sun burst / gate framing |
| Primitive hero / terminal / zone POIs | **Closed for near-field** — Meshy player, terminal, zone beacon are the batch’s headline wins |
| HUD juice (wireframe glyphs) | **Unchanged** — not in scope; still lateral vs `ref-hud-ability-wheel` |

Delta vs `loop26-30-*` captures is unambiguous: player is a textured humanoid (not cape-on-spheres), terminal is a kiosk (not pedestal+orb), zone beacon is crystalline (not small marker), banners are crest meshes (not flat boxes), sky horizon is amber-warm (not cold navy).

## Did Meshy-authored assets visibly beat the prior primitive sculpt in first-10s?

**Yes — decisively for player, terminal, zone beacon, arch, and banners.** Side-by-side against `loop26-30-mobile.png`, the Meshy swap is the largest single-mesh quality jump in the gauntlet. The remaining primitive skyline pieces (floating-island rocks, ringed monolith stack) are now the weak link, not the hero corridor.

## Remaining largest gap (if another night — NOT Algebra)

1. **Skyline anchor + environmental saturation** — turn the ringed monolith into a spawn-readable cyan beacon (emissive ≥2.5 + halo sprite + forward placement or bloom-friendly scale) and saturate island tops / banner count toward ref density; this closes more A/B distance than another hero remesh.
2. **Polished plaza floor read** — refs show sun specular streaks and reflective causeways; ours stays matte navy-teal at distance despite loop-28 sheen.
3. **HUD ability icons** — filled chunky glyphs (wireframe as selected-state accent) + stronger minimap quadrant fill (carried from critic 26–30).

## Out of scope

No Lesson 8+; no pedagogy edits; no mastery film; no real-device FPS bench; blueprint pad remesh deferred.
