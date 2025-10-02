import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const CERT_PATH = env.DEV_CERT_PATH || './certs/local.lchaty.com+1.pem';
  const KEY_PATH = env.DEV_KEY_PATH || './certs/local.lchaty.com+1-key.pem';
  const PFX_PATH = env.DEV_PFX_PATH || './certs/local.lchaty.com.pfx';
  const BACKEND_PROXY = env.VITE_BACKEND_API_PROXY || 'https://chat-backend.lchaty.com';
  const WORKER_PROXY = env.VITE_WORKER_API_PROXY || 'https://chat-backend.lchaty.com';
  // Prefer PEM cert+key when present; otherwise fall back to a PFX (with passphrase)
  let https: any = undefined;
  if (fs.existsSync(CERT_PATH) && fs.existsSync(KEY_PATH)) {
    console.log(`[VITE] Loading PEM certificates: cert=${CERT_PATH}, key=${KEY_PATH}`);
    https = { 
      cert: fs.readFileSync(CERT_PATH), 
      key: fs.readFileSync(KEY_PATH),
      // Add explicit options for better compatibility
      secureProtocol: 'TLS_server_method',
      honorCipherOrder: false,
      requestCert: false,
      rejectUnauthorized: false
    };
  } else if (fs.existsSync(PFX_PATH)) {
    console.log(`[VITE] Loading PFX certificate: ${PFX_PATH}`);
    const pass = process.env.DEV_PFX_PASSWORD || env.DEV_PFX_PASSWORD || 'changeit';
    https = { 
      pfx: fs.readFileSync(PFX_PATH), 
      passphrase: pass,
      secureProtocol: 'TLS_server_method',
      honorCipherOrder: false,
      requestCert: false,
      rejectUnauthorized: false
    };
  } else {
    console.log('[VITE] No certificates found, using HTTP');
    https = undefined;
  }

  // HMR should connect to the browser-visible host so the client websocket
  // connects to wss://local.lchaty.com:5173 when using portproxy.
  const HMR_SERVER_HOST = 'local.lchaty.com';

  return {
    resolve: { alias: { '@': resolve(__dirname, 'src') } },
    server: {
      https,
      host: true,
      port: 5173,
      strictPort: true,
      // Configure HMR so the client connects to the browser-visible origin.
      // When we use a portproxy (127.0.0.1:5173 -> localhost:5175) the dev server
      // may actually run on a different local port, so force the HMR client to
      // connect to the public-facing host/port (local.lchaty.com:5173).
      hmr: {
        protocol: https ? 'wss' : 'ws',
        host: HMR_SERVER_HOST,
        port: 5173,
        clientPort: 5173
      },
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