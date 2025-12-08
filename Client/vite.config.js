import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8009 ',
        changeOrigin: true,
        secure: false, // Disable SSL verification for local development
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1000, // Increase warning limit to 1MB
    commonjsOptions: {
      transformMixedEsModules: true,
      include: [/node_modules/],
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Split node_modules into separate chunks
          if (id.includes('node_modules')) {
            // React and React DOM - must be together and loaded first
            // Use simpler pattern to catch all React-related packages
            if (id.includes('node_modules/react') && !id.includes('react-icons')) {
              return 'react-vendor';
            }
            // Bundle @imgly/background-removal and ONNX together in vendor chunk
            // They must stay together due to tight coupling and module format requirements
            if (id.includes('@imgly') || 
                id.includes('background-removal') || 
                id.includes('ort') || 
                id.includes('onnxruntime') ||
                id.includes('onnxruntime-web')) {
              // Bundle with other vendor libraries to avoid splitting
              return 'vendor';
            }
            // PDF generation libraries
            if (id.includes('html2pdf') || id.includes('html2canvas') || id.includes('jspdf')) {
              return 'pdf-vendor';
            }
            // Other large vendor libraries
            if (id.includes('axios') || id.includes('react-icons')) {
              return 'utils-vendor';
            }
            // All other node_modules
            return 'vendor';
          }
        },
      },
    },
  },
  optimizeDeps: {
    exclude: ['@imgly/background-removal'],
  },
})



