import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Grid, Stars } from '@react-three/drei'
import type { Group, Mesh, MeshStandardMaterial } from 'three'
import { useGameStore } from '@/game/store'
import { Player } from '@/game/Player'
import { BlueprintGhost } from '@/game/BlueprintGhost'
import { ALPHA_RADIUS, BETA_CENTER, BETA_RADIUS, GATE_Z, TERMINAL_POS, rig } from '@/game/world'

const SKY = '#0b1a24'
const CYAN = '#3dd6c6'
const AMBER = '#f0a830'

function CameraRig() {
  useFrame((state, delta) => {
    const { playerYaw: yaw, playerPitch: pitch } = useGameStore.getState()
    const p = rig.playerPos
    const fx = -Math.sin(yaw)
    const fz = -Math.cos(yaw)
    const dist = 6.4
    const height = 3.0 + pitch * 2.4
    const tx = p.x - fx * dist
    const ty = p.y + height
    const tz = p.z - fz * dist
    const k = 1 - Math.exp(-delta * 5.5)
    const cam = state.camera.position
    cam.x += (tx - cam.x) * k
    cam.y += (ty - cam.y) * k
    cam.z += (tz - cam.z) * k
    state.camera.lookAt(p.x, p.y + 1.35 + pitch * 0.6, p.z)
  })
  return null
}

function AlphaPad() {
  return (
    <group>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[ALPHA_RADIUS, ALPHA_RADIUS + 0.35, 0.14, 8]} />
        <meshStandardMaterial color="#102736" metalness={0.25} roughness={0.65} />
      </mesh>
      <mesh position={[0, 0.14, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[ALPHA_RADIUS - 0.25, 0.045, 8, 64]} />
        <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={1.1} />
      </mesh>
      <mesh position={[0, 0.135, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.4, 2.5, 48]} />
        <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={0.35} transparent opacity={0.4} />
      </mesh>
    </group>
  )
}

function Terminal() {
  const beaconRef = useRef<Mesh>(null)
  const screenMat = useRef<MeshStandardMaterial>(null)
  const near = useGameStore((s) => s.nearTerminal)

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const beacon = beaconRef.current
    if (beacon) {
      beacon.position.y = 2.05 + Math.sin(t * 2) * 0.09
      beacon.rotation.y += delta * 1.4
    }
    if (screenMat.current) {
      const pulse = near ? 1.9 : 1.25
      screenMat.current.emissiveIntensity = pulse + Math.sin(t * 3.2) * 0.35
    }
  })

  return (
    <group position={TERMINAL_POS} rotation={[0, -0.62, 0]}>
      {/* Pedestal */}
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.72, 0.85, 0.36, 8]} />
        <meshStandardMaterial color="#0e2430" metalness={0.45} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[1.35, 0.7, 0.8]} />
        <meshStandardMaterial color="#14303e" metalness={0.4} roughness={0.45} />
      </mesh>
      {/* Readable screen + bezel */}
      <mesh position={[0, 1.05, 0.3]} rotation={[-0.42, 0, 0]}>
        <boxGeometry args={[1.12, 0.72, 0.08]} />
        <meshStandardMaterial color="#0a1c26" metalness={0.5} roughness={0.35} />
      </mesh>
      <mesh position={[0, 1.05, 0.35]} rotation={[-0.42, 0, 0]}>
        <planeGeometry args={[0.95, 0.55]} />
        <meshStandardMaterial
          ref={screenMat}
          color="#082028"
          emissive={CYAN}
          emissiveIntensity={1.4}
          roughness={0.25}
          metalness={0.1}
        />
      </mesh>
      {/* Scanline bars for readable “terminal UI” silhouette */}
      {[0.18, 0.05, -0.08, -0.21].map((y, i) => (
        <mesh key={i} position={[0, 1.05 + y * 0.35, 0.36]} rotation={[-0.42, 0, 0]}>
          <planeGeometry args={[0.78, 0.035]} />
          <meshBasicMaterial color={i === 0 ? AMBER : CYAN} transparent opacity={0.55} />
        </mesh>
      ))}
      <mesh position={[-0.72, 0.55, 0]}>
        <boxGeometry args={[0.06, 0.55, 0.55]} />
        <meshStandardMaterial color={AMBER} emissive={AMBER} emissiveIntensity={near ? 1.3 : 0.85} />
      </mesh>
      <mesh position={[0, 1.55, -0.2]}>
        <cylinderGeometry args={[0.045, 0.045, 1.1, 8]} />
        <meshStandardMaterial color="#1c4258" metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh ref={beaconRef} position={[0, 2.05, -0.2]}>
        <octahedronGeometry args={[0.2, 0]} />
        <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={1.6} />
      </mesh>
      {/* Proximity ring */}
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.85, 2.05, 48]} />
        <meshStandardMaterial
          color={CYAN}
          emissive={CYAN}
          emissiveIntensity={near ? 1.1 : 0.35}
          transparent
          opacity={near ? 0.75 : 0.35}
        />
      </mesh>
      <pointLight position={[0, 1.6, 0.6]} color={CYAN} intensity={near ? 10 : 6} distance={8} decay={2} />
    </group>
  )
}

function ZoneLabel({ text, color, y = 1.6 }: { text: string; color: string; y?: number }) {
  // Simple glyph bars stand in for text without font atlases.
  return (
    <group position={[0, y, 0]}>
      <mesh>
        <boxGeometry args={[1.8, 0.28, 0.06]} />
        <meshStandardMaterial color="#0a1820" metalness={0.3} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.04]}>
        <boxGeometry args={[1.55, 0.12, 0.02]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.1} />
      </mesh>
      <mesh position={[0, 0.22, 0]}>
        <boxGeometry args={[0.9, 0.06, 0.02]} />
        <meshBasicMaterial color={color} transparent opacity={0.7} />
      </mesh>
      {/* Keep a11y/debug name in scene graph */}
      <group name={text} />
    </group>
  )
}

function BetaZone() {
  const unlocked = useGameStore((s) => s.hasZoneBeta)
  const accent = unlocked ? CYAN : AMBER

  return (
    <group position={[BETA_CENTER[0], 0, BETA_CENTER[1]]}>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[BETA_RADIUS, BETA_RADIUS + 0.35, 0.14, 8]} />
        <meshStandardMaterial color={unlocked ? '#102736' : '#0c1e2a'} metalness={0.35} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.14, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[BETA_RADIUS - 0.25, 0.045, 8, 64]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={unlocked ? 1.25 : 0.65} />
      </mesh>
      {/* Blueprint pad payoff marker */}
      <mesh position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 4]}>
        <ringGeometry args={[1.2, 1.45, 4]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={unlocked ? 0.9 : 0.35} transparent opacity={0.7} />
      </mesh>
      <ZoneLabel text={unlocked ? 'ZONE BETA' : 'ZONE BETA LOCKED'} color={accent} y={2.1} />
      <pointLight position={[0, 2.4, 0]} color={accent} intensity={unlocked ? 7 : 3} distance={10} decay={2} />
    </group>
  )
}

function BetaBarrier() {
  const unlocked = useGameStore((s) => s.hasZoneBeta)
  const groupRef = useRef<Group>(null)

  useFrame((_, delta) => {
    const g = groupRef.current
    if (!g) return
    const target = unlocked ? -1.9 : 0
    g.position.y += (target - g.position.y) * Math.min(1, delta * 3.5)
    g.visible = g.position.y > -1.75
  })

  return (
    <group ref={groupRef} position={[0, 0, GATE_Z]}>
      <mesh position={[0, 0.95, 0]}>
        <boxGeometry args={[5.8, 1.9, 0.14]} />
        <meshStandardMaterial color={AMBER} emissive={AMBER} emissiveIntensity={0.85} transparent opacity={0.2} depthWrite={false} />
      </mesh>
      {[-2.9, 2.9].map((x) => (
        <mesh key={x} position={[x, 0.95, 0]}>
          <cylinderGeometry args={[0.09, 0.12, 1.9, 8]} />
          <meshStandardMaterial color="#3a2c12" emissive={AMBER} emissiveIntensity={0.7} metalness={0.4} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, 1.95, 0]}>
        <boxGeometry args={[6.0, 0.1, 0.2]} />
        <meshStandardMaterial color={AMBER} emissive={AMBER} emissiveIntensity={1.1} />
      </mesh>
    </group>
  )
}

export function TrainingRange() {
  return (
    <>
      <color attach="background" args={[SKY]} />
      <fog attach="fog" args={[SKY, 18, 55]} />
      <Stars radius={90} depth={50} count={3200} factor={3.4} saturation={0} fade speed={0.55} />

      <hemisphereLight args={['#8ecfc8', '#0a141d', 0.55]} />
      <ambientLight intensity={0.28} color="#9fd9d4" />
      <directionalLight position={[8, 14, 6]} intensity={1.35} color="#ffe3b0" castShadow={false} />
      <directionalLight position={[-6, 4, -8]} intensity={0.35} color="#3dd6c6" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[90, 90]} />
        <meshStandardMaterial color="#081018" roughness={0.95} metalness={0.05} />
      </mesh>
      <Grid
        position={[0, 0.01, 0]}
        infiniteGrid
        cellSize={1}
        cellThickness={0.45}
        cellColor="#122a36"
        sectionSize={5}
        sectionThickness={1.1}
        sectionColor="#1f6470"
        fadeDistance={42}
        fadeStrength={1.5}
      />

      <AlphaPad />
      <group position={[-4.2, 0, 4.2]}>
        <ZoneLabel text="ZONE ALPHA" color={CYAN} y={1.35} />
      </group>
      <Terminal />
      <BetaZone />
      <BetaBarrier />
      <Player />
      <BlueprintGhost />
      <CameraRig />
    </>
  )
}
