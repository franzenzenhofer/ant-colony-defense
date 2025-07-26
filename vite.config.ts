import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Read version for cache busting
const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'))
const version = packageJson.version
const buildTime = new Date().toISOString()

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(version),
    __BUILD_TIME__: JSON.stringify(buildTime)
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        // Add version hash to all assets for cache busting
        entryFileNames: `assets/[name]-${version}-[hash].js`,
        chunkFileNames: `assets/[name]-${version}-[hash].js`,
        assetFileNames: `assets/[name]-${version}-[hash].[ext]`,
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'game-core': ['lucide-react'],
        },
      },
    },
    reportCompressedSize: true,
    chunkSizeWarningLimit: 500,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react'],
  },
  server: {
    port: 5173,
    host: true,
  },
  preview: {
    port: 4173,
    host: true,
  },
})
