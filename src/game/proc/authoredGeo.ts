import { ExtrudeGeometry, LatheGeometry, Shape, Vector2 } from 'three'

/**
 * Authored hero-prop geometry — wave 17–18 fidelity push.
 *
 * Silhouettes are hand-authored as profile data (lathe point lists, rounded
 * rect shapes with bevel extrusion) instead of stacked box/cylinder
 * primitives — the critic's "kitbash ceiling" bar. Everything is built in
 * code: zero network fetch, zero GLTF container/loader, zero new deps, and
 * geometries are shared across placements via the lazy kit getter (same
 * ownership idiom as getProcTextureKit — the range lives for the whole
 * app session, so dispose is intentionally omitted).
 *
 * Wave 19 extends the kit with mid-field cast pieces (duct runs, light masts,
 * barrier energy pane) — distinct names to avoid collision with parallel
 * Player.tsx work.
 *
 * Wave 19 (player) adds the Riser avatar kit: lathed helm with a recessed
 * visor channel, single-piece limb columns, beveled cuirass/pack extrudes —
 * same shared-singleton ownership as the prop kit.
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

/**
 * Algebra terminal pedestal: flared foot, cove, collar lip, slight taper —
 * lathed 0 → 0.36 along +Y (replaces 8-seg cylinder at the kiosk base).
 */
function buildTerminalPedestalGeometry(): LatheGeometry {
  const profile: [number, number][] = [
    [0.001, 0],
    [0.88, 0], // foot flare
    [0.88, 0.038],
    [0.8, 0.075], // cove
    [0.72, 0.13], // collar
    [0.74, 0.17],
    [0.7, 0.34], // shaft taper
    [0.66, 0.36], // rim lip
    [0.62, 0.355],
    [0.001, 0.355],
  ]
  return new LatheGeometry(
    profile.map(([x, y]) => new Vector2(x, y)),
    20,
  )
}

/**
 * Floor energy conduit / cable tray: foot flange, cove, tubular run, rolled
 * end lip — lathed unit segment 0 → 1 along +Y (scale Y for run length).
 */
function buildDuctPipeGeometry(): LatheGeometry {
  const profile: [number, number][] = [
    [0.001, 0],
    [0.052, 0], // mounting flange
    [0.052, 0.018],
    [0.044, 0.038], // cove into tray
    [0.038, 0.06],
    [0.036, 0.94], // tray wall (slight belly)
    [0.04, 0.96],
    [0.05, 0.982], // rolled end lip
    [0.05, 1.0],
    [0.001, 1.0],
  ]
  return new LatheGeometry(
    profile.map(([x, y]) => new Vector2(x, y)),
    14,
  )
}

/**
 * Approach light mast: wide foot flange, cove, tapered shaft, neck collar —
 * lathed 0 → 2.8 along +Y (replaces 6-seg post cylinder).
 */
function buildMastFlangeGeometry(): LatheGeometry {
  const profile: [number, number][] = [
    [0.001, 0],
    [0.11, 0], // foot flare
    [0.11, 0.035],
    [0.085, 0.07], // cove
    [0.068, 0.14], // shaft base
    [0.062, 2.52], // shaft (slight taper)
    [0.072, 2.64], // collar ring
    [0.082, 2.72],
    [0.07, 2.8], // neck
    [0.001, 2.8],
  ]
  return new LatheGeometry(
    profile.map(([x, y]) => new Vector2(x, y)),
    16,
  )
}

/**
 * Beveled lamp housing for light masts — rounded-rect cap (0.28 × 0.12 × 0.28).
 */
function buildMastLampGeometry(): ExtrudeGeometry {
  return buildBeveledPanelGeometry(0.28, 0.12, 0.28, 0.04, 0.02)
}

/**
 * Beta gate energy pane — beveled translucent wall slab (5.8 × 1.9 × 0.14).
 */
function buildBarrierPaneGeometry(): ExtrudeGeometry {
  return buildBeveledPanelGeometry(5.8, 1.9, 0.14, 0.12, 0.022)
}

/**
 * Neck collar between pedestal and console housing — short turned ring.
 */
function buildTerminalCollarGeometry(): LatheGeometry {
  const profile: [number, number][] = [
    [0.62, 0],
    [0.7, 0],
    [0.74, 0.028],
    [0.7, 0.055],
    [0.64, 0.055],
    [0.001, 0.055],
  ]
  return new LatheGeometry(
    profile.map(([x, y]) => new Vector2(x, y)),
    16,
  )
}

/* ------------------------------------------------------------------------- *
 * Wave 19 — Riser player avatar kit (consumed by Player.tsx).               *
 * Limb columns are single lathes pivoting at the hip/shoulder (the walk     *
 * cycle only rotates those pivots), the cuirass and pack are freeform       *
 * beveled extrudes, and the helm is one lathe with a recessed visor         *
 * channel — the avatar reads as authored equipment, not stacked boxes.      *
 * ------------------------------------------------------------------------- */

/**
 * Riser helmet, neck base (y=0) to crown (~0.36): collar flare, cove, cheek
 * swell, recessed visor channel, proud brow shelf, soft crown — one turned
 * profile. The visor arc nests in the channel (buildPlayerVisorGeometry).
 */
function buildPlayerHelmGeometry(): LatheGeometry {
  const profile: [number, number][] = [
    [0.001, 0],
    [0.11, 0],
    [0.145, 0.012], // collar flare
    [0.158, 0.032],
    [0.152, 0.055], // cove
    [0.163, 0.09], // cheek swell
    [0.175, 0.13],
    [0.176, 0.155], // jaw line
    [0.163, 0.168], // visor channel floor
    [0.163, 0.205],
    [0.178, 0.218], // brow shelf
    [0.18, 0.235],
    [0.168, 0.27], // crown
    [0.14, 0.305],
    [0.095, 0.335],
    [0.04, 0.352],
    [0.001, 0.358],
  ]
  return new LatheGeometry(
    profile.map(([x, y]) => new Vector2(x, y)),
    20,
  )
}

/**
 * Amber visor band: closed lens profile lathed through a ~143° front arc
 * (lathe φ=0 faces +Z, player forward), nested in the helm channel — outer
 * face sits just proud of the channel floor, inner face buried in the shell.
 * Same local frame as the helm (neck base y=0).
 */
function buildPlayerVisorGeometry(): LatheGeometry {
  const profile: [number, number][] = [
    [0.158, 0.17],
    [0.166, 0.172],
    [0.17, 0.178],
    [0.1715, 0.187],
    [0.17, 0.196],
    [0.166, 0.202],
    [0.158, 0.204],
    [0.154, 0.187],
    [0.158, 0.17],
  ]
  return new LatheGeometry(
    profile.map(([x, y]) => new Vector2(x, y)),
    18,
    -1.25,
    2.5,
  )
}

/**
 * Riser cuirass: freeform tapered outline (waist → chest flare → shoulder
 * fall → neck) bevel-extruded. Face plane XY, depth along Z, centered —
 * drop-in at the old chest-plate anchor.
 */
function buildPlayerTorsoGeometry(): ExtrudeGeometry {
  const s = new Shape()
  s.moveTo(-0.14, -0.28)
  s.lineTo(0.14, -0.28)
  s.quadraticCurveTo(0.185, -0.28, 0.19, -0.21)
  s.quadraticCurveTo(0.205, -0.08, 0.225, 0.05) // flank swell to chest
  s.quadraticCurveTo(0.228, 0.1, 0.21, 0.15)
  s.quadraticCurveTo(0.19, 0.205, 0.145, 0.235) // shoulder fall
  s.quadraticCurveTo(0.115, 0.255, 0.085, 0.265) // into neck
  s.lineTo(-0.085, 0.265)
  s.quadraticCurveTo(-0.115, 0.255, -0.145, 0.235)
  s.quadraticCurveTo(-0.19, 0.205, -0.21, 0.15)
  s.quadraticCurveTo(-0.228, 0.1, -0.225, 0.05)
  s.quadraticCurveTo(-0.205, -0.08, -0.19, -0.21)
  s.quadraticCurveTo(-0.185, -0.28, -0.14, -0.28)
  const geo = new ExtrudeGeometry(s, {
    depth: 0.22,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.035,
    bevelSegments: 2,
    curveSegments: 8,
    steps: 1,
  })
  geo.translate(0, 0, -0.11)
  return geo
}

/**
 * Shoulder pauldron: lathed dome cap with rolled rim and closed underside,
 * squashed front-to-back so it caps the deltoid without bulging forward
 * past the visor line. Rim at y=0, crown ~0.12 up +Y.
 */
function buildPlayerPauldronGeometry(): LatheGeometry {
  const profile: [number, number][] = [
    [0.001, -0.02], // closed underside
    [0.14, -0.02],
    [0.163, -0.016], // rolled rim tuck
    [0.172, -0.002], // rim lip
    [0.168, 0.014],
    [0.155, 0.038],
    [0.128, 0.068],
    [0.09, 0.094],
    [0.048, 0.112],
    [0.001, 0.122],
  ]
  const geo = new LatheGeometry(
    profile.map(([x, y]) => new Vector2(x, y)),
    18,
  )
  geo.scale(1, 1, 0.85)
  return geo
}

/**
 * Leg column, hip pivot (y=0) to ankle (~-0.47): hip ball, thigh taper,
 * knee bead, shin, ankle — one lathed piece (the walk cycle rotates only
 * the hip pivot, so no separate shin mesh is needed).
 */
function buildPlayerLegGeometry(): LatheGeometry {
  const profile: [number, number][] = [
    [0.001, 0.035],
    [0.062, 0.025],
    [0.098, 0.005], // hip ball
    [0.108, -0.05],
    [0.1, -0.14], // thigh
    [0.086, -0.235],
    [0.094, -0.265], // knee bead
    [0.086, -0.295],
    [0.072, -0.37], // shin
    [0.06, -0.43],
    [0.052, -0.455], // ankle
    [0.001, -0.465],
  ]
  return new LatheGeometry(
    profile.map(([x, y]) => new Vector2(x, y)),
    14,
  )
}

/**
 * Boot: side-profile outline (heel → sole → toe spring → instep → shaft)
 * bevel-extruded across the foot width, then rotated so the profile's +X
 * (toe) faces +Z. Sole at y=0.
 */
function buildPlayerBootGeometry(): ExtrudeGeometry {
  const s = new Shape()
  s.moveTo(-0.075, 0)
  s.lineTo(0.12, 0)
  s.quadraticCurveTo(0.19, 0, 0.215, 0.03) // toe spring
  s.quadraticCurveTo(0.225, 0.055, 0.2, 0.075) // toe box
  s.quadraticCurveTo(0.12, 0.1, 0.05, 0.105) // instep
  s.lineTo(0.035, 0.15) // shaft front
  s.quadraticCurveTo(0.03, 0.16, -0.02, 0.16)
  s.lineTo(-0.06, 0.155) // shaft back
  s.quadraticCurveTo(-0.085, 0.14, -0.085, 0.08) // heel counter
  s.quadraticCurveTo(-0.085, 0.03, -0.075, 0)
  const geo = new ExtrudeGeometry(s, {
    depth: 0.15,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.012,
    bevelSegments: 2,
    curveSegments: 6,
    steps: 1,
  })
  geo.translate(0, 0, -0.075)
  geo.rotateY(-Math.PI / 2)
  return geo
}

/**
 * Arm column, shoulder pivot (y=0) to fist (~-0.46): deltoid ball, bicep
 * taper, elbow bead, forearm, flared fist — one lathed piece.
 */
function buildPlayerArmGeometry(): LatheGeometry {
  const profile: [number, number][] = [
    [0.001, 0.032],
    [0.055, 0.024],
    [0.085, 0.004], // deltoid ball
    [0.08, -0.06],
    [0.066, -0.16], // bicep taper
    [0.056, -0.22],
    [0.062, -0.245], // elbow bead
    [0.056, -0.27],
    [0.05, -0.34], // forearm
    [0.048, -0.38], // wrist
    [0.068, -0.41], // fist flare
    [0.062, -0.445],
    [0.001, -0.455],
  ]
  return new LatheGeometry(
    profile.map(([x, y]) => new Vector2(x, y)),
    14,
  )
}

/**
 * Field pack: tapered rounded volume (wider at the base) bevel-extruded.
 * Centered — drop-in at the old backpack anchor.
 */
function buildPlayerPackGeometry(): ExtrudeGeometry {
  const s = new Shape()
  s.moveTo(-0.115, -0.23)
  s.lineTo(0.115, -0.23)
  s.quadraticCurveTo(0.17, -0.23, 0.17, -0.16)
  s.lineTo(0.148, 0.16)
  s.quadraticCurveTo(0.146, 0.23, 0.095, 0.23)
  s.lineTo(-0.095, 0.23)
  s.quadraticCurveTo(-0.146, 0.23, -0.148, 0.16)
  s.lineTo(-0.17, -0.16)
  s.quadraticCurveTo(-0.17, -0.23, -0.115, -0.23)
  const geo = new ExtrudeGeometry(s, {
    depth: 0.16,
    bevelEnabled: true,
    bevelThickness: 0.028,
    bevelSize: 0.024,
    bevelSegments: 2,
    curveSegments: 6,
    steps: 1,
  })
  geo.translate(0, 0, -0.08)
  return geo
}

/** Bedroll canister for the pack crown — lathed capsule lying along X. */
function buildPlayerPackRollGeometry(): LatheGeometry {
  const profile: [number, number][] = [
    [0.001, -0.17],
    [0.045, -0.168],
    [0.062, -0.155],
    [0.066, -0.14],
    [0.066, 0.14],
    [0.062, 0.155],
    [0.045, 0.168],
    [0.001, 0.17],
  ]
  const geo = new LatheGeometry(
    profile.map(([x, y]) => new Vector2(x, y)),
    12,
  )
  geo.rotateZ(Math.PI / 2)
  return geo
}

/**
 * Small beveled light pip (0.09 × 0.05 × 0.028, centered) — shoulder
 * lights, pack strip, chest core, and adept rank marks reuse it scaled.
 */
function buildPlayerPipGeometry(): ExtrudeGeometry {
  return buildBeveledPanelGeometry(0.09, 0.05, 0.028, 0.016, 0.008)
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
  /** Turned terminal pedestal, 0 → 0.36 along +Y. */
  terminalPedestal: LatheGeometry
  /** Short neck collar between pedestal and housing. */
  terminalCollar: LatheGeometry
  /** Beveled console carcass, centered (1.35 × 0.7 × 0.8). */
  terminalHousing: ExtrudeGeometry
  /** Beveled screen bezel frame, centered (1.12 × 0.72 × 0.08). */
  terminalBezel: ExtrudeGeometry
  /** Beveled keyboard deck plate, centered (0.82 × 0.14 × 0.02). */
  terminalKeydeck: ExtrudeGeometry
  /** Beveled crate lid slab, centered (0.8 × 0.8 × 0.05). */
  crateLid: ExtrudeGeometry
  /** Flanged floor conduit segment, 0 → 1 along +Y (scale Y for run length). */
  ductPipe: LatheGeometry
  /** Turned light-mast pole, 0 → 2.8 along +Y. */
  mastFlange: LatheGeometry
  /** Beveled lamp cap for light masts, centered (0.28 × 0.12 × 0.28). */
  mastLamp: ExtrudeGeometry
  /** Beveled Beta gate energy wall, centered (5.8 × 1.9 × 0.14). */
  barrierPane: ExtrudeGeometry
  /** Lathed Riser helmet with recessed visor channel, origin at neck base. */
  playerHelm: LatheGeometry
  /** Partial-lathe amber visor arc (~143° front), helm local frame. */
  playerVisor: LatheGeometry
  /** Beveled tapered cuirass, centered (~0.46 × 0.55 × 0.3). */
  playerTorso: ExtrudeGeometry
  /** Lathed pauldron dome (squashed Z), rim at y=0, closed underside. */
  playerPauldron: LatheGeometry
  /** Lathed leg column hip→ankle, origin at hip pivot, hangs -Y. */
  playerLeg: LatheGeometry
  /** Extruded side-profile boot, sole at y=0, toe toward +Z. */
  playerBoot: ExtrudeGeometry
  /** Lathed arm column shoulder→fist, origin at shoulder pivot, hangs -Y. */
  playerArm: LatheGeometry
  /** Beveled tapered field pack, centered (~0.35 × 0.46 × 0.22). */
  playerPack: ExtrudeGeometry
  /** Lathed bedroll canister lying along X. */
  playerPackRoll: LatheGeometry
  /** Small beveled light pip, centered (0.09 × 0.05 × 0.028) — scale per use. */
  playerPip: ExtrudeGeometry
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
      terminalPedestal: buildTerminalPedestalGeometry(),
      terminalCollar: buildTerminalCollarGeometry(),
      terminalHousing: buildBeveledPanelGeometry(1.35, 0.7, 0.8, 0.08, 0.04),
      terminalBezel: buildBeveledPanelGeometry(1.12, 0.72, 0.08, 0.05, 0.025),
      terminalKeydeck: buildBeveledPanelGeometry(0.82, 0.14, 0.02, 0.02, 0.008),
      crateLid: buildBeveledPanelGeometry(0.8, 0.8, 0.05, 0.03, 0.015),
      ductPipe: buildDuctPipeGeometry(),
      mastFlange: buildMastFlangeGeometry(),
      mastLamp: buildMastLampGeometry(),
      barrierPane: buildBarrierPaneGeometry(),
      playerHelm: buildPlayerHelmGeometry(),
      playerVisor: buildPlayerVisorGeometry(),
      playerTorso: buildPlayerTorsoGeometry(),
      playerPauldron: buildPlayerPauldronGeometry(),
      playerLeg: buildPlayerLegGeometry(),
      playerBoot: buildPlayerBootGeometry(),
      playerArm: buildPlayerArmGeometry(),
      playerPack: buildPlayerPackGeometry(),
      playerPackRoll: buildPlayerPackRollGeometry(),
      playerPip: buildPlayerPipGeometry(),
    }
  }
  return sharedKit
}
