import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending } from 'three'
import type { Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, PointLight } from 'three'
import { playBlip } from '@/game/audio'
import { useGameStore } from '@/game/store'
import { PAD_TOP, rig } from '@/game/world'

const GHOST_RANGE = 2.6
const PAD_CLAMP = 4.4
const CYAN = '#3dd6c6'

/** easeOutBack — placement pop that overshoots then settles, Fortnite build-feel. */
function easeOutBack(p: number): number {
  const c = 1.70158
  const q = p - 1
  return 1 + (c + 1) * q * q * q + c * q * q
}

const CORNERS: [number, number][] = [
  [-1.05, -1.05],
  [1.05, -1.05],
  [-1.05, 1.05],
  [1.05, 1.05],
]

export function BlueprintGhost() {
  const mode = useGameStore((s) => s.mode)
  const hasBlueprint = useGameStore((s) => s.hasBlueprint)
  const blueprintPlaced = useGameStore((s) => s.blueprintPlaced)
  const blueprintPosition = useGameStore((s) => s.blueprintPosition)
  const placeNonce = useGameStore((s) => s.placeNonce)

  const ghostRef = useRef<Group>(null)
  const ghostMat = useRef<MeshStandardMaterial>(null)

  const popRef = useRef<Group>(null)
  const baseMat = useRef<MeshStandardMaterial>(null)
  const rampMat = useRef<MeshStandardMaterial>(null)
  const waveRef = useRef<Mesh>(null)
  const waveMat = useRef<MeshBasicMaterial>(null)
  const placeLight = useRef<PointLight>(null)
  const placeStart = useRef<number | null>(null)
  const placeDone = useRef(false)

  useEffect(() => {
    if (placeNonce === 0) return
    const s = useGameStore.getState()
    if (s.mode !== 'build' || s.blueprintPlaced || !s.hasBlueprint) return
    playBlip('place')
    s.placeBlueprint([rig.ghostPos.x, PAD_TOP, rig.ghostPos.z])
  }, [placeNonce])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const ghost = ghostRef.current
    if (ghost && mode === 'build') {
      const yaw = useGameStore.getState().playerYaw
      let gx = rig.playerPos.x + -Math.sin(yaw) * GHOST_RANGE
      let gz = rig.playerPos.z + -Math.cos(yaw) * GHOST_RANGE
      gx = Math.round(gx * 2) / 2
      gz = Math.round(gz * 2) / 2
      const len = Math.hypot(gx, gz)
      if (len > PAD_CLAMP) {
        gx = (gx / len) * PAD_CLAMP
        gz = (gz / len) * PAD_CLAMP
      }
      rig.ghostPos.set(gx, PAD_TOP, gz)
      ghost.position.set(gx, PAD_TOP, gz)
      if (ghostMat.current) {
        ghostMat.current.emissiveIntensity = 0.9 + Math.sin(t * 4) * 0.35
      }
    }

    // One-shot placement payoff: pop scale + emissive flash + shockwave ring
    if (blueprintPlaced && !placeDone.current && popRef.current) {
      if (placeStart.current === null) placeStart.current = t
      const p = (t - placeStart.current) / 0.7
      if (p >= 1) {
        placeDone.current = true
        popRef.current.scale.set(1, 1, 1)
        if (baseMat.current) baseMat.current.emissiveIntensity = 0.25
        if (rampMat.current) rampMat.current.emissiveIntensity = 0.4
        if (waveRef.current) waveRef.current.visible = false
        if (placeLight.current) placeLight.current.intensity = 0
        return
      }
      const s = 0.55 + 0.45 * easeOutBack(Math.min(1, p * 1.4))
      popRef.current.scale.set(s, s, s)
      const flash = Math.max(0, 1 - p)
      if (baseMat.current) baseMat.current.emissiveIntensity = 0.25 + flash * 2.4
      if (rampMat.current) rampMat.current.emissiveIntensity = 0.4 + flash * 2.2
      if (waveRef.current && waveMat.current) {
        const w = 1.1 + p * 2.4
        waveRef.current.scale.set(w, w, w)
        waveMat.current.opacity = 0.85 * (1 - p)
      }
      if (placeLight.current) placeLight.current.intensity = flash * 9
    }
  })

  const showGhost = mode === 'build' && hasBlueprint && !blueprintPlaced

  return (
    <>
      {showGhost && (
        <group ref={ghostRef} position={[0, PAD_TOP, 0]}>
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[2.3, 0.2, 2.3]} />
            <meshStandardMaterial
              ref={ghostMat}
              color={CYAN}
              emissive={CYAN}
              emissiveIntensity={1}
              transparent
              opacity={0.42}
              depthWrite={false}
            />
          </mesh>
          <mesh position={[0, 0.3, -0.45]} rotation={[-0.5, 0, 0]}>
            <boxGeometry args={[2.3, 0.12, 1.5]} />
            <meshStandardMaterial
              color={CYAN}
              emissive={CYAN}
              emissiveIntensity={0.6}
              transparent
              opacity={0.3}
              depthWrite={false}
            />
          </mesh>
          {/* Footprint outline + corner brackets read as a buildable piece */}
          <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 4]}>
            <ringGeometry args={[1.52, 1.64, 4]} />
            <meshBasicMaterial color={CYAN} transparent opacity={0.65} blending={AdditiveBlending} depthWrite={false} />
          </mesh>
          {CORNERS.map(([x, z], i) => (
            <mesh key={i} position={[x, 0.24, z]}>
              <boxGeometry args={[0.16, 0.34, 0.16]} />
              <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={1.5} transparent opacity={0.8} />
            </mesh>
          ))}
        </group>
      )}

      {blueprintPlaced && blueprintPosition && (
        <group position={blueprintPosition}>
          <group ref={popRef}>
            <mesh position={[0, 0.1, 0]}>
              <boxGeometry args={[2.3, 0.2, 2.3]} />
              <meshStandardMaterial ref={baseMat} color="#1a4a5c" emissive={CYAN} emissiveIntensity={0.25} roughness={0.5} metalness={0.35} />
            </mesh>
            <mesh position={[0, 0.3, -0.45]} rotation={[-0.5, 0, 0]}>
              <boxGeometry args={[2.3, 0.12, 1.5]} />
              <meshStandardMaterial ref={rampMat} color="#226078" emissive={CYAN} emissiveIntensity={0.4} roughness={0.45} metalness={0.35} />
            </mesh>
            <mesh position={[0, 0.215, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.95, 1.08, 40]} />
              <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={0.9} transparent opacity={0.85} />
            </mesh>
          </group>
          {/* Placement shockwave + light pulse */}
          <mesh ref={waveRef} position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.9, 1, 40]} />
            <meshBasicMaterial ref={waveMat} color={CYAN} transparent opacity={0.85} blending={AdditiveBlending} depthWrite={false} />
          </mesh>
          <pointLight ref={placeLight} position={[0, 1.2, 0]} color={CYAN} intensity={0} distance={7} decay={2} />
        </group>
      )}
    </>
  )
}
