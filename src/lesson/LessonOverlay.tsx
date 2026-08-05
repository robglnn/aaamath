import { useCallback, useEffect, useRef, useState } from 'react'
import 'katex/dist/katex.min.css'
import type { LessonPackage, UnlockDefinition } from '@/content/types'
import { loadLesson } from '@/content/loadLesson'
import { MathText } from '@/lesson/MathText'
import { useLessonSession } from '@/lesson/useLessonSession'
import { ui, phaseLabel, unlockKindLabel } from '@/i18n/ui'
import { pickLocalized, useProgressStore } from '@/progress/store'
import { canSTT, canTTS, listenOnce, speak } from '@/speech/webSpeech'

interface LessonOverlayProps {
  lessonId: string
  onClose: () => void
  onMastered: () => void
}

function unlockTone(kind: UnlockDefinition['kind']): string {
  if (kind === 'blueprint') return 'unlock-card--blueprint'
  if (kind === 'rank') return 'unlock-card--rank'
  return 'unlock-card--zone'
}

function isTeachingPhase(kind: string): boolean {
  return kind === 'i_do' || kind === 'we_do' || kind === 'you_do'
}

export function LessonOverlay({ lessonId, onClose, onMastered }: LessonOverlayProps) {
  const locale = useProgressStore((s) => s.blob.locale)
  const thetaStub = useProgressStore((s) => s.blob.thetaStub)
  const recordAnswer = useProgressStore((s) => s.recordAnswer)
  const completeLessonMastery = useProgressStore((s) => s.completeLessonMastery)
  const introduceLessonKps = useProgressStore((s) => s.introduceLessonKps)

  const [pkg, setPkg] = useState<LessonPackage | null>(null)
  const [loading, setLoading] = useState(true)
  const [shortAnswer, setShortAnswer] = useState('')
  const [listening, setListening] = useState(false)
  const [micError, setMicError] = useState<string | null>(null)
  const [masteryDone, setMasteryDone] = useState(false)
  const [masteryBump, setMasteryBump] = useState(false)
  const prevIndependentCorrect = useRef(0)

  const { state, phases, submitAnswer, advance, markMasteryTriggered, isIndependentItem } =
    useLessonSession(pkg, locale, thetaStub)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setPkg(null)
    setMasteryDone(false)
    prevIndependentCorrect.current = 0
    void loadLesson(lessonId).then((lesson) => {
      if (cancelled) return
      setPkg(lesson)
      setLoading(false)
      if (lesson) introduceLessonKps(lesson)
    })
    return () => {
      cancelled = true
    }
  }, [lessonId, introduceLessonKps])

  const handleMastery = useCallback(() => {
    if (!pkg || masteryDone) return
    completeLessonMastery(pkg)
    markMasteryTriggered()
    setMasteryDone(true)
    advance()
    onMastered()
  }, [pkg, masteryDone, completeLessonMastery, markMasteryTriggered, onMastered, advance])

  useEffect(() => {
    if (state.masteryMet && !masteryDone && pkg && state.phaseKind === 'you_do') {
      handleMastery()
    }
  }, [state.masteryMet, state.phaseKind, masteryDone, pkg, handleMastery])

  useEffect(() => {
    const correct = state.independentCorrect
    if (correct <= prevIndependentCorrect.current) {
      prevIndependentCorrect.current = correct
      return
    }
    prevIndependentCorrect.current = correct
    setMasteryBump(true)
    const timer = window.setTimeout(() => setMasteryBump(false), 700)
    return () => window.clearTimeout(timer)
  }, [state.independentCorrect])

  const handleSubmit = (choiceId?: string) => {
    if (!state.currentItem) return
    const raw = choiceId ?? shortAnswer
    const result = submitAnswer(raw, choiceId)
    if (!result || !pkg) return

    recordAnswer({
      item: state.currentItem,
      correct: result.correct,
      rawAnswer: raw,
      locale,
      isIndependent: isIndependentItem(state.currentItem),
      lessonId: pkg.id,
    })

    if (!choiceId) setShortAnswer('')
  }

  const handleListen = async () => {
    if (!canSTT()) {
      setMicError(ui(locale, 'micUnavailable'))
      return
    }
    setMicError(null)
    setListening(true)
    try {
      const transcript = await listenOnce(locale)
      setShortAnswer(transcript)
    } catch (err) {
      setMicError(err instanceof Error ? err.message : ui(locale, 'micUnavailable'))
    } finally {
      setListening(false)
    }
  }

  const handleSpeakTutor = () => {
    if (!state.phase) return
    if (!canTTS()) return
    speak(pickLocalized(state.phase.tutorScript, locale), locale)
  }

  if (loading) {
    return (
      <div className="lesson-overlay" role="dialog" aria-modal="true">
        <div className="lesson-panel">
          <p>{ui(locale, 'loadingLesson')}</p>
        </div>
      </div>
    )
  }

  if (!pkg) {
    return (
      <div className="lesson-overlay" role="dialog" aria-modal="true">
        <div className="lesson-panel empty-state">
          <p>{ui(locale, 'lessonUnavailable')}</p>
          <button type="button" className="btn primary" onClick={onClose}>
            {ui(locale, 'close')}
          </button>
        </div>
      </div>
    )
  }

  const { phase, phaseKind, currentItem, lastResult, showSolution, independentCorrect, independentTotal } =
    state
  const masteryReq = pkg.mastery
  // Unlock cards only on real mastery (critic gap); still allow exit when complete without mastery.
  const celebrating = masteryDone
  const lessonFinished = celebrating || phaseKind === 'complete'
  const itemFocus = Boolean(currentItem) && !celebrating && phaseKind !== 'objectives'
  const teachFocus =
    !celebrating &&
    !itemFocus &&
    phase &&
    phaseKind !== 'objectives'
  const needed = Math.max(masteryReq.minIndependentCorrect - independentCorrect, 0)
  const masteryPct = Math.min(
    100,
    Math.round((independentCorrect / Math.max(masteryReq.minIndependentCorrect, 1)) * 100),
  )
  const railPct =
    phases.length > 1
      ? Math.round(
          ((celebrating ? phases.length - 1 : state.phaseIndex) / (phases.length - 1)) * 100,
        )
      : 0

  return (
    <div className="lesson-overlay" role="dialog" aria-modal="true" aria-label={pickLocalized(pkg.title, locale)}>
      <header className="lesson-header">
        <nav className="phase-rail" aria-label={ui(locale, 'phaseRailLabel')}>
          <span className="phase-rail-track" aria-hidden>
            <span className="phase-rail-fill" style={{ width: `${railPct}%` }} />
          </span>
          {phases.map((p, i) => {
            const done = i < state.phaseIndex || (celebrating && i <= state.phaseIndex)
            const active = i === state.phaseIndex && !celebrating
            const teach = isTeachingPhase(p.kind)
            return (
              <div
                key={p.id}
                className={`phase-rail-step ${teach ? 'is-teach' : 'is-bookend'} ${p.kind === 'you_do' ? 'is-mastery-step' : ''}`}
              >
                {i > 0 && (
                  <span
                    className={`phase-rail-link ${done ? 'lit' : ''} ${active ? 'active-link' : ''} ${teach ? 'is-teach-link' : ''}`}
                    aria-hidden
                  />
                )}
                <span
                  className={`phase-chip ${active ? 'active' : ''} ${done ? 'done' : ''} ${teach ? 'is-teach' : 'is-bookend'} ${p.kind === 'you_do' ? 'is-mastery' : ''}`}
                  aria-current={active ? 'step' : undefined}
                >
                  <span className="phase-chip-dot" aria-hidden />
                  <span className="phase-chip-label">{phaseLabel(locale, p.kind)}</span>
                </span>
              </div>
            )
          })}
        </nav>
        <button type="button" className="btn ghost lesson-close" onClick={onClose} aria-label={ui(locale, 'close')}>
          ×
        </button>
      </header>

      <main className={`lesson-body ${celebrating ? 'is-celebrate' : ''} ${itemFocus ? 'is-item-focus' : ''}`}>
        {!celebrating && !itemFocus && (
          <h1 className="lesson-title">
            <MathText localized={pkg.title} locale={locale} />
          </h1>
        )}

        {phaseKind === 'objectives' && !celebrating && (
          <section className="lesson-section focus-panel" aria-label={ui(locale, 'missionBrief')}>
            <p className="focus-eyebrow">{ui(locale, 'missionBrief')}</p>
            <h2>{ui(locale, 'objectives')}</h2>
            <ul className="objective-list">
              {pkg.objectives.map((obj, i) => (
                <li key={i}>
                  <MathText localized={obj} locale={locale} />
                </li>
              ))}
            </ul>
            {pkg.knowledgePoints.length > 0 && (
              <>
                <h3>{ui(locale, 'successCriteria')}</h3>
                <ul className="objective-list">
                  {pkg.knowledgePoints.map((kp) => (
                    <li key={kp.id}>
                      <MathText localized={kp.successCriteria} locale={locale} />
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        )}

        {teachFocus && (
          <section className="lesson-section focus-panel">
            <p className="focus-eyebrow">{phaseLabel(locale, phaseKind)}</p>
            <h2>{pickLocalized(phase.title, locale)}</h2>
            <div className="math-focus">
              <MathText localized={phase.body} locale={locale} />
              {phase.bodyLatex?.map((tex, i) => (
                <MathText key={i} latex={tex} block locale={locale} />
              ))}
            </div>
            <div className="tutor-actions">
              <button type="button" className="btn secondary" onClick={handleSpeakTutor} disabled={!canTTS()}>
                {ui(locale, 'speak')}
              </button>
            </div>
          </section>
        )}

        {phaseKind === 'you_do' && !celebrating && (
          <div
            className={`mastery-gate ${masteryBump ? 'is-bump' : ''} ${state.masteryMet ? 'is-met' : ''}`}
            aria-live="polite"
          >
            <div className="mastery-gate-head">
              <span className="mastery-label">{ui(locale, 'masteryProgress')}</span>
              <span className="mastery-score">
                {independentCorrect}/{masteryReq.minIndependentCorrect}
              </span>
            </div>
            <div
              className="mastery-bar"
              role="progressbar"
              aria-valuenow={masteryPct}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className="mastery-bar-fill" style={{ width: `${masteryPct}%` }}>
                <span className="mastery-bar-shine" aria-hidden />
              </div>
            </div>
            <p className="mastery-hint">
              {ui(locale, 'independentScore')} · {independentTotal}/{masteryReq.minIndependentTotal}
              {needed > 0 ? ` · ${needed}` : ''}
            </p>
            {state.masteryMet && <p className="mastery-unlocked">{ui(locale, 'masteryUnlocked')}</p>}
          </div>
        )}

        {itemFocus && currentItem && (
          <section className="item-panel focus-panel" aria-label={ui(locale, 'challengeFocus')}>
            <div className="item-panel-head">
              <p className="focus-eyebrow">{ui(locale, 'challengeFocus')}</p>
              {phase && (
                <button
                  type="button"
                  className="btn ghost coach-speak"
                  onClick={handleSpeakTutor}
                  disabled={!canTTS()}
                >
                  {ui(locale, 'speak')}
                </button>
              )}
            </div>
            {phase && state.itemIndex === 0 && !lastResult && (
              <details className="coach-note">
                <summary>{pickLocalized(phase.title, locale)}</summary>
                <div className="math-focus">
                  <MathText localized={phase.body} locale={locale} />
                  {phase.bodyLatex?.map((tex, i) => (
                    <MathText key={i} latex={tex} block locale={locale} />
                  ))}
                </div>
              </details>
            )}
            <div className="item-stem math-focus">
              <MathText localized={currentItem.stem} locale={locale} latex={currentItem.stemLatex} />
            </div>

            {currentItem.choices && currentItem.choices.length > 0 ? (
              <div className="choice-grid">
                {currentItem.choices.map((choice) => (
                  <button
                    key={choice.id}
                    type="button"
                    className={`btn choice ${lastResult?.choiceId === choice.id ? (lastResult.correct ? 'correct' : 'incorrect') : ''}`}
                    onClick={() => handleSubmit(choice.id)}
                    disabled={Boolean(lastResult)}
                  >
                    <MathText localized={choice.text} locale={locale} latex={choice.latex} />
                  </button>
                ))}
              </div>
            ) : (
              (currentItem.type === 'short' ||
                currentItem.type === 'evaluate' ||
                currentItem.type === 'translate' ||
                currentItem.type === 'mcq') && (
                <div className="short-answer-row">
                  <label className="sr-only" htmlFor="lesson-answer">
                    {ui(locale, 'yourAnswer')}
                  </label>
                  <input
                    id="lesson-answer"
                    className="text-input"
                    type="text"
                    inputMode="text"
                    autoComplete="off"
                    value={shortAnswer}
                    onChange={(e) => setShortAnswer(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !lastResult) handleSubmit()
                    }}
                    disabled={Boolean(lastResult)}
                    placeholder={ui(locale, 'yourAnswer')}
                  />
                  <button
                    type="button"
                    className="btn secondary"
                    onClick={() => void handleListen()}
                    disabled={listening || Boolean(lastResult)}
                    title={canSTT() ? ui(locale, 'listen') : ui(locale, 'micUnavailable')}
                  >
                    {listening ? ui(locale, 'listening') : ui(locale, 'listen')}
                  </button>
                  <button
                    type="button"
                    className="btn primary"
                    onClick={() => handleSubmit()}
                    disabled={!shortAnswer.trim() || Boolean(lastResult)}
                  >
                    {ui(locale, 'submit')}
                  </button>
                </div>
              )
            )}

            {micError && <p className="feedback incorrect">{micError}</p>}

            {lastResult && (
              <div className={`feedback-banner ${lastResult.correct ? 'correct' : 'incorrect'}`} aria-live="assertive">
                <div className="feedback-punch">
                  <span className="feedback-glyph" aria-hidden>
                    {lastResult.correct ? '◆' : '◇'}
                  </span>
                  <div>
                    <strong className="feedback-lead">
                      {ui(locale, lastResult.correct ? 'correct' : 'incorrect')}
                    </strong>
                    <p className="feedback-sub">
                      {ui(locale, lastResult.correct ? 'feedbackCorrectLead' : 'feedbackIncorrectLead')}
                    </p>
                  </div>
                </div>
                <div className="feedback-body math-focus">
                  <MathText text={lastResult.feedback} locale={locale} />
                </div>
                {!lastResult.correct && (
                  <p className="feedback-action">
                    {showSolution ? ui(locale, 'reviewSolutionHint') : ui(locale, 'tryAgainHint')}
                  </p>
                )}
              </div>
            )}

            {showSolution && currentItem && (
              <div className="worked-solution math-focus">
                <h3>{ui(locale, 'workedSolution')}</h3>
                <MathText
                  localized={currentItem.workedSolution}
                  locale={locale}
                  latex={currentItem.workedSolutionLatex}
                />
              </div>
            )}
          </section>
        )}

        {celebrating && (
          <section className="celebrate-panel" aria-live="polite">
            <div className="celebrate-backdrop" aria-hidden>
              <span className="celebrate-ring celebrate-ring--outer" />
              <span className="celebrate-ring celebrate-ring--inner" />
              <span className="celebrate-spark celebrate-spark--a">✦</span>
              <span className="celebrate-spark celebrate-spark--b">◇</span>
              <span className="celebrate-spark celebrate-spark--c">✦</span>
            </div>
            <div className="celebrate-hero">
              <p className="celebrate-flare" aria-hidden>
                ✦
              </p>
              <h2 className="celebrate-title">{ui(locale, 'celebrationTitle')}</h2>
              <p className="celebrate-sub">{ui(locale, 'celebrationSub')}</p>
              <p className="celebrate-score" aria-label={ui(locale, 'masteryProgress')}>
                {independentCorrect}/{masteryReq.minIndependentCorrect}
              </p>
            </div>
            <p className="unlocks-earned-label">{ui(locale, 'unlocksEarned')}</p>
            <ul className="unlock-reveal">
              {pkg.unlocks.map((u, i) => (
                <li
                  key={u.id}
                  className={`unlock-card ${unlockTone(u.kind)}`}
                  style={{ animationDelay: `${180 + i * 140}ms` }}
                >
                  <span className="unlock-kind">{unlockKindLabel(locale, u.kind)}</span>
                  <strong className="unlock-title">
                    <MathText localized={u.title} locale={locale} />
                  </strong>
                  <span className="unlock-desc">
                    <MathText localized={u.description} locale={locale} />
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      <footer className="lesson-footer">
        {phaseKind === 'objectives' && !celebrating && (
          <button type="button" className="btn primary large" onClick={advance}>
            {ui(locale, 'startLesson')}
          </button>
        )}

        {lastResult && phaseKind !== 'objectives' && !celebrating && (
          <button type="button" className="btn primary large" onClick={advance}>
            {ui(locale, 'continue')}
          </button>
        )}

        {teachFocus && !currentItem && !lastResult && phaseKind !== 'you_do' && (
          <button type="button" className="btn primary large" onClick={advance}>
            {ui(locale, 'continue')}
          </button>
        )}

        {celebrating && (
          <button type="button" className="btn primary large celebrate-cta" onClick={onClose}>
            {ui(locale, 'continueToRange')}
          </button>
        )}

        {lessonFinished && !celebrating && (
          <button type="button" className="btn primary large" onClick={onClose}>
            {ui(locale, 'continueToRange')}
          </button>
        )}
      </footer>
    </div>
  )
}
