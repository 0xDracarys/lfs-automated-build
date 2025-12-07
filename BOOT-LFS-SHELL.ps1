#!/usr/bin/env pwsh
# Boot into LFS Linux Shell

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "   Booting Custom LFS Linux..." -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Kernel: 6.4.12 (using host kernel in chroot)" -ForegroundColor Yellow
Write-Host "Shell: Busybox ash" -ForegroundColor Yellow
Write-Host "Commands: 392 available" -ForegroundColor Yellow
Write-Host ""
Write-Host "Try these commands once inside:" -ForegroundColor Green
Write-Host "  uname -a          - System info" -ForegroundColor Gray
Write-Host "  ls /bin           - List commands" -ForegroundColor Gray
Write-Host "  echo Hello LFS    - Test shell" -ForegroundColor Gray
Write-Host "  pwd               - Current directory" -ForegroundColor Gray
Write-Host "  free              - Memory info" -ForegroundColor Gray
Write-Host "  ps                - Process list" -ForegroundColor Gray
Write-Host "  exit              - Leave LFS" -ForegroundColor Gray
Write-Host ""
Write-Host "Entering LFS environment..." -ForegroundColor Cyan
Write-Host ""

# Enter the LFS system
wsl -d Athena bash -c "cd /home/dracarys/lfs-bootable/rootfs && echo 'Welcome to LFS Linux!' && echo 'You are now in your custom-built system' && echo '' && sudo chroot . /bin/sh"

Write-Host ""
Write-Host "Exited LFS system" -ForegroundColor Yellow
