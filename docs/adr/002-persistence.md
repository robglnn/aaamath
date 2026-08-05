# ADR-002: Progress Persistence

## Status
Accepted (locked Slice 0)

## Context
No accounts in Slice 0, but models must be sync-ready.

## Decision
- Primary: IndexedDB via `idb-keyval` for progress blob
- Fallback/cache: localStorage mirror of last-known state
- Schema fields: `playerId` (local UUID), `locale`, `jurisdiction`, `kpStates`, `lessonStates`, `itemResponses`, `unlocks`, `thetaStub`, `srSchedules`, `updatedAt`

## Consequences
- Later accounts can POST the same blob shape
- Device-local only until sync layer exists
- Clear/reset available for testing
