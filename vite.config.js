import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  assetsInclude: ['**/*.glsl'],
  server: {
    port: 3000,
    open: true
  },
  optimizeDeps: {
    include: ['lucide-react', 'framer-motion', 'gsap'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          motion: ['framer-motion']
        }
      }
    }
  }
})