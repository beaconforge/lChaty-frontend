#!/usr/bin/env node
const https = require('https')
const http = require('http')
const net = require('net')
const { URL } = require('url')
function parseArgs() {
  const out = {}
  const args = process.argv.slice(2)
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a.startsWith('--')) {
      const key = a.replace(/^--/, '')
      const next = args[i+1]
      if (next && !next.startsWith('-')) { out[key] = next; i++ } else { out[key] = true }
    } else if (a.startsWith('-')) {
      const key = a.replace(/^-/, '')
      const next = args[i+1]
      if (next && !next.startsWith('-')) { out[key] = next; i++ } else { out[key] = true }
    }
  }
  return out
}
const argv = parseArgs()
let urls = argv.urls ? (Array.isArray(argv.urls) ? argv.urls : [argv.urls]) : [
  process.env.LOCAL_BASEURL || 'https://local.lchaty.com:5173',
  process.env.ADMIN_BASEURL || 'https://local.admin.lchaty.com:5173'
]
// Support comma-separated list passed as a single --urls "a,b,c"
urls = urls.flatMap(u => String(u).split(',').map(s => s.trim()).filter(Boolean))
const timeoutSec = Number(argv.timeout || argv.t || process.env.PING_TIMEOUT || 120)

function checkUrl(u) {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(u)
      // First try a TCP connect to host:port to avoid TLS handshake issues
      const port = parsed.port || (parsed.protocol === 'https:' ? 443 : 80)
      const host = parsed.hostname
      const socket = new net.Socket()
      let connected = false
      socket.setTimeout(3000)
      socket.on('connect', () => {
        connected = true
        socket.destroy()
        resolve(true)
      })
      socket.on('error', () => { resolve(false) })
      socket.on('timeout', () => { socket.destroy(); resolve(false) })
      socket.connect(port, host)
    } catch (e) { resolve(false) }
  })
}

(async () => {
  const start = Date.now()
  while ((Date.now() - start) / 1000 < timeoutSec) {
    const results = await Promise.all(urls.map((u) => checkUrl(u)))
    if (results.every(Boolean)) { console.log('All origins reachable'); process.exit(0) }
    await new Promise((r) => setTimeout(r, 2000))
  }
  console.error(`Timeout waiting for origins after ${timeoutSec}s`)
  process.exit(1)
})()
