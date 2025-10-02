# Simple Vite dev server starter - HTTP only
param(
    [string]$Port = "3000"
)

Write-Host "=== Starting Simple Vite Dev Server (HTTP) ===" -ForegroundColor Green
Write-Host "Port: $Port" -ForegroundColor Cyan

# Navigate to the frontend directory if we're not already there
if (!(Test-Path "package.json")) {
    if (Test-Path "frontend\package.json") {
        Set-Location frontend
        Write-Host "Changed to frontend directory" -ForegroundColor Yellow
    } else {
        Write-Error "Could not find package.json. Are you in the right directory?"
        exit 1
    }
}

# Install dependencies if node_modules doesn't exist
if (!(Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to install dependencies"
        exit 1
    }
}

# Start Vite dev server
Write-Host "Starting Vite dev server..." -ForegroundColor Green
Write-Host "Server will be available at: http://localhost:$Port" -ForegroundColor Cyan

# Set port if different from default
if ($Port -ne "3000") {
    $env:PORT = $Port
}

# Start the server
npm run dev

if ($LASTEXITCODE -ne 0) {
    Write-Error "Vite dev server failed to start"
    exit 1
}