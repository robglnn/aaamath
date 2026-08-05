import { Vector3 } from 'three'

export const TERMINAL_POS: [number, number, number] = [2.5, 0, -3.5]
export const TERMINAL_RADIUS = 2.3

export const ALPHA_RADIUS = 6
export const PAD_TOP = 0.12

export const BETA_CENTER: [number, number] = [0, -15]
export const BETA_RADIUS = 5
export const GATE_Z = -8
export const LOCKED_MIN_Z = -7.3

/** L2 Zone Beta Annex — diamond side platform east of Beta (vertices on axes). */
export const ANNEX_RADIUS = 2.6
export const ANNEX_CENTER: [number, number] = [BETA_CENTER[0] + BETA_RADIUS + 3.3, BETA_CENTER[1]]
/** Walkway slab bridging the Beta rim to the annex west vertex. */
export const ANNEX_BRIDGE = {
  x0: BETA_CENTER[0] + BETA_RADIUS - 0.5,
  x1: ANNEX_CENTER[0] - ANNEX_RADIUS + 0.5,
  z: BETA_CENTER[1],
  halfWidth: 0.95,
}

/** L3 Zone Gamma Relay — hexagonal relay pad west of Beta (east vertex on the approach axis). */
export const GAMMA_RADIUS = 2.6
export const GAMMA_CENTER: [number, number] = [BETA_CENTER[0] - BETA_RADIUS - 3.3, BETA_CENTER[1]]
/** Walkway slab bridging the Beta west rim to the relay east vertex. */
export const GAMMA_BRIDGE = {
  x0: GAMMA_CENTER[0] + GAMMA_RADIUS - 0.5,
  x1: BETA_CENTER[0] - BETA_RADIUS + 0.5,
  z: BETA_CENTER[1],
  halfWidth: 0.95,
}

/**
 * L4 Delta Balance Yard — axis-aligned square yard northeast of Beta.
 * DELTA_RADIUS is the square's half-side (apothem); the cylinder body uses the
 * circumradius (apothem·√2) with thetaStart π/4 so flat sides face the axes —
 * distinct from octagon Alpha/Beta, 45° diamond Annex, hex Gamma. South of
 * Beta was rejected: Beta's south rim sits at z=-20 against BOUNDS.zMin
 * (-20.5), and the exemplar [0, -18.5] lies inside the Beta disc (dist 3.5 < 5).
 * NE site [7.6, -9.1] clears Beta (rim dist ~1.0), the annex (dz > 2.6), the
 * terminal pool, and the gate walk line, all inside BOUNDS.
 */
export const DELTA_RADIUS = 2.6
export const DELTA_CENTER: [number, number] = [7.6, -9.1]
/** Walkway slab bridging the Beta northeast rim to the yard west edge. */
export const DELTA_BRIDGE = {
  x0: 2.2,
  x1: DELTA_CENTER[0] - DELTA_RADIUS + 0.3,
  z: -10.7,
  halfWidth: 0.95,
}

/**
 * L5 Epsilon Calibration Forge — regular pentagon yard northwest of Beta,
 * mirror of Delta at [-7.6, -9.1]. EPSILON_RADIUS is the apothem (center→flat);
 * cylinder body uses circumradius apothem/cos(π/5) with a flat side facing east
 * toward the bridge — distinct from square Delta / hex Gamma / diamond Annex.
 */
export const EPSILON_RADIUS = 2.6
export const EPSILON_CENTER: [number, number] = [-7.6, -9.1]
/** Walkway slab bridging the Beta northwest rim to the yard east edge. */
export const EPSILON_BRIDGE = {
  x0: EPSILON_CENTER[0] + EPSILON_RADIUS - 0.3,
  x1: -2.2,
  z: -10.7,
  halfWidth: 0.95,
}

export const BOUNDS = { x: 12, zMin: -20.5, zMax: 10 }

export const WALK_SPEED = 4.6
export const SPRINT_SPEED = 8.2
export const JUMP_SPEED = 8.4
export const GRAVITY = 24

export const BLUEPRINT_HALF = 1.15
export const BLUEPRINT_TOP = 0.2

/**
 * Mutable per-frame runtime state shared between Player, camera rig, and the
 * blueprint ghost. Kept outside React so 60 fps writes never trigger renders.
 */
export const rig = {
  playerPos: new Vector3(0, 0, 4),
  ghostPos: new Vector3(0, PAD_TOP, 0),
  jumpQueued: false,
  /** 0–1 decaying blend toward gate during mastery unlock celebration (CameraRig reads). */
  gateCelebration: 0,
}

export function groundHeight(
  x: number,
  z: number,
  hasZoneBeta: boolean,
  blueprint: [number, number, number] | null,
  hasBetaAnnex = false,
  hasGammaRelay = false,
  hasDeltaBalance = false,
  hasEpsilonCal = false,
): number {
  let gy = 0
  if (x * x + z * z <= ALPHA_RADIUS * ALPHA_RADIUS) gy = PAD_TOP
  if (hasZoneBeta) {
    const dx = x - BETA_CENTER[0]
    const dz = z - BETA_CENTER[1]
    if (dx * dx + dz * dz <= BETA_RADIUS * BETA_RADIUS) gy = Math.max(gy, PAD_TOP)
  }
  if (hasBetaAnnex) {
    // Annex pad is a diamond (square rotated 45°): |dx| + |dz| <= R inside.
    const dx = Math.abs(x - ANNEX_CENTER[0])
    const dz = Math.abs(z - ANNEX_CENTER[1])
    if (dx + dz <= ANNEX_RADIUS - 0.15) gy = Math.max(gy, PAD_TOP)
    if (x >= ANNEX_BRIDGE.x0 && x <= ANNEX_BRIDGE.x1 && Math.abs(z - ANNEX_BRIDGE.z) <= ANNEX_BRIDGE.halfWidth) {
      gy = Math.max(gy, PAD_TOP)
    }
  }
  if (hasGammaRelay) {
    // Relay pad is a hexagon with a vertex pointing east at the bridge; inside
    // test on the two first-quadrant face normals (inradius h = R·√3/2).
    const qx = Math.abs(x - GAMMA_CENTER[0])
    const qz = Math.abs(z - GAMMA_CENTER[1])
    const h = (GAMMA_RADIUS - 0.15) * 0.8660254
    if (qz <= h && 0.8660254 * qx + 0.5 * qz <= h) gy = Math.max(gy, PAD_TOP)
    if (x >= GAMMA_BRIDGE.x0 && x <= GAMMA_BRIDGE.x1 && Math.abs(z - GAMMA_BRIDGE.z) <= GAMMA_BRIDGE.halfWidth) {
      gy = Math.max(gy, PAD_TOP)
    }
  }
  if (hasDeltaBalance) {
    // Yard is an axis-aligned square: |dx| <= a && |dz| <= a inside (apothem a).
    const dx = Math.abs(x - DELTA_CENTER[0])
    const dz = Math.abs(z - DELTA_CENTER[1])
    if (dx <= DELTA_RADIUS - 0.15 && dz <= DELTA_RADIUS - 0.15) gy = Math.max(gy, PAD_TOP)
    if (x >= DELTA_BRIDGE.x0 && x <= DELTA_BRIDGE.x1 && Math.abs(z - DELTA_BRIDGE.z) <= DELTA_BRIDGE.halfWidth) {
      gy = Math.max(gy, PAD_TOP)
    }
  }
  if (hasEpsilonCal) {
    // Yard is a regular pentagon (flat side east toward the bridge): five half-plane
    // tests at apothem EPSILON_RADIUS. Walk slack matches prior pads (R − 0.15).
    const dx = x - EPSILON_CENTER[0]
    const dz = z - EPSILON_CENTER[1]
    const h = EPSILON_RADIUS - 0.15
    let inside = true
    for (let k = 0; k < 5; k++) {
      // Outward normals: east face first (k=0 → +X), then every 72°.
      const a = (k * 2 * Math.PI) / 5
      if (dx * Math.cos(a) + dz * Math.sin(a) > h) {
        inside = false
        break
      }
    }
    if (inside) gy = Math.max(gy, PAD_TOP)
    if (x >= EPSILON_BRIDGE.x0 && x <= EPSILON_BRIDGE.x1 && Math.abs(z - EPSILON_BRIDGE.z) <= EPSILON_BRIDGE.halfWidth) {
      gy = Math.max(gy, PAD_TOP)
    }
  }
  if (blueprint) {
    if (Math.abs(x - blueprint[0]) <= BLUEPRINT_HALF && Math.abs(z - blueprint[2]) <= BLUEPRINT_HALF) {
      gy = Math.max(gy, blueprint[1] + BLUEPRINT_TOP)
    }
  }
  return gy
}
