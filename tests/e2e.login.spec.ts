import { test, expect } from '@playwright/test'

const isLive = process.env.E2E_MODE === 'LIVE'

test.describe('E2E Login flows (user & admin)', () => {
  test('user login flow (mock by default, LIVE when E2E_MODE=LIVE)', async ({ page }) => {
    await page.goto('/')

    // In LIVE mode, log network responses for auth endpoints to help debugging
    if (isLive) {
      page.on('response', async (res) => {
        try {
          const url = res.url()
          if (url.endsWith('/api/auth/login') || url.endsWith('/api/me')) {
            const text = await res.text().catch(() => '')
            // Avoid printing long bodies in normal runs, but include them for debug
            console.log('NETLOG>', res.status(), url, text ? (text.length > 1000 ? text.slice(0,1000) + '...[truncated]' : text) : '(no-body)')
          }
  } catch (e: any) { console.log('NETLOG ERR', e?.message || e) }
      })
    }

    if (!isLive) {
      // Mock the login and /api/me endpoints so tests are hermetic
      await page.route('**/api/auth/login', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) }))
      await page.route('**/api/me', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ username: process.env.E2E_USER || 'mockuser', displayName: 'Mock User' }) }))
    }

    // Probe auth state via in-page fetch (ensures page.route mocks apply)
    const meResStatus = await page.evaluate(async () => {
      try {
        const r = await fetch('/api/me', { credentials: 'include' })
        return r.status
      } catch (e) {
        return 0
      }
    })

    if (meResStatus === 401) {
      // Not authenticated - perform login
      if (isLive) {
        // Use real credentials from env
        const user = process.env.E2E_USER
        const pass = process.env.E2E_PASS
        if (!user || !pass) throw new Error('E2E_MODE=LIVE requires E2E_USER and E2E_PASS in environment')

        await page.fill('input[name="username"]', user)
        await page.fill('input[name="password"]', pass)

        const [loginResponse] = await Promise.all([
          page.waitForResponse(r => r.url().endsWith('/api/auth/login')),
          page.click('button:has-text("Login")')
        ])

        expect(loginResponse.ok()).toBeTruthy()

        // Wait for /api/me to succeed
        await page.waitForResponse(r => r.url().endsWith('/api/me') && r.status() < 400, { timeout: 10000 })
      } else {
        // Mocked flow - clicking login should trigger mocked /api/me
        await page.click('button:has-text("Login")')
      }
    }

    // Final assertion: /api/me should return 200 and include a username/displayName
    const meAfter = await page.evaluate(async () => {
      const r = await fetch('/api/me', { credentials: 'include' })
      return { status: r.status, json: await r.json().catch(() => null) }
    })
    expect(meAfter.status).toBeLessThan(400)
    expect(meAfter.json).not.toBeNull()
    expect(meAfter.json.username || meAfter.json.displayName).toBeTruthy()
  })

  test('admin login flow (mock by default, LIVE when E2E_MODE=LIVE)', async ({ page }) => {
    await page.goto('/')

    if (!isLive) {
      await page.route('**/api/auth/login', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) }))
      await page.route('**/api/me', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ username: process.env.E2E_ADMIN_USER || 'admin', is_admin: true }) }))
      await page.route('**/api/admin/health', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'ok' }) }))
    }

    // Check /api/me
    const meResStatus = await page.evaluate(async () => {
      try {
        const r = await fetch('/api/me', { credentials: 'include' })
        return r.status
      } catch (e) { return 0 }
    })

    if (meResStatus === 401) {
      if (isLive) {
        const admin = process.env.E2E_ADMIN_USER
        const pass = process.env.E2E_ADMIN_PASS
        if (!admin || !pass) throw new Error('E2E_MODE=LIVE requires E2E_ADMIN_USER and E2E_ADMIN_PASS in environment')

        await page.fill('input[name="username"]', admin)
        await page.fill('input[name="password"]', pass)

        const [loginResponse] = await Promise.all([
          page.waitForResponse(r => r.url().endsWith('/api/auth/login')),
          page.click('button:has-text("Login")')
        ])

        expect(loginResponse.ok()).toBeTruthy()
        await page.waitForResponse(r => r.url().endsWith('/api/me') && r.status() < 400, { timeout: 10000 })
      } else {
        await page.click('button:has-text("Login")')
      }
    }

    const meAfter = await page.evaluate(async () => {
      const r = await fetch('/api/me', { credentials: 'include' })
      return { status: r.status, json: await r.json().catch(() => null) }
    })
    expect(meAfter.status).toBeLessThan(400)
    expect(meAfter.json).not.toBeNull()
    // If mocked, is_admin may be true; if live ensure it is admin account
    if (isLive) expect(meAfter.json.is_admin).toBeTruthy()
  })
})
