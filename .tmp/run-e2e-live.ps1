try {
    # .tmp is under the repo root; frontend/.env.local is one level up from here
    $envFile = Join-Path (Join-Path $PSScriptRoot '..') 'frontend\.env.local'
    if (-Not (Test-Path $envFile)) {
        Write-Error ".env.local not found at $envFile"
        exit 2
    }

    Get-Content $envFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -eq '' -or $line.StartsWith('#')) { return }
        $idx = $line.IndexOf('=')
        if ($idx -lt 0) { return }
        $k = $line.Substring(0,$idx).Trim()
        $v = $line.Substring($idx+1).Trim()
        if ($v.StartsWith('"') -and $v.EndsWith('"')) { $v = $v.Substring(1,$v.Length-2) }
        Set-Item -Path Env:\$k -Value $v
    }

    $env:PLAYWRIGHT_BASE_URL='https://local.lchaty.com:5173'
    $env:PLAYWRIGHT_ADMIN_BASE_URL='https://local.admin.lchaty.com:5173'
    $env:SKIP_START='1'
    $env:MAP_LOCAL_HOSTS='1'
    $env:E2E_MODE='LIVE'

    Write-Host "Starting Playwright LIVE run (credentials loaded from frontend\.env.local)."

    # Run only the login e2e tests
    npx playwright test tests/e2e.login.spec.ts -c playwright.config.ts --reporter=list
    exit $LASTEXITCODE
} catch {
    Write-Error "Runner failed: $($_.Exception.Message)"
    exit 3
}
