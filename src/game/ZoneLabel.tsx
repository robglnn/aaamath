import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CanvasTexture, SRGBColorSpace } from 'three'
import type { Group } from 'three'

/* ---------- Canvas-baked textures: procedural, offline-safe, zero font/CDN fetches ---------- */

export function makeCanvas(w: number, h: number) {
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

export function ZoneLabel({
  text,
  color,
  y = 1.6,
  faceY = 0,
  scale = 1,
  subdued = false,
}: {
  text: string
  color: string
  y?: number
  faceY?: number
  scale?: number
  subdued?: boolean
}) {
  // Canvas-baked neon face — offline-safe (troika Text pulls a CDN font at runtime)
  const tex = useMemo(() => bakeLabelTexture(text, color), [text, color])
  const bobRef = useRef<Group>(null)
  const width = Math.min(4.8, Math.max(2.8, text.length * 0.3)) * scale
  const h = width / 4

  useFrame((state) => {
    if (bobRef.current) {
      const bob = subdued ? 0.025 : 0.045
      bobRef.current.position.y = y + Math.sin(state.clock.elapsedTime * 1.25 + faceY) * bob
    }
  })

  return (
    <group rotation={[0, faceY, 0]} name={text} scale={subdued ? 0.82 : 1}>
      <group ref={bobRef} position={[0, y, 0]}>
        {/* Backing plate */}
        <mesh>
          <boxGeometry args={[width + 0.4, h + 0.32, 0.07]} />
          <meshStandardMaterial color="#08141c" metalness={0.55} roughness={0.35} />
        </mesh>
        {/* Baked neon face — meshBasic + toneMapped off keeps it legible from spawn */}
        <mesh position={[0, 0, 0.05]}>
          <planeGeometry args={[width, h]} />
          <meshBasicMaterial
            map={tex}
            transparent
            toneMapped={false}
            depthWrite={false}
            opacity={subdued ? 0.72 : 1}
          />
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
