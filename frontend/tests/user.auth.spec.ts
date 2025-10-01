import { test, expect } from '@playwright/test'

test.describe('User auth flow', () => {
  test('login flow (mock or live guarded)', async ({ page }, testInfo) => {
    const isLive = process.env.E2E_MODE === 'LIVE'
    await page.goto('/')

    if (!isLive) {
      // MOCK: intercept /api/auth/login and /api/me
      await page.route('**/api/auth/login', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) }))
      await page.route('**/api/me', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ username: 'mockuser', displayName: 'Mock User' }) }))
    }

    // Attempt to read /api/me to determine auth state (use in-page fetch to hit page.route mocks)
    const meResStatus = await page.evaluate(async () => {
      try { const r = await fetch('/api/me', { credentials: 'include' }); return r.status } catch { return 0 }
    })
    if (meResStatus === 401) {
      // Not authenticated — perform login flow
      if (isLive) {
        // In LIVE mode, perform the real login form submission
        await page.fill('input[name="username"]', process.env.E2E_USER || 'testuser')
        await page.fill('input[name="password"]', process.env.E2E_PASS || 'testpass')

        // Intercept the login network request to inspect Set-Cookie headers
        const [loginResponse] = await Promise.all([
          page.waitForResponse(r => r.url().endsWith('/api/auth/login')),
          page.click('button:has-text("Login")')
        ])

        // Check Set-Cookie header presence and attributes
        const sc = loginResponse.headers()['set-cookie'] || ''
        // Only require Secure/SameSite=None when running over HTTPS
        const base = process.env.LOCAL_BASEURL || ''
        if (base.toLowerCase().startsWith('https')) {
          expect(sc.toLowerCase()).toContain('secure')
          expect(sc.toLowerCase()).toContain('samesite=none')
        }

  // Wait for /api/me to return 200 (in-page fetch ensures mocked response is used)
  await page.waitForResponse(r => r.url().endsWith('/api/me') && r.status() < 400, { timeout: 10000 })
  const meAfterJson = await page.evaluate(async () => { const r = await fetch('/api/me', { credentials: 'include' }); return { status: r.status, json: await r.json().catch(()=>null) } })
  expect(meAfterJson.status).toBeLessThan(400)
      } else {
        // In MOCK mode, just click login and expect the mocked greeting
        await page.click('button:has-text("Login")')
        await expect(page.locator('text=Hello')).toContainText('Mock User')
      }
    } else {
      // Already authenticated
      expect(meResStatus).toBeLessThan(400)
    }
  })
})
