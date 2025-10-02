param(
  [Parameter(Mandatory=$true)] [string]$PfxPath,
  [string]$OutDir = './certs',
  [string]$Password = 'changeit',
  [switch]$Approved = $false
)

# -----------------------------------------------------------------------------
# CERTIFICATE & SECURITY POLICY
# -----------------------------------------------------------------------------
# IMPORTANT: Do NOT run this conversion or modify certificate files without
# explicit written approval from the project owner. Any action that alters
# certificates or private keys must be tracked and executed by an authorized
# administrator. See ../docs/CERT_POLICY_SNIPPET.md for details.
# -----------------------------------------------------------------------------

# Require explicit approval via environment variable or -Approved switch

if (-not $Approved -and $env:CERT_OP_APPROVED -ne '1') {
  Write-Error "[SECURITY] Certificate conversion is guarded. Provide -Approved or set CERT_OP_APPROVED=1 in the environment after explicit approval. Aborting."
  exit 2
}

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
