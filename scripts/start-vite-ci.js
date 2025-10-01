#!/usr/bin/env node
const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

function ensureDir(p) { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }) }

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
const port = argv.port || argv.p || process.env.PORT || '5173'
const https = argv.https || argv.h || false
const repoRoot = path.resolve(__dirname, '..')
const frontend = path.join(repoRoot, 'frontend')
const logsDir = path.join(repoRoot, 'logs')
const tmpDir = path.join(repoRoot, 'tmp')
ensureDir(logsDir)
ensureDir(tmpDir)

const logPath = path.join(logsDir, 'vite.log')
const pidPath = path.join(tmpDir, 'vite.pid')
const timeoutSec = Number(argv.timeout || argv.t || process.env.START_TIMEOUT || 120)

const isWin = process.platform === 'win32'

// Compose command
let cmd, args
if (isWin) {
  // Use PowerShell to set env, cd and redirect output
  const childCmd = `& { $env:EXTERNAL_START='1'; Set-Location -Path \"${frontend}\"; npm run dev -- --port ${port} ${https ? '--https' : ''} } > \"${logPath}\" 2>&1`
  cmd = 'powershell'
  args = ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', childCmd]
} else {
  // POSIX shell
  const childCmd = `EXTERNAL_START=1 cd \"${frontend}\" && npm run dev -- --port ${port} ${https ? '--https' : ''} > \"${logPath}\" 2>&1 &`
  cmd = 'sh'
  args = ['-c', childCmd]
}

try {
  const child = spawn(cmd, args, { detached: true, stdio: 'ignore' })
  child.unref()
  // write pid
  fs.writeFileSync(pidPath, String(child.pid), { encoding: 'utf8' })
  console.log(`Spawned background dev server (pid=${child.pid}). Logs: ${logPath}`)
  // Watch the log for a successful start message within timeoutSec
  const start = Date.now()
  const watcher = setInterval(() => {
    try {
      if (fs.existsSync(logPath)) {
  let content = fs.readFileSync(logPath, 'utf8')
  // strip ANSI color codes to make regex matching reliable
  content = content.replace(/\x1b\[[0-9;]*m/g, '')
  if (/Local:|ready in|Localhost|Network:/i.test(content)) {
          console.log('Dev server appears to be up (log contains ready message)')
          // extract urls
          const urlRegex = /(https?:\/\/[A-Za-z0-9._:\-]+(?::\d+)?\/?)/g
          const matches = Array.from(new Set((content.match(urlRegex) || []).map(s => s.replace(/[\),]+$/, ''))))
          const info = { detected: matches }
          try {
            const infoPath = path.join(tmpDir, 'vite.info.json')
            fs.writeFileSync(infoPath, JSON.stringify(info, null, 2), 'utf8')
            console.log(`Wrote server info to ${infoPath}`)
          } catch (e) { /* ignore */ }
          if (matches.length) console.log('Detected URLs:', matches.join(', '))
          clearInterval(watcher)
          process.exit(0)
        }
      }
    } catch (e) {
      // ignore
    }
    if ((Date.now() - start) / 1000 > timeoutSec) {
      console.error(`Dev server did not start within ${timeoutSec}s — check logs: ${logPath}`)
      // best-effort kill
      try { process.kill(child.pid) } catch (e) {}
      clearInterval(watcher)
      process.exit(3)
    }
  }, 1000)
} catch (err) {
  console.error('Failed to spawn dev server:', err)
  process.exit(2)
}
