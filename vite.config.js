import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Expose to network
    port: 5173, // Default port
    proxy: {
      // Proxy all /api requests to the API Gateway - Port 8089
      // This includes the Service Catalog API at /service/*
      '/api': {
        target: 'http://10.140.8.28:8089',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
