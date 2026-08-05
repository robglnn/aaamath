import { lazy, Suspense, useEffect, useState } from 'react'
import { LESSON_1_ID, LESSON_2_ID, LESSON_3_ID, LESSON_4_ID, LESSON_5_ID, LESSON_6_ID, resolveTerminalLessonId } from '@/content/loadLesson'
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
  const lessonStates = useProgressStore((s) => s.blob.lessonStates)
  const lessonState = lessonStates[LESSON_1_ID]
  const lesson2State = lessonStates[LESSON_2_ID]
  const lesson3State = lessonStates[LESSON_3_ID]
  const lesson4State = lessonStates[LESSON_4_ID]
  const lesson5State = lessonStates[LESSON_5_ID]
  const lesson6State = lessonStates[LESSON_6_ID]
  const terminalLessonId = resolveTerminalLessonId(lessonStates)

  const [lessonOpen, setLessonOpen] = useState(false)
  const [progressOpen, setProgressOpen] = useState(false)

  useEffect(() => {
    void hydrate()
  }, [hydrate])

  if (!hydrated) {
    return <BootScreen status="Initializing local progress…" />
  }

  const mastered = lessonState?.status === 'mastered'
  const mastered2 = lesson2State?.status === 'mastered'
  const mastered3 = lesson3State?.status === 'mastered'
  const mastered4 = lesson4State?.status === 'mastered'
  const mastered5 = lesson5State?.status === 'mastered'
  const mastered6 = lesson6State?.status === 'mastered'
  const unlocked = {
    blueprint: unlocks.blueprints.includes('bp.pad.ramp') || mastered,
    rank: unlocks.ranks.includes('rank.riser.initiate') || mastered,
    zoneBeta: unlocks.zones.includes('zone.pad.beta') || mastered,
    railBlueprint: unlocks.blueprints.includes('bp.pad.rail') || mastered2,
    adeptRank: unlocks.ranks.includes('rank.riser.adept') || mastered2,
    // Legacy blobs recorded the L2 zone as zone.beacon.cyan — treat it as the annex.
    betaAnnex:
      unlocks.zones.includes('zone.beta.annex') ||
      unlocks.zones.includes('zone.beacon.cyan') ||
      mastered2,
    relaySplitter: unlocks.blueprints.includes('bp.relay.splitter') || mastered3,
    expertRank: unlocks.ranks.includes('rank.riser.expert') || mastered3,
    gammaRelay: unlocks.zones.includes('zone.gamma.relay') || mastered3,
    balanceBeam: unlocks.blueprints.includes('bp.balance.beam') || mastered4,
    operatorRank: unlocks.ranks.includes('rank.riser.operator') || mastered4,
    deltaBalance: unlocks.zones.includes('zone.delta.balance') || mastered4,
    balanceCalibrator: unlocks.blueprints.includes('bp.balance.calibrator') || mastered5,
    chiefRank: unlocks.ranks.includes('rank.riser.chief') || mastered5,
    epsilonCal: unlocks.zones.includes('zone.epsilon.cal') || mastered5,
    balanceMirror: unlocks.blueprints.includes('bp.balance.mirror') || mastered6,
    vanguardRank: unlocks.ranks.includes('rank.riser.vanguard') || mastered6,
    zetaMirror: unlocks.zones.includes('zone.zeta.mirror') || mastered6,
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
          onOpenProgress={() => setProgressOpen(true)}
        />
      </Suspense>

      <div className="app-chrome" aria-label="Game menu">
        <LocaleSwitcher />
        <button
          type="button"
          className="btn chrome-btn chrome-seal"
          onClick={() => setProgressOpen((v) => !v)}
          aria-expanded={progressOpen}
          aria-label={ui(locale, 'progress')}
          title={ui(locale, 'progress')}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden focusable="false">
            <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <path
              d="M12 6.5v5.2l3.4 2"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
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
            lessonId={terminalLessonId}
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
