import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending } from 'three'
import type { Group, Mesh, MeshBasicMaterial, MeshStandardMaterial } from 'three'
import { useGameStore } from '@/game/store'
import { getProcTextureKit } from '@/game/proc'
import { ZoneLabel } from '@/game/ZoneLabel'
import { DELTA_BRIDGE, DELTA_CENTER, DELTA_RADIUS, PAD_TOP } from '@/game/world'

const CYAN = '#3dd6c6'
const AMBER = '#f0a830'
const GOLD = '#e8c56a'
const STEEL = '#1a3344'

/** Beam sits east of the spawn→terminal→gate walk line, angled back toward spawn. */
const BEAM_POS: [number, number, number] = [2.7, PAD_TOP, 1.4]
const BEAM_YAW = 0.35

/** Square yard body radii: apothem (half-side) → circumradius for the 4-gon cylinder. */
const SQRT2 = Math.SQRT2
const DELTA_BODY_R = DELTA_RADIUS * SQRT2

/**
 * Wave 23 — Lesson 4 mastery unlocks as real range props.
 * Balance beam: auto-present dual-pan beam on the Alpha pad (auto-present over
 * placeable, same call as the wave-16 rails / wave-21 splitter) — fulcrum +
 * twin pans read as the equation balance at the heart of L4. Delta Balance
 * Yard: walkable axis-aligned square yard northeast of Beta, gold/amber-gold
 * accents so L4 reads distinct from the cyan L2 annex and violet L3 relay.
 * Operator rank insignia lives on the Player mesh itself.
 * Budget: ~34 small meshes, proc textures only, zero new point lights.
 */
export function L4UnlockProps() {
  return (
    <group>
      <BalanceBeamProp />
      <DeltaBalance />
    </group>
  )
}

const POP_STAGGER = 0.085
const POP_DURATION = 0.6
const FLASH_DURATION = 1.45

/** Overshoot ease-out — segments pop past full scale, then settle. */
function easeOutBack(p: number): number {
  const c1 = 1.70158
  const c3 = c1 + 1
  const q = p - 1
  return 1 + c3 * q * q * q + c1 * q * q
}

/** bp.balance.beam — dual-pan balance beam: fulcrum + twin pans = one-step equation balance. */
function BalanceBeamProp() {
  const unlocked = useGameStore((s) => s.hasBalanceBeam)
  const barMats = useRef<(MeshStandardMaterial | null)[]>([])
  const segRefs = useRef<(Group | null)[]>([])
  const beamPivot = useRef<Group>(null)
  const ringRef = useRef<Mesh>(null)
  const ringMat = useRef<MeshBasicMaterial>(null)
  // One-shot materialization FX — fires on a live unlock transition only,
  // deferred until explore so the lesson overlay doesn't eat the beat
  // (same idiom as SplitterProp; HUD flash owns the audio blip).
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

    for (let i = 0; i < barMats.current.length; i++) {
      const m = barMats.current[i]
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

    // Gentle calibration sway — the beam settles level, never tipping to a side
    if (beamPivot.current) beamPivot.current.rotation.z = Math.sin(t * 0.85) * 0.055

    // Additive ring sweeps out past the pans as the emissive flash decays
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
    <group position={BEAM_POS} rotation={[0, BEAM_YAW, 0]}>
      {/* Fulcrum: base plate + tapered post — the pivot both sides balance on */}
      <group
        ref={(g) => {
          segRefs.current[0] = g
        }}
      >
        <mesh position={[0, 0.04, 0]}>
          <cylinderGeometry args={[0.16, 0.22, 0.08, 6]} />
          <meshStandardMaterial color={STEEL} metalness={0.55} roughness={0.45} />
        </mesh>
        <mesh position={[0, 0.38, 0]}>
          <cylinderGeometry args={[0.045, 0.07, 0.6, 6]} />
          <meshStandardMaterial color={STEEL} metalness={0.55} roughness={0.45} />
        </mesh>
      </group>
      {/* Beam + pans ride one pivot so the sway reads as a single balance */}
      <group ref={beamPivot} position={[0, 0.72, 0]}>
        {/* Beam: gold bar + center pivot hub */}
        <group
          ref={(g) => {
            segRefs.current[1] = g
          }}
        >
          <mesh>
            <boxGeometry args={[1.7, 0.05, 0.08]} />
            <meshStandardMaterial
              ref={(m) => {
                barMats.current[0] = m
              }}
              color={GOLD}
              emissive={GOLD}
              emissiveIntensity={0.9}
              metalness={0.3}
              roughness={0.4}
            />
          </mesh>
          <mesh position={[0, 0.02, 0]}>
            <octahedronGeometry args={[0.07, 0]} />
            <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={1.4} metalness={0.3} roughness={0.4} />
          </mesh>
        </group>
        {/* Twin pans: hanger string + pan disc + weight — cyan lhs vs amber rhs */}
        {([[-0.78, CYAN], [0.78, AMBER]] as const).map(([x, color], i) => (
          <group
            key={x}
            ref={(g) => {
              segRefs.current[2 + i] = g
            }}
          >
            <mesh position={[x, -0.14, 0]}>
              <cylinderGeometry args={[0.012, 0.012, 0.28, 4]} />
              <meshStandardMaterial color={STEEL} metalness={0.55} roughness={0.45} />
            </mesh>
            <mesh position={[x, -0.31, 0]}>
              <cylinderGeometry args={[0.16, 0.13, 0.035, 8]} />
              <meshStandardMaterial color={STEEL} metalness={0.55} roughness={0.45} />
            </mesh>
            <mesh position={[x, -0.24, 0]}>
              <octahedronGeometry args={[0.06, 0]} />
              <meshStandardMaterial
                ref={(m) => {
                  barMats.current[1 + i] = m
                }}
                color={color}
                emissive={color}
                emissiveIntensity={0.9}
                metalness={0.3}
                roughness={0.4}
              />
            </mesh>
          </group>
        ))}
      </group>
      {/* Materialization ring — hidden except during the one-shot unlock pop */}
      <mesh ref={ringRef} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[0.9, 1, 56]} />
        <meshBasicMaterial
          ref={ringMat}
          color={GOLD}
          transparent
          opacity={0}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

/** zone.delta.balance — axis-aligned square yard northeast of Beta; walkable via groundHeight. */
function DeltaBalance() {
  const unlocked = useGameStore((s) => s.hasDeltaBalance)
  const { hexPad, panel } = useMemo(() => getProcTextureKit(), [])
  const torusRef = useRef<Mesh>(null)
  const edgeMats = useRef<(MeshStandardMaterial | null)[]>([])
  const markerMat = useRef<MeshStandardMaterial>(null)

  const bridgeX = (DELTA_BRIDGE.x0 + DELTA_BRIDGE.x1) / 2
  const bridgeLen = DELTA_BRIDGE.x1 - DELTA_BRIDGE.x0

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
      <group position={[DELTA_CENTER[0], 0, DELTA_CENTER[1]]}>
        {/* Square pad — 4-sided cylinder, thetaStart π/4 so flat sides face the axes;
            distinct from octagon Alpha/Beta, 45° diamond Annex, hex Gamma */}
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[DELTA_BODY_R, (DELTA_RADIUS + 0.3) * SQRT2, 0.14, 4, 1, false, Math.PI / 4]} />
          <meshStandardMaterial color="#2b2a18" metalness={0.35} roughness={0.55} />
        </mesh>
        <mesh position={[0, 0.13, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[(DELTA_RADIUS - 0.3) * SQRT2, 4, Math.PI / 4]} />
          <meshStandardMaterial map={hexPad} color="#e8d9a8" metalness={0.25} roughness={0.7} />
        </mesh>
        {/* Edge glow bars along the four axis-aligned edges — gold L4 accent */}
        {[0, 1, 2, 3].map((k) => {
          const a = (k * Math.PI) / 2
          return (
            <mesh
              key={k}
              position={[DELTA_RADIUS * Math.sin(a), 0.145, DELTA_RADIUS * Math.cos(a)]}
              rotation={[0, -a, 0]}
            >
              <boxGeometry args={[DELTA_RADIUS * 2 - 0.2, 0.05, 0.07]} />
              <meshStandardMaterial
                ref={(m) => {
                  edgeMats.current[k] = m
                }}
                color={GOLD}
                emissive={GOLD}
                emissiveIntensity={1.1}
              />
            </mesh>
          )
        })}
        {/* Center square marker — same payoff idiom as the Beta pad ring */}
        <mesh position={[0, 0.135, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 4]}>
          <ringGeometry args={[0.7, 0.9, 4]} />
          <meshStandardMaterial
            ref={markerMat}
            color={GOLD}
            emissive={GOLD}
            emissiveIntensity={0.85}
            transparent
            opacity={0.7}
          />
        </mesh>
        {/* Calibration mast — amber spinner + gold beacon tip, clear of the bridge side */}
        <group position={[1.0, 0, -1.0]}>
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
            <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={1.6} />
          </mesh>
        </group>
        {/* Balance rack — mini beam + twin pans echoing the L4 blueprint theme */}
        <group position={[-1.05, 0, 0.95]} rotation={[0, 0.5, 0]}>
          {[-0.45, 0.45].map((x) => (
            <mesh key={x} position={[x, 0.275, 0]}>
              <cylinderGeometry args={[0.035, 0.05, 0.55, 6]} />
              <meshStandardMaterial color={STEEL} metalness={0.55} roughness={0.45} />
            </mesh>
          ))}
          <mesh position={[0, 0.55, 0]}>
            <boxGeometry args={[1.05, 0.05, 0.06]} />
            <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={0.9} />
          </mesh>
          {[-0.38, 0.38].map((x) => (
            <mesh key={x} position={[x, 0.5, 0]}>
              <cylinderGeometry args={[0.09, 0.07, 0.03, 8]} />
              <meshStandardMaterial color={AMBER} emissive={AMBER} emissiveIntensity={0.8} />
            </mesh>
          ))}
        </group>
        <ZoneLabel text="DELTA BALANCE" color={GOLD} y={1.7} />
      </group>

      {/* Walkway slab from the Beta northeast rim to the yard west edge */}
      <group position={[bridgeX, 0, DELTA_BRIDGE.z]}>
        <mesh position={[0, 0.06, 0]}>
          <boxGeometry args={[bridgeLen + 0.3, 0.12, DELTA_BRIDGE.halfWidth * 2]} />
          <meshStandardMaterial map={panel} color="#b8ac8f" metalness={0.4} roughness={0.5} />
        </mesh>
        {[-(DELTA_BRIDGE.halfWidth - 0.06), DELTA_BRIDGE.halfWidth - 0.06].map((z) => (
          <mesh key={z} position={[0, 0.13, z]}>
            <boxGeometry args={[bridgeLen + 0.3, 0.03, 0.07]} />
            <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={0.7} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
