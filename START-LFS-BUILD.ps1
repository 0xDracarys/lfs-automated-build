# START-LFS-BUILD.ps1
Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  LFS MINIMAL BOOTABLE SYSTEM BUILD" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Building 17 packages..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Estimated time: 3-4 hours" -ForegroundColor Yellow
Write-Host "Disk space: 2GB" -ForegroundColor Yellow
Write-Host ""
Write-Host "Starting build in WSL..." -ForegroundColor Cyan
Write-Host ""

$scriptPath = '/mnt/c/Users/Chintu/Documents/Dev Zone/Dev work web/lfs-automated/build-minimal-bootable.sh'
wsl -d Athena bash -c "chmod +x '$scriptPath' && bash '$scriptPath'"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "BUILD COMPLETE!" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "Build failed!" -ForegroundColor Red
    Write-Host ""
}
