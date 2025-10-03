# Automation Runbook — Fully Hands-Free Run-Until-Green

Goal: make the frontend dev + E2E loop fully automated and non-interactive for local (VS Code) and CI runs while preserving the repo's guardrails (no inline starts, gated LIVE tests, and strict hostnames). This runbook lists the exact, actionable changes, scripts, configuration, and the step-by-step sequence the AI or a CI runner should execute to achieve a repeatable, unattended run-until-green workflow.

Summary of approach
- Keep the inline guard (`scripts/no-inline-guard.js`) and Vite guard in place.
- Add a non-interactive, background starter that sets `EXTERNAL_START=1`, logs output, and writes a PID file.
- Add a single orchestrator that sequences install, kill-port, start background server, wait/poll, run Playwright MOCKs, gather artifacts, and exit non-zero until green. LIVE tests only run when explicitly enabled and when secrets are available.
- Make hostnames and baseURLs configurable by environment variables; keep `local.admin.lchaty.com` as the canonical admin name.
- Provide cross-platform Node variants for critical helpers so headless/local automation behaves consistently across Windows/macOS/Linux.

Required repo additions / edits (exact files)
1. Add `scripts/start-vite-ci.js` (Node): non-interactive background starter
   - Purpose: spawn Vite with EXTERNAL_START=1 as a detached child, redirect stdout/stderr to `logs/vite.log`, write PID to `tmp/vite.pid`, and exit immediately (0 on spawn success, non-zero on failure).
   - Behavior notes: should honor `--port` and `--https` flags, support `FORCE_BACKEND_IP` env override, and run in repo root.

2. Add `scripts/run-e2e-ci.js` (Node): orchestrator/run-until-green
   - Purpose: single command to run the full unattended loop. Steps:
     - Run `npm ci` in repo root.
     - Invoke `scripts/kill-port.* -Port 5173 -Force` to free the port.
     - Start the server via `scripts/start-vite-ci.js --port 5173 --https`.
     - Poll readiness for both origins (uses built-in poller or `scripts/ping-origins.ps1`/`ping-origins.js`) up to configurable timeout (default 120s).
     - Run Playwright MOCK tests (`npx playwright test` or `npm run e2e`).
     - On failure: collect `logs/vite.log`, Playwright report (`playwright-report/`), traces, and retry up to N times with exponential backoff (configurable).
     - If MOCK is green, optionally run LIVE tests only if `RUN_LIVE=1` and required secrets (envs) are present.
     - Exit with the Playwright exit code (0 if green, non-zero otherwise).

3. Add `scripts/ping-origins.js` (Node) — cross-platform poller
   - Purpose: poll the two hostnames/URLs using Node fetch with ignore-SSL option; return success when both respond 200.
   - Usage: `node scripts/ping-origins.js --timeout 120` or called from `run-e2e-ci.js`.

4. Edit `playwright.config.ts` to accept env overrides
   - Change baseURL lines to read from env var fallbacks, for example:
     - local: `process.env.LOCAL_BASEURL ?? 'https://local.lchaty.com:5173'`
     - admin: `process.env.ADMIN_BASEURL ?? 'https://local.admin.lchaty.com:5173'`

5. Add `tmp/` and `logs/` to .gitignore and ensure the CI orchestrator writes artifacts to `artifacts/`.

6. (Optional) Add `start-vite.ps1 -Background` mode so interactive dev remains unchanged but automation uses Node starter.

Why these changes (rationale)
- GUI-terminal spawns (current `start-vite.ps1`) require interactive desktop; CI/headless and unattended VS Code tasks need background processes.
- Node-based starters are cross-platform and easier to run from GitHub Actions, GitLab CI, or local headless sessions.
- Central orchestrator avoids users re-implementing the sequence and keeps guardrails intact (EXTERNAL_START still required by in-repo guard).

Exact sequence the AI or operator will run (fully automated)
1) (One-time) Prepare hostnames and certs (requires admin privileges)
   - Run elevated once to add hosts entries and (optionally) trust dev certs:
     - Windows: `.
esourcesin
un-as-admin.ps1 -Script .\scripts\setup-hosts-and-proxy.ps1 -Action Add -ListenPort 5173`
     - macOS/Linux: add `/etc/hosts` entries for `local.lchaty.com` and `local.admin.lchaty.com` pointing to 127.0.0.1, or set `ADMIN_BASEURL`/`LOCAL_BASEURL` to `https://127.0.0.1:5173`.
   - Generate and trust certs if desired: `.	emplates	rust-and-export-cert.ps1` (Windows elevated) — Playwright will run with `ignoreHTTPSErrors:true` regardless.

2) Automated run (the orchestrator — single command)
   - Run from repo root (non-admin):
     - `node ./scripts/run-e2e-ci.js --timeout 120 --retries 2`
   - Or run the PowerShell shim if you prefer: `.
un-e2e-local.ps1` (calls the Node orchestrator).

3) What `run-e2e-ci.js` does (precisely)
   - Normalize environment (load .env if present, ensure `ADMIN_BASEURL` / `LOCAL_BASEURL` set)
   - Install deps if requested (or assume CI already ran `npm ci`)
   - Kill port 5173 (force)
   - Start Vite in background via `start-vite-ci.js`, wait 1-2s to confirm spawn and write `tmp/vite.pid`.
   - Poll `LOCAL_BASEURL` and `ADMIN_BASEURL` until both respond OK or timeout.
   - On success, run Playwright tests with `npx playwright test --reporter=list` (store reports to `artifacts/playwright-report/`).
   - On failure, collect `logs/vite.log`, `tmp/vite.pid` snapshot, Playwright report, and retry if remaining attempts.
   - On success, gracefully kill background Vite process using PID file or platform-specific kill.

Failure handling and observability
- Whatever fails, dump these artifacts to `artifacts/<timestamp>/`: `logs/vite.log`, `playwright-report/`, `trace.zip` (Playwright trace), `tmp/vite.pid`, `env.snapshot` (selected env vars), and a short `failure-summary.txt`.
- Capture Set-Cookie headers for the proxy rewrite step: add a small middleware in the dev proxy to log original Set-Cookie headers to `logs/set-cookie.log` so failures in cookie-domain rewriting are visible.

Security and LIVE runs
- LIVE tests must only run when `RUN_LIVE=1` and required secrets are present in environment variables or CI secret storage; the orchestrator must check for required envs and abort otherwise.
- Add a strict policy in the orchestrator: if `RUN_LIVE=1` but required secrets are missing, fail fast and print guidance.

Clean up and idempotency
- `start-vite-ci.js` writes `tmp/vite.pid` and `logs/vite.log` and should exit 0 on spawn. The orchestrator is responsible for killing the PID on exit and cleaning `tmp/` for the next run.
- All scripts must be idempotent and tolerant of existing files or ports (use `-Force` for kill-port tasks).

Minimal implementation plan and priorities (what I'll implement for you if you approve)
1. Implement `scripts/start-vite-ci.js` (Node): background starter with logs + pid file. (High priority)
2. Implement `scripts/run-e2e-ci.js` (Node): orchestrator that sequences start/poll/run/retry and captures artifacts. (High priority)
3. Implement `scripts/ping-origins.js` (Node) and modify `playwright.config.ts` to use env overrides for baseURLs. (Medium)
4. Add small proxy logging middleware to record Set-Cookie headers to `logs/set-cookie.log`. (Medium)

Acceptance criteria (how we measure done)
- Orchestrator can be invoked with a single command and will:
  - Start dev server non-interactively and write `tmp/vite.pid` and `logs/vite.log`.
  - Wait until both local origins are reachable.
  - Run Playwright MOCK tests and return the tests' exit code.
  - Save diagnostics on failures and retry up to configured attempts.
- LIVE tests only run when `RUN_LIVE=1` and secrets are present.

Appendix: sample minimal `start-vite-ci.js` behavior (pseudocode)
```
// spawn child: env.EXTERNAL_START='1', cwd=repo root, command: npm run dev -- --port 5173 --https
// redirect stdout/stderr to logs/vite.log
// write child.pid to tmp/vite.pid
// detach and exit 0
```

Appendix: sample minimal `run-e2e-ci.js` CLI flags
- --timeout <seconds> (default 120)
- --retries <n> (default 2)
- --run-live (only if explicitly provided)

If you approve I will implement priority items (1) and (2) now, run a local smoke (start background server, poll origins, run Playwright MOCK) and attach results/logs. If you prefer to review content changes before I code, say "please change X" and I will update the plan accordingly.
