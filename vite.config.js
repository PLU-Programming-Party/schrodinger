import { defineConfig } from 'vite'

export default defineConfig({
  base: '/5s/particles/2025/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    target: 'es2022'
  }
})
