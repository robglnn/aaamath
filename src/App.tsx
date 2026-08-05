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
        <p className="brand">Axiom Rising</p>
        <p>Initializing local progress…</p>
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
      <header className="top-bar">
        <div className="brand-block">
          <span className="brand">Axiom Rising</span>
          <span className="brand-sub">Training Range · Slice 0</span>
        </div>
        <div className="top-actions">
          <LocaleSwitcher />
          <button type="button" className="btn ghost" onClick={() => setProgressOpen((v) => !v)}>
            {ui(locale, 'progress')}
          </button>
        </div>
      </header>

      <GameView
        unlocked={unlocked}
        lessonOpen={lessonOpen}
        onOpenTerminal={() => setLessonOpen(true)}
      />

      {lessonOpen && (
        <LessonOverlay
          onClose={() => setLessonOpen(false)}
          onMastered={() => {
            /* unlocks applied in progress store; keep overlay until player closes */
          }}
        />
      )}

      {progressOpen && (
        <aside className="progress-drawer" aria-label="Progress">
          <div className="drawer-head">
            <h2>{ui(locale, 'progress')}</h2>
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
