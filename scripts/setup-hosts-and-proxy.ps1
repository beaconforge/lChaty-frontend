<#
.SYNOPSIS
  Add/remove hosts entries and optional portproxy + firewall rule for dev.

.DESCRIPTION
  Idempotent: will add entries only if missing. When run with -Action Add it
  will back up hosts and add the given hostnames. It can also add a portproxy
  and firewall rule. Run this in an elevated PowerShell session.
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('Add','Remove')]
    [string]$Action = 'Add',

    [string[]]$Hostnames = @('local.lchaty.com','local.admin.lchaty.com'),
    [int]$ListenPort = 5173,
    [int]$TargetPort = 5173,
    [switch]$NoProxy
)

function Assert-Admin {
    $isAdmin = (New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    if (-not $isAdmin) {
        Write-Error "This script must be run as Administrator. Please re-run in an elevated PowerShell."
        exit 1
    }
}

Assert-Admin

$hostsPath = Join-Path -Path $env:WinDir -ChildPath 'System32\drivers\etc\hosts'
if (-not (Test-Path $hostsPath)) { Write-Error "Hosts file not found: $hostsPath"; exit 2 }

$backupPath = "${hostsPath}.lchaty.bak.$((Get-Date).ToString('yyyyMMddHHmmss'))"

if ($Action -eq 'Add') {
    Write-Output "Backing up hosts file to: $backupPath"
    Copy-Item -Path $hostsPath -Destination $backupPath -Force

    $hostsContent = Get-Content -Path $hostsPath -ErrorAction Stop
    foreach ($h in $Hostnames) {
        # Use a regex word-boundary match to avoid partial matches
        if ($hostsContent -notmatch "\b$h\b") {
            Write-Output "Adding hosts entry for $h"
            Add-Content -Path $hostsPath -Value "127.0.0.1`t$h"
        } else {
            Write-Output "Hosts file already contains entry for $h"
        }
    }

    if (-not $NoProxy) {
        $existing = netsh interface portproxy show all 2>$null | Out-String
        $ruleSignature = "Listen on IPv4: 127.0.0.1:$ListenPort"
        if ($existing -notmatch [regex]::Escape($ruleSignature)) {
            Write-Output "Adding port proxy 127.0.0.1:$ListenPort -> 127.0.0.1:$TargetPort"
            netsh interface portproxy add v4tov4 listenaddress=127.0.0.1 listenport=$ListenPort connectaddress=127.0.0.1 connectport=$TargetPort
        } else {
            Write-Output "Port proxy for 127.0.0.1:$ListenPort already exists"
        }

        $ruleName = "lChaty-Dev-Listen-$ListenPort"
        $fw = netsh advfirewall firewall show rule name="$ruleName" 2>$null | Out-String
        if ($fw -match 'No rules match' -or -not $fw) {
            Write-Output "Adding firewall rule to allow TCP port $ListenPort"
            netsh advfirewall firewall add rule name="$ruleName" dir=in action=allow protocol=TCP localport=$ListenPort
        } else {
            Write-Output "Firewall rule $ruleName already exists"
        }
    }

    Write-Output "Done. You can now open https://local.lchaty.com:$ListenPort and https://local.admin.lchaty.com:$ListenPort"
    exit 0
}

if ($Action -eq 'Remove') {
    Write-Output "Backing up hosts file to: $backupPath"
    Copy-Item -Path $hostsPath -Destination $backupPath -Force

    $hostsContent = Get-Content -Path $hostsPath -ErrorAction Stop
    $filtered = $hostsContent | Where-Object { $line = $_; -not ($Hostnames | ForEach-Object { $line -match "\b$_\b" }) }
    Set-Content -Path $hostsPath -Value $filtered

    Write-Output "Removing port proxy listen 127.0.0.1:$ListenPort (if present)"
    netsh interface portproxy delete v4tov4 listenaddress=127.0.0.1 listenport=$ListenPort 2>$null

    $ruleName = "lChaty-Dev-Listen-$ListenPort"
    Write-Output "Removing firewall rule $ruleName (if present)"
    netsh advfirewall firewall delete rule name="$ruleName" protocol=TCP localport=$ListenPort 2>$null

    Write-Output "Done. Hosts entries and rules removed where applicable."
    exit 0
}
