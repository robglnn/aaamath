# Builder — Wave 17: authored hero-prop silhouettes (post-kitbash)

**Date:** 2026-08-05
**Closes:** critic-wave16 headline gap — *"authored set fidelity still under a kitbash ceiling… masses remain multi-mesh primitives + procedural canvases."*

## Decision: authored profile geometry in code, not GLTF files

The critic's bar is **authored silhouette language** (trim, curvature, unique prop massing), not the `.gltf` container format. Wave 17 authors three hero props as **hand-written profile data** — lathe point lists and rounded-rect shapes with real bevel extrusion — built into shared `BufferGeometry`s at runtime:

- **Zero network** — no fetch, no loader, no Draco, no Pages base-path surface.
- **Zero new deps** — `LatheGeometry` / `ExtrudeGeometry` ship inside the existing `three` chunk.
- **Cold shell untouched** — the module imports `three` only from inside the GameView tree, so the lazy split is preserved by construction.

If a future wave wants literal GLTF assets (e.g. a sculpted player or terminal), the mount pattern is unchanged: tiny `.glb` under `public/props/` → served at `/aaamath/props/…`, `useGLTF` lazy from inside GameView, `<80 KB` gz budget.

## A — `src/game/proc/authoredGeo.ts` (new, 4,535 B source)

Lazy shared kit (`getAuthoredGeoKit`, mirrors `getProcTextureKit` ownership — built once per session, shared across all placements):

| Geometry | Profile language | Replaces |
|---|---|---|
| `dish` | Paraboloid bowl (14-step parabola) + rolled rim lip that curls out and tucks under, lathed 28 seg | Partial-sphere kitbash dish |
| `gatePillar` | Plinth flare → cove → collar → tapered shaft → necking rings → echinus → bead → abacus slab → crown, lathed 18 seg, ~1.88 tall | Bare 8-seg barrier post cylinders |
| `rackCarcass` / `rackBlade` / `rackPlinth` | Rounded-rect faces extruded with true bevels (0.03 / 0.016 / 0.02), centered on the extrusion axis | Box-kit ServiceJunction housing |

Exported via `proc/index.ts`.

## B — Mounts (upgrades, not clutter)

**1. Hero antenna dishes** — `RangeDecor.tsx` `AntennaDishes` rewritten in place, same two flank placements `[-8.2, 0.5]` / `[8.5, -3.2]`, same blinking feed-tip `useFrame`. Per dish: flanged mast base, tapered mast, pivot knuckle, authored bowl (steel-plate bake mapped onto the lathe UVs), rear hub + counterweight disc, **tripod feed struts** converging on a horn cone (`Strut` helper: quaternion-aligned tapered cylinders), blinking tip sphere. 11 meshes/dish (was 3).

**2. Beta gate pillars** — `TrainingRange.tsx` `BetaBarrier` posts swapped to `geometry={gatePillar}` at the same `±2.9` positions, identical locked/unlocked emissive-accent material, same sink-on-unlock group. Mesh count unchanged; silhouette goes from pipe to turned column.

**3. Equipment racks** — `AuthoredProps.tsx` `ServiceJunction` replaced by `EquipmentRack` at the same two vetted off-walk-line placements `[-6.8, -1.2]` / `[7.1, -3.8]` (the east one flanks the terminal apron). Beveled plinth + steel-mapped beveled carcass + three proud beveled blades with per-blade cyan status strips (amber fault tick on the middle blade), vent bezel, conduit stub + flange ring, amber top dome. ~13 meshes/rack (was ~11).

**Budget:** ~42 meshes in `AuthoredProps` (was ~38), +16 net in `RangeDecor`, 0 new lights, 0 new `useFrame`, 0 new canvas bakes (reuses wave-16 steel plate), shared geometry buffers across repeats. Palette unchanged: cyan `#3dd6c6` / amber `#f0a830` / steel.

## C — Byte sizes

| Item | Size |
|---|---|
| `authoredGeo.ts` source | 4,535 B |
| `GameView` chunk | **80.85 kB raw / 21.74 kB gz** (wave 16: ~73 kB raw → **+~7.9 kB raw, well under the 80 KB gz file budget — and zero added download since it rides the existing lazy chunk**) |
| `three` chunk | 689.52 kB (unchanged) |
| Network assets added | **0 B** — no `public/` files, no GLTF |

## D — Verify

- `npm run build` — **green** (tsc + vite 6.4.3 + spa-fallback).
- `dist/index.html` modulepreload list: `_commonjsHelpers`, `react-vendor` only — **no `three`, no `r3f`, no `katex`, no `GameView`**; lazy split holds; `base: '/aaamath/'` intact in all asset URLs.
- ESLint clean on all touched files.
- Playwright walkthrough on dev server (spawn → mid-field orbit → dish close-up → gate approach): **0 console errors/warnings**; dish bowl/rolled rim/feed tripod, turned gate pillars, and rack blade stacks all read in frame. Shots filed: `docs/gauntlet/_critic-shots/builder-wave17-{spawn,dish-close,gate}.jpg`.

## E — Pages path notes

Nothing added under `public/`, so there is no new base-path surface: every byte of wave 17 ships inside the existing content-hashed `/aaamath/assets/` chunks. The 404 SPA fallback is unaffected.

## Untouched (pedagogy / shell guards)

L1/L2 lesson flow, KaTeX defer, terminal proximity, unlock flags, cold-shell entry imports — all unchanged. No store/App/Hud edits this wave.
