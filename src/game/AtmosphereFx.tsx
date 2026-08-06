import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, BufferAttribute, BufferGeometry, CanvasTexture, DynamicDrawUsage, SRGBColorSpace } from 'three'
import { ALPHA_RADIUS, TERMINAL_POS } from '@/game/world'

const MOTE_COUNT = 78 // loop 80: denser swirl + god-ray volume amber motes
const SPARKLE_COUNT = 22 // rim twinkles hugging the Alpha pad edge
const ORBIT_COUNT = 12 // orbiting math-symbol spark trails near Alpha pad
const UPDATE_HZ = 30 // slow drift reads identical at half rate; halves attribute uploads

// Linear-space RGB so additive blending mixes cleanly with the scene palette
const CYAN: [number, number, number] = [0.24, 0.84, 0.78]
const AMBER: [number, number, number] = [0.94, 0.66, 0.19]
const PALE: [number, number, number] = [0.72, 0.94, 0.9]
const GOLD: [number, number, number] = [1.0, 0.82, 0.42]

interface Mote {
  base: [number, number, number]
  phase: [number, number, number]
  freq: [number, number, number]
  amp: [number, number, number]
  color: [number, number, number]
  twinklePhase: number
  twinkleFreq: number
  glow: number
  swirl: number
}

interface Sparkle {
  color: [number, number, number]
  twinklePhase: number
  twinkleFreq: number
}

interface OrbitSpark {
  radius: number
  height: number
  speed: number
  phase: number
  color: [number, number, number]
  twinklePhase: number
  twinkleFreq: number
}

interface AtmosphereKit {
  tex: CanvasTexture
  motesGeo: BufferGeometry
  motesPos: BufferAttribute
  motesCol: BufferAttribute
  motes: Mote[]
  sparkGeo: BufferGeometry
  sparkCol: BufferAttribute
  sparks: Sparkle[]
  orbitGeo: BufferGeometry
  orbitPos: BufferAttribute
  orbitCol: BufferAttribute
  orbits: OrbitSpark[]
}

let softDot: CanvasTexture | null = null

/** 64px radial sprite — soft falloff so points read as dust motes, not hard pixels. */
function bakeSoftDot(): CanvasTexture {
  if (softDot) return softDot
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  if (ctx) {
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    g.addColorStop(0, 'rgba(255,255,255,1)')
    g.addColorStop(0.3, 'rgba(255,255,255,0.7)')
    g.addColorStop(0.7, 'rgba(255,255,255,0.12)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 64, 64)
  }
  const tex = new CanvasTexture(canvas)
  tex.colorSpace = SRGBColorSpace
  softDot = tex
  return tex
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function buildAtmosphere(): AtmosphereKit {
  const motes: Mote[] = []
  const motesPosArr = new Float32Array(MOTE_COUNT * 3)
  const motesColArr = new Float32Array(MOTE_COUNT * 3)

  for (let i = 0; i < MOTE_COUNT; i++) {
    let bx: number
    let by: number
    let bz: number
    let color: [number, number, number]
    if (i < 22) {
      // Alpha pad air volume: annulus so the spawn sightline stays clear
      const r = rand(1.2, ALPHA_RADIUS - 0.7)
      const a = Math.random() * Math.PI * 2
      bx = Math.cos(a) * r
      bz = Math.sin(a) * r
      by = rand(0.4, 2.9)
      color = Math.random() < 0.7 ? CYAN : Math.random() < 0.55 ? PALE : AMBER
    } else if (i < 48) {
      // Terminal haze: tighter box around the kiosk, slightly taller column
      bx = TERMINAL_POS[0] + rand(-1.9, 1.9)
      bz = TERMINAL_POS[2] + rand(-1.9, 1.9)
      by = rand(0.6, 3.6)
      color = Math.random() < 0.6 ? CYAN : AMBER
    } else {
      // Loop 80: god-ray volume — golden amber dust drifting in sun shafts
      bx = rand(4, 28)
      by = rand(2.5, 14)
      bz = rand(-42, -12)
      color = Math.random() < 0.65 ? GOLD : AMBER
    }
    const jitter = (lo: number, hi: number): [number, number, number] => [rand(lo, hi), rand(lo, hi), rand(lo, hi)]
    motes.push({
      base: [bx, by, bz],
      phase: [Math.random() * 6.28, Math.random() * 6.28, Math.random() * 6.28],
      freq: jitter(0.14, 0.38), // slightly faster for subtle swirl
      amp: [rand(0.32, 0.58), rand(0.24, 0.42), rand(0.32, 0.58)],
      color,
      twinklePhase: Math.random() * 6.28,
      twinkleFreq: rand(0.5, 1.1),
      glow: rand(0.38, 0.75),
      swirl: rand(0.4, 1.2),
    })
    // Seed t=0 state so the first painted frame isn't a clump at the origin
    const m = motes[i]
    const sa = m.phase[0]
    motesPosArr[i * 3] = m.base[0] + Math.sin(sa) * m.amp[0] + Math.cos(sa * m.swirl) * 0.15
    motesPosArr[i * 3 + 1] = m.base[1] + Math.sin(m.phase[1]) * m.amp[1]
    motesPosArr[i * 3 + 2] = m.base[2] + Math.cos(m.phase[2]) * m.amp[2] + Math.sin(sa * m.swirl) * 0.15
    const b = m.glow * (0.55 + 0.45 * Math.sin(m.twinklePhase))
    motesColArr[i * 3] = m.color[0] * b
    motesColArr[i * 3 + 1] = m.color[1] * b
    motesColArr[i * 3 + 2] = m.color[2] * b
  }

  const sparks: Sparkle[] = []
  const sparkPosArr = new Float32Array(SPARKLE_COUNT * 3)
  const sparkColArr = new Float32Array(SPARKLE_COUNT * 3)
  for (let i = 0; i < SPARKLE_COUNT; i++) {
    // Evenly spaced around the rim with jitter so it reads organic, not CAD
    const a = (i / SPARKLE_COUNT) * Math.PI * 2 + rand(-0.16, 0.16)
    const r = ALPHA_RADIUS - 0.25 + rand(-0.14, 0.14)
    sparkPosArr[i * 3] = Math.cos(a) * r
    sparkPosArr[i * 3 + 1] = rand(0.18, 0.3)
    sparkPosArr[i * 3 + 2] = Math.sin(a) * r
    sparks.push({
      color: Math.random() < 0.7 ? PALE : CYAN,
      twinklePhase: Math.random() * 6.28,
      twinkleFreq: rand(0.7, 1.6),
    })
    const s = sparks[i]
    const b = 0.06 + Math.pow(Math.max(0, Math.sin(s.twinklePhase)), 6) * 1.35
    sparkColArr[i * 3] = s.color[0] * b
    sparkColArr[i * 3 + 1] = s.color[1] * b
    sparkColArr[i * 3 + 2] = s.color[2] * b
  }

  const orbits: OrbitSpark[] = []
  const orbitPosArr = new Float32Array(ORBIT_COUNT * 3)
  const orbitColArr = new Float32Array(ORBIT_COUNT * 3)
  for (let i = 0; i < ORBIT_COUNT; i++) {
    orbits.push({
      radius: rand(1.6, ALPHA_RADIUS - 0.5),
      height: rand(0.8, 2.4),
      speed: rand(0.35, 0.75) * (Math.random() < 0.5 ? 1 : -1),
      phase: (i / ORBIT_COUNT) * Math.PI * 2 + rand(-0.3, 0.3),
      color: Math.random() < 0.55 ? CYAN : AMBER,
      twinklePhase: Math.random() * 6.28,
      twinkleFreq: rand(0.9, 1.8),
    })
    const o = orbits[i]
    orbitPosArr[i * 3] = Math.cos(o.phase) * o.radius
    orbitPosArr[i * 3 + 1] = o.height
    orbitPosArr[i * 3 + 2] = Math.sin(o.phase) * o.radius
    const b = 0.5 + Math.sin(o.twinklePhase) * 0.25
    orbitColArr[i * 3] = o.color[0] * b
    orbitColArr[i * 3 + 1] = o.color[1] * b
    orbitColArr[i * 3 + 2] = o.color[2] * b
  }

  const motesGeo = new BufferGeometry()
  const motesPos = new BufferAttribute(motesPosArr, 3)
  motesPos.setUsage(DynamicDrawUsage)
  const motesCol = new BufferAttribute(motesColArr, 3)
  motesCol.setUsage(DynamicDrawUsage)
  motesGeo.setAttribute('position', motesPos)
  motesGeo.setAttribute('color', motesCol)

  const sparkGeo = new BufferGeometry()
  sparkGeo.setAttribute('position', new BufferAttribute(sparkPosArr, 3))
  const sparkCol = new BufferAttribute(sparkColArr, 3)
  sparkCol.setUsage(DynamicDrawUsage)
  sparkGeo.setAttribute('color', sparkCol)

  const orbitGeo = new BufferGeometry()
  const orbitPos = new BufferAttribute(orbitPosArr, 3)
  orbitPos.setUsage(DynamicDrawUsage)
  const orbitCol = new BufferAttribute(orbitColArr, 3)
  orbitCol.setUsage(DynamicDrawUsage)
  orbitGeo.setAttribute('position', orbitPos)
  orbitGeo.setAttribute('color', orbitCol)

  return { tex: bakeSoftDot(), motesGeo, motesPos, motesCol, motes, sparkGeo, sparkCol, sparks, orbitGeo, orbitPos, orbitCol, orbits }
}

/**
 * Floating dust motes + pad-edge sparkles + orbiting symbol trails.
 * Three Points draw calls, one shared canvas sprite, additive blending —
 * no lights, no postprocessing, mobile-safe.
 */
export function AtmosphereFx() {
  const kit = useMemo(buildAtmosphere, [])
  const acc = useRef(0)

  useEffect(
    () => () => {
      kit.motesGeo.dispose()
      kit.sparkGeo.dispose()
      kit.orbitGeo.dispose()
    },
    [kit],
  )

  useFrame((state, delta) => {
    acc.current += delta
    if (acc.current < 1 / UPDATE_HZ) return
    acc.current %= 1 / UPDATE_HZ
    // Absolute clock: positions stay phase-correct across throttled writes
    const t = state.clock.elapsedTime

    const mp = kit.motesPos.array as Float32Array
    const mc = kit.motesCol.array as Float32Array
    for (let i = 0; i < kit.motes.length; i++) {
      const m = kit.motes[i]
      const sa = t * m.freq[0] + m.phase[0]
      // Subtle swirl offset for Alpha-pad motes
      const swirlX = i < 22 ? Math.cos(sa * m.swirl) * 0.22 : i >= 48 ? Math.cos(sa * 0.4) * 0.35 : 0
      const swirlZ = i < 22 ? Math.sin(sa * m.swirl) * 0.22 : i >= 48 ? Math.sin(sa * 0.35) * 0.45 : 0
      mp[i * 3] = m.base[0] + Math.sin(sa) * m.amp[0] + swirlX
      mp[i * 3 + 1] = m.base[1] + Math.sin(t * m.freq[1] + m.phase[1]) * m.amp[1]
      mp[i * 3 + 2] = m.base[2] + Math.cos(t * m.freq[2] + m.phase[2]) * m.amp[2] + swirlZ
      const b = m.glow * (0.55 + 0.45 * Math.sin(t * m.twinkleFreq + m.twinklePhase))
      mc[i * 3] = m.color[0] * b
      mc[i * 3 + 1] = m.color[1] * b
      mc[i * 3 + 2] = m.color[2] * b
    }
    kit.motesPos.needsUpdate = true
    kit.motesCol.needsUpdate = true

    // Sparkles hold position; sharp pow-curve blink lives in the color channel only
    const sc = kit.sparkCol.array as Float32Array
    for (let i = 0; i < kit.sparks.length; i++) {
      const s = kit.sparks[i]
      const tw = Math.pow(Math.max(0, Math.sin(t * s.twinkleFreq + s.twinklePhase)), 6)
      const b = 0.06 + tw * 1.35
      sc[i * 3] = s.color[0] * b
      sc[i * 3 + 1] = s.color[1] * b
      sc[i * 3 + 2] = s.color[2] * b
    }
    kit.sparkCol.needsUpdate = true

    // Orbiting cyan/amber spark trails near Alpha pad
    const op = kit.orbitPos.array as Float32Array
    const oc = kit.orbitCol.array as Float32Array
    for (let i = 0; i < kit.orbits.length; i++) {
      const o = kit.orbits[i]
      const a = t * o.speed + o.phase
      op[i * 3] = Math.cos(a) * o.radius
      op[i * 3 + 1] = o.height + Math.sin(t * 0.6 + o.phase) * 0.18
      op[i * 3 + 2] = Math.sin(a) * o.radius
      const tw = Math.pow(Math.max(0, Math.sin(t * o.twinkleFreq + o.twinklePhase)), 4)
      const b = 0.35 + tw * 0.85
      oc[i * 3] = o.color[0] * b
      oc[i * 3 + 1] = o.color[1] * b
      oc[i * 3 + 2] = o.color[2] * b
    }
    kit.orbitPos.needsUpdate = true
    kit.orbitCol.needsUpdate = true
  })

  return (
    <group>
      <points geometry={kit.motesGeo} frustumCulled={false}>
        <pointsMaterial
          map={kit.tex}
          size={0.34}
          sizeAttenuation
          vertexColors
          transparent
          opacity={0.64}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </points>
      <points geometry={kit.sparkGeo} frustumCulled={false}>
        <pointsMaterial
          map={kit.tex}
          size={0.16}
          sizeAttenuation
          vertexColors
          transparent
          opacity={0.95}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </points>
      <points geometry={kit.orbitGeo} frustumCulled={false}>
        <pointsMaterial
          map={kit.tex}
          size={0.22}
          sizeAttenuation
          vertexColors
          transparent
          opacity={0.88}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  )
}
