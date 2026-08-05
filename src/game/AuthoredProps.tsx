import { useMemo } from 'react'
import { ALPHA_RADIUS, PAD_TOP } from '@/game/world'
import { getAuthoredGeoKit, makeSteelPlateTexture, makeStencilDecalTexture } from '@/game/proc'

const CYAN = '#3dd6c6'
const AMBER = '#f0a830'
const STEEL = '#1a3344'

function surfaceY(x: number, z: number) {
  return x * x + z * z <= ALPHA_RADIUS * ALPHA_RADIUS ? PAD_TOP : 0
}

/**
 * Wave 17 hero prop — terminal-flank equipment rack. Carcass, blade stack,
 * and plinth are authored bevel-extruded panels with real edge trim (not
 * boxes); vent bezel, per-blade status strips, conduit stub, and a top
 * status dome finish the silhouette. Replaces the wave-16 ServiceJunction
 * at the same two vetted, off-walk-line placements.
 */
function EquipmentRack({ x, z, rot = 0 }: { x: number; z: number; rot?: number }) {
  const { rackCarcass, rackBlade, rackPlinth } = useMemo(() => getAuthoredGeoKit(), [])
  const steel = useMemo(() => makeSteelPlateTexture(256), [])
  const y = surfaceY(x, z)

  return (
    <group position={[x, y, z]} rotation={[0, rot, 0]}>
      {/* Beveled plinth slab */}
      <mesh geometry={rackPlinth} position={[0, 0.07, 0]}>
        <meshStandardMaterial color={STEEL} metalness={0.55} roughness={0.42} />
      </mesh>
      {/* Beveled carcass — steel plate bake reads as one stamped panel per face */}
      <mesh geometry={rackCarcass} position={[0, 0.7, 0]}>
        <meshStandardMaterial map={steel} color="#8fb8b4" metalness={0.48} roughness={0.44} />
      </mesh>
      {/* Slide-in blade stack, proud of the carcass front */}
      {([0.52, 0.78, 1.04] as const).map((by, i) => (
        <group key={by} position={[0, by, 0.074]}>
          <mesh geometry={rackBlade}>
            <meshStandardMaterial color={i === 1 ? '#26454f' : '#1e3a48'} metalness={0.5} roughness={0.42} />
          </mesh>
          <mesh position={[0.27, 0, 0.252]}>
            <boxGeometry args={[0.09, 0.028, 0.012]} />
            <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={0.6} />
          </mesh>
          {i === 1 && (
            <mesh position={[-0.28, 0, 0.252]}>
              <boxGeometry args={[0.05, 0.045, 0.012]} />
              <meshStandardMaterial color={AMBER} emissive={AMBER} emissiveIntensity={0.55} />
            </mesh>
          )}
        </group>
      ))}
      {/* Vent bezel below the blade stack */}
      <mesh position={[0, 0.28, 0.284]}>
        <boxGeometry args={[0.64, 0.18, 0.014]} />
        <meshStandardMaterial color="#0a1822" metalness={0.3} roughness={0.6} />
      </mesh>
      {/* Side conduit stub + flange ring */}
      <mesh position={[-0.54, 0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.055, 0.065, 0.22, 8]} />
        <meshStandardMaterial color="#1e3a4a" metalness={0.5} roughness={0.45} />
      </mesh>
      <mesh position={[-0.66, 0.5, 0]}>
        <torusGeometry args={[0.07, 0.012, 6, 16]} />
        <meshStandardMaterial color="#3d6a7a" metalness={0.55} roughness={0.4} />
      </mesh>
      {/* Top status dome */}
      <mesh position={[0.3, 1.31, 0]}>
        <sphereGeometry args={[0.045, 8, 8]} />
        <meshStandardMaterial color={AMBER} emissive={AMBER} emissiveIntensity={0.7} />
      </mesh>
    </group>
  )
}

/** Duct coupling with flange rings and bolt ears — reads as HVAC hardware, not a bare cylinder. */
function DuctCoupling({ x, z, rot = 0, len = 1.4 }: { x: number; z: number; rot?: number; len?: number }) {
  const steel = useMemo(() => makeSteelPlateTexture(256), [])
  const y = surfaceY(x, z)

  return (
    <group position={[x, y, z]} rotation={[0, rot, 0]}>
      <mesh position={[0, 0.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.14, 0.14, len, 10]} />
        <meshStandardMaterial map={steel} color="#7a9ea8" metalness={0.58} roughness={0.4} />
      </mesh>
      {([-len / 2 + 0.06, len / 2 - 0.06] as const).map((pz, i) => (
        <group key={i} position={[0, 0.18, pz]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.17, 0.022, 6, 20]} />
            <meshStandardMaterial color="#2a5060" metalness={0.62} roughness={0.35} />
          </mesh>
          {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((a, j) => (
            <mesh key={j} position={[Math.cos(a) * 0.19, 0, Math.sin(a) * 0.19]} rotation={[Math.PI / 2, 0, a]}>
              <boxGeometry args={[0.04, 0.03, 0.06]} />
              <meshStandardMaterial color="#3d7a8a" metalness={0.5} roughness={0.42} />
            </mesh>
          ))}
        </group>
      ))}
      <mesh position={[0, 0.32, 0]}>
        <boxGeometry args={[0.12, 0.06, 0.12]} />
        <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={0.4} />
      </mesh>
    </group>
  )
}

/** Cargo crate with stencil decal face — richer silhouette than RangeDecor supply crates. */
function StenciledCrate({ x, z, rot = 0 }: { x: number; z: number; rot?: number }) {
  const decal = useMemo(() => makeStencilDecalTexture(128, 128), [])
  const y = surfaceY(x, z)

  return (
    <group position={[x, y + 0.34, z]} rotation={[0, rot, 0]}>
      <mesh>
        <boxGeometry args={[0.78, 0.58, 0.78]} />
        <meshStandardMaterial color="#152836" metalness={0.38} roughness={0.52} />
      </mesh>
      <mesh position={[0, 0.02, 0.4]}>
        <planeGeometry args={[0.42, 0.42]} />
        <meshStandardMaterial map={decal} transparent opacity={0.92} />
      </mesh>
      <mesh position={[0, 0.31, 0]}>
        <boxGeometry args={[0.8, 0.05, 0.8]} />
        <meshStandardMaterial color={STEEL} metalness={0.5} roughness={0.45} />
      </mesh>
      {/* Strap rivets */}
      {([-0.28, 0.28] as const).map((sx) => (
        <mesh key={sx} position={[sx, 0, 0]}>
          <boxGeometry args={[0.06, 0.6, 0.8]} />
          <meshStandardMaterial color="#243848" metalness={0.45} roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, 0.34, 0]}>
        <boxGeometry args={[0.18, 0.08, 0.18]} />
        <meshStandardMaterial color={AMBER} emissive={AMBER} emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
}

/**
 * Authored mid-field props with proc decals. Wave 17 swaps the box-kit
 * ServiceJunction for beveled EquipmentRacks; duct couplings and stenciled
 * crates carry over.
 * Budget: ~42 meshes, shared lathe/extrude geometry kit, canvas bakes shared
 * per type, 0 lights, 0 useFrame.
 */
export function AuthoredProps() {
  return (
    <group>
      <EquipmentRack x={-6.8} z={-1.2} rot={0.35} />
      <EquipmentRack x={7.1} z={-3.8} rot={-0.5} />
      <DuctCoupling x={-3.6} z={-5.4} rot={0.15} len={1.6} />
      <DuctCoupling x={3.8} z={-7.2} rot={-0.2} len={1.2} />
      <StenciledCrate x={-7.4} z={5.8} rot={0.6} />
      <StenciledCrate x={6.2} z={-8.5} rot={-0.35} />
    </group>
  )
}
