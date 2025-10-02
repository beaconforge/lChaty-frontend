<#
.SYNOPSIS
    🎯 ORCHESTRATOR: Restart HTTPS Vite dev server (kill + start)
    🔒 LOCK PROTECTED: Prevents concurrent restarts
    🔄 CALLS: kill-server.ps1 → start-server.ps1
    DO NOT CHANGE OR ALTER THIS SCRIPT
#>
param(
    [int]$Port = 5173
)

# 🔒 LOCK: Check for concurrent execution
$lockFile = "$env:TEMP\lchaty-restart-server.lock"
if (Test-Path $lockFile) {
    Write-Host "❌ Another restart is running. Lock file: $lockFile" -ForegroundColor Red
    exit 1
}

try {
    New-Item $lockFile -ItemType File -Force | Out-Null

Write-Host "🔄 === ORCHESTRATOR: Restarting HTTPS Server ===" -ForegroundColor Magenta
Write-Host "Port: $Port | mkcert certificates | local.lchaty.com domains" -ForegroundColor Cyan

# Step 1: Kill existing processes
Write-Host "`n🛑 Step 1: Killing existing server..." -ForegroundColor Yellow
& "$PSScriptRoot\kill-server.ps1" -Ports @($Port) -Force
Start-Sleep -Seconds 2

# Step 2: Start new server
Write-Host "`n🚀 Step 2: Starting new server..." -ForegroundColor Green
& "$PSScriptRoot\start-server.ps1" -Port $Port

# Verify server is actually running
Start-Sleep -Seconds 2
$listening = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if ($listening) {
    Write-Host "`n🎉 ✅ Server restart complete!" -ForegroundColor Green
    Write-Host "   📍 https://local.lchaty.com:$Port/" -ForegroundColor Cyan
    Write-Host "   📍 https://local.admin.lchaty.com:$Port/" -ForegroundColor Cyan
} else {
    Write-Host "`n❌ Server restart failed - not listening on port $Port!" -ForegroundColor Red
    exit 1
}

} finally {
    Remove-Item $lockFile -Force -ErrorAction SilentlyContinue
}