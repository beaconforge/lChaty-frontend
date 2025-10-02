
COMMAND POLICY (STRICT)

ALLOWED INLINE COMMANDS:
> IMPORTANT - CERTIFICATE & SECURITY POLICY:
>
> - The assistant or any automation MUST NOT create, modify, delete, or trust certificates, keys, or the system certificate store without explicit written approval.
> - Admin actions for certificates require a human to run them and confirm completion (ADMIN:DONE).
> - See `../docs/CERT_POLICY_SNIPPET.md` for full details.

FORBIDDEN INLINE COMMANDS (NEVER RUN):

ADMIN-ONLY PAUSE RULE
  ADMIN ACTION REQUIRED:
    <exact command(s)>
  Reply with: ADMIN:DONE

SERVER START BEHAVIOR
  powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\start-vite.ps1 -Port 5173 -Https
  powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\ping-origins.ps1 -TimeoutSec 120
  (or curl -skI against both origins)

ON SERVER START:
  - https://local.lchaty.com:5173
  - https://local.admin.lchaty.com:5173
