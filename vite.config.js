import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Expose to network
    port: 5173, // Default port
    allowedHosts: true, // Allow all hosts
    proxy: {
      // Proxy all /api requests to the backend
      '/api': {
        // target: 'http://10.140.8.28:8089',
        target: 'https://suse-challenging-bird-raised.trycloudflare.com/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
