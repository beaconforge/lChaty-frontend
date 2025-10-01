param(
  [Parameter(Mandatory=$true)] [string]$PfxPath,
  [string]$OutDir = './certs',
  [string]$Password = 'changeit'
)

if (-not (Test-Path $PfxPath)) { throw "PFX not found: $PfxPath" }
New-Item -ItemType Directory -Path $OutDir -Force | Out-Null

$certPem = Join-Path $OutDir 'local.lchaty.com.pem'
$keyPem = Join-Path $OutDir 'local.lchaty.com-key.pem'

Write-Host "Converting $PfxPath -> $certPem + $keyPem"

$pwdArg = "-passin pass:$Password"

# Extract cert
& openssl pkcs12 -in $PfxPath -clcerts -nokeys -out $certPem -passin pass:$Password
if ($LASTEXITCODE -ne 0) { throw "OpenSSL command failed extracting cert" }

# Extract key
& openssl pkcs12 -in $PfxPath -nocerts -nodes -out $keyPem -passin pass:$Password
if ($LASTEXITCODE -ne 0) { throw "OpenSSL command failed extracting key" }

Write-Host "Conversion complete: $certPem, $keyPem"
