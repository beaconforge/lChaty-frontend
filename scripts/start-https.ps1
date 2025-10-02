# HTTPS Vite dev server starter for local.lchaty.com domains
param(
    [string]$Port = "5173"
)

Write-Host "=== Starting HTTPS Vite Dev Server ===" -ForegroundColor Green
Write-Host "Port: $Port" -ForegroundColor Cyan
Write-Host "Domains: local.lchaty.com, local.admin.lchaty.com" -ForegroundColor Cyan

# Stop any existing processes
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Kill anything on the target port
& "$PSScriptRoot\kill-port.ps1" -Port $Port -Force -ErrorAction SilentlyContinue

Write-Host "Starting Vite with HTTPS configuration..." -ForegroundColor Yellow

# Start Vite in background using PowerShell job
$job = Start-Job -ScriptBlock { Set-Location $using:PWD; npm run dev }
Write-Host "Started Vite job with ID: $($job.Id)" -ForegroundColor Green

# Wait for server to start
Write-Host "Waiting for server to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# Check if it's running
$listening = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
if ($listening) {
    Write-Host "✅ Server is listening on port $Port" -ForegroundColor Green
    Write-Host "✅ Access URLs:" -ForegroundColor Green
    Write-Host "   https://local.lchaty.com:$Port/" -ForegroundColor Cyan
    Write-Host "   https://local.admin.lchaty.com:$Port/" -ForegroundColor Cyan
} else {
    Write-Host "❌ Server failed to start on port $Port" -ForegroundColor Red
    Get-Process -Name node -ErrorAction SilentlyContinue | Format-Table Id,ProcessName,StartTime
}