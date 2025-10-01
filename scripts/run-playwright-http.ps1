Push-Location frontend
$env:SKIP_START = '1'
$env:LOCAL_BASEURL = 'http://local.lchaty.com:5173'
$env:ADMIN_BASEURL = 'http://local.lchaty.com:5173'
Write-Host "Running Playwright with LOCAL_BASEURL=$env:LOCAL_BASEURL and ADMIN_BASEURL=$env:ADMIN_BASEURL"
# Run Playwright tests and tee output to repo root
.\node_modules\.bin\playwright.cmd test --reporter=list 2>&1 | Tee-Object ..\playwright-http-final.log
Pop-Location
Write-Host "Playwright run complete. Log: playwright-http-final.log"