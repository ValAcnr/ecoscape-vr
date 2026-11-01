import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Served from https://valacnr.github.io/ecoscape-vr/
export default defineConfig({
  base: '/ecoscape-vr/',
  plugins: [react()],
  build: { chunkSizeWarningLimit: 1600 },
})
