import { Vector3 } from 'three'

export const TERMINAL_POS: [number, number, number] = [2.5, 0, -3.5]
export const TERMINAL_RADIUS = 2.3

export const ALPHA_RADIUS = 6
export const PAD_TOP = 0.12

export const BETA_CENTER: [number, number] = [0, -15]
export const BETA_RADIUS = 5
export const GATE_Z = -8
export const LOCKED_MIN_Z = -7.3

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
}

export function groundHeight(
  x: number,
  z: number,
  hasZoneBeta: boolean,
  blueprint: [number, number, number] | null,
): number {
  let gy = 0
  if (x * x + z * z <= ALPHA_RADIUS * ALPHA_RADIUS) gy = PAD_TOP
  if (hasZoneBeta) {
    const dx = x - BETA_CENTER[0]
    const dz = z - BETA_CENTER[1]
    if (dx * dx + dz * dz <= BETA_RADIUS * BETA_RADIUS) gy = Math.max(gy, PAD_TOP)
  }
  if (blueprint) {
    if (Math.abs(x - blueprint[0]) <= BLUEPRINT_HALF && Math.abs(z - blueprint[2]) <= BLUEPRINT_HALF) {
      gy = Math.max(gy, blueprint[1] + BLUEPRINT_TOP)
    }
  }
  return gy
}
