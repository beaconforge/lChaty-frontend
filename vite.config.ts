import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { readFileSync, existsSync } from 'fs';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const CERT_PATH = env.DEV_CERT_PATH ?? resolve(__dirname, 'certs/local.lchaty.com+1.pem');
  const KEY_PATH = env.DEV_KEY_PATH ?? resolve(__dirname, 'certs/local.lchaty.com+1-key.pem');
  const BACKEND_PROXY = env.VITE_BACKEND_API_PROXY ?? 'https://chat-backend.lchaty.com';
  const WORKER_PROXY = env.VITE_WORKER_API_PROXY ?? 'https://chat-backend.lchaty.com';
  const httpsOptions = (existsSync(CERT_PATH) && existsSync(KEY_PATH))
    ? { cert: readFileSync(CERT_PATH), key: readFileSync(KEY_PATH) }
    : undefined;
<<<<<<< HEAD
=======
  const CERT_PATH = env.DEV_CERT_PATH || './certs/local.lchaty.com+1.pem';
  const KEY_PATH = env.DEV_KEY_PATH || './certs/local.lchaty.com+1-key.pem';
  const BACKEND_PROXY = env.VITE_BACKEND_API_PROXY || 'https://chat-backend.lchaty.com';
  const WORKER_PROXY = env.VITE_WORKER_API_PROXY || 'https://chat-backend.lchaty.com';
  const https = (fs.existsSync(CERT_PATH) && fs.existsSync(KEY_PATH))
    ? { cert: fs.readFileSync(CERT_PATH), key: fs.readFileSync(KEY_PATH) }
    : undefined;
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { readFileSync, existsSync } from 'fs';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const CERT_PATH = env.DEV_CERT_PATH ?? resolve(__dirname, 'certs/local.lchaty.com+1.pem');
  const KEY_PATH = env.DEV_KEY_PATH ?? resolve(__dirname, 'certs/local.lchaty.com+1-key.pem');
  const BACKEND_PROXY = env.VITE_BACKEND_API_PROXY ?? 'https://chat-backend.lchaty.com';
  const WORKER_PROXY = env.VITE_WORKER_API_PROXY ?? 'https://chat-backend.lchaty.com';
  const httpsOptions = (existsSync(CERT_PATH) && existsSync(KEY_PATH))
    ? { cert: readFileSync(CERT_PATH), key: readFileSync(KEY_PATH) }
    : undefined;

  // HMR should connect to the browser-visible host so the client websocket
  // connects to wss://local.lchaty.com:5173 when using portproxy.
  const HMR_SERVER_HOST = 'local.lchaty.com';

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
    resolve: { alias: { '@': resolve(__dirname, 'src') } },
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: true,
      https: httpsOptions ?? {
        key: readFileSync(resolve(__dirname, 'certs/local.lchaty.com+1-key.pem')),
        cert: readFileSync(resolve(__dirname, 'certs/local.lchaty.com+1.pem')),
      },
      hmr: {
        protocol: httpsOptions ? 'wss' : 'ws',
        host: HMR_SERVER_HOST,
        port: 5173,
      },
      proxy: {
        '/api/auth': {
          target: WORKER_PROXY,
          changeOrigin: true,
          secure: true,
        },
        '/api': {
          target: BACKEND_PROXY,
          changeOrigin: true,
          secure: true,
          cookieDomainRewrite: { '*': '.lchaty.com' },
          cookiePathRewrite: { '*': '/' },
          configure: proxy => {
            proxy.on('proxyReq', (proxyReq, req) => {
              try {
                const incomingHost = (req && req.headers && req.headers.host) || '';
                const origin = incomingHost ? `https://${incomingHost}` : (env.ADMIN_ORIGIN ?? 'https://local.admin.lchaty.com:5173');
                proxyReq.setHeader('Origin', origin);
              } catch (e) {
                console.warn('Failed to set proxy Origin header', e);
              }
            });
          },
        },
      },
      fs: { strict: false },
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
