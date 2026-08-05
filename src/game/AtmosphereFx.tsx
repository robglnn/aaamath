import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, BufferAttribute, BufferGeometry, CanvasTexture, DynamicDrawUsage, SRGBColorSpace } from 'three'
import { ALPHA_RADIUS, TERMINAL_POS } from '@/game/world'

const MOTE_COUNT = 28 // 16 over Alpha pad + 12 around the terminal
const SPARKLE_COUNT = 12 // rim twinkles hugging the Alpha pad edge
const UPDATE_HZ = 30 // slow drift reads identical at half rate; halves attribute uploads

// Linear-space RGB so additive blending mixes cleanly with the scene palette
const CYAN: [number, number, number] = [0.24, 0.84, 0.78]
const AMBER: [number, number, number] = [0.94, 0.66, 0.19]
const PALE: [number, number, number] = [0.72, 0.94, 0.9]

interface Mote {
  base: [number, number, number]
  phase: [number, number, number]
  freq: [number, number, number]
  amp: [number, number, number]
  color: [number, number, number]
  twinklePhase: number
  twinkleFreq: number
  glow: number
}

interface Sparkle {
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
    if (i < 16) {
      // Alpha pad air volume: annulus so the spawn sightline stays clear
      const r = rand(1.2, ALPHA_RADIUS - 0.9)
      const a = Math.random() * Math.PI * 2
      bx = Math.cos(a) * r
      bz = Math.sin(a) * r
      by = rand(0.4, 2.7)
      color = Math.random() < 0.8 ? CYAN : PALE
    } else {
      // Terminal haze: tighter box around the kiosk, slightly taller column
      bx = TERMINAL_POS[0] + rand(-1.9, 1.9)
      bz = TERMINAL_POS[2] + rand(-1.9, 1.9)
      by = rand(0.6, 3.6)
      color = Math.random() < 0.65 ? CYAN : AMBER
    }
    const jitter = (lo: number, hi: number): [number, number, number] => [rand(lo, hi), rand(lo, hi), rand(lo, hi)]
    motes.push({
      base: [bx, by, bz],
      phase: [Math.random() * 6.28, Math.random() * 6.28, Math.random() * 6.28],
      freq: jitter(0.12, 0.34), // ~20–50 s periods: barely-there drift
      amp: [rand(0.3, 0.55), rand(0.22, 0.4), rand(0.3, 0.55)],
      color,
      twinklePhase: Math.random() * 6.28,
      twinkleFreq: rand(0.5, 1.1),
      glow: rand(0.35, 0.7),
    })
    // Seed t=0 state so the first painted frame isn't a clump at the origin
    const m = motes[i]
    motesPosArr[i * 3] = m.base[0] + Math.sin(m.phase[0]) * m.amp[0]
    motesPosArr[i * 3 + 1] = m.base[1] + Math.sin(m.phase[1]) * m.amp[1]
    motesPosArr[i * 3 + 2] = m.base[2] + Math.cos(m.phase[2]) * m.amp[2]
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

  return { tex: bakeSoftDot(), motesGeo, motesPos, motesCol, motes, sparkGeo, sparkCol, sparks }
}

/**
 * Floating dust motes + pad-edge sparkles. Two Points draw calls, one shared
 * canvas sprite, additive blending — no lights, no postprocessing, mobile-safe.
 */
export function AtmosphereFx() {
  const kit = useMemo(buildAtmosphere, [])
  const acc = useRef(0)

  useEffect(
    () => () => {
      kit.motesGeo.dispose()
      kit.sparkGeo.dispose()
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
      mp[i * 3] = m.base[0] + Math.sin(t * m.freq[0] + m.phase[0]) * m.amp[0]
      mp[i * 3 + 1] = m.base[1] + Math.sin(t * m.freq[1] + m.phase[1]) * m.amp[1]
      mp[i * 3 + 2] = m.base[2] + Math.cos(t * m.freq[2] + m.phase[2]) * m.amp[2]
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
  })

  return (
    <group>
      <points geometry={kit.motesGeo} frustumCulled={false}>
        <pointsMaterial
          map={kit.tex}
          size={0.3}
          sizeAttenuation
          vertexColors
          transparent
          opacity={0.55}
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
    </group>
  )
}
