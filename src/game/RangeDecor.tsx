import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending } from 'three'
import type { Mesh, MeshBasicMaterial, MeshStandardMaterial } from 'three'
import { ALPHA_RADIUS, PAD_TOP, TERMINAL_POS } from '@/game/world'
import { getProcTextureKit, makeHazardStripeTexture } from '@/game/proc'

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
      <GroundBreakup />
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
      <CableTrunks />
      <HazardStripes />
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
            <mesh position={[0, 0.037, 0]}>
              <boxGeometry args={[0.5, 0.05, len]} />
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
          <mesh position={[0, 1.4, 0]}>
            <cylinderGeometry args={[0.06, 0.09, 2.8, 6]} />
            <meshStandardMaterial color={STEEL} metalness={0.55} roughness={0.4} />
          </mesh>
          <mesh position={[0, 2.85, 0]}>
            <boxGeometry args={[0.28, 0.12, 0.28]} />
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
          <mesh key={i} position={[mx, PAD_TOP + 0.02, mz]} rotation={[0, rot, 0]}>
            <boxGeometry args={[0.07, 0.03, len]} />
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

function AntennaDishes() {
  const tips = useRef<(MeshStandardMaterial | null)[]>([])
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
          <mesh position={[0, 1.1, 0]}>
            <cylinderGeometry args={[0.08, 0.12, 2.2, 6]} />
            <meshStandardMaterial color={STEEL} metalness={0.55} roughness={0.4} />
          </mesh>
          <mesh position={[0, 2.3, 0.15]} rotation={[0.85 + tilt, 0.3, 0]}>
            <sphereGeometry args={[0.55, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.45]} />
            <meshStandardMaterial color="#163040" metalness={0.6} roughness={0.35} side={2} />
          </mesh>
          <mesh position={[0, 2.55, 0.35]}>
            <sphereGeometry args={[0.06, 6, 6]} />
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
      ))}
    </group>
  )
}

function SupplyCrates() {
  const crates = useMemo(
    () =>
      [
        [-5.2, 6.1, 0.35],
        [-4.4, 6.6, -0.2],
        [5.8, 5.4, 0.55],
        [6.4, -2.2, 0.1],
        [-6.1, -5.5, 0.4],
        [2.8, 6.8, 0.2],
        [-2.2, -4.8, -0.3],
      ] as [number, number, number][],
    [],
  )
  return (
    <group>
      {crates.map(([x, z, rot], i) => (
        <group key={i} position={[x, surfaceY(x, z) + 0.32, z]} rotation={[0, rot, 0]}>
          <mesh>
            <boxGeometry args={[0.7, 0.55, 0.7]} />
            <meshStandardMaterial color="#152836" metalness={0.35} roughness={0.55} />
          </mesh>
          <mesh position={[0, 0.29, 0]}>
            <boxGeometry args={[0.72, 0.04, 0.72]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? CYAN : AMBER}
              emissive={i % 2 === 0 ? CYAN : AMBER}
              emissiveIntensity={0.45}
            />
          </mesh>
          <mesh position={[0, 0, 0.36]}>
            <boxGeometry args={[0.35, 0.08, 0.02]} />
            <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={0.7} />
          </mesh>
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
  ]
  return (
    <group>
      {spires.map(([x, z, h, w], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, h / 2, 0]}>
            <boxGeometry args={[w, h, w]} />
            <meshStandardMaterial color="#0e1c28" metalness={0.2} roughness={0.85} transparent opacity={0.85} />
          </mesh>
          <mesh position={[0, h + 0.4, 0]}>
            <boxGeometry args={[w * 0.35, 0.8, w * 0.35]} />
            <meshStandardMaterial
              color={i % 3 === 0 ? AMBER : CYAN}
              emissive={i % 3 === 0 ? AMBER : CYAN}
              emissiveIntensity={0.9}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}
