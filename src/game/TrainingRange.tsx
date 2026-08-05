import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Grid, Stars } from '@react-three/drei'
import { AdditiveBlending, BackSide, CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three'
import type { Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, PointLight } from 'three'
import { useGameStore } from '@/game/store'
import { Player } from '@/game/Player'
import { BlueprintGhost } from '@/game/BlueprintGhost'
import { RangeDecor } from '@/game/RangeDecor'
import { AtmosphereFx } from '@/game/AtmosphereFx'
import { TerminalScreen } from '@/game/TerminalScreen'
import { UnlockCelebrationFx } from '@/game/UnlockCelebrationFx'
import { getAuthoredGeoKit, getProcTextureKit } from '@/game/proc'
import { L2UnlockProps } from '@/game/L2UnlockProps'
import { L3UnlockProps } from '@/game/L3UnlockProps'
import { L4UnlockProps } from '@/game/L4UnlockProps'
import { L5UnlockProps } from '@/game/L5UnlockProps'
import { L6UnlockProps } from '@/game/L6UnlockProps'
import { HeroModel } from '@/game/HeroGltf'
import { ZoneLabel, makeCanvas } from '@/game/ZoneLabel'
import { ALPHA_RADIUS, ANNEX_BRIDGE, ANNEX_CENTER, BETA_CENTER, BETA_RADIUS, DELTA_BRIDGE, DELTA_CENTER, EPSILON_BRIDGE, EPSILON_CENTER, GAMMA_BRIDGE, GAMMA_CENTER, GATE_Z, PAD_TOP, TERMINAL_POS, ZETA_BRIDGE, ZETA_CENTER, groundHeight, rig } from '@/game/world'

const SKY = '#3a5a88'
const FOG = '#4a6280'
const CYAN = '#3dd6c6'
const AMBER = '#f0a830'
const VIOLET = '#b48cff'
const GOLD = '#e8c56a'
const MINT = '#5ecf9a'
const ICE = '#7eb8e8'

/* ---------- Canvas-baked textures: procedural, offline-safe, zero font/CDN fetches ---------- */

let floorMaps: { map: CanvasTexture; roughnessMap: CanvasTexture } | null = null

/** Procedural deck plating: speckle noise + panel seams + rivets, baked once at startup. */
function bakeFloorMaps() {
  if (floorMaps) return floorMaps
  const SIZE = 512
  const { canvas, ctx } = makeCanvas(SIZE, SIZE)
  if (ctx) {
    ctx.fillStyle = '#1a2430'
    ctx.fillRect(0, 0, SIZE, SIZE)
    const img = ctx.getImageData(0, 0, SIZE, SIZE)
    const d = img.data
    for (let i = 0; i < d.length; i += 4) {
      const n = (Math.random() - 0.5) * 16
      // Warmer stone-plaza read vs pure charcoal void deck
      d[i] = 28 + n * 1.1
      d[i + 1] = 34 + n * 0.95
      d[i + 2] = 42 + n * 0.85
      d[i + 3] = 255
    }
    ctx.putImageData(img, 0, 0)
    // Wear blotches
    for (let i = 0; i < 9; i++) {
      const x = Math.random() * SIZE
      const y = Math.random() * SIZE
      const r = 40 + Math.random() * 90
      const g = ctx.createRadialGradient(x, y, 0, x, y, r)
      g.addColorStop(0, 'rgba(0,0,0,0.10)')
      g.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g
      ctx.fillRect(x - r, y - r, r * 2, r * 2)
    }
    // Panel seams: dark groove + faint warm highlight edge
    for (let s = 0; s <= SIZE; s += 128) {
      ctx.fillStyle = '#070e15'
      ctx.fillRect(s - 1, 0, 2, SIZE)
      ctx.fillRect(0, s - 1, SIZE, 2)
      ctx.fillStyle = 'rgba(120,95,55,0.28)'
      ctx.fillRect(s + 1, 0, 1, SIZE)
      ctx.fillRect(0, s + 1, SIZE, 1)
    }
    // Rivets at seam corners
    ctx.fillStyle = 'rgba(180,150,90,0.45)'
    for (let x = 0; x <= SIZE; x += 128) {
      for (let y = 0; y <= SIZE; y += 128) {
        ctx.beginPath()
        ctx.arc(x + 6, y + 6, 2.2, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    // Soft geometric seal etch (center tile feel when tiled — faint, game-range not debug)
    ctx.strokeStyle = 'rgba(61, 214, 198, 0.12)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(SIZE / 2, SIZE / 2, 48, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 - Math.PI / 2
      const x = SIZE / 2 + Math.cos(a) * 70
      const y = SIZE / 2 + Math.sin(a) * 70
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.closePath()
    ctx.stroke()
  }
  const map = new CanvasTexture(canvas)
  map.colorSpace = SRGBColorSpace
  map.wrapS = map.wrapT = RepeatWrapping
  map.repeat.set(11, 11)
  map.anisotropy = 8

  // Roughness companion: worn seams catch a slightly glossier sheen under pad lights
  const RS = 256
  const rc = makeCanvas(RS, RS)
  if (rc.ctx) {
    rc.ctx.fillStyle = '#c4c4c4'
    rc.ctx.fillRect(0, 0, RS, RS)
    const img = rc.ctx.getImageData(0, 0, RS, RS)
    const d = img.data
    for (let i = 0; i < d.length; i += 4) {
      const n = (Math.random() - 0.5) * 42
      d[i] += n
      d[i + 1] += n
      d[i + 2] += n
    }
    rc.ctx.putImageData(img, 0, 0)
    rc.ctx.fillStyle = '#8f8f8f'
    for (let s = 0; s <= RS; s += 64) {
      rc.ctx.fillRect(s - 1, 0, 3, RS)
      rc.ctx.fillRect(0, s - 1, RS, 3)
    }
  }
  const roughnessMap = new CanvasTexture(rc.canvas)
  roughnessMap.wrapS = roughnessMap.wrapT = RepeatWrapping
  roughnessMap.repeat.set(11, 11)
  roughnessMap.anisotropy = 8

  floorMaps = { map, roughnessMap }
  return floorMaps
}

/** Gradient dome: cool zenith → warm golden-hour horizon (Fortnite-ref game range). */
function bakeSkyTexture(): CanvasTexture {
  const { canvas, ctx } = makeCanvas(64, 512)
  if (ctx) {
    const g = ctx.createLinearGradient(0, 0, 0, 512)
    // Daylight hub sky — closer to Fortnite plaza refs than night void
    g.addColorStop(0, '#5a8ec8')
    g.addColorStop(0.22, '#7aa8d8')
    g.addColorStop(0.38, '#a8c4e0')
    g.addColorStop(0.48, '#d8c8a8')
    g.addColorStop(0.52, '#f0c080')
    g.addColorStop(0.58, '#c89860')
    g.addColorStop(0.68, '#6a7a90')
    g.addColorStop(1, '#2a3848')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 64, 512)
    // Soft cloud bands
    ctx.globalAlpha = 0.18
    for (let i = 0; i < 7; i++) {
      const y = 90 + i * 28 + (i % 3) * 6
      const grd = ctx.createRadialGradient(32, y, 2, 32, y, 28)
      grd.addColorStop(0, '#ffffff')
      grd.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = grd
      ctx.fillRect(0, y - 28, 64, 56)
    }
    ctx.globalAlpha = 1
    const img = ctx.getImageData(0, 0, 64, 512)
    const d = img.data
    for (let i = 0; i < d.length; i += 4) {
      const n = (Math.random() - 0.5) * 4
      d[i] += n
      d[i + 1] += n
      d[i + 2] += n
    }
    ctx.putImageData(img, 0, 0)
  }
  const tex = new CanvasTexture(canvas)
  tex.colorSpace = SRGBColorSpace
  return tex
}

/** Alpha-feathered haze band, brightest at the horizon line and fading upward. */
function bakeHorizonTexture(): CanvasTexture {
  const W = 64
  const H = 128
  const { canvas, ctx } = makeCanvas(W, H)
  if (ctx) {
    const img = ctx.createImageData(W, H)
    const d = img.data
    for (let y = 0; y < H; y++) {
      const a = Math.pow(y / (H - 1), 1.7) * 170
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4
        d[i] = 255
        d[i + 1] = 255
        d[i + 2] = 255
        d[i + 3] = a
      }
    }
    ctx.putImageData(img, 0, 0)
  }
  return new CanvasTexture(canvas)
}

function CameraRig() {
  useFrame((state, delta) => {
    const { playerYaw: yaw, playerPitch: pitch } = useGameStore.getState()
    const p = rig.playerPos
    const fx = -Math.sin(yaw)
    const fz = -Math.cos(yaw)
    // Loop 14: closer hero shoulder cam — sells organic hair/suit silhouette in first 10s
    const dist = 4.35
    const height = 2.15 + pitch * 2.0
    const tx = p.x - fx * dist
    const ty = p.y + height
    const tz = p.z - fz * dist
    const k = 1 - Math.exp(-delta * 7.8)
    const cam = state.camera.position
    cam.x += (tx - cam.x) * k
    cam.y += (ty - cam.y) * k
    cam.z += (tz - cam.z) * k
    const nudge = rig.gateCelebration
    const lookX = p.x * (1 - nudge * 0.25)
    const lookY = p.y + 1.28 + pitch * 0.6
    const lookZ = p.z * (1 - nudge * 0.25) + GATE_Z * nudge * 0.25
    state.camera.lookAt(lookX, lookY, lookZ)
  })
  return null
}

function AlphaPad() {
  const rimMat = useRef<MeshStandardMaterial>(null)
  const { hexPad } = useMemo(() => getProcTextureKit(), [])

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
      <mesh position={[0, 0.13, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[ALPHA_RADIUS - 0.35, 48]} />
        <meshStandardMaterial map={hexPad} color="#9fd9d4" metalness={0.25} roughness={0.7} />
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
  const ledMats = useRef<(MeshStandardMaterial | null)[]>([])
  const glowLight = useRef<PointLight>(null)
  const near = useGameStore((s) => s.nearTerminal)
  const { panel } = useMemo(() => getProcTextureKit(), [])
  const { terminalPedestal, terminalCollar, terminalHousing, terminalBezel, terminalKeydeck } = useMemo(
    () => getAuthoredGeoKit(),
    [],
  )

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
    for (let i = 0; i < ledMats.current.length; i++) {
      const m = ledMats.current[i]
      if (m) m.emissiveIntensity = (near ? 1.7 : 0.75) + Math.sin(t * 4.1 - i * 1.4) * 0.3
    }
  })

  return (
    <group position={TERMINAL_POS} rotation={[0, -0.62, 0]}>
      {/* Loop-3 authored terminal hero — sits under live screen / POI FX */}
      <HeroModel kind="terminal" scale={1.05} position={[0, 0, 0]} />
      {/* Profile terminal carcass hidden while Blender hero owns silhouette */}
      <group visible={false}>
      <mesh geometry={terminalPedestal} position={[0, 0, 0]}>
        <meshStandardMaterial map={panel} color="#9ec8c4" metalness={0.45} roughness={0.4} />
      </mesh>
      <mesh geometry={terminalCollar} position={[0, 0.36, 0]}>
        <meshStandardMaterial color="#7eb0ac" metalness={0.5} roughness={0.38} />
      </mesh>
      <mesh geometry={terminalHousing} position={[0, 0.55, 0]}>
        <meshStandardMaterial map={panel} color="#a8d4d0" metalness={0.4} roughness={0.45} />
      </mesh>
      <mesh geometry={terminalKeydeck} position={[0, 0.4, 0.408]}>
        <meshStandardMaterial color="#142a36" metalness={0.55} roughness={0.5} />
      </mesh>
      {([-0.24, 0, 0.24] as const).map((x, i) => (
        <mesh key={i} position={[x, 0.4, 0.422]}>
          <boxGeometry args={[0.18, 0.06, 0.018]} />
          <meshStandardMaterial color="#1e3d4d" metalness={0.35} roughness={0.55} />
        </mesh>
      ))}
      {(
        [
          { x: 0.38, color: '#4ae88a' },
          { x: 0.48, color: AMBER },
          { x: 0.58, color: CYAN },
        ] as const
      ).map((led, i) => (
        <mesh key={led.color} position={[led.x, 0.72, 0.412]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 0.02, 6]} />
          <meshStandardMaterial
            ref={(m) => {
              ledMats.current[i] = m
            }}
            color={led.color}
            emissive={led.color}
            emissiveIntensity={0.85}
          />
        </mesh>
      ))}
      <mesh position={[0.07, 0.02, -0.84]} rotation={[1.48, 0.31, 0]}>
        <cylinderGeometry args={[0.032, 0.042, 0.54, 6]} />
        <meshStandardMaterial color="#1a3040" metalness={0.35} roughness={0.65} />
      </mesh>
      <mesh geometry={terminalBezel} position={[0, 1.05, 0.3]} rotation={[-0.42, 0, 0]}>
        <meshStandardMaterial color="#0d2430" metalness={0.5} roughness={0.35} />
      </mesh>
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
      </group>
      <TerminalScreen ref={screenMat} emissive={CYAN} />
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
      {/* Proximity ring — ride Alpha pad top (terminal sits inside ALPHA_RADIUS) */}
      <mesh ref={ringRef} position={[0, PAD_TOP + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
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

/** Procedural deck floor — canvas-baked plating + roughness variation instead of flat #0a141d. */
function DeckFloor() {
  const { map, roughnessMap } = useMemo(bakeFloorMaps, [])
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
      <planeGeometry args={[90, 90]} />
      <meshStandardMaterial map={map} roughnessMap={roughnessMap} roughness={1} metalness={0.12} />
    </mesh>
  )
}

/** Gradient sky dome + additive horizon haze + soft god-ray wedges (no post stack). */
function SkyAtmosphere() {
  const skyTex = useMemo(bakeSkyTexture, [])
  const horizonTex = useMemo(bakeHorizonTexture, [])
  const rayRef = useRef<Group>(null)

  useFrame((state) => {
    if (!rayRef.current) return
    // Slow drift so rays feel alive without costing a bloom pass
    rayRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.08) * 0.04
  })

  return (
    <>
      <mesh renderOrder={-2} frustumCulled={false}>
        <sphereGeometry args={[180, 24, 16]} />
        <meshBasicMaterial map={skyTex} side={BackSide} fog={false} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh position={[0, 3.6, 0]} renderOrder={-1} frustumCulled={false}>
        <cylinderGeometry args={[80, 80, 8, 48, 1, true]} />
        <meshBasicMaterial
          map={horizonTex}
          color="#e8b070"
          transparent
          opacity={0.42}
          blending={AdditiveBlending}
          side={BackSide}
          fog={false}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      {/* Soft sun disc — silhouette cue without postprocessing bloom */}
      <mesh position={[42, 28, -55]} renderOrder={-1} frustumCulled={false}>
        <sphereGeometry args={[6.5, 16, 16]} />
        <meshBasicMaterial color="#ffd8a0" fog={false} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh position={[42, 28, -55]} renderOrder={-1} frustumCulled={false} scale={2.4}>
        <sphereGeometry args={[6.5, 12, 12]} />
        <meshBasicMaterial
          color="#ffb060"
          transparent
          opacity={0.22}
          blending={AdditiveBlending}
          fog={false}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      {/* Crepuscular ray wedges — mobile-safe additive planes aimed at sun */}
      <group ref={rayRef} position={[28, 18, -40]} rotation={[0.35, -0.55, 0.15]}>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh
            key={i}
            position={[0, 0, 0]}
            rotation={[0, 0, (i - 2) * 0.18]}
            renderOrder={-1}
            frustumCulled={false}
          >
            <planeGeometry args={[4 + i * 0.6, 52]} />
            <meshBasicMaterial
              color="#ffe2b0"
              transparent
              opacity={0.045 + (i % 2) * 0.02}
              blending={AdditiveBlending}
              fog={false}
              depthWrite={false}
              toneMapped={false}
              side={BackSide}
            />
          </mesh>
        ))}
      </group>
    </>
  )
}

function BetaZone() {
  const unlocked = useGameStore((s) => s.hasZoneBeta)
  const accent = unlocked ? CYAN : AMBER
  const holoRef = useRef<Mesh>(null)
  const scanRef = useRef<Mesh>(null)
  const scanMat = useRef<MeshStandardMaterial>(null)
  const { hexPad } = useMemo(() => getProcTextureKit(), [])

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
      <mesh position={[0, 0.13, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[BETA_RADIUS - 0.35, 48]} />
        <meshStandardMaterial map={hexPad} color={unlocked ? '#9fd9d4' : '#7a6a4a'} metalness={0.25} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.14, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[BETA_RADIUS - 0.25, 0.045, 8, 64]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={unlocked ? 1.4 : 0.42} />
      </mesh>
      {/* Blueprint pad payoff marker */}
      <mesh position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 4]}>
        <ringGeometry args={[1.2, 1.45, 4]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={unlocked ? 0.9 : 0.22} transparent opacity={unlocked ? 0.7 : 0.45} />
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
      <ZoneLabel
        text={unlocked ? 'ZONE BETA' : 'BETA LOCKED'}
        color={accent}
        y={unlocked ? 2.1 : 1.55}
        subdued={!unlocked}
      />
      <pointLight position={[0, 2.6, 0]} color={accent} intensity={unlocked ? 9 : 1.8} distance={12} decay={2} />
    </group>
  )
}

function BetaBarrier() {
  const unlocked = useGameStore((s) => s.hasZoneBeta)
  const accent = unlocked ? CYAN : AMBER
  const groupRef = useRef<Group>(null)
  const paneMat = useRef<MeshStandardMaterial>(null)
  // Turned gate pillars — authored lathe profile (plinth → shaft → capital)
  const { gatePillar, barrierPane } = useMemo(() => getAuthoredGeoKit(), [])

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
        // Locked: gentle energy shimmer — subdued so Terminal stays hero POI
        paneMat.current.opacity = 0.11 + Math.sin(state.clock.elapsedTime * 2.4) * 0.03
      }
    }
  })

  return (
    <>
      <group ref={groupRef} position={[0, 0, GATE_Z]}>
        <mesh geometry={barrierPane} position={[0, 0.95, 0]}>
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
          <mesh key={x} position={[x, 0, 0]} geometry={gatePillar}>
            <meshStandardMaterial color="#3a2c12" emissive={accent} emissiveIntensity={unlocked ? 1.1 : 0.45} metalness={0.4} roughness={0.4} />
          </mesh>
        ))}
        <mesh position={[0, 1.95, 0]}>
          <boxGeometry args={[6.0, 0.1, 0.2]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={unlocked ? 1.6 : 0.75} />
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


/**
 * L2 annex branch — stud x positions from inside the Beta pad, across the
 * bridge, to just inside the annex diamond. Tracks ANNEX_CENTER if it moves.
 */
const ANNEX_STUD_XS = Array.from({ length: 6 }, (_, i) => 1.2 + (i * (ANNEX_CENTER[0] - 1.1 - 1.2)) / 5)

/**
 * L3 gamma branch — stud x positions from inside the Beta pad west, across the
 * bridge, to just inside the relay hex. Tracks GAMMA_CENTER if it moves.
 */
const GAMMA_STUD_XS = Array.from({ length: 6 }, (_, i) => -1.2 + (i * (GAMMA_CENTER[0] + 1.1 + 1.2)) / 5)

/**
 * L4 delta branch — stud x positions from inside the Beta pad northeast,
 * across the bridge, to just inside the balance yard. Tracks DELTA_CENTER if
 * it moves; studs ride the DELTA_BRIDGE z line.
 */
const DELTA_STUD_XS = Array.from({ length: 6 }, (_, i) => 1.2 + (i * (DELTA_CENTER[0] - 1.1 - 1.2)) / 5)

/**
 * L5 epsilon branch — stud x positions from inside the Beta pad northwest,
 * across the bridge, to just inside the calibration forge. Tracks EPSILON_CENTER.
 */
const EPSILON_STUD_XS = Array.from({ length: 6 }, (_, i) => -1.2 + (i * (EPSILON_CENTER[0] + 1.1 + 1.2)) / 5)

/**
 * L6 zeta branch — stud x positions from inside Alpha east, across the bridge,
 * to just inside the mirror yard. Tracks ZETA_CENTER along z = 0.
 */
const ZETA_STUD_XS = Array.from({ length: 6 }, (_, i) => 1.2 + (i * (ZETA_CENTER[0] - 1.1 - 1.2)) / 5)

function GatePathLights() {
  const unlocked = useGameStore((s) => s.hasZoneBeta)
  const hasAnnex = useGameStore((s) => s.hasBetaAnnex)
  const hasGamma = useGameStore((s) => s.hasGammaRelay)
  const hasDelta = useGameStore((s) => s.hasDeltaBalance)
  const hasEpsilon = useGameStore((s) => s.hasEpsilonCal)
  const hasZeta = useGameStore((s) => s.hasZetaMirror)
  const mats = useRef<(MeshStandardMaterial | null)[]>([])
  const annexMats = useRef<(MeshStandardMaterial | null)[]>([])
  const gammaMats = useRef<(MeshStandardMaterial | null)[]>([])
  const deltaMats = useRef<(MeshStandardMaterial | null)[]>([])
  const epsilonMats = useRef<(MeshStandardMaterial | null)[]>([])
  const zetaMats = useRef<(MeshStandardMaterial | null)[]>([])
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
    // Annex studs continue the wave index so the light runs gate → Beta → annex
    for (let i = 0; i < annexMats.current.length; i++) {
      const m = annexMats.current[i]
      if (!m) continue
      const wave = Math.sin(t * 4.2 - (studs.length + i) * 1.1)
      m.emissiveIntensity = 0.55 + Math.max(0, wave) * 1.5
    }
    // Gamma studs follow the annex indices — same wave idiom, violet L3 accent
    for (let i = 0; i < gammaMats.current.length; i++) {
      const m = gammaMats.current[i]
      if (!m) continue
      const wave = Math.sin(t * 4.2 - (studs.length + ANNEX_STUD_XS.length + i) * 1.1)
      m.emissiveIntensity = 0.55 + Math.max(0, wave) * 1.5
    }
    // Delta studs follow the gamma indices — same wave idiom, gold L4 accent
    for (let i = 0; i < deltaMats.current.length; i++) {
      const m = deltaMats.current[i]
      if (!m) continue
      const wave = Math.sin(t * 4.2 - (studs.length + ANNEX_STUD_XS.length + GAMMA_STUD_XS.length + i) * 1.1)
      m.emissiveIntensity = 0.55 + Math.max(0, wave) * 1.5
    }
    // Epsilon studs follow the delta indices — mint L5 accent
    for (let i = 0; i < epsilonMats.current.length; i++) {
      const m = epsilonMats.current[i]
      if (!m) continue
      const wave = Math.sin(
        t * 4.2 - (studs.length + ANNEX_STUD_XS.length + GAMMA_STUD_XS.length + DELTA_STUD_XS.length + i) * 1.1,
      )
      m.emissiveIntensity = 0.55 + Math.max(0, wave) * 1.5
    }
    // Zeta studs follow the epsilon indices — ice L6 accent
    for (let i = 0; i < zetaMats.current.length; i++) {
      const m = zetaMats.current[i]
      if (!m) continue
      const wave = Math.sin(
        t * 4.2 -
          (studs.length + ANNEX_STUD_XS.length + GAMMA_STUD_XS.length + DELTA_STUD_XS.length + EPSILON_STUD_XS.length + i) *
            1.1,
      )
      m.emissiveIntensity = 0.55 + Math.max(0, wave) * 1.5
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
      {hasAnnex &&
        ANNEX_STUD_XS.map((x, i) => {
          const y = groundHeight(x, ANNEX_BRIDGE.z, true, null, true) + 0.045
          return (
            <mesh key={x} position={[x, y, ANNEX_BRIDGE.z]}>
              <cylinderGeometry args={[0.1, 0.13, 0.07, 8]} />
              <meshStandardMaterial
                ref={(m) => {
                  annexMats.current[i] = m
                }}
                color={CYAN}
                emissive={CYAN}
                emissiveIntensity={0.3}
              />
            </mesh>
          )
        })}
      {hasGamma &&
        GAMMA_STUD_XS.map((x, i) => {
          const y = groundHeight(x, GAMMA_BRIDGE.z, true, null, false, true) + 0.045
          return (
            <mesh key={x} position={[x, y, GAMMA_BRIDGE.z]}>
              <cylinderGeometry args={[0.1, 0.13, 0.07, 8]} />
              <meshStandardMaterial
                ref={(m) => {
                  gammaMats.current[i] = m
                }}
                color={VIOLET}
                emissive={VIOLET}
                emissiveIntensity={0.3}
              />
            </mesh>
          )
        })}
      {hasDelta &&
        DELTA_STUD_XS.map((x, i) => {
          const y = groundHeight(x, DELTA_BRIDGE.z, true, null, false, false, true) + 0.045
          return (
            <mesh key={x} position={[x, y, DELTA_BRIDGE.z]}>
              <cylinderGeometry args={[0.1, 0.13, 0.07, 8]} />
              <meshStandardMaterial
                ref={(m) => {
                  deltaMats.current[i] = m
                }}
                color={GOLD}
                emissive={GOLD}
                emissiveIntensity={0.3}
              />
            </mesh>
          )
        })}
      {hasEpsilon &&
        EPSILON_STUD_XS.map((x, i) => {
          const y = groundHeight(x, EPSILON_BRIDGE.z, true, null, false, false, false, true) + 0.045
          return (
            <mesh key={`eps-${x}`} position={[x, y, EPSILON_BRIDGE.z]}>
              <cylinderGeometry args={[0.1, 0.13, 0.07, 8]} />
              <meshStandardMaterial
                ref={(m) => {
                  epsilonMats.current[i] = m
                }}
                color={MINT}
                emissive={MINT}
                emissiveIntensity={0.3}
              />
            </mesh>
          )
        })}
      {hasZeta &&
        ZETA_STUD_XS.map((x, i) => {
          const y = groundHeight(x, ZETA_BRIDGE.z, true, null, false, false, false, false, true) + 0.045
          return (
            <mesh key={`zeta-${x}`} position={[x, y, ZETA_BRIDGE.z]}>
              <cylinderGeometry args={[0.1, 0.13, 0.07, 8]} />
              <meshStandardMaterial
                ref={(m) => {
                  zetaMats.current[i] = m
                }}
                color={ICE}
                emissive={ICE}
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
      <fog attach="fog" args={[FOG, 36, 95]} />
      <Stars radius={90} depth={50} count={1800} factor={2.6} saturation={0.15} fade speed={0.35} />
      <SkyAtmosphere />

      {/* Fortnite-hub daylight: warm key, cool rim, soft fill — sells sculpted PBR */}
      <hemisphereLight args={['#d8e8ff', '#3a2a18', 0.72]} />
      <ambientLight intensity={0.38} color="#ffe8d0" />
      <directionalLight position={[16, 22, 10]} intensity={2.35} color="#ffe0b0" castShadow={false} />
      <directionalLight position={[-10, 8, -12]} intensity={0.55} color="#8ec8f0" />
      <directionalLight position={[2, 6, 8]} intensity={0.45} color="#3dd6c6" />
      <directionalLight position={[-4, 3, 6]} intensity={0.7} color="#fff2d8" />
      {/* Loop 14: warm hero rim — sells hair/suit silhouette vs daylight fill */}
      <directionalLight position={[4, 5, 3]} intensity={0.85} color="#ffd8a8" />
      <directionalLight position={[-6, 4, -2]} intensity={0.55} color="#6ec8ff" />

      <DeckFloor />
      {/* Navigation grit only — faded, warm charcoal; no cyan section grid */}
      <Grid
        position={[0, 0.01, 0]}
        infiniteGrid
        cellSize={2}
        cellThickness={0.28}
        cellColor="#1a222c"
        sectionSize={10}
        sectionThickness={0.55}
        sectionColor="#2a3340"
        fadeDistance={36}
        fadeStrength={1.8}
      />

      <RangeDecor />
      <AtmosphereFx />
      <AlphaPad />
      <group position={[-4.2, 0, 4.2]}>
        {/* Face the pad center so the sign reads from spawn/home-plate sightlines */}
        <ZoneLabel text="ZONE ALPHA" color={CYAN} y={1.55} faceY={Math.PI * 0.75} />
      </group>
      {/* Authored zone beacon — Alpha POI silhouette vs glyph-only bars */}
      <HeroModel kind="zone" scale={1.15} position={[-3.6, 0, 3.4]} />
      <HeroModel kind="blueprint" scale={0.85} position={[2.4, 0, 3.8]} />
      <Terminal />
      <BetaZone />
      <BetaBarrier />
      <UnlockCelebrationFx />
      <GatePathLights />
      <L2UnlockProps />
      <L3UnlockProps />
      <L4UnlockProps />
      <L5UnlockProps />
      <L6UnlockProps />
      <Player />
      <BlueprintGhost />
      <CameraRig />
    </>
  )
}
