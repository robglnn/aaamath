import { useEffect, useRef, useState } from 'react'
import { playBlip } from '@/game/audio'
import { useGameStore } from '@/game/store'
import { lesson1, lesson2, lesson3, lesson4, lesson5, lesson6 } from '@/content/loadLesson'
import type { Locale } from '@/content/types'
import { pickLocalized, useProgressStore } from '@/progress/store'
import { ui } from '@/i18n/ui'

const L2_BLUEPRINT_ID = 'bp.pad.rail'
const L2_RANK_ID = 'rank.riser.adept'
const L2_ZONE_IDS = ['zone.beacon.cyan', 'zone.beta.annex'] as const

const L3_BLUEPRINT_ID = 'bp.relay.splitter'
const L3_RANK_ID = 'rank.riser.expert'
const L3_ZONE_ID = 'zone.gamma.relay'

const L4_BLUEPRINT_ID = 'bp.balance.beam'
const L4_RANK_ID = 'rank.riser.operator'
const L4_ZONE_ID = 'zone.delta.balance'

const L5_BLUEPRINT_ID = 'bp.balance.calibrator'
const L5_RANK_ID = 'rank.riser.chief'
const L5_ZONE_ID = 'zone.epsilon.cal'

const L6_BLUEPRINT_ID = 'bp.balance.mirror'
const L6_RANK_ID = 'rank.riser.vanguard'
const L6_ZONE_ID = 'zone.zeta.mirror'

function resolveL2ZoneId(zones: string[]): (typeof L2_ZONE_IDS)[number] | null {
  for (const id of L2_ZONE_IDS) {
    if (zones.includes(id)) return id
  }
  return null
}

function l2UnlockTitle(id: string, locale: Locale): string {
  const def = lesson2.unlocks.find((u) => u.id === id)
  if (def) return pickLocalized(def.title, locale)
  if (id === 'zone.beacon.cyan') {
    const zoneDef = lesson2.unlocks.find((u) => u.kind === 'zone')
    if (zoneDef) return pickLocalized(zoneDef.title, locale)
  }
  return id
}

function l3UnlockTitle(id: string, locale: Locale): string {
  const def = lesson3.unlocks.find((u) => u.id === id)
  return def ? pickLocalized(def.title, locale) : id
}

function l4UnlockTitle(id: string, locale: Locale): string {
  const def = lesson4.unlocks.find((u) => u.id === id)
  return def ? pickLocalized(def.title, locale) : id
}

function l5UnlockTitle(id: string, locale: Locale): string {
  const def = lesson5.unlocks.find((u) => u.id === id)
  return def ? pickLocalized(def.title, locale) : id
}

function l6UnlockTitle(id: string, locale: Locale): string {
  const def = lesson6.unlocks.find((u) => u.id === id)
  return def ? pickLocalized(def.title, locale) : id
}

export interface ZoneMapState {
  alpha: boolean
  beta: boolean
  annex: boolean
  gamma: boolean
  delta: boolean
  epsilon: boolean
  zeta: boolean
}

interface HudProps {
  onOpenTerminal: () => void
  onOpenProgress?: () => void
  pointerLocked?: boolean
  zoneState?: ZoneMapState
}

type UnlockFlash = 'rank' | 'blueprint' | 'zone' | null

const FLASH_MS = 3200

function unlockGlyph(kind: Exclude<UnlockFlash, null>): string {
  if (kind === 'rank') return '◆'
  if (kind === 'blueprint') return '⬡'
  return '◎'
}

export function Hud({
  onOpenTerminal,
  onOpenProgress,
  pointerLocked = false,
  zoneState = { alpha: true, beta: false, annex: false, gamma: false, delta: false, epsilon: false, zeta: false },
}: HudProps) {
  const locale = useProgressStore((s) => s.blob.locale)
  const progressUnlocks = useProgressStore((s) => s.blob.unlocks)
  const nearTerminal = useGameStore((s) => s.nearTerminal)
  const hasRank = useGameStore((s) => s.hasRank)
  const hasBlueprint = useGameStore((s) => s.hasBlueprint)
  const blueprintPlaced = useGameStore((s) => s.blueprintPlaced)
  const hasZoneBeta = useGameStore((s) => s.hasZoneBeta)
  const hasRailBlueprint = useGameStore((s) => s.hasRailBlueprint)
  const hasAdeptRank = useGameStore((s) => s.hasAdeptRank)
  const hasBetaAnnex = useGameStore((s) => s.hasBetaAnnex)
  const hasRelaySplitter = useGameStore((s) => s.hasRelaySplitter)
  const hasExpertRank = useGameStore((s) => s.hasExpertRank)
  const hasGammaRelay = useGameStore((s) => s.hasGammaRelay)
  const hasBalanceBeam = useGameStore((s) => s.hasBalanceBeam)
  const hasOperatorRank = useGameStore((s) => s.hasOperatorRank)
  const hasDeltaBalance = useGameStore((s) => s.hasDeltaBalance)
  const hasBalanceCalibrator = useGameStore((s) => s.hasBalanceCalibrator)
  const hasChiefRank = useGameStore((s) => s.hasChiefRank)
  const hasEpsilonCal = useGameStore((s) => s.hasEpsilonCal)
  const hasBalanceMirror = useGameStore((s) => s.hasBalanceMirror)
  const hasVanguardRank = useGameStore((s) => s.hasVanguardRank)
  const hasZetaMirror = useGameStore((s) => s.hasZetaMirror)
  const activeZone = useGameStore((s) => s.activeZone)
  const mode = useGameStore((s) => s.mode)
  const setMode = useGameStore((s) => s.setMode)
  const requestPlace = useGameStore((s) => s.requestPlace)

  const [unlockFlash, setUnlockFlash] = useState<UnlockFlash>(null)
  const prevUnlocks = useRef({ hasRank, hasBlueprint, hasZoneBeta, hasRailBlueprint, hasAdeptRank, hasBetaAnnex, hasRelaySplitter, hasExpertRank, hasGammaRelay, hasBalanceBeam, hasOperatorRank, hasDeltaBalance, hasBalanceCalibrator, hasChiefRank, hasEpsilonCal, hasBalanceMirror, hasVanguardRank, hasZetaMirror })
  const prevNearTerminal = useRef(nearTerminal)
  const syncReady = useRef(false)
  const pendingFlash = useRef<UnlockFlash>(null)
  const flashTimer = useRef<number | null>(null)

  const showFlash = (flash: UnlockFlash) => {
    if (!flash) return
    playBlip('unlock')
    if (flashTimer.current) window.clearTimeout(flashTimer.current)
    setUnlockFlash(flash)
    flashTimer.current = window.setTimeout(() => {
      setUnlockFlash(null)
      flashTimer.current = null
    }, FLASH_MS)
  }

  useEffect(() => {
    if (!prevNearTerminal.current && nearTerminal && mode === 'explore') {
      playBlip('prompt')
    }
    prevNearTerminal.current = nearTerminal
  }, [nearTerminal, mode])

  useEffect(() => {
    const prev = prevUnlocks.current
    let flash: UnlockFlash = null
    if (!prev.hasRank && hasRank) flash = 'rank'
    else if (!prev.hasBlueprint && hasBlueprint) flash = 'blueprint'
    else if (!prev.hasZoneBeta && hasZoneBeta) flash = 'zone'
    // L2 transitions reuse the same flash card (rail → blueprint, adept → rank, annex → zone)
    else if (!prev.hasAdeptRank && hasAdeptRank) flash = 'rank'
    else if (!prev.hasRailBlueprint && hasRailBlueprint) flash = 'blueprint'
    else if (!prev.hasBetaAnnex && hasBetaAnnex) flash = 'zone'
    // L3 transitions ride the same cards (expert → rank, splitter → blueprint, gamma → zone)
    else if (!prev.hasExpertRank && hasExpertRank) flash = 'rank'
    else if (!prev.hasRelaySplitter && hasRelaySplitter) flash = 'blueprint'
    else if (!prev.hasGammaRelay && hasGammaRelay) flash = 'zone'
    // L4 transitions ride the same cards (operator → rank, beam → blueprint, delta → zone)
    else if (!prev.hasOperatorRank && hasOperatorRank) flash = 'rank'
    else if (!prev.hasBalanceBeam && hasBalanceBeam) flash = 'blueprint'
    else if (!prev.hasDeltaBalance && hasDeltaBalance) flash = 'zone'
    // L5 transitions (chief → rank, calibrator → blueprint, epsilon → zone)
    else if (!prev.hasChiefRank && hasChiefRank) flash = 'rank'
    else if (!prev.hasBalanceCalibrator && hasBalanceCalibrator) flash = 'blueprint'
    else if (!prev.hasEpsilonCal && hasEpsilonCal) flash = 'zone'
    // L6 transitions (vanguard → rank, mirror → blueprint, zeta → zone)
    else if (!prev.hasVanguardRank && hasVanguardRank) flash = 'rank'
    else if (!prev.hasBalanceMirror && hasBalanceMirror) flash = 'blueprint'
    else if (!prev.hasZetaMirror && hasZetaMirror) flash = 'zone'
    prevUnlocks.current = { hasRank, hasBlueprint, hasZoneBeta, hasRailBlueprint, hasAdeptRank, hasBetaAnnex, hasRelaySplitter, hasExpertRank, hasGammaRelay, hasBalanceBeam, hasOperatorRank, hasDeltaBalance, hasBalanceCalibrator, hasChiefRank, hasEpsilonCal, hasBalanceMirror, hasVanguardRank, hasZetaMirror }

    if (!syncReady.current) {
      syncReady.current = true
      return
    }

    if (!flash) return

    if (mode === 'lesson') {
      pendingFlash.current = flash
      return
    }

    showFlash(flash)
  }, [hasRank, hasBlueprint, hasZoneBeta, hasRailBlueprint, hasAdeptRank, hasBetaAnnex, hasRelaySplitter, hasExpertRank, hasGammaRelay, hasBalanceBeam, hasOperatorRank, hasDeltaBalance, hasBalanceCalibrator, hasChiefRank, hasEpsilonCal, hasBalanceMirror, hasVanguardRank, hasZetaMirror, mode])

  useEffect(() => {
    if (mode === 'lesson' || !pendingFlash.current) return
    const flash = pendingFlash.current
    pendingFlash.current = null
    showFlash(flash)
  }, [mode])

  useEffect(() => {
    return () => {
      if (flashTimer.current) window.clearTimeout(flashTimer.current)
    }
  }, [])

  const flashLabel =
    unlockFlash === 'rank'
      ? ui(locale, 'unlockRank')
      : unlockFlash === 'blueprint'
        ? ui(locale, 'unlockBlueprint')
        : unlockFlash === 'zone'
          ? ui(locale, 'unlockZone')
          : ''

  const rankUnlock = lesson1.unlocks.find((u) => u.id === lesson1.worldIntegration.unlockRankId)
  const zoneUnlock = lesson1.unlocks.find((u) => u.id === lesson1.worldIntegration.unlockZoneId)
  const rankTitle = rankUnlock ? pickLocalized(rankUnlock.title, locale) : ui(locale, 'recruitRank')
  const zoneTitle = zoneUnlock ? pickLocalized(zoneUnlock.title, locale) : ui(locale, 'zoneUnlocked')

  const hasL2Blueprint = progressUnlocks.blueprints.includes(L2_BLUEPRINT_ID)
  const hasL2Rank = progressUnlocks.ranks.includes(L2_RANK_ID)
  const l2ZoneId = resolveL2ZoneId(progressUnlocks.zones)
  const l2BlueprintTitle = l2UnlockTitle(L2_BLUEPRINT_ID, locale)
  const l2RankTitle = l2UnlockTitle(L2_RANK_ID, locale)
  const l2ZoneTitle = l2ZoneId ? l2UnlockTitle(l2ZoneId, locale) : ''

  const hasL3Blueprint = progressUnlocks.blueprints.includes(L3_BLUEPRINT_ID)
  const hasL3Rank = progressUnlocks.ranks.includes(L3_RANK_ID)
  const hasL3Zone = progressUnlocks.zones.includes(L3_ZONE_ID)
  const l3BlueprintTitle = l3UnlockTitle(L3_BLUEPRINT_ID, locale)
  const l3RankTitle = l3UnlockTitle(L3_RANK_ID, locale)
  const l3ZoneTitle = l3UnlockTitle(L3_ZONE_ID, locale)

  const hasL4Blueprint = progressUnlocks.blueprints.includes(L4_BLUEPRINT_ID)
  const hasL4Rank = progressUnlocks.ranks.includes(L4_RANK_ID)
  const hasL4Zone = progressUnlocks.zones.includes(L4_ZONE_ID)
  const l4BlueprintTitle = l4UnlockTitle(L4_BLUEPRINT_ID, locale)
  const l4RankTitle = l4UnlockTitle(L4_RANK_ID, locale)
  const l4ZoneTitle = l4UnlockTitle(L4_ZONE_ID, locale)

  const hasL5Blueprint = progressUnlocks.blueprints.includes(L5_BLUEPRINT_ID)
  const hasL5Rank = progressUnlocks.ranks.includes(L5_RANK_ID)
  const hasL5Zone = progressUnlocks.zones.includes(L5_ZONE_ID)
  const l5BlueprintTitle = l5UnlockTitle(L5_BLUEPRINT_ID, locale)
  const l5RankTitle = l5UnlockTitle(L5_RANK_ID, locale)
  const l5ZoneTitle = l5UnlockTitle(L5_ZONE_ID, locale)

  const hasL6Blueprint = progressUnlocks.blueprints.includes(L6_BLUEPRINT_ID)
  const hasL6Rank = progressUnlocks.ranks.includes(L6_RANK_ID)
  const hasL6Zone = progressUnlocks.zones.includes(L6_ZONE_ID)
  const l6BlueprintTitle = l6UnlockTitle(L6_BLUEPRINT_ID, locale)
  const l6RankTitle = l6UnlockTitle(L6_RANK_ID, locale)
  const l6ZoneTitle = l6UnlockTitle(L6_ZONE_ID, locale)

  const objectiveText = hasZetaMirror
    ? ui(locale, 'objectiveZetaMirrorOpen')
    : hasEpsilonCal
    ? ui(locale, 'objectiveEpsilonCalOpen')
    : hasDeltaBalance
      ? ui(locale, 'objectiveDeltaBalanceOpen')
      : hasGammaRelay
        ? ui(locale, 'objectiveGammaRelayOpen')
        : hasBetaAnnex
          ? ui(locale, 'objectiveAnnexOpen')
          : hasZoneBeta
            ? ui(locale, 'objectiveZoneBetaOpen')
            : hasBlueprint && !blueprintPlaced
              ? ui(locale, 'objectivePlaceBlueprint')
              : ui(locale, 'objectiveReachTerminal')

  const latestRankTitle = hasL6Rank
    ? l6RankTitle
    : hasL5Rank
      ? l5RankTitle
      : hasL4Rank
        ? l4RankTitle
        : hasL3Rank
          ? l3RankTitle
          : hasL2Rank
            ? l2RankTitle
            : hasRank
              ? rankTitle
              : null
  const unlockCount =
    Number(hasRank) +
    Number(hasZoneBeta) +
    Number(hasL2Rank) +
    Number(hasL2Blueprint) +
    Number(!!l2ZoneId) +
    Number(hasL3Rank) +
    Number(hasL3Blueprint) +
    Number(hasL3Zone) +
    Number(hasL4Rank) +
    Number(hasL4Blueprint) +
    Number(hasL4Zone) +
    Number(hasL5Rank) +
    Number(hasL5Blueprint) +
    Number(hasL5Zone) +
    Number(hasL6Rank) +
    Number(hasL6Blueprint) +
    Number(hasL6Zone)
  const compactRail = unlockCount > 3

  return (
    <div className="gr-hud">
      <div className={`gr-hud-rail${compactRail ? ' gr-hud-rail--compact' : ''}`}>
        {compactRail ? (
          <>
            {latestRankTitle && (
              <span className="gr-rank" data-tier="primary">
                <span className="gr-rank-icon" aria-hidden>
                  ◆
                </span>
                {latestRankTitle}
              </span>
            )}
            {hasZoneBeta && (
              <span
                className={`gr-zone${activeZone === 'beta' ? ' gr-zone-live' : ''}`}
                data-tier={activeZone === 'beta' ? 'primary' : 'secondary'}
              >
                {zoneTitle}
                {activeZone === 'beta' ? ` · ${ui(locale, 'zoneActive')}` : ''}
              </span>
            )}
            <span className="gr-l2-chip gr-rail-summary" title={`${unlockCount} unlocks`}>
              <span className="gr-l2-chip-icon" aria-hidden>
                ⬡
              </span>
              {unlockCount} unlocked
            </span>
          </>
        ) : (
          <>
            {hasRank && (
              <span className="gr-rank" data-tier="primary">
                <span className="gr-rank-icon" aria-hidden>
                  ◆
                </span>
                {rankTitle}
              </span>
            )}
            {hasZoneBeta && (
              <span
                className={`gr-zone${activeZone === 'beta' ? ' gr-zone-live' : ''}`}
                data-tier={activeZone === 'beta' ? 'primary' : 'secondary'}
              >
                {zoneTitle}
                {activeZone === 'beta' ? ` · ${ui(locale, 'zoneActive')}` : ''}
              </span>
            )}
            {hasL2Rank && (
              <span className="gr-l2-chip gr-l2-chip--rank" data-tier="adept">
                <span className="gr-l2-chip-icon" aria-hidden>
                  ◆
                </span>
                {l2RankTitle}
              </span>
            )}
            {hasL2Blueprint && (
              <span className="gr-l2-chip gr-l2-chip--blueprint" data-tier="adept">
                <span className="gr-l2-chip-icon" aria-hidden>
                  ⬡
                </span>
                {l2BlueprintTitle}
              </span>
            )}
            {l2ZoneId && (
              <span className="gr-l2-chip gr-l2-chip--zone" data-tier="adept">
                <span className="gr-l2-chip-icon" aria-hidden>
                  ◎
                </span>
                {l2ZoneTitle}
              </span>
            )}
            {hasL3Rank && (
              <span className="gr-l2-chip gr-l3-chip gr-l3-chip--rank" data-tier="expert">
                <span className="gr-l2-chip-icon" aria-hidden>
                  ◆
                </span>
                {l3RankTitle}
              </span>
            )}
            {hasL3Blueprint && (
              <span className="gr-l2-chip gr-l3-chip gr-l3-chip--blueprint" data-tier="expert">
                <span className="gr-l2-chip-icon" aria-hidden>
                  ⬡
                </span>
                {l3BlueprintTitle}
              </span>
            )}
            {hasL3Zone && (
              <span className="gr-l2-chip gr-l3-chip gr-l3-chip--zone" data-tier="expert">
                <span className="gr-l2-chip-icon" aria-hidden>
                  ◎
                </span>
                {l3ZoneTitle}
              </span>
            )}
            {hasL4Rank && (
              <span className="gr-l2-chip gr-l4-chip gr-l4-chip--rank" data-tier="operator">
                <span className="gr-l2-chip-icon" aria-hidden>
                  ◆
                </span>
                {l4RankTitle}
              </span>
            )}
            {hasL4Blueprint && (
              <span className="gr-l2-chip gr-l4-chip gr-l4-chip--blueprint" data-tier="operator">
                <span className="gr-l2-chip-icon" aria-hidden>
                  ⬡
                </span>
                {l4BlueprintTitle}
              </span>
            )}
            {hasL4Zone && (
              <span className="gr-l2-chip gr-l4-chip gr-l4-chip--zone" data-tier="operator">
                <span className="gr-l2-chip-icon" aria-hidden>
                  ◎
                </span>
                {l4ZoneTitle}
              </span>
            )}
            {hasL5Rank && (
              <span className="gr-l2-chip gr-l5-chip gr-l5-chip--rank" data-tier="chief">
                <span className="gr-l2-chip-icon" aria-hidden>
                  ◆
                </span>
                {l5RankTitle}
              </span>
            )}
            {hasL5Blueprint && (
              <span className="gr-l2-chip gr-l5-chip gr-l5-chip--blueprint" data-tier="chief">
                <span className="gr-l2-chip-icon" aria-hidden>
                  ⬡
                </span>
                {l5BlueprintTitle}
              </span>
            )}
            {hasL5Zone && (
              <span className="gr-l2-chip gr-l5-chip gr-l5-chip--zone" data-tier="chief">
                <span className="gr-l2-chip-icon" aria-hidden>
                  ◎
                </span>
                {l5ZoneTitle}
              </span>
            )}
            {hasL6Rank && (
              <span className="gr-l2-chip gr-l6-chip gr-l6-chip--rank" data-tier="vanguard">
                <span className="gr-l2-chip-icon" aria-hidden>
                  ◆
                </span>
                {l6RankTitle}
              </span>
            )}
            {hasL6Blueprint && (
              <span className="gr-l2-chip gr-l6-chip gr-l6-chip--blueprint" data-tier="vanguard">
                <span className="gr-l2-chip-icon" aria-hidden>
                  ⬡
                </span>
                {l6BlueprintTitle}
              </span>
            )}
            {hasL6Zone && (
              <span className="gr-l2-chip gr-l6-chip gr-l6-chip--zone" data-tier="vanguard">
                <span className="gr-l2-chip-icon" aria-hidden>
                  ◎
                </span>
                {l6ZoneTitle}
              </span>
            )}
          </>
        )}
      </div>

      {mode !== 'lesson' && !nearTerminal && (
        <p className="gr-objective" role="status">
          {objectiveText}
        </p>
      )}

      {blueprintPlaced && <span className="gr-status-placed">{ui(locale, 'blueprintOnline')}</span>}

      {unlockFlash && mode !== 'lesson' && (
        <div className={`gr-unlock-flash gr-unlock-flash--${unlockFlash}`} role="status" aria-live="polite">
          <div className="gr-unlock-flash-card">
            <span className="gr-unlock-flash-icon" aria-hidden>
              {unlockGlyph(unlockFlash)}
            </span>
            <span className="gr-unlock-flash-kicker">{ui(locale, 'unlocksEarned')}</span>
            <span className="gr-unlock-flash-text">{flashLabel}</span>
          </div>
        </div>
      )}

      {nearTerminal && mode === 'explore' && (
        <button
          type="button"
          className="gr-prompt gr-prompt-pulse"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={onOpenTerminal}
        >
          <span className="gr-prompt-key">E</span>
          Open Algebra Terminal
        </button>
      )}

      {hasBlueprint && !blueprintPlaced && mode === 'build' && (
        <div className="gr-buildbar" onPointerDown={(e) => e.stopPropagation()}>
          <button type="button" className="gr-btn gr-btn-primary" onClick={requestPlace}>
            Place Blueprint
            <span className="gr-prompt-key">F</span>
          </button>
          <button type="button" className="gr-btn gr-btn-ghost" onClick={() => setMode('explore')}>
            Cancel
            <span className="gr-prompt-key">Esc</span>
          </button>
        </div>
      )}

      {mode !== 'lesson' && (
        <nav className="gr-ability-wheel" aria-label="Loadout">
          <button
            type="button"
            className={`gr-ability${mode === 'explore' ? ' gr-ability-active' : ''}`}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => setMode('explore')}
            aria-pressed={mode === 'explore'}
            title="Explore"
          >
            <svg viewBox="0 0 32 32" aria-hidden focusable="false" className="gr-ability-glyph">
              {/* Chunky filled octahedron — explore */}
              <polygon points="16,3 10,16 16,29" fill="currentColor" opacity="0.62" />
              <polygon points="16,3 22,16 16,29" fill="currentColor" opacity="0.88" />
              <polygon points="16,3 22,16 16,16 10,16" fill="currentColor" />
              <circle cx="16" cy="16" r="3.6" fill="currentColor" />
              <g className="gr-glyph-wire">
                <polygon points="16,3 28,16 16,29 4,16" fill="none" stroke="currentColor" strokeWidth="1.1" />
                <line x1="4" y1="16" x2="28" y2="16" stroke="currentColor" strokeWidth="0.9" />
                <line x1="10" y1="16" x2="16" y2="3" stroke="currentColor" strokeWidth="0.8" />
                <line x1="22" y1="16" x2="16" y2="3" stroke="currentColor" strokeWidth="0.8" />
                <line x1="10" y1="16" x2="16" y2="29" stroke="currentColor" strokeWidth="0.8" />
                <line x1="22" y1="16" x2="16" y2="29" stroke="currentColor" strokeWidth="0.8" />
              </g>
            </svg>
          </button>
          <button
            type="button"
            className={`gr-ability${mode === 'build' ? ' gr-ability-active gr-ability-gold' : ''}${!hasBlueprint || blueprintPlaced ? ' gr-ability-locked' : ''}`}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => {
              if (!hasBlueprint || blueprintPlaced) return
              setMode(mode === 'build' ? 'explore' : 'build')
            }}
            aria-pressed={mode === 'build'}
            aria-disabled={!hasBlueprint || blueprintPlaced}
            title={hasBlueprint && !blueprintPlaced ? 'Build' : 'Build locked'}
          >
            <svg viewBox="0 0 32 32" aria-hidden focusable="false" className="gr-ability-glyph">
              {/* Chunky filled cube — build */}
              <polygon points="7,12 16,7 25,12 16,17" fill="currentColor" />
              <polygon points="7,12 7,22 16,27 16,17" fill="currentColor" opacity="0.55" />
              <polygon points="25,12 25,22 16,27 16,17" fill="currentColor" opacity="0.78" />
              <g className="gr-glyph-wire">
                <polygon points="7,12 16,7 25,12 16,17" fill="none" stroke="currentColor" strokeWidth="1.1" />
                <polygon points="7,22 16,27 25,22 16,17" fill="none" stroke="currentColor" strokeWidth="1.1" />
                <line x1="7" y1="12" x2="7" y2="22" stroke="currentColor" strokeWidth="1" />
                <line x1="16" y1="7" x2="16" y2="27" stroke="currentColor" strokeWidth="1" />
                <line x1="25" y1="12" x2="25" y2="22" stroke="currentColor" strokeWidth="1" />
              </g>
            </svg>
          </button>
          <button
            type="button"
            className="gr-ability"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onOpenProgress?.()}
            title={ui(locale, 'progress')}
            aria-label={ui(locale, 'progress')}
          >
            <svg viewBox="0 0 32 32" aria-hidden focusable="false" className="gr-ability-glyph">
              {/* Chunky filled tetrahedron — progress */}
              <polygon points="6,24 16,5 26,24" fill="currentColor" opacity="0.42" />
              <polygon points="6,24 16,5 16,24" fill="currentColor" opacity="0.68" />
              <polygon points="26,24 16,5 16,24" fill="currentColor" opacity="0.92" />
              <circle cx="16" cy="17.5" r="4.2" fill="currentColor" />
              <g className="gr-glyph-wire">
                <polygon points="16,5 26,24 6,24" fill="none" stroke="currentColor" strokeWidth="1.1" />
                <line x1="16" y1="5" x2="16" y2="24" stroke="currentColor" strokeWidth="0.9" />
                <line x1="6" y1="24" x2="21" y2="14.5" stroke="currentColor" strokeWidth="0.8" />
                <line x1="26" y1="24" x2="11" y2="14.5" stroke="currentColor" strokeWidth="0.8" />
                <circle cx="16" cy="17.5" r="4.2" fill="none" stroke="currentColor" strokeWidth="1" />
              </g>
            </svg>
          </button>
        </nav>
      )}

      {mode !== 'lesson' && (
        <div className="gr-minimap" aria-label="Unlocked zones" role="img">
          <svg viewBox="0 0 120 120" className="gr-minimap-svg">
            {/* Quadrant color blocks — Fortnite-style zone sectors */}
            <path d="M60 60 L60 6 A54 54 0 0 1 114 60 Z" className="gr-minimap-quad gr-minimap-quad--ne" />
            <path d="M60 60 L114 60 A54 54 0 0 1 60 114 Z" className="gr-minimap-quad gr-minimap-quad--se" />
            <path d="M60 60 L60 114 A54 54 0 0 1 6 60 Z" className="gr-minimap-quad gr-minimap-quad--sw" />
            <path d="M60 60 L6 60 A54 54 0 0 1 60 6 Z" className="gr-minimap-quad gr-minimap-quad--nw" />
            <circle cx="60" cy="60" r="54" className="gr-minimap-ring" />
            <circle cx="60" cy="60" r="46" className="gr-minimap-disk" />
            {/* Path lines between zones */}
            <path d="M60 78 L60 38" className="gr-minimap-path" />
            <path d="M60 78 L82 48" className="gr-minimap-path" />
            <path d="M60 78 L38 48" className="gr-minimap-path" />
            <path d="M60 78 L88 62" className="gr-minimap-path" />
            <path d="M60 78 L32 62" className="gr-minimap-path" />
            <path d="M60 78 L78 82" className="gr-minimap-path" />
            {/* Alpha — south pad */}
            <rect x="54" y="72" width="12" height="12" rx="2" transform="rotate(45 60 78)" className={zoneState.alpha ? 'gr-minimap-zone is-open' : 'gr-minimap-zone'} />
            {/* Beta — north */}
            <rect x="55" y="32" width="10" height="10" rx="2" transform="rotate(45 60 38)" className={zoneState.beta ? 'gr-minimap-zone is-open is-beta' : 'gr-minimap-zone'} />
            {/* Annex — NE */}
            <rect x="77" y="42" width="9" height="9" rx="2" transform="rotate(45 82 48)" className={zoneState.annex ? 'gr-minimap-zone is-open is-annex' : 'gr-minimap-zone'} />
            {/* Gamma — NW */}
            <rect x="33" y="42" width="9" height="9" rx="2" transform="rotate(45 38 48)" className={zoneState.gamma ? 'gr-minimap-zone is-open is-gamma' : 'gr-minimap-zone'} />
            {/* Delta — E */}
            <rect x="83" y="56" width="9" height="9" rx="2" transform="rotate(45 88 62)" className={zoneState.delta ? 'gr-minimap-zone is-open is-delta' : 'gr-minimap-zone'} />
            {/* Epsilon — W */}
            <rect x="27" y="56" width="9" height="9" rx="2" transform="rotate(45 32 62)" className={zoneState.epsilon ? 'gr-minimap-zone is-open is-epsilon' : 'gr-minimap-zone'} />
            {/* Zeta — SE */}
            <rect x="73" y="76" width="9" height="9" rx="2" transform="rotate(45 78 82)" className={zoneState.zeta ? 'gr-minimap-zone is-open is-zeta' : 'gr-minimap-zone'} />
            {/* Player pip */}
            <circle cx="60" cy="72" r="3.2" className="gr-minimap-player" />
            <path d="M60 64 L63 70 L60 68 L57 70 Z" className="gr-minimap-facing" />
          </svg>
        </div>
      )}

      <p className="gr-help" aria-hidden={pointerLocked}>
        {pointerLocked
          ? 'WASD · Shift sprint · Ctrl/C crawl · Space jump · Esc release look'
          : 'WASD · Shift · Space · Click look · Q/C yaw · E terminal'}
      </p>
    </div>
  )
}
