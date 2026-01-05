# Fix Real Cloud Builds - Deployment Script
# This script rebuilds the Cloud Run container and configures GCS

Write-Host "`n=== FIXING REAL CLOUD BUILDS ===`n" -ForegroundColor Cyan

$ErrorActionPreference = "Continue"

# Step 1: Check prerequisites
Write-Host "Step 1: Checking prerequisites..." -ForegroundColor Yellow

$hasGcloud = Get-Command gcloud -ErrorAction SilentlyContinue
$hasFirebase = Get-Command firebase -ErrorAction SilentlyContinue

if (-not $hasGcloud) {
    Write-Host "[ERROR] gcloud CLI not found. Install: https://cloud.google.com/sdk/docs/install" -ForegroundColor Red
    exit 1
}

if (-not $hasFirebase) {
    Write-Host "[ERROR] firebase CLI not found. Install: npm install -g firebase-tools" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Prerequisites installed" -ForegroundColor Green

# Step 2: Set GCS Lifecycle Policy
Write-Host "`nStep 2: Setting GCS lifecycle policy (7-day auto-delete)..." -ForegroundColor Yellow

try {
    gsutil lifecycle set bucket-lifecycle.json gs://alfs-bd1e0-builds 2>&1 | Out-Null
    Write-Host "[OK] Lifecycle policy applied" -ForegroundColor Green
} catch {
    Write-Host "[WARN] Failed to set lifecycle policy: $_" -ForegroundColor Yellow
}

# Step 3: Deploy Cloud Functions (if changed)
Write-Host "`nStep 3: Checking Cloud Functions..." -ForegroundColor Yellow
$deployFunctions = Read-Host "Deploy Cloud Functions? (y/N)"

if ($deployFunctions -eq "y") {
    Write-Host "Deploying functions..." -ForegroundColor Yellow
    firebase deploy --only functions
} else {
    Write-Host "[SKIP] Cloud Functions deployment" -ForegroundColor Yellow
}

# Step 4: Rebuild Cloud Run Container
Write-Host "`nStep 4: Rebuilding Cloud Run container..." -ForegroundColor Yellow
Write-Host "This includes the packaging scripts (TAR.GZ, ISO, signed URLs)" -ForegroundColor Gray
Write-Host "Expected time: 5-10 minutes" -ForegroundColor Gray

$rebuildContainer = Read-Host "Rebuild Cloud Run container? (y/N)"

if ($rebuildContainer -eq "y") {
    Write-Host "Starting Cloud Build..." -ForegroundColor Yellow
    gcloud builds submit --config cloudbuild.yaml
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Container rebuilt successfully" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Container build failed" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "[SKIP] Container rebuild" -ForegroundColor Yellow
}

# Step 5: Verify Cloud Run Job
Write-Host "`nStep 5: Verifying Cloud Run Job..." -ForegroundColor Yellow

try {
    $jobInfo = gcloud run jobs describe lfs-builder --region=us-central1 --format=json 2>&1 | ConvertFrom-Json
    Write-Host "[OK] Job exists: lfs-builder" -ForegroundColor Green
    Write-Host "   Region: us-central1" -ForegroundColor Gray
    Write-Host "   Image: $($jobInfo.spec.template.spec.template.spec.containers[0].image)" -ForegroundColor Gray
} catch {
    Write-Host "[ERROR] Cloud Run Job not found" -ForegroundColor Red
}

# Step 6: Test Manual Execution (optional)
Write-Host "`nStep 6: Test Cloud Run execution..." -ForegroundColor Yellow
$testExecution = Read-Host "Run test build? (y/N)"

if ($testExecution -eq "y") {
    $testBuildId = "test-$(Get-Date -Format 'yyyyMMddHHmmss')"
    Write-Host "Starting test execution: $testBuildId" -ForegroundColor Yellow
    
    gcloud run jobs execute lfs-builder `
        --region=us-central1 `
        --update-env-vars="BUILD_ID=$testBuildId,GCS_BUCKET=alfs-bd1e0-builds,LFS_CONFIG_JSON={}"
    
    Write-Host "`nView logs:" -ForegroundColor Cyan
    Write-Host "gcloud run jobs executions logs --job=lfs-builder --region=us-central1 --limit=1" -ForegroundColor Gray
} else {
    Write-Host "[SKIP] Test execution" -ForegroundColor Yellow
}

# Summary
Write-Host "`n=== DEPLOYMENT COMPLETE ===" -ForegroundColor Cyan
Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "1. Start dev server: cd lfs-learning-platform && npm run dev" -ForegroundColor Gray
Write-Host "2. Open http://localhost:3000/build" -ForegroundColor Gray
Write-Host "3. Sign in and submit a build" -ForegroundColor Gray
Write-Host "4. Monitor at http://localhost:3000/build/YOUR_BUILD_ID" -ForegroundColor Gray
Write-Host "5. Check logs: firebase functions:log" -ForegroundColor Gray
Write-Host "`nSee FIX-REAL-BUILDS.md for full troubleshooting guide`n" -ForegroundColor Cyan
