import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, Mesh, MeshBasicMaterial } from 'three'
import { getAuthoredGeoKit, getProcTextureKit } from '@/game/proc'
import { PlayerLoco, type LocoState } from '@/game/PlayerLoco'
import { useGameStore } from '@/game/store'
import {
  BOUNDS,
  CRAWL_SPEED,
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
const VIOLET = '#b48cff'
const GOLD = '#e8c56a'
const MINT = '#5ecf9a'
const ICE = '#7eb8e8'

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
  const locoRef = useRef<LocoState>('idle')
  const [locoState, setLocoState] = useState<LocoState>('idle')
  const crawlHeld = useRef(false)
  const hasAdeptRank = useGameStore((s) => s.hasAdeptRank)
  const hasExpertRank = useGameStore((s) => s.hasExpertRank)
  const hasOperatorRank = useGameStore((s) => s.hasOperatorRank)
  const hasChiefRank = useGameStore((s) => s.hasChiefRank)
  const hasVanguardRank = useGameStore((s) => s.hasVanguardRank)
  const { panel } = useMemo(() => getProcTextureKit(), [])
  const geo = useMemo(() => getAuthoredGeoKit(), [])
  // Extrude UVs are shape-space (~0.45 wide), so rescale a clone of the shared
  // panel bake to land ~one full plate pattern across the cuirass and pack.
  const torsoPanel = useMemo(() => {
    const t = panel.clone()
    t.repeat.set(2.2, 1.9)
    t.needsUpdate = true
    return t
  }, [panel])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return
      keys.current[e.code] = true
      if (e.code === 'Space') {
        rig.jumpQueued = true
        e.preventDefault()
      }
      if (e.code === 'ControlLeft' || e.code === 'ControlRight' || e.code === 'KeyC') {
        crawlHeld.current = true
      }
    }
    const up = (e: KeyboardEvent) => {
      keys.current[e.code] = false
      if (e.code === 'ControlLeft' || e.code === 'ControlRight' || e.code === 'KeyC') {
        crawlHeld.current = !!(
          keys.current['ControlLeft'] ||
          keys.current['ControlRight'] ||
          keys.current['KeyC']
        )
      }
    }
    const clear = () => {
      keys.current = {}
      crawlHeld.current = false
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

    const crawling = grounded.current && (crawlHeld.current || s.touchCrawl)
    const sprinting =
      !crawling &&
      s.canSprint &&
      (k['ShiftLeft'] === true ||
        k['ShiftRight'] === true ||
        s.touchSprint ||
        mag > 0.92)
    const speed = crawling ? CRAWL_SPEED : sprinting ? SPRINT_SPEED : WALK_SPEED

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

    const gy = groundHeight(p.x, p.z, s.hasZoneBeta, s.blueprintPosition, s.hasBetaAnnex, s.hasGammaRelay, s.hasDeltaBalance, s.hasEpsilonCal, s.hasZetaMirror)
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

    let loco: LocoState = 'idle'
    if (!grounded.current) loco = 'jump'
    else if (crawling) loco = 'crawl'
    else if (mag > 0.05 && s.mode !== 'lesson') loco = sprinting ? 'run' : 'walk'
    if (locoRef.current !== loco) {
      locoRef.current = loco
      setLocoState(loco)
    }

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

  // Loop-3: Blender PBR hero GLB as primary silhouette; rank pips overlay for ladder read.
  // Profile-geo limbs stay mounted for walk anim fallback depth under the hero shell.
  return (
    <group>
      <group ref={bodyRef} position={[rig.playerPos.x, rig.playerPos.y, rig.playerPos.z]}>
        <group ref={torsoPivot}>
          <PlayerLoco state={locoState} />
          {/* Rank ladder pips — aligned to organic chest plate */}
          <mesh geometry={geo.playerPip} position={[0, 1.05, 0.18]} scale={[1.65, 2.2, 1]}>
            <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={1.7} roughness={0.3} />
          </mesh>
          {/* Profile-geo shell hidden while Blender hero owns silhouette (fallback kept in tree). */}
          <group visible={false}>
          <mesh geometry={geo.playerTorso} position={[0, 0.8, 0]}>
            <meshStandardMaterial map={torsoPanel} color={BODY} {...MAT_BODY} />
          </mesh>
          <mesh geometry={geo.playerPip} position={[0, 0.87, 0.148]} scale={[1.85, 2.5, 1]}>
            <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={1.7} roughness={0.3} />
          </mesh>
          <mesh geometry={geo.playerHelm} position={[0, 1.07, 0.03]}>
            <meshStandardMaterial color={HELM} {...MAT_HELM} />
          </mesh>
          <mesh geometry={geo.playerVisor} position={[0, 1.07, 0.03]}>
            <meshStandardMaterial color={AMBER} emissive={AMBER} emissiveIntensity={1.45} roughness={0.35} />
          </mesh>
          <mesh geometry={geo.playerPauldron} position={[-0.35, 0.955, 0.02]} rotation={[0, 0, 0.22]}>
            <meshStandardMaterial color={BODY_LT} roughness={0.5} metalness={0.35} />
          </mesh>
          <mesh geometry={geo.playerPauldron} position={[0.35, 0.955, 0.02]} rotation={[0, 0, -0.22]}>
            <meshStandardMaterial color={BODY_LT} roughness={0.5} metalness={0.35} />
          </mesh>
          <mesh geometry={geo.playerPip} position={[-0.35, 0.995, 0.146]} rotation={[-0.32, 0, 0]}>
            <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={0.9} />
          </mesh>
          <mesh geometry={geo.playerPip} position={[0.35, 0.995, 0.146]} rotation={[-0.32, 0, 0]}>
            <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={0.9} />
          </mesh>
          </group>
          {/* Riser Adept (L2 rank): amber second chevrons + cyan/amber dual chest mark */}
          {hasAdeptRank && (
            <>
              <mesh geometry={geo.playerPip} position={[-0.35, 1.045, 0.093]} rotation={[-0.5, 0, 0]} scale={[1, 0.55, 1]}>
                <meshStandardMaterial color={AMBER} emissive={AMBER} emissiveIntensity={1.35} />
              </mesh>
              <mesh geometry={geo.playerPip} position={[0.35, 1.045, 0.093]} rotation={[-0.5, 0, 0]} scale={[1, 0.55, 1]}>
                <meshStandardMaterial color={AMBER} emissive={AMBER} emissiveIntensity={1.35} />
              </mesh>
              <mesh geometry={geo.playerPip} position={[-0.055, 0.975, 0.146]} scale={0.6}>
                <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={1.6} />
              </mesh>
              <mesh geometry={geo.playerPip} position={[0.055, 0.975, 0.146]} scale={0.6}>
                <meshStandardMaterial color={AMBER} emissive={AMBER} emissiveIntensity={1.6} />
              </mesh>
            </>
          )}
          {/* Riser Expert (L3 rank): violet third chevrons over the amber tier + centered violet chest diamond */}
          {hasExpertRank && (
            <>
              <mesh geometry={geo.playerPip} position={[-0.35, 1.088, 0.052]} rotation={[-0.66, 0, 0]} scale={[0.9, 0.5, 1]}>
                <meshStandardMaterial color={VIOLET} emissive={VIOLET} emissiveIntensity={1.45} />
              </mesh>
              <mesh geometry={geo.playerPip} position={[0.35, 1.088, 0.052]} rotation={[-0.66, 0, 0]} scale={[0.9, 0.5, 1]}>
                <meshStandardMaterial color={VIOLET} emissive={VIOLET} emissiveIntensity={1.45} />
              </mesh>
              <mesh geometry={geo.playerPip} position={[0, 0.975, 0.152]} scale={0.42}>
                <meshStandardMaterial color={VIOLET} emissive={VIOLET} emissiveIntensity={1.7} />
              </mesh>
            </>
          )}
          {/* Riser Operator (L4 rank): gold fourth chevrons over the violet tier + centered gold chest mark */}
          {hasOperatorRank && (
            <>
              <mesh geometry={geo.playerPip} position={[-0.35, 1.121, 0.018]} rotation={[-0.82, 0, 0]} scale={[0.8, 0.45, 1]}>
                <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={1.5} />
              </mesh>
              <mesh geometry={geo.playerPip} position={[0.35, 1.121, 0.018]} rotation={[-0.82, 0, 0]} scale={[0.8, 0.45, 1]}>
                <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={1.5} />
              </mesh>
              <mesh geometry={geo.playerPip} position={[0, 1.005, 0.146]} scale={0.3}>
                <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={1.75} />
              </mesh>
            </>
          )}
          {/* Riser Chief (L5 rank): mint fifth chevrons over the gold tier + centered mint chest mark */}
          {hasChiefRank && (
            <>
              <mesh geometry={geo.playerPip} position={[-0.35, 1.152, -0.012]} rotation={[-0.95, 0, 0]} scale={[0.72, 0.4, 1]}>
                <meshStandardMaterial color={MINT} emissive={MINT} emissiveIntensity={1.55} />
              </mesh>
              <mesh geometry={geo.playerPip} position={[0.35, 1.152, -0.012]} rotation={[-0.95, 0, 0]} scale={[0.72, 0.4, 1]}>
                <meshStandardMaterial color={MINT} emissive={MINT} emissiveIntensity={1.55} />
              </mesh>
              <mesh geometry={geo.playerPip} position={[0, 1.032, 0.14]} scale={0.26}>
                <meshStandardMaterial color={MINT} emissive={MINT} emissiveIntensity={1.8} />
              </mesh>
            </>
          )}
          {/* Riser Vanguard (L6 rank): ice sixth chevrons over the mint tier + centered ice chest mark */}
          {hasVanguardRank && (
            <>
              <mesh geometry={geo.playerPip} position={[-0.35, 1.18, -0.038]} rotation={[-1.05, 0, 0]} scale={[0.65, 0.36, 1]}>
                <meshStandardMaterial color={ICE} emissive={ICE} emissiveIntensity={1.6} />
              </mesh>
              <mesh geometry={geo.playerPip} position={[0.35, 1.18, -0.038]} rotation={[-1.05, 0, 0]} scale={[0.65, 0.36, 1]}>
                <meshStandardMaterial color={ICE} emissive={ICE} emissiveIntensity={1.6} />
              </mesh>
              <mesh geometry={geo.playerPip} position={[0, 1.058, 0.136]} scale={0.22}>
                <meshStandardMaterial color={ICE} emissive={ICE} emissiveIntensity={1.85} />
              </mesh>
            </>
          )}
          <group visible={false}>
          <mesh geometry={geo.playerPack} position={[0, 0.82, -0.25]}>
            <meshStandardMaterial map={torsoPanel} color="#1a4255" {...MAT_PACK} />
          </mesh>
          <mesh geometry={geo.playerPackRoll} position={[0, 1.05, -0.26]}>
            <meshStandardMaterial color={DEEP} roughness={0.55} metalness={0.3} />
          </mesh>
          <mesh geometry={geo.playerPip} position={[0, 0.86, -0.352]} scale={[2.8, 1.1, 1]}>
            <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={1.2} />
          </mesh>
          </group>
        </group>

        <group visible={false}>
        <group ref={leftLegPivot} position={[-0.15, 0.54, 0]}>
          <mesh geometry={geo.playerLeg}>
            <meshStandardMaterial color={DEEP} {...MAT} />
          </mesh>
          <mesh geometry={geo.playerBoot} position={[0, -0.535, 0.01]}>
            <meshStandardMaterial color={SHADE} roughness={0.5} metalness={0.35} />
          </mesh>
        </group>
        <group ref={rightLegPivot} position={[0.15, 0.54, 0]}>
          <mesh geometry={geo.playerLeg}>
            <meshStandardMaterial color={DEEP} {...MAT} />
          </mesh>
          <mesh geometry={geo.playerBoot} position={[0, -0.535, 0.01]}>
            <meshStandardMaterial color={SHADE} roughness={0.5} metalness={0.35} />
          </mesh>
        </group>
        <group ref={leftArmPivot} position={[-0.38, 0.92, 0.02]} rotation={[0, 0, 0.18]}>
          <mesh geometry={geo.playerArm}>
            <meshStandardMaterial color={BODY_LT} roughness={0.55} metalness={0.2} />
          </mesh>
        </group>
        <group ref={rightArmPivot} position={[0.38, 0.92, 0.02]} rotation={[0, 0, -0.18]}>
          <mesh geometry={geo.playerArm}>
            <meshStandardMaterial color={BODY_LT} roughness={0.55} metalness={0.2} />
          </mesh>
        </group>
        </group>
      </group>
      <mesh ref={shadowRef} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.48, 24]} />
        <meshBasicMaterial ref={shadowMat} color="#02080c" transparent opacity={0.4} depthWrite={false} />
      </mesh>
    </group>
  )
}
