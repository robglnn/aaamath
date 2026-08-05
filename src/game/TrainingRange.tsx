import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Grid, Stars, Text } from '@react-three/drei'
import { AdditiveBlending } from 'three'
import type { Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, PointLight } from 'three'
import { useGameStore } from '@/game/store'
import { Player } from '@/game/Player'
import { BlueprintGhost } from '@/game/BlueprintGhost'
import { RangeDecor } from '@/game/RangeDecor'
import { ALPHA_RADIUS, BETA_CENTER, BETA_RADIUS, GATE_Z, TERMINAL_POS, groundHeight, rig } from '@/game/world'

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
  const rimMat = useRef<MeshStandardMaterial>(null)

  useFrame((state) => {
    if (rimMat.current) {
      rimMat.current.emissiveIntensity = 1.05 + Math.sin(state.clock.elapsedTime * 1.8) * 0.3
    }
  })

  return (
    <group>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[ALPHA_RADIUS, ALPHA_RADIUS + 0.35, 0.14, 8]} />
        <meshStandardMaterial color="#132e3f" metalness={0.3} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.14, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[ALPHA_RADIUS - 0.25, 0.045, 8, 64]} />
        <meshStandardMaterial ref={rimMat} color={CYAN} emissive={CYAN} emissiveIntensity={1.1} />
      </mesh>
      <mesh position={[0, 0.135, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.4, 2.5, 48]} />
        <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={0.35} transparent opacity={0.4} />
      </mesh>
      {/* Soft pool of light so the spawn pad reads as home base */}
      <pointLight position={[0, 4.6, 0]} color="#7fd8cd" intensity={5.5} distance={14} decay={2} />
    </group>
  )
}

function Terminal() {
  const beaconRef = useRef<Mesh>(null)
  const diamondRef = useRef<Mesh>(null)
  const beamRef = useRef<Mesh>(null)
  const beamMat = useRef<MeshBasicMaterial>(null)
  const ringRef = useRef<Mesh>(null)
  const ringMat = useRef<MeshStandardMaterial>(null)
  const scanRef = useRef<Mesh>(null)
  const screenMat = useRef<MeshStandardMaterial>(null)
  const glowLight = useRef<PointLight>(null)
  const near = useGameStore((s) => s.nearTerminal)

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const beacon = beaconRef.current
    if (beacon) {
      beacon.position.y = 2.05 + Math.sin(t * 2) * 0.09
      beacon.rotation.y += delta * 1.4
    }
    const diamond = diamondRef.current
    if (diamond) {
      diamond.position.y = 7.9 + Math.sin(t * 1.6) * 0.22
      diamond.rotation.y += delta * 1.1
      const s = (near ? 1.18 : 1) + Math.sin(t * 2.6) * 0.07
      diamond.scale.set(s, s, s)
    }
    const beam = beamRef.current
    if (beam && beamMat.current) {
      const widen = near ? 1.28 : 1 + Math.sin(t * 1.4) * 0.06
      beam.scale.x = widen
      beam.scale.z = widen
      beamMat.current.opacity = (near ? 0.3 : 0.15) + Math.sin(t * 2.2) * 0.045
    }
    if (ringRef.current && ringMat.current) {
      const pulse = near ? 1 + Math.sin(t * 3.4) * 0.1 : 1
      ringRef.current.scale.set(pulse, pulse, pulse)
      ringMat.current.emissiveIntensity = near ? 1.5 : 0.4
      ringMat.current.opacity = near ? 0.85 : 0.35
    }
    if (scanRef.current) {
      const cycle = (t % 1.7) / 1.7
      scanRef.current.position.y = 1.05 + (0.17 - cycle * 0.34)
    }
    if (screenMat.current) {
      const pulse = near ? 2.1 : 1.3
      screenMat.current.emissiveIntensity = pulse + Math.sin(t * 3.2) * 0.35
    }
    if (glowLight.current) {
      glowLight.current.intensity = near ? 15 : 7
    }
  })

  return (
    <group position={TERMINAL_POS} rotation={[0, -0.62, 0]}>
      {/* Pedestal */}
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.72, 0.85, 0.36, 8]} />
        <meshStandardMaterial color="#123042" metalness={0.45} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[1.35, 0.7, 0.8]} />
        <meshStandardMaterial color="#1a3a4c" metalness={0.4} roughness={0.45} />
      </mesh>
      {/* Readable screen + bezel */}
      <mesh position={[0, 1.05, 0.3]} rotation={[-0.42, 0, 0]}>
        <boxGeometry args={[1.12, 0.72, 0.08]} />
        <meshStandardMaterial color="#0d2430" metalness={0.5} roughness={0.35} />
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
      {/* Animated scanline sweep — the screen reads “alive” from range */}
      <mesh ref={scanRef} position={[0, 1.22, 0.365]} rotation={[-0.42, 0, 0]}>
        <planeGeometry args={[0.82, 0.05]} />
        <meshBasicMaterial color={AMBER} transparent opacity={0.9} blending={AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* Side fins: kiosk silhouette + amber accent strip */}
      <mesh position={[-0.72, 0.55, 0]}>
        <boxGeometry args={[0.06, 0.55, 0.55]} />
        <meshStandardMaterial color={AMBER} emissive={AMBER} emissiveIntensity={near ? 1.5 : 0.85} />
      </mesh>
      <mesh position={[0.72, 0.55, 0]}>
        <boxGeometry args={[0.06, 0.55, 0.55]} />
        <meshStandardMaterial color={AMBER} emissive={AMBER} emissiveIntensity={near ? 1.5 : 0.85} />
      </mesh>
      <mesh position={[0, 1.55, -0.2]}>
        <cylinderGeometry args={[0.045, 0.045, 1.1, 8]} />
        <meshStandardMaterial color="#24506a" metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh ref={beaconRef} position={[0, 2.05, -0.2]}>
        <octahedronGeometry args={[0.2, 0]} />
        <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={1.6} />
      </mesh>
      {/* Objective beam + floating diamond: visible across the whole range */}
      <mesh ref={beamRef} position={[0, 5.2, -0.2]}>
        <cylinderGeometry args={[0.3, 0.46, 7, 12, 1, true]} />
        <meshBasicMaterial
          ref={beamMat}
          color={CYAN}
          transparent
          opacity={0.16}
          blending={AdditiveBlending}
          depthWrite={false}
          side={2}
        />
      </mesh>
      <mesh ref={diamondRef} position={[0, 7.9, -0.2]}>
        <octahedronGeometry args={[0.34, 0]} />
        <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={2.1} />
      </mesh>
      {/* Proximity ring */}
      <mesh ref={ringRef} position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.85, 2.05, 48]} />
        <meshStandardMaterial
          ref={ringMat}
          color={CYAN}
          emissive={CYAN}
          emissiveIntensity={0.4}
          transparent
          opacity={0.35}
        />
      </mesh>
      <pointLight ref={glowLight} position={[0, 1.6, 0.6]} color={CYAN} intensity={7} distance={9} decay={2} />
    </group>
  )
}

function ZoneLabel({ text, color, y = 1.6 }: { text: string; color: string; y?: number }) {
  // Readable troika Text — Fortnite-range signage literacy (critic wave-1 largest gap).
  const width = Math.max(2.4, text.length * 0.22)
  return (
    <group position={[0, y, 0]} name={text}>
      <mesh position={[0, 0, -0.02]}>
        <boxGeometry args={[width, 0.48, 0.06]} />
        <meshStandardMaterial color="#0c1e28" metalness={0.35} roughness={0.45} />
      </mesh>
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[width - 0.12, 0.36]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} transparent opacity={0.18} />
      </mesh>
      <Text
        position={[0, 0.02, 0.05]}
        fontSize={0.22}
        letterSpacing={0.06}
        color={color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.018}
        outlineColor="#041018"
        maxWidth={width - 0.2}
        textAlign="center"
      >
        {text}
      </Text>
    </group>
  )
}

function BetaZone() {
  const unlocked = useGameStore((s) => s.hasZoneBeta)
  const accent = unlocked ? CYAN : AMBER
  const holoRef = useRef<Mesh>(null)
  const scanRef = useRef<Mesh>(null)
  const scanMat = useRef<MeshStandardMaterial>(null)

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    if (holoRef.current) {
      holoRef.current.rotation.y += delta * 0.9
      holoRef.current.rotation.z = 0.16 + Math.sin(t * 1.2) * 0.08
    }
    if (scanRef.current && scanMat.current) {
      const cycle = (t % 2.6) / 2.6
      const s = 0.6 + cycle * (BETA_RADIUS - 1.2)
      scanRef.current.scale.set(s, s, s)
      scanMat.current.opacity = 0.5 * (1 - cycle)
    }
  })

  return (
    <group position={[BETA_CENTER[0], 0, BETA_CENTER[1]]}>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[BETA_RADIUS, BETA_RADIUS + 0.35, 0.14, 8]} />
        <meshStandardMaterial color={unlocked ? '#123042' : '#0c1e2a'} metalness={0.35} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.14, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[BETA_RADIUS - 0.25, 0.045, 8, 64]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={unlocked ? 1.4 : 0.65} />
      </mesh>
      {/* Blueprint pad payoff marker */}
      <mesh position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 4]}>
        <ringGeometry args={[1.2, 1.45, 4]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={unlocked ? 0.9 : 0.35} transparent opacity={0.7} />
      </mesh>
      {/* Unlocked: rotating holo ring + breathing scan wave sell the payoff */}
      {unlocked && (
        <>
          <mesh ref={holoRef} position={[0, 3.1, 0]} rotation={[Math.PI / 2, 0, 0.16]}>
            <torusGeometry args={[2.5, 0.05, 8, 56]} />
            <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={1.4} transparent opacity={0.85} />
          </mesh>
          <mesh ref={scanRef} position={[0, 0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.94, 1, 48]} />
            <meshStandardMaterial
              ref={scanMat}
              color={CYAN}
              emissive={CYAN}
              emissiveIntensity={1.1}
              transparent
              opacity={0.4}
              depthWrite={false}
            />
          </mesh>
        </>
      )}
      <ZoneLabel text={unlocked ? 'ZONE BETA' : 'ZONE BETA LOCKED'} color={accent} y={2.1} />
      <pointLight position={[0, 2.6, 0]} color={accent} intensity={unlocked ? 9 : 3} distance={12} decay={2} />
    </group>
  )
}

function BetaBarrier() {
  const unlocked = useGameStore((s) => s.hasZoneBeta)
  const accent = unlocked ? CYAN : AMBER
  const groupRef = useRef<Group>(null)
  const paneMat = useRef<MeshStandardMaterial>(null)

  useFrame((state, delta) => {
    const g = groupRef.current
    if (!g) return
    const target = unlocked ? -1.9 : 0
    g.position.y += (target - g.position.y) * Math.min(1, delta * 3.5)
    g.visible = g.position.y > -1.75
    if (paneMat.current) {
      if (unlocked) {
        // Fade the energy wall out as it sinks into the floor
        paneMat.current.opacity = Math.max(0, 0.2 * (g.position.y + 1.9) / 1.9)
      } else {
        // Locked: gentle energy shimmer so the gate reads as a barrier, not a wall
        paneMat.current.opacity = 0.17 + Math.sin(state.clock.elapsedTime * 2.4) * 0.05
      }
    }
  })

  return (
    <>
      <group ref={groupRef} position={[0, 0, GATE_Z]}>
        <mesh position={[0, 0.95, 0]}>
          <boxGeometry args={[5.8, 1.9, 0.14]} />
          <meshStandardMaterial
            ref={paneMat}
            color={accent}
            emissive={accent}
            emissiveIntensity={0.85}
            transparent
            opacity={0.2}
            depthWrite={false}
          />
        </mesh>
        {[-2.9, 2.9].map((x) => (
          <mesh key={x} position={[x, 0.95, 0]}>
            <cylinderGeometry args={[0.09, 0.12, 1.9, 8]} />
            <meshStandardMaterial color="#3a2c12" emissive={accent} emissiveIntensity={unlocked ? 1.1 : 0.7} metalness={0.4} roughness={0.4} />
          </mesh>
        ))}
        <mesh position={[0, 1.95, 0]}>
          <boxGeometry args={[6.0, 0.1, 0.2]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={unlocked ? 1.6 : 1.1} />
        </mesh>
      </group>
      {/* Open-door threshold glow stays behind after the wall drops */}
      {unlocked && (
        <mesh position={[0, 0.03, GATE_Z]}>
          <boxGeometry args={[5.8, 0.04, 0.5]} />
          <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={1.5} transparent opacity={0.8} />
        </mesh>
      )}
    </>
  )
}

/** One-shot burst at the gate the moment Zone Beta unlocks: light spike + shockwave. */
function GateUnlockFx() {
  const unlocked = useGameStore((s) => s.hasZoneBeta)
  const prev = useRef<boolean | null>(null)
  const start = useRef(-1)
  const ringRef = useRef<Mesh>(null)
  const ringMat = useRef<MeshStandardMaterial>(null)
  const beamRef = useRef<Mesh>(null)
  const beamMat = useRef<MeshBasicMaterial>(null)
  const lightRef = useRef<PointLight>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (prev.current === null) {
      prev.current = unlocked
      return
    }
    if (unlocked !== prev.current) {
      prev.current = unlocked
      if (unlocked) start.current = t
    }
    const firing = start.current >= 0
    if (ringRef.current) ringRef.current.visible = firing
    if (beamRef.current) beamRef.current.visible = firing
    if (lightRef.current) lightRef.current.intensity = 0
    if (!firing) return
    const p = (t - start.current) / 1.5
    if (p >= 1) {
      start.current = -1
      return
    }
    const ease = 1 - Math.pow(1 - p, 2)
    if (ringRef.current && ringMat.current) {
      const s = 0.6 + ease * 7
      ringRef.current.scale.set(s, s, s)
      ringMat.current.opacity = 0.95 * (1 - p)
    }
    if (beamRef.current && beamMat.current) {
      const w = 1 + ease * 1.6
      beamRef.current.scale.set(w, 1, w)
      beamMat.current.opacity = 0.8 * (1 - p) * (1 - p)
    }
    if (lightRef.current) {
      lightRef.current.intensity = 34 * (1 - p) * (1 - p)
    }
  })

  return (
    <group position={[0, 0, GATE_Z]}>
      <mesh ref={ringRef} visible={false} position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.92, 1, 48]} />
        <meshStandardMaterial
          ref={ringMat}
          color={CYAN}
          emissive={CYAN}
          emissiveIntensity={1.6}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={beamRef} visible={false} position={[0, 3, 0]}>
        <cylinderGeometry args={[2.9, 2.9, 6, 24, 1, true]} />
        <meshBasicMaterial
          ref={beamMat}
          color={CYAN}
          transparent
          opacity={0}
          blending={AdditiveBlending}
          depthWrite={false}
          side={2}
        />
      </mesh>
      <pointLight ref={lightRef} position={[0, 2.2, 0]} color={CYAN} intensity={0} distance={16} decay={2} />
    </group>
  )
}

/** Floor studs that march from the gate toward Beta once it opens — “this way” cue. */
function GatePathLights() {
  const unlocked = useGameStore((s) => s.hasZoneBeta)
  const mats = useRef<(MeshStandardMaterial | null)[]>([])
  const studs = [-8.9, -10, -11.1, -12.2, -13.3]

  useFrame((state) => {
    const t = state.clock.elapsedTime
    for (let i = 0; i < studs.length; i++) {
      const m = mats.current[i]
      if (!m) continue
      if (unlocked) {
        const wave = Math.sin(t * 4.2 - i * 1.1)
        m.emissiveIntensity = 0.55 + Math.max(0, wave) * 1.5
      } else {
        m.emissiveIntensity = 0.3
      }
    }
  })

  return (
    <group>
      {studs.map((z, i) => {
        const y = groundHeight(0, z, true, null) + 0.045
        return (
          <mesh key={z} position={[0, y, z]}>
            <cylinderGeometry args={[0.1, 0.13, 0.07, 8]} />
            <meshStandardMaterial
              ref={(m) => {
                mats.current[i] = m
              }}
              color={unlocked ? CYAN : AMBER}
              emissive={unlocked ? CYAN : AMBER}
              emissiveIntensity={0.3}
            />
          </mesh>
        )
      })}
    </group>
  )
}

export function TrainingRange() {
  return (
    <>
      <color attach="background" args={[SKY]} />
      <fog attach="fog" args={[SKY, 18, 55]} />
      <Stars radius={90} depth={50} count={3200} factor={3.4} saturation={0} fade speed={0.55} />
      {/* Soft gradient sky dome — cheaper Valerian atmosphere without env maps */}
      <mesh scale={[-1, 1, 1]}>
        <sphereGeometry args={[70, 24, 16]} />
        <meshBasicMaterial color="#122636" transparent opacity={0.55} depthWrite={false} />
      </mesh>
      <mesh position={[0, -8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[48, 68, 48]} />
        <meshBasicMaterial color="#1a4050" transparent opacity={0.22} depthWrite={false} />
      </mesh>

      {/* Lighting: warm key + cool rim + pad pools; no postprocessing bloom (mobile-safe) */}
      <hemisphereLight args={['#9adfd6', '#0b1520', 0.62]} />
      <ambientLight intensity={0.22} color="#9fd9d4" />
      <directionalLight position={[8, 14, 6]} intensity={1.55} color="#ffe8c2" castShadow={false} />
      <directionalLight position={[-6, 4, -8]} intensity={0.5} color="#3dd6c6" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[90, 90]} />
        <meshStandardMaterial color="#0a141d" roughness={0.92} metalness={0.08} />
      </mesh>
      <Grid
        position={[0, 0.01, 0]}
        infiniteGrid
        cellSize={1}
        cellThickness={0.45}
        cellColor="#16323f"
        sectionSize={5}
        sectionThickness={1.1}
        sectionColor="#267584"
        fadeDistance={42}
        fadeStrength={1.5}
      />

      <RangeDecor />
      <AlphaPad />
      <group position={[-4.2, 0, 4.2]}>
        <ZoneLabel text="ZONE ALPHA" color={CYAN} y={1.35} />
      </group>
      <Terminal />
      <BetaZone />
      <BetaBarrier />
      <GateUnlockFx />
      <GatePathLights />
      <Player />
      <BlueprintGhost />
      <CameraRig />
    </>
  )
}
