# CONTEXT — Axiom Rising (aaamath)

**Codename:** Axiom Rising (placeholder)  
**Slice 0:** Playable Algebra I Lesson 1 in a thin 3D training range + content pipeline.

## Locked shape
- One Vite React TS SPA (R3F + KaTeX), static deploy.
- Player walks training pad → terminal → explicit lesson (I/We/You) → mastery gate → unlock blueprint piece + rank + second zone.
- Progress in localStorage/IndexedDB; models sync-ready.
- Web Speech STT/TTS with text fallback; EN/ES/PL.

## Key paths
- `content/` — versioned JSON schema + Lesson 1 package
- `scripts/` — content pipeline generator/validator
- `src/game/` — R3F training range, controls, unlocks
- `src/lesson/` — lesson UI, mastery gate, KaTeX
- `src/progress/` — persistence + standards jurisdiction view
- `src/speech/` — Web Speech wrappers
- `docs/handoff.md`, `docs/decisions.md`, `docs/adr/`, `docs/gauntlet/`
- `memory-bank/` — session continuity

## Gauntlet
Builder ≠ Critic. Reports under `docs/gauntlet/`. Bars: Groshell explicit teach, KaTeX-only math, Fortnite-lite movement/build, static build, Chrome+Safari mobile/desktop.
