import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // Fail loudly if 3000 is taken instead of silently drifting to 3001 — that
    // auto-picked origin isn't in the backend CORS allow-list, which would break
    // every API call with an opaque CORS error.
    strictPort: true,
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
})
