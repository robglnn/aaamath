import { useCallback, useEffect, useState } from 'react'
import type { LessonPackage } from '@/content/types'
import { loadLesson, LESSON_ID } from '@/content/loadLesson'
import { MathText } from '@/lesson/MathText'
import { useLessonSession } from '@/lesson/useLessonSession'
import { ui, phaseLabel } from '@/i18n/ui'
import { pickLocalized, useProgressStore } from '@/progress/store'
import { canSTT, canTTS, listenOnce, speak } from '@/speech/webSpeech'

interface LessonOverlayProps {
  onClose: () => void
  onMastered: () => void
}

export function LessonOverlay({ onClose, onMastered }: LessonOverlayProps) {
  const locale = useProgressStore((s) => s.blob.locale)
  const recordAnswer = useProgressStore((s) => s.recordAnswer)
  const completeLessonMastery = useProgressStore((s) => s.completeLessonMastery)

  const [pkg, setPkg] = useState<LessonPackage | null>(null)
  const [loading, setLoading] = useState(true)
  const [shortAnswer, setShortAnswer] = useState('')
  const [listening, setListening] = useState(false)
  const [micError, setMicError] = useState<string | null>(null)
  const [masteryDone, setMasteryDone] = useState(false)

  const { state, phases, submitAnswer, advance, markMasteryTriggered, isIndependentItem } =
    useLessonSession(pkg, locale)

  useEffect(() => {
    let cancelled = false
    void loadLesson(LESSON_ID).then((lesson) => {
      if (!cancelled) {
        setPkg(lesson)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  const handleMastery = useCallback(() => {
    if (!pkg || masteryDone) return
    completeLessonMastery(pkg)
    markMasteryTriggered()
    setMasteryDone(true)
    // Advance through remaining phases toward complete without closing overlay
    advance()
    onMastered()
  }, [pkg, masteryDone, completeLessonMastery, markMasteryTriggered, onMastered, advance])

  useEffect(() => {
    if (state.masteryMet && !masteryDone && pkg && state.phaseKind === 'you_do') {
      handleMastery()
    }
  }, [state.masteryMet, state.phaseKind, masteryDone, pkg, handleMastery])

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

  return (
    <div className="lesson-overlay" role="dialog" aria-modal="true" aria-label={pickLocalized(pkg.title, locale)}>
      <header className="lesson-header">
        <div className="lesson-phase-tabs">
          {phases.map((p, i) => (
            <span
              key={p.id}
              className={`phase-tab ${i === state.phaseIndex ? 'active' : ''} ${i < state.phaseIndex ? 'done' : ''}`}
            >
              {phaseLabel(locale, p.kind)}
            </span>
          ))}
        </div>
        <button type="button" className="btn ghost lesson-close" onClick={onClose} aria-label={ui(locale, 'close')}>
          ×
        </button>
      </header>

      <main className="lesson-body">
        <h1 className="lesson-title">
          <MathText localized={pkg.title} locale={locale} />
        </h1>

        {phaseKind === 'objectives' && (
          <section className="lesson-section">
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

        {phase && phaseKind !== 'objectives' && phaseKind !== 'complete' && (
          <section className="lesson-section">
            <h2>{pickLocalized(phase.title, locale)}</h2>
            <MathText localized={phase.body} locale={locale} />
            {phase.bodyLatex?.map((tex, i) => (
              <MathText key={i} latex={tex} block locale={locale} />
            ))}
            <div className="tutor-actions">
              <button type="button" className="btn secondary" onClick={handleSpeakTutor} disabled={!canTTS()}>
                {ui(locale, 'speak')}
              </button>
            </div>
          </section>
        )}

        {phaseKind === 'you_do' && (
          <div className="mastery-gate" aria-live="polite">
            <span className="mastery-label">{ui(locale, 'masteryGate')}</span>
            <span className="mastery-score">
              {ui(locale, 'independentScore')}: {independentCorrect}/{Math.max(independentTotal, masteryReq.minIndependentTotal)}{' '}
              ({ui(locale, 'correct')}: {independentCorrect} / {masteryReq.minIndependentCorrect})
            </span>
            {state.masteryMet && (
              <p className="mastery-unlocked">{ui(locale, 'masteryUnlocked')}</p>
            )}
          </div>
        )}

        {currentItem && phaseKind !== 'objectives' && phaseKind !== 'complete' && (
          <section className="item-panel">
            <div className="item-stem">
              <MathText localized={currentItem.stem} locale={locale} latex={currentItem.stemLatex} />
            </div>

            {currentItem.type === 'mcq' && currentItem.choices && (
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
            )}

            {(currentItem.type === 'short' ||
              currentItem.type === 'evaluate' ||
              currentItem.type === 'translate') && (
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
            )}

            {micError && <p className="feedback incorrect">{micError}</p>}

            {lastResult && (
              <div className={`feedback-banner ${lastResult.correct ? 'correct' : 'incorrect'}`}>
                <strong>{ui(locale, lastResult.correct ? 'correct' : 'incorrect')}</strong>
                <MathText text={lastResult.feedback} locale={locale} />
              </div>
            )}

            {showSolution && currentItem && (
              <div className="worked-solution">
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

        {(phaseKind === 'complete' || masteryDone) && (
          <section className="lesson-section complete-panel">
            <h2>{ui(locale, 'lessonComplete')}</h2>
            <p>{ui(locale, 'masteryUnlocked')}</p>
            <ul className="unlock-list">
              {pkg.unlocks.map((u) => (
                <li key={u.id}>
                  <MathText localized={u.title} locale={locale} /> —{' '}
                  <MathText localized={u.description} locale={locale} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      <footer className="lesson-footer">
        {phaseKind === 'objectives' && (
          <button type="button" className="btn primary large" onClick={advance}>
            {ui(locale, 'startLesson')}
          </button>
        )}

        {lastResult && phaseKind !== 'objectives' && phaseKind !== 'complete' && !masteryDone && (
          <button type="button" className="btn primary large" onClick={advance}>
            {ui(locale, 'continue')}
          </button>
        )}

        {(masteryDone || phaseKind === 'complete') && (
          <button type="button" className="btn primary large" onClick={onClose}>
            {ui(locale, 'close')}
          </button>
        )}
      </footer>
    </div>
  )
}
