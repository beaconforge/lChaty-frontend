## AI Operations — Run-until-green loop

This document defines the automated/manual loop the AI operator (Copilot) must follow until all acceptance gates pass.

Sequence (must follow exactly):
1) Generate or update the project files described in the central task.
2) Install dependencies from the repo root (`npm install`).
3) npm run typecheck — must succeed with exit code 0.
4) npm run build — must succeed and produce both index.html and admin.html in `dist`.
5) Start dev server via external terminal (scripts/start-vite.ps1) — server must listen on both required local origins over HTTPS.
6) Open both origins in a browser and confirm app loads. Confirm credentialed network requests and cookies as described in docs/CORS_SECURITY.md.
7) npm run e2e (MOCK) — must pass.
8) E2E_MODE=LIVE npm run e2e — must pass, with resilient assertions.

If any step fails
- Apply minimal fix, document the change (EDIT log entry), re-run from step 3.

Acceptance gates
- TypeScript typecheck = 0
- Build = 0 and dist contains index.html + admin.html
- Dev server serves HTTPS on required origins
- Browser shows credentialed requests; cookies accepted
- MOCK Playwright suite passes
- LIVE Playwright reaches worker and completes happy path assertions
- No console errors after login

Logging format for AI runs (required)
- EDIT: <file> — <one-line rationale>
- RUN:  <command>
- RESULT: pass | fail — <short error if fail>
