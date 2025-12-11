import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Configure for GitHub Pages deployment
  // Update 'CyclingModelization' to your actual repo name
  base: process.env.NODE_ENV === 'production' ? '/CyclingModelization/' : '/',
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
