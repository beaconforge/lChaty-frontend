#!/usr/bin/env node
const { spawnSync } = require('child_process')
const path = require('path')
const fs = require('fs')
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
const skipStart = argv.skipStart || process.env.SKIP_START === '1'

const repoRoot = path.resolve(__dirname, '..')
const frontend = path.join(repoRoot, 'frontend')
const logsDir = path.join(repoRoot, 'logs')
const tmpDir = path.join(repoRoot, 'tmp')
const artifactsDir = path.join(repoRoot, 'artifacts')
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true })
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })
if (!fs.existsSync(artifactsDir)) fs.mkdirSync(artifactsDir, { recursive: true })

const port = argv.port || 5173
const timeout = argv.timeout || 120
const retries = argv.retries || 2

// Auto-load local env file (frontend/.env.local) if present — local-only convenience, does not affect CI secrets
function loadEnvFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) return false
    const content = fs.readFileSync(filePath, 'utf8')
    const lines = content.split(/\r?\n/)
    for (const raw of lines) {
      const line = raw.trim()
      if (!line || line.startsWith('#')) continue
      const idx = line.indexOf('=')
      if (idx === -1) continue
      const key = line.slice(0, idx).trim()
      const val = line.slice(idx + 1)
      // DO NOT print values to logs
      process.env[key] = val
    }
    console.log(`Loaded local env from ${filePath}`)
    return true
  } catch (e) {
    console.warn(`Failed to load env file ${filePath}: ${e.message}`)
    return false
  }
}

// Try to load frontend/.env.local for local runs
loadEnvFile(path.join(frontend, '.env.local'))

function run(cmd, args, opts = {}) {
  console.log(`> ${cmd} ${args.join(' ')}`)
  const r = spawnSync(cmd, args, { stdio: 'inherit', shell: false, ...opts })
  return r.status
}

// 1) optional installs (skip if CI already did installs)
if (!argv.skipInstall) {
  if (fs.existsSync(path.join(repoRoot, 'package-lock.json'))) run('npm', ['ci'], { cwd: repoRoot })
  else run('npm', ['install'], { cwd: repoRoot })
  if (fs.existsSync(path.join(frontend, 'package-lock.json'))) run('npm', ['ci'], { cwd: frontend })
  else run('npm', ['install'], { cwd: frontend })
}

// Global watchdog: ensure the whole run doesn't exceed timeout (in seconds)
const overallTimeoutSec = Number(timeout) || 120
let watchdog = setTimeout(() => {
  console.error(`Orchestrator exceeded overall timeout of ${overallTimeoutSec}s — aborting.`)
  try {
    const pidPath = path.join(tmpDir, 'vite.pid')
    if (fs.existsSync(pidPath)) {
      const pid = Number(fs.readFileSync(pidPath, 'utf8'))
      if (!Number.isNaN(pid)) {
        try { process.kill(pid) } catch(e) { /* ignore */ }
      }
      fs.unlinkSync(pidPath)
    }
  } catch (e) { /* best-effort cleanup */ }
  process.exit(124) // 124 commonly used for timeout
}, overallTimeoutSec * 1000)

// 3) start background server (unless user requested skip)
const preferHttps = argv.https || process.env.FORCE_HTTPS === '1'
if (!skipStart) {
  // Delegate kill + start to the existing script to avoid duplicating logic
  const startCmd = ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', path.join(repoRoot, 'scripts', 'start-and-ensure.ps1'), '-Port', String(port)]
  if (preferHttps) startCmd.push('-Https')
  startCmd.push('-Force')
  const startStatus = run('powershell', startCmd)
  if (startStatus !== 0) { console.error('Failed to start background server via start-and-ensure.ps1'); process.exit(10) }
}

// 4) poll origins
// Attempt to read tmp/vite.info.json (if created) to learn actual URLs; pass them to the pinger
const infoPath = path.join(tmpDir, 'vite.info.json')
const pidPath = path.join(tmpDir, 'vite.pid')
let pingArgs = [path.join(repoRoot, 'scripts', 'ping-origins.js'), '--timeout', String(timeout)]
// Wait for the detached server to write tmp/vite.info.json (or detect ready in logs)
const waitStart = Date.now()
const waitTimeoutMs = Number(timeout) * 1000
if (!fs.existsSync(infoPath)) {
  console.log(`Waiting up to ${timeout}s for ${infoPath} to appear...`)
  while ((Date.now() - waitStart) < waitTimeoutMs) {
    if (fs.existsSync(infoPath)) break
    try {
      const logPath = path.join(logsDir, 'vite.log')
      if (fs.existsSync(logPath)) {
        const log = fs.readFileSync(logPath, 'utf8')
        const clean = log.replace(/\x1b\[[0-9;]*m/g, '')
        if (/VITE\s+v|Local:/i.test(clean)) { console.log('Detected Vite readiness in logs'); break }
      }
    } catch (e) {}
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000)
  }
}
// Supervisor: watch the detached vite PID and attempt a limited number of restarts
let monitorInterval = null
let restartAttempts = 0
const maxRestarts = 3
function isPidRunning(pid) {
  try {
    if (!pid || Number.isNaN(Number(pid))) return false
    process.kill(Number(pid), 0)
    return true
  } catch (e) {
    return false
  }
}
function startDetachedServer() {
  console.log('Supervisor: invoking start-and-ensure.ps1 to (re)start detached server')
  const startCmd = ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', path.join(repoRoot, 'scripts', 'start-and-ensure.ps1'), '-Port', String(port), '-Https', '-Force']
  const code = run('powershell', startCmd)
  return code === 0
}
if (fs.existsSync(pidPath)) {
  // start monitor
  monitorInterval = setInterval(() => {
    try {
      const pid = Number(fs.existsSync(pidPath) ? fs.readFileSync(pidPath, 'utf8') : NaN)
      if (!isPidRunning(pid)) {
        console.error(`[supervisor] Detected Vite process ${pid} not running`)
        restartAttempts++
        if (restartAttempts > maxRestarts) {
          console.error(`[supervisor] Exceeded max restarts (${maxRestarts}). Aborting.`)
          try { clearInterval(monitorInterval) } catch (e) {}
          process.exit(12)
        }
        const ok = startDetachedServer()
        if (!ok) {
          console.error('[supervisor] Restart attempt failed')
        } else {
          console.log('[supervisor] Restarted detached server')
          // reset attempts on success
          restartAttempts = 0
        }
      }
    } catch (e) {
      console.error('[supervisor] monitor error', e && e.message)
    }
  }, 2000)
}
if (fs.existsSync(infoPath)) {
  try {
    const info = JSON.parse(fs.readFileSync(infoPath, 'utf8'))
    if (info && Array.isArray(info.detected) && info.detected.length) {
        // Prefer localhost when present to avoid unreachable network interfaces
        let localhostUrl = info.detected.find(u => u.includes('localhost'))
        let chosen = (localhostUrl && localhostUrl.replace(/\/$/, '')) || info.detected[0].replace(/\/$/, '')
        // If the chosen URL is https localhost, prefer http to avoid local TLS/cipher handshake mismatches in browsers
        if (chosen.startsWith('https://localhost')) {
          chosen = chosen.replace(/^https:\/\//, 'http://')
        }
        const admin = chosen.replace('local.lchaty.com', 'local.admin.lchaty.com')
      pingArgs.push('--urls', `${chosen},${admin}`)
      process.env.LOCAL_BASEURL = chosen
      process.env.ADMIN_BASEURL = admin
      console.log('Using detected base URLs for ping and Playwright:', process.env.LOCAL_BASEURL, process.env.ADMIN_BASEURL)
    }
  } catch (e) { /* ignore parse errors */ }
}
const pingStatus = run(process.execPath, pingArgs)
if (pingStatus !== 0) { console.error('Origins not reachable'); process.exit(11) }

// 5) run playwright tests (MOCK by default)
let lastStatus = 1
for (let attempt = 0; attempt <= retries; attempt++) {
  console.log(`Running Playwright attempt ${attempt + 1}/${retries + 1}`)
  // Use the frontend-local playwright binary to avoid version skew between repo and frontend
  // Ensure Playwright's own webServer is skipped (we started Vite externally)
  const execEnv = Object.assign({}, process.env, { SKIP_START: '1' })
  // Prefer calling the frontend-local playwright binary directly to ensure the correct node_modules are used
  const playwrightBin = path.join(frontend, 'node_modules', '.bin', process.platform === 'win32' ? 'playwright.cmd' : 'playwright')
  const status = run(playwrightBin, ['test'], { cwd: frontend, env: execEnv })
  lastStatus = status
  if (status === 0) break
  console.log('Collecting logs for failed attempt...')
  // copy logs to artifacts
  const ts = new Date().toISOString().replace(/[:.]/g, '-')
  const dest = path.join(artifactsDir, `failure-${ts}`)
  fs.mkdirSync(dest, { recursive: true })
  try { fs.copyFileSync(path.join(logsDir, 'vite.log'), path.join(dest, 'vite.log')) } catch {}
  try { fs.cpSync(path.join(frontend, 'playwright-report'), path.join(dest, 'playwright-report'), { recursive: true }) } catch {}
}

// 6) cleanup: kill background server if pid exists
try {
  const pidPath = path.join(tmpDir, 'vite.pid')
  if (fs.existsSync(pidPath)) {
    const pid = Number(fs.readFileSync(pidPath, 'utf8'))
    if (!Number.isNaN(pid)) {
      try { process.kill(pid) } catch (e) { /* best effort */ }
    }
    fs.unlinkSync(pidPath)
  }
} catch (e) { /* ignore */ }

process.exit(lastStatus)
