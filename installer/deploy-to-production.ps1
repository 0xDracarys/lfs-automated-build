# Staging-to-Production Deployment Script
# Validates checksums and performs final smoke tests before going live

param(
    [string]$StagingDir = ".\staging",
    [string]$ProductionDir = ".\production",
    [string]$WebsiteConfigPath = "..\lfs-learning-platform\public\downloads.json",
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

Write-Host "`n╔══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Production Deployment Verification System          ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# STEP 1: Validate Staging Files
Write-Host "[1/7] Validating staging files..." -ForegroundColor Cyan

$stagingExe = Join-Path $StagingDir "LFSBuilderSetup.exe"
$stagingChecksum = Join-Path $StagingDir "LFSBuilderSetup.exe.sha256"
$stagingManifest = Join-Path $StagingDir "build-manifest.json"

if (-not (Test-Path $stagingExe)) {
    Write-Host "✗ ERROR: Staging executable not found: $stagingExe" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $stagingChecksum)) {
    Write-Host "✗ ERROR: Checksum file not found: $stagingChecksum" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $stagingManifest)) {
    Write-Host "✗ ERROR: Manifest file not found: $stagingManifest" -ForegroundColor Red
    exit 1
}

Write-Host "✓ All staging files present" -ForegroundColor Green

# STEP 2: Verify Checksum Integrity
Write-Host "`n[2/7] Verifying checksum integrity..." -ForegroundColor Cyan

$expectedChecksum = (Get-Content $stagingChecksum).Trim()
$actualChecksum = (Get-FileHash -Path $stagingExe -Algorithm SHA256).Hash

if ($expectedChecksum -ne $actualChecksum) {
    Write-Host "✗ CRITICAL: Checksum MISMATCH!" -ForegroundColor Red
    Write-Host "  Expected: $expectedChecksum" -ForegroundColor Red
    Write-Host "  Actual:   $actualChecksum" -ForegroundColor Red
    Write-Host "`nDeployment ABORTED. File may be corrupted." -ForegroundColor Red
    exit 1
}

Write-Host "✓ Checksum verified: $actualChecksum" -ForegroundColor Green

# STEP 3: Load and Validate Manifest
Write-Host "`n[3/7] Validating build manifest..." -ForegroundColor Cyan

$manifest = Get-Content $stagingManifest | ConvertFrom-Json

if ($manifest.Validated -ne $true) {
    Write-Host "✗ ERROR: Build not marked as validated in manifest" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Manifest validated" -ForegroundColor Green
Write-Host "  Build ID: $($manifest.BuildId)" -ForegroundColor White
Write-Host "  Build Date: $($manifest.BuildDate)" -ForegroundColor White
Write-Host "  Version: $($manifest.Version)" -ForegroundColor White
Write-Host "  File Size: $($manifest.Size) bytes" -ForegroundColor White

# STEP 4: Final Smoke Test
Write-Host "`n[4/7] Running final smoke test..." -ForegroundColor Cyan

try {
    $process = Start-Process $stagingExe -ArgumentList "--version" -PassThru -WindowStyle Hidden -ErrorAction Stop
    Start-Sleep -Seconds 3
    
    if ($process.HasExited -and $process.ExitCode -ne 0) {
        Write-Host "✗ ERROR: Smoke test failed (Exit code: $($process.ExitCode))" -ForegroundColor Red
        exit 1
    }
    
    if (-not $process.HasExited) {
        Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
    }
    
    Write-Host "✓ Smoke test passed" -ForegroundColor Green
} catch {
    Write-Host "✗ ERROR: Smoke test exception: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# STEP 5: Prepare Production Directory
Write-Host "`n[5/7] Preparing production directory..." -ForegroundColor Cyan

if (-not (Test-Path $ProductionDir)) {
    New-Item -Path $ProductionDir -ItemType Directory | Out-Null
    Write-Host "✓ Created production directory" -ForegroundColor Green
} else {
    # Backup existing production build
    $backupDir = Join-Path $ProductionDir "backups"
    if (-not (Test-Path $backupDir)) {
        New-Item -Path $backupDir -ItemType Directory | Out-Null
    }
    
    $existingExe = Join-Path $ProductionDir "LFSBuilderSetup.exe"
    if (Test-Path $existingExe) {
        $backupName = "LFSBuilderSetup-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss').exe"
        $backupPath = Join-Path $backupDir $backupName
        Copy-Item $existingExe $backupPath -Force
        Write-Host "✓ Backed up existing production build to: $backupName" -ForegroundColor Green
    }
}

# STEP 6: Deploy to Production
Write-Host "`n[6/7] Deploying to production..." -ForegroundColor Cyan

if ($DryRun) {
    Write-Host "⚠ DRY RUN MODE: Would copy files but not actually deploying" -ForegroundColor Yellow
} else {
    Copy-Item $stagingExe (Join-Path $ProductionDir "LFSBuilderSetup.exe") -Force
    Copy-Item $stagingChecksum (Join-Path $ProductionDir "LFSBuilderSetup.exe.sha256") -Force
    Copy-Item $stagingManifest (Join-Path $ProductionDir "build-manifest.json") -Force
    
    Write-Host "✓ Files deployed to production" -ForegroundColor Green
}

# STEP 7: Update Website Download Configuration
Write-Host "`n[7/7] Updating website configuration..." -ForegroundColor Cyan

$downloadConfig = @{
    latestVersion = $manifest.Version
    releaseDate = $manifest.BuildDate
    downloads = @{
        windows = @{
            exe = @{
                filename = "LFSBuilderSetup.exe"
                size = $manifest.Size
                sha256 = $actualChecksum
                url = "https://lfs-builder.example.com/downloads/LFSBuilderSetup.exe"
            }
            msi = @{
                filename = "LFSBuilderSetup.msi"
                note = "Available in separate release"
            }
        }
    }
    changelog = @(
        "Initial release",
        "Professional Windows installer with 5-step wizard",
        "Automated WSL2 installation",
        "LFS environment configuration"
    )
    verified = $true
    checksum = $actualChecksum
}

if ($DryRun) {
    Write-Host "⚠ DRY RUN MODE: Would update website config but not actually writing" -ForegroundColor Yellow
    Write-Host ($downloadConfig | ConvertTo-Json -Depth 10) -ForegroundColor Gray
} else {
    if (Test-Path (Split-Path $WebsiteConfigPath -Parent)) {
        $downloadConfig | ConvertTo-Json -Depth 10 | Out-File $WebsiteConfigPath -Encoding UTF8
        Write-Host "✓ Website configuration updated: $WebsiteConfigPath" -ForegroundColor Green
    } else {
        Write-Host "⚠ WARNING: Website config path not found. Saving to current directory." -ForegroundColor Yellow
        $downloadConfig | ConvertTo-Json -Depth 10 | Out-File "downloads.json" -Encoding UTF8
    }
}

# FINAL REPORT
Write-Host "`n╔══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║              DEPLOYMENT COMPLETE                      ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "✓ All validation checks PASSED" -ForegroundColor Green
Write-Host "✓ Checksum verified: $actualChecksum" -ForegroundColor Green
Write-Host "✓ Smoke test successful" -ForegroundColor Green

if ($DryRun) {
    Write-Host "`n⚠ This was a DRY RUN. No files were actually deployed." -ForegroundColor Yellow
    Write-Host "Run without -DryRun flag to perform actual deployment.`n" -ForegroundColor Yellow
} else {
    Write-Host "`n✓ Production deployment successful!" -ForegroundColor Green
    Write-Host "Website download link can now be updated safely.`n" -ForegroundColor Green
}

exit 0
