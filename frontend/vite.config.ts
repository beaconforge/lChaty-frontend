import { defineConfig } from 'vite'
import path from 'path'
import fs from 'fs'

export default defineConfig(({ command, mode }) => {
  // Prevent inline dev: force external launcher to set EXTERNAL_START=1
  if (command === 'serve' && process.env.EXTERNAL_START !== '1') {
    throw new Error('Inline dev server is FORBIDDEN. Use ./scripts/start-vite.ps1 -Port 5173 -Https')
  }

  console.log('[HTTPS] Using mkcert certificates only')
  
  // Use only mkcert certificates
  const certPath = path.resolve(__dirname, '../certs/local.lchaty.com+1.pem')
  const keyPath = path.resolve(__dirname, '../certs/local.lchaty.com+1-key.pem')
  
  let https: any = false
  
  if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    console.log('[HTTPS] Loading mkcert certificates:', certPath)
    https = {
      cert: fs.readFileSync(certPath),
      key: fs.readFileSync(keyPath)
    }
    console.log('[HTTPS] mkcert certificates loaded successfully')
  } else {
    console.log('[HTTPS] mkcert certificates not found, using HTTP')
    console.log('[HTTPS] Expected:', certPath, 'and', keyPath)
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
      port: 5173,
      host: '127.0.0.1',  // Bind explicitly to IPv4 loopback so mapped hostnames (127.0.0.1) reach Vite
      strictPort: true,
      proxy: {
        // Ensure the more-specific auth proxy is checked before the generic /api proxy
        '/api/auth': {
          target: 'https://chat-backend.lchaty.com',
          changeOrigin: true,
          secure: true,
          cookieDomainRewrite: { '*': 'local.lchaty.com' },
          cookiePathRewrite: { '*': '/' }
        },
        '/api': {
          target: 'https://chat-backend.lchaty.com',
          changeOrigin: true,
          secure: true,
          cookieDomainRewrite: { '*': 'local.lchaty.com' },
          cookiePathRewrite: { '*': '/' }
        }
      }
    }
  }
})
