## Development setup (Windows-first)

This document walks through the steps to prepare a Windows machine for local frontend development of lChaty. Follow exactly. Administrative privileges are required for hosts/certs steps.

> IMPORTANT - CERTIFICATE & SECURITY POLICY:
>
> - Do NOT create, modify, delete, or trust certificates, keys, or the system certificate store unless you have explicit written approval from the project owner.
> - If certificate changes are required, open an issue and obtain approval before running any scripts that modify trust stores or certificates.
>
> See `docs/CERT_POLICY_SNIPPET.md` for full policy details.

1) Hosts entries

```
127.0.0.1   local.lchaty.com
127.0.0.1   local.admin.lchaty.com
```
- Use the included script to make this idempotent:
  - Open PowerShell as Administrator and run:
    ./scripts/setup-hosts-and-proxy.ps1 -Action add

2) Certificates (SAN: local.lchaty.com, local.admin.lchaty.com)

We provide a script `./scripts/generate-dev-certs.ps1` which will create a SAN certificate (PFX + PEM) suitable for Vite dev server.

- Recommended: use PowerShell as Administrator.
- Example:
  ./scripts/generate-dev-certs.ps1 -OutDir ./certs -PfxName local.lchaty.com.pfx -Force

If you prefer OpenSSL or mkcert, the script supports OpenSSL when available. The generated PFX is placed in `./certs` and the script trusts the cert locally.

3) Convert PFX to PEM (OpenSSL required)

Use the helper:
  ./scripts/convert-pfx-to-pem.ps1 -PfxPath ./certs/local.lchaty.com.pfx -OutDir ./certs

4) Environment variables (.env)

Create `./frontend/.env` (example provided in repo). Key entries:

- DEV_CERT_PATH — path to PEM cert (or PFX path if Vite supports it)
- DEV_KEY_PATH — path to key PEM
- PROXY_TARGET — https://chat-backend.lchaty.com

5) Start dev server (external terminal ONLY)

- Open a new PowerShell (not the IDE terminal). Run:
  ./scripts/start-vite.ps1 -Port 5173 -Https

6) Troubleshooting

- Browser shows NET::ERR_CERT_AUTHORITY_INVALID: trust the generated cert via the script or manually import into Trusted Root.
- CORS/cookies failing: ensure you opened the exact origins `https://local.lchaty.com:5173` and `https://local.admin.lchaty.com:5173` and that the backend worker is reachable at `https://chat-backend.lchaty.com`.
