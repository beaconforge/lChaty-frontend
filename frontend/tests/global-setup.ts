import { URL } from 'url'
import net from 'net'

function checkTcp(u: string, timeout = 3000): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(u)
      const port = Number(parsed.port) || (parsed.protocol === 'https:' ? 443 : 80)
      const host = parsed.hostname
      const socket = new net.Socket()
      let done = false
      socket.setTimeout(timeout)
      socket.on('connect', () => { done = true; socket.destroy(); resolve(true) })
      socket.on('error', () => { if (!done) { done = true; resolve(false) } })
      socket.on('timeout', () => { if (!done) { done = true; socket.destroy(); resolve(false) } })
      socket.connect(port, host)
    } catch (e) { resolve(false) }
  })
}

export default async function globalSetup() {
  const urls = [
    process.env.LOCAL_BASEURL || 'https://local.lchaty.com:5173',
    process.env.ADMIN_BASEURL || 'https://local.admin.lchaty.com:5173',
  ]
  const timeoutMs = Number(process.env.E2E_POLL_TIMEOUT || 120000)
  const start = Date.now()

  console.log('Global setup: probing origins (TCP):', urls.join(', '))

  while (true) {
    const checks = await Promise.all(urls.map((url) => checkTcp(url, 3000)))
    if (checks.every(Boolean)) break
    if (Date.now() - start > timeoutMs) {
      throw new Error(
        'Dev server not reachable on required origins (TCP probe).\n' +
        'Start it in a NEW terminal: ../scripts/start-vite.ps1 -Port 5173 -Https'
      )
    }
    await new Promise((r) => setTimeout(r, 2000))
  }

  console.log('Global setup: origins reachable (TCP)')
}
