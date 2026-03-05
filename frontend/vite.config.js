import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/analyze': 'http://localhost:8000',
      '/upload': 'http://localhost:8000',
      '/results': 'http://localhost:8000',
      '/statistics': 'http://localhost:8000',
      '/keywords': 'http://localhost:8000',
    },
  },
})
