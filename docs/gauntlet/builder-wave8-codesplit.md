# Builder — Wave 8 code-split + player materials

**Date:** 2026-08-05

## Code-split (`vite.config.ts` + `App.tsx`)
- `manualChunks`: `three`, `r3f` (@react-three/*), `katex`
- Lazy `GameView` with module-scope prefetch parallel to progress hydrate
- Suspense boot: "Loading training range…"

### Chunk sizes (prod build)
| Chunk | Raw | gzip |
|-------|-----|------|
| index (app shell) | ~72 kB | ~21 kB |
| GameView | ~61 kB | ~17 kB |
| katex | ~274 kB | ~82 kB |
| r3f | ~353 kB | ~111 kB |
| three | ~689 kB | ~177 kB |

`base: '/aaamath/'` unchanged; spa-fallback intact.

## Player materials
- `panel` proc texture on chest plate + backpack (`Player.tsx`)
- Anim / silhouette / visor accents unchanged
