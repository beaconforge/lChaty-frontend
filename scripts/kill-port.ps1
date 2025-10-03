<#
.SYNOPSIS
  Kill processes that are listening on a given TCP port.

.DESCRIPTION
  Finds any process IDs that own TCP listeners on the provided local port
  and attempts to stop them. Attempts Stop-Process first, then falls back to
  taskkill. Skips PID 0 and typical system PIDs.

.EXAMPLE
  .\kill-port.ps1 -Port 5173
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [int]$Port = 5173,
    [switch]$Force
)

function Write-Info($msg) { Write-Host "[INFO]  $msg" -ForegroundColor Cyan }
function Write-WarnMsg($msg) { Write-Host "[WARN]  $msg" -ForegroundColor Yellow }
function Write-Err($msg) { Write-Host "[ERROR] $msg" -ForegroundColor Red }

Write-Info "Looking for processes listening on port $Port..."

$conns = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
if (-not $conns) {
    Write-Info "No listeners found on port $Port. Nothing to do."
    exit 0
}

$listenerProcessIds = $conns | Select-Object -ExpandProperty OwningProcess -Unique | Where-Object { $_ -and $_ -ne 0 -and $_ -ne 4 }
if (-not $listenerProcessIds) {
    Write-Info "No valid process IDs found for port $Port."
    exit 0
}

Write-Info "Found PIDs: $($listenerProcessIds -join ', ')"

foreach ($listenerProcessId in $listenerProcessIds) {
    try {
        $proc = Get-Process -Id $listenerProcessId -ErrorAction Stop
        $cmdline = (Get-CimInstance Win32_Process -Filter "ProcessId = $listenerProcessId" | Select-Object -ExpandProperty CommandLine) -replace "\r|\n", ' '
    } catch {
        $proc = $null
        $cmdline = ''
    }

    if ($proc) {
        Write-Host "-- PID: $($proc.Id) Name: $($proc.ProcessName) Path: $($proc.Path) Started: $($proc.StartTime)" -ForegroundColor Green
        if ($cmdline) { Write-Host "   Cmd: $cmdline" -ForegroundColor DarkGray }
    } else {
        Write-WarnMsg "PID $listenerProcessId not found via Get-Process; will still attempt to terminate."
    }

    if (-not $Force) {
        $yn = Read-Host "Terminate PID $listenerProcessId? (y/N)"
        if ($yn -notin @('y','Y','yes','Yes')) { Write-Info "Skipping PID $listenerProcessId"; continue }
    }

    Write-Info "Attempting Stop-Process -Id $listenerProcessId"
    try {
        Stop-Process -Id $listenerProcessId -Force -ErrorAction Stop
        Write-Info "Stop-Process succeeded for PID $listenerProcessId"
    } catch {
        $errMsg = $_.Exception.Message
        Write-WarnMsg ("Stop-Process failed for PID {0}: {1}. Trying taskkill..." -f $listenerProcessId, $errMsg)
        try {
            & taskkill /PID $listenerProcessId /F | Out-Null
            Write-Info "taskkill succeeded for PID $listenerProcessId"
        } catch {
            $errMsg2 = $_.Exception.Message
            Write-Err ("Failed to terminate PID {0}: {1}" -f $listenerProcessId, $errMsg2)
        }
    }
}

Start-Sleep -Seconds 1
$still = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
if ($still) {
    # If only TIME_WAIT entries remain, consider the port free for our purposes
    $nonTimewait = $still | Where-Object { $_.State -ne 'TimeWait' }
    if ($nonTimewait -and $nonTimewait.Count -gt 0) {
        Write-WarnMsg "Port $Port still has listeners after attempted termination."
        $nonTimewait | Format-Table -AutoSize
        exit 1
    } else {
        Write-Info "Only TIME_WAIT entries remain on port $Port; treating as free."
        exit 0
    }
} else {
    Write-Info "Port $Port is now free."
    exit 0
}
