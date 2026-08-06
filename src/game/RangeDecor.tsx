import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, Quaternion, Vector3 } from 'three'
import type { Group, Mesh, MeshBasicMaterial, MeshStandardMaterial } from 'three'
import { ALPHA_RADIUS, PAD_TOP, TERMINAL_POS } from '@/game/world'
import { getAuthoredGeoKit, getProcTextureKit, makeHazardStripeTexture, makeSteelPlateTexture } from '@/game/proc'
import { AuthoredProps } from '@/game/AuthoredProps'
import { HeroModel, type HeroKind } from '@/game/HeroGltf'

const CYAN = '#3dd6c6'
const AMBER = '#f0a830'
const STEEL = '#1a3344'

/** Alpha pad deck sits PAD_TOP above the main deck — decor feet need the local surface height. */
function surfaceY(x: number, z: number) {
  return x * x + z * z <= ALPHA_RADIUS * ALPHA_RADIUS ? PAD_TOP : 0
}

/**
 * Distant / mid-field set dressing for the training range.
 * Wave 5 densifies approach corridors without asset packs.
 * Budget guardrails: <40 new meshes, zero new point lights — wave-5 pieces
 * read via emissive/basic materials inside the existing light pools.
 */
export function RangeDecor() {
  return (
    <group>
      <HorizonRing />
      <LightPosts />
      <ApproachRails />
      <EnergyConduits />
      <HoloPillars />
      <AntennaDishes />
      <SupplyCrates />
      <DistantSpires />
      <PlazaBanners />
      <PlazaMidArch />
      <FloatingIslands />
      <CrystalMonolith />
      <CrystalLamps />
      <WaterfallLandmark />
      <MesaCluster />
      <GroundBreakup />
      <PlazaEnclosure />
      <AuthoredProps />
    </group>
  )
}

/**
 * Loops 56-58: training-yard enclosure — Meshy wall / corner / railing modules
 * tiled into a readable perimeter so the first 10s is a paved yard, not props
 * on a blank plane. Walk path spawn (0,4) → terminal (2.5,-3.5) → gate (0,-8)
 * stays clear; the south side opens at the gate lane, framed by two bastion
 * towers behind the plaza arch, and the rear keeps a spawn-side entrance.
 * Every placement is checked against the L2-L6 lesson-yard keep-outs
 * (Beta r5 at (0,-15); Delta/Epsilon squares at (±7.6,-9.1); Zeta hex at
 * (9.2,0)) so unlock pads never grow through a wall.
 * Budget: 12 walls + 4 corners + 6 railings = 22 clones of 3 Draco GLBs
 * (plus 14 floor tiles in GroundBreakup → 36 total).
 */
function PlazaEnclosure() {
  return (
    <group>
      <WallRing />
      <RailingRing />
    </group>
  )
}

/**
 * Enclosure module scales — retune once wall-module / wall-corner /
 * railing-barrier GLB dims are verified post-ship. Targets at these scales:
 * wall ≈ 3m long × 2.6m tall, corner ≈ bastion pylon, railing ≈ 2.4m × 1.1m.
 */
const WALL_SCALE = 1.3
const CORNER_SCALE = 1.35
const RAIL_SCALE = 1.1

/**
 * Loops 56-57: wall runs + corner bastions. West run hugs x=-9.2 between the
 * Epsilon yard rim (z −6.55) and the NW light post; the east line at x=+9.2
 * breaks around the L6 Zeta Mirror Yard (x 6.6–11.8, z −3–3) so its bridge
 * entrance stays walkable; the rear run at z=+8.4 leaves a spawn-side
 * entrance chained by railings. South corners stand at (±3.5, −8.4) as gate
 * towers framing the plaza arch — Delta/Epsilon yards (x ±5.0–10.2,
 * z −6.5–−11.7) own the SE/SW quadrants, so no perimeter can run there.
 * rotY assumes the wall module's long axis is local X — verify post-ship.
 */
function WallRing() {
  // x, z, rotY
  const walls: [number, number, number][] = [
    // West run (6) — full flank, dish at (-8.2, 0.5) reads as a wall-side bay
    [-9.2, -5.1, Math.PI / 2],
    [-9.2, -2.94, Math.PI / 2],
    [-9.2, -0.78, Math.PI / 2],
    [-9.2, 1.38, Math.PI / 2],
    [-9.2, 3.54, Math.PI / 2],
    [-9.2, 5.7, Math.PI / 2],
    // East run (2) — pockets clear of Zeta (z −3…3), Delta (z < −6.5), NE post
    [9.2, -4.8, -Math.PI / 2],
    [9.2, 4.5, -Math.PI / 2],
    // Rear run (4) — MUST sit behind shoulder cam (~z 7.5–8 when player at z=4).
    // Prior z=8.4 put camera inside wall thickness → cyan crystal cavern FAIL.
    [-3.6, 12.2, 0],
    [-1.2, 12.2, 0],
    [1.2, 12.2, 0],
    [3.6, 12.2, 0],
  ]
  // x, z, rotY — rear bastions well behind cam; south pair are gate towers
  const corners: [number, number, number][] = [
    [-8.2, 11.6, Math.PI],
    [8.2, 11.6, -Math.PI / 2],
    [-3.5, -8.4, Math.PI / 2],
    [3.5, -8.4, -Math.PI / 2],
  ]
  return (
    <group>
      {walls.map(([x, z, rot], i) => (
        <group key={`w${i}`} position={[x, surfaceY(x, z), z]} rotation={[0, rot, 0]}>
          <HeroModel kind="wall" scale={WALL_SCALE} />
        </group>
      ))}
      {corners.map(([x, z, rot], i) => (
        <group key={`c${i}`} position={[x, surfaceY(x, z), z]} rotation={[0, rot, 0]}>
          <HeroModel kind="wallCorner" scale={CORNER_SCALE} />
        </group>
      ))}
    </group>
  )
}

/**
 * Loop 57: low railing barriers — two pairs extend the ApproachRails idiom
 * down the gate lane toward the corner towers (walk line x ≈ 2.5→0 stays
 * inside the rails), and a rear pair edges the spawn-side entrance between
 * the rear wall run and the corner bastions. All runs along local X.
 */
function RailingRing() {
  // x, z, rotY
  const rails: [number, number, number][] = [
    // Gate-lane pairs — clear of floor tile D, hazard stripes, light posts
    [-3.6, -5.8, 0],
    [3.6, -5.8, 0],
    [-3.6, -7.2, 0],
    [3.6, -7.2, 0],
    // Rear entrance edges — match pushed-back rear wall run
    [-5.9, 12.2, 0],
    [5.9, 12.2, 0],
  ]
  return (
    <group>
      {rails.map(([x, z, rot], i) => (
        <group key={i} position={[x, surfaceY(x, z), z]} rotation={[0, rot, 0]}>
          <HeroModel kind="railing" scale={RAIL_SCALE} />
        </group>
      ))}
    </group>
  )
}

/**
 * Loop 34/52: Meshy-authored plaza banners (replaces primitive cloth poles).
 * Mobile-safe count — 8 instances of one Draco GLB.
 */
function PlazaBanners() {
  const banners: [number, number, number, number][] = [
    // x, z, rotY, scale — near-pad flanks readable in first 10s shoulder cam
    [-4.6, 3.8, 0.25, 1],
    [5.0, 3.4, -0.3, 1],
    [-6.8, 5.2, 0.35, 0.95],
    [7.2, 4.8, -0.4, 0.95],
    [-7.5, -8.5, 0.2, 0.9],
    [6.8, -9.2, -0.25, 0.9],
    // Loop 52: mid-field flank rhythm — color punctuation between pad and gate
    [-8.4, -2.4, 0.32, 0.92],
    [8.8, -1.8, -0.38, 0.9],
  ]
  return (
    <group>
      {banners.map(([x, z, rot, s], i) => (
        <group key={i} position={[x, surfaceY(x, z), z]} rotation={[0, rot, 0]}>
          <HeroModel kind="banner" scale={s} />
        </group>
      ))}
    </group>
  )
}

/**
 * Loop 34 / 61: Meshy mid-field stone arch — shifted off the walk axis so the
 * dead-center skyline slot belongs to CrystalMonolith, not terracotta arch.
 */
function PlazaMidArch() {
  return (
    <group position={[-4.8, 0, -5.6]} rotation={[0, 0.42, 0]}>
      <HeroModel kind="arch" scale={0.92} />
    </group>
  )
}

/**
 * Wave 9 ground breakup — low-profile deck hardware along the Alpha→terminal
 * corridor. Flat service plates, cable trunks, and hazard stripe pads interrupt
 * the hex-pad / infinite-grid read. Everything is <=6 cm proud of the deck and
 * placed off the spawn→terminal walking diagonal, so the path stays clear.
 * Budget: 17 meshes, 0 lights, 0 per-frame work, +1 small canvas bake.
 * Seating discipline: on-pad pieces keep whole footprints inside r 5.6 (hex
 * circle); off-pad pieces stay beyond r 6.5 so nothing straddles the pad skirt.
 */
function GroundBreakup() {
  return (
    <group>
      <FloorPlates />
      <PlazaFloorTiles />
      <CableTrunks />
      <HazardStripes />
    </group>
  )
}

/**
 * Loop 36/58: Meshy plaza floor tiles — densified 4 → 14 so the spawn→terminal
 * →gate corridor reads as paved yard, not blank deck. Tiles sit slightly proud
 * of deck (+0.04) and keep ≥ ~2.2m mutual spacing so coplanar faces never
 * z-fight; pairs under the flank banners are deliberate (poles planted on
 * pavement). Walk lane itself stays walkable — tiles are flat pavement.
 */
function PlazaFloorTiles() {
  const tiles: [number, number, number, number][] = [
    // x, z, scale, rotY — off the walk diagonal, slightly proud of deck
    [-2.8, 1.2, 1.4, 0.15],
    [3.5, 0.8, 1.6, -0.2],
    [-3.2, -3.5, 1.3, 0.25],
    [4.8, -4.2, 1.5, -0.15],
    // Loop 58: spawn landing + corridor chain toward the terminal
    [0, 4.6, 1.4, 0.05],
    [0.4, 1.9, 1.45, -0.06],
    [1.6, -1.4, 1.5, 0.06],
    [-0.2, -3.4, 1.45, -0.04],
    // Loop 58: gate lane + threshold paving toward Beta (south edge of the
    // last tile tucks under the Beta pad rim when L2 unlocks — reads as laid pavement)
    [-1.4, -5.9, 1.4, 0.1],
    [0.3, -7.5, 1.5, -0.08],
    [0.4, -9.9, 1.5, 0.04],
    // Loop 58: pad-rim infill — banner poles land on pavement
    [-4.6, 3.4, 1.4, 0.28],
    [4.9, 2.9, 1.4, -0.22],
    [-5.0, -1.6, 1.35, 0.18],
  ]
  return (
    <group>
      {tiles.map(([x, z, s, rot], i) => (
        <group key={i} position={[x, surfaceY(x, z) + 0.04, z]} rotation={[0, rot, 0]}>
          <HeroModel kind="floor" scale={s} />
        </group>
      ))}
    </group>
  )
}

function FloorPlates() {
  const { panel } = useMemo(() => getProcTextureKit(), [])
  // x, z, sizeX, sizeZ, rotY, stripSide (+1 = cyan edge strip faces the corridor)
  const plates: [number, number, number, number, number, number][] = [
    [-2.3, 0.6, 1.5, 2.2, 0.12, 1], // west corridor flank
    [-1.9, -2.9, 1.6, 1.6, -0.2, 1], // SW, below the conduit run
    [4.1, -2.3, 1.3, 1.5, 0.08, -1], // terminal service apron
    [5.9, -6.6, 1.6, 2.0, 0.25, -1], // off-pad deck, flanks the gate approach
  ]
  return (
    <group>
      {plates.map(([x, z, sx, sz, rot, side], i) => (
        <group key={i} position={[x, surfaceY(x, z), z]} rotation={[0, rot, 0]}>
          <mesh position={[0, 0.037, 0]}>
            <boxGeometry args={[sx, 0.05, sz]} />
            <meshStandardMaterial map={panel} color="#8fb8b4" metalness={0.4} roughness={0.5} />
          </mesh>
          <mesh position={[side * (sx / 2 - 0.05), 0.063, 0]}>
            <boxGeometry args={[0.07, 0.02, sz - 0.15]} />
            <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function CableTrunks() {
  const { ductPipe } = useMemo(() => getAuthoredGeoKit(), [])
  // from [x,z] to [x,z] — steel channel + two steady cables (cyan feed, amber
  // return). Deliberately static: the nearby EnergyConduits already pulse.
  const runs: [number, number, number, number][] = [
    [-4.5, 3.4, -4.5, -1.6], // west trunk, outside the guide rail
    [4.9, 3.2, 4.9, -0.8], // east trunk, outside the guide rail
  ]
  return (
    <group>
      {runs.map(([fx, fz, tx, tz], i) => {
        const mx = (fx + tx) / 2
        const mz = (fz + tz) / 2
        const len = Math.hypot(tx - fx, tz - fz)
        const rot = Math.atan2(tx - fx, tz - fz)
        return (
          <group key={i} position={[mx, surfaceY(mx, mz), mz]} rotation={[0, rot, 0]}>
            <mesh geometry={ductPipe} position={[0, 0.032, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[4.8, len, 4.8]}>
              <meshStandardMaterial color={STEEL} metalness={0.55} roughness={0.45} />
            </mesh>
            <mesh position={[-0.11, 0.072, 0]}>
              <boxGeometry args={[0.07, 0.024, len - 0.12]} />
              <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={0.45} />
            </mesh>
            <mesh position={[0.11, 0.072, 0]}>
              <boxGeometry args={[0.07, 0.024, len - 0.12]} />
              <meshStandardMaterial color={AMBER} emissive={AMBER} emissiveIntensity={0.4} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

function HazardStripes() {
  const stripes = useMemo(() => makeHazardStripeTexture(256, 128), [])
  // x, z, rotY — terminal base pair + one pad-rim threshold flanking the gate walk
  const pads: [number, number, number][] = [
    [1.3, -4.7, 0.55],
    [3.7, -4.0, -0.5],
    [2.0, -6.5, 0.15],
  ]
  return (
    <group>
      {pads.map(([x, z, rot], i) => (
        <group key={i} position={[x, surfaceY(x, z), z]} rotation={[0, rot, 0]}>
          <mesh position={[0, 0.023, 0]}>
            <boxGeometry args={[1.2, 0.022, 0.45]} />
            <meshStandardMaterial
              map={stripes}
              emissiveMap={stripes}
              emissive="#ffffff"
              emissiveIntensity={0.22}
              metalness={0.2}
              roughness={0.7}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function HorizonRing() {
  const mat = useRef<MeshBasicMaterial>(null)
  useFrame((state) => {
    if (mat.current) {
      mat.current.opacity = 0.14 + Math.sin(state.clock.elapsedTime * 0.35) * 0.03
    }
  })
  return (
    <mesh position={[0, 0.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[38, 42, 64]} />
      <meshBasicMaterial
        ref={mat}
        color={CYAN}
        transparent
        opacity={0.14}
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  )
}

function LightPosts() {
  const { mastFlange, mastLamp } = useMemo(() => getAuthoredGeoKit(), [])
  // [x, z, color, lit] — wave-5 approach posts run emissive-only to hold the
  // mobile light count flat; the original six keep their pools.
  const posts: [number, number, string, boolean][] = [
    [-9.5, 7.5, CYAN, true],
    [9.5, 7.5, CYAN, true],
    [-10.5, -4, AMBER, true],
    [10.5, -4, AMBER, true],
    [-7.5, -18, CYAN, true],
    [7.5, -18, CYAN, true],
    // Approach densification: pad corridor + gate flanks
    [-3.8, 1.2, CYAN, false],
    [5.2, -1.5, CYAN, false],
    [-4.5, -6.2, AMBER, false],
    [4.5, -6.2, AMBER, false],
  ]
  return (
    <group>
      {posts.map(([x, z, color, lit], i) => (
        <group key={i} position={[x, surfaceY(x, z), z]}>
          <mesh geometry={mastFlange}>
            <meshStandardMaterial color={STEEL} metalness={0.55} roughness={0.4} />
          </mesh>
          <mesh geometry={mastLamp} position={[0, 2.85, 0]}>
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} />
          </mesh>
          {lit && <pointLight position={[0, 2.7, 0]} color={color} intensity={2.6} distance={6.5} decay={2} />}
        </group>
      ))}
    </group>
  )
}

/** Low guide rails framing the walk from Alpha toward the gate. */
function ApproachRails() {
  const segments: [number, number, number, number][] = [
    // x, z, length, rotY
    [-3.2, 2.5, 4.5, 0],
    [3.2, 2.5, 4.5, 0],
    [-3.2, -2.5, 4.2, 0],
    [3.2, -2.5, 4.2, 0],
  ]
  return (
    <group>
      {segments.map(([x, z, len, rot], i) => (
        <group key={i} position={[x, surfaceY(x, z), z]} rotation={[0, rot, 0]}>
          <mesh position={[0, 0.35, 0]}>
            <boxGeometry args={[0.08, 0.7, len]} />
            <meshStandardMaterial color={STEEL} metalness={0.5} roughness={0.45} />
          </mesh>
          <mesh position={[0, 0.72, 0]}>
            <boxGeometry args={[0.1, 0.04, len]} />
            <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={0.55} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** Thin emissive conduits snaking toward the Algebra Terminal. */
function EnergyConduits() {
  const { ductPipe } = useMemo(() => getAuthoredGeoKit(), [])
  const mats = useRef<(MeshStandardMaterial | null)[]>([])
  const paths = useMemo(
    () => [
      { from: [-1.8, 3.5], to: [TERMINAL_POS[0] - 0.8, TERMINAL_POS[2] + 0.6] },
      { from: [1.6, 4.2], to: [TERMINAL_POS[0] + 0.5, TERMINAL_POS[2] + 1.1] },
      { from: [0.2, 5.5], to: [TERMINAL_POS[0] - 0.2, TERMINAL_POS[2] + 1.8] },
    ],
    [],
  )

  useFrame((state) => {
    const t = state.clock.elapsedTime
    for (let i = 0; i < mats.current.length; i++) {
      const m = mats.current[i]
      if (m) m.emissiveIntensity = 0.45 + Math.sin(t * 3.2 - i * 0.9) * 0.35
    }
  })

  return (
    <group>
      {paths.map((p, i) => {
        const mx = (p.from[0] + p.to[0]) / 2
        const mz = (p.from[1] + p.to[1]) / 2
        const dx = p.to[0] - p.from[0]
        const dz = p.to[1] - p.from[1]
        const len = Math.hypot(dx, dz)
        const rot = Math.atan2(dx, dz)
        return (
          <mesh
            key={i}
            geometry={ductPipe}
            position={[mx, PAD_TOP + 0.034, mz]}
            rotation={[Math.PI / 2, rot, 0]}
            scale={[0.62, len, 0.62]}
          >
            <meshStandardMaterial
              ref={(m) => {
                mats.current[i] = m
              }}
              color={CYAN}
              emissive={CYAN}
              emissiveIntensity={0.6}
              transparent
              opacity={0.85}
            />
          </mesh>
        )
      })}
    </group>
  )
}

function HoloPillars() {
  const spins = useRef<(Mesh | null)[]>([])
  useFrame((_, delta) => {
    for (const m of spins.current) {
      if (m) m.rotation.y += delta * 1.4
    }
  })
  const pillars: [number, number][] = [
    [-5.6, 2.8],
    [-6.3, 4.6],
    [5.8, 3.1],
  ]
  return (
    <group>
      {pillars.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 0.55, 0]}>
            <cylinderGeometry args={[0.12, 0.18, 1.1, 6]} />
            <meshStandardMaterial color={STEEL} metalness={0.5} roughness={0.4} />
          </mesh>
          <mesh
            ref={(m) => {
              spins.current[i] = m
            }}
            position={[0, 1.35, 0]}
            rotation={[Math.PI / 2, 0, 0.2]}
          >
            <torusGeometry args={[0.28, 0.035, 6, 24]} />
            <meshStandardMaterial color={AMBER} emissive={AMBER} emissiveIntensity={1.1} transparent opacity={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

const STRUT_UP = new Vector3(0, 1, 0)

/** Tapered support between two local points — dish feed-strut idiom. */
function Strut({ from, to, radius }: { from: [number, number, number]; to: [number, number, number]; radius: number }) {
  const { mid, quat, len } = useMemo(() => {
    const a = new Vector3(...from)
    const b = new Vector3(...to)
    const dir = b.clone().sub(a)
    const len = dir.length()
    const quat = new Quaternion().setFromUnitVectors(STRUT_UP, dir.normalize())
    return { mid: a.add(b).multiplyScalar(0.5), quat, len }
  }, [from, to])
  return (
    <mesh position={mid} quaternion={quat}>
      <cylinderGeometry args={[radius * 0.7, radius, len, 6]} />
      <meshStandardMaterial color="#2a4a5a" metalness={0.6} roughness={0.38} />
    </mesh>
  )
}

/**
 * Wave 17 hero dishes — authored lathed paraboloid bowl with rolled rim,
 * tripod feed struts + horn, pivot knuckle and counterweight: real silhouette
 * language replacing the partial-sphere kitbash. Same two flank placements,
 * same blinking feed tip, same budget class (no new lights, one shared
 * lathe geometry, one shared steel bake).
 */
function AntennaDishes() {
  const tips = useRef<(MeshStandardMaterial | null)[]>([])
  const { dish } = useMemo(() => getAuthoredGeoKit(), [])
  const steel = useMemo(() => makeSteelPlateTexture(256), [])
  useFrame((state) => {
    const t = state.clock.elapsedTime
    for (let i = 0; i < tips.current.length; i++) {
      const m = tips.current[i]
      // Sharp repeating blip, phase-offset per mast — reads as live hardware
      if (m) m.emissiveIntensity = 0.5 + Math.pow(Math.max(0, Math.sin(t * 2.1 + i * 2.6)), 3) * 1.6
    }
  })
  const dishes: [number, number, number][] = [
    [-8.2, 0.5, 0.4],
    [8.5, -3.2, -0.5],
  ]
  return (
    <group>
      {dishes.map(([x, z, tilt], i) => (
        <group key={i} position={[x, 0, z]}>
          {/* Flanged mast base */}
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.17, 0.21, 0.1, 10]} />
            <meshStandardMaterial color="#16303e" metalness={0.55} roughness={0.45} />
          </mesh>
          <mesh position={[0, 1.15, 0]}>
            <cylinderGeometry args={[0.07, 0.11, 2.3, 8]} />
            <meshStandardMaterial color={STEEL} metalness={0.55} roughness={0.4} />
          </mesh>
          {/* Pivot knuckle at the mast head */}
          <mesh position={[0, 2.32, 0]}>
            <sphereGeometry args={[0.1, 10, 8]} />
            <meshStandardMaterial color="#24506a" metalness={0.6} roughness={0.35} />
          </mesh>
          {/* Authored dish assembly — bowl opens +Y in local space */}
          <group position={[0, 2.42, 0.08]} rotation={[0.85 + tilt, 0.3, 0]}>
            <mesh geometry={dish}>
              <meshStandardMaterial map={steel} color="#a9ced4" metalness={0.58} roughness={0.36} side={2} />
            </mesh>
            {/* Rear hub + counterweight disc */}
            <mesh position={[0, -0.05, 0]}>
              <cylinderGeometry args={[0.09, 0.13, 0.12, 10]} />
              <meshStandardMaterial color="#16303e" metalness={0.55} roughness={0.4} />
            </mesh>
            <mesh position={[0, -0.135, 0]}>
              <cylinderGeometry args={[0.13, 0.13, 0.045, 12]} />
              <meshStandardMaterial color="#1e3a4a" metalness={0.6} roughness={0.38} />
            </mesh>
            {/* Tripod feed struts converging on the horn */}
            {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((a) => (
              <Strut
                key={a}
                from={[Math.cos(a) * 0.5, 0.17, Math.sin(a) * 0.5]}
                to={[0, 0.62, 0]}
                radius={0.018}
              />
            ))}
            {/* Feed horn (apex toward the bowl) + blinking tip */}
            <mesh position={[0, 0.58, 0]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.055, 0.14, 10]} />
              <meshStandardMaterial color="#24506a" metalness={0.6} roughness={0.35} />
            </mesh>
            <mesh position={[0, 0.68, 0]}>
              <sphereGeometry args={[0.055, 8, 8]} />
              <meshStandardMaterial
                ref={(m) => {
                  tips.current[i] = m
                }}
                color={CYAN}
                emissive={CYAN}
                emissiveIntensity={1.4}
              />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  )
}

function SupplyCrates() {
  const crates = useMemo(
    () =>
      [
        [-5.2, 6.1, 0.35, 0.88],
        [-4.4, 6.6, -0.2, 0.82],
        [5.8, 5.4, 0.55, 0.9],
        [6.4, -2.2, 0.1, 0.85],
        [-6.1, -5.5, 0.4, 0.8],
        [2.8, 6.8, 0.2, 0.78],
      ] as [number, number, number, number][],
    [],
  )
  return (
    <group>
      {crates.map(([x, z, rot, s], i) => (
        <group key={i} position={[x, surfaceY(x, z), z]} rotation={[0, rot, 0]}>
          <HeroModel kind="crate" scale={s} />
        </group>
      ))}
    </group>
  )
}

function DistantSpires() {
  const spires: [number, number, number, number][] = [
    [-28, -12, 9, 1.2],
    [-24, 18, 6.5, 0.9],
    [26, -8, 11, 1.4],
    [22, 16, 7.2, 1.0],
    [-18, -28, 5.5, 0.8],
    [16, -30, 8, 1.1],
    // Loop 23: extra mid-horizon crystal accents for plaza depth
    [-32, 4, 7.5, 0.7],
    [30, 10, 8.5, 0.85],
    [8, -36, 6.2, 0.65],
  ]
  return (
    <group>
      {spires.map(([x, z, h, w], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, h / 2, 0]}>
            <boxGeometry args={[w, h, w]} />
            <meshStandardMaterial
              color={i >= 6 ? '#1a3a55' : '#0e1c28'}
              metalness={i >= 6 ? 0.35 : 0.2}
              roughness={i >= 6 ? 0.45 : 0.85}
              transparent
              opacity={0.85}
            />
          </mesh>
          {/* Crystal ring accent on newer spires */}
          {i >= 6 && (
            <mesh position={[0, h * 0.65, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[w * 0.85, 0.06, 6, 20]} />
              <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={0.75} transparent opacity={0.7} />
            </mesh>
          )}
          <mesh position={[0, h + 0.4, 0]}>
            <boxGeometry args={[w * 0.35, 0.8, w * 0.35]} />
            <meshStandardMaterial
              color={i % 3 === 0 ? AMBER : CYAN}
              emissive={i % 3 === 0 ? AMBER : CYAN}
              emissiveIntensity={1.05}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/**
 * Loop 47 / 63: Meshy floating-island skyline — verdant flower cluster pulled
 * into first-10s shoulder cam; distant rock islands hold the far horizon.
 */
function FloatingIslands() {
  const islands = useRef<(Group | null)[]>([])
  useFrame((state) => {
    const t = state.clock.elapsedTime
    for (let i = 0; i < islands.current.length; i++) {
      const g = islands.current[i]
      if (g) g.position.y = (g.userData.y0 as number) + Math.sin(t * 0.4 + i * 1.7) * 0.18
    }
  })
  // kind, x, y0, z, scale, rotY
  const rocks: [HeroKind, number, number, number, number, number][] = [
    // Loop 63→hotfix: keep verdant identity but as SKYLINE — not frustum-fill
    // (prior z≈−11 / scale≈1.6 read as cyan crystal cavern in first-10s)
    ['flowerIsland', -11.5, 7.2, -20.5, 1.22, 0.18],
    ['flowerIsland', 12.8, 6.8, -19.2, 1.18, -0.22],
    ['flowerIsland', -16.5, 7.6, -22.0, 1.12, 0.55],
    ['island', 22, 8.5, -24, 1.0, -0.3],
    ['island', -24, 9.0, -14, 1.18, 0.6],
  ]
  return (
    <group>
      {rocks.map(([kind, x, y0, z, s, rot], i) => (
        <group
          key={i}
          ref={(g) => {
            islands.current[i] = g
          }}
          position={[x, y0, z]}
          rotation={[0, rot, 0]}
          userData={{ y0 }}
        >
          <HeroModel kind={kind} scale={s} />
        </group>
      ))}
      <Strut from={[-12.2, 7.0, -20.0]} to={[11.8, 6.6, -19.0]} radius={0.1} />
      <Strut from={[-15.8, 7.4, -21.4]} to={[-10.8, 7.0, -20.2]} radius={0.09} />
    </group>
  )
}

/**
 * Loop 46 / 61: Meshy ringed monolith — dead-center walk-axis skyline hero so
 * cyan rings + bloom beat the terracotta arch in first-viewport shoulder cam.
 */
function CrystalMonolith() {
  const rings = useRef<(Group | null)[]>([])
  useFrame((_, delta) => {
    for (let i = 0; i < rings.current.length; i++) {
      const g = rings.current[i]
      if (g) g.rotation.y += delta * (i === 0 ? 0.22 : -0.14)
    }
  })
  return (
    // Hotfix post-critic FAIL: silhouette on walk axis — not viewport occlusion.
    // Bloom GLB is ~16m lateral; scale 2.35 at tip filled spawn as crystal cavern.
    <group position={[1.2, 0, -24.5]}>
      <HeroModel kind="monolith" scale={1.62} />
      <group position={[0, 17.2, -0.2]} rotation={[0.08, 0.12, 0]}>
        <HeroModel kind="bloom" scale={0.85} />
      </group>
      <mesh position={[0, 17.4, -0.25]}>
        <sphereGeometry args={[2.2, 16, 12]} />
        <meshBasicMaterial color={CYAN} transparent opacity={0.32} blending={AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh position={[0, 17.8, -0.5]} rotation={[0.12, 0, 0]}>
        <planeGeometry args={[3.6, 3.6]} />
        <meshBasicMaterial color={CYAN} transparent opacity={0.14} blending={AdditiveBlending} depthWrite={false} side={2} />
      </mesh>
      <group
        ref={(g) => {
          rings.current[0] = g
        }}
        position={[0, 11.6, 0]}
      >
        <mesh rotation={[Math.PI / 2 + 0.16, 0, 0]}>
          <torusGeometry args={[4.2, 0.14, 6, 48]} />
          <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={2.4} transparent opacity={0.78} />
        </mesh>
      </group>
      <group
        ref={(g) => {
          rings.current[1] = g
        }}
        position={[0, 14.4, 0]}
      >
        <mesh rotation={[Math.PI / 2 - 0.2, 0, 0.12]}>
          <torusGeometry args={[5.6, 0.13, 6, 48]} />
          <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={1.7} transparent opacity={0.68} />
        </mesh>
      </group>
    </group>
  )
}

/** Loop 39: Meshy crystal lamps flanking Alpha pad corridor — readable in first 10s. */
function CrystalLamps() {
  const lamps: [number, number, number, number][] = [
    // x, z, rotY, scale — near-banner corridor flanks
    [-5.8, 4.2, 0.3, 0.72],
    [6.4, 3.6, -0.35, 0.75],
    [-7.2, -2.8, 0.45, 0.68],
    [7.0, -3.4, -0.4, 0.7],
    [-5.2, -5.6, 0.2, 0.65],
    [5.6, 5.8, -0.25, 0.68],
  ]
  return (
    <group>
      {lamps.map(([x, z, rot, s], i) => (
        <group key={i} position={[x, surfaceY(x, z), z]} rotation={[0, rot, 0]}>
          <HeroModel kind="lamp" scale={s} />
        </group>
      ))}
    </group>
  )
}

/** Loop 48 / 63: Meshy waterfall cliff — turquoise flank pulled into first-10s band. */
function WaterfallLandmark() {
  return (
    <group position={[-14.5, 0, -16.5]} rotation={[0, -0.35, 0]}>
      <HeroModel kind="waterfall" scale={1.4} />
      {/* Loop 63: mist veil — additive turquoise read without new lights */}
      <mesh position={[0.6, 4.2, 0.8]} rotation={[0, 0.2, 0]}>
        <planeGeometry args={[3.2, 5.5]} />
        <meshBasicMaterial color="#7ee8dc" transparent opacity={0.14} blending={AdditiveBlending} depthWrite={false} side={2} />
      </mesh>
    </group>
  )
}

/**
 * Loop 53: Meshy mesa skyline cluster — distant buttes flanking the horizon.
 * 2 Draco GLB instances; gentle bob for parallax life.
 */
function MesaCluster() {
  const mesas = useRef<(Group | null)[]>([])
  useFrame((state) => {
    const t = state.clock.elapsedTime
    for (let i = 0; i < mesas.current.length; i++) {
      const g = mesas.current[i]
      if (g) g.position.y = (g.userData.y0 as number) + Math.sin(t * 0.32 + i * 2.1) * 0.12
    }
  })
  const placements: [number, number, number, number][] = [
    // x, y0, z, scale
    [18, 4, -28, 1.1],
    [-20, 5, -26, 0.95],
  ]
  return (
    <group>
      {placements.map(([x, y0, z, s], i) => (
        <group
          key={i}
          ref={(g) => {
            mesas.current[i] = g
          }}
          position={[x, y0, z]}
          userData={{ y0 }}
        >
          <HeroModel kind="mesa" scale={s} />
        </group>
      ))}
    </group>
  )
}
