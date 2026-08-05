# Axiom Rising

Fortnite-familiar **math mastery** training range. Slice 0: playable Algebra I Lesson 1 + content pipeline.

> Working title (placeholder): **Axiom Rising**

## Working title options
1. **Axiom Rising** — merit climb through theorems (current placeholder)
2. **Null Candidates** — academy underdogs who rise by proof
3. **Compact Theorems** — Galactic Compact powered by math fluency
4. **House of Variables** — faction identity + algebraic language
5. **Riser Protocol** — rank gates unlocked by mastery

## Locked Slice 0 shape
See `docs/decisions.md` and `docs/handoff.md`.

- Thin 3D training range → in-world terminal → explicit lesson (I/We/You) → mastery unlocks blueprint + rank + second zone
- Vite + React + TS + R3F + KaTeX
- Web Speech STT/TTS with keyboard/text fallback
- Progress in IndexedDB/localStorage; static SPA for GitHub Pages / itch.io
- Locales: English, Spanish, Polish

## Quick start
```bash
npm install
npm run dev
```

Open http://localhost:5173 — WASD move, Shift sprint, Space jump; on touch use virtual stick. Approach the terminal and press **E** / tap prompt to start Lesson 1.

## Build & deploy
```bash
npm run build
npm run preview
```
- Output: `dist/` with relative `base: './'` (itch.io HTML5 zip or GitHub Pages).
- No backend required.
- **GitHub Pages:** workflow `.github/workflows/deploy-pages.yml` builds `dist/` on push to `main`. Requires a plan/visibility that supports Pages (private repos may 422 until public or GitHub Pro). Intended URL: `https://robglnn.github.io/aaamath/`.
- **itch.io (reliable now):** `npm run build`, zip `dist/`, upload as HTML5; entry `index.html`.

## Content pipeline
```bash
npm run content:validate
npm run content:generate
npm run content:pipeline
```
Lesson package: `content/lessons/algebra-i-01/package.json`  
Schema: `content/schema/content-schema.v1.json`  
Pipeline notes: `content/PIPELINE.md`

## Project map
| Path | Role |
|------|------|
| `src/game/` | R3F training range, controls, unlocks |
| `src/lesson/` | Explicit teach UI + mastery gate |
| `src/progress/` | Persistence + jurisdiction standards view |
| `src/speech/` | Web Speech wrappers |
| `content/` | Versioned lesson packages |
| `docs/gauntlet/` | Builder/critic reports |
| `memory-bank/` | Session continuity |

## Gauntlet
Major artifacts use separate Builder vs Critic agents. Reports live under `docs/gauntlet/`.
