import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh, MeshStandardMaterial } from 'three'
import { useGameStore } from '@/game/store'
import { getProcTextureKit } from '@/game/proc'
import { ZoneLabel } from '@/game/ZoneLabel'
import {
  ALPHA_RADIUS,
  ANNEX_BRIDGE,
  ANNEX_CENTER,
  ANNEX_RADIUS,
  PAD_TOP,
} from '@/game/world'

const CYAN = '#3dd6c6'
const AMBER = '#f0a830'
const STEEL = '#1a3344'

/** Rim radius + segment angles chosen to keep the spawn→terminal→gate walk line open. */
const RAIL_R = ALPHA_RADIUS - 0.45
const RAIL_ANGLES = [0.15, 0.95, 1.75, 2.55, 3.35, 5.95] as const

/**
 * Wave 16 — Lesson 2 mastery unlocks as real range props.
 * Rail blueprint: auto-present safety rails on the Alpha pad rim (auto-present
 * over placeable this wave — a second BlueprintGhost slot was heavier than the
 * payoff). Beta Annex: walkable diamond side platform off Zone Beta.
 * Adept rank insignia lives on the Player mesh itself.
 * Budget: ~36 small meshes, proc textures only, zero new point lights.
 */
export function L2UnlockProps() {
  return (
    <group>
      <PadRailProp />
      <BetaAnnex />
    </group>
  )
}

/** bp.pad.rail — slim cyan safety-rail accents ringing the Alpha pad edge. */
function PadRailProp() {
  const unlocked = useGameStore((s) => s.hasRailBlueprint)
  const barMats = useRef<(MeshStandardMaterial | null)[]>([])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    for (let i = 0; i < barMats.current.length; i++) {
      const m = barMats.current[i]
      if (m) m.emissiveIntensity = 0.85 + Math.sin(t * 2.2 - i * 0.7) * 0.3
    }
  })

  if (!unlocked) return null

  return (
    <group>
      {RAIL_ANGLES.map((a, i) => (
        <group
          key={a}
          position={[RAIL_R * Math.cos(a), PAD_TOP, RAIL_R * Math.sin(a)]}
          rotation={[0, -a - Math.PI / 2, 0]}
        >
          {[-0.7, 0.7].map((x) => (
            <mesh key={x} position={[x, 0.31, 0]}>
              <cylinderGeometry args={[0.035, 0.05, 0.62, 6]} />
              <meshStandardMaterial color={STEEL} metalness={0.55} roughness={0.45} />
            </mesh>
          ))}
          <mesh position={[0, 0.62, 0]}>
            <boxGeometry args={[1.5, 0.055, 0.07]} />
            <meshStandardMaterial
              ref={(m) => {
                barMats.current[i] = m
              }}
              color={CYAN}
              emissive={CYAN}
              emissiveIntensity={0.9}
              metalness={0.3}
              roughness={0.4}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** zone.beta.annex — diamond side platform east of Beta; walkable via groundHeight. */
function BetaAnnex() {
  const unlocked = useGameStore((s) => s.hasBetaAnnex)
  const { hexPad, panel } = useMemo(() => getProcTextureKit(), [])
  const torusRef = useRef<Mesh>(null)
  const edgeMats = useRef<(MeshStandardMaterial | null)[]>([])
  const markerMat = useRef<MeshStandardMaterial>(null)

  const bridgeX = (ANNEX_BRIDGE.x0 + ANNEX_BRIDGE.x1) / 2
  const bridgeLen = ANNEX_BRIDGE.x1 - ANNEX_BRIDGE.x0

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    if (torusRef.current) torusRef.current.rotation.z += delta * 1.4
    for (let i = 0; i < edgeMats.current.length; i++) {
      const m = edgeMats.current[i]
      if (m) m.emissiveIntensity = 1.0 + Math.sin(t * 2.6 - i * 1.3) * 0.35
    }
    if (markerMat.current) markerMat.current.emissiveIntensity = 0.75 + Math.sin(t * 1.8) * 0.25
  })

  if (!unlocked) return null

  return (
    <group>
      <group position={[ANNEX_CENTER[0], 0, ANNEX_CENTER[1]]}>
        {/* Diamond pad — 4-sided cylinder reads distinct from octagonal Alpha/Beta */}
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[ANNEX_RADIUS, ANNEX_RADIUS + 0.3, 0.14, 4]} />
          <meshStandardMaterial color="#123042" metalness={0.35} roughness={0.55} />
        </mesh>
        <mesh position={[0, 0.13, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[ANNEX_RADIUS - 0.3, 4]} />
          <meshStandardMaterial map={hexPad} color="#9fd9d4" metalness={0.25} roughness={0.7} />
        </mesh>
        {/* Edge glow bars along the four diamond edges */}
        {[0, 1, 2, 3].map((k) => {
          const phi = Math.PI / 4 + (k * Math.PI) / 2
          const d = ANNEX_RADIUS * Math.SQRT1_2
          return (
            <mesh
              key={k}
              position={[d * Math.cos(phi), 0.145, d * Math.sin(phi)]}
              rotation={[0, -(phi + Math.PI / 2), 0]}
            >
              <boxGeometry args={[ANNEX_RADIUS * Math.SQRT2 - 0.2, 0.05, 0.07]} />
              <meshStandardMaterial
                ref={(m) => {
                  edgeMats.current[k] = m
                }}
                color={CYAN}
                emissive={CYAN}
                emissiveIntensity={1.1}
              />
            </mesh>
          )
        })}
        {/* Center diamond marker — same payoff idiom as the Beta pad ring */}
        <mesh position={[0, 0.135, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 4]}>
          <ringGeometry args={[0.7, 0.9, 4]} />
          <meshStandardMaterial
            ref={markerMat}
            color={CYAN}
            emissive={CYAN}
            emissiveIntensity={0.85}
            transparent
            opacity={0.7}
          />
        </mesh>
        {/* Beacon pylon — amber spinner so the annex reads from across the range */}
        <group position={[1.1, 0, -1.1]}>
          <mesh position={[0, 0.75, 0]}>
            <cylinderGeometry args={[0.05, 0.08, 1.5, 6]} />
            <meshStandardMaterial color={STEEL} metalness={0.55} roughness={0.4} />
          </mesh>
          <mesh ref={torusRef} position={[0, 1.62, 0]} rotation={[Math.PI / 2, 0, 0.2]}>
            <torusGeometry args={[0.26, 0.035, 6, 24]} />
            <meshStandardMaterial color={AMBER} emissive={AMBER} emissiveIntensity={1.2} transparent opacity={0.9} />
          </mesh>
        </group>
        {/* Rail-fit training rack — echoes the L2 rail blueprint theme */}
        <group position={[-1.0, 0, 0.8]} rotation={[0, 0.5, 0]}>
          {[-0.55, 0.55].map((x) => (
            <mesh key={x} position={[x, 0.275, 0]}>
              <cylinderGeometry args={[0.035, 0.05, 0.55, 6]} />
              <meshStandardMaterial color={STEEL} metalness={0.55} roughness={0.45} />
            </mesh>
          ))}
          <mesh position={[0, 0.55, 0]}>
            <boxGeometry args={[1.2, 0.05, 0.07]} />
            <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={0.9} />
          </mesh>
        </group>
        <ZoneLabel text="BETA ANNEX" color={CYAN} y={1.7} />
      </group>

      {/* Walkway slab from the Beta rim to the annex west vertex */}
      <group position={[bridgeX, 0, ANNEX_BRIDGE.z]}>
        <mesh position={[0, 0.06, 0]}>
          <boxGeometry args={[bridgeLen + 0.3, 0.12, ANNEX_BRIDGE.halfWidth * 2]} />
          <meshStandardMaterial map={panel} color="#8fb8b4" metalness={0.4} roughness={0.5} />
        </mesh>
        {[-(ANNEX_BRIDGE.halfWidth - 0.06), ANNEX_BRIDGE.halfWidth - 0.06].map((z) => (
          <mesh key={z} position={[0, 0.13, z]}>
            <boxGeometry args={[bridgeLen + 0.3, 0.03, 0.07]} />
            <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={0.7} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
