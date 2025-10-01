<#
.SYNOPSIS
  Kill whatever is listening on the specified port, then start Vite in a new window.

.DESCRIPTION
  Uses `kill-port.ps1` to terminate processes listening on the chosen port (interactive unless -Force)
  and then launches `start-vite.ps1` to start the dev server. Useful as a single command
  to guarantee the port is available and the server is started with optional HTTPS.

.EXAMPLE
  .\start-and-ensure.ps1 -Port 5173 -Https -Force
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [int]$Port = 5173,
    [switch]$Https,
  [switch]$ForceHttp,
    [switch]$Force
)

  # Optional: force the proxy to hit a specific backend IP (e.g. https://104.21.73.62)
  [string]$ForceBackendIP = ''

$scriptDir = Split-Path -Path $MyInvocation.MyCommand.Definition -Parent

# 1) Ensure port is free
Write-Host "Ensuring port $Port is free..." -ForegroundColor Cyan
if ($Force) {
  & (Join-Path $scriptDir 'kill-port.ps1') -Port $Port -Force
} else {
  & (Join-Path $scriptDir 'kill-port.ps1') -Port $Port
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "kill-port reported an issue (exit code $LASTEXITCODE). Aborting start." -ForegroundColor Red
    exit $LASTEXITCODE
}

# 2) Start Vite in a new window
Write-Host "Starting Vite on port $Port (Https=$Https)" -ForegroundColor Cyan
if ($Https) {
  & (Join-Path $scriptDir 'start-vite.ps1') -Port $Port -Https -ForceBackendIP $ForceBackendIP -ForceHttp:$ForceHttp
} else {
  & (Join-Path $scriptDir 'start-vite.ps1') -Port $Port -ForceBackendIP $ForceBackendIP -ForceHttp:$ForceHttp
}

Write-Host "Orchestration complete." -ForegroundColor Green
