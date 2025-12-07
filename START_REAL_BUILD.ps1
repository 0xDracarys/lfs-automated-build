# ============================================================================
# START REAL LFS BUILD
# This will submit a FULL LFS build (not placeholder) - takes 4-6 hours
# ============================================================================

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🚀 STARTING REAL LFS BUILD (Not Placeholder)             ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "⚠️  THIS IS A FULL BUILD - Expected Duration: 4-6 HOURS" -ForegroundColor Yellow
Write-Host "⚠️  Output Size: 500 MB - 2 GB (compressed)" -ForegroundColor Yellow
Write-Host "`n"

# Generate unique build ID
$buildId = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 20 | ForEach-Object {[char]$_})

Write-Host "📋 Build Configuration:" -ForegroundColor Cyan
Write-Host "  Build ID:        $buildId" -ForegroundColor White
Write-Host "  Project:         full-lfs-system" -ForegroundColor White
Write-Host "  LFS Version:     12.0" -ForegroundColor White
Write-Host "  Include Glibc:   ✅ YES" -ForegroundColor Green
Write-Host "  Build Kernel:    ✅ YES" -ForegroundColor Green
Write-Host "  Toolchain:       ✅ FULL (GCC, Binutils, Glibc)" -ForegroundColor Green
Write-Host "  System Utils:    ✅ YES (bash, coreutils, tar, gzip, etc.)" -ForegroundColor Green
Write-Host "`n"

# Confirm with user
$confirm = Read-Host "Start FULL LFS build now? This will take 4-6 hours. (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "`n❌ Build cancelled by user" -ForegroundColor Red
    exit 0
}

Write-Host "`n🔨 Submitting build to Cloud Run..." -ForegroundColor Cyan

# Create env vars file for gcloud
$envVars = @"
BUILD_ID=$buildId
BUILD_TYPE=FULL
SKIP_PLACEHOLDER=true
LFS_VERSION=12.0
ENABLE_FULL_BUILD=true
PROJECT_NAME=full-lfs-system
"@

$envVars | Out-File -FilePath "./build-env-vars.txt" -Encoding ASCII

# Submit the build
try {
    Write-Host "Executing Cloud Run Job..." -ForegroundColor Yellow
    
    # Submit with proper env vars
    gcloud run jobs execute lfs-builder `
        --region=us-central1 `
        --project=alfs-bd1e0 `
        --set-env-vars="BUILD_ID=$buildId,BUILD_TYPE=FULL,SKIP_PLACEHOLDER=true,LFS_VERSION=12.0,ENABLE_FULL_BUILD=true" `
        --async
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Build submitted successfully!" -ForegroundColor Green
        Write-Host "`n📊 Build Details:" -ForegroundColor Cyan
        Write-Host "  Build ID:     $buildId" -ForegroundColor White
        Write-Host "  Status URL:   https://console.cloud.google.com/run/jobs/details/us-central1/lfs-builder?project=alfs-bd1e0" -ForegroundColor White
        Write-Host "  Expected:     4-6 hours" -ForegroundColor White
        Write-Host "`n"
        
        Write-Host "📥 After completion, download with:" -ForegroundColor Cyan
        Write-Host "  gsutil cp gs://alfs-bd1e0-builds/$buildId/lfs-system.tar.gz ./" -ForegroundColor Yellow
        Write-Host "`n"
        
        Write-Host "🔍 Monitor progress:" -ForegroundColor Cyan
        Write-Host "  gcloud logging read `"resource.type=cloud_run_job AND resource.labels.job_name=lfs-builder`" --limit=50 --project=alfs-bd1e0 --format=`"table(timestamp,textPayload)`"" -ForegroundColor Yellow
        Write-Host "`n"
        
        # Save build info
        @{
            BuildID = $buildId
            SubmittedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
            Type = "FULL"
            EstimatedCompletion = (Get-Date).AddHours(5).ToString("yyyy-MM-dd HH:mm:ss")
            GCSPath = "gs://alfs-bd1e0-builds/$buildId/"
        } | ConvertTo-Json | Out-File -FilePath "./current-build-info.json"
        
        Write-Host "💾 Build info saved to: current-build-info.json" -ForegroundColor Green
        
    } else {
        throw "gcloud command failed"
    }
    
} catch {
    Write-Host "`n❌ Failed to submit build: $_" -ForegroundColor Red
    exit 1
}

# Clean up
Remove-Item "./build-env-vars.txt" -ErrorAction SilentlyContinue

Write-Host "`n════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Build is now running in the background." -ForegroundColor Green
Write-Host "Check back in 4-6 hours for the full LFS system!" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan
