import { useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { useGameStore } from '@/game/store'
import { ui } from '@/i18n/ui'
import { useProgressStore } from '@/progress/store'

function detectCoarsePointer(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window
}

const YAW_STEP = 48

export function TouchControls() {
  const [coarse] = useState(detectCoarsePointer)
  const locale = useProgressStore((s) => s.blob.locale)
  const baseRef = useRef<HTMLDivElement>(null)
  const knobRef = useRef<HTMLDivElement>(null)
  const activeId = useRef<number | null>(null)

  const updateStick = (e: ReactPointerEvent<HTMLDivElement>) => {
    const base = baseRef.current
    if (!base) return
    const rect = base.getBoundingClientRect()
    const r = rect.width / 2
    let dx = (e.clientX - (rect.left + r)) / r
    let dy = (e.clientY - (rect.top + r)) / r
    const len = Math.hypot(dx, dy)
    if (len > 1) {
      dx /= len
      dy /= len
    }
    useGameStore.getState().setStick(dx, -dy)
    if (knobRef.current) {
      knobRef.current.style.transform = `translate(${dx * 40}px, ${dy * 40}px)`
    }
  }

  const onStickDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.stopPropagation()
    activeId.current = e.pointerId
    e.currentTarget.setPointerCapture(e.pointerId)
    updateStick(e)
  }
  const onStickMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (activeId.current === e.pointerId) updateStick(e)
  }
  const onStickEnd = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (activeId.current !== e.pointerId) return
    activeId.current = null
    useGameStore.getState().setStick(0, 0)
    if (knobRef.current) knobRef.current.style.transform = 'translate(0px, 0px)'
  }

  if (!coarse) return null

  return (
    <>
      <div
        ref={baseRef}
        className="gr-stick"
        onPointerDown={onStickDown}
        onPointerMove={onStickMove}
        onPointerUp={onStickEnd}
        onPointerCancel={onStickEnd}
      >
        <div ref={knobRef} className="gr-stick-knob" />
      </div>

      <div className="gr-look-cluster">
        <button
          type="button"
          className="gr-look"
          aria-label={ui(locale, 'lookLeft')}
          onPointerDown={(e) => {
            e.stopPropagation()
            useGameStore.getState().setLookDelta(-YAW_STEP, 0)
          }}
        >
          {ui(locale, 'lookLeft')}
        </button>
        <button
          type="button"
          className="gr-look"
          aria-label={ui(locale, 'lookRight')}
          onPointerDown={(e) => {
            e.stopPropagation()
            useGameStore.getState().setLookDelta(YAW_STEP, 0)
          }}
        >
          {ui(locale, 'lookRight')}
        </button>
      </div>

      <button
        type="button"
        className="gr-sprint"
        onPointerDown={(e) => {
          e.stopPropagation()
          e.currentTarget.setPointerCapture(e.pointerId)
          useGameStore.getState().setTouchSprint(true)
        }}
        onPointerUp={(e) => {
          e.stopPropagation()
          useGameStore.getState().setTouchSprint(false)
        }}
        onPointerCancel={() => useGameStore.getState().setTouchSprint(false)}
      >
        {ui(locale, 'sprint')}
      </button>

      <button
        type="button"
        className="gr-jump"
        onPointerDown={(e) => {
          e.stopPropagation()
          useGameStore.getState().requestJump()
        }}
      >
        JUMP
      </button>
    </>
  )
}
