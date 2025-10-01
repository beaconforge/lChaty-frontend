import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const CERT_PATH = env.DEV_CERT_PATH || './certs/local.lchaty.com+1.pem';
  const KEY_PATH = env.DEV_KEY_PATH || './certs/local.lchaty.com+1-key.pem';
  const BACKEND_PROXY = env.VITE_BACKEND_API_PROXY || 'https://chat-backend.lchaty.com';
  const WORKER_PROXY = env.VITE_WORKER_API_PROXY || 'https://chat-backend.lchaty.com';

  const https = (fs.existsSync(CERT_PATH) && fs.existsSync(KEY_PATH))
    ? { cert: fs.readFileSync(CERT_PATH), key: fs.readFileSync(KEY_PATH) }
    : undefined;

  return {
    resolve: { alias: { '@': resolve(__dirname, 'src') } },
    server: {
      https,
      host: true,
      port: 5173,
      strictPort: true,
      proxy: {
        '/api/auth': {
          target: WORKER_PROXY,
          changeOrigin: true,
          // When proxying to the production/live backend use secure TLS verification
          secure: true,
        },
        '/api': {
          target: BACKEND_PROXY,
          changeOrigin: true,
          // When proxying to the production/live backend use secure TLS verification
          secure: true,
        },
      },
    },
    preview: {
      https,
      host: true,
      port: 5174,
      proxy: {}
    },
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          admin: resolve(__dirname, 'admin.html'),
        },
      },
    },
    plugins: [
      {
        name: 'host-routing-middleware',
        configureServer(server: any) {
          server.middlewares.use((req: any, res: any, next: any) => {
            try {
              const host = (req.headers && req.headers.host) ? String(req.headers.host) : '';
              const shouldServeAdmin = host.startsWith('local.admin') || host.includes('local.admin.lchaty.com');
              if (!shouldServeAdmin) return next();

              // Only intercept top-level navigation requests that accept HTML
              const accept = (req.headers && req.headers.accept) ? String(req.headers.accept) : '';
              const isHtml = accept.includes('text/html');
              // Determine if the URL looks like a bare path or an html page (no file extension or endsWith .html)
              const pathname = req.url.split('?')[0] || req.url;
              const hasExtension = pathname.includes('.') ;
              const isNavigation = isHtml && (!hasExtension || pathname.endsWith('.html') || pathname === '/');

              if (isNavigation) {
                const adminHtml = fs.readFileSync(resolve(__dirname, 'admin.html'), 'utf-8');
                res.setHeader('content-type', 'text/html');
                res.statusCode = 200;
                res.end(adminHtml);
                return;
              }
            } catch (e) {
              // continue
            }
            next();
          });
        }
      }
    ]
  };
});