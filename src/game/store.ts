import { create } from 'zustand'

export type GameMode = 'explore' | 'lesson' | 'build'
export type ZoneId = 'alpha' | 'beta'

export interface UnlockFlags {
  blueprint: boolean
  rank: boolean
  zoneBeta: boolean
  railBlueprint: boolean
  adeptRank: boolean
  betaAnnex: boolean
  relaySplitter: boolean
  expertRank: boolean
  gammaRelay: boolean
  balanceBeam: boolean
  operatorRank: boolean
  deltaBalance: boolean
  balanceCalibrator: boolean
  chiefRank: boolean
  epsilonCal: boolean
  balanceMirror: boolean
  vanguardRank: boolean
  zetaMirror: boolean
}

export interface GameState {
  mode: GameMode
  playerYaw: number
  playerPitch: number
  pointerLocked: boolean
  canSprint: boolean
  hasBlueprint: boolean
  hasRank: boolean
  hasZoneBeta: boolean
  hasRailBlueprint: boolean
  hasAdeptRank: boolean
  hasBetaAnnex: boolean
  hasRelaySplitter: boolean
  hasExpertRank: boolean
  hasGammaRelay: boolean
  hasBalanceBeam: boolean
  hasOperatorRank: boolean
  hasDeltaBalance: boolean
  hasBalanceCalibrator: boolean
  hasChiefRank: boolean
  hasEpsilonCal: boolean
  hasBalanceMirror: boolean
  hasVanguardRank: boolean
  hasZetaMirror: boolean
  blueprintPlaced: boolean
  blueprintPosition: [number, number, number] | null
  nearTerminal: boolean
  activeZone: ZoneId
  stickX: number
  stickY: number
  touchSprint: boolean
  touchCrawl: boolean
  jumpNonce: number
  placeNonce: number
  setMode: (mode: GameMode) => void
  setNearTerminal: (near: boolean) => void
  setPlayerYaw: (yaw: number) => void
  setPlayerPitch: (pitch: number) => void
  setLookDelta: (dx: number, dy: number) => void
  setPointerLocked: (locked: boolean) => void
  setStick: (x: number, y: number) => void
  setTouchSprint: (sprint: boolean) => void
  setTouchCrawl: (crawl: boolean) => void
  requestJump: () => void
  requestPlace: () => void
  applyMasteryUnlocks: (unlocks: UnlockFlags) => void
  placeBlueprint: (position: [number, number, number]) => void
  setZone: (zone: ZoneId) => void
}

const PITCH_MIN = -0.55
const PITCH_MAX = 0.45
const LOOK_SENS = 0.0022

export const useGameStore = create<GameState>()((set) => ({
  mode: 'explore',
  playerYaw: 0,
  playerPitch: 0,
  pointerLocked: false,
  canSprint: true,
  hasBlueprint: false,
  hasRank: false,
  hasZoneBeta: false,
  hasRailBlueprint: false,
  hasAdeptRank: false,
  hasBetaAnnex: false,
  hasRelaySplitter: false,
  hasExpertRank: false,
  hasGammaRelay: false,
  hasBalanceBeam: false,
  hasOperatorRank: false,
  hasDeltaBalance: false,
  hasBalanceCalibrator: false,
  hasChiefRank: false,
  hasEpsilonCal: false,
  hasBalanceMirror: false,
  hasVanguardRank: false,
  hasZetaMirror: false,
  blueprintPlaced: false,
  blueprintPosition: null,
  nearTerminal: false,
  activeZone: 'alpha',
  stickX: 0,
  stickY: 0,
  touchSprint: false,
  touchCrawl: false,
  jumpNonce: 0,
  placeNonce: 0,
  setMode: (mode) => set({ mode }),
  setNearTerminal: (nearTerminal) => set({ nearTerminal }),
  setPlayerYaw: (playerYaw) => set({ playerYaw }),
  setPlayerPitch: (playerPitch) =>
    set({ playerPitch: Math.min(PITCH_MAX, Math.max(PITCH_MIN, playerPitch)) }),
  setLookDelta: (dx, dy) =>
    set((s) => ({
      playerYaw: s.playerYaw - dx * LOOK_SENS,
      playerPitch: Math.min(PITCH_MAX, Math.max(PITCH_MIN, s.playerPitch - dy * LOOK_SENS)),
    })),
  setPointerLocked: (pointerLocked) => set({ pointerLocked }),
  setStick: (stickX, stickY) => set({ stickX, stickY }),
  setTouchSprint: (touchSprint) => set({ touchSprint }),
  setTouchCrawl: (touchCrawl) => set({ touchCrawl }),
  requestJump: () => set((s) => ({ jumpNonce: s.jumpNonce + 1 })),
  requestPlace: () => set((s) => ({ placeNonce: s.placeNonce + 1 })),
  applyMasteryUnlocks: (unlocks) =>
    set({
      hasBlueprint: unlocks.blueprint,
      hasRank: unlocks.rank,
      hasZoneBeta: unlocks.zoneBeta,
      hasRailBlueprint: unlocks.railBlueprint,
      hasAdeptRank: unlocks.adeptRank,
      hasBetaAnnex: unlocks.betaAnnex,
      hasRelaySplitter: unlocks.relaySplitter,
      hasExpertRank: unlocks.expertRank,
      hasGammaRelay: unlocks.gammaRelay,
      hasBalanceBeam: unlocks.balanceBeam,
      hasOperatorRank: unlocks.operatorRank,
      hasDeltaBalance: unlocks.deltaBalance,
      hasBalanceCalibrator: unlocks.balanceCalibrator,
      hasChiefRank: unlocks.chiefRank,
      hasEpsilonCal: unlocks.epsilonCal,
      hasBalanceMirror: unlocks.balanceMirror,
      hasVanguardRank: unlocks.vanguardRank,
      hasZetaMirror: unlocks.zetaMirror,
    }),
  placeBlueprint: (position) =>
    set({ blueprintPlaced: true, blueprintPosition: position, mode: 'explore' }),
  setZone: (activeZone) => set({ activeZone }),
}))
