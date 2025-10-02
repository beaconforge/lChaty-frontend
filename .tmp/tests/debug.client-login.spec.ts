import { test, expect } from '@playwright/test'

test('client-side fill and submit debug', async ({ page }) => {
  // Capture console messages for diagnosis
  page.on('console', m => {
    console.log('PAGE_CONSOLE>', m.type(), m.text())
  })
  // Capture network requests
  page.on('request', r => console.log('REQ>', r.method(), r.url()))
  page.on('response', async r => console.log('RES>', r.status(), r.url()))

  // Navigate to root
  await page.goto('/')

  // Give app a moment to hydrate
  await page.waitForLoadState('networkidle')

  // Try a set of selectors that might match the inputs
  const selectors = [
    'input[name="username"]',
    'input[name="user"]',
    'input[placeholder*="username"]',
    'input[placeholder*="Enter your username"]',
    'input[type="text"]',
    'input'
  ]

  const found = []
  for (const s of selectors) {
    const el = await page.$(s)
    found.push({ selector: s, exists: !!el })
  }
  console.log('FOUND_SELECTORS:', JSON.stringify(found))

  // Snapshot of visible text inputs and their values
  const inputs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input')).map((i: HTMLInputElement) => ({
      name: i.getAttribute('name'),
      id: i.id || null,
      type: i.type || null,
      placeholder: i.getAttribute('placeholder'),
      value: i.value || null
    }))
  })
  console.log('INPUTS_BEFORE:', JSON.stringify(inputs, null, 2))

  // Attempt to type into the most likely fields
  const usernameSel = 'input[name="username"]'
  const passwordSel = 'input[name="password"]'

  // If selectors aren't present, try first two inputs
  const usernameExists = await page.$(usernameSel)
  const passwordExists = await page.$(passwordSel)
  const useAlt = !(usernameExists && passwordExists)

  if (!useAlt) {
    await page.click(usernameSel)
    await page.fill(usernameSel, '')
    await page.type(usernameSel, 'typedUser', { delay: 100 })

    await page.click(passwordSel)
    await page.fill(passwordSel, '')
    await page.type(passwordSel, 'typedPass', { delay: 100 })
  } else {
    const allInputs = await page.$$('input')
    if (allInputs.length >= 2) {
      await allInputs[0].click()
      await allInputs[0].fill('')
      await allInputs[0].type('typedUser', { delay: 100 })
      await allInputs[1].click()
      await allInputs[1].fill('')
      await allInputs[1].type('typedPass', { delay: 100 })
    } else {
      throw new Error('No usable input elements found')
    }
  }

  // Capture values after typing
  const inputsAfter = await page.evaluate(() => Array.from(document.querySelectorAll('input')).map((i: HTMLInputElement) => ({ name: i.getAttribute('name'), value: i.value })))
  console.log('INPUTS_AFTER:', JSON.stringify(inputsAfter, null, 2))

  // Click Login/Sign In
  const btn = await page.$('button:has-text("Sign In")') || await page.$('button:has-text("Login")') || await page.$('button[type="submit"]')
  if (!btn) {
    await page.screenshot({ path: '.tmp/debug-no-button.png', fullPage: true })
    throw new Error('Login button not found on page')
  }

  // Click and wait briefly for any validation UI
  await btn.click()
  await page.waitForTimeout(800)

  // Capture potential validation message nodes
  const validation = await page.evaluate(() => {
    const candidates = Array.from(document.querySelectorAll('body *'))
    return candidates.map(n => ({ text: (n.textContent||'').trim(), tag: n.tagName })).filter(x => /please enter both username and password/i.test(x.text))
  })
  console.log('VALIDATION_NODES:', JSON.stringify(validation, null, 2))

  // Save a screenshot for manual inspection
  await page.screenshot({ path: '.tmp/debug-after-click.png', fullPage: true })

  // Ensure typed values are visible to the DOM
  const u = inputsAfter.find(i => i.name && /user/i.test(i.name))
  const p = inputsAfter.find(i => i.name && /pass/i.test(i.name))
  if (u) expect(u.value).toBeTruthy()
  if (p) expect(p.value).toBeTruthy()
})

