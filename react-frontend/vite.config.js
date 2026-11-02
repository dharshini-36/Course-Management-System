import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Always use 5173 so it matches CLIENT_URL in Backend/.env.
    // If 5173 is busy, Vite stops with an error instead of silently switching
    // to 5174 (which the backend's CORS would block).
    port: 5173,
    strictPort: true,
  },
})