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

            // Dev-only: when DEV_MOCK_ADMIN=1 is set, intercept /api/me and
            // return a safe mock admin identity to help debugging in local
            // browsers (avoids requiring a working backend session). This is
            // intentionally guarded by an environment flag and local host check.
            try {
              const devMock = process.env.DEV_MOCK_ADMIN === '1';
              if (devMock && isAdminSubdomain && req.method === 'GET' && req.url && req.url.startsWith('/api/me')) {
                const mock = { id: 1, username: 'local-admin', is_admin: true, roles: ['admin'] };
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Cache-Control', 'no-cache');
                res.end(JSON.stringify(mock));
                return;
              }
            } catch (err) {
              // swallow errors so middleware doesn't break dev server
              // eslint-disable-next-line no-console
              console.warn('dev mock middleware error', err);
            }

            if (isAdminSubdomain && (req.url === '/' || req.url === '/index.html')) {
              req.url = '/admin.html';
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
          configure: proxy => {
            proxy.on('proxyReq', proxyReq => {
              proxyReq.setHeader('Origin', env.ADMIN_ORIGIN ?? 'https://local.admin.lchaty.com:5173');
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
