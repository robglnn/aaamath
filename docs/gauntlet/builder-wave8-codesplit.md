# Builder — Wave 8 code-split + player materials

**Date:** 2026-08-05

## Code-split (`vite.config.ts` + `App.tsx`)
- `manualChunks`: `three`, `r3f` (@react-three/*), `katex`, `react-vendor` (react/react-dom/scheduler/zustand/use-sync-external-store)
- `onlyExplicitManualChunks: true` — see pitfall note below
- Lazy `GameView` with module-scope prefetch parallel to progress hydrate
- Suspense boot: "Loading training range…"

### Chunk sizes (prod build, final)
| Chunk | Raw | gzip | Load |
|-------|-----|------|------|
| index (app shell) | ~73 kB | ~22 kB | eager (entry) |
| react-vendor | ~197 kB | ~62 kB | eager (modulepreload) |
| katex | ~265 kB | ~78 kB | eager (modulepreload — LessonOverlay still sync; wave-10 makes it lazy) |
| helper shims (prop-types/commonjs/extends) | ~6 kB | ~3 kB | mixed |
| three | ~689 kB | ~177 kB | **deferred** (dynamic import) |
| r3f | ~156 kB | ~50 kB | **deferred** |
| GameView | ~61 kB | ~17 kB | **deferred** |

Before: single `index` chunk **1,457 kB raw / 410 kB gzip**, all parse-blocking.
After: eager shell ≈ **541 kB raw / ~165 kB gzip** (index + react-vendor + katex + shims); the 3D stack (**~906 kB raw / ~244 kB gzip**) fetches only after the shell evaluates.

### Rollup merge pitfall (fixed in wave-9 commit `9334331`)
First cut (wave-8 commit `783e8f6`) bucketed only `three`/`r3f`/`katex` — and Rollup's legacy manualChunks dependency-merge pulled **react, react-dom, zustand, and Vite's `__vitePreload` helper into the `r3f` chunk**. The entry then statically imported `r3f`/`three`, so index.html modulepreloaded them and everything still parsed before first paint (critic PASS_WITH_GAPS judged this build; the false-eager graph was found afterward by reading the entry chunk's import statements). Fix: explicit `react-vendor` bucket for every shell↔lazy shared package + `onlyExplicitManualChunks: true` so unlisted modules can't silently merge into the 3D chunks. Verified post-fix: entry imports only `react-vendor`/`katex`/shims; `three`/`r3f` absent from index.html modulepreload; browser waterfall shows the 3D group starting fetch only after the eager group completes.

`base: '/aaamath/'` unchanged; spa-fallback intact (`dist/404.html` byte-identical to `index.html`). `npm run build` green; vite chunk-size warning persists for `three` (~689 kB) — accepted, it's the deferred floor of the 3D stack.

## Player materials
- `panel` proc texture on chest plate + backpack (`Player.tsx`)
- Anim / silhouette / visor accents unchanged
