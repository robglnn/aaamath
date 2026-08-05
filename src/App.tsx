import { useEffect, useState } from 'react'
import { GameView } from '@/game/GameView'
import { LessonOverlay } from '@/lesson/LessonOverlay'
import { StandardsView } from '@/progress/StandardsView'
import { useProgressStore } from '@/progress/store'
import { LocaleSwitcher } from '@/components/LocaleSwitcher'
import { ui } from '@/i18n/ui'

export default function App() {
  const hydrate = useProgressStore((s) => s.hydrate)
  const hydrated = useProgressStore((s) => s.hydrated)
  const locale = useProgressStore((s) => s.blob.locale)
  const unlocks = useProgressStore((s) => s.blob.unlocks)
  const lessonState = useProgressStore((s) => s.blob.lessonStates['algebra-i-01'])

  const [lessonOpen, setLessonOpen] = useState(false)
  const [progressOpen, setProgressOpen] = useState(false)

  useEffect(() => {
    void hydrate()
  }, [hydrate])

  if (!hydrated) {
    return (
      <div className="boot-screen">
        <div className="boot-brand-wrap">
          <p className="brand brand-hero">Axiom Rising</p>
          <div className="boot-scanline" aria-hidden />
        </div>
        <p className="boot-status">Initializing local progress…</p>
      </div>
    )
  }

  const mastered = lessonState?.status === 'mastered'
  const unlocked = {
    blueprint: unlocks.blueprints.includes('bp.pad.ramp') || mastered,
    rank: unlocks.ranks.includes('rank.riser.initiate') || mastered,
    zoneBeta: unlocks.zones.includes('zone.pad.beta') || mastered,
  }

  return (
    <div className="app-root">
      <GameView
        unlocked={unlocked}
        lessonOpen={lessonOpen}
        onOpenTerminal={() => setLessonOpen(true)}
      />

      <div className="app-chrome" aria-label="Game menu">
        <LocaleSwitcher />
        <button
          type="button"
          className="btn chrome-btn"
          onClick={() => setProgressOpen((v) => !v)}
          aria-expanded={progressOpen}
        >
          {ui(locale, 'progress')}
        </button>
      </div>

      {lessonOpen && (
        <LessonOverlay
          onClose={() => setLessonOpen(false)}
          onMastered={() => {
            /* unlocks applied in progress store; keep overlay until player closes */
          }}
        />
      )}

      {progressOpen && (
        <aside className="progress-drawer" aria-label={ui(locale, 'houseStanding')}>
          <div className="drawer-head">
            <div>
              <p className="drawer-eyebrow">{ui(locale, 'compactRecord')}</p>
              <h2>{ui(locale, 'progress')}</h2>
            </div>
            <button type="button" className="btn ghost" onClick={() => setProgressOpen(false)}>
              {ui(locale, 'close')}
            </button>
          </div>
          <StandardsView />
        </aside>
      )}
    </div>
  )
}
