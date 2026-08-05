import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, Object3D } from 'three'
import type { Group, InstancedMesh, Mesh, MeshBasicMaterial, MeshStandardMaterial, PointLight } from 'three'
import { useGameStore } from '@/game/store'
import { GATE_Z, rig } from '@/game/world'

const CYAN = '#3dd6c6'
const AMBER = '#f0a830'
const DURATION = 2.4
const SPARK_COUNT = 20

const sparkDummy = new Object3D()

/**
 * Mastery → Zone Beta gate celebration — deferred until explore so lesson
 * overlay doesn't eat the beat. Stronger in-camera read: twin rings, beam,
 * spark motes, brief light pulse, subtle camera nudge toward gate.
 * Audio: HUD `playBlip('unlock')` fires with the deferred flash — not duplicated here.
 */
export function UnlockCelebrationFx() {
  const unlocked = useGameStore((s) => s.hasZoneBeta)
  const prev = useRef<boolean | null>(null)
  const pending = useRef(false)
  const start = useRef(-1)

  const groupRef = useRef<Group>(null)
  const outerRingRef = useRef<Mesh>(null)
  const innerRingRef = useRef<Mesh>(null)
  const outerMat = useRef<MeshStandardMaterial>(null)
  const innerMat = useRef<MeshStandardMaterial>(null)
  const beamRef = useRef<Mesh>(null)
  const beamMat = useRef<MeshBasicMaterial>(null)
  const flashRef = useRef<Mesh>(null)
  const flashMat = useRef<MeshBasicMaterial>(null)
  const lightRef = useRef<PointLight>(null)
  const sparksRef = useRef<InstancedMesh>(null)

  const sparkPhases = useMemo(
    () => Array.from({ length: SPARK_COUNT }, (_, i) => ({ angle: (i / SPARK_COUNT) * Math.PI * 2, lift: (i % 5) * 0.18 })),
    [],
  )

  const beginCelebration = (t: number) => {
    start.current = t
    rig.gateCelebration = 1
  }

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const mode = useGameStore.getState().mode

    if (prev.current === null) {
      prev.current = unlocked
      return
    }

    if (unlocked !== prev.current) {
      prev.current = unlocked
      if (unlocked) {
        if (mode === 'lesson') pending.current = true
        else beginCelebration(t)
      }
    }

    if (pending.current && mode !== 'lesson' && unlocked) {
      pending.current = false
      beginCelebration(t)
    }

    const firing = start.current >= 0
    if (groupRef.current) groupRef.current.visible = firing
    if (lightRef.current) lightRef.current.intensity = 0

    if (rig.gateCelebration > 0) {
      rig.gateCelebration = Math.max(0, rig.gateCelebration - delta * 0.85)
    }

    if (!firing) return

    const p = (t - start.current) / DURATION
    if (p >= 1) {
      start.current = -1
      rig.gateCelebration = 0
      return
    }

    const ease = 1 - Math.pow(1 - Math.min(p * 1.15, 1), 2.2)
    const fade = 1 - p

    if (outerRingRef.current && outerMat.current) {
      const s = 0.5 + ease * 9.5
      outerRingRef.current.scale.set(s, s, s)
      outerMat.current.opacity = 0.9 * fade
      outerMat.current.emissiveIntensity = 1.4 + (1 - p) * 0.8
    }
    if (innerRingRef.current && innerMat.current) {
      const s = 0.35 + ease * 5.5
      innerRingRef.current.scale.set(s, s, s)
      innerMat.current.opacity = 0.75 * fade * fade
      innerMat.current.emissiveIntensity = 1.8
    }
    if (beamRef.current && beamMat.current) {
      const h = 4 + ease * 8
      beamRef.current.scale.set(0.8 + ease * 2.2, h / 6, 0.8 + ease * 2.2)
      beamMat.current.opacity = 0.55 * fade * fade
    }
    if (flashRef.current && flashMat.current) {
      const burst = p < 0.12 ? 1 - p / 0.12 : 0
      flashRef.current.scale.setScalar(1 + burst * 2.5)
      flashMat.current.opacity = burst * 0.7
    }
    if (lightRef.current) {
      lightRef.current.intensity = 48 * fade * fade
    }

    const sparks = sparksRef.current
    if (sparks) {
      for (let i = 0; i < SPARK_COUNT; i++) {
        const sp = sparkPhases[i]
        const wobble = Math.sin(t * 6 + i * 1.9) * 0.12
        const radius = 0.35 + ease * 4.5 + wobble
        const y = 0.15 + ease * 3.8 + sp.lift + Math.sin(t * 5 + i) * 0.22
        sparkDummy.position.set(Math.cos(sp.angle + p * 2.2) * radius, y, Math.sin(sp.angle + p * 2.2) * radius)
        const scale = Math.max(0, fade) * (0.05 + (i % 3) * 0.018)
        sparkDummy.scale.setScalar(scale)
        sparkDummy.updateMatrix()
        sparks.setMatrixAt(i, sparkDummy.matrix)
      }
      sparks.instanceMatrix.needsUpdate = true
    }
  })

  return (
    <group ref={groupRef} position={[0, 0, GATE_Z]} visible={false}>
      <mesh ref={outerRingRef} position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.88, 1.05, 56]} />
        <meshStandardMaterial
          ref={outerMat}
          color={CYAN}
          emissive={CYAN}
          emissiveIntensity={1.4}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={innerRingRef} position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.55, 0.68, 48]} />
        <meshStandardMaterial
          ref={innerMat}
          color={AMBER}
          emissive={AMBER}
          emissiveIntensity={1.6}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={beamRef} position={[0, 3.2, 0]}>
        <cylinderGeometry args={[2.6, 2.6, 6, 24, 1, true]} />
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
      <mesh ref={flashRef} position={[0, 1.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.2, 32]} />
        <meshBasicMaterial
          ref={flashMat}
          color="#ffffff"
          transparent
          opacity={0}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <instancedMesh ref={sparksRef} args={[undefined, undefined, SPARK_COUNT]}>
        <octahedronGeometry args={[0.08, 0]} />
        <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={2} transparent opacity={0.85} />
      </instancedMesh>
      <pointLight ref={lightRef} position={[0, 2.4, 0]} color={CYAN} intensity={0} distance={22} decay={2} />
    </group>
  )
}
