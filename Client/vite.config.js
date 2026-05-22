import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],

  server: {
    port: 5173,

    proxy: {
      '/api': {
        target: 'https://infodocs.api.d0s369.co.in',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  build: {
    chunkSizeWarningLimit: 1000,

    commonjsOptions: {
      transformMixedEsModules: true,
      include: [/node_modules/],
    },
  },

  optimizeDeps: {
    exclude: ['@imgly/background-removal'],
  },

  base: '/',
})