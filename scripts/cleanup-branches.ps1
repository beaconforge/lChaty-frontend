# Cleanup script for branches in a git repo
# - Fetches all remotes and prunes
# - Creates a local backup of `main` named main-backup-<timestamp>
# - For each remote branch (origin/* except main/HEAD):
#   - If merged into origin/main: delete remote branch and local branch
#   - Else: attempt to merge origin/<branch> into local main
#       - If merge succeeds: push main, delete remote branch
#       - If merge fails (conflict): abort merge, create a local snapshot branch unmerged/<branch>-backup from origin/<branch> and push snapshot

param()

function Invoke-Git {
    param([string]$cmd)
    Write-Host "-> git $cmd"
    # Split the command string into arguments so PowerShell calls git with separate args
    $args = $cmd -split ' '
    & git @args
    return $LASTEXITCODE
}

try {
    Write-Host "Starting branch cleanup: $(Get-Date -Format o)"

    # Ensure we're in repository root
    $repoRoot = (git rev-parse --show-toplevel) 2>$null
    if (-not $repoRoot) { throw "Not inside a git repository" }
    Set-Location $repoRoot

    # Fetch and prune
    Write-Host "Fetching and pruning remotes..."
    if (Invoke-Git 'fetch --all --prune' -ne 0) { Write-Host 'Warning: git fetch failed or returned non-zero' }

    # Create a local backup of main
    $ts = Get-Date -Format 'yyyyMMdd-HHmmss'
    $backup = "main-backup-$ts"
    Write-Host "Creating local backup branch '$backup' from main (if main exists)..."
    # Ensure main exists locally; if not, create from origin/main
    # Check if local main exists. git show-ref --verify returns exit code 0 when found
    Invoke-Git 'show-ref --verify --quiet refs/heads/main' | Out-Null
    if ($LASTEXITCODE -ne 0) {
        # main doesn't exist locally; create from origin/main
        Write-Host "Local branch 'main' not found. Creating from 'origin/main'..."
        if (Invoke-Git 'checkout -b main origin/main' -ne 0) { throw 'Failed to create local main from origin/main' }
    } else {
        Invoke-Git 'checkout main' | Out-Null
        Invoke-Git 'pull --ff-only origin main' | Out-Null
    }

    if (Invoke-Git "branch -f $backup main" -ne 0) { throw "Failed to create backup branch $backup" }
    # Try to push backup branch (best-effort)
    Write-Host "Pushing backup branch to origin (best-effort)..."
    & git push origin $backup 2>&1 | ForEach-Object { Write-Host $_ }

    $results = [System.Collections.ArrayList]::new()

    # Get remote branches from origin, only include refs that look like 'origin/<branch>' and exclude HEAD and main
    $remoteBranches = & git for-each-ref --format '%(refname:short)' refs/remotes/origin | Where-Object { $_ -match '^origin/.+' -and $_ -notmatch 'HEAD$' -and $_ -notmatch '^origin/main$' }

    if (-not $remoteBranches) { Write-Host "No remote branches found to process."; exit 0 }

    foreach ($r in $remoteBranches) {
        $branch = $r -replace '^origin/',''
        Write-Host "\nProcessing remote branch: $branch"

        # Check if branch already merged into origin/main
        $mergedList = & git branch --remote --merged origin/main | ForEach-Object { $_.Trim() }
        $isMerged = $mergedList -contains "origin/$branch"

        if ($isMerged) {
            Write-Host "Branch 'origin/$branch' is already merged into origin/main -> deleting remote and local copies"
            $res = @{ branch = $branch; action = 'deleted (merged)'; details = '' }
            # Delete remote branch
            $exit = Invoke-Git "push origin --delete $branch"
            if ($exit -ne 0) { $res.details = 'failed to delete remote (push origin --delete)'; Write-Host $res.details }
            # Delete local branch if exists
            # Delete local branch if exists
            Invoke-Git "show-ref --verify --quiet refs/heads/$branch" | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Invoke-Git "branch -D $branch" | Out-Null
            }
            $results.Add($res) | Out-Null
            continue
        }

        # Not merged: attempt to merge into local main
        Write-Host "Attempting to merge 'origin/$branch' into local main (fast path)."
    Invoke-Git 'checkout main' | Out-Null
    Invoke-Git 'pull --ff-only origin main' | Out-Null

    $mergeExit = Invoke-Git "merge --no-ff --no-edit origin/$branch"
        if ($mergeExit -eq 0) {
            Write-Host "Merge succeeded: origin/$branch -> main. Pushing main and deleting remote branch."
            $res = @{ branch = $branch; action = 'merged into main'; details = '' }
            & git push origin main 2>&1 | ForEach-Object { Write-Host $_ }
            # delete remote branch
            if (Invoke-Git "push origin --delete $branch" -ne 0) { $res.details = 'failed to delete remote after merge' }
            # delete local branch if exists
            Invoke-Git "show-ref --verify --quiet refs/heads/$branch" | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Invoke-Git "branch -D $branch" | Out-Null
            }
            $results.Add($res) | Out-Null
            continue
        } else {
            Write-Host "Merge failed (likely conflicts) for origin/$branch. Aborting merge and creating a snapshot backup branch."
            # Abort merge
            & git merge --abort 2>$null
            # Create snapshot branch from origin/$branch
            $snapshot = "unmerged/$branch-backup-$ts"
            if (Invoke-Git "branch -f $snapshot origin/$branch" -ne 0) { Write-Host "Failed to create snapshot branch $snapshot" }
            # Try pushing snapshot (best-effort)
            & git push origin $snapshot 2>&1 | ForEach-Object { Write-Host $_ }
            $res = @{ branch = $branch; action = 'conflict - snapshot created'; details = $snapshot }
            $results.Add($res) | Out-Null
            continue
        }
    }

    Write-Host "\nCleanup summary:\n"
    foreach ($r in $results) {
        Write-Host ("- {0}: {1} {2}" -f $r.branch, $r.action, $r.details)
    }

    Write-Host "\nAll done. Final local branch list:"
    & git branch --list | ForEach-Object { Write-Host $_ }

    Write-Host "\nReminder: Review 'unmerged/*' snapshot branches for conflict resolution. If everything looks good, you can delete the backup branch '$backup' when no longer needed."

} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}

exit 0
