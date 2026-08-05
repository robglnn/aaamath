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

interface HudProps {
  onOpenTerminal: () => void
  pointerLocked?: boolean
}

type UnlockFlash = 'rank' | 'blueprint' | 'zone' | null

const FLASH_MS = 3200

function unlockGlyph(kind: Exclude<UnlockFlash, null>): string {
  if (kind === 'rank') return '◆'
  if (kind === 'blueprint') return '⬡'
  return '◎'
}

export function Hud({ onOpenTerminal, pointerLocked = false }: HudProps) {
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

  return (
    <div className="gr-hud">
      <div className="gr-hud-rail">
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
            {zoneTitle}{activeZone === 'beta' ? ` · ${ui(locale, 'zoneActive')}` : ''}
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

      {hasBlueprint && !blueprintPlaced && mode !== 'lesson' && (
        mode === 'build' ? (
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
        ) : (
          <button
            type="button"
            className="gr-buildbtn"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => setMode('build')}
          >
            Place Blueprint
            <span className="gr-prompt-key">B</span>
          </button>
        )
      )}

      <p className="gr-help" aria-hidden={pointerLocked}>
        {pointerLocked
          ? 'WASD · Shift sprint · Space jump · Esc release look'
          : 'WASD · Shift · Space · Click look · Q/C yaw · E terminal'}
      </p>
    </div>
  )
}
