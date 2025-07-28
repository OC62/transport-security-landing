import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/transport-security-landing/',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})