# Builder — Wave 2 shared procedural / canvas-baked texture kit

**Role:** BUILDER (not critic). Scope: shared `src/game/proc/` texture kit. No pedagogy/content changes, no asset store, no new npm deps. **Kit shipped unwired on purpose** — see "Why kit-only" below.

## What shipped

`src/game/proc/canvasTextures.ts` — all bakes are deterministic (seeded mulberry32 PRNG → identical pixels every load), `colorSpace = SRGBColorSpace`, `wrapS/T = RepeatWrapping`, anisotropy left at default (mobile-cheap), sizes ≤512 (shipped 256 default; wave-3 integrator bumped the floor default to 512, still within budget):

- `makeNoiseFloorTexture(size = 256)` — subtle dark-teal per-pixel noise + sparse flecks/pits. Base matches the legacy ground color `#0a141d`, so using it as a `map` keeps visual parity while killing the flat single-color look. Pure pixel noise tiles seamlessly.
- `makePanelTexture(size = 256)` — sci-fi panel: edge bevel frame that tiles into continuous panel-wall grooves, raised inner plate with its own bevel, horizontal + vertical seams, corner bolts, one cyan light strip, one amber status tick (amber stays sparing).
- `makeHexPadTexture(size = 256)` — seamless flat-top hex grid on dark teal (every hex repainted at all 9 wrap offsets, so it repeats perfectly), ~6% cyan "lit" cells, center dots, exactly one amber accent cell per tile.
- `getProcTextureKit()` / `disposeProcTextureKit()` — lazily-baked shared `{ floor, panel, hexPad }` singleton for long-lived scene components, plus its teardown.

`src/game/proc/index.ts` — barrel (`export type` split out for `verbatimModuleSyntax`).

`docs/gauntlet/builder-wave2-proc-textures.png` — visual proof: single tile vs 2×2 repeat for all three bakes, rendered from the real module through a throwaway vite preview page (removed afterwards).

![Proc texture kit preview](builder-wave2-proc-textures.png)

## Ownership / dispose contract

- The **caller owns** each returned texture — call `texture.dispose()` on teardown.
- Baking once at module level is fine for Slice 0 (the range lives for the whole app session); `getProcTextureKit()` exists for exactly that pattern.
- If a consumer needs a specific `texture.repeat`, call the maker directly and own that instance — mutating `repeat` on the shared kit affects every consumer.

## Why I shipped kit-only (and how it got wired)

- Mid-task, the working tree gained ~200 lines of uncommitted inline canvas bakes in `TrainingRange.tsx` (`bakeFloorMaps`, `bakeSkyTexture`, `bakeHorizonTexture`, `bakeLabelTexture`) plus a new `TerminalScreen.tsx` — a sibling wave-3 builder was live-editing the file (it changed between my read and my edit attempt).
- Writing into the same file risked silent clobbering both ways, and the coordination brief explicitly allows kit-only in this case. `Player.tsx` was likewise off-limits. So I made **zero edits to shared files** and documented wiring instead.
- **End state:** the wave-3 integrator adopted the kit in `94d60a7` — `TrainingRange.tsx` now pulls `getProcTextureKit()` for the Alpha pad cap (`hexPad`), terminal body (`panel`), and Beta pad (`hexPad`), and evolved the kit in place: floor default 512px, eager module singletons (`noiseFloorTexture` / `panelTexture` / `hexPadTexture`), `hexPadTexture.repeat.set(2, 2)`. The snippets below remain the reference for any additional surfaces.

## How to wire (for orchestrator / next builder)

Ground plane in `TrainingRange.tsx`:

```tsx
import { makeNoiseFloorTexture } from '@/game/proc'

// module scope — baked once per session (Slice 0 lifetime), no dispose needed
const groundNoise = makeNoiseFloorTexture(256)
groundNoise.repeat.set(26, 26)

// on the ground plane material — drop the dark color prop (map multiplies it);
// the baked base already matches #0a141d:
<meshStandardMaterial map={groundNoise} roughness={0.95} metalness={0.05} />
```

Terminal body / pedestal and pad tops via the shared kit:

```tsx
import { getProcTextureKit } from '@/game/proc'
const { panel, hexPad } = getProcTextureKit()

// terminal body box:      <meshStandardMaterial map={panel} metalness={0.4} roughness={0.45} />
// pad cylinder top:       bake a dedicated copy if you need repeat:
//                         const padTex = makeHexPadTexture(256); padTex.repeat.set(3, 3)
```

## Relationship to the wave-3 inline bakes

- `bakeFloorMaps` (in `TrainingRange.tsx`) = 512px deck plating with seams/rivets + a `roughnessMap`, anisotropy 8, `Math.random()` (non-deterministic). Kit floor = 256px pure subtle noise, deterministic, default anisotropy — lighter for mobile. They are complementary, not conflicting; pick one per surface.
- If consolidating later, **move** the inline bakes under `src/game/proc/` (e.g. as `makeSkyTexture`, `makeHorizonTexture`, `makeLabelTexture`) so decor/HUD can share them — don't delete either floor until one is chosen.

## Constraints honored

- Textures ≤512px (256 default for panels/pads); palette deep navy/teal, cyan accents, amber sparing; Safari-safe 2D canvas only; no bloom/postprocessing.
- `tsc -b` typechecks the kit via tsconfig `include: ["src"]` even while unwired; vite tree-shakes it until imported.

## Verification

- `npm run build` green (tsc + vite + spa-fallback) with the kit present — re-verified at HEAD `06fa2b9` after the wave-3/wave-4 merges. (One mid-window failure was a sibling builder's half-finished `StandardsView.tsx` edit, fixed by their own follow-up commit; never touched by me.)
- Visual smoke test (PNG above): floor tiles seamlessly; panel bevels form continuous grooves at 2×2; hex grid wraps cleanly and the lit/amber cells repeat correctly.

## Follow-ups for critic / orchestrator

- Decide the one true floor texture (kit vs inline `bakeFloorMaps`) before both end up wired to different surfaces.
- If panel/hex textures get adopted on pads/terminal, check emissive rim contrast against the textured albedo on a physical phone.
