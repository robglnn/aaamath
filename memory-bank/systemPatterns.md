# System Patterns

## Architecture
```
content/ (JSON packages)
    ↓ validate/generate scripts
src/content (loaders + types)
    ↓
App shell
 ├── GameWorld (R3F) — pads, terminal, blueprint placement, second zone
 ├── LessonOverlay — phases, KaTeX, mastery gate
 ├── ProgressHUD — KP status, jurisdiction stub
 └── Speech — Web Speech STT/TTS wrappers
```

## Key patterns
- **Content as data:** Lessons are versioned JSON; UI never hardcodes math copy.
- **Knowledge graph slice:** Atomic KPs with prerequisites; lessons are ordered views.
- **Mastery gate:** Unlock path only after independent practice criteria met.
- **Sync-ready progress:** Local store mirrors future account schema (`playerId`, `kpStates`, `itemResponses`, `unlocks`).
- **Gauntlet:** Builder ≠ Critic; reports in `docs/gauntlet/`.

## Component relationships
- `useGameStore` — world state (position mode, unlocked pieces, active zone)
- `useProgressStore` — KP mastery, lesson status, jurisdiction, persistence
- `useLessonSession` — phase machine (objectives → I do → We do → You do → complete)
- Terminal collision/proximity opens lesson; lesson close returns to world with unlocks applied
