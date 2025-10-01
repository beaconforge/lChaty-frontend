<#
Checks whether the inline guard is active by running the guard script in a subprocess.
Exits 0 if guard fails as expected when EXTERNAL_START is not set, otherwise exits 1.
#>
Write-Host "Checking inline guard (expect failure exit code when run inline)..."
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) { Write-Error "node is not available on PATH"; exit 2 }

$ps = Start-Process -FilePath 'node' -ArgumentList @('.\scripts\no-inline-guard.js') -NoNewWindow -PassThru -Wait -ErrorAction SilentlyContinue
if ($ps.ExitCode -eq 1) {
  Write-Host "Inline guard active (no EXTERNAL_START). ExitCode=1 as expected."
  exit 0
} else {
  Write-Error "Inline guard did not block execution (ExitCode=$($ps.ExitCode))."
  exit 1
}
