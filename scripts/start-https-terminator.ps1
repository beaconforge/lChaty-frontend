param(
  [int]$VitePort = 5174,
  [int]$HttpsPort = 5173,
  [string]$PfxPath = "./certs/local.lchaty.com.pfx",
  [string]$PfxPass = 'devpassword'
)

Set-StrictMode -Version Latest

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$projectRoot = Join-Path $scriptDir '..'

# Start Vite on $VitePort (child process) with EXTERNAL_START so in-repo guards allow it
Write-Host "Starting Vite on HTTP port $VitePort (child)"
$env:EXTERNAL_START='1'
$env:FORCE_HTTP='1'
$viteCmd = "npm --prefix `"$projectRoot\frontend`" run dev -- --port $VitePort"

# Start Vite in a new window
Start-Process powershell -ArgumentList @('-NoExit','-NoProfile','-Command', $viteCmd) -WorkingDirectory (Join-Path $projectRoot 'frontend')

Start-Sleep -Seconds 1

# Start HTTPS terminator (Node) in background
if (-not (Test-Path $PfxPath)) {
  Write-Error "PFX not found at $PfxPath. Generate with scripts/generate-dev-certs.ps1 first."
  exit 1
}

Write-Host "Launching HTTPS terminator on port $HttpsPort -> upstream $VitePort using PFX $PfxPath"
$nodePath = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodePath) { Write-Error 'Node.js not found on PATH'; exit 1 }

$env:DEV_PFX_PATH = (Resolve-Path $PfxPath).Path
$env:DEV_PFX_PASSPHRASE = $PfxPass
$env:DEV_UPSTREAM_PORT = [string]$VitePort
$env:DEV_UPSTREAM_HOST = '127.0.0.1'
$env:DEV_HTTPS_PORT = [string]$HttpsPort

Start-Process -FilePath $nodePath.Path -ArgumentList @(Join-Path $scriptDir 'https-terminator.js') -WorkingDirectory $projectRoot -NoNewWindow -PassThru | Out-Null

Write-Host "HTTPS terminator started. You can now browse https://local.lchaty.com:$HttpsPort"
