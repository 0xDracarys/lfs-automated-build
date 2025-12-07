# ═══════════════════════════════════════════════════════════════
# REAL-TIME LFS BUILD MONITOR
# Use this to watch your build progress in real-time
# ═══════════════════════════════════════════════════════════════

param(
    [switch]$Continuous,
    [int]$RefreshSeconds = 30
)

function Show-BuildStatus {
    Clear-Host
    
    Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║           🔍 REAL-TIME LFS BUILD MONITOR                       ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan
    
    Write-Host "⏰ Last Updated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n" -ForegroundColor Gray
    
    # 1. Check current execution status
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
    Write-Host "📊 CURRENT EXECUTION STATUS" -ForegroundColor Yellow
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Yellow
    
    $execution = gcloud run jobs executions list --job=lfs-builder --region=us-central1 --project=alfs-bd1e0 --limit=1 --format=json | ConvertFrom-Json
    
    if ($execution) {
        $exec = $execution[0]
        $status = $exec.status.conditions | Where-Object { $_.type -eq "Completed" } | Select-Object -First 1
        
        Write-Host "  Execution:  $($exec.metadata.name)" -ForegroundColor White
        Write-Host "  Started:    $($exec.metadata.creationTimestamp)" -ForegroundColor White
        
        if ($status.status -eq "True") {
            Write-Host "  Status:     ✅ COMPLETED" -ForegroundColor Green
        } elseif ($status.status -eq "False") {
            Write-Host "  Status:     ❌ FAILED" -ForegroundColor Red
            Write-Host "  Reason:     $($status.reason)" -ForegroundColor Red
            Write-Host "  Message:    $($status.message)" -ForegroundColor Red
        } else {
            Write-Host "  Status:     🔄 RUNNING" -ForegroundColor Yellow
            
            # Calculate duration
            $startTime = [DateTime]::Parse($exec.metadata.creationTimestamp)
            $duration = (Get-Date) - $startTime
            Write-Host "  Duration:   $($duration.Hours)h $($duration.Minutes)m $($duration.Seconds)s" -ForegroundColor Cyan
        }
        
        $taskStatus = $exec.status
        if ($taskStatus.runningCount) {
            Write-Host "  Tasks:      $($taskStatus.runningCount) running" -ForegroundColor Yellow
        }
        if ($taskStatus.succeededCount) {
            Write-Host "  Completed:  $($taskStatus.succeededCount) tasks" -ForegroundColor Green
        }
        if ($taskStatus.failedCount) {
            Write-Host "  Failed:     $($taskStatus.failedCount) tasks" -ForegroundColor Red
        }
    } else {
        Write-Host "  ⚠️  No executions found" -ForegroundColor Yellow
    }
    
    # 2. Check for build output in GCS
    Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
    Write-Host "📦 BUILD OUTPUT STATUS" -ForegroundColor Yellow
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Yellow
    
    $buildId = "6nieJ5hSRIATzpEBsw1f"
    $gcsPath = "gs://alfs-bd1e0-builds/$buildId/"
    
    try {
        $files = gsutil ls $gcsPath 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ Files found in GCS:" -ForegroundColor Green
            $files | ForEach-Object {
                if ($_ -match "gs://") {
                    $filename = ($_ -split '/')[-1]
                    Write-Host "    📄 $filename" -ForegroundColor White
                    
                    if ($_ -match "lfs-system.*\.tar\.gz") {
                        # Get file size
                        $sizeInfo = gsutil du -s $_ 2>&1
                        if ($sizeInfo -match "(\d+)") {
                            $sizeBytes = [long]$Matches[1]
                            $sizeMB = [math]::Round($sizeBytes / 1MB, 2)
                            Write-Host "       Size: $sizeMB MB" -ForegroundColor Cyan
                            
                            if ($sizeMB -gt 500) {
                                Write-Host "       ✅ REAL BUILD (Full LFS system!)" -ForegroundColor Green
                            } elseif ($sizeMB -gt 1) {
                                Write-Host "       🔄 Building... (size will grow to 500+ MB)" -ForegroundColor Yellow
                            } else {
                                Write-Host "       ⚠️  Placeholder (waiting for real build)" -ForegroundColor Yellow
                            }
                        }
                    }
                }
            }
        } else {
            Write-Host "  ⏳ No output files yet - build in progress" -ForegroundColor Yellow
            Write-Host "     (Files appear when compilation completes)" -ForegroundColor Gray
        }
    } catch {
        Write-Host "  ⏳ No output files yet" -ForegroundColor Yellow
    }
    
    # 3. Show recent log messages
    Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
    Write-Host "📝 RECENT LOG MESSAGES (Last 10)" -ForegroundColor Yellow
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Yellow
    
    $logs = gcloud logging read "resource.type=cloud_run_job AND resource.labels.job_name=lfs-builder" `
        --limit=10 `
        --project=alfs-bd1e0 `
        --format="json" `
        --freshness=30m 2>&1 | ConvertFrom-Json
    
    if ($logs -and $logs.Count -gt 0) {
        $logs | Sort-Object timestamp | ForEach-Object {
            $time = ([DateTime]$_.timestamp).ToString("HH:mm:ss")
            $msg = $_.textPayload
            
            if ($msg) {
                # Highlight important messages
                if ($msg -match "ENABLE_FULL_BUILD|REAL|Chapter|Building|Compiling") {
                    Write-Host "  $time  " -NoNewline -ForegroundColor Cyan
                    Write-Host "$msg" -ForegroundColor Green
                } elseif ($msg -match "ERROR|FAILED|Error") {
                    Write-Host "  $time  " -NoNewline -ForegroundColor Cyan
                    Write-Host "$msg" -ForegroundColor Red
                } elseif ($msg -match "SUCCESS|Complete|Finished") {
                    Write-Host "  $time  " -NoNewline -ForegroundColor Cyan
                    Write-Host "$msg" -ForegroundColor Green
                } else {
                    Write-Host "  $time  $msg" -ForegroundColor Gray
                }
            }
        }
    } else {
        Write-Host "  No recent logs (build may not have started yet)" -ForegroundColor Gray
    }
    
    # 4. Quick reference
    Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "💡 QUICK ACTIONS" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan
    
    Write-Host "  View all logs:" -ForegroundColor White
    Write-Host '    gcloud logging read "resource.type=cloud_run_job" --limit=100 --project=alfs-bd1e0' -ForegroundColor Gray
    
    Write-Host "`n  Download when complete:" -ForegroundColor White
    Write-Host "    gsutil cp gs://alfs-bd1e0-builds/6nieJ5hSRIATzpEBsw1f/lfs-system-*.tar.gz ./" -ForegroundColor Gray
    
    Write-Host "`n  Cloud Console:" -ForegroundColor White
    Write-Host "    https://console.cloud.google.com/run/jobs/details/us-central1/lfs-builder?project=alfs-bd1e0" -ForegroundColor Gray
    
    Write-Host "`n"
}

# Main execution
if ($Continuous) {
    Write-Host "`n🔄 Continuous monitoring enabled (refreshing every $RefreshSeconds seconds)" -ForegroundColor Green
    Write-Host "   Press Ctrl+C to stop`n" -ForegroundColor Gray
    
    while ($true) {
        Show-BuildStatus
        Start-Sleep -Seconds $RefreshSeconds
    }
} else {
    Show-BuildStatus
    Write-Host "💡 TIP: Run with -Continuous flag for auto-refresh:" -ForegroundColor Magenta
    Write-Host "   .\MONITOR_BUILD.ps1 -Continuous`n" -ForegroundColor Gray
}
