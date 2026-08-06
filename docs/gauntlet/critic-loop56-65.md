# Critic report — Visual Gauntlet loops 56–65

**Date:** 2026-08-05  
**Critic:** fresh-context (Builder ≠ Critic)  
**Prior critic:** `critic-loop36-55-final.md` (PASS_WITH_GAPS — skyline hero vs arch; holodeck density unpaid)  
**Method:** Disk/code ledger + pixel A/B vs `docs/gauntlet/_critic-shots/loop36-55-mobile.png` + prior bar descriptions (`grok-e13b…`, `grok-34c2…`, `ref-hud-ability-wheel`); `docs/gauntlet/bars/` **absent on disk** (Downloads UI refs folder also empty)  
**Shots:** `loop56-65-mobile.png` (844×390 target; Playwright effective ~1055×487), `loop56-65-odd-hud.png` (~1100×360 target)  
**Builder claims:** `builder-loop56-58-density.md`, `builder-loop61-63-skyline.md`, `meshy-ledger-56-65.md` · Curriculum frozen — Algebra ignored

## Verdict: FAIL

Loops 56–60 and 64–65 largely **ship on disk and in code** (Meshy GLBs, `MESHY_V=m65`, `PlazaEnclosure`, `PlayerLoco`, crawl input, HUD clamp CSS). That is real builder progress vs loop 36–55.

**But pixels regress hard vs the loop-36–55 plate and fail every user priority in first-10s.** Local preview at `http://127.0.0.1:4173/aaamath/` (fresh `dist` with all new GLBs) no longer shows a readable spawn shoulder-cam: the viewport is **filled by faceted cyan crystal interior** — no player silhouette, no paved corridor, no wall ring, no arch/terminal read, no skyline composition. Loop 36–55 mobile capture in the same folder still shows the full yard (player, arch, LOCKED, terminal, crates, mesa/monolith flank, minimap pizza).

Loop 61’s dead-center monolith + loop 63’s near flower cluster + camera lift appear to **eat spawn framing** (camera inside or flush against hero mesh along walk axis) rather than deliver a bar-class skyline hero. God-rays remain diffuse plate glow, not crepuscular bars. Verdant islands/waterfall unread in the broken spawn view. HUD rail/objective/ability wheel/minimap survive at odd aspect, but **touch crawl/stick/jump never mount in Playwright** (`pointer: coarse` false) — crawl is code-real only.

| Loop | Gap attacked | Disk / code result | Pixel / ref result | Refs still win? |
|------|--------------|--------------------|--------------------|-----------------|
| **56** Meshy `wall-module` + first wall ring | **Pass** — `wall-module.glb` 455,672 B; `WallRing` 12× in `PlazaEnclosure` | **Fail** — spawn shot shows zero perimeter read; holodeck replaced by crystal fill | **Yes** — bars show built yard walls |
| **57** Corner + railing modules | **Pass** — `wall-corner.glb` 575,676 B; `railing-barrier.glb` 270,340 B; 4 corners + 6 rails wired | **Fail** — no bastion/rail silhouette in first-10s | **Yes** |
| **58** Dense floor/wall tile layout | **Pass** — `PlazaFloorTiles` 14 instances; 36 enclosure clones budget | **Fail** — no plaza pavement chain visible; worse than loop-36–55 sparse tiles | **Yes** |
| **59** T-pose + Meshy rig walk/run | **Pass** — `riser-player-walk/run.glb` ~2.33 MB; `PlayerLoco` drives clips from move state | **Fail** — no player mesh in spawn capture (regression vs 36–55) | **N/A** — can't judge anim |
| **60** Jump + crawl clips + crawl input | **Pass** — `riser-player-jump/crawl.glb`; `Ctrl`/`KeyC` + `touchCrawl` + `.gr-crawl` in `TouchControls` | **Unverified** — no player in shot; crawl button absent on desktop Playwright capture | **N/A** |
| **61** Skyline dead-center hero beats arch | **Pass** — monolith `[0.2,0,-21.5]` scale 1.88; arch `[-4.8,0,-5.6]` scale 0.92; cam `dist 3.75` / `height 2.42` / `lookY +1.38` | **Fail / regression** — monolith reads as **viewport-occluding crystal cavern**, not skyline marquee; arch/terminal/LOCKED absent | **Yes** — bars want ringed cyan **silhouette**, not interior fill |
| **62** God-ray crepuscular punch | **Pass** — 9+5+3 wedges; opacity ~0.18–0.27 primary fan; sun halos ↑ | **Fail** — captures read bright teal wash; no streak drama vs bar multi-sun refs | **Yes — hard** |
| **63** Verdant island/waterfall band | **Pass** — flower cluster z ≈ −10…−13 y ≈ 4.6–5.8; waterfall `[-9.5,0,-8.2]` scale 1.58; grass emissive boost | **Fail** — no flower tops / turquoise cliff in spawn first-10s | **Yes** — `grok-34c2…` landmasses still win |
| **64** Responsive HUD 844×390 | **Pass** — `--gr-hud-scale: clamp(0.72, calc(100vh/390), 1)` + landscape `@media` block | **Partial** — rail, objective, EN/ES/PL, ability hexes, minimap on-screen; scene behind HUD broken | **Partial** on layout only |
| **65** Odd-viewport HUD polish | **Pass** — `min-aspect-ratio: 2.6/1` minimap nudge; crawl positioned in CSS | **Partial** — odd shot keeps minimap + ability wheel clear; no crawl/stick (coarse gate); minimap pizza still muted vs `ref-hud-ability-wheel` | **Yes** on minimap vividness |

## Disk / code ledger (verified)

| Claim | Result |
|-------|--------|
| `wall-module.glb`, `wall-corner.glb`, `railing-barrier.glb` | **Pass** — `public/models/` + `dist/models/` |
| `riser-player-walk/run/jump/crawl.glb` | **Pass** — four loco GLBs ~2.3 MB each |
| `MESHY_V = 'm65'` | **Pass** — `HeroGltf.tsx` |
| `PlazaEnclosure` in `RangeDecor` | **Pass** — `WallRing` + `RailingRing` |
| `PlayerLoco` wired | **Pass** — `Player.tsx` mounts `PlayerLoco`; procedural shell `visible={false}` |
| Crawl in `store` / `TouchControls` / `Player` | **Pass** — `touchCrawl`, `setTouchCrawl`, `CRAWL_SPEED`, `.gr-crawl` |
| HUD odd-viewport CSS | **Pass** — `game.css` loops 64–65 block |
| `docs/gauntlet/bars/*` | **Missing** — cannot run fresh pixel A/B against bar JPGs on disk |

## Landscape-first check (844×390 + odd)

- **Playwright note:** `browser_resize(844,390)` reported inner `1055×487`; captures still saved to `docs/gauntlet/_critic-shots/`.
- **Readable in HUD layer:** AXIOM RISING / RANK·ADEPT, zone rail, objective banner, EN/ES/PL, filled ability glyphs (diamond/cube/triangle), minimap disk with quadrant tints.
- **Fail / regression in world layer:** player, paved yard, wall bastions, railings, arch, terminal, LOCKED, crates, skyline silhouette — all absent vs loop-36–55-mobile.png baseline.
- **Marginal:** god-ray streaks, verdant albedo, monolith-as-marquee (current monolith dominates as wrong kind of hero).

## Delta vs loop 36–55 plate

| Axis | Loop 36–55 mobile | Loop 56–65 mobile |
|------|-------------------|-----------------|
| Spawn composition | Full yard + player + arch + terminal | Crystal interior fill |
| Holodeck / density | Sparse but readable plaza | **Regression** — enclosure/tiles not visible |
| Skyline hero | Monolith flank + mesas (arch still center) | Monolith **occludes** instead of silhouettes |
| Loco | Static Meshy player visible | Player not visible |
| HUD | Similar rail + minimap | Rail compact (Adept unlocks); layout holds at odd aspect |

## Pedagogy / Pages guards

- Curriculum frozen — no L8+; Algebra ignored this pass
- `vite.config.ts` `base` default `'/aaamath/'` intact
- KaTeX absent from shipped `index.html` (preview build)
- Draco Meshy pipeline for new env/loco GLBs — no Rodin kitbash in ledger
- Working tree uncommitted (expected critic pass) — **no commit made**

## Did loops 56–65 close the prior critic’s largest gap?

**No — and they regressed spawn readability.** Prior tip: holodeck density **first**, then skyline hero vs arch. Density is **code-shipped but pixel-invisible** at spawn. Loop 61’s skyline “fix” **worsened** first-viewport composition vs loop 36–55: the training yard is unreadable. Bars still win on yard walls, verdant islands, god-rays, and minimap pizza.

---

**Remaining LARGEST single gap:** Restore spawn shoulder-cam first-10s to a **readable paved training yard** (player + floor tiles + wall bastions/rails visible) — then re-seat dead-center monolith / near flower cluster / waterfall so they form a **skyline silhouette** behind terminal/gate without camera mesh occlusion; punch god-ray streaks to bar strength. Until spawn matches loop-36–55 readability **plus** enclosure density, this batch fails visual gauntlet despite correct disk ledger.
