import { defineConfig } from 'vite'
import path from 'path'
import fs from 'fs'

const devCertPath = process.env.DEV_CERT_PATH || process.env.VITE_DEV_CERT_PATH || path.resolve(__dirname, '../certs/local.lchaty.com.pem')
const devKeyPath = process.env.DEV_KEY_PATH || process.env.VITE_DEV_KEY_PATH || path.resolve(__dirname, '../certs/local.lchaty.com-key.pem')

export default defineConfig(({ command, mode }) => {
  // Prevent inline dev: force external launcher to set EXTERNAL_START=1
  if (command === 'serve' && process.env.EXTERNAL_START !== '1') {
    throw new Error('Inline dev server is FORBIDDEN. Use ./scripts/start-vite.ps1 -Port 5173 -Https')
  }

  // Support either PEM cert+key or a PFX bundle. If a PFX is supplied (by extension), pass pfx + passphrase.
  let https: any = false
  try {
    if (fs.existsSync(devCertPath) && fs.existsSync(devKeyPath)) {
      const tlsOpts = {
        minVersion: 'TLSv1.2',
        // Use a modern cipher list compatible with Chromium/Node
        ciphers: process.env.DEV_TLS_CIPHERS || 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305',
        honorCipherOrder: true
      }
      if (devKeyPath.toLowerCase().endsWith('.pfx') || devKeyPath.toLowerCase().endsWith('.p12')) {
        https = Object.assign({
          pfx: fs.readFileSync(devKeyPath),
          passphrase: process.env.DEV_CERT_PASSPHRASE || 'devpass'
        }, tlsOpts)
      } else {
        https = Object.assign({
          cert: fs.readFileSync(devCertPath),
          key: fs.readFileSync(devKeyPath)
        }, tlsOpts)
      }
    }
  } catch (e) {
    https = false
  }

  // Allow a quick override to force HTTP in environments where TLS detection is flaky.
  // Set FORCE_HTTP=1 to disable HTTPS regardless of available cert files.
  if (process.env.FORCE_HTTP === '1') {
    https = false
  }

  return {
    root: path.resolve(__dirname),
    base: '/',
    build: {
      outDir: 'dist',
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          admin: path.resolve(__dirname, 'admin.html')
        }
      }
    },
    server: {
      https,
      host: true,
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': {
          target: 'https://chat-backend.lchaty.com',
          changeOrigin: true,
          secure: true,
          cookieDomainRewrite: { '*': '' }
        },
        '/api/auth': {
          target: 'https://chat-backend.lchaty.com',
          changeOrigin: true,
          secure: true,
          cookieDomainRewrite: { '*': '' }
        }
      }
    }
  }
})
