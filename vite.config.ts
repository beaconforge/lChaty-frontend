import { defineConfig } from 'vite'
import { resolve } from 'path'
import { readFileSync } from 'fs'

export default defineConfig({
  // Custom middleware for admin subdomain routing
  plugins: [
    {
      name: 'admin-subdomain-routing',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          const host = req.headers.host || '';
          const isAdminSubdomain = host.includes('local.admin.lchaty.com');
          
          // If accessing admin subdomain root, serve admin.html
          if (isAdminSubdomain && (req.url === '/' || req.url === '/index.html')) {
            req.url = '/admin.html';
          }
          
          next();
        });
      }
    }
  ],
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
    },
    // Middleware to handle admin subdomain routing
    middlewareMode: false,
    proxy: {},
    // Configure fallback for admin subdomain
    fs: {
      strict: false
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