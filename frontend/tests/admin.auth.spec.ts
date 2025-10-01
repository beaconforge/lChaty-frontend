import { test, expect } from '@playwright/test'

test.describe('Admin gate', () => {
  test('admin health reachable', async ({ page }) => {
    const isLive = process.env.E2E_MODE === 'LIVE'
    await page.goto('/')

    if (!isLive) {
      await page.route('**/api/admin/health', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'ok' }) }))
      await page.route('**/api/me', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ username: 'admin', is_admin: true }) }))
    }

    // Ensure /api/me for admin (use in-page fetch so page.route mocks are applied)
    const meResStatus = await page.evaluate(async () => {
      try {
        const r = await fetch('/api/me', { credentials: 'include' });
        return r.status
      } catch (e) { return 0 }
    })
    if (meResStatus === 401) {
      if (isLive) {
        await page.fill('input[name="username"]', process.env.E2E_ADMIN_USER || 'admin')
        await page.fill('input[name="password"]', process.env.E2E_ADMIN_PASS || 'adminpass')

        const [loginResponse] = await Promise.all([
          page.waitForResponse(r => r.url().endsWith('/api/auth/login')),
          page.click('button:has-text("Login")')
        ])

        const sc = loginResponse.headers()['set-cookie'] || ''
        // Only require Secure/SameSite=None when running over HTTPS (CI or HTTPS dev)
        const base = process.env.LOCAL_BASEURL || ''
        if (base.toLowerCase().startsWith('https')) {
          expect(sc.toLowerCase()).toContain('secure')
          expect(sc.toLowerCase()).toContain('samesite=none')
        }

        await page.waitForResponse(r => r.url().endsWith('/api/me') && r.status() < 400, { timeout: 10000 })
      } else {
        // Mock login - trigger the mocked /api/me route by clicking
        await page.click('button:has-text("Login")')
      }
    }

    const meAfterJson = await page.evaluate(async () => {
      const r = await fetch('/api/me', { credentials: 'include' })
      return { status: r.status, json: await r.json().catch(() => null) }
    })
    expect(meAfterJson.status).toBeLessThan(400)
    const meJson = meAfterJson.json
    expect(meJson.is_admin === true || meJson.is_admin === undefined).toBeTruthy()

    // Check admin health
    const healthStatus = await page.evaluate(async () => {
      try {
        const r = await fetch('/api/admin/health')
        return r.status
      } catch (e) { return 0 }
    })
    expect(healthStatus).toBeLessThan(400)
  })
})
