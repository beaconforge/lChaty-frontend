# lChaty Frontend — Local Development (quickstart)

See `docs/DEV_SETUP.md` for full setup. Quick steps:

1) Add hosts and generate certs (Admin PowerShell):
   ./scripts/setup-hosts-and-proxy.ps1 -Action add
   ./scripts/generate-dev-certs.ps1 -OutDir ./certs -PfxName local.lchaty.com.pfx -Force

2) Convert PFX to PEM (if needed):
   ./scripts/convert-pfx-to-pem.ps1 -PfxPath ./certs/local.lchaty.com.pfx -OutDir ./certs

3) Start dev server in a new terminal:
   ./scripts/start-vite.ps1 -Port 5173 -Https

4) Open both origins:
   https://local.lchaty.com:5173/
   https://local.admin.lchaty.com:5173/
# lChaty frontend
