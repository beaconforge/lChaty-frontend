import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { readFileSync } from 'fs';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      {
        name: 'admin-subdomain-routing',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            const host = req.headers.host || '';
            const isAdminSubdomain = host.includes('local.admin.lchaty.com');

            // SECURITY: Complete separation between admin and user interfaces
            if (isAdminSubdomain) {
              // Only serve admin.html for admin subdomain
              if (req.url === '/' || req.url === '/index.html') {
                req.url = '/admin.html';
              }
              // Block any user app resources from being loaded on admin subdomain
              else if (req.url?.startsWith('/src/app/') || req.url?.startsWith('/src/user/') || req.url === '/index.html') {
                res.statusCode = 403;
                res.setHeader('Content-Type', 'text/plain');
                res.end('Access denied: User resources not available on admin subdomain');
                return;
              }
            } else {
              // On user domain, block admin resources
              if (req.url?.startsWith('/src/admin/') || req.url === '/admin.html') {
                res.statusCode = 403;
                res.setHeader('Content-Type', 'text/plain');
                res.end('Access denied: Admin resources not available on user domain');
                return;
              }
            }

            next();
          });
        },
      },
    ],
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: true,
      https: {
        key: readFileSync(resolve(__dirname, 'certs/local.lchaty.com+1-key.pem')),
        cert: readFileSync(resolve(__dirname, 'certs/local.lchaty.com+1.pem')),
      },
      hmr: {
        port: 5173,
        host: 'local.lchaty.com',
      },
      proxy: {
        '/api': {
          target: 'https://chat-backend.lchaty.com',
          changeOrigin: true,
          secure: true,
          // Ensure cookies set by the backend are rewritten so they are visible
          // to the local test hostnames (local.lchaty.com / local.admin.lchaty.com).
          // Also rewrite cookie paths to root so they are sent on all proxied requests.
          cookieDomainRewrite: {
            // rewrite any backend-set domain to the shared local domain so
            // Playwright-driven browsers on local.*.lchaty.com receive cookies.
            '*': '.lchaty.com',
          },
          cookiePathRewrite: {
            '*': '/',
          },
          configure: proxy => {
            // Use the incoming Host header to build a correct Origin for proxied
            // requests. This avoids always sending an admin origin when the
            // request actually originates from the user subdomain.
            proxy.on('proxyReq', (proxyReq, req) => {
              try {
                const incomingHost = (req && req.headers && req.headers.host) || '';
                const origin = incomingHost ? `https://${incomingHost}` : (env.ADMIN_ORIGIN ?? 'https://local.admin.lchaty.com:5173');
                proxyReq.setHeader('Origin', origin);
              } catch (e) {
                // Best-effort: do not break the proxy if header setting fails
                console.warn('Failed to set proxy Origin header', e);
              }
            });
          },
        },
      },
      fs: {
        strict: false,
      },
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    build: {
      sourcemap: true,
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          admin: resolve(__dirname, 'admin.html'),
        },
      },
    },
    publicDir: 'public',
  };
});
