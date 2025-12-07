# ═══════════════════════════════════════════════════════════════
# SIMPLE BUILD MONITOR - Check your LFS build status
# ═══════════════════════════════════════════════════════════════

Write-Host "`n🔍 LFS BUILD MONITOR" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Gray

# Current build ID
$buildId = "krLDNYFzluQUHjxwX6p2"

Write-Host "📋 Build ID: $buildId" -ForegroundColor Yellow
Write-Host "⏰ Checked: $(Get-Date -Format 'HH:mm:ss')`n" -ForegroundColor Gray

# 1. Execution Status
Write-Host "━━━ EXECUTION STATUS ━━━" -ForegroundColor Cyan
gcloud run jobs executions list --job=lfs-builder --region=us-central1 --project=alfs-bd1e0 --limit=1

# 2. Recent Logs (plain text, easier to read)
Write-Host "`n━━━ RECENT LOGS (Last 15) ━━━" -ForegroundColor Cyan
gcloud logging read "resource.type=cloud_run_job AND resource.labels.job_name=lfs-builder" `
    --limit=15 `
    --project=alfs-bd1e0 `
    --format="table(timestamp.date('%H:%M:%S'),textPayload)" `
    --freshness=10m

# 3. Check GCS for output
Write-Host "`n━━━ OUTPUT FILES ━━━" -ForegroundColor Cyan
$gcsPath = "gs://alfs-bd1e0-builds/$buildId/"
Write-Host "Checking: $gcsPath`n" -ForegroundColor Gray

$files = gsutil ls $gcsPath 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Files found:" -ForegroundColor Green
    $files | ForEach-Object { Write-Host "  $_" -ForegroundColor White }
} else {
    Write-Host "⏳ No files yet (normal during compilation)" -ForegroundColor Yellow
}

# 4. Quick commands
Write-Host "`n━━━ QUICK COMMANDS ━━━" -ForegroundColor Cyan
Write-Host "View full logs:" -ForegroundColor White
Write-Host '  gcloud logging read "resource.type=cloud_run_job" --limit=100 --project=alfs-bd1e0' -ForegroundColor Gray

Write-Host "`nDownload when complete:" -ForegroundColor White
Write-Host "  gsutil cp gs://alfs-bd1e0-builds/$buildId/lfs-system-*.tar.gz ./" -ForegroundColor Gray

Write-Host "`nCloud Console:" -ForegroundColor White
Write-Host "  https://console.cloud.google.com/run/jobs/details/us-central1/lfs-builder?project=alfs-bd1e0`n" -ForegroundColor Gray
