param(
  [string]$OutDir = '.\certs',
  [string]$PfxName = 'local.lchaty.com.pfx',
  [string]$Password = 'devpassword'
)

if (-not (Test-Path $OutDir)) { New-Item -ItemType Directory -Path $OutDir | Out-Null }

$securePwd = ConvertTo-SecureString -String $Password -AsPlainText -Force

Write-Host "Creating self-signed certificate for local.lchaty.com and local.admin.lchaty.com"
$cert = New-SelfSignedCertificate -DnsName @('local.lchaty.com','local.admin.lchaty.com') -CertStoreLocation Cert:\CurrentUser\My -FriendlyName 'lChaty Dev Cert' -NotAfter (Get-Date).AddYears(2) -KeyUsage DigitalSignature, KeyEncipherment -Type SSLServerAuthentication
if (-not $cert) { Write-Error 'Certificate creation failed'; exit 1 }

$pfxPath = Join-Path $OutDir $PfxName
Export-PfxCertificate -Cert $cert -FilePath $pfxPath -Password $securePwd -Force
Write-Host "Exported PFX to: $pfxPath"

# Export public cert too
$cerPath = Join-Path $OutDir 'local.lchaty.com.cer'
Export-Certificate -Cert $cert -FilePath $cerPath -Force | Out-Null
Write-Host "Exported CER to: $cerPath"
