/**
 * GitHub Pages SPA fallback: unknown paths serve 404.html.
 * Copy built index so deep links / refreshes still boot the app.
 */
import { copyFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const index = resolve('dist/index.html')
const fallback = resolve('dist/404.html')

if (!existsSync(index)) {
  console.error('spa-fallback: dist/index.html missing — run vite build first')
  process.exit(1)
}

copyFileSync(index, fallback)
console.log('spa-fallback: wrote dist/404.html')
