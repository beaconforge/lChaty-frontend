param(
  [switch]$TrustCert,
  [switch]$Elevate
)

function Test-IsAdministrator {
  try {
    $current = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($current)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
  } catch {
    return $false
  }
}

Write-Host "This helper will ensure hosts entries exist for local.lchaty.com and local.admin.lchaty.com"
Write-Host "It may require Administrator privileges to modify the hosts file or to trust a certificate system-wide." -ForegroundColor Yellow

try {
  & (Join-Path $PSScriptRoot 'setup-hosts-and-proxy.ps1') -Action Add -ListenPort 5173 -TargetPort 5173 -Verbose
} catch {
  Write-Error "Failed to run setup-hosts-and-proxy.ps1: $_"
  exit 1
}

if ($TrustCert) {
  $isAdmin = Test-IsAdministrator
  if ($Elevate -and -not $isAdmin) {
    Write-Host "Relaunching this script elevated to perform certificate trust operations..."
    $scriptPath = $PSCommandPath
    $argList = "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`" -TrustCert -Elevate"
    Start-Process -FilePath (Get-Command powershell).Source -ArgumentList $argList -Verb RunAs
    Write-Host "Elevated process started. Exiting current process."
    exit 0
  }

  if (-not $isAdmin) {
    Write-Warning "Not running as Administrator. Trusting the certificate system-wide may fail."
    Write-Host "You can re-run this command from an elevated PowerShell to avoid issues:" -ForegroundColor Yellow
    Write-Host "  Start-Process powershell -Verb RunAs -ArgumentList '-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`" -TrustCert -Elevate'" -ForegroundColor Yellow
    Write-Host "Attempting to run the trust step anyway (will add to CurrentUser\Root if possible)..."
  } else {
    Write-Host "Running trust step as Administrator (will attempt to add cert to Trusted Root)."
  }

  try {
    & (Join-Path $PSScriptRoot 'trust-and-export-cert.ps1')
  } catch {
    Write-Warning "trust-and-export-cert.ps1 failed: $_"
    Write-Host "If this failed due to insufficient privileges, re-run the command elevated as shown above."
  }
}

Write-Host "Done. Hosts entries should be present and (optionally) the dev cert trusted." 
Write-Host "Hosts lines added:"
Write-Host "127.0.0.1    local.lchaty.com"
Write-Host "127.0.0.1    local.admin.lchaty.com"
