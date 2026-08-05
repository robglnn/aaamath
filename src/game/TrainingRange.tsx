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
    const yaw = useGameStore.getState().playerYaw
    const p = rig.playerPos
    const fx = -Math.sin(yaw)
    const fz = -Math.cos(yaw)
    const dist = 6.4
    const tx = p.x - fx * dist
    const ty = p.y + 3.0
    const tz = p.z - fz * dist
    const k = 1 - Math.exp(-delta * 5.5)
    const cam = state.camera.position
    cam.x += (tx - cam.x) * k
    cam.y += (ty - cam.y) * k
    cam.z += (tz - cam.z) * k
    state.camera.lookAt(p.x, p.y + 1.3, p.z)
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

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const beacon = beaconRef.current
    if (beacon) {
      beacon.position.y = 2.05 + Math.sin(t * 2) * 0.09
      beacon.rotation.y += delta * 1.4
    }
    if (screenMat.current) {
      screenMat.current.emissiveIntensity = 1.35 + Math.sin(t * 3) * 0.3
    }
  })

  return (
    <group position={TERMINAL_POS} rotation={[0, -0.62, 0]}>
      <mesh position={[0, 0.43, 0]}>
        <boxGeometry args={[1.3, 0.86, 0.75]} />
        <meshStandardMaterial color="#14303e" metalness={0.35} roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.02, 0.28]} rotation={[-0.38, 0, 0]}>
        <boxGeometry args={[1.0, 0.62, 0.06]} />
        <meshStandardMaterial ref={screenMat} color="#0d2733" emissive={CYAN} emissiveIntensity={1.35} roughness={0.3} />
      </mesh>
      <mesh position={[-0.68, 0.5, 0]}>
        <boxGeometry args={[0.05, 0.5, 0.5]} />
        <meshStandardMaterial color={AMBER} emissive={AMBER} emissiveIntensity={0.9} />
      </mesh>
      <mesh position={[0, 1.55, -0.2]}>
        <cylinderGeometry args={[0.045, 0.045, 1.1, 8]} />
        <meshStandardMaterial color="#1c4258" metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh ref={beaconRef} position={[0, 2.05, -0.2]}>
        <octahedronGeometry args={[0.2, 0]} />
        <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={1.6} />
      </mesh>
      <pointLight position={[0, 1.6, 0.6]} color={CYAN} intensity={7} distance={7} decay={2} />
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
        <meshStandardMaterial color={unlocked ? '#102736' : '#0c1e2a'} metalness={0.25} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.14, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[BETA_RADIUS - 0.25, 0.045, 8, 64]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={unlocked ? 1.1 : 0.7} />
      </mesh>
      <pointLight position={[0, 2.4, 0]} color={accent} intensity={unlocked ? 5 : 3} distance={9} decay={2} />
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
      <fog attach="fog" args={[SKY, 20, 60]} />
      <Stars radius={90} depth={50} count={2800} factor={3.2} saturation={0} fade speed={0.6} />

      <ambientLight intensity={0.55} color="#9fd9d4" />
      <directionalLight position={[7, 12, 5]} intensity={1.15} color="#ffe3b0" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[90, 90]} />
        <meshStandardMaterial color="#0a141d" roughness={1} metalness={0} />
      </mesh>
      <Grid
        position={[0, 0.01, 0]}
        infiniteGrid
        cellSize={1}
        cellThickness={0.55}
        cellColor="#14313f"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#1e5a66"
        fadeDistance={45}
        fadeStrength={1.4}
      />

      <AlphaPad />
      <Terminal />
      <BetaZone />
      <BetaBarrier />
      <Player />
      <BlueprintGhost />
      <CameraRig />
    </>
  )
}
