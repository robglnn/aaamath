import { useEffect, useRef, useState } from 'react'
import { playBlip } from '@/game/audio'
import { useGameStore } from '@/game/store'
import { lesson1 } from '@/content/loadLesson'
import { pickLocalized, useProgressStore } from '@/progress/store'
import { ui } from '@/i18n/ui'

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
  const nearTerminal = useGameStore((s) => s.nearTerminal)
  const hasRank = useGameStore((s) => s.hasRank)
  const hasBlueprint = useGameStore((s) => s.hasBlueprint)
  const blueprintPlaced = useGameStore((s) => s.blueprintPlaced)
  const hasZoneBeta = useGameStore((s) => s.hasZoneBeta)
  const activeZone = useGameStore((s) => s.activeZone)
  const mode = useGameStore((s) => s.mode)
  const setMode = useGameStore((s) => s.setMode)
  const requestPlace = useGameStore((s) => s.requestPlace)

  const [unlockFlash, setUnlockFlash] = useState<UnlockFlash>(null)
  const prevUnlocks = useRef({ hasRank, hasBlueprint, hasZoneBeta })
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
    prevUnlocks.current = { hasRank, hasBlueprint, hasZoneBeta }

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
  }, [hasRank, hasBlueprint, hasZoneBeta, mode])

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

  const objectiveText = hasZoneBeta
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
