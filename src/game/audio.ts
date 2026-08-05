/** Cheap Web Audio synth — no assets; resume on first gesture (Safari/iOS). */

export type BlipKind = 'prompt' | 'open' | 'place' | 'unlock'

let ctx: AudioContext | null = null
let master: GainNode | null = null
let ambientGain: GainNode | null = null
let ambientOscs: OscillatorNode[] = []
let ambientNoise: AudioBufferSourceNode | null = null
let ambientActive = false
let gestureBound = false

const BASE_GAIN = 0.09

function volumeGate(): number {
  if (typeof window === 'undefined') return 0
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  return reduced ? BASE_GAIN * 0.25 : BASE_GAIN
}

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const Ctor =
    window.AudioContext ??
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  if (!ctx) {
    ctx = new Ctor()
    master = ctx.createGain()
    master.gain.value = volumeGate()
    master.connect(ctx.destination)
    ambientGain = ctx.createGain()
    ambientGain.gain.value = 0
    ambientGain.connect(master)
  }
  return ctx
}

function bindGestureResume(): void {
  if (gestureBound || typeof window === 'undefined') return
  gestureBound = true
  const resume = () => {
    const c = getCtx()
    if (c?.state === 'suspended') void c.resume()
  }
  window.addEventListener('pointerdown', resume, { passive: true })
  window.addEventListener('keydown', resume, { passive: true })
}

/** Lazily create context and resume after user gesture. Safe to call often. */
export function ensureAudio(): void {
  getCtx()
  bindGestureResume()
  const c = ctx
  if (c?.state === 'suspended') void c.resume()
}

function blipTone(
  c: AudioContext,
  dest: AudioNode,
  freq: number,
  start: number,
  dur: number,
  peak: number,
  type: OscillatorType = 'sine',
): void {
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, start)
  g.gain.setValueAtTime(0.0001, start)
  g.gain.exponentialRampToValueAtTime(peak, start + 0.012)
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur)
  osc.connect(g)
  g.connect(dest)
  osc.start(start)
  osc.stop(start + dur + 0.02)
}

function blipNoise(c: AudioContext, dest: AudioNode, start: number, dur: number, peak: number): void {
  const len = Math.floor(c.sampleRate * 0.08)
  const buf = c.createBuffer(1, len, c.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len)
  const src = c.createBufferSource()
  src.buffer = buf
  const filt = c.createBiquadFilter()
  filt.type = 'bandpass'
  filt.frequency.value = 1200
  filt.Q.value = 0.8
  const g = c.createGain()
  g.gain.setValueAtTime(peak, start)
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur)
  src.connect(filt)
  filt.connect(g)
  g.connect(dest)
  src.start(start)
  src.stop(start + dur + 0.02)
}

/** Short UI blip — volumes kept low for STT/TTS headroom. */
export function playBlip(kind: BlipKind): void {
  ensureAudio()
  const c = ctx
  const m = master
  if (!c || !m) return
  if (c.state === 'suspended') {
    void c.resume().then(() => playBlip(kind))
    return
  }

  const t = c.currentTime
  const bus = c.createGain()
  bus.connect(m)

  switch (kind) {
    case 'prompt':
      blipTone(c, bus, 784, t, 0.07, 0.35)
      break
    case 'open':
      blipTone(c, bus, 523, t, 0.06, 0.3)
      blipTone(c, bus, 659, t + 0.05, 0.08, 0.28)
      break
    case 'place':
      blipTone(c, bus, 196, t, 0.12, 0.45, 'triangle')
      blipNoise(c, bus, t + 0.02, 0.09, 0.12)
      blipTone(c, bus, 392, t + 0.06, 0.1, 0.22)
      break
    case 'unlock':
      blipTone(c, bus, 440, t, 0.07, 0.32)
      blipTone(c, bus, 554, t + 0.06, 0.07, 0.28)
      blipTone(c, bus, 659, t + 0.12, 0.12, 0.26)
      break
  }
}

function stopAmbientNodes(): void {
  for (const o of ambientOscs) {
    try {
      o.stop()
    } catch {
      /* already stopped */
    }
    o.disconnect()
  }
  ambientOscs = []
  if (ambientNoise) {
    try {
      ambientNoise.stop()
    } catch {
      /* already stopped */
    }
    ambientNoise.disconnect()
    ambientNoise = null
  }
}

function startAmbientPad(c: AudioContext, dest: GainNode): void {
  stopAmbientNodes()
  const freqs = [110, 164.81]
  for (const f of freqs) {
    const osc = c.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = f
    const g = c.createGain()
    g.gain.value = 0.018
    osc.connect(g)
    g.connect(dest)
    osc.start()
    ambientOscs.push(osc)
  }
  const len = c.sampleRate * 2
  const buf = c.createBuffer(1, len, c.sampleRate)
  const d = buf.getChannelData(0)
  let last = 0
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1
    last = (last + 0.015 * white) / 1.015
    d[i] = last
  }
  const noise = c.createBufferSource()
  noise.buffer = buf
  noise.loop = true
  const lp = c.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 280
  const ng = c.createGain()
  ng.gain.value = 0.012
  noise.connect(lp)
  lp.connect(ng)
  ng.connect(dest)
  noise.start()
  ambientNoise = noise
}

/** Soft ambient pad — fades in/out; off when lesson overlay is open. */
export function setAmbient(on: boolean): void {
  ensureAudio()
  const c = ctx
  const ag = ambientGain
  if (!c || !ag) return

  if (on && !ambientActive) {
    ambientActive = true
    startAmbientPad(c, ag)
    ag.gain.cancelScheduledValues(c.currentTime)
    ag.gain.setValueAtTime(0, c.currentTime)
    ag.gain.linearRampToValueAtTime(1, c.currentTime + 1.8)
  } else if (!on && ambientActive) {
    ambientActive = false
    ag.gain.cancelScheduledValues(c.currentTime)
    ag.gain.setValueAtTime(ag.gain.value, c.currentTime)
    ag.gain.linearRampToValueAtTime(0, c.currentTime + 0.6)
    const stopAt = c.currentTime + 0.65
    window.setTimeout(() => {
      if (!ambientActive) stopAmbientNodes()
    }, (stopAt - c.currentTime) * 1000 + 50)
  }
}
