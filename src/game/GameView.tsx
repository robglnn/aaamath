import { useCallback, useEffect, useRef } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGameStore } from '@/game/store'
import type { UnlockFlags } from '@/game/store'
import { TrainingRange } from '@/game/TrainingRange'
import { TouchControls } from '@/game/TouchControls'
import { Hud } from '@/game/Hud'
import './game.css'

export interface GameViewProps {
  unlocked: UnlockFlags
  onOpenTerminal: () => void
}

function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null
  if (!el || !el.tagName) return false
  return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable
}

export function GameView({ unlocked, onOpenTerminal }: GameViewProps) {
  const { blueprint, rank, zoneBeta } = unlocked

  useEffect(() => {
    useGameStore.getState().applyMasteryUnlocks({ blueprint, rank, zoneBeta })
  }, [blueprint, rank, zoneBeta])

  const openTerminal = useCallback(() => {
    useGameStore.getState().setMode('lesson')
    onOpenTerminal()
  }, [onOpenTerminal])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return
      const s = useGameStore.getState()
      if (e.code === 'KeyE' && s.mode === 'explore' && s.nearTerminal) {
        openTerminal()
      } else if (e.code === 'KeyB' && s.hasBlueprint && !s.blueprintPlaced) {
        s.setMode(s.mode === 'build' ? 'explore' : 'build')
      } else if (e.code === 'Enter' && s.mode === 'build') {
        s.requestPlace()
      } else if (e.code === 'Escape' && s.mode !== 'explore') {
        s.setMode('explore')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openTerminal])

  const drag = useRef<{ id: number; x: number; y: number; moved: number } | null>(null)

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const s = useGameStore.getState()
    if (s.mode === 'lesson') s.setMode('explore')
    if (e.pointerType === 'mouse' && e.button !== 0) return
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: 0 }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    const dx = e.clientX - d.x
    const dy = e.clientY - d.y
    d.x = e.clientX
    d.y = e.clientY
    d.moved += Math.abs(dx) + Math.abs(dy)
    const s = useGameStore.getState()
    s.setPlayerYaw(s.playerYaw - dx * 0.0055)
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
      className="gr-root"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <Canvas dpr={[1, 1.75]} camera={{ fov: 55, near: 0.1, far: 140, position: [0, 4.5, 11] }}>
        <TrainingRange />
      </Canvas>
      <TouchControls />
      <Hud onOpenTerminal={openTerminal} />
    </div>
  )
}
