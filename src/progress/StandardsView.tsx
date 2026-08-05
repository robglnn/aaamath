import { useEffect, useMemo, useState } from 'react'
import type { Jurisdiction, LessonPackage } from '@/content/types'
import { loadLesson, LESSON_ID } from '@/content/loadLesson'
import { MathText } from '@/lesson/MathText'
import { ui, masteryStatusLabel } from '@/i18n/ui'
import { pickLocalized, useProgressStore } from '@/progress/store'

const JURISDICTIONS: Jurisdiction[] = [
  'CCSS',
  'CA',
  'NJ',
  'MI',
  'TX',
  'NY',
  'IL',
  'MO',
  'FL',
  'WA',
  'DC',
  'OH',
  'MN',
]

export function StandardsView() {
  const locale = useProgressStore((s) => s.blob.locale)
  const jurisdiction = useProgressStore((s) => s.blob.jurisdiction)
  const kpStates = useProgressStore((s) => s.blob.kpStates)
  const lessonStates = useProgressStore((s) => s.blob.lessonStates)
  const unlocks = useProgressStore((s) => s.blob.unlocks)
  const thetaStub = useProgressStore((s) => s.blob.thetaStub)
  const setJurisdiction = useProgressStore((s) => s.setJurisdiction)
  const getKpStatus = useProgressStore((s) => s.getKpStatus)
  const getStandardsCoverage = useProgressStore((s) => s.getStandardsCoverage)
  const resetProgress = useProgressStore((s) => s.resetProgress)

  const [pkg, setPkg] = useState<LessonPackage | null>(null)

  useEffect(() => {
    void loadLesson(LESSON_ID).then(setPkg)
  }, [])

  const standards = getStandardsCoverage(pkg, jurisdiction)
  void kpStates
  void lessonStates

  const lessonMastered = Boolean(pkg && lessonStates[pkg.id]?.status === 'mastered')
  const rankId = unlocks.ranks[0] ?? (lessonMastered ? pkg?.worldIntegration.unlockRankId : null)
  const rankUnlock = rankId && pkg ? pkg.unlocks.find((u) => u.id === rankId) : null
  const rankDisplay = rankUnlock ? pickLocalized(rankUnlock.title, locale) : ui(locale, 'recruitRank')

  const dateLocale = locale === 'en' ? 'en-US' : locale === 'es' ? 'es-ES' : 'pl-PL'

  const kpGlance = useMemo(() => {
    if (!pkg) return { cleared: 0, total: 0 }
    let cleared = 0
    for (const kp of pkg.knowledgePoints) {
      const status = getKpStatus(kp.id)
      if (status === 'mastered' || status === 'due_review') cleared += 1
    }
    return { cleared, total: pkg.knowledgePoints.length }
  }, [pkg, kpStates, getKpStatus])

  const standardStatusLabel = (status: string) => {
    if (status === 'evidenced') return ui(locale, 'standardEvidenced')
    if (status === 'partial') return ui(locale, 'standardPartial')
    return ui(locale, 'standardMissing')
  }

  return (
    <div className="standards-view">
      <section className="standing-card" aria-label={ui(locale, 'rankStanding')}>
        <p className="standing-eyebrow">{ui(locale, 'rankStanding')}</p>
        <h3 className="standing-rank">{rankDisplay}</h3>
        <p className="standing-meta">
          {lessonMastered ? ui(locale, 'lessonMasteredStanding') : ui(locale, 'houseStanding')}
          {kpGlance.total > 0 && (
            <span className="standing-theorems">
              {' '}
              · {kpGlance.cleared}/{kpGlance.total}
            </span>
          )}
        </p>
        <details className="ability-detail">
          <summary>{ui(locale, 'abilityDetail')}</summary>
          <p className="ability-hint" aria-live="polite">
            θ ≈ {thetaStub.toFixed(2)}
          </p>
        </details>
      </section>

      <label className="field-label" htmlFor="jurisdiction-select">
        {ui(locale, 'academySelect')}
      </label>
      <select
        id="jurisdiction-select"
        className="select-input"
        value={jurisdiction}
        onChange={(e) => setJurisdiction(e.target.value as Jurisdiction)}
      >
        {JURISDICTIONS.map((j) => (
          <option key={j} value={j}>
            {j}
          </option>
        ))}
      </select>

      <h3>{ui(locale, 'theoremsTitle')}</h3>
      <p className="section-hint">{ui(locale, 'theoremCompleteness')}</p>
      {!pkg && <p className="empty-hint">{ui(locale, 'lessonUnavailable')}</p>}
      <ul className="kp-list">
        {pkg?.knowledgePoints.map((kp) => {
          const status = getKpStatus(kp.id)
          const kpState = kpStates[kp.id]
          return (
            <li key={kp.id} className={`kp-row status-${status}`}>
              <div className="kp-main">
                <span className={`status-pip status-${status}`} aria-hidden />
                <div className="kp-title">
                  <MathText localized={kp.title} locale={locale} />
                </div>
              </div>
              <span className={`badge ${status}`}>{masteryStatusLabel(locale, status)}</span>
              {kpState?.nextReviewAt && status === 'due_review' && (
                <span className="review-due">
                  {ui(locale, 'reviewDuePrefix')}
                  {new Date(kpState.nextReviewAt).toLocaleDateString(dateLocale)}
                </span>
              )}
            </li>
          )
        })}
      </ul>

      <details className="academy-audit">
        <summary>
          {ui(locale, 'academyAudit')} · {ui(locale, 'compactStandards')}
        </summary>
        <h4 className="audit-subhead">{ui(locale, 'standardsTitle')}</h4>
        {!pkg && <p className="empty-hint">{ui(locale, 'lessonUnavailable')}</p>}
        {pkg && standards.length === 0 && (
          <p className="empty-hint">{ui(locale, 'noStandardsMapped')}</p>
        )}
        <ul className="standards-list">
          {standards.map((row) => (
            <li key={row.code} className={`standard-row status-${row.status}`}>
              <span className="standard-code">{row.code}</span>
              <span className={`badge ${row.status}`}>{standardStatusLabel(row.status)}</span>
            </li>
          ))}
        </ul>
      </details>

      {pkg && (
        <details className="kp-details">
          <summary>{ui(locale, 'successCriteria')}</summary>
          <ul>
            {pkg.knowledgePoints.map((kp) => (
              <li key={kp.id}>
                <strong>
                  <MathText localized={kp.title} locale={locale} />
                </strong>
                : <MathText localized={kp.successCriteria} locale={locale} />
              </li>
            ))}
          </ul>
        </details>
      )}

      <button
        type="button"
        className="btn ghost danger"
        onClick={() => void resetProgress()}
      >
        {ui(locale, 'resetProgress')}
      </button>
    </div>
  )
}
