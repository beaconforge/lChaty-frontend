#!/usr/bin/env node
const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

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
const repoRoot = path.resolve(__dirname, '..')
const frontend = path.join(repoRoot, 'frontend')
const logsDir = path.join(repoRoot, 'logs')
const tmpDir = path.join(repoRoot, 'tmp')
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true })
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })

const logPath = path.join(logsDir, 'vite.log')
const infoPath = path.join(tmpDir, 'vite.info.json')
const port = argv.port || argv.p || process.env.PORT || '5173'
const https = argv.https || argv.h || false
const timeoutSec = Number(argv.timeout || argv.t || process.env.START_TIMEOUT || 120)

// Compose the frontend command: npm run dev -- --port <port> [--https]
const cmd = process.platform === 'win32' ? 'powershell' : 'sh'
let args
if (process.platform === 'win32') {
  // ensure DEV_CERT_PASSPHRASE is set for the child (fallback to 'changeit')
  const childCmd = `& { $env:EXTERNAL_START='1'; if (-not $env:DEV_CERT_PASSPHRASE) { $env:DEV_CERT_PASSPHRASE='changeit' }; Set-Location -Path "${frontend}"; npm run dev -- --port ${port} ${https ? '--https' : ''} }`
  args = ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', childCmd]
} else {
  // set DEV_CERT_PASSPHRASE in POSIX child environment if not already set
  const childCmd = `DEV_CERT_PASSPHRASE=${process.env.DEV_CERT_PASSPHRASE || 'changeit'} EXTERNAL_START=1 cd "${frontend}" && npm run dev -- --port ${port} ${https ? '--https' : ''}`
  args = ['-c', childCmd]
}

console.log('Starting debug dev server foreground; logs ->', logPath)
const outStream = fs.createWriteStream(logPath, { flags: 'a' })

const child = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] })

child.stdout.on('data', (d) => {
  const s = d.toString()
  process.stdout.write(s)
  outStream.write(s)
  tryDetectUrls(s)
})
child.stderr.on('data', (d) => {
  const s = d.toString()
  process.stderr.write(s)
  outStream.write(s)
  tryDetectUrls(s)
})

child.on('exit', (code, sig) => {
  console.log(`Dev server exited with code=${code} signal=${sig}`)
  outStream.end()
  process.exit(code || 0)
})

let detected = []
let startupTimer = null
function tryDetectUrls(chunk) {
  // strip ANSI colors
  const clean = chunk.replace(/\x1b\[[0-9;]*m/g, '')
  const urlRegex = /(https?:\/\/[A-Za-z0-9._:\-]+(?::\d+)?\/?)/g
  let matches = Array.from(new Set((clean.match(urlRegex) || []).map(s => s.replace(/[\),]+$/, ''))))
  // append default port if URL missing port
  matches = matches.map(m => {
    if (/https?:\/\/[A-Za-z0-9._:\-]+:\d+/.test(m)) return m
    // append the port from the running port variable
    return m.replace(/\/$/, '') + ':' + port + '/'
  })
  for (const m of matches) if (!detected.includes(m)) detected.push(m)
  if (detected.length) {
    try {
      fs.writeFileSync(infoPath, JSON.stringify({ detected }, null, 2), 'utf8')
      console.log('Wrote', infoPath)
      if (startupTimer) { clearTimeout(startupTimer); startupTimer = null }
    } catch (e) {}
  }
}

// watchdog for startup
startupTimer = setTimeout(() => {
  console.error(`Dev server did not show ready output within ${timeoutSec}s; check ${logPath}`)
  try { child.kill('SIGTERM') } catch (e) {}
  outStream.end()
  process.exit(3)
}, timeoutSec * 1000)
