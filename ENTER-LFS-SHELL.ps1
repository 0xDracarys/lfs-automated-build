# Enter LFS Shell - Windows PowerShell Launcher
# Run this to enter your custom LFS Linux environment

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Launching Custom LFS Linux Shell" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Enter WSL and run the LFS shell
wsl -d Athena bash -c "cd /home/dracarys && sudo ./enter-lfs.sh"

Write-Host ""
Write-Host "Exited LFS environment." -ForegroundColor Yellow
