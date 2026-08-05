import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending } from 'three'
import type { Group, Mesh, MeshBasicMaterial, MeshStandardMaterial } from 'three'
import { useGameStore } from '@/game/store'
import { getProcTextureKit } from '@/game/proc'
import { ZoneLabel } from '@/game/ZoneLabel'
import { EPSILON_BRIDGE, EPSILON_CENTER, EPSILON_RADIUS, PAD_TOP } from '@/game/world'

const CYAN = '#3dd6c6'
const AMBER = '#f0a830'
const MINT = '#5ecf9a'
const STEEL = '#1a3344'

/** Dual-dial calibrator — west of walk line, clear of L4 beam [2.7,1.4] and L3 splitter [-2.4,-1.6]. */
const CAL_POS: [number, number, number] = [-2.8, PAD_TOP, 1.2]
const CAL_YAW = -0.4

/** Pentagon body: apothem → circumradius for 5-gon cylinder (flat side east). */
const COS_PI5 = Math.cos(Math.PI / 5)
const EPSILON_BODY_R = EPSILON_RADIUS / COS_PI5
/** thetaStart so a flat side faces +X (east / bridge). Midpoint between verts at ±π/5. */
const PENTA_THETA = Math.PI / 5

/**
 * Wave 25 — Lesson 5 mastery unlocks as real range props.
 * Calibrator: auto-present dual-dial tower on Alpha (two inverse steps).
 * Epsilon Calibration Forge: walkable pentagon NW of Beta, mint accents.
 * Chief rank insignia lives on the Player mesh itself.
 * Budget: ~36 small meshes, proc textures only, zero new point lights.
 */
export function L5UnlockProps() {
  return (
    <group>
      <CalibratorProp />
      <EpsilonCal />
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

/** bp.balance.calibrator — dual-dial calibrator: two stacked dials = two-step inverse order. */
function CalibratorProp() {
  const unlocked = useGameStore((s) => s.hasBalanceCalibrator)
  const dialMats = useRef<(MeshStandardMaterial | null)[]>([])
  const segRefs = useRef<(Group | null)[]>([])
  const dialPivot = useRef<Group>(null)
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

    for (let i = 0; i < dialMats.current.length; i++) {
      const m = dialMats.current[i]
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

    // Counter-rotating dials — two calibration steps settling in opposite phase
    if (dialPivot.current) {
      dialPivot.current.rotation.y = Math.sin(t * 0.7) * 0.12
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
    <group position={CAL_POS} rotation={[0, CAL_YAW, 0]}>
      <group
        ref={(g) => {
          segRefs.current[0] = g
        }}
      >
        <mesh position={[0, 0.04, 0]}>
          <cylinderGeometry args={[0.18, 0.24, 0.08, 6]} />
          <meshStandardMaterial color={STEEL} metalness={0.55} roughness={0.45} />
        </mesh>
        <mesh position={[0, 0.42, 0]}>
          <cylinderGeometry args={[0.05, 0.08, 0.7, 6]} />
          <meshStandardMaterial color={STEEL} metalness={0.55} roughness={0.45} />
        </mesh>
      </group>
      <group ref={dialPivot} position={[0, 0.85, 0]}>
        {/* Lower dial — cyan step 1 (undo add/sub) */}
        <group
          ref={(g) => {
            segRefs.current[1] = g
          }}
        >
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.22, 0.045, 6, 20]} />
            <meshStandardMaterial
              ref={(m) => {
                dialMats.current[0] = m
              }}
              color={CYAN}
              emissive={CYAN}
              emissiveIntensity={0.9}
              metalness={0.3}
              roughness={0.4}
            />
          </mesh>
          <mesh position={[0.22, 0, 0]}>
            <boxGeometry args={[0.08, 0.04, 0.04]} />
            <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={1.2} />
          </mesh>
        </group>
        {/* Upper dial — amber step 2 (mult/div) */}
        <group
          ref={(g) => {
            segRefs.current[2] = g
          }}
          position={[0, 0.28, 0]}
        >
          <mesh rotation={[Math.PI / 2, 0, 0.4]}>
            <torusGeometry args={[0.18, 0.04, 6, 20]} />
            <meshStandardMaterial
              ref={(m) => {
                dialMats.current[1] = m
              }}
              color={AMBER}
              emissive={AMBER}
              emissiveIntensity={0.9}
              metalness={0.3}
              roughness={0.4}
            />
          </mesh>
          <mesh position={[0.18, 0, 0]} rotation={[0, 0, 0.4]}>
            <boxGeometry args={[0.07, 0.035, 0.035]} />
            <meshStandardMaterial color={AMBER} emissive={AMBER} emissiveIntensity={1.2} />
          </mesh>
        </group>
        {/* Mint beacon tip — L5 accent on the calibrator crown */}
        <group
          ref={(g) => {
            segRefs.current[3] = g
          }}
        >
          <mesh position={[0, 0.52, 0]}>
            <octahedronGeometry args={[0.09, 0]} />
            <meshStandardMaterial color={MINT} emissive={MINT} emissiveIntensity={1.5} metalness={0.3} roughness={0.4} />
          </mesh>
        </group>
      </group>
      <mesh ref={ringRef} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[0.9, 1, 56]} />
        <meshBasicMaterial
          ref={ringMat}
          color={MINT}
          transparent
          opacity={0}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

/** zone.epsilon.cal — pentagon forge NW of Beta; walkable via groundHeight. */
function EpsilonCal() {
  const unlocked = useGameStore((s) => s.hasEpsilonCal)
  const { hexPad, panel } = useMemo(() => getProcTextureKit(), [])
  const torusRef = useRef<Mesh>(null)
  const edgeMats = useRef<(MeshStandardMaterial | null)[]>([])
  const markerMat = useRef<MeshStandardMaterial>(null)

  const bridgeX = (EPSILON_BRIDGE.x0 + EPSILON_BRIDGE.x1) / 2
  const bridgeLen = EPSILON_BRIDGE.x1 - EPSILON_BRIDGE.x0

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
      <group position={[EPSILON_CENTER[0], 0, EPSILON_CENTER[1]]}>
        {/* Pentagon pad — flat side east toward the bridge */}
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[EPSILON_BODY_R, (EPSILON_RADIUS + 0.3) / COS_PI5, 0.14, 5, 1, false, PENTA_THETA]} />
          <meshStandardMaterial color="#1a2e24" metalness={0.35} roughness={0.55} />
        </mesh>
        <mesh position={[0, 0.13, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[(EPSILON_RADIUS - 0.3) / COS_PI5, 5, PENTA_THETA]} />
          <meshStandardMaterial map={hexPad} color="#b8e8d0" metalness={0.25} roughness={0.7} />
        </mesh>
        {/* Edge glow bars at five flat midpoints — mint L5 accent */}
        {[0, 1, 2, 3, 4].map((k) => {
          const a = (k * 2 * Math.PI) / 5
          const edgeLen = 2 * EPSILON_RADIUS * Math.tan(Math.PI / 5)
          return (
            <mesh
              key={k}
              position={[EPSILON_RADIUS * Math.cos(a), 0.145, EPSILON_RADIUS * Math.sin(a)]}
              rotation={[0, -a + Math.PI / 2, 0]}
            >
              <boxGeometry args={[edgeLen - 0.15, 0.05, 0.07]} />
              <meshStandardMaterial
                ref={(m) => {
                  edgeMats.current[k] = m
                }}
                color={MINT}
                emissive={MINT}
                emissiveIntensity={1.1}
              />
            </mesh>
          )
        })}
        <mesh position={[0, 0.135, 0]} rotation={[-Math.PI / 2, 0, PENTA_THETA]}>
          <ringGeometry args={[0.65, 0.85, 5]} />
          <meshStandardMaterial
            ref={markerMat}
            color={MINT}
            emissive={MINT}
            emissiveIntensity={0.85}
            transparent
            opacity={0.7}
          />
        </mesh>
        {/* Calibration mast */}
        <group position={[-1.0, 0, -1.0]}>
          <mesh position={[0, 1.05, 0]}>
            <cylinderGeometry args={[0.05, 0.08, 2.1, 6]} />
            <meshStandardMaterial color={STEEL} metalness={0.55} roughness={0.4} />
          </mesh>
          <mesh ref={torusRef} position={[0, 2.24, 0]} rotation={[Math.PI / 2, 0, 0.2]}>
            <torusGeometry args={[0.3, 0.035, 6, 24]} />
            <meshStandardMaterial color={AMBER} emissive={AMBER} emissiveIntensity={1.2} transparent opacity={0.9} />
          </mesh>
          <mesh position={[0, 2.62, 0]}>
            <octahedronGeometry args={[0.14, 0]} />
            <meshStandardMaterial color={MINT} emissive={MINT} emissiveIntensity={1.6} />
          </mesh>
        </group>
        {/* Mini dual-dial rack echoing the calibrator blueprint */}
        <group position={[1.05, 0, 0.95]} rotation={[0, -0.5, 0]}>
          <mesh position={[0, 0.35, 0]}>
            <cylinderGeometry args={[0.04, 0.06, 0.7, 6]} />
            <meshStandardMaterial color={STEEL} metalness={0.55} roughness={0.45} />
          </mesh>
          <mesh position={[0, 0.55, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.14, 0.03, 6, 16]} />
            <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={0.9} />
          </mesh>
          <mesh position={[0, 0.78, 0]} rotation={[Math.PI / 2, 0, 0.3]}>
            <torusGeometry args={[0.11, 0.025, 6, 16]} />
            <meshStandardMaterial color={AMBER} emissive={AMBER} emissiveIntensity={0.9} />
          </mesh>
        </group>
        <ZoneLabel text="EPSILON CAL" color={MINT} y={1.7} />
      </group>

      <group position={[bridgeX, 0, EPSILON_BRIDGE.z]}>
        <mesh position={[0, 0.06, 0]}>
          <boxGeometry args={[bridgeLen + 0.3, 0.12, EPSILON_BRIDGE.halfWidth * 2]} />
          <meshStandardMaterial map={panel} color="#8fbc9f" metalness={0.4} roughness={0.5} />
        </mesh>
        {[-(EPSILON_BRIDGE.halfWidth - 0.06), EPSILON_BRIDGE.halfWidth - 0.06].map((z) => (
          <mesh key={z} position={[0, 0.13, z]}>
            <boxGeometry args={[bridgeLen + 0.3, 0.03, 0.07]} />
            <meshStandardMaterial color={MINT} emissive={MINT} emissiveIntensity={0.7} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
