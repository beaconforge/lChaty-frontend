## Playwright E2E — MOCK vs LIVE

Projects:
- user: baseURL = https://local.lchaty.com:5173
- admin: baseURL = https://local.admin.lchaty.com:5173

Run server externally before running tests (see scripts/start-vite.ps1).

Commands
- Mock run (default):
  cd frontend
  npm run e2e
- Live run (hits worker):
  E2E_MODE=LIVE npm run e2e

Test authoring notes
- Tests must guard LIVE mode (environment variable). If LIVE, assertions should be resilient to unknown backend data and only assert connectivity and positive status codes where possible.
- use.ignoreHTTPSErrors: true is enabled to accept self-signed SAN certs during testing.

Failure triage
- If tests fail in MOCK: check route interception and mocked responses.
- If tests fail in LIVE: confirm `https://chat-backend.lchaty.com` is reachable and that cookies are being set; check Cloudflare Worker logs.

Artifacts
- On failure, Playwright will capture traces and screenshots (see playwright.config.ts). Review `frontend/playwright-report` and `frontend/test-results`.
