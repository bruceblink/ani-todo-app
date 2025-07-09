import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: '127.0.0.1',
    port: 3000,    // <-- 改成 1420
  },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
    },
  plugins: [react()],
})
