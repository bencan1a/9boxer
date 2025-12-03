import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,  // Use port 3000 for WSL compatibility
    proxy: {
      '/api': {
        target: 'http://backend:8000',  // Use docker service name
        changeOrigin: true,
      },
    },
  },
})
