# Quick Build Status Checker
# Run this anytime to check your REAL LFS build progress

$buildId = "6nieJ5hSRIATzpEBsw1f"

Write-Host "`n╔════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║       LFS BUILD STATUS CHECKER                 ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "🔍 Checking build: $buildId`n" -ForegroundColor Yellow

# Check execution status
Write-Host "📊 Execution Status:" -ForegroundColor Cyan
gcloud run jobs executions list --job=lfs-builder --region=us-central1 --project=alfs-bd1e0 --limit=1 --format="table(name,status,startTime,duration)"

Write-Host "`n"

# Check if files exist in GCS
Write-Host "📦 Checking GCS for build outputs..." -ForegroundColor Cyan
$gcsPath = "gs://alfs-bd1e0-builds/$buildId/"

try {
    $files = gsutil ls $gcsPath 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Files found in GCS:" -ForegroundColor Green
        $files | ForEach-Object {
            Write-Host "  $_" -ForegroundColor White
            if ($_ -match "lfs-system.*\.tar\.gz") {
                # Get file size
                $size = gsutil du -s $_ 2>&1 | Select-String -Pattern "\d+"
                if ($size) {
                    $sizeBytes = [long]$size.Matches[0].Value
                    $sizeMB = [math]::Round($sizeBytes / 1MB, 2)
                    Write-Host "    Size: $sizeMB MB" -ForegroundColor Yellow
                    
                    if ($sizeMB -gt 500) {
                        Write-Host "    ✅ REAL BUILD (Full LFS system!)" -ForegroundColor Green
                    } else {
                        Write-Host "    ⚠️  Still building... (size will increase)" -ForegroundColor Yellow
                    }
                }
            }
        }
    } else {
        Write-Host "⏳ No files yet - build still in progress" -ForegroundColor Yellow
        Write-Host "   (Files appear at the end of compilation)" -ForegroundColor Gray
    }
} catch {
    Write-Host "⏳ No files yet - build still in progress" -ForegroundColor Yellow
}

Write-Host "`n"

# Recent logs
Write-Host "📝 Recent Log Messages:" -ForegroundColor Cyan
gcloud logging read "resource.type=cloud_run_job AND resource.labels.job_name=lfs-builder" --limit=5 --project=alfs-bd1e0 --format="table(timestamp,textPayload)" --freshness=10m

Write-Host "`n"

# Status summary
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "QUICK REFERENCE" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Write-Host "`n📥 Download command (when complete):" -ForegroundColor Cyan
Write-Host "  gsutil cp gs://alfs-bd1e0-builds/$buildId/lfs-system-*.tar.gz ./" -ForegroundColor White

Write-Host "`n🔍 View full logs:" -ForegroundColor Cyan
Write-Host "  gcloud logging read `"resource.type=cloud_run_job`" --limit=50 --project=alfs-bd1e0" -ForegroundColor White

Write-Host "`n🌐 Console:" -ForegroundColor Cyan
Write-Host "  https://console.cloud.google.com/run/jobs/details/us-central1/lfs-builder?project=alfs-bd1e0" -ForegroundColor White

Write-Host "`n⏰ Expected completion: ~4-6 hours from start" -ForegroundColor Yellow
Write-Host "`n"
