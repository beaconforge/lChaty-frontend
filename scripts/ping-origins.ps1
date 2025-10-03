param(
  [int]$TimeoutSec = 120
)

# Poll the two required origins until they respond with HTTP 200 or timeout
$urls = @(
  'https://local.lchaty.com:5173',
  'https://local.admin.lchaty.com:5173'
)

[void][System.Net.ServicePointManager]::AddServerCertificateValidationCallback({$true})

$start = Get-Date
Write-Host "Pinging origins for up to $TimeoutSec seconds..."
while ($true) {
  $results = @()
  foreach ($u in $urls) {
    try {
      $req = [System.Net.WebRequest]::Create($u)
      $req.Timeout = 10000
      $resp = $req.GetResponse()
      $code = 200
      $resp.Close()
      $results += $true
    } catch {
      $results += $false
    }
  }
  if ($results -notcontains $false) {
    Write-Host "All origins reachable"
    exit 0
  }
  if ((Get-Date) - $start -gt [TimeSpan]::FromSeconds($TimeoutSec)) {
    Write-Error "Timeout waiting for origins after $TimeoutSec seconds"
    exit 1
  }
  Start-Sleep -Seconds 2
}
