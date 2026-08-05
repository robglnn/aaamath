# Tech Context

## Stack (locked)
- Vite 6 + React 19 + TypeScript
- React Three Fiber + Drei + Three.js
- KaTeX / react-katex
- Zustand + idb-keyval
- Web Speech API (browser-native)
- Static hosting: default Vite `base: '/aaamath/'` for GitHub project Pages; `npm run build:itch` for relative `./`

## Commands
```bash
npm install
npm run dev
npm run build
npm run preview
npm run content:validate
npm run content:pipeline
```

## Constraints
- No required backend for Slice 0
- No cloud STT/TTS API keys
- Chrome + Safari; phone/tablet/desktop
- Models for agents: kimi-k3-max, cursor-grok-4.5-medium, composer-2.5 only

## Deploy notes
- `vite build` → `dist/` + `404.html` SPA fallback
- GitHub Pages: **Source = GitHub Actions** (workflow `.github/workflows/deploy-pages.yml`); never branch `main/(root)`
- Live: https://robglnn.github.io/aaamath/
- itch.io: `npm run build:itch`, zip `dist`, HTML5 entry `index.html`
