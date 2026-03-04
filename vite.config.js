import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Expose to network
    port: 5173, // Default port
    proxy: {
      // All /api requests to main backend (port 8089)
      // This includes /api/onboarding/api/v1/service
      '/api': {
        target: 'http://10.140.8.28:8089',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
