import { lazy, Suspense, useEffect, useState } from 'react'
import { useProgressStore } from '@/progress/store'
import { LocaleSwitcher } from '@/components/LocaleSwitcher'
import { ui } from '@/i18n/ui'

// Kick off the 3D chunk fetch at module scope so it downloads in parallel
// with progress hydration instead of after it.
const gameViewModule = import('@/game/GameView')
const GameView = lazy(() => gameViewModule.then((m) => ({ default: m.GameView })))

// KaTeX stays out of cold load: lesson + progress both pull MathText/react-katex.
const LessonOverlay = lazy(() =>
  import('@/lesson/LessonOverlay').then((m) => ({ default: m.LessonOverlay })),
)
const StandardsView = lazy(() =>
  import('@/progress/StandardsView').then((m) => ({ default: m.StandardsView })),
)

function warmLessonChunk() {
  void import('@/lesson/LessonOverlay')
}

function BootScreen({ status }: { status: string }) {
  return (
    <div className="boot-screen">
      <div className="boot-brand-wrap">
        <p className="brand brand-hero">Axiom Rising</p>
        <div className="boot-scanline" aria-hidden />
      </div>
      <p className="boot-status">{status}</p>
    </div>
  )
}

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
    return <BootScreen status="Initializing local progress…" />
  }

  const mastered = lessonState?.status === 'mastered'
  const unlocked = {
    blueprint: unlocks.blueprints.includes('bp.pad.ramp') || mastered,
    rank: unlocks.ranks.includes('rank.riser.initiate') || mastered,
    zoneBeta: unlocks.zones.includes('zone.pad.beta') || mastered,
  }

  const openTerminal = () => {
    warmLessonChunk()
    setLessonOpen(true)
  }

  return (
    <div className="app-root">
      <Suspense fallback={<BootScreen status="Loading training range…" />}>
        <GameView
          unlocked={unlocked}
          lessonOpen={lessonOpen}
          onOpenTerminal={openTerminal}
        />
      </Suspense>

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
        <Suspense
          fallback={
            <div className="lesson-shell" role="status">
              <p className="boot-status">{ui(locale, 'loadingLesson')}</p>
            </div>
          }
        >
          <LessonOverlay
            onClose={() => setLessonOpen(false)}
            onMastered={() => {
              /* unlocks applied in progress store; keep overlay until player closes */
            }}
          />
        </Suspense>
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
          <Suspense fallback={<p className="boot-status">{ui(locale, 'loadingLesson')}</p>}>
            <StandardsView />
          </Suspense>
        </aside>
      )}
    </div>
  )
}
