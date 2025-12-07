# BUILD-LFS-CORRECT.ps1
Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  BUILDING LFS CHAPTER 6 TOOLS" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Building to /tools directory..." -ForegroundColor Yellow
Write-Host "Estimated time: 2-3 hours" -ForegroundColor Yellow
Write-Host ""

$scriptPath = '/mnt/c/Users/Chintu/Documents/Dev Zone/Dev work web/lfs-automated/build-chapter6-fixed.sh'
wsl -d Athena bash -c "chmod +x '$scriptPath' && bash '$scriptPath'"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "CHAPTER 6 COMPLETE!" -ForegroundColor Green
    Write-Host "Next: Enter chroot and build final system" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "Build failed - check logs" -ForegroundColor Red
    Write-Host ""
}
