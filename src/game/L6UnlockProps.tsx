import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending } from 'three'
import type { Group, Mesh, MeshBasicMaterial, MeshStandardMaterial } from 'three'
import { useGameStore } from '@/game/store'
import { getProcTextureKit } from '@/game/proc'
import { ZoneLabel } from '@/game/ZoneLabel'
import { PAD_TOP, ZETA_BRIDGE, ZETA_CENTER, ZETA_RADIUS } from '@/game/world'

const CYAN = '#3dd6c6'
const AMBER = '#f0a830'
const ICE = '#7eb8e8'
const STEEL = '#1a3344'

/** Dual mirror panels — southeast of spawn line, clear of L5 calibrator, L4 beam, L3 splitter. */
const MIRROR_POS: [number, number, number] = [2.4, PAD_TOP, -1.5]
const MIRROR_YAW = 0.25

/** Flat-top hex body: apothem → circumradius for 6-gon (flat sides ±X). */
const COS_PI6 = Math.cos(Math.PI / 6)
const ZETA_BODY_R = ZETA_RADIUS / COS_PI6
/**
 * CircleGeometry θ is from +X; CylinderGeometry θ is from +Z (x=r·sinθ, z=r·cosθ).
 * Disc uses π/2 → flat faces ±X. Cylinder uses 0 → same flat faces (not π/2 — that
 * would put vertices on ±X and poke the east skirt past BOUNDS.x).
 */
const HEXA_DISC_THETA = Math.PI / 2
const HEXA_CYL_THETA = 0

/**
 * Wave 27 — Lesson 6 mastery unlocks as real range props.
 * MirrorProp: auto-present dual-facing mirror panels on Alpha (both sides of equation).
 * Zeta Mirror Yard: walkable flat-top hex east of Alpha, ice/silver accents.
 * Vanguard rank insignia lives on the Player mesh itself.
 * Budget: ~40 small meshes, proc textures only, zero new point lights.
 */
export function L6UnlockProps() {
  return (
    <group>
      <MirrorProp />
      <ZetaMirror />
    </group>
  )
}

const POP_STAGGER = 0.085
const POP_DURATION = 0.6
const FLASH_DURATION = 1.45

function easeOutBack(p: number): number {
  const c1 = 1.70158
  const c3 = c1 + 1
  const q = p - 1
  return 1 + c3 * q * q * q + c1 * q * q
}

/** bp.balance.mirror — dual-facing mirror panels: both sides of the equation reflect. */
function MirrorProp() {
  const unlocked = useGameStore((s) => s.hasBalanceMirror)
  const panelMats = useRef<(MeshStandardMaterial | null)[]>([])
  const segRefs = useRef<(Group | null)[]>([])
  const mirrorPivot = useRef<Group>(null)
  const ringRef = useRef<Mesh>(null)
  const ringMat = useRef<MeshBasicMaterial>(null)
  const prev = useRef<boolean | null>(null)
  const pending = useRef(false)
  const start = useRef(-1)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const mode = useGameStore.getState().mode

    if (prev.current === null) {
      prev.current = unlocked
    } else if (unlocked !== prev.current) {
      prev.current = unlocked
      if (unlocked) {
        if (mode === 'lesson') pending.current = true
        else start.current = t
      }
    }
    if (pending.current && mode !== 'lesson' && unlocked) {
      pending.current = false
      start.current = t
    }

    let firing = start.current >= 0
    const popT = firing ? t - start.current : 0
    if (firing && popT > FLASH_DURATION) {
      start.current = -1
      firing = false
    }
    const flash = firing ? Math.max(0, 1 - popT / FLASH_DURATION) : 0

    for (let i = 0; i < panelMats.current.length; i++) {
      const m = panelMats.current[i]
      if (m) m.emissiveIntensity = 0.85 + Math.sin(t * 2.2 - i * 0.7) * 0.3 + flash * 2.4
    }

    for (let i = 0; i < segRefs.current.length; i++) {
      const g = segRefs.current[i]
      if (!g) continue
      if (!firing) {
        if (g.scale.x !== 1) g.scale.setScalar(1)
        continue
      }
      const lp = (popT - i * POP_STAGGER) / POP_DURATION
      if (lp <= 0) g.scale.setScalar(0.001)
      else if (lp >= 1) g.scale.setScalar(1)
      else g.scale.setScalar(Math.max(0.001, easeOutBack(lp)))
    }

    // Gentle mirror sway — panels face each other, slight oscillation
    if (mirrorPivot.current) {
      mirrorPivot.current.rotation.y = Math.sin(t * 0.65) * 0.08
    }

    if (ringRef.current && ringMat.current) {
      const show = firing && flash > 0
      ringRef.current.visible = show
      if (show) {
        const rp = Math.min(popT / FLASH_DURATION, 1)
        ringRef.current.scale.setScalar(0.12 + rp * 1.13)
        ringMat.current.opacity = 0.7 * flash * flash
      }
    }
  })

  if (!unlocked) return null

  return (
    <group position={MIRROR_POS} rotation={[0, MIRROR_YAW, 0]}>
      {/* Base pedestal */}
      <group
        ref={(g) => {
          segRefs.current[0] = g
        }}
      >
        <mesh position={[0, 0.04, 0]}>
          <cylinderGeometry args={[0.2, 0.26, 0.08, 6]} />
          <meshStandardMaterial color={STEEL} metalness={0.55} roughness={0.45} />
        </mesh>
        <mesh position={[0, 0.42, 0]}>
          <cylinderGeometry args={[0.05, 0.08, 0.72, 6]} />
          <meshStandardMaterial color={STEEL} metalness={0.55} roughness={0.45} />
        </mesh>
      </group>
      {/* Twin mirror panels facing each other — lhs cyan / rhs amber through the glass */}
      <group ref={mirrorPivot} position={[0, 0.88, 0]}>
        {([
          [-0.32, CYAN, -0.35],
          [0.32, AMBER, 0.35],
        ] as const).map(([x, tint, yaw], i) => (
          <group
            key={x}
            ref={(g) => {
              segRefs.current[1 + i] = g
            }}
            position={[x, 0, 0]}
            rotation={[0, yaw, 0]}
          >
            {/* Mirror frame */}
            <mesh position={[0, 0.22, 0]}>
              <boxGeometry args={[0.04, 0.48, 0.34]} />
              <meshStandardMaterial color={STEEL} metalness={0.6} roughness={0.4} />
            </mesh>
            {/* Reflective panel — ice glass with equation-side tint */}
            <mesh position={[0, 0.22, 0.02]}>
              <boxGeometry args={[0.02, 0.42, 0.28]} />
              <meshStandardMaterial
                ref={(m) => {
                  panelMats.current[i] = m
                }}
                color={ICE}
                emissive={tint}
                emissiveIntensity={0.75}
                metalness={0.85}
                roughness={0.15}
                transparent
                opacity={0.88}
              />
            </mesh>
            {/* Ice accent strip along the panel rim */}
            <mesh position={[0, 0.44, 0.02]}>
              <boxGeometry args={[0.06, 0.04, 0.3]} />
              <meshStandardMaterial color={ICE} emissive={ICE} emissiveIntensity={1.2} />
            </mesh>
          </group>
        ))}
        {/* Crown beacon — ice tip between the mirrors */}
        <group
          ref={(g) => {
            segRefs.current[3] = g
          }}
        >
          <mesh position={[0, 0.52, 0]}>
            <octahedronGeometry args={[0.09, 0]} />
            <meshStandardMaterial color={ICE} emissive={ICE} emissiveIntensity={1.5} metalness={0.3} roughness={0.4} />
          </mesh>
        </group>
      </group>
      <mesh ref={ringRef} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[0.9, 1, 56]} />
        <meshBasicMaterial
          ref={ringMat}
          color={ICE}
          transparent
          opacity={0}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

/** zone.zeta.mirror — flat-top hex yard east of Alpha; walkable via groundHeight. */
function ZetaMirror() {
  const unlocked = useGameStore((s) => s.hasZetaMirror)
  const { hexPad, panel } = useMemo(() => getProcTextureKit(), [])
  const torusRef = useRef<Mesh>(null)
  const edgeMats = useRef<(MeshStandardMaterial | null)[]>([])
  const markerMat = useRef<MeshStandardMaterial>(null)

  const bridgeX = (ZETA_BRIDGE.x0 + ZETA_BRIDGE.x1) / 2
  const bridgeLen = ZETA_BRIDGE.x1 - ZETA_BRIDGE.x0

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    if (torusRef.current) torusRef.current.rotation.z += delta * 1.5
    for (let i = 0; i < edgeMats.current.length; i++) {
      const m = edgeMats.current[i]
      if (m) m.emissiveIntensity = 1.0 + Math.sin(t * 2.6 - i * 0.85) * 0.35
    }
    if (markerMat.current) markerMat.current.emissiveIntensity = 0.75 + Math.sin(t * 1.8) * 0.25
  })

  if (!unlocked) return null

  return (
    <group>
      <group position={[ZETA_CENTER[0], 0, ZETA_CENTER[1]]}>
        {/* Hex pad — flat sides ±X (flat west toward bridge); cyl θ≠disc θ (Three.js convention) */}
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[ZETA_BODY_R, (ZETA_RADIUS + 0.3) / COS_PI6, 0.14, 6, 1, false, HEXA_CYL_THETA]} />
          <meshStandardMaterial color="#1a2a38" metalness={0.35} roughness={0.55} />
        </mesh>
        <mesh position={[0, 0.13, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[(ZETA_RADIUS - 0.3) / COS_PI6, 6, HEXA_DISC_THETA]} />
          <meshStandardMaterial map={hexPad} color="#c8dff0" metalness={0.25} roughness={0.7} />
        </mesh>
        {/* Edge glow bars at six flat midpoints (walk normals k·π/3) — ice L6 accent */}
        {[0, 1, 2, 3, 4, 5].map((k) => {
          const a = (k * Math.PI) / 3
          const edgeLen = 2 * ZETA_RADIUS * Math.tan(Math.PI / 6)
          return (
            <mesh
              key={k}
              position={[ZETA_RADIUS * Math.cos(a), 0.145, ZETA_RADIUS * Math.sin(a)]}
              rotation={[0, -a + Math.PI / 2, 0]}
            >
              <boxGeometry args={[edgeLen - 0.15, 0.05, 0.07]} />
              <meshStandardMaterial
                ref={(m) => {
                  edgeMats.current[k] = m
                }}
                color={ICE}
                emissive={ICE}
                emissiveIntensity={1.1}
              />
            </mesh>
          )
        })}
        <mesh position={[0, 0.135, 0]} rotation={[-Math.PI / 2, 0, HEXA_DISC_THETA]}>
          <ringGeometry args={[0.65, 0.85, 6]} />
          <meshStandardMaterial
            ref={markerMat}
            color={ICE}
            emissive={ICE}
            emissiveIntensity={0.85}
            transparent
            opacity={0.7}
          />
        </mesh>
        {/* Mirror mast — west side, echoing blueprint theme */}
        <group position={[-1.0, 0, -0.85]}>
          <mesh position={[0, 1.05, 0]}>
            <cylinderGeometry args={[0.05, 0.08, 2.1, 6]} />
            <meshStandardMaterial color={STEEL} metalness={0.55} roughness={0.4} />
          </mesh>
          <mesh ref={torusRef} position={[0, 2.24, 0]} rotation={[Math.PI / 2, 0, 0.2]}>
            <torusGeometry args={[0.3, 0.035, 6, 24]} />
            <meshStandardMaterial color={ICE} emissive={ICE} emissiveIntensity={1.2} transparent opacity={0.9} />
          </mesh>
          <mesh position={[0, 2.62, 0]}>
            <octahedronGeometry args={[0.14, 0]} />
            <meshStandardMaterial color={ICE} emissive={ICE} emissiveIntensity={1.6} />
          </mesh>
        </group>
        {/* Mini mirror rack echoing the balance mirror blueprint */}
        <group position={[1.05, 0, 0.95]} rotation={[0, -0.5, 0]}>
          <mesh position={[0, 0.35, 0]}>
            <cylinderGeometry args={[0.04, 0.06, 0.7, 6]} />
            <meshStandardMaterial color={STEEL} metalness={0.55} roughness={0.45} />
          </mesh>
          {([-0.12, 0.12] as const).map((z) => (
            <mesh key={z} position={[0, 0.55, z]} rotation={[0, z > 0 ? 0.35 : -0.35, 0]}>
              <boxGeometry args={[0.02, 0.32, 0.22]} />
              <meshStandardMaterial color={ICE} emissive={ICE} emissiveIntensity={0.9} metalness={0.8} roughness={0.2} transparent opacity={0.85} />
            </mesh>
          ))}
          <mesh position={[0, 0.78, 0]}>
            <octahedronGeometry args={[0.07, 0]} />
            <meshStandardMaterial color={ICE} emissive={ICE} emissiveIntensity={1.3} />
          </mesh>
        </group>
        <ZoneLabel text="ZETA MIRROR" color={ICE} y={1.7} />
      </group>

      <group position={[bridgeX, 0, ZETA_BRIDGE.z]}>
        <mesh position={[0, 0.06, 0]}>
          <boxGeometry args={[bridgeLen + 0.3, 0.12, ZETA_BRIDGE.halfWidth * 2]} />
          <meshStandardMaterial map={panel} color="#9cb8d4" metalness={0.4} roughness={0.5} />
        </mesh>
        {[-(ZETA_BRIDGE.halfWidth - 0.06), ZETA_BRIDGE.halfWidth - 0.06].map((z) => (
          <mesh key={z} position={[0, 0.13, z]}>
            <boxGeometry args={[bridgeLen + 0.3, 0.03, 0.07]} />
            <meshStandardMaterial color={ICE} emissive={ICE} emissiveIntensity={0.7} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
