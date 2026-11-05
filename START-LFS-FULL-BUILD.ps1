# START-LFS-FULL-BUILD.ps1
# Full LFS pipeline in WSL Ubuntu: toolchain (Ch.5) -> minimal system (Ch.6)
# -> basic tools (Ch.6.5) -> bootable ISO -> practice targets (labs layer)
# -> packaged artifacts (lfs-system.tar.gz, vuln-labs.tar.gz, ISO, manifest).
#
# Cloud/Firestore logging is skipped locally (SKIP_GCLOUD_CHECK=true,
# empty PROJECT_ID). Artifacts land in <repo>/lfs-output/goal-builds/<BUILD_ID>/.
Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  LFS FULL BUILD (Ubuntu WSL)" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

$repoWsl = (wsl wslpath -a "$PSScriptRoot").Trim()
$buildId = "local-goal-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
$outDir = "$repoWsl/lfs-output/goal-builds/$buildId"
$logDir = "$repoWsl/lfs-output/goal-builds/$buildId/logs"

Write-Host "Build ID: $buildId" -ForegroundColor Yellow
Write-Host "Output:   lfs-output/goal-builds/$buildId/" -ForegroundColor Yellow
Write-Host "Estimated time: 3-6 hours (runs detached, safe to close this window)" -ForegroundColor Yellow
Write-Host ""

$envArgs = @(
    "BUILD_ID='$buildId'",
    "PROJECT_ID=''",
    "PROJECT_ROOT='$repoWsl'",
    "LOG_DIR='$logDir'",
    "OUTPUT_DIR='$outDir'",
    "LFS_MNT='/mnt/lfs'",
    "ENABLE_FULL_BUILD='true'",
    "ENABLE_ISO_BUILD='true'",
    "ENABLE_VULNBOX='true'",
    "VULNBOX_PACKAGES='juice-shop,dvwa,webgoat'",
    "SKIP_GCLOUD_CHECK='true'"
) -join ' '

$launch = "chmod +x '$repoWsl/lfs-build.sh' && mkdir -p '$outDir' '$logDir' && cd '$repoWsl' && env $envArgs nohup bash '$repoWsl/lfs-build.sh' > '$logDir/driver.log' 2>&1 & echo ""Build launched, driver PID: `$$!"""
wsl -d Ubuntu -u root bash -c $launch

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "BUILD LAUNCHED (detached)." -ForegroundColor Green
    Write-Host "Watch: Get-Content lfs-output/goal-builds/$buildId/logs/driver.log -Wait" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "Launch failed!" -ForegroundColor Red
    Write-Host ""
}
