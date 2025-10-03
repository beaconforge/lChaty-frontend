
COMMAND POLICY (STRICT)

ALLOWED INLINE COMMANDS:
- powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\start-vite.ps1 -Port 5173 -Https
- powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\setup-hosts-and-proxy.ps1 -Action Add   # REQUIRES ADMIN
- powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\generate-dev-certs.ps1 -OutDir .\frontend\certs -PfxName local.lchaty.com.pfx -Force   # REQUIRES ADMIN
- powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\convert-pfx-to-pem.ps1 -PfxPath .\frontend\certs\local.lchaty.com.pfx -OutDir .\frontend\certs -Password devpassword
- powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\ping-origins.ps1 -TimeoutSec 120
- powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-inline-guard.ps1
- cd frontend && npm i
- npm run typecheck
- npm run build
- npm run e2e
- $env:E2E_MODE='LIVE'; npm run e2e   # after E2E_* creds are set

FORBIDDEN INLINE COMMANDS (NEVER RUN):
- npm run dev
- vite / vite dev
- pnpm/yarn/bun dev
- any Playwright webServer.command that starts vite
- any command that sends input to the dev server terminal after start

ADMIN-ONLY PAUSE RULE
- Only actions needing elevation (hosts file, portproxy, cert trust/generation) require human intervention.
- When admin rights are needed, print:
  ADMIN ACTION REQUIRED:
    <exact command(s)>
  Reply with: ADMIN:DONE
- Pause until ADMIN:DONE is received, then proceed automatically.

SERVER START BEHAVIOR
- You ARE allowed to start the server yourself, but ONLY by invoking the launcher script:
  powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\start-vite.ps1 -Port 5173 -Https
- Do not attempt any other server start mechanism.
- After launching, do NOT attach to the server process; instead poll readiness via:
  powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\ping-origins.ps1 -TimeoutSec 120
  (or curl -skI against both origins)

ON SERVER START:
- Only invoke the start script above.
- Do NOT attempt to "wait" by attaching to the server process; perform readiness checks with HTTP polling against:
  - https://local.lchaty.com:5173
  - https://local.admin.lchaty.com:5173
- If server isn\'t ready, poll (curl -skI) up to 120s; then proceed to tests.
