# Wrapper to set environment and run the debug Playwright test
$env:PLAYWRIGHT_BASE_URL='https://local.lchaty.com:5173'
$env:PLAYWRIGHT_ADMIN_BASE_URL='https://local.admin.lchaty.com:5173'
$env:SKIP_START='1'
$env:MAP_LOCAL_HOSTS='1'

Write-Host 'Starting debug Playwright test (headed)'
npx playwright test tests\\debug.client-login.spec.ts -c playwright.config.ts --reporter=list --headed --workers=1
exit $LASTEXITCODE
