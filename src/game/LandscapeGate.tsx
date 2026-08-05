import { useEffect, useState } from 'react'
import { BrandCrest } from '@/game/BrandCrest'
import { ui } from '@/i18n/ui'
import { useProgressStore } from '@/progress/store'

function isCoarse(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window
}

function isPortrait(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(orientation: portrait)').matches
}

/** Fortnite-style: phones play in landscape. Portrait gets a rotate-to-play gate. */
export function LandscapeGate() {
  const locale = useProgressStore((s) => s.blob.locale)
  const [coarse] = useState(isCoarse)
  const [portrait, setPortrait] = useState(isPortrait)

  useEffect(() => {
    if (!coarse) return
    const mq = window.matchMedia('(orientation: portrait)')
    const sync = () => setPortrait(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    window.addEventListener('orientationchange', sync)
    return () => {
      mq.removeEventListener('change', sync)
      window.removeEventListener('orientationchange', sync)
    }
  }, [coarse])

  useEffect(() => {
    if (!coarse || portrait) return
    const orient = screen.orientation as ScreenOrientation & {
      lock?: (orientation: string) => Promise<void>
    }
    if (typeof orient?.lock === 'function') {
      void orient.lock('landscape').catch(() => {
        /* browser may require fullscreen — overlay covers the rest */
      })
    }
  }, [coarse, portrait])

  if (!coarse || !portrait) return null

  return (
    <div className="gr-rotate-gate" role="dialog" aria-modal="true" aria-labelledby="gr-rotate-title">
      <div className="gr-rotate-card">
        <BrandCrest size={64} className="gr-rotate-crest" />
        <p id="gr-rotate-title" className="gr-rotate-title">
          {ui(locale, 'rotateToPlay')}
        </p>
        <p className="gr-rotate-sub">{ui(locale, 'rotateToPlayHint')}</p>
        <div className="gr-rotate-glyph" aria-hidden>
          <span className="gr-rotate-phone" />
          <span className="gr-rotate-arrow">↻</span>
        </div>
      </div>
    </div>
  )
}
