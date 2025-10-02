param(
  [int]$Port = 5173,
  [switch]$Https,
  [switch]$ForceHttp,
  [int]$TimeoutSec = 120
)

# start-vite.ps1
# Detached launcher: opens a new terminal window and runs the frontend dev server there.
# The child process receives EXTERNAL_START=1 so in-repo guards allow it to run.

Set-StrictMode -Version Latest

try {
  $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
} catch {
  $scriptDir = Get-Location
}

$rootPath = Join-Path $scriptDir '..'
try {
  $frontend = (Resolve-Path $rootPath -ErrorAction Stop).Path
} catch {
  # Fallback: use the raw path
  $frontend = $rootPath
}

# Build vite flags
$flags = @('--port', [string]$Port)
if ($Https) { $flags += '--https' }
$flagStr = $flags -join ' '

# Child command: set EXTERNAL_START and optionally FORCE_HTTP, then run the dev script from the frontend folder
$childCmd = "`$env:EXTERNAL_START='1';"
if ($ForceHttp) { $childCmd += " `$env:FORCE_HTTP='1';" }
$childCmd += " if (-not `$env:DEV_CERT_PASSPHRASE) { `$env:DEV_CERT_PASSPHRASE='changeit' };"
$childCmd += " Set-Location -Path `"$frontend`"; npm run dev -- $flagStr"

Write-Host "Launching dev server (detached) -> $frontend"

# Prefer Windows Terminal (wt)
$wt = Get-Command wt -ErrorAction SilentlyContinue
if ($wt) {
  Start-Process wt -ArgumentList @('new-tab','powershell','-NoExit','-NoProfile','-Command', $childCmd) -WorkingDirectory $frontend -WindowStyle Normal
  Write-Host "Spawned dev server in Windows Terminal (detached)."
  exit 0
}

# Fallback: powershell.exe
try {
  $psArgs = @('-NoExit','-NoProfile','-Command', $childCmd)
  Start-Process -FilePath 'powershell.exe' -ArgumentList $psArgs -WorkingDirectory $frontend -WindowStyle Normal
  Write-Host "Spawned dev server in PowerShell (detached)."
  exit 0
} catch {
  Write-Warning "powershell Start-Process failed, trying cmd.exe fallback..."
}

# Last-resort: cmd.exe (set env, cd, run)
try {
  $cmdLine = "set EXTERNAL_START=1 && cd /d `"$frontend`" && npm run dev -- $flagStr"
  Start-Process -FilePath 'cmd.exe' -ArgumentList '/c', $cmdLine -WorkingDirectory $frontend -WindowStyle Normal
  Write-Host "Spawned dev server in cmd (detached)."
  exit 0
} catch {
  Write-Error "Failed to spawn detached dev server: $_"
  exit 1
}

# Launch a background job to watch for a ready message in the vite log produced by the child process.
# This gives the caller a clear error if the server doesn't come up within TimeoutSec.
$logsDir = Join-Path $scriptDir '..\logs'
$logPath = Join-Path $logsDir 'vite.log'
if (-not (Test-Path $logsDir)) { New-Item -ItemType Directory -Path $logsDir -Force | Out-Null }

$tmpDir = Join-Path $scriptDir '..\tmp'
if (-not (Test-Path $tmpDir)) { New-Item -ItemType Directory -Path $tmpDir -Force | Out-Null }

Write-Host "Vite logs will be written to: $logPath"
Write-Host "Vite info will be written to: $($tmpDir)\vite.info.json"

Start-Job -ScriptBlock {
  param($logPath, $timeoutSec)
  $start = Get-Date
  while ((Get-Date) - $start -lt [TimeSpan]::FromSeconds($timeoutSec)) {
    if (Test-Path $logPath) {
      try {
        $content = Get-Content $logPath -Raw -ErrorAction SilentlyContinue
        if ($content -match 'Local:|ready in|Vite server running|Localhost|Network:') {
          Write-Host "Dev server ready (log contains ready message)."
          # Extract URL-like strings and write to info file
          $matches = [System.Text.RegularExpressions.Regex]::Matches($content, '(https?:\/\/[-A-Za-z0-9._:\/]+)') | ForEach-Object { $_.Value } | Select-Object -Unique
          $info = @{ detected = $matches }
          $infoPath = Join-Path $tmpDir 'vite.info.json'
          try { $info | ConvertTo-Json -Depth 3 | Out-File -FilePath $infoPath -Encoding utf8 } catch {}
          if ($matches.Count -gt 0) { Write-Host "Detected URLs: $($matches -join ', ')" }
          return
        }
      } catch { }
    }
    Start-Sleep -Seconds 1
  }
  Write-Error "Dev server did not become ready within $timeoutSec seconds. Check log: $logPath"
} -ArgumentList $logPath, $TimeoutSec | Out-Null
