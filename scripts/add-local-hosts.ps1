<#
.SYNOPSIS
  Adds local hosts file entries for the development hostnames used by tests and the dev server.

.DESCRIPTION
  This script makes a timestamped backup of the Windows hosts file and ensures the
  following entries exist:

    127.0.0.1 local.lchaty.com
    127.0.0.1 local.admin.lchaty.com
    ::1       local.lchaty.com
    ::1       local.admin.lchaty.com

  It then flushes the DNS cache. Run this script as Administrator. The script is
  idempotent and will not duplicate existing lines.

.EXAMPLE
  # Run from repo root in an elevated PowerShell prompt:
  Set-Location D:\Chat\lChaty-frontend
  .\scripts\add-local-hosts.ps1
#>

[CmdletBinding()]
param()

try {
  $hostsPath = Join-Path $env:SystemRoot 'System32\drivers\etc\hosts'
  if (-not (Test-Path $hostsPath)) { throw "Hosts file not found: $hostsPath" }

  $timestamp = Get-Date -Format 'yyyyMMddHHmmss'
  $backupPath = "$hostsPath.backup.$timestamp"
  Write-Host "Backing up hosts file to: $backupPath" -ForegroundColor Cyan
  Copy-Item -Path $hostsPath -Destination $backupPath -Force

  $entries = @(
    '127.0.0.1 local.lchaty.com',
    '127.0.0.1 local.admin.lchaty.com',
    '::1 local.lchaty.com',
    '::1 local.admin.lchaty.com'
  )

  $current = Get-Content -Path $hostsPath -ErrorAction Stop

  foreach ($e in $entries) {
    if ($current -notcontains $e) {
      Add-Content -Path $hostsPath -Value $e
      Write-Host "Added hosts entry: $e" -ForegroundColor Green
    } else {
      Write-Host "Already present: $e" -ForegroundColor Yellow
    }
  }

  Write-Host 'Flushing DNS cache...' -ForegroundColor Cyan
  ipconfig /flushdns | Out-Null

  Write-Host 'Done. If your browser was open, consider restarting it to pick up the change.' -ForegroundColor Green
} catch {
  Write-Error "Failed to update hosts file: $_"
  exit 1
}
