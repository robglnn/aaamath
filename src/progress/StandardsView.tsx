import { useEffect, useState } from 'react'
import type { Jurisdiction, LessonPackage } from '@/content/types'
import { loadLesson, LESSON_ID } from '@/content/loadLesson'
import { MathText } from '@/lesson/MathText'
import { ui, masteryStatusLabel } from '@/i18n/ui'
import { useProgressStore } from '@/progress/store'

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
  const setJurisdiction = useProgressStore((s) => s.setJurisdiction)
  const getKpStatus = useProgressStore((s) => s.getKpStatus)
  const getStandardsCoverage = useProgressStore((s) => s.getStandardsCoverage)
  const resetProgress = useProgressStore((s) => s.resetProgress)

  const [pkg, setPkg] = useState<LessonPackage | null>(null)

  useEffect(() => {
    void loadLesson(LESSON_ID).then(setPkg)
  }, [])

  const standards = getStandardsCoverage(pkg, jurisdiction)

  const standardStatusLabel = (status: string) => {
    if (status === 'evidenced') return ui(locale, 'standardEvidenced')
    if (status === 'partial') return ui(locale, 'standardPartial')
    return ui(locale, 'standardMissing')
  }

  return (
    <div className="standards-view">
      <label className="field-label" htmlFor="jurisdiction-select">
        {ui(locale, 'jurisdiction')}
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

      <h3>{ui(locale, 'standardsTitle')}</h3>
      {!pkg && <p className="empty-hint">{ui(locale, 'lessonUnavailable')}</p>}
      {pkg && standards.length === 0 && (
        <p className="empty-hint">No standards mapped for {jurisdiction} in this lesson.</p>
      )}
      <ul className="standards-list">
        {standards.map((row) => (
          <li key={row.code} className={`standard-row status-${row.status}`}>
            <span className="standard-code">{row.code}</span>
            <span className={`badge ${row.status}`}>{standardStatusLabel(row.status)}</span>
          </li>
        ))}
      </ul>

      <h3>{ui(locale, 'kpStatusTitle')}</h3>
      {!pkg && <p className="empty-hint">{ui(locale, 'lessonUnavailable')}</p>}
      <ul className="kp-list">
        {pkg?.knowledgePoints.map((kp) => {
          const status = getKpStatus(kp.id)
          return (
            <li key={kp.id} className={`kp-row status-${status}`}>
              <div className="kp-title">
                <MathText localized={kp.title} locale={locale} />
              </div>
              <span className={`badge ${status}`}>{masteryStatusLabel(locale, status)}</span>
            </li>
          )
        })}
      </ul>

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
