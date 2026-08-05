import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

// Project Pages: https://robglnn.github.io/aaamath/
// itch.io / relative: VITE_BASE=./ npm run build  (or npm run build:itch)
const base = process.env.VITE_BASE ?? '/aaamath/'

export default defineConfig({
  plugins: [react()],
  base,
  resolve: {
    alias: {
      '@': path.resolve(rootDir, 'src'),
    },
  },
  server: {
    port: 5173,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const p = id.replace(/\\/g, '/')
          if (!p.includes('node_modules')) return
          // Order matters: '@react-three' paths also contain 'three'.
          if (p.includes('@react-three')) return 'r3f'
          if (p.includes('/three')) return 'three'
          if (p.includes('katex')) return 'katex'
        },
      },
    },
  },
})
