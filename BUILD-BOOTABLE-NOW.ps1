# BUILD-BOOTABLE-NOW.ps1
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  BUILD BOOTABLE LFS - SIMPLE METHOD" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This will:" -ForegroundColor Yellow
Write-Host "  1. Build Linux kernel 6.4.12"
Write-Host "  2. Create minimal bootable system"
Write-Host "  3. Package as bootable ISO"
Write-Host ""
Write-Host "Time: 60-90 minutes" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Enter to start kernel build..."
Read-Host

Write-Host ""
Write-Host "Building Linux kernel..." -ForegroundColor Cyan
Write-Host "This will take 60-90 minutes. Please wait..." -ForegroundColor Yellow
Write-Host ""

$scriptPath = '/mnt/c/Users/Chintu/Documents/Dev Zone/Dev work web/lfs-automated/build-bootable-kernel.sh'
wsl -d Athena bash -c "chmod +x '$scriptPath' && bash '$scriptPath'"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  KERNEL BUILD COMPLETE!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your bootable LFS kernel is ready!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Location: /home/dracarys/lfs-bootable/" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Next step: Create bootable ISO" -ForegroundColor Yellow
    Write-Host "Run: .\CREATE-ISO.ps1" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "Build failed - check output above" -ForegroundColor Red
    Write-Host ""
}
