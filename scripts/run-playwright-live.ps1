# Run Playwright in LIVE mode using credentials from frontend/.env.local
# Reads frontend/.env.local for E2E_USER and E2E_PASS (simple KEY=VALUE parsing)
Push-Location frontend
$env:SKIP_START = '1'
$env:LOCAL_BASEURL = 'http://local.lchaty.com:5173'
$env:ADMIN_BASEURL = 'http://local.lchaty.com:5173'
$env:E2E_MODE = 'LIVE'
$envFile = Join-Path (Get-Location) '.env.local'
if (Test-Path $envFile) {
  Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*([^#][A-Za-z0-9_]+)=(.*)$') {
      $k = $matches[1].Trim()
      $v = $matches[2].Trim('"')
      if ($k -in @('E2E_USER','E2E_PASS','E2E_USER_EMAIL','E2E_USER_NAME')) {
        Write-Host "Setting env $k from .env.local"
        [System.Environment]::SetEnvironmentVariable($k, $v, 'Process')
      }
    }
  }
} else {
  Write-Warning "No frontend/.env.local found; ensure E2E credentials are available via env vars"
}
Write-Host "Running Playwright LIVE with user:" $env:E2E_USER
.\node_modules\.bin\playwright.cmd test --reporter=list 2>&1 | Tee-Object ..\playwright-live.log
Pop-Location
Write-Host "Playwright LIVE run complete. Log: playwright-live.log"