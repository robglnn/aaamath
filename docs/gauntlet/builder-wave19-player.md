# Builder — Wave 19: authored Riser player silhouette

**Date:** 2026-08-05  
**Closes:** critic-wave18 largest remaining gap — *"player still stacked-box garnish … player authored fidelity."*

## A — `src/game/proc/authoredGeo.ts` (extended kit)

Ten new shared geometries appended to `getAuthoredGeoKit()` (all `player*`-prefixed, appended after the parallel mid-field wave's `ductPipe`/`mastFlange`/`mastLamp`/`barrierPane` — no interleaved edits, no collisions):

| Geometry | Profile language | Replaces |
|---|---|---|
| `playerHelm` | Collar flare → cove → cheek swell → **recessed visor channel** → brow shelf → soft crown, lathed 20 seg, neck base y=0 → crown ~0.36 | Helm box + separate brow-ridge/ear-guard trim boxes |
| `playerVisor` | Closed-lens profile lathed through a ~143° front arc (φ centered on +Z), nests in the helm channel, outer face just proud | Flat amber visor band boxes ×2 |
| `playerTorso` | Freeform tapered cuirass outline (waist → chest flare → shoulder fall → neck) bevel-extruded, ~0.46 × 0.55 × 0.3, centered | Waist block + chest plate box + collar bridge box |
| `playerPauldron` | Lathed dome cap, rolled rim, closed underside, squashed Z ×0.85 | Shoulder pad boxes |
| `playerLeg` | Hip ball → thigh taper → knee bead → shin → ankle, one lathe 14 seg, origin at hip pivot, hangs −Y | 2 capsule segments + 3 boot trim boxes per leg |
| `playerBoot` | Side-profile outline (heel → sole → toe spring → instep → shaft) bevel-extruded across foot width, rotated toe→+Z, sole at y=0 | Boot block + toe-cap/toe-tip boxes |
| `playerArm` | Deltoid ball → bicep taper → elbow bead → forearm → flared fist, one lathe 14 seg, origin at shoulder pivot | 2 capsule segments + fist box per arm |
| `playerPack` | Tapered rounded volume (wider at base) bevel-extruded, centered | Backpack box + 2 angled side housings + bottom bar |
| `playerPackRoll` | Lathed bedroll canister lying along X on the pack crown | (new silhouette note — pack vent boxes dropped) |
| `playerPip` | Small beveled light pip (0.09 × 0.05 × 0.028) — shoulder lights, pack strip, chest core, adept marks all reuse it scaled | 8+ tiny emissive boxes |

Wave 17–18 geometries and the wave-19 mid-field additions unchanged.

## B — `src/game/Player.tsx` (visual mesh rewrite only)

- Every avatar mesh now references a shared kit geometry via `<mesh geometry={…}>`; zero per-mesh `boxGeometry`/`capsuleGeometry` buffers remain on the player.
- **Preserved untouched:** all movement/collision code (`groundHeight`, gravity, bounds, `LOCKED_MIN_Z`/`GATE_Z` zone logic, `TERMINAL_RADIUS` proximity, jump nonce, typing-target guard), all five anim pivots (`torsoPivot`, `leftLegPivot`, `rightLegPivot`, `leftArmPivot`, `rightArmPivot` — same positions, same swing math), blob shadow, palette constants, and the wave-16 adept rank insignia (same conditional, same cyan/amber pairing, now beveled pips seated on the pauldron domes and cuirass face).
- Panel plate bake reused via a `panel.clone()` with `repeat(2.2, 1.9)` — extrude UVs are shape-space (~0.45 wide), so the clone lands ~one full plate pattern across the cuirass and pack. Shared kit texture untouched.
- Placement anchors kept from the box build (chest core y≈0.87, visor line y≈1.24, pack back z≈−0.36, sole at ground 0) so the distance-read anchors and ground contact are unchanged.

## C — Mesh budget delta

| Surface | Before (W18) | After (W19) | Δ |
|---|---|---|---|
| Torso group (base) | 21 meshes | 11 meshes | **−10** |
| Adept insignia (conditional) | 4 meshes | 4 meshes | **0** |
| Legs | 10 meshes | 4 meshes | **−6** |
| Arms | 6 meshes | 2 meshes | **−4** |
| **Avatar total** | **37** (+shadow = 38) | **17** (+shadow = 18) | **−20 (−54 %)** |
| Avatar total, adept rank | 41 (+shadow = 42) | 21 (+shadow = 22) | under the ≤ ~25 budget even with insignia |
| Shared geo buffers | 15 lathe/extrude (session singleton) | 25 lathe/extrude (session singleton) | +10 buffers, reused by all player meshes |

No new lights, no new `useFrame` hooks, no new canvas bakes (texture clone shares the existing 256 px panel image), no new deps, no network assets.

## D — Byte sizes

| Item | Size |
|---|---|
| `authoredGeo.ts` source | ~18.4 kB (W18: ~6.8 kB; +player kit ~5.9 kB, +mid-field kit ~2.1 kB) |
| `Player.tsx` source | ~12.6 kB |
| `GameView` chunk | **84.20 kB raw / 23.37 kB gz** (W18: 84.21 / 22.60) |
| `three` chunk | 689.52 kB (unchanged) |
| Network assets added | **0 B** |

## E — Verify

- `npm run build` — **green** (tsc + vite 6.4.3 + spa-fallback).
- `dist/index.html` modulepreload: `_commonjsHelpers`, `react-vendor` only — **no `three`, no `katex`, no `GameView`**; `base: '/aaamath/'` intact.
- Runtime smoke (vite preview + headless browser, production build): spawn back view, turned front view, and mid-walk swing pose all render correctly — helm dome with recessed amber visor, tapered cuirass with cyan core, pauldron domes with pips, bedroll pack with aft strip, limbs swinging attached to pivots. Movement, turning, and walk cycle behave identically to W18.

## Untouched (coordination / guards)

`RangeDecor.tsx` / `TrainingRange.tsx` mid-field mounts (parallel builder), L1/L2 lesson flow, KaTeX defer, cold-shell entry imports, store/world modules — all unchanged. Player logic diff is import + JSX only.
