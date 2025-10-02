<#
.SYNOPSIS
    Start HTTPS Vite dev server with mkcert certificates
    🔒 LOCK PROTECTED: Prevents concurrent server starts
    🔐 USES: mkcert certificates for local.lchaty.com domains
    DO NOT CHANGE OR ALTER THIS SCRIPT
#>
param(
    [int]$Port = 5173,
    [switch]$Background
)

# 🔒 LOCK: Check for concurrent execution
$lockFile = "$env:TEMP\lchaty-start-server.lock"
if (Test-Path $lockFile) {
    Write-Host "❌ Another server start is running. Lock file: $lockFile" -ForegroundColor Red
    exit 1
}

try {
    New-Item $lockFile -ItemType File -Force | Out-Null

Write-Host "=== Starting HTTPS Vite Server ===" -ForegroundColor Green
Write-Host "Port: $Port" -ForegroundColor Cyan
Write-Host "Domains: local.lchaty.com:$Port, local.admin.lchaty.com:$Port" -ForegroundColor Cyan

# Find repository root (go up from scripts directory)
$repoRoot = Split-Path $PSScriptRoot -Parent
$certsDir = Join-Path $repoRoot "certs"
$certFile = Join-Path $certsDir "local.lchaty.com+1.pem"
$keyFile = Join-Path $certsDir "local.lchaty.com+1-key.pem"

# Verify mkcert certificates exist
if (!(Test-Path $certFile) -or !(Test-Path $keyFile)) {
    Write-Host "❌ mkcert certificates not found!" -ForegroundColor Red
    Write-Host "   Expected: $certFile" -ForegroundColor Yellow
    Write-Host "   Expected: $keyFile" -ForegroundColor Yellow
    Write-Host "   Run from repo root: cd certs; mkcert local.lchaty.com local.admin.lchaty.com" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ mkcert certificates found" -ForegroundColor Green

# Install dependencies if needed (check in repo root)
$nodeModulesPath = Join-Path $repoRoot "node_modules"
if (!(Test-Path $nodeModulesPath)) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    Push-Location $repoRoot
    try {
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Error "npm install failed"
            Remove-Item $lockFile -Force -ErrorAction SilentlyContinue
            exit 1
        }
    } finally {
        Pop-Location
    }
}

# Start Vite server in background job
$job = Start-Job -ScriptBlock {
    Set-Location $using:repoRoot
    npm run dev
}

Write-Host "Started Vite job ID: $($job.Id)" -ForegroundColor Green
Write-Host "Waiting for server initialization..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# Verify server is running
$listening = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if ($listening) {
    Write-Host "✅ Server is running on port $Port" -ForegroundColor Green
    Write-Host "   https://local.lchaty.com:$Port/" -ForegroundColor Cyan
    Write-Host "   https://local.admin.lchaty.com:$Port/" -ForegroundColor Cyan
} else {
    Write-Host "❌ Server failed to start on port $Port" -ForegroundColor Red
    exit 1
}

    Write-Host "✅ HTTPS server ready!" -ForegroundColor Green
} finally {
    Remove-Item $lockFile -Force -ErrorAction SilentlyContinue
}