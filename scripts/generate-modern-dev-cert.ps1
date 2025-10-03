param(
  [string]$DnsName = 'local.lchaty.com',
  [string]$FriendlyName = 'lChaty Dev Cert v2',
  [int]$KeyLength = 4096
)

Write-Host "Generating self-signed certificate for $DnsName (RSA $KeyLength)"

try {
  $cert = New-SelfSignedCertificate -DnsName $DnsName -CertStoreLocation Cert:\CurrentUser\My -FriendlyName $FriendlyName -KeyAlgorithm RSA -KeyLength $KeyLength -NotAfter (Get-Date).AddYears(5) -TextExtension @('2.5.29.37={text}1.3.6.1.5.5.7.3.1')
  Write-Host "Created cert thumbprint:" $cert.Thumbprint
} catch {
  Write-Error "Failed to create cert: $_"
  exit 1
}

try {
  $root = New-Object System.Security.Cryptography.X509Certificates.X509Store('Root','CurrentUser')
  $root.Open('ReadWrite')
  $root.Add($cert)
  $root.Close()
  Write-Host "Added cert to CurrentUser\Root (Trusted Root)" -ForegroundColor Green
} catch {
  Write-Warning "Could not add to CurrentUser\Root: $_"
}

$outDir = Join-Path (Get-Location) 'certs'
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }
$pfxPath = Join-Path $outDir 'local.lchaty.com.v2.pfx'
$pemPath = Join-Path $outDir 'local.lchaty.com.v2.pem'
$keyPath = Join-Path $outDir 'local.lchaty.com.v2-key.pem'

$pwd = ConvertTo-SecureString -String 'devpass' -Force -AsPlainText
try {
  Export-PfxCertificate -Cert $cert -FilePath $pfxPath -Password $pwd -Force
  Write-Host "Exported PFX to: $pfxPath"
} catch {
  Write-Warning "Failed to export PFX: $_"
}

# Export DER cert -> PEM
try {
  $raw = (Get-PfxData -FilePath $pfxPath -Password $pwd).EndEntityCertificates[0].RawData
  $b64 = [System.Convert]::ToBase64String($raw)
  $wrapped = ($b64 -split '(.{1,64})' | Where-Object { $_ -ne '' }) -join "`n"
  $pem = "-----BEGIN CERTIFICATE-----`n$wrapped`n-----END CERTIFICATE-----"
  Set-Content -Path $pemPath -Value $pem -Encoding ascii
  Write-Host "Exported PEM to: $pemPath"
} catch {
  Write-Warning "Failed to export PEM: $_"
}

Write-Host "Done. You can now point Vite to the PEM/PFX via DEV_CERT_PATH and DEV_KEY_PATH environment variables."
Write-Host "Example: powershell -NoProfile -ExecutionPolicy Bypass -Command \"$env:DEV_CERT_PATH='$(Resolve-Path $pemPath)'; $env:DEV_KEY_PATH='$(Resolve-Path $pfxPath)'; .\\scripts\\start-and-ensure.ps1 -Port 5173 -Https -Force\""
