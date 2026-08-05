# Builder notes — wave 2 player silhouette

## Goal
Upgrade third-person Riser read toward Fortnite-lite / optimistic sci-fi without GLTF assets or physics changes.

## Delivered
- **Chunk silhouette**: waist block, chest plate, collar, boxy helm with ear guards, dual amber visor strips
- **Shoulder accents**: pad blocks + small cyan emissive strips
- **Backpack**: main pack volume, cyan accent strip, vent blocks
- **Limbs**: hip/shoulder pivots, upper/lower capsules, gauntlet blocks, boot/ankle blocks at toes
- **Palette**: local constants — `DEEP`, `SHADE`, `BODY`, `BODY_LT`, `HELM`, `CYAN` (#3dd6c6), `AMBER` (#f0a830)
- **Animation** (visual only, no physics impact):
  - Run: leg/arm swing from `mag` + sprint rate via `animPhase`
  - Idle: subtle torso bob + arm sway when grounded and still
  - Airborne: fixed jump pose (legs tucked, arms back) — does not alter jump velocity
- **Blob shadow**: unchanged — scales/fades with height above `groundHeight`

## Constraints honored
- No movement / `groundHeight` / unlock logic changes
- No new npm deps; `meshStandardMaterial` only (mobile-safe)
- `TrainingRange.tsx` not touched

## Mesh count
~28 primitives under `bodyRef` (boxes, capsules). All low-segment counts (4–8).

## Feel notes
- Chest core + pack strip + shoulder accents give cyan anchors at distance
- Amber visor band is the primary face read; helm is wider box vs prior sphere
- Boot blocks widen the foot silhouette for ground contact readability
