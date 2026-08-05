import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, MeshStandardMaterial } from 'three'
import { useGameStore } from '@/game/store'
import { PAD_TOP, rig } from '@/game/world'

const GHOST_RANGE = 2.6
const PAD_CLAMP = 4.4

export function BlueprintGhost() {
  const mode = useGameStore((s) => s.mode)
  const hasBlueprint = useGameStore((s) => s.hasBlueprint)
  const blueprintPlaced = useGameStore((s) => s.blueprintPlaced)
  const blueprintPosition = useGameStore((s) => s.blueprintPosition)
  const placeNonce = useGameStore((s) => s.placeNonce)

  const ghostRef = useRef<Group>(null)
  const ghostMat = useRef<MeshStandardMaterial>(null)

  useEffect(() => {
    if (placeNonce === 0) return
    const s = useGameStore.getState()
    if (s.mode !== 'build' || s.blueprintPlaced || !s.hasBlueprint) return
    s.placeBlueprint([rig.ghostPos.x, PAD_TOP, rig.ghostPos.z])
  }, [placeNonce])

  useFrame((state) => {
    const ghost = ghostRef.current
    if (!ghost || mode !== 'build') return
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
      ghostMat.current.emissiveIntensity = 0.9 + Math.sin(state.clock.elapsedTime * 4) * 0.35
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
              color="#3dd6c6"
              emissive="#3dd6c6"
              emissiveIntensity={1}
              transparent
              opacity={0.42}
              depthWrite={false}
            />
          </mesh>
          <mesh position={[0, 0.3, -0.45]} rotation={[-0.5, 0, 0]}>
            <boxGeometry args={[2.3, 0.12, 1.5]} />
            <meshStandardMaterial
              color="#3dd6c6"
              emissive="#3dd6c6"
              emissiveIntensity={0.6}
              transparent
              opacity={0.3}
              depthWrite={false}
            />
          </mesh>
        </group>
      )}

      {blueprintPlaced && blueprintPosition && (
        <group position={blueprintPosition}>
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[2.3, 0.2, 2.3]} />
            <meshStandardMaterial color="#17414f" emissive="#3dd6c6" emissiveIntensity={0.25} roughness={0.5} metalness={0.35} />
          </mesh>
          <mesh position={[0, 0.3, -0.45]} rotation={[-0.5, 0, 0]}>
            <boxGeometry args={[2.3, 0.12, 1.5]} />
            <meshStandardMaterial color="#1c5468" emissive="#3dd6c6" emissiveIntensity={0.4} roughness={0.45} metalness={0.35} />
          </mesh>
          <mesh position={[0, 0.215, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.95, 1.08, 40]} />
            <meshStandardMaterial color="#3dd6c6" emissive="#3dd6c6" emissiveIntensity={0.9} transparent opacity={0.85} />
          </mesh>
        </group>
      )}
    </>
  )
}
