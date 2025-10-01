<#
.SYNOPSIS
  Trust the generated lChaty Dev Cert and export the public cert to PEM.

.DESCRIPTION
  Finds the certificate with FriendlyName 'lChaty Dev Cert' in CurrentUser\My,
  adds it to CurrentUser\Root (Trusted Root), and writes a PEM copy to ./certs.

  Run this in an elevated PowerShell session if you want the certificate to be trusted system-wide.
#>

try {
    $cert = Get-ChildItem Cert:\CurrentUser\My | Where-Object { $_.FriendlyName -eq 'lChaty Dev Cert' } | Select-Object -First 1
} catch {
    Write-Error "Failed to query certificate store: $_"
    exit 1
}

if (-not $cert) {
    Write-Error "Certificate with FriendlyName 'lChaty Dev Cert' not found in CurrentUser\\My. Run generate-dev-certs.ps1 first."
    exit 1
}

Write-Output "Found cert: $($cert.Subject) Thumbprint: $($cert.Thumbprint)"

# Add to CurrentUser\Root
try {
    $root = New-Object System.Security.Cryptography.X509Certificates.X509Store('Root','CurrentUser')
    $root.Open('ReadWrite')
    $root.Add($cert)
    $root.Close()
    Write-Output "Certificate added to CurrentUser\Root (Trusted Root)"
} catch {
    Write-Warning "Could not add certificate to CurrentUser\\Root: $_"
}

# Export public certificate (DER) and write as PEM
if (-not (Test-Path -Path .\certs)) { New-Item -ItemType Directory -Path .\certs | Out-Null }
$cerPath = Join-Path -Path (Resolve-Path .\certs).Path -ChildPath 'local.lchaty.com.cer'
$pemPath = Join-Path -Path (Resolve-Path .\certs).Path -ChildPath 'local.lchaty.com.crt.pem'

Export-Certificate -Cert $cert -FilePath $cerPath -Force | Out-Null

# Convert DER -> base64 PEM
$bytes = [System.IO.File]::ReadAllBytes($cerPath)
$base64 = [System.Convert]::ToBase64String($bytes)
# Insert line breaks every 64 characters
$wrapped = ($base64 -split '(.{1,64})' | Where-Object { $_ -ne '' }) -join "`n"
$pem = "-----BEGIN CERTIFICATE-----`n$wrapped`n-----END CERTIFICATE-----"
Set-Content -Path $pemPath -Value $pem -Encoding ascii

Write-Output "Exported PEM to: $pemPath"

Write-Output "Files in ./certs:"
Get-ChildItem -Path .\certs | Select-Object Name,FullName
