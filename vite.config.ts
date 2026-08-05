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
        // Keep unlisted modules (vite preload helper, fiber/drei deps)
        // out of the manual chunks — merging them there made the entry
        // statically import the 3D chunks, defeating the lazy split.
        onlyExplicitManualChunks: true,
        manualChunks(id) {
          const p = id.replace(/\\/g, '/')
          if (!p.includes('node_modules')) return
          // Order matters: '@react-three' paths also contain 'three'.
          if (p.includes('@react-three')) return 'r3f'
          if (p.includes('/three')) return 'three'
          if (p.includes('katex')) return 'katex'
          // Shell↔lazy shared runtime must stay out of the 3D chunks —
          // otherwise Rollup merges it there and the entry statically
          // imports them, making them eager again.
          if (
            p.includes('/react/') ||
            p.includes('/react-dom/') ||
            p.includes('/scheduler/') ||
            p.includes('/use-sync-external-store/') ||
            p.includes('/zustand/')
          ) {
            return 'react-vendor'
          }
        },
      },
    },
  },
})
