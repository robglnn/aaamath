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
import { getProcTextureKit } from '@/game/proc'
import { ALPHA_RADIUS, BETA_CENTER, BETA_RADIUS, GATE_Z, TERMINAL_POS, groundHeight, rig } from '@/game/world'

const SKY = '#0b1a24'
const CYAN = '#3dd6c6'
const AMBER = '#f0a830'

/* ---------- Canvas-baked textures: procedural, offline-safe, zero font/CDN fetches ---------- */

function makeCanvas(w: number, h: number) {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  return { canvas, ctx: canvas.getContext('2d') }
}

const labelTexCache = new Map<string, CanvasTexture>()

/** Neon signage face: letter-spaced uppercase, colored glow passes + white hot core. */
function bakeLabelTexture(text: string, color: string): CanvasTexture {
  const key = `${text}|${color}`
  const cached = labelTexCache.get(key)
  if (cached) return cached
  const W = 1024
  const H = 256
  const { canvas, ctx } = makeCanvas(W, H)
  if (ctx) {
    const stack = '"Segoe UI", system-ui, -apple-system, sans-serif'
    const chars = [...text]
    // Manual letter-spacing — ctx.letterSpacing is missing on older Safari
    const measure = (size: number) => {
      ctx.font = `700 ${size}px ${stack}`
      const spacing = size * 0.16
      const widths = chars.map((c) => ctx.measureText(c).width)
      return { widths, spacing, total: widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1) }
    }
    let size = 120
    let lay = measure(size)
    while (lay.total > W * 0.9 && size > 44) {
      size -= 6
      lay = measure(size)
    }
    const stamp = (fill: string, glowBlur: number) => {
      ctx.font = `700 ${size}px ${stack}`
      ctx.textBaseline = 'middle'
      ctx.fillStyle = fill
      ctx.shadowColor = color
      ctx.shadowBlur = glowBlur
      let x = (W - lay.total) / 2
      chars.forEach((c, i) => {
        ctx.fillText(c, x, H / 2 + size * 0.05)
        x += lay.widths[i] + lay.spacing
      })
    }
    stamp(color, 34)
    stamp(color, 14)
    stamp('#ffffff', 5)
  }
  const tex = new CanvasTexture(canvas)
  tex.colorSpace = SRGBColorSpace
  tex.anisotropy = 4
  labelTexCache.set(key, tex)
  return tex
}

let floorMaps: { map: CanvasTexture; roughnessMap: CanvasTexture } | null = null

/** Procedural deck plating: speckle noise + panel seams + rivets, baked once at startup. */
function bakeFloorMaps() {
  if (floorMaps) return floorMaps
  const SIZE = 512
  const { canvas, ctx } = makeCanvas(SIZE, SIZE)
  if (ctx) {
    ctx.fillStyle = '#0d1722'
    ctx.fillRect(0, 0, SIZE, SIZE)
    const img = ctx.getImageData(0, 0, SIZE, SIZE)
    const d = img.data
    for (let i = 0; i < d.length; i += 4) {
      const n = (Math.random() - 0.5) * 13
      d[i] += n * 0.9
      d[i + 1] += n
      d[i + 2] += n * 1.15
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
    // Panel seams: dark groove + faint teal highlight edge
    for (let s = 0; s <= SIZE; s += 128) {
      ctx.fillStyle = '#070e15'
      ctx.fillRect(s - 1, 0, 2, SIZE)
      ctx.fillRect(0, s - 1, SIZE, 2)
      ctx.fillStyle = 'rgba(46,110,122,0.35)'
      ctx.fillRect(s + 1, 0, 1, SIZE)
      ctx.fillRect(0, s + 1, SIZE, 1)
    }
    // Rivets at seam corners
    ctx.fillStyle = 'rgba(88,150,164,0.5)'
    for (let x = 0; x <= SIZE; x += 128) {
      for (let y = 0; y <= SIZE; y += 128) {
        ctx.beginPath()
        ctx.arc(x + 6, y + 6, 2.2, 0, Math.PI * 2)
        ctx.fill()
      }
    }
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

/** Gradient dome texture: deep zenith easing into a teal band just above the horizon. */
function bakeSkyTexture(): CanvasTexture {
  const { canvas, ctx } = makeCanvas(64, 512)
  if (ctx) {
    const g = ctx.createLinearGradient(0, 0, 0, 512)
    g.addColorStop(0, '#040c15')
    g.addColorStop(0.3, '#08131f')
    g.addColorStop(0.42, '#0c1f2c')
    g.addColorStop(0.47, '#16424d')
    g.addColorStop(0.5, '#0f2c35')
    g.addColorStop(0.56, '#0a1822')
    g.addColorStop(1, '#050b12')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 64, 512)
    // Dither so the gradient doesn't band on low-end displays
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
      {/* Pedestal */}
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.72, 0.85, 0.36, 8]} />
        <meshStandardMaterial map={panel} color="#9ec8c4" metalness={0.45} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[1.35, 0.7, 0.8]} />
        <meshStandardMaterial map={panel} color="#a8d4d0" metalness={0.4} roughness={0.45} />
      </mesh>
      {/* Keyboard face plate + key caps */}
      <mesh position={[0, 0.4, 0.408]}>
        <boxGeometry args={[0.82, 0.14, 0.02]} />
        <meshStandardMaterial color="#142a36" metalness={0.55} roughness={0.5} />
      </mesh>
      {([-0.24, 0, 0.24] as const).map((x, i) => (
        <mesh key={i} position={[x, 0.4, 0.422]}>
          <boxGeometry args={[0.18, 0.06, 0.018]} />
          <meshStandardMaterial color="#1e3d4d" metalness={0.35} roughness={0.55} />
        </mesh>
      ))}
      {/* Status LEDs — power / link / ready */}
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
      {/* Power cable into deck */}
      <mesh position={[0.07, 0.02, -0.84]} rotation={[1.48, 0.31, 0]}>
        <cylinderGeometry args={[0.032, 0.042, 0.54, 6]} />
        <meshStandardMaterial color="#1a3040" metalness={0.35} roughness={0.65} />
      </mesh>
      {/* Readable screen + bezel */}
      <mesh position={[0, 1.05, 0.3]} rotation={[-0.42, 0, 0]}>
        <boxGeometry args={[1.12, 0.72, 0.08]} />
        <meshStandardMaterial color="#0d2430" metalness={0.5} roughness={0.35} />
      </mesh>
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

function ZoneLabel({ text, color, y = 1.6, faceY = 0 }: { text: string; color: string; y?: number; faceY?: number }) {
  // Canvas-baked neon face — offline-safe (troika Text pulls a CDN font at runtime)
  const tex = useMemo(() => bakeLabelTexture(text, color), [text, color])
  const bobRef = useRef<Group>(null)
  const width = Math.min(4.8, Math.max(2.8, text.length * 0.3))
  const h = width / 4

  useFrame((state) => {
    if (bobRef.current) {
      bobRef.current.position.y = y + Math.sin(state.clock.elapsedTime * 1.25 + faceY) * 0.045
    }
  })

  return (
    <group rotation={[0, faceY, 0]} name={text}>
      <group ref={bobRef} position={[0, y, 0]}>
        {/* Backing plate */}
        <mesh>
          <boxGeometry args={[width + 0.4, h + 0.32, 0.07]} />
          <meshStandardMaterial color="#08141c" metalness={0.55} roughness={0.35} />
        </mesh>
        {/* Baked neon face — meshBasic + toneMapped off keeps it legible from spawn */}
        <mesh position={[0, 0, 0.05]}>
          <planeGeometry args={[width, h]} />
          <meshBasicMaterial map={tex} transparent toneMapped={false} depthWrite={false} />
        </mesh>
        {/* Accent edge strips */}
        {[h / 2 + 0.14, -h / 2 - 0.14].map((ey) => (
          <mesh key={ey} position={[0, ey, 0.04]}>
            <boxGeometry args={[width + 0.4, 0.04, 0.02]} />
            <meshBasicMaterial color={color} toneMapped={false} />
          </mesh>
        ))}
      </group>
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

/** Gradient sky dome + additive horizon haze. Both ignore fog so the glow survives distance. */
function SkyAtmosphere() {
  const skyTex = useMemo(bakeSkyTexture, [])
  const horizonTex = useMemo(bakeHorizonTexture, [])
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
          color="#1e8a80"
          transparent
          opacity={0.55}
          blending={AdditiveBlending}
          side={BackSide}
          fog={false}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
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

/** One-shot burst at the gate — deferred until explore so lesson overlay doesn't eat the beat. */
function GateUnlockFx() {
  const unlocked = useGameStore((s) => s.hasZoneBeta)
  const prev = useRef<boolean | null>(null)
  const pending = useRef(false)
  const start = useRef(-1)
  const ringRef = useRef<Mesh>(null)
  const ringMat = useRef<MeshStandardMaterial>(null)
  const beamRef = useRef<Mesh>(null)
  const beamMat = useRef<MeshBasicMaterial>(null)
  const lightRef = useRef<PointLight>(null)

  useFrame((state) => {
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
        else start.current = t
      }
    }

    if (pending.current && mode !== 'lesson' && unlocked) {
      pending.current = false
      start.current = t
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
      <fog attach="fog" args={[SKY, 20, 62]} />
      <Stars radius={90} depth={50} count={3200} factor={3.4} saturation={0} fade speed={0.55} />
      <SkyAtmosphere />

      {/* Lighting: warm key + cool rim + pad pools; no postprocessing bloom (mobile-safe) */}
      <hemisphereLight args={['#9adfd6', '#0b1520', 0.7]} />
      <ambientLight intensity={0.22} color="#9fd9d4" />
      <directionalLight position={[8, 14, 6]} intensity={1.55} color="#ffe8c2" castShadow={false} />
      <directionalLight position={[-6, 4, -8]} intensity={0.5} color="#3dd6c6" />

      <DeckFloor />
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
      <AtmosphereFx />
      <AlphaPad />
      <group position={[-4.2, 0, 4.2]}>
        {/* Face the pad center so the sign reads from spawn/home-plate sightlines */}
        <ZoneLabel text="ZONE ALPHA" color={CYAN} y={1.55} faceY={Math.PI * 0.75} />
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
