# Developer scripts

This folder contains helper scripts for local development.

> IMPORTANT - CERTIFICATE & SECURITY POLICY:
>
> - Do NOT run or modify certificate generation, conversion, or trust scripts unless explicitly approved.
> - Actions that alter hosts, portproxy, or trust stores require an admin-approved ticket and must be executed manually by an authorized person.
> - See `../docs/CERT_POLICY_SNIPPET.md` for the canonical policy.


start-vite.ps1
- Launches a new PowerShell window and runs `npm run dev` from the repository root.
- Usage:
  - `./start-vite.ps1` (defaults to port 5173)
  - `./start-vite.ps1 -Port 5175` (start on a specific port)
  - Run PowerShell as Administrator if you need to set hosts entries or port forwarding.

setup-hosts-and-proxy.ps1
- Add or remove hosts entries for `local.lchaty.com` and `local.admin.lchaty.com` and optionally create a `netsh` portproxy from a listen port to a target port. Must be run as Administrator.
- Usage examples (run in elevated PowerShell):
  - `./setup-hosts-and-proxy.ps1 -Action Add -ListenPort 5173 -TargetPort 5173`
  - `./setup-hosts-and-proxy.ps1 -Action Remove -ListenPort 5173`

generate-dev-certs.ps1
- Create a self-signed certificate for local development and export a PFX and (if OpenSSL is present) PEM files to `./certs`.
- Usage (may require elevated PowerShell to trust the cert):
  - `./generate-dev-certs.ps1 -OutDir ..\certs -PfxPassword devpassword`

kill-port.ps1
- Interactive helper to find and terminate processes listening on a port.
- Usage:
  - `./kill-port.ps1 -Port 5173` (will prompt before killing each PID)
  - `./kill-port.ps1 -Port 5173 -Force` (terminate without prompt)

start-and-ensure.ps1
- Orchestrator that runs `kill-port.ps1` and then launches the Vite server via `start-vite.ps1`.
- Usage:
  - `./start-and-ensure.ps1 -Port 5173 -Https -Force`
  - This will ensure the port is free, then open a new PowerShell window running Vite on the given port.


