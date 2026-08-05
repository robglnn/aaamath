import { useCallback, useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { Canvas } from '@react-three/fiber'
import { ACESFilmicToneMapping, SRGBColorSpace } from 'three'
import { ensureAudio, playBlip, setAmbient } from '@/game/audio'
import { useGameStore } from '@/game/store'
import type { UnlockFlags } from '@/game/store'
import { TrainingRange } from '@/game/TrainingRange'
import { TouchControls } from '@/game/TouchControls'
import { BrandCrest } from '@/game/BrandCrest'
import { Hud } from '@/game/Hud'
import { LandscapeGate } from '@/game/LandscapeGate'
import { preloadHeroModels } from '@/game/HeroGltf'
import './game.css'

preloadHeroModels()

export interface GameViewProps {
  unlocked: UnlockFlags
  onOpenTerminal: () => void
  onOpenProgress?: () => void
  /** When true, freezes explore/build and clears back to explore on close. */
  lessonOpen?: boolean
}

function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null
  if (!el || !el.tagName) return false
  return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable
}

function isCoarsePointer(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(pointer: coarse)').matches
}

export function GameView({ unlocked, onOpenTerminal, onOpenProgress, lessonOpen = false }: GameViewProps) {
  const { blueprint, rank, zoneBeta, railBlueprint, adeptRank, betaAnnex, relaySplitter, expertRank, gammaRelay, balanceBeam, operatorRank, deltaBalance, balanceCalibrator, chiefRank, epsilonCal, balanceMirror, vanguardRank, zetaMirror } = unlocked
  const pointerLocked = useGameStore((s) => s.pointerLocked)
  const [showLockHint, setShowLockHint] = useState(true)
  const [brandPhase, setBrandPhase] = useState<'reveal' | 'watermark'>('reveal')
  const rootRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ id: number; x: number; y: number; moved: number } | null>(null)

  useEffect(() => {
    useGameStore
      .getState()
      .applyMasteryUnlocks({ blueprint, rank, zoneBeta, railBlueprint, adeptRank, betaAnnex, relaySplitter, expertRank, gammaRelay, balanceBeam, operatorRank, deltaBalance, balanceCalibrator, chiefRank, epsilonCal, balanceMirror, vanguardRank, zetaMirror })
  }, [blueprint, rank, zoneBeta, railBlueprint, adeptRank, betaAnnex, relaySplitter, expertRank, gammaRelay, balanceBeam, operatorRank, deltaBalance, balanceCalibrator, chiefRank, epsilonCal, balanceMirror, vanguardRank, zetaMirror])

  useEffect(() => {
    const toWatermark = window.setTimeout(() => setBrandPhase('watermark'), 2400)
    return () => window.clearTimeout(toWatermark)
  }, [])

  useEffect(() => {
    if (lessonOpen) {
      useGameStore.getState().setMode('lesson')
      if (document.pointerLockElement) document.exitPointerLock()
      return
    }
    if (useGameStore.getState().mode === 'lesson') {
      useGameStore.getState().setMode('explore')
    }
  }, [lessonOpen])

  useEffect(() => {
    setAmbient(!lessonOpen)
    return () => setAmbient(false)
  }, [lessonOpen])

  useEffect(() => {
    const onLockChange = () => {
      const locked = document.pointerLockElement === rootRef.current
      useGameStore.getState().setPointerLocked(locked)
      if (locked) setShowLockHint(false)
    }
    const onMouseMove = (e: MouseEvent) => {
      if (!document.pointerLockElement) return
      if (lessonOpen) return
      useGameStore.getState().setLookDelta(e.movementX, e.movementY)
    }
    document.addEventListener('pointerlockchange', onLockChange)
    document.addEventListener('mousemove', onMouseMove)
    return () => {
      document.removeEventListener('pointerlockchange', onLockChange)
      document.removeEventListener('mousemove', onMouseMove)
    }
  }, [lessonOpen])

  const openTerminal = useCallback(() => {
    ensureAudio()
    playBlip('open')
    if (document.pointerLockElement) document.exitPointerLock()
    useGameStore.getState().setMode('lesson')
    onOpenTerminal()
  }, [onOpenTerminal])

  const requestLock = useCallback(() => {
    if (lessonOpen || isCoarsePointer()) return
    const el = rootRef.current
    if (!el || document.pointerLockElement === el) return
    void el.requestPointerLock().catch(() => {
      /* browser re-lock cooldown after Esc — ignore */
    })
  }, [lessonOpen])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target) || lessonOpen) return
      const s = useGameStore.getState()
      // Keyboard yaw fallback when not pointer-locked
      if (!s.pointerLocked) {
        if (e.code === 'KeyQ') s.setPlayerYaw(s.playerYaw + 0.12)
        if (e.code === 'KeyC') s.setPlayerYaw(s.playerYaw - 0.12)
      }
      if (e.code === 'KeyE' && s.mode === 'explore' && s.nearTerminal) {
        openTerminal()
      } else if (e.code === 'KeyB' && s.hasBlueprint && !s.blueprintPlaced) {
        s.setMode(s.mode === 'build' ? 'explore' : 'build')
      } else if ((e.code === 'Enter' || e.code === 'KeyF') && s.mode === 'build') {
        s.requestPlace()
      } else if (e.code === 'Escape') {
        if (document.pointerLockElement) {
          document.exitPointerLock()
        } else if (s.mode !== 'explore') {
          s.setMode('explore')
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openTerminal, lessonOpen])

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    ensureAudio()
    if (lessonOpen) return
    if (e.pointerType === 'mouse' && e.button !== 0) return
    const mode = useGameStore.getState().mode
    // Desktop explore: click canvas to pointer-lock for mouse-look.
    // Skip in build so a click can still place the blueprint.
    if (
      mode !== 'build' &&
      e.pointerType === 'mouse' &&
      !isCoarsePointer() &&
      !document.pointerLockElement
    ) {
      requestLock()
      return
    }
    // Touch / unlocked drag orbit (mobile + fallback)
    if (document.pointerLockElement) return
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: 0 }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (lessonOpen || document.pointerLockElement) return
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    const dx = e.clientX - d.x
    const dy = e.clientY - d.y
    d.x = e.clientX
    d.y = e.clientY
    d.moved += Math.abs(dx) + Math.abs(dy)
    useGameStore.getState().setLookDelta(dx, dy)
  }
  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    drag.current = null
    const s = useGameStore.getState()
    if (s.mode === 'build' && d.moved < 7) s.requestPlace()
  }

  return (
    <div
      ref={rootRef}
      className="gr-root"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <Canvas
        dpr={[1, 1.75]}
        gl={{
          antialias: true,
          toneMapping: ACESFilmicToneMapping,
          toneMappingExposure: 1.22,
          outputColorSpace: SRGBColorSpace,
          powerPreference: 'high-performance',
        }}
        camera={{ fov: 48, near: 0.1, far: 140, position: [0, 3.6, 8.4] }}
      >
        <TrainingRange />
      </Canvas>

      <div
        className={`gr-brand${brandPhase === 'watermark' ? ' gr-brand-hero-exit' : ''}${lessonOpen ? ' gr-brand-hidden' : ''}`}
        aria-hidden
      >
        <div className="gr-brand-hero-stack">
          <BrandCrest size={88} className="gr-brand-hero-crest" />
          <span className="gr-brand-title">Axiom Rising</span>
        </div>
      </div>
      <div
        className={`gr-brand-mark${brandPhase === 'watermark' ? ' gr-brand-mark-visible' : ''}${lessonOpen ? ' gr-brand-hidden' : ''}`}
        aria-hidden
      >
        <BrandCrest size={48} className="gr-brand-mark-crest" />
        <div className="gr-brand-mark-meta">
          <span className="gr-brand-mark-title">Axiom Rising</span>
          <span className="gr-brand-mark-rank">
            {unlocked.vanguardRank
              ? 'Rank · Vanguard'
              : unlocked.chiefRank
                ? 'Rank · Chief'
                : unlocked.operatorRank
                  ? 'Rank · Operator'
                  : unlocked.expertRank
                    ? 'Rank · Expert'
                    : unlocked.adeptRank
                      ? 'Rank · Adept'
                      : unlocked.rank
                        ? 'Rank · Initiate'
                        : 'Rank · Riser'}
          </span>
          <span className="gr-brand-mark-bar" aria-hidden>
            <span
              className="gr-brand-mark-bar-fill"
              style={{
                width: unlocked.vanguardRank
                  ? '100%'
                  : unlocked.chiefRank
                    ? '86%'
                    : unlocked.operatorRank
                      ? '72%'
                      : unlocked.expertRank
                        ? '58%'
                        : unlocked.adeptRank
                          ? '44%'
                          : unlocked.rank
                            ? '28%'
                            : '12%',
              }}
            />
          </span>
        </div>
      </div>

      <TouchControls />
      <Hud
        onOpenTerminal={openTerminal}
        onOpenProgress={onOpenProgress}
        pointerLocked={pointerLocked}
        zoneState={{
          alpha: true,
          beta: unlocked.zoneBeta,
          annex: unlocked.betaAnnex,
          gamma: unlocked.gammaRelay,
          delta: unlocked.deltaBalance,
          epsilon: unlocked.epsilonCal,
          zeta: unlocked.zetaMirror,
        }}
      />
      <LandscapeGate />
      {showLockHint && !pointerLocked && !lessonOpen && !isCoarsePointer() && (
        <button type="button" className="gr-lock-hint" onClick={requestLock}>
          Click to look · Esc releases
        </button>
      )}
    </div>
  )
}
