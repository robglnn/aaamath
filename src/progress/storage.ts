import { get, set, del } from 'idb-keyval'
import type { ProgressBlob } from '@/content/types'

const IDB_KEY = 'axiom-progress-v1'
const LS_KEY = 'axiom-progress-v1-mirror'

function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `player-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

export function createDefaultProgress(): ProgressBlob {
  const now = new Date().toISOString()
  return {
    schemaVersion: '1.0.0',
    playerId: uuid(),
    locale: 'en',
    jurisdiction: 'CCSS',
    thetaStub: 0,
    kpStates: {},
    lessonStates: {
      'algebra-i-01': {
        lessonId: 'algebra-i-01',
        status: 'available',
        phaseIndex: 0,
        independentCorrect: 0,
        independentTotal: 0,
      },
    },
    itemResponses: [],
    unlocks: {
      blueprints: [],
      ranks: [],
      zones: ['zone.pad.alpha'],
    },
    updatedAt: now,
  }
}

function readLocalStorageMirror(): ProgressBlob | null {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return null
    return JSON.parse(raw) as ProgressBlob
  } catch {
    return null
  }
}

function writeLocalStorageMirror(blob: ProgressBlob): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(blob))
  } catch {
    // Quota or privacy mode — IndexedDB remains primary
  }
}

export async function loadProgress(): Promise<ProgressBlob> {
  try {
    const fromIdb = await get<ProgressBlob>(IDB_KEY)
    if (fromIdb?.schemaVersion === '1.0.0') {
      return fromIdb
    }
  } catch {
    // Fall through to localStorage / default
  }

  const fromLs = readLocalStorageMirror()
  if (fromLs?.schemaVersion === '1.0.0') {
    return fromLs
  }

  return createDefaultProgress()
}

export async function saveProgress(blob: ProgressBlob): Promise<void> {
  const stamped: ProgressBlob = {
    ...blob,
    updatedAt: new Date().toISOString(),
  }
  writeLocalStorageMirror(stamped)
  try {
    await set(IDB_KEY, stamped)
  } catch {
    // localStorage mirror already written
  }
}

export async function resetProgress(): Promise<ProgressBlob> {
  const fresh = createDefaultProgress()
  writeLocalStorageMirror(fresh)
  try {
    await set(IDB_KEY, fresh)
  } catch {
    // mirror is enough for testing
  }
  return fresh
}

export async function clearProgressStorage(): Promise<void> {
  writeLocalStorageMirror(createDefaultProgress())
  try {
    await del(IDB_KEY)
  } catch {
    // noop
  }
}
