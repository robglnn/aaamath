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

// Local palette — matches game shell teal/cyan/amber (see game.css).
const DEEP = '#1e3d4f'
const SHADE = '#17394b'
const BODY = '#26536b'
const BODY_LT = '#2a5a74'
const HELM = '#1f475c'
const CYAN = '#3dd6c6'
const AMBER = '#f0a830'

const MAT = { roughness: 0.55, metalness: 0.25 }
const MAT_BODY = { roughness: 0.5, metalness: 0.3, emissive: '#0e3a42', emissiveIntensity: 0.4 }
const MAT_HELM = { roughness: 0.4, metalness: 0.45 }
const MAT_PACK = { roughness: 0.45, metalness: 0.4 }

function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null
  if (!el || !el.tagName) return false
  return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable
}

export function Player() {
  const bodyRef = useRef<Group>(null)
  const torsoPivot = useRef<Group>(null)
  const leftLegPivot = useRef<Group>(null)
  const rightLegPivot = useRef<Group>(null)
  const leftArmPivot = useRef<Group>(null)
  const rightArmPivot = useRef<Group>(null)
  const shadowRef = useRef<Mesh>(null)
  const shadowMat = useRef<MeshBasicMaterial>(null)
  const keys = useRef<Record<string, boolean>>({})
  const velY = useRef(0)
  const grounded = useRef(true)
  const lastJumpNonce = useRef(0)
  const animPhase = useRef(0)

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

    const moving = mag > 0.05 && grounded.current && s.mode !== 'lesson'
    if (moving) {
      animPhase.current += dt * (sprinting ? 11 : 7.5) * Math.min(1, mag)
    } else {
      animPhase.current += dt * 1.2
    }

    const legL = leftLegPivot.current
    const legR = rightLegPivot.current
    const armL = leftArmPivot.current
    const armR = rightArmPivot.current
    const torso = torsoPivot.current

    if (!grounded.current) {
      if (legL) legL.rotation.x = 0.22
      if (legR) legR.rotation.x = 0.14
      if (armL) armL.rotation.x = -0.28
      if (armR) armR.rotation.x = -0.28
      if (torso) torso.rotation.x = 0.04
    } else if (moving) {
      const swing = Math.sin(animPhase.current) * 0.44 * Math.min(1, mag)
      if (legL) legL.rotation.x = swing
      if (legR) legR.rotation.x = -swing
      if (armL) armL.rotation.x = -swing * 0.55
      if (armR) armR.rotation.x = swing * 0.55
      if (torso) torso.rotation.x = 0
    } else {
      const bob = Math.sin(animPhase.current) * 0.035
      const armSway = Math.sin(animPhase.current * 0.85) * 0.07
      if (legL) legL.rotation.x = bob * 0.3
      if (legR) legR.rotation.x = -bob * 0.3
      if (armL) armL.rotation.x = armSway
      if (armR) armR.rotation.x = -armSway
      if (torso) torso.rotation.x = bob
    }
  })

  // Fortnite-lite Riser silhouette: chunk plates, pack, boot blocks, amber visor helm.
  return (
    <group>
      <group ref={bodyRef} position={[rig.playerPos.x, rig.playerPos.y, rig.playerPos.z]}>
        <group ref={torsoPivot}>
          {/* Waist block */}
          <mesh position={[0, 0.6, 0]}>
            <boxGeometry args={[0.34, 0.18, 0.22]} />
            <meshStandardMaterial color={DEEP} {...MAT} />
          </mesh>
          {/* Chest plate */}
          <mesh position={[0, 0.82, 0.02]}>
            <boxGeometry args={[0.42, 0.36, 0.28]} />
            <meshStandardMaterial color={BODY} {...MAT_BODY} />
          </mesh>
          {/* Chest core — distance read anchor */}
          <mesh position={[0, 0.84, 0.28]}>
            <boxGeometry args={[0.18, 0.14, 0.06]} />
            <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={1.7} roughness={0.3} />
          </mesh>
          {/* Collar / neck bridge */}
          <mesh position={[0, 1.04, 0.02]}>
            <boxGeometry args={[0.22, 0.08, 0.18]} />
            <meshStandardMaterial color={SHADE} roughness={0.5} metalness={0.35} />
          </mesh>
          {/* Shoulder pads */}
          <mesh position={[-0.36, 0.94, 0.04]}>
            <boxGeometry args={[0.14, 0.1, 0.16]} />
            <meshStandardMaterial color={BODY_LT} roughness={0.5} metalness={0.35} />
          </mesh>
          <mesh position={[0.36, 0.94, 0.04]}>
            <boxGeometry args={[0.14, 0.1, 0.16]} />
            <meshStandardMaterial color={BODY_LT} roughness={0.5} metalness={0.35} />
          </mesh>
          <mesh position={[-0.36, 0.96, 0.12]}>
            <boxGeometry args={[0.08, 0.05, 0.04]} />
            <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={0.9} />
          </mesh>
          <mesh position={[0.36, 0.96, 0.12]}>
            <boxGeometry args={[0.08, 0.05, 0.04]} />
            <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={0.9} />
          </mesh>
          {/* Backpack */}
          <mesh position={[0, 0.8, -0.26]}>
            <boxGeometry args={[0.38, 0.42, 0.2]} />
            <meshStandardMaterial color={SHADE} {...MAT_PACK} />
          </mesh>
          <mesh position={[0, 0.86, -0.38]}>
            <boxGeometry args={[0.3, 0.1, 0.06]} />
            <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={1.2} />
          </mesh>
          <mesh position={[-0.1, 0.72, -0.36]}>
            <boxGeometry args={[0.06, 0.14, 0.04]} />
            <meshStandardMaterial color={DEEP} roughness={0.55} metalness={0.2} />
          </mesh>
          <mesh position={[0.1, 0.72, -0.36]}>
            <boxGeometry args={[0.06, 0.14, 0.04]} />
            <meshStandardMaterial color={DEEP} roughness={0.55} metalness={0.2} />
          </mesh>
          {/* Helm — boxy dome + ear guards */}
          <mesh position={[0, 1.24, 0.04]}>
            <boxGeometry args={[0.34, 0.28, 0.32]} />
            <meshStandardMaterial color={HELM} {...MAT_HELM} />
          </mesh>
          <mesh position={[-0.2, 1.22, 0.02]}>
            <boxGeometry args={[0.08, 0.14, 0.12]} />
            <meshStandardMaterial color={SHADE} roughness={0.45} metalness={0.4} />
          </mesh>
          <mesh position={[0.2, 1.22, 0.02]}>
            <boxGeometry args={[0.08, 0.14, 0.12]} />
            <meshStandardMaterial color={SHADE} roughness={0.45} metalness={0.4} />
          </mesh>
          {/* Amber visor band */}
          <mesh position={[0, 1.24, 0.2]}>
            <boxGeometry args={[0.3, 0.1, 0.06]} />
            <meshStandardMaterial color={AMBER} emissive={AMBER} emissiveIntensity={1.45} roughness={0.35} />
          </mesh>
          <mesh position={[0, 1.18, 0.18]}>
            <boxGeometry args={[0.22, 0.04, 0.05]} />
            <meshStandardMaterial color={AMBER} emissive={AMBER} emissiveIntensity={0.85} roughness={0.4} />
          </mesh>
        </group>

        {/* Left leg — hip pivot */}
        <group ref={leftLegPivot} position={[-0.15, 0.54, 0]}>
          <mesh position={[0, -0.14, 0]}>
            <capsuleGeometry args={[0.1, 0.22, 4, 8]} />
            <meshStandardMaterial color={DEEP} {...MAT} />
          </mesh>
          <mesh position={[0, -0.36, 0.02]} rotation={[0.08, 0, 0]}>
            <capsuleGeometry args={[0.09, 0.2, 4, 8]} />
            <meshStandardMaterial color={DEEP} {...MAT} />
          </mesh>
          <mesh position={[0, -0.5, 0.06]}>
            <boxGeometry args={[0.16, 0.1, 0.22]} />
            <meshStandardMaterial color={SHADE} roughness={0.5} metalness={0.35} />
          </mesh>
          <mesh position={[0, -0.52, 0.14]}>
            <boxGeometry args={[0.18, 0.06, 0.06]} />
            <meshStandardMaterial color={BODY_LT} roughness={0.45} metalness={0.3} />
          </mesh>
        </group>

        {/* Right leg */}
        <group ref={rightLegPivot} position={[0.15, 0.54, 0]}>
          <mesh position={[0, -0.14, 0]}>
            <capsuleGeometry args={[0.1, 0.22, 4, 8]} />
            <meshStandardMaterial color={DEEP} {...MAT} />
          </mesh>
          <mesh position={[0, -0.36, 0.02]} rotation={[0.08, 0, 0]}>
            <capsuleGeometry args={[0.09, 0.2, 4, 8]} />
            <meshStandardMaterial color={DEEP} {...MAT} />
          </mesh>
          <mesh position={[0, -0.5, 0.06]}>
            <boxGeometry args={[0.16, 0.1, 0.22]} />
            <meshStandardMaterial color={SHADE} roughness={0.5} metalness={0.35} />
          </mesh>
          <mesh position={[0, -0.52, 0.14]}>
            <boxGeometry args={[0.18, 0.06, 0.06]} />
            <meshStandardMaterial color={BODY_LT} roughness={0.45} metalness={0.3} />
          </mesh>
        </group>

        {/* Left arm — shoulder pivot */}
        <group ref={leftArmPivot} position={[-0.38, 0.92, 0.02]} rotation={[0, 0, 0.18]}>
          <mesh position={[0, -0.12, 0]}>
            <capsuleGeometry args={[0.08, 0.2, 4, 8]} />
            <meshStandardMaterial color={BODY_LT} roughness={0.55} metalness={0.2} />
          </mesh>
          <mesh position={[0, -0.3, 0.02]} rotation={[0, 0, -0.12]}>
            <capsuleGeometry args={[0.07, 0.18, 4, 8]} />
            <meshStandardMaterial color={BODY_LT} roughness={0.55} metalness={0.2} />
          </mesh>
          <mesh position={[0, -0.42, 0.05]}>
            <boxGeometry args={[0.1, 0.08, 0.1]} />
            <meshStandardMaterial color={SHADE} roughness={0.45} metalness={0.35} />
          </mesh>
        </group>

        {/* Right arm */}
        <group ref={rightArmPivot} position={[0.38, 0.92, 0.02]} rotation={[0, 0, -0.18]}>
          <mesh position={[0, -0.12, 0]}>
            <capsuleGeometry args={[0.08, 0.2, 4, 8]} />
            <meshStandardMaterial color={BODY_LT} roughness={0.55} metalness={0.2} />
          </mesh>
          <mesh position={[0, -0.3, 0.02]} rotation={[0, 0, 0.12]}>
            <capsuleGeometry args={[0.07, 0.18, 4, 8]} />
            <meshStandardMaterial color={BODY_LT} roughness={0.55} metalness={0.2} />
          </mesh>
          <mesh position={[0, -0.42, 0.05]}>
            <boxGeometry args={[0.1, 0.08, 0.1]} />
            <meshStandardMaterial color={SHADE} roughness={0.45} metalness={0.35} />
          </mesh>
        </group>
      </group>
      <mesh ref={shadowRef} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.48, 24]} />
        <meshBasicMaterial ref={shadowMat} color="#02080c" transparent opacity={0.4} depthWrite={false} />
      </mesh>
    </group>
  )
}
