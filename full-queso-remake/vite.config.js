import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable React Fast Refresh optimizations
      fastRefresh: true,
      // Optimize JSX runtime
      jsxRuntime: 'automatic'
    }),
    tailwindcss()
  ],
  server: {
    port: (() => {
      const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
      return isNaN(port) || port < 1 || port > 65535 ? 3000 : port;
    })(),
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Enable minification
    minify: 'terser',
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Advanced build optimizations
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'icons-vendor': ['react-icons'],
          'animation-vendor': ['framer-motion', 'animejs'],
          'store-vendor': ['zustand'],
          // App chunks
          'components': [
            './src/components/layout/Header.jsx',
            './src/components/layout/MainLayout.jsx',
            './src/components/layout/BottomNav.jsx'
          ],
          'stores': [
            './src/store/cartStore.js',
            './src/store/userDataStore.js',
            './src/store/ordersStore.js'
          ]
        },
        // Optimize asset naming
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext)) {
            return `assets/css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js'
      }
    },
    // Terser options for better compression
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      },
      mangle: {
        safari10: true
      }
    }
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'zustand',
      'framer-motion',
      'react-icons/fi',
      'react-icons/fa',
      'react-icons/md',
      'react-icons/hi'
    ],
    exclude: ['@vite/client', '@vite/env']
  },
  // Enable experimental features for better performance
  experimental: {
    renderBuiltUrl(filename) {
      return '/' + filename;
    }
  }
})
