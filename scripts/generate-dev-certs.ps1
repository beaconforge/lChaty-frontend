param(
  [string]$OutDir = './certs',
  [string]$PfxName = 'local.lchaty.com.pfx',
  [switch]$Force
)

New-Item -ItemType Directory -Path $OutDir -Force | Out-Null
$pfxPath = Join-Path $OutDir $PfxName

# Create self-signed cert with SANs local.lchaty.com and local.admin.lchaty.com
$san = @('DNS=local.lchaty.com','DNS=local.admin.lchaty.com') -join '&'

Write-Host "Creating self-signed certificate with SANs..."
$cert = New-SelfSignedCertificate -Subject 'CN=local.lchaty.com' -DnsName @('local.lchaty.com','local.admin.lchaty.com') -CertStoreLocation 'Cert:\LocalMachine\My' -NotAfter (Get-Date).AddYears(2)

if (-not $cert) { throw "Certificate creation failed" }

# Export to PFX
$securePwd = ConvertTo-SecureString -String 'changeit' -Force -AsPlainText
Export-PfxCertificate -Cert $cert -FilePath $pfxPath -Password $securePwd -Force:$Force

Write-Host "Exported PFX to $pfxPath"

# Trust the cert in LocalMachine Root
Write-Host "Trusting certificate locally (LocalMachine Trusted Root)..."
$root = Get-Item Cert:\LocalMachine\Root
Export-Certificate -Cert $cert -FilePath (Join-Path $OutDir 'local.lchaty.com.cer') -Force
Import-Certificate -FilePath (Join-Path $OutDir 'local.lchaty.com.cer') -CertStoreLocation Cert:\LocalMachine\Root | Out-Null

Write-Host "Certificate generated and trusted. PFX password is 'changeit'. Use convert-pfx-to-pem.ps1 to extract PEM files."
<#
.SYNOPSIS
  Generate a self-signed certificate for local development and export it to files.

.DESCRIPTION
  Creates a self-signed certificate with SANs for `local.lchaty.com` and
  `local.admin.lchaty.com`, stores it in the Personal store, then exports a PFX
  and PEM files into the project's `certs` directory. If OpenSSL is available
  on PATH it will be used to convert formats.

.NOTE
  You should trust the generated certificate in Windows to avoid browser warnings.

EXAMPLE
  .\generate-dev-certs.ps1 -OutDir ..\certs -Password (ConvertTo-SecureString -String 'mypassword' -AsPlainText -Force)
#>

param(
    [string]$OutDir = "..\certs",
    [string]$PfxPassword = "devpassword",
    [string[]]$DnsNames = @('local.lchaty.com','local.admin.lchaty.com'),
    [int]$ValidYears = 5
)

if (-not (Test-Path -Path $OutDir)) { New-Item -ItemType Directory -Path $OutDir | Out-Null }

$subject = "CN=$($DnsNames[0])"

Write-Output "Creating self-signed certificate for: $($DnsNames -join ', ')"

$cert = New-SelfSignedCertificate -Type SSLServerAuthentication -DnsName $DnsNames -CertStoreLocation Cert:\CurrentUser\My -NotAfter (Get-Date).AddYears($ValidYears) -KeyUsage DigitalSignature, KeyEncipherment -FriendlyName "lChaty Dev Cert"

if (-not $cert) { Write-Error "Certificate creation failed"; exit 1 }

$pfxPath = Join-Path -Path $OutDir -ChildPath "local.lchaty.com.pfx"
Write-Output "Exporting PFX to $pfxPath"
Export-PfxCertificate -Cert $cert -FilePath $pfxPath -Password (ConvertTo-SecureString -String $PfxPassword -AsPlainText -Force) -Force

# Export cert and key to PEM using OpenSSL if available
$pemCert = Join-Path -Path $OutDir -ChildPath "local.lchaty.com.crt.pem"
$pemKey = Join-Path -Path $OutDir -ChildPath "local.lchaty.com.key.pem"

$openssl = (Get-Command openssl -ErrorAction SilentlyContinue)
if ($openssl) {
    Write-Output "OpenSSL found, converting PFX to PEM files"
    & openssl pkcs12 -in $pfxPath -nocerts -nodes -passin pass:$PfxPassword -out $pemKey
    & openssl pkcs12 -in $pfxPath -clcerts -nokeys -passin pass:$PfxPassword -out $pemCert
    Write-Output "PEM files written: $pemCert, $pemKey"
} else {
    Write-Output "OpenSSL not found. You can export PEM files manually or install OpenSSL. PFX is available at: $pfxPath"
}

Write-Output "Certificate generation complete. You may need to trust the certificate in Windows Certificate Manager (CurrentUser -> Personal -> Certificates)"
