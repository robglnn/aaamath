import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending } from 'three'
import type { MeshBasicMaterial } from 'three'

const CYAN = '#3dd6c6'
const AMBER = '#f0a830'
const STEEL = '#1a3344'

/**
 * Distant / mid-field set dressing for the training range.
 * Kept in its own module so range visual waves can land without merge fights.
 */
export function RangeDecor() {
  return (
    <group>
      <HorizonRing />
      <LightPosts />
      <SupplyCrates />
      <DistantSpires />
    </group>
  )
}

function HorizonRing() {
  const mat = useRef<MeshBasicMaterial>(null)
  useFrame((state) => {
    if (mat.current) {
      mat.current.opacity = 0.14 + Math.sin(state.clock.elapsedTime * 0.35) * 0.03
    }
  })
  return (
    <mesh position={[0, 0.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[38, 42, 64]} />
      <meshBasicMaterial
        ref={mat}
        color={CYAN}
        transparent
        opacity={0.14}
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  )
}

function LightPosts() {
  const posts: [number, number, string][] = [
    [-9.5, 7.5, CYAN],
    [9.5, 7.5, CYAN],
    [-10.5, -4, AMBER],
    [10.5, -4, AMBER],
    [-7.5, -18, CYAN],
    [7.5, -18, CYAN],
  ]
  return (
    <group>
      {posts.map(([x, z, color], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 1.4, 0]}>
            <cylinderGeometry args={[0.06, 0.09, 2.8, 6]} />
            <meshStandardMaterial color={STEEL} metalness={0.55} roughness={0.4} />
          </mesh>
          <mesh position={[0, 2.85, 0]}>
            <boxGeometry args={[0.28, 0.12, 0.28]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} />
          </mesh>
          <pointLight position={[0, 2.7, 0]} color={color} intensity={3.2} distance={7} decay={2} />
        </group>
      ))}
    </group>
  )
}

function SupplyCrates() {
  const crates = useMemo(
    () =>
      [
        [-5.2, 6.1, 0.35],
        [-4.4, 6.6, -0.2],
        [5.8, 5.4, 0.55],
        [6.4, -2.2, 0.1],
        [-6.1, -5.5, 0.4],
      ] as [number, number, number][],
    [],
  )
  return (
    <group>
      {crates.map(([x, z, rot], i) => (
        <group key={i} position={[x, 0.32, z]} rotation={[0, rot, 0]}>
          <mesh>
            <boxGeometry args={[0.7, 0.55, 0.7]} />
            <meshStandardMaterial color="#152836" metalness={0.35} roughness={0.55} />
          </mesh>
          <mesh position={[0, 0.29, 0]}>
            <boxGeometry args={[0.72, 0.04, 0.72]} />
            <meshStandardMaterial color={i % 2 === 0 ? CYAN : AMBER} emissive={i % 2 === 0 ? CYAN : AMBER} emissiveIntensity={0.45} />
          </mesh>
          <mesh position={[0, 0, 0.36]}>
            <boxGeometry args={[0.35, 0.08, 0.02]} />
            <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function DistantSpires() {
  const spires: [number, number, number, number][] = [
    [-28, -12, 9, 1.2],
    [-24, 18, 6.5, 0.9],
    [26, -8, 11, 1.4],
    [22, 16, 7.2, 1.0],
    [-18, -28, 5.5, 0.8],
    [16, -30, 8, 1.1],
  ]
  return (
    <group>
      {spires.map(([x, z, h, w], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, h / 2, 0]}>
            <boxGeometry args={[w, h, w]} />
            <meshStandardMaterial color="#0e1c28" metalness={0.2} roughness={0.85} transparent opacity={0.85} />
          </mesh>
          <mesh position={[0, h + 0.4, 0]}>
            <boxGeometry args={[w * 0.35, 0.8, w * 0.35]} />
            <meshStandardMaterial
              color={i % 3 === 0 ? AMBER : CYAN}
              emissive={i % 3 === 0 ? AMBER : CYAN}
              emissiveIntensity={0.9}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}
