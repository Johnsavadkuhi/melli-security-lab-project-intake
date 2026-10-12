import { resolve } from 'node:path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: { plugins: [externalizeDepsPlugin()] },
  // Electron runs sandboxed preload scripts as plain JavaScript.  Force a
  // CommonJS `.cjs` bundle so the bridge also works in packaged builds when
  // the project itself is ESM (`package.json` has `type: module`).
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        output: {
          format: 'cjs',
          entryFileNames: 'index.cjs'
        }
      }
    }
  },
  renderer: { resolve: { alias: { '@': resolve('src') } }, plugins: [react()] }
})
