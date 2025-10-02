<#
.SYNOPSIS
    Kill all Node.js processes and free ports
    🔒 LOCK PROTECTED: Prevents concurrent kills
    DO NOT CHANGE OR ALTER THIS SCRIPT
#>
param(
    [int[]]$Ports = @(5173, 5174, 3000),
    [switch]$Force
)

# 🔒 LOCK: Check for concurrent execution
$lockFile = "$env:TEMP\lchaty-kill-server.lock"
if (Test-Path $lockFile) {
    Write-Host "❌ Another kill-server is running. Lock file: $lockFile" -ForegroundColor Red
    exit 1
}

try {
    New-Item $lockFile -ItemType File -Force | Out-Null

Write-Host "=== Killing Server Processes ===" -ForegroundColor Yellow
Write-Host "Ports to clean: $($Ports -join ', ')" -ForegroundColor Cyan

# Kill all node processes
Write-Host "Stopping all Node.js processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Kill processes on specific ports
foreach ($Port in $Ports) {
    Write-Host "Checking port $Port..." -ForegroundColor Cyan
    $conns = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if ($conns) {
        foreach ($conn in $conns) {
            $processId = $conn.OwningProcess
            if ($processId -gt 0) {
                try {
                    $process = Get-Process -Id $processId -ErrorAction Stop
                    Write-Host "  Killing PID $processId ($($process.ProcessName)) on port $Port" -ForegroundColor Red
                    Stop-Process -Id $processId -Force
                } catch {
                    Write-Host "  PID $processId already terminated" -ForegroundColor Gray
                }
            }
        }
    } else {
        Write-Host "  Port $Port is free" -ForegroundColor Green
    }
}

    Write-Host "✅ Server cleanup complete" -ForegroundColor Green
} finally {
    Remove-Item $lockFile -Force -ErrorAction SilentlyContinue
}