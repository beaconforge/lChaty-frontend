param(
  [string]$OutDir = './certs',
  [string]$PfxPassword = 'changeit',
  [string[]]$DnsNames = @('local.lchaty.com','local.admin.lchaty.com'),
  [int]$ValidYears = 2
)

# Ensure output directory exists
if (-not (Test-Path -Path $OutDir)) { New-Item -ItemType Directory -Path $OutDir | Out-Null }

$pfxPath = Join-Path -Path $OutDir -ChildPath 'local.lchaty.com.pfx'
$crtPath = Join-Path -Path $OutDir -ChildPath 'local.lchaty.com.crt.pem'

Write-Host "Creating self-signed certificate for: $($DnsNames -join ', ')"

# Create certificate in the CurrentUser store (avoids requiring elevation)
$cert = New-SelfSignedCertificate -Type SSLServerAuthentication -DnsName $DnsNames -CertStoreLocation Cert:\CurrentUser\My -NotAfter (Get-Date).AddYears($ValidYears) -KeyUsage DigitalSignature,KeyEncipherment -FriendlyName 'lChaty Dev Cert'

if (-not $cert) { Write-Error 'Certificate creation failed'; exit 1 }

Write-Host "Exporting PFX to $pfxPath"
Export-PfxCertificate -Cert $cert -FilePath $pfxPath -Password (ConvertTo-SecureString -String $PfxPassword -AsPlainText -Force) -Force

# Export a PEM certificate (public only)
Export-Certificate -Cert $cert -FilePath $crtPath -Force | Out-Null

# If OpenSSL exists, export private key + cert to PEM files for Node/Vite
$openssl = (Get-Command openssl -ErrorAction SilentlyContinue)
if ($openssl) {
  Write-Host 'OpenSSL found — extracting PEM private key and cert'
  & openssl pkcs12 -in $pfxPath -nocerts -nodes -passin pass:$PfxPassword -out (Join-Path $OutDir 'local.lchaty.com.key.pem')
  & openssl pkcs12 -in $pfxPath -clcerts -nokeys -passin pass:$PfxPassword -out (Join-Path $OutDir 'local.lchaty.com.crt.pem')
  Write-Host 'Wrote PEM files to certs/'
} else {
  Write-Host 'OpenSSL not found — PFX and public cert written to certs/. If you need PEM, install OpenSSL or export manually.'
}

Write-Host "Certificate generated in CurrentUser store. PFX: $pfxPath. You may want to add the public cert ($crtPath) to your Trusted Root Certification Authorities (CurrentUser) to avoid browser warnings."
