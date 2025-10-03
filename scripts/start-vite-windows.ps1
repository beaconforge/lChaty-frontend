<#
.SYNOPSIS
  Start the frontend Vite dev server in a new PowerShell window and wait for it to become reachable.

.DESCRIPTION
  This helper opens a new PowerShell window, sets EXTERNAL_START=1 and runs `npm run dev` inside
  the `frontend` folder. It can optionally kill any process currently listening on the chosen port
  and will poll the loopback interface for readiness.

.EXAMPLE
  .\scripts\start-vite-windows.ps1
  .\scripts\start-vite-windows.ps1 -Port 5173 -KillExisting
#>

param(
    [int]$Port = 5173,
    [switch]$KillExisting,
    [int]$TimeoutSeconds = 30
)

Set-StrictMode -Version Latest

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$frontendDir = Join-Path $scriptRoot 'frontend'

Write-Host "Starting Vite dev server (frontend) on port $Port..." -ForegroundColor Cyan

if ($KillExisting.IsPresent) {
    try {
        $conn = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Where-Object { $_.State -eq 'Listen' }
        if ($conn) {
            $owningPids = $conn | Select-Object -ExpandProperty OwningProcess -Unique
            foreach ($ownPid in $owningPids) {
                Write-Host "Killing existing process with PID $ownPid listening on port $Port" -ForegroundColor Yellow
                try { Stop-Process -Id $ownPid -Force -ErrorAction Stop } catch { Write-Host ([string]::Format('Failed to kill PID {0}: {1}', $ownPid, $_.Exception.Message)) -ForegroundColor Red }
            }
        }
    } catch {
        Write-Host "Warning: failed to query or kill existing listener(s): $_" -ForegroundColor Yellow
    }
}

# Build the command we'll run in the new window. Use single-quoted here so PowerShell expands nothing now.
$inner = @"
cd '$frontendDir'
`$env:EXTERNAL_START='1'
npm run dev
"@

# Start a new PowerShell window and run the command without closing (-NoExit) so logs remain visible.
Start-Process -FilePath powershell -ArgumentList '-NoExit', '-Command', $inner -WindowStyle Normal

Write-Host "Launched new PowerShell window running 'npm run dev' in:`n  $frontendDir" -ForegroundColor Green

Write-Host "Waiting up to $TimeoutSeconds seconds for https://local.lchaty.com:$Port (SNI) or https://127.0.0.1:$Port to become reachable..." -ForegroundColor Cyan

$deadline = (Get-Date).AddSeconds($TimeoutSeconds)
while ((Get-Date) -lt $deadline) {
    # Test the loopback address; Playwright maps local.lchaty.com -> 127.0.0.1 in the browser args.
    $test = Test-NetConnection -ComputerName 127.0.0.1 -Port $Port -InformationLevel Detailed -WarningAction SilentlyContinue
    if ($test -and $test.TcpTestSucceeded) {
        Write-Host "Port $Port is listening (127.0.0.1). You can open https://local.lchaty.com:$Port in your browser." -ForegroundColor Green
        exit 0
    }
    Start-Sleep -Seconds 1
}

Write-Host "Timed out waiting for port $Port to be ready. Check the new terminal window for Vite logs." -ForegroundColor Red
exit 2
