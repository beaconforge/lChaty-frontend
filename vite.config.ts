import { defineConfig } from 'vite'
import { resolve } from 'path'
import { readFileSync } from 'fs'

export default defineConfig({
  // HTTPS development server for local.lchaty.com and local.admin.lchaty.com
  server: {
    host: '0.0.0.0', // Accept connections on all interfaces
    port: 5173,
    strictPort: true,
    https: {
      key: readFileSync(resolve(__dirname, 'certs/local.lchaty.com+1-key.pem')),
      cert: readFileSync(resolve(__dirname, 'certs/local.lchaty.com+1.pem'))
    },
    hmr: {
      port: 5173, // Use same port as server
      host: 'local.lchaty.com' // Use same domain as server for certificate consistency
    }
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