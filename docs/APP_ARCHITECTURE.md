## App architecture

Overview

Browser (user/admin origins) → Vite dev server (local) → proxy → https://chat-backend.lchaty.com (Cloudflare Worker) → GCP backend

Sequence (happy path):
1) Browser loads `https://local.lchaty.com:5173` or `https://local.admin.lchaty.com:5173`.
2) App makes Axios requests to `/api/...` which Vite proxies to `https://chat-backend.lchaty.com`.
3) Cloudflare Worker enforces security / authentication, and forwards to GCP service.

Trust boundaries
- Local browser: untrusted user input.
- Vite proxy: trusted local-only developer tool.
- Cloudflare Worker: trusted gateway and security boundary.

File map (important files only)
- frontend/index.html — user entry
- frontend/admin.html — admin entry
- frontend/vite.config.ts — HTTPS and proxy rules
- frontend/src/config/backend.ts — API endpoints (export constants)
- frontend/src/services/http.ts — Axios instance (withCredentials: true)
- frontend/src/services/api.user.ts — user API wrappers
- frontend/src/services/api.admin.ts — admin API wrappers

Data flow diagram (ASCII)

Browser
  | (HTTPS, credentialed Axios calls)
V
Vite dev server (local) --proxy /api--> https://chat-backend.lchaty.com (Worker)
                                                 |
                                                 V
                                              GCP backend

Rationale
- Using local origins with SAN certs ensures cookies with Secure are set, enabling realistic authentication tests.
- Proxy cookieDomainRewrite removes the domain attribute, enabling browser to store cookies on local origins.
