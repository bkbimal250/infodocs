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
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Split node_modules into separate chunks
          if (id.includes('node_modules')) {
            // React and React DOM
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            // ONNX Runtime (background removal library)
            if (id.includes('ort') || id.includes('onnxruntime')) {
              return 'onnx-vendor';
            }
            // PDF generation libraries
            if (id.includes('html2pdf') || id.includes('html2canvas') || id.includes('jspdf')) {
              return 'pdf-vendor';
            }
            // Image processing
            if (id.includes('@imgly') || id.includes('background-removal')) {
              return 'image-vendor';
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
})



