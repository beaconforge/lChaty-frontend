import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  // Simple development server - HTTP only for now
  server: {
    host: 'localhost',
    port: 3000,
    strictPort: true,
    open: true // Auto-open browser
  },

  // Path resolution for imports
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },

  // Build configuration
  build: {
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin.html'),
      },
    },
  },

  // Public directory
  publicDir: 'public'
})