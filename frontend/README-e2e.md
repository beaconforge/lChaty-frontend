# LChaty E2E (Playwright) – Quickstart

## 0) Start the dev server
Use only the approved scripts:
- `./scripts/start-dev`
- `./scripts/stop-dev`
- `./scripts/restart-dev`

## 1) Install Playwright
```bash
npm i -D @playwright/test
npx playwright install

2) Set base URLs (if not default)
# Defaults:
# E2E_USER_BASE_URL=https://local.lchaty.com:5173
# E2E_ADMIN_BASE_URL=https://local.admin.lchaty.com:5173

3) Provide credentials

Add to D:\Chat\lChaty-frontend\frontend\.env.local:

E2E_USER=...
E2E_PASS=...
E2E_ADMIN_USER=...
E2E_ADMIN_PASS=...
# Optional landing overrides:
# E2E_USER_LANDING_SELECTOR=[data-testid="chat-input"]
# E2E_ADMIN_LANDING_SELECTOR=[data-testid="admin-dashboard"]

4) Run tests
npx playwright test --project=userApp-chromium --project=adminApp-chromium


Artifacts:

Traces/screenshots/videos under test-results/ and playwright-report/.

Notes

Backend must remain https://chat-backend.lchaty.com
 (tests assert it).

First load shouldn't show "Invalid session"; banner only appears after a failed submit.