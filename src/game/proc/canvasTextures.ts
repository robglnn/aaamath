import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three'

/**
 * Procedural / canvas-baked texture kit for the 3D range.
 *
 * Every helper paints a small (<=512px) canvas once and wraps it in a
 * `THREE.CanvasTexture` (sRGB, RepeatWrapping). No asset store, no deps.
 *
 * Ownership: the CALLER owns each returned texture and must call
 * `texture.dispose()` when done with it. Creating textures once at module
 * level (or via `getProcTextureKit`) is acceptable for Slice 0 lifetime —
 * the range lives for the whole app session.
 */

/** Deterministic PRNG so every load bakes the exact same texture. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function createCtx(size: number): CanvasRenderingContext2D {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('proc textures: 2D canvas context unavailable')
  return ctx
}

function bake(ctx: CanvasRenderingContext2D): CanvasTexture {
  const tex = new CanvasTexture(ctx.canvas)
  tex.colorSpace = SRGBColorSpace
  tex.wrapS = RepeatWrapping
  tex.wrapT = RepeatWrapping
  // anisotropy intentionally left at default (1) — cheap on mobile GPUs
  return tex
}

function clamp8(v: number): number {
  return v < 0 ? 0 : v > 255 ? 255 : Math.round(v)
}

/** Low-alpha random speckle, used by all three bakes for grain. */
function speckle(
  ctx: CanvasRenderingContext2D,
  rand: () => number,
  size: number,
  count: number,
  rgba: string,
  dot: number,
): void {
  ctx.fillStyle = rgba
  for (let i = 0; i < count; i++) {
    ctx.fillRect(rand() * size, rand() * size, dot, dot)
  }
}

/**
 * Subtle dark-teal per-pixel noise for the ground plane.
 * Base matches the legacy ground color (#0a141d) so dropping it in as a
 * `map` keeps visual parity while killing the flat single-color look.
 * Pure pixel noise tiles seamlessly under RepeatWrapping.
 */
export function makeNoiseFloorTexture(size = 256): CanvasTexture {
  const ctx = createCtx(size)
  const rand = mulberry32(0xf100)

  const img = ctx.createImageData(size, size)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    const n = (rand() * 2 - 1) * 6
    d[i] = clamp8(10 + n * 0.6)
    d[i + 1] = clamp8(20 + n)
    d[i + 2] = clamp8(29 + n * 1.35) // teal-leaning variance
    d[i + 3] = 255
  }
  ctx.putImageData(img, 0, 0)

  // Sparse grain: faint teal flecks + darker pits, both seamless point features
  speckle(ctx, rand, size, size * 2, 'rgba(70,160,165,0.05)', 1)
  speckle(ctx, rand, size, size >> 2, 'rgba(46,111,120,0.04)', 2)
  speckle(ctx, rand, size, size, 'rgba(2,8,12,0.08)', 1)

  return bake(ctx)
}

/**
 * Sci-fi wall/terminal panel: raised inner plate, beveled seams, corner
 * bolts, one cyan light strip, one amber tick (amber stays sparing).
 * The outer bevel sits exactly on the canvas edge so RepeatWrapping tiles
 * it into a continuous panel wall (light row meets dark row = groove).
 */
export function makePanelTexture(size = 256): CanvasTexture {
  const ctx = createCtx(size)
  const rand = mulberry32(0x9a4e1)

  ctx.fillStyle = '#0f2230'
  ctx.fillRect(0, 0, size, size)

  // Edge bevel frame (tile-friendly)
  ctx.fillStyle = '#2a5a6e'
  ctx.fillRect(0, 0, size, 2)
  ctx.fillRect(0, 0, 2, size)
  ctx.fillStyle = '#050d13'
  ctx.fillRect(0, size - 2, size, 2)
  ctx.fillRect(size - 2, 0, 2, size)

  // Raised inner plate with its own bevel
  const inset = Math.round(size * 0.045)
  const inner = size - inset * 2
  ctx.fillStyle = '#122836'
  ctx.fillRect(inset, inset, inner, inner)
  ctx.fillStyle = '#2f6274'
  ctx.fillRect(inset, inset, inner, 2)
  ctx.fillRect(inset, inset, 2, inner)
  ctx.fillStyle = '#071218'
  ctx.fillRect(inset, inset + inner - 2, inner, 2)
  ctx.fillRect(inset + inner - 2, inset, 2, inner)

  // Horizontal seam across the plate: dark groove + light lip below
  const seamY = Math.round(size * 0.6)
  ctx.fillStyle = '#050d13'
  ctx.fillRect(inset, seamY, inner, 2)
  ctx.fillStyle = '#2a556a'
  ctx.fillRect(inset, seamY + 2, inner, 1)
  // Vertical seam above the horizontal one
  const seamX = Math.round(size * 0.42)
  ctx.fillStyle = '#050d13'
  ctx.fillRect(seamX, inset, 2, seamY - inset)
  ctx.fillStyle = '#2a556a'
  ctx.fillRect(seamX + 2, inset, 1, seamY - inset)

  // Corner bolts on the inner plate
  const bolt = (x: number, y: number) => {
    ctx.fillStyle = '#08151d'
    ctx.beginPath()
    ctx.arc(x + 1, y + 1, size * 0.012 + 1.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#35707f'
    ctx.beginPath()
    ctx.arc(x, y, size * 0.012 + 1.5, 0, Math.PI * 2)
    ctx.fill()
  }
  const bo = inset + Math.round(size * 0.03)
  bolt(bo, bo)
  bolt(size - bo, bo)
  bolt(bo, size - bo)
  bolt(size - bo, size - bo)

  // Cyan light strip (glow band + bright core) on the right of the plate
  const stripX = size - inset - Math.round(size * 0.07)
  const stripTop = inset + Math.round(size * 0.06)
  const stripH = Math.round(size * 0.42)
  ctx.fillStyle = 'rgba(61,214,198,0.16)'
  ctx.fillRect(stripX - 3, stripTop, 9, stripH)
  ctx.fillStyle = 'rgba(61,214,198,0.75)'
  ctx.fillRect(stripX, stripTop, 2, stripH)

  // Single amber status tick — sparing accent
  ctx.fillStyle = 'rgba(240,168,48,0.8)'
  ctx.fillRect(inset + Math.round(size * 0.05), seamY + Math.round(size * 0.06), 4, Math.round(size * 0.035))

  speckle(ctx, rand, size, size, 'rgba(120,190,200,0.03)', 1)

  return bake(ctx)
}

function traceHex(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
  ctx.beginPath()
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i
    const x = cx + Math.cos(a) * r
    const y = cy + Math.sin(a) * r
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
}

/**
 * Pad surface detail: seamless flat-top hex grid on dark teal, a few
 * cyan "lit" cells, one amber cell. Every hex is redrawn at all 9 wrap
 * offsets so the tile repeats perfectly in both axes.
 */
export function makeHexPadTexture(size = 256): CanvasTexture {
  const ctx = createCtx(size)
  const rand = mulberry32(0x3ec5)

  ctx.fillStyle = '#0d1e2a'
  ctx.fillRect(0, 0, size, size)

  const r = size / 8
  const dx = r * 1.5
  const dy = Math.sqrt(3) * r
  const offsets = [-size, 0, size]

  const paintHex = (cx: number, cy: number, fill: string | null, stroke: string, lineWidth: number) => {
    for (const ox of offsets) {
      for (const oy of offsets) {
        traceHex(ctx, cx + ox, cy + oy, r - 1)
        if (fill) {
          ctx.fillStyle = fill
          ctx.fill()
        }
        ctx.strokeStyle = stroke
        ctx.lineWidth = lineWidth
        ctx.stroke()
      }
    }
  }

  let col = 0
  for (let x = 0; x < size; x += dx, col++) {
    const yOff = col % 2 === 0 ? 0 : dy / 2
    for (let y = -dy; y < size + dy; y += dy) {
      const cy = y + yOff
      const lit = rand() < 0.06
      if (lit) {
        paintHex(x, cy, 'rgba(61,214,198,0.14)', 'rgba(61,214,198,0.7)', 2)
      } else {
        const shade = rand() < 0.5 ? 'rgba(21,48,62,0.5)' : null
        paintHex(x, cy, shade, 'rgba(52,116,128,0.5)', 1.5)
        if (rand() < 0.25) {
          ctx.fillStyle = 'rgba(90,150,160,0.22)'
          for (const ox of offsets) {
            for (const oy of offsets) {
              ctx.beginPath()
              ctx.arc(x + ox, cy + oy, 1.5, 0, Math.PI * 2)
              ctx.fill()
            }
          }
        }
      }
    }
  }

  // One amber cell per tile — sparing accent
  paintHex(size * 0.68, size * 0.3, 'rgba(240,168,48,0.1)', 'rgba(240,168,48,0.45)', 1.5)

  speckle(ctx, rand, size, size >> 1, 'rgba(120,190,200,0.025)', 1)

  return bake(ctx)
}

/**
 * Hazard / caution striping for floor pads: 45° amber-on-dark bands with
 * light wear. Mapped 1:1 onto thin stripe boxes (no tiling requirement), so
 * the rotated bands keep their angle at any pad aspect. Also usable as an
 * emissiveMap — the dark bands are near-black and emit ~nothing.
 */
export function makeHazardStripeTexture(width = 256, height = 128): CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('proc textures: 2D canvas context unavailable')
  const rand = mulberry32(0x5a7e)

  ctx.fillStyle = '#171310'
  ctx.fillRect(0, 0, width, height)

  const diag = Math.hypot(width, height)
  ctx.save()
  ctx.translate(width / 2, height / 2)
  ctx.rotate(Math.PI / 4)
  const band = 30
  let i = 0
  for (let x = -diag / 2; x < diag / 2; x += band, i++) {
    if (i % 2 === 0) {
      ctx.fillStyle = '#f0a830'
      ctx.fillRect(x, -diag / 2, band, diag)
    }
  }
  ctx.restore()

  // Wear: dark pits + faint teal grind so the pad reads deck-worn, not printed
  speckle(ctx, rand, width, width, 'rgba(10,16,20,0.10)', 2)
  speckle(ctx, rand, width, width >> 1, 'rgba(70,160,165,0.05)', 1)

  const tex = new CanvasTexture(canvas)
  tex.colorSpace = SRGBColorSpace
  tex.wrapS = RepeatWrapping
  tex.wrapT = RepeatWrapping
  return tex
}

export interface ProcTextureKit {
  floor: CanvasTexture
  panel: CanvasTexture
  hexPad: CanvasTexture
}

let sharedKit: ProcTextureKit | null = null

/**
 * Lazily-created shared kit — the cheap way to use these textures from
 * long-lived scene components without re-baking per mount.
 * Pair with `disposeProcTextureKit` only if the whole scene is torn down.
 */
export function getProcTextureKit(): ProcTextureKit {
  if (!sharedKit) {
    sharedKit = {
      floor: makeNoiseFloorTexture(256),
      panel: makePanelTexture(256),
      hexPad: makeHexPadTexture(256),
    }
  }
  return sharedKit
}

export function disposeProcTextureKit(): void {
  if (!sharedKit) return
  sharedKit.floor.dispose()
  sharedKit.panel.dispose()
  sharedKit.hexPad.dispose()
  sharedKit = null
}
