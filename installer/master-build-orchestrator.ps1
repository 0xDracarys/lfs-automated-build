# Master Build Orchestrator with Self-Healing
# Coordinates the entire build -> validate -> fix -> deploy pipeline

param(
    [switch]$FullPipeline,
    [switch]$Deploy,
    [switch]$DryRun,
    [int]$MaxAttempts = 3
)

$ErrorActionPreference = "Continue"  # Allow graceful error handling

$banner = @"
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║     LFS Builder - Self-Healing Build Pipeline v1.0            ║
║                                                                ║
║  Features:                                                     ║
║  ✓ Pre-build asset validation                                 ║
║  ✓ Multi-layered error detection                              ║
║  ✓ Automated error correction                                 ║
║  ✓ SHA-256 checksum validation                                ║
║  ✓ Smoke testing                                              ║
║  ✓ Staging-to-production deployment                           ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
"@

Write-Host $banner -ForegroundColor Cyan

$attempt = 1
$buildSuccess = $false
$lastLogFile = $null

while ($attempt -le $MaxAttempts -and -not $buildSuccess) {
    Write-Host "`n═══════════════════════════════════════════════════════════════" -ForegroundColor White
    Write-Host "  ATTEMPT $attempt of $MaxAttempts" -ForegroundColor White
    Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor White
    
    # PHASE 1: BUILD
    Write-Host "[PHASE 1] Running build pipeline..." -ForegroundColor Cyan
    & ".\installer\build-pipeline.ps1" -ForceRebuild:($attempt -gt 1)
    $buildExitCode = $LASTEXITCODE
    
    if ($buildExitCode -eq 0) {
        Write-Host "✓ Build pipeline completed successfully!" -ForegroundColor Green
        $buildSuccess = $true
        break
    }
    
    Write-Host "✗ Build pipeline failed (Exit code: $buildExitCode)" -ForegroundColor Red
    
    # PHASE 2: ANALYZE & FIX
    if ($attempt -lt $MaxAttempts) {
        Write-Host "`n[PHASE 2] Analyzing errors and applying fixes..." -ForegroundColor Cyan
        & ".\installer\analyze-and-fix-errors.ps1" -ApplyFixes
        $fixExitCode = $LASTEXITCODE
        
        if ($fixExitCode -eq 0) {
            Write-Host "✓ Fixes applied. Retrying build..." -ForegroundColor Green
        } else {
            Write-Host "✗ Unable to auto-fix errors. Manual intervention required." -ForegroundColor Red
            break
        }
    }
    
    $attempt++
}

if (-not $buildSuccess) {
    Write-Host "`n╔════════════════════════════════════════════════════╗" -ForegroundColor Red
    Write-Host "║         BUILD FAILED AFTER $MaxAttempts ATTEMPTS              ║" -ForegroundColor Red
    Write-Host "╚════════════════════════════════════════════════════╝`n" -ForegroundColor Red
    
    Write-Host "Check the build logs for details." -ForegroundColor Yellow
    Write-Host "Log files are located in the current directory (build-log-*.json)`n" -ForegroundColor Yellow
    exit 1
}

# PHASE 3: DEPLOYMENT (if requested)
if ($Deploy -or $FullPipeline) {
    Write-Host "`n[PHASE 3] Deploying to production..." -ForegroundColor Cyan
    & ".\installer\deploy-to-production.ps1" -DryRun:$DryRun
    $deployExitCode = $LASTEXITCODE
    
    if ($deployExitCode -eq 0) {
        Write-Host "✓ Deployment validation successful!" -ForegroundColor Green
    } else {
        Write-Host "✗ Deployment validation failed!" -ForegroundColor Red
        exit 1
    }
}

# FINAL SUCCESS REPORT
Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                                ║" -ForegroundColor Green
Write-Host "║                  PIPELINE SUCCESSFUL!                          ║" -ForegroundColor Green
Write-Host "║                                                                ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "Build Attempts: $attempt" -ForegroundColor White
Write-Host "Output: installer\LFSInstaller\publish\LFSBuilderSetup.exe" -ForegroundColor White
Write-Host "Staging: installer\staging\LFSBuilderSetup.exe" -ForegroundColor White

if ($Deploy -and -not $DryRun) {
    Write-Host "Production: installer\production\LFSBuilderSetup.exe" -ForegroundColor Green
    Write-Host "`n✓ Ready for public download!" -ForegroundColor Green
} elseif ($DryRun) {
    Write-Host "`n⚠ Dry run mode - files not actually deployed" -ForegroundColor Yellow
    Write-Host "Run with -Deploy (without -DryRun) to deploy to production" -ForegroundColor Yellow
} else {
    Write-Host "`nTo deploy to production, run:" -ForegroundColor Yellow
    Write-Host "  .\master-build-orchestrator.ps1 -Deploy`n" -ForegroundColor Gray
}

exit 0
