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
  playerPitch: number
  pointerLocked: boolean
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
  touchSprint: boolean
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
  blueprintPlaced: false,
  blueprintPosition: null,
  nearTerminal: false,
  activeZone: 'alpha',
  stickX: 0,
  stickY: 0,
  touchSprint: false,
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
