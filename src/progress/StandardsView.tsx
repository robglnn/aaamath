import { useEffect, useMemo, useState } from 'react'
import type { Jurisdiction, LessonPackage } from '@/content/types'
import {
  LESSON_1_ID,
  LESSON_2_ID,
  LESSON_3_ID,
  LESSONS,
  loadLesson,
  resolveTerminalLessonId,
} from '@/content/loadLesson'
import { MathText } from '@/lesson/MathText'
import { ui, masteryStatusLabel } from '@/i18n/ui'
import { pickLocalized, useProgressStore } from '@/progress/store'

const CORE_TRACK = [LESSON_1_ID, LESSON_2_ID, LESSON_3_ID] as const

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

const SEAL_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']

function sealNumeral(index: number): string {
  return SEAL_NUMERALS[index] ?? String(index + 1)
}

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
  const terminalLessonId = resolveTerminalLessonId(lessonStates)

  useEffect(() => {
    void loadLesson(terminalLessonId).then(setPkg)
  }, [terminalLessonId])

  const standards = getStandardsCoverage(pkg, jurisdiction)
  const evidencedCount = standards.filter((row) => row.status === 'evidenced').length

  const lessonMastered = Boolean(pkg && lessonStates[pkg.id]?.status === 'mastered')
  const rankId = unlocks.ranks.at(-1) ?? (lessonMastered ? pkg?.worldIntegration.unlockRankId : null)
  const rankUnlock = rankId
    ? Object.values(LESSONS)
        .flatMap((lesson) => lesson.unlocks)
        .find((u) => u.id === rankId)
    : null
  const rankDisplay = rankUnlock ? pickLocalized(rankUnlock.title, locale) : ui(locale, 'recruitRank')

  const dateLocale = locale === 'en' ? 'en-US' : locale === 'es' ? 'es-ES' : 'pl-PL'

  const trackRows = useMemo(
    () =>
      CORE_TRACK.map((id, index) => {
        const lesson = LESSONS[id]
        const status = lessonStates[id]?.status ?? 'locked'
        return {
          id,
          index,
          title: lesson ? pickLocalized(lesson.title, locale) : id,
          status,
          active: id === terminalLessonId,
        }
      }),
    [lessonStates, locale, terminalLessonId],
  )

  const kpRows = useMemo(() => {
    // Loop 101: surface KPs across L1–L3 so house standing shows covered theorems, not only L1.
    const seen = new Set<string>()
    const rows: {
      kp: LessonPackage['knowledgePoints'][number]
      index: number
      status: ReturnType<typeof getKpStatus>
      cleared: boolean
      nextReviewAt?: string
      lessonId: string
    }[] = []
    for (const id of CORE_TRACK) {
      const lesson = LESSONS[id]
      if (!lesson) continue
      for (const kp of lesson.knowledgePoints) {
        if (seen.has(kp.id)) continue
        seen.add(kp.id)
        const status = getKpStatus(kp.id)
        rows.push({
          kp,
          index: rows.length,
          status,
          cleared: status === 'mastered' || status === 'due_review',
          nextReviewAt: kpStates[kp.id]?.nextReviewAt,
          lessonId: id,
        })
      }
    }
    return rows
  }, [kpStates, getKpStatus])
  const clearedCount = kpRows.filter((row) => row.cleared).length
  const dueReviewCount = Object.values(kpStates).filter((kp) => kp.status === 'due_review').length

  const standardStatusLabel = (status: string) => {
    if (status === 'evidenced') return ui(locale, 'standardEvidenced')
    if (status === 'partial') return ui(locale, 'standardPartial')
    return ui(locale, 'standardMissing')
  }

  return (
    <div className="standards-view">
      <section className="standing-card" aria-label={ui(locale, 'rankStanding')}>
        <div className="standing-hero">
          <span className={`rank-sigil${rankUnlock ? ' earned' : ''}`} aria-hidden>
            {rankUnlock ? '◆' : '◇'}
          </span>
          <div className="standing-copy">
            <p className="standing-eyebrow">{ui(locale, 'rankStanding')}</p>
            <h3 className="standing-rank">{rankDisplay}</h3>
            <p className="standing-meta">
              {lessonMastered ? ui(locale, 'lessonMasteredStanding') : ui(locale, 'houseStanding')}
            </p>
          </div>
        </div>
        {kpRows.length > 0 && (
          <div className="standing-meter-row">
            <span className="standing-meter-label">{ui(locale, 'theoremsTitle')}</span>
            <div className="standing-meter" aria-hidden>
              {kpRows.map((row) => (
                <span key={row.kp.id} className={`meter-seg${row.cleared ? ' lit' : ''}`} />
              ))}
            </div>
            <span className="standing-count">
              {clearedCount}/{kpRows.length}
            </span>
          </div>
        )}
        <details className="ability-detail" open>
          <summary>{ui(locale, 'abilityDetail')}</summary>
          <p className="ability-hint" aria-live="polite">
            θ ≈ {thetaStub.toFixed(2)} · {ui(locale, 'adaptiveHint')}
          </p>
          {dueReviewCount > 0 && (
            <p className="review-due-tally">
              {ui(locale, 'reviewDueCount')}: {dueReviewCount}
            </p>
          )}
        </details>
      </section>

      <section className="lesson-track" aria-label={ui(locale, 'lessonTrack')}>
        <h3>{ui(locale, 'lessonTrack')}</h3>
        <ol className="lesson-track-list">
          {trackRows.map((row) => (
            <li
              key={row.id}
              className={`lesson-track-item status-${row.status}${row.active ? ' is-active' : ''}`}
            >
              <span className="lesson-track-num" aria-hidden>
                {sealNumeral(row.index)}
              </span>
              <span className="lesson-track-title">{row.title}</span>
              <span className="lesson-track-status">{row.status.replace('_', ' ')}</span>
            </li>
          ))}
        </ol>
      </section>

      <div className="academy-row">
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
      </div>

      <h3>{ui(locale, 'theoremsTitle')}</h3>
      <p className="section-hint">{ui(locale, 'theoremCompleteness')}</p>
      {!pkg && <p className="empty-hint">{ui(locale, 'lessonUnavailable')}</p>}
      <ul className="kp-list seal-list">
        {kpRows.map((row) => (
          <li key={row.kp.id} className={`kp-seal status-${row.status}`}>
            <span className="seal-medal" aria-hidden>
              {sealNumeral(row.index)}
            </span>
            <div className="kp-seal-body">
              <div className="kp-title">
                <MathText localized={row.kp.title} locale={locale} />
              </div>
              {row.nextReviewAt && row.status === 'due_review' && (
                <span className="review-due">
                  {ui(locale, 'reviewDuePrefix')}
                  {new Date(row.nextReviewAt).toLocaleDateString(dateLocale)}
                </span>
              )}
            </div>
            <span className={`badge ${row.status}`}>{masteryStatusLabel(locale, row.status)}</span>
          </li>
        ))}
      </ul>

      <details className="academy-audit">
        <summary>
          {ui(locale, 'academyAudit')} · {ui(locale, 'compactStandards')}
          {standards.length > 0 && (
            <span className="audit-tally">
              {evidencedCount}/{standards.length}
            </span>
          )}
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
