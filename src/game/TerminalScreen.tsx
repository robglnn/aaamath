import { forwardRef, useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CanvasTexture, SRGBColorSpace } from 'three'
import type { MeshStandardMaterial } from 'three'

const CYAN = '#3dd6c6'
const AMBER = '#f0a830'
const BG = '#061820'

const W = 256
const H = 148

/** Fake equation lines — static layout, opacity flickers in the draw loop. */
const EQUATIONS: { text: string; x: number; y: number; accent?: boolean }[] = [
  { text: 'x\u00B2 + 3x \u2212 7 = 0', x: 14, y: 28, accent: true },
  { text: 'dy/dx = 2x', x: 14, y: 48 },
  { text: '\u222B\u2080\u00B9 x dx', x: 14, y: 68 },
  { text: '\u03BB = ?', x: 14, y: 88, accent: true },
  { text: '\u03A3 n=1..n', x: 148, y: 38 },
  { text: 'a\u00B2 + b\u00B2 = c\u00B2', x: 148, y: 58 },
  { text: 'lim \u0394x\u21920', x: 148, y: 78 },
  { text: 'f(x) = mx + b', x: 148, y: 98 },
]

function drawChrome(ctx: CanvasRenderingContext2D): void {
  const pad = 6
  const len = 14
  ctx.lineWidth = 1.5
  ctx.strokeStyle = CYAN
  const corners: [number, number, number, number][] = [
    [pad, pad, 1, 1],
    [W - pad, pad, -1, 1],
    [pad, H - pad, 1, -1],
    [W - pad, H - pad, -1, -1],
  ]
  for (const [cx, cy, sx, sy] of corners) {
    ctx.beginPath()
    ctx.moveTo(cx, cy + sy * len)
    ctx.lineTo(cx, cy)
    ctx.lineTo(cx + sx * len, cy)
    ctx.stroke()
  }
  // Amber status tick — top-right inner
  ctx.fillStyle = AMBER
  ctx.fillRect(W - 28, 10, 10, 3)
  ctx.fillStyle = 'rgba(240,168,48,0.35)'
  ctx.fillRect(W - 30, 8, 14, 7)
}

function drawGrid(ctx: CanvasRenderingContext2D): void {
  ctx.strokeStyle = 'rgba(61,214,198,0.06)'
  ctx.lineWidth = 1
  const step = 16
  for (let x = 0; x <= W; x += step) {
    ctx.beginPath()
    ctx.moveTo(x + 0.5, 0)
    ctx.lineTo(x + 0.5, H)
    ctx.stroke()
  }
  for (let y = 0; y <= H; y += step) {
    ctx.beginPath()
    ctx.moveTo(0, y + 0.5)
    ctx.lineTo(W, y + 0.5)
    ctx.stroke()
  }
  // Brighter major lines
  ctx.strokeStyle = 'rgba(61,214,198,0.1)'
  for (let x = 0; x <= W; x += step * 4) {
    ctx.beginPath()
    ctx.moveTo(x + 0.5, 0)
    ctx.lineTo(x + 0.5, H)
    ctx.stroke()
  }
}

function drawEquations(ctx: CanvasRenderingContext2D, t: number): void {
  ctx.font = '11px "Courier New", Courier, monospace'
  for (let i = 0; i < EQUATIONS.length; i++) {
    const eq = EQUATIONS[i]!
    const flicker = 0.55 + Math.sin(t * 2.1 + i * 1.7) * 0.2
    ctx.fillStyle = eq.accent
      ? `rgba(240,168,48,${(0.7 * flicker).toFixed(3)})`
      : `rgba(61,214,198,${(0.45 * flicker).toFixed(3)})`
    ctx.fillText(eq.text, eq.x, eq.y)
  }
}

function drawScanline(ctx: CanvasRenderingContext2D, t: number): void {
  const cycle = (t % 2.4) / 2.4
  const y = cycle * (H + 24) - 12
  const grad = ctx.createLinearGradient(0, y - 8, 0, y + 8)
  grad.addColorStop(0, 'rgba(61,214,198,0)')
  grad.addColorStop(0.45, 'rgba(61,214,198,0.12)')
  grad.addColorStop(0.5, 'rgba(240,168,48,0.35)')
  grad.addColorStop(0.55, 'rgba(61,214,198,0.12)')
  grad.addColorStop(1, 'rgba(61,214,198,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, y - 10, W, 20)
}

function drawVignette(ctx: CanvasRenderingContext2D): void {
  const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.85)
  g.addColorStop(0, 'rgba(0,0,0,0)')
  g.addColorStop(1, 'rgba(0,0,0,0.45)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)
}

function paintFrame(ctx: CanvasRenderingContext2D, t: number): void {
  ctx.fillStyle = BG
  ctx.fillRect(0, 0, W, H)
  drawGrid(ctx)
  drawEquations(ctx, t)
  drawChrome(ctx)
  drawScanline(ctx, t)
  drawVignette(ctx)
}

export interface TerminalScreenProps {
  position?: [number, number, number]
  rotation?: [number, number, number]
  emissive?: string
}

/**
 * Procedural terminal display — canvas-baked texture with soft grid,
 * equation glyphs, chrome corners, and an animated scanline.
 * Texture redraw is throttled to every 4 frames.
 */
export const TerminalScreen = forwardRef<MeshStandardMaterial, TerminalScreenProps>(
  function TerminalScreen(
    { position = [0, 1.05, 0.35], rotation = [-0.42, 0, 0], emissive = CYAN },
    materialRef,
  ) {
    const frameCount = useRef(0)

    const { texture, ctx } = useMemo(() => {
      const canvas = document.createElement('canvas')
      canvas.width = W
      canvas.height = H
      const context = canvas.getContext('2d')
      if (!context) throw new Error('TerminalScreen: 2D canvas unavailable')
      const tex = new CanvasTexture(canvas)
      tex.colorSpace = SRGBColorSpace
      paintFrame(context, 0)
      return { texture: tex, ctx: context }
    }, [])

    useEffect(() => () => texture.dispose(), [texture])

    useFrame((state) => {
      frameCount.current++
      if (frameCount.current % 4 !== 0) return
      paintFrame(ctx, state.clock.elapsedTime)
      texture.needsUpdate = true
    })

    return (
      <mesh position={position} rotation={rotation}>
        <planeGeometry args={[0.95, 0.55]} />
        <meshStandardMaterial
          ref={materialRef}
          map={texture}
          color="#ffffff"
          emissive={emissive}
          emissiveIntensity={1.4}
          roughness={0.25}
          metalness={0.1}
        />
      </mesh>
    )
  },
)
