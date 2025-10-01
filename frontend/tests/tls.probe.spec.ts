import { test } from '@playwright/test'

// Ensure we ignore HTTPS cert errors for local self-signed certs
test.use({ ignoreHTTPSErrors: true })

const url = process.env.LOCAL_BASEURL || 'https://local.lchaty.com:5173'

test('TLS/HTTPS probe - single navigation', async ({ page }) => {
  console.log('Probe URL:', url)

  page.on('console', msg => console.log('[console]', msg.type(), msg.text()))
  page.on('pageerror', err => console.log('[pageerror]', err && err.message))
  page.on('requestfailed', req => {
    const failure = req.failure()
    console.log('[requestfailed]', req.method(), req.url(), failure && failure.errorText)
  })

  try {
    const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
    if (resp) console.log('Navigation status:', resp.status())
    else console.log('No response object (navigation may have been blocked)')
    // Short content snapshot
    const content = await page.content()
    console.log('Page content starts:', content.substring(0, 200).replace(/\n/g, ' '))
  } catch (err: any) {
    console.error('Navigation error:', err && err.message)
    throw err
  }
})
