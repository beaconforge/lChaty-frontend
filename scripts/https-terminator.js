#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const http = require('http')
const https = require('https')

const PFX_PATH = process.env.DEV_PFX_PATH || path.resolve(__dirname, '..', 'certs', 'local.lchaty.com.pfx')
const PFX_PASSPHRASE = process.env.DEV_PFX_PASSPHRASE || 'devpassword'
const LISTEN_PORT = parseInt(process.env.DEV_HTTPS_PORT || '5173', 10)
const UPSTREAM_HOST = process.env.DEV_UPSTREAM_HOST || '127.0.0.1'
const UPSTREAM_PORT = parseInt(process.env.DEV_UPSTREAM_PORT || '5174', 10)

function log(...args) { console.log(new Date().toISOString(), ...args) }

if (!fs.existsSync(PFX_PATH)) {
  console.error('PFX not found:', PFX_PATH)
  process.exit(1)
}

const pfx = fs.readFileSync(PFX_PATH)

const server = https.createServer({ pfx, passphrase: PFX_PASSPHRASE }, (req, res) => {
  // Proxy request to upstream HTTP server
  const options = {
    hostname: UPSTREAM_HOST,
    port: UPSTREAM_PORT,
    path: req.url,
    method: req.method,
    headers: Object.assign({}, req.headers, { host: req.headers.host })
  }

  const proxyReq = http.request(options, proxyRes => {
    // copy status and headers
    res.writeHead(proxyRes.statusCode, proxyRes.headers)
    proxyRes.pipe(res, { end: true })
  })

  proxyReq.on('error', err => {
    log('Upstream request error:', err && err.message)
    res.writeHead(502)
    res.end('Bad Gateway')
  })

  req.pipe(proxyReq, { end: true })
})

server.on('listening', () => log(`HTTPS terminator listening on https://localhost:${LISTEN_PORT} -> http://${UPSTREAM_HOST}:${UPSTREAM_PORT}`))
server.on('error', err => { console.error('Terminator error', err); process.exit(1) })

server.listen(LISTEN_PORT)

// graceful shutdown
process.on('SIGINT', () => { log('SIGINT'); server.close(() => process.exit(0)) })
process.on('SIGTERM', () => { log('SIGTERM'); server.close(() => process.exit(0)) })
