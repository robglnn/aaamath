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
  const touchCrawl = useGameStore((s) => s.touchCrawl)
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
      knobRef.current.style.transform = `translate(${dx * 44}px, ${dy * 44}px)`
    }
  }

  const onStickDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.stopPropagation()
    activeId.current = e.pointerId
    e.currentTarget.setPointerCapture(e.pointerId)
    baseRef.current?.classList.add('is-active')
    updateStick(e)
  }
  const onStickMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (activeId.current === e.pointerId) updateStick(e)
  }
  const onStickEnd = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (activeId.current !== e.pointerId) return
    activeId.current = null
    baseRef.current?.classList.remove('is-active')
    useGameStore.getState().setStick(0, 0)
    if (knobRef.current) knobRef.current.style.transform = 'translate(0px, 0px)'
  }

  if (!coarse) return null

  return (
    <>
      <div
        ref={baseRef}
        className="gr-stick"
        role="group"
        aria-label={ui(locale, 'moveStick')}
        onPointerDown={onStickDown}
        onPointerMove={onStickMove}
        onPointerUp={onStickEnd}
        onPointerCancel={onStickEnd}
      >
        <div className="gr-stick-ring" aria-hidden />
        <div ref={knobRef} className="gr-stick-knob" aria-hidden />
      </div>

      <div className="gr-look-cluster" role="group" aria-label={ui(locale, 'lookLeft')}>
        <button
          type="button"
          className="gr-look"
          aria-label={ui(locale, 'lookLeft')}
          onPointerDown={(e) => {
            e.stopPropagation()
            useGameStore.getState().setLookDelta(-YAW_STEP, 0)
          }}
        >
          <span className="gr-look-glyph" aria-hidden>
            ‹
          </span>
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
          <span className="gr-look-glyph" aria-hidden>
            ›
          </span>
        </button>
      </div>

      <button
        type="button"
        className="gr-sprint"
        aria-label={ui(locale, 'sprint')}
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
        aria-label={ui(locale, 'jump')}
        onPointerDown={(e) => {
          e.stopPropagation()
          useGameStore.getState().requestJump()
        }}
      >
        {ui(locale, 'jump')}
      </button>

      <button
        type="button"
        className={`gr-crawl${touchCrawl ? ' is-active' : ''}`}
        aria-label={ui(locale, 'crawl')}
        aria-pressed={touchCrawl}
        onPointerDown={(e) => {
          e.stopPropagation()
          e.currentTarget.setPointerCapture(e.pointerId)
          useGameStore.getState().setTouchCrawl(true)
        }}
        onPointerUp={(e) => {
          e.stopPropagation()
          useGameStore.getState().setTouchCrawl(false)
        }}
        onPointerCancel={() => useGameStore.getState().setTouchCrawl(false)}
      >
        {ui(locale, 'crawl')}
      </button>
    </>
  )
}
