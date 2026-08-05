import { create } from 'zustand'

export type GameMode = 'explore' | 'lesson' | 'build'
export type ZoneId = 'alpha' | 'beta'

export interface UnlockFlags {
  blueprint: boolean
  rank: boolean
  zoneBeta: boolean
}

export interface GameState {
  mode: GameMode
  playerYaw: number
  canSprint: boolean
  hasBlueprint: boolean
  hasRank: boolean
  hasZoneBeta: boolean
  blueprintPlaced: boolean
  blueprintPosition: [number, number, number] | null
  nearTerminal: boolean
  activeZone: ZoneId
  stickX: number
  stickY: number
  jumpNonce: number
  placeNonce: number
  setMode: (mode: GameMode) => void
  setNearTerminal: (near: boolean) => void
  setPlayerYaw: (yaw: number) => void
  setStick: (x: number, y: number) => void
  requestJump: () => void
  requestPlace: () => void
  applyMasteryUnlocks: (unlocks: UnlockFlags) => void
  placeBlueprint: (position: [number, number, number]) => void
  setZone: (zone: ZoneId) => void
}

export const useGameStore = create<GameState>()((set) => ({
  mode: 'explore',
  playerYaw: 0,
  canSprint: true,
  hasBlueprint: false,
  hasRank: false,
  hasZoneBeta: false,
  blueprintPlaced: false,
  blueprintPosition: null,
  nearTerminal: false,
  activeZone: 'alpha',
  stickX: 0,
  stickY: 0,
  jumpNonce: 0,
  placeNonce: 0,
  setMode: (mode) => set({ mode }),
  setNearTerminal: (nearTerminal) => set({ nearTerminal }),
  setPlayerYaw: (playerYaw) => set({ playerYaw }),
  setStick: (stickX, stickY) => set({ stickX, stickY }),
  requestJump: () => set((s) => ({ jumpNonce: s.jumpNonce + 1 })),
  requestPlace: () => set((s) => ({ placeNonce: s.placeNonce + 1 })),
  applyMasteryUnlocks: (unlocks) =>
    set({
      hasBlueprint: unlocks.blueprint,
      hasRank: unlocks.rank,
      hasZoneBeta: unlocks.zoneBeta,
    }),
  placeBlueprint: (position) =>
    set({ blueprintPlaced: true, blueprintPosition: position, mode: 'explore' }),
  setZone: (activeZone) => set({ activeZone }),
}))
