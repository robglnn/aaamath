import { useGameStore } from '@/game/store'

interface HudProps {
  onOpenTerminal: () => void
  pointerLocked?: boolean
}

export function Hud({ onOpenTerminal, pointerLocked = false }: HudProps) {
  const nearTerminal = useGameStore((s) => s.nearTerminal)
  const hasRank = useGameStore((s) => s.hasRank)
  const hasBlueprint = useGameStore((s) => s.hasBlueprint)
  const blueprintPlaced = useGameStore((s) => s.blueprintPlaced)
  const hasZoneBeta = useGameStore((s) => s.hasZoneBeta)
  const activeZone = useGameStore((s) => s.activeZone)
  const mode = useGameStore((s) => s.mode)
  const setMode = useGameStore((s) => s.setMode)
  const requestPlace = useGameStore((s) => s.requestPlace)

  return (
    <div className="gr-hud">
      <div className="gr-hud-top">
        {hasRank && <span className="gr-rank">Riser Initiate</span>}
        {hasZoneBeta && (
          <span className={`gr-zone${activeZone === 'beta' ? ' gr-zone-live' : ''}`}>
            Zone Beta{activeZone === 'beta' ? ' · Active' : ''}
          </span>
        )}
      </div>

      {blueprintPlaced && <span className="gr-status-placed">Blueprint online</span>}

      {nearTerminal && mode === 'explore' && (
        <button
          type="button"
          className="gr-prompt"
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

      <div className="gr-help">
        {pointerLocked
          ? 'WASD · Shift sprint · Space jump · Esc release look'
          : 'WASD · Shift · Space · Click look · Q/C yaw · E terminal'}
      </div>
    </div>
  )
}
