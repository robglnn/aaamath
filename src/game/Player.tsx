import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, Mesh, MeshBasicMaterial } from 'three'
import { useGameStore } from '@/game/store'
import {
  BOUNDS,
  GRAVITY,
  JUMP_SPEED,
  LOCKED_MIN_Z,
  GATE_Z,
  SPRINT_SPEED,
  TERMINAL_POS,
  TERMINAL_RADIUS,
  WALK_SPEED,
  groundHeight,
  rig,
} from '@/game/world'

function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null
  if (!el || !el.tagName) return false
  return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable
}

export function Player() {
  const bodyRef = useRef<Group>(null)
  const shadowRef = useRef<Mesh>(null)
  const shadowMat = useRef<MeshBasicMaterial>(null)
  const keys = useRef<Record<string, boolean>>({})
  const velY = useRef(0)
  const grounded = useRef(true)
  const lastJumpNonce = useRef(0)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return
      keys.current[e.code] = true
      if (e.code === 'Space') {
        rig.jumpQueued = true
        e.preventDefault()
      }
    }
    const up = (e: KeyboardEvent) => {
      keys.current[e.code] = false
    }
    const clear = () => {
      keys.current = {}
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', clear)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', clear)
    }
  }, [])

  useFrame((_, delta) => {
    const s = useGameStore.getState()
    const dt = Math.min(delta, 0.05)
    const k = keys.current

    if (s.jumpNonce !== lastJumpNonce.current) {
      lastJumpNonce.current = s.jumpNonce
      rig.jumpQueued = true
    }

    let ix = 0
    let iy = 0
    if (s.mode !== 'lesson') {
      if (k['KeyW'] || k['ArrowUp']) iy += 1
      if (k['KeyS'] || k['ArrowDown']) iy -= 1
      if (k['KeyA'] || k['ArrowLeft']) ix -= 1
      if (k['KeyD'] || k['ArrowRight']) ix += 1
      ix += s.stickX
      iy += s.stickY
    }
    const mag = Math.hypot(ix, iy)
    if (mag > 1) {
      ix /= mag
      iy /= mag
    }

    const sprinting =
      s.canSprint &&
      (k['ShiftLeft'] === true ||
        k['ShiftRight'] === true ||
        s.touchSprint ||
        mag > 0.92)
    const speed = sprinting ? SPRINT_SPEED : WALK_SPEED

    const yaw = s.playerYaw
    const fx = -Math.sin(yaw)
    const fz = -Math.cos(yaw)
    const rx = Math.cos(yaw)
    const rz = -Math.sin(yaw)
    const mx = fx * iy + rx * ix
    const mz = fz * iy + rz * ix

    const p = rig.playerPos
    p.x += mx * speed * dt
    p.z += mz * speed * dt

    const gy = groundHeight(p.x, p.z, s.hasZoneBeta, s.blueprintPosition)
    if (rig.jumpQueued) {
      if (grounded.current && s.mode !== 'lesson') {
        velY.current = JUMP_SPEED
        grounded.current = false
      }
      rig.jumpQueued = false
    }
    velY.current -= GRAVITY * dt
    p.y += velY.current * dt
    if (p.y <= gy) {
      p.y = gy
      velY.current = 0
      grounded.current = true
    }
    if (grounded.current && p.y > gy + 0.001) {
      grounded.current = false
    }

    p.x = Math.min(BOUNDS.x, Math.max(-BOUNDS.x, p.x))
    const zMin = s.hasZoneBeta ? BOUNDS.zMin : LOCKED_MIN_Z
    p.z = Math.min(BOUNDS.zMax, Math.max(zMin, p.z))

    const tdx = p.x - TERMINAL_POS[0]
    const tdz = p.z - TERMINAL_POS[2]
    const near = tdx * tdx + tdz * tdz < TERMINAL_RADIUS * TERMINAL_RADIUS
    if (near !== s.nearTerminal) s.setNearTerminal(near)

    const zone = s.hasZoneBeta && p.z < GATE_Z - 0.5 ? 'beta' : 'alpha'
    if (zone !== s.activeZone) s.setZone(zone)

    const body = bodyRef.current
    if (body) {
      body.position.set(p.x, p.y, p.z)
      if (mag > 0.05) {
        const target = Math.atan2(mx, mz)
        const diff = Math.atan2(Math.sin(target - body.rotation.y), Math.cos(target - body.rotation.y))
        body.rotation.y += diff * Math.min(1, dt * 10)
      }
    }
    const shadow = shadowRef.current
    if (shadow) {
      shadow.position.set(p.x, gy + 0.015, p.z)
      const lift = Math.min(1, Math.max(0, (p.y - gy) / 3))
      const scale = 1 - lift * 0.45
      shadow.scale.set(scale, scale, scale)
      if (shadowMat.current) shadowMat.current.opacity = 0.4 * (1 - lift * 0.6)
    }
  })

  // Low-poly game-y silhouette: torso, limbs, visor helm (no AAA assets).
  return (
    <group>
      <group ref={bodyRef} position={[rig.playerPos.x, rig.playerPos.y, rig.playerPos.z]}>
        {/* Legs */}
        <mesh position={[-0.14, 0.28, 0]}>
          <capsuleGeometry args={[0.1, 0.28, 4, 8]} />
          <meshStandardMaterial color="#152a36" roughness={0.55} metalness={0.25} />
        </mesh>
        <mesh position={[0.14, 0.28, 0]}>
          <capsuleGeometry args={[0.1, 0.28, 4, 8]} />
          <meshStandardMaterial color="#152a36" roughness={0.55} metalness={0.25} />
        </mesh>
        {/* Torso */}
        <mesh position={[0, 0.78, 0]}>
          <capsuleGeometry args={[0.28, 0.42, 6, 12]} />
          <meshStandardMaterial color="#1a3a4d" emissive="#0b2b33" emissiveIntensity={0.25} roughness={0.5} metalness={0.3} />
        </mesh>
        {/* Shoulders / pack */}
        <mesh position={[0, 0.95, -0.22]}>
          <boxGeometry args={[0.52, 0.28, 0.22]} />
          <meshStandardMaterial color="#0f2835" roughness={0.45} metalness={0.4} />
        </mesh>
        <mesh position={[0, 0.98, -0.34]}>
          <boxGeometry args={[0.28, 0.08, 0.06]} />
          <meshStandardMaterial color="#3dd6c6" emissive="#3dd6c6" emissiveIntensity={1.2} />
        </mesh>
        {/* Arms */}
        <mesh position={[-0.38, 0.78, 0.02]} rotation={[0, 0, 0.25]}>
          <capsuleGeometry args={[0.08, 0.32, 4, 8]} />
          <meshStandardMaterial color="#1c4258" roughness={0.55} metalness={0.2} />
        </mesh>
        <mesh position={[0.38, 0.78, 0.02]} rotation={[0, 0, -0.25]}>
          <capsuleGeometry args={[0.08, 0.32, 4, 8]} />
          <meshStandardMaterial color="#1c4258" roughness={0.55} metalness={0.2} />
        </mesh>
        {/* Helm + amber visor */}
        <mesh position={[0, 1.28, 0.02]}>
          <sphereGeometry args={[0.22, 14, 12]} />
          <meshStandardMaterial color="#163646" roughness={0.4} metalness={0.45} />
        </mesh>
        <mesh position={[0, 1.28, 0.18]}>
          <boxGeometry args={[0.28, 0.1, 0.08]} />
          <meshStandardMaterial color="#f0a830" emissive="#f0a830" emissiveIntensity={1.45} roughness={0.35} />
        </mesh>
      </group>
      <mesh ref={shadowRef} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.48, 24]} />
        <meshBasicMaterial ref={shadowMat} color="#02080c" transparent opacity={0.4} depthWrite={false} />
      </mesh>
    </group>
  )
}
