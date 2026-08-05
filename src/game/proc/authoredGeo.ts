import { ExtrudeGeometry, LatheGeometry, Shape, Vector2 } from 'three'

/**
 * Authored hero-prop geometry — wave 17 fidelity push.
 *
 * Silhouettes are hand-authored as profile data (lathe point lists, rounded
 * rect shapes with bevel extrusion) instead of stacked box/cylinder
 * primitives — the critic's "kitbash ceiling" bar. Everything is built in
 * code: zero network fetch, zero GLTF container/loader, zero new deps, and
 * geometries are shared across placements via the lazy kit getter (same
 * ownership idiom as getProcTextureKit — the range lives for the whole
 * app session, so dispose is intentionally omitted).
 */

/**
 * Parabolic comms dish: paraboloid bowl with a rolled rim lip, lathed.
 * Opens toward +Y; back of the bowl sits at y≈0 for hub/counterweight stacking.
 */
function buildDishGeometry(radius = 0.62, depth = 0.26): LatheGeometry {
  const pts: Vector2[] = [new Vector2(0.001, 0)]
  const STEPS = 14
  for (let i = 1; i <= STEPS; i++) {
    const t = i / STEPS
    pts.push(new Vector2(radius * t, depth * t * t))
  }
  // Rolled rim — curls outward then tucks back under so the edge reads stamped
  pts.push(new Vector2(radius + 0.035, depth + 0.022))
  pts.push(new Vector2(radius + 0.052, depth - 0.012))
  pts.push(new Vector2(radius + 0.018, depth - 0.038))
  return new LatheGeometry(pts, 28)
}

/**
 * Beta gate pillar, base to crown: plinth flare, collar, tapered shaft,
 * necking rings, echinus flare, bead, abacus slab — classical capital trim
 * in one lathe profile (~1.9 tall, matching the old 1.9 barrier posts).
 */
function buildGatePillarGeometry(): LatheGeometry {
  const profile: [number, number][] = [
    [0.001, 0],
    [0.175, 0], // plinth flare
    [0.175, 0.045],
    [0.125, 0.085], // cove
    [0.108, 0.13], // collar
    [0.088, 0.22], // shaft base
    [0.078, 1.28], // shaft (slight taper)
    [0.088, 1.36], // necking
    [0.104, 1.42], // neck ring
    [0.092, 1.47],
    [0.135, 1.56], // echinus flare
    [0.152, 1.62], // bead
    [0.158, 1.68],
    [0.158, 1.76], // abacus slab
    [0.118, 1.8], // cap recess
    [0.055, 1.86], // crown
    [0.001, 1.88],
  ]
  return new LatheGeometry(
    profile.map(([x, y]) => new Vector2(x, y)),
    18,
  )
}

/** Rounded-rectangle outline centered on the origin (rack panel faces). */
function roundedRectShape(w: number, h: number, r: number): Shape {
  const s = new Shape()
  const hw = w / 2
  const hh = h / 2
  s.moveTo(-hw + r, -hh)
  s.lineTo(hw - r, -hh)
  s.absarc(hw - r, -hh + r, r, -Math.PI / 2, 0)
  s.lineTo(hw, hh - r)
  s.absarc(hw - r, hh - r, r, 0, Math.PI / 2)
  s.lineTo(-hw + r, hh)
  s.absarc(-hw + r, hh - r, r, Math.PI / 2, Math.PI)
  s.lineTo(-hw, -hh + r)
  s.absarc(-hw + r, -hh + r, r, Math.PI, Math.PI * 1.5)
  return s
}

/**
 * Beveled equipment panel: rounded-rect face extruded with a real bevel on
 * both caps, then centered on the extrusion axis so placement math matches
 * the box props it replaces. Face plane is XY (upright), depth along Z.
 */
function buildBeveledPanelGeometry(w: number, h: number, d: number, corner: number, bevel: number): ExtrudeGeometry {
  const geo = new ExtrudeGeometry(roundedRectShape(w, h, corner), {
    depth: d,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 2,
    curveSegments: 6,
    steps: 1,
  })
  geo.translate(0, 0, -d / 2)
  return geo
}

export interface AuthoredGeoKit {
  /** Paraboloid dish bowl with rolled rim (opens +Y). */
  dish: LatheGeometry
  /** Turned gate pillar with capital trim, 0 → ~1.88 along +Y. */
  gatePillar: LatheGeometry
  /** Upright beveled rack carcass, centered (0.92 × 1.12 × 0.5). */
  rackCarcass: ExtrudeGeometry
  /** Beveled slide-in rack blade, centered (0.74 × 0.2 × 0.46). */
  rackBlade: ExtrudeGeometry
  /** Low beveled rack plinth slab, centered (1.0 × 0.1 × 0.58). */
  rackPlinth: ExtrudeGeometry
}

let sharedKit: AuthoredGeoKit | null = null

/**
 * Lazily-built shared kit — one set of buffers for every dish / pillar /
 * rack placement in the session (mirrors getProcTextureKit).
 */
export function getAuthoredGeoKit(): AuthoredGeoKit {
  if (!sharedKit) {
    sharedKit = {
      dish: buildDishGeometry(),
      gatePillar: buildGatePillarGeometry(),
      rackCarcass: buildBeveledPanelGeometry(0.92, 1.12, 0.5, 0.06, 0.03),
      rackBlade: buildBeveledPanelGeometry(0.74, 0.2, 0.46, 0.035, 0.016),
      rackPlinth: buildBeveledPanelGeometry(1.0, 0.1, 0.58, 0.03, 0.02),
    }
  }
  return sharedKit
}
