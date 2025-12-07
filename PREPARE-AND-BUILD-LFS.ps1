# PREPARE-AND-BUILD-LFS.ps1 - Complete automated LFS build via chroot
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  LFS BOOTABLE SYSTEM - CHROOT BUILD" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This will:" -ForegroundColor Yellow
Write-Host "  1. Prepare chroot environment"
Write-Host "  2. Mount necessary filesystems"
Write-Host "  3. Enter chroot"
Write-Host "  4. Build all packages natively (no cross-compile issues!)"
Write-Host "  5. Build Linux kernel"
Write-Host "  6. Install GRUB"
Write-Host "  7. Create bootable system"
Write-Host ""
Write-Host "Estimated time: 12-14 hours" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Enter to start..."
Read-Host

Write-Host ""
Write-Host "Step 1: Preparing chroot environment..." -ForegroundColor Cyan
wsl -d Athena bash '/mnt/c/Users/Chintu/Documents/Dev Zone/Dev work web/lfs-automated/prepare-chroot.sh'

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to prepare chroot!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 2: Entering chroot and building..." -ForegroundColor Cyan
Write-Host ""

# Create the chroot entry script
$chrootScript = @'
#!/bin/bash
set -e

export LFS=/home/dracarys/lfs-local-build/mnt/lfs
export LFS_TOOLS=/home/dracarys/lfs-test/mnt/lfs
export LFS_USR=/home/dracarys/lfs-local-build/mnt/lfs

echo "Mounting virtual filesystems..."
sudo mount -v --bind /dev $LFS/dev 2>/dev/null || true
sudo mount -v --bind /dev/pts $LFS/dev/pts 2>/dev/null || true
sudo mount -vt proc proc $LFS/proc 2>/dev/null || true
sudo mount -vt sysfs sysfs $LFS/sys 2>/dev/null || true
sudo mount -vt tmpfs tmpfs $LFS/run 2>/dev/null || true

if [ -h $LFS/dev/shm ]; then
    sudo mkdir -pv $LFS/$(readlink $LFS/dev/shm)
else
    sudo mount -vt tmpfs -o nosuid,nodev tmpfs $LFS/dev/shm 2>/dev/null || true
fi

echo "Mounting sources directory..."
sudo mkdir -p $LFS/sources
sudo mount --bind $LFS_USR/sources $LFS/sources 2>/dev/null || true

echo "Mounting toolchain..."
sudo mkdir -p $LFS/lfs-tools
sudo mount --bind $LFS_TOOLS $LFS/lfs-tools 2>/dev/null || true

echo "Mounting existing usr for libraries..."
sudo mkdir -p $LFS/lfs-usr
sudo mount --bind $LFS_USR/usr $LFS/lfs-usr 2>/dev/null || true

echo ""
echo "========================================="
echo "  ENTERING CHROOT ENVIRONMENT"
echo "========================================="
echo ""

sudo chroot "$LFS" /usr/bin/env -i \
    HOME=/root \
    TERM="$TERM" \
    PS1='(lfs chroot) \u:\w\$ ' \
    PATH=/usr/bin:/usr/sbin:/bin:/sbin \
    MAKEFLAGS="-j12" \
    /bin/bash --login -c "/build-lfs-in-chroot.sh"

echo ""
echo "Build complete! Unmounting..."
sudo umount -v $LFS/lfs-usr 2>/dev/null || true
sudo umount -v $LFS/lfs-tools 2>/dev/null || true
sudo umount -v $LFS/sources 2>/dev/null || true
sudo umount -v $LFS/dev/shm 2>/dev/null || true
sudo umount -v $LFS/run 2>/dev/null || true
sudo umount -v $LFS/sys 2>/dev/null || true
sudo umount -v $LFS/proc 2>/dev/null || true
sudo umount -v $LFS/dev/pts 2>/dev/null || true
sudo umount -v $LFS/dev 2>/dev/null || true

echo ""
echo "========================================="
echo "  BUILD COMPLETE!"
echo "========================================="
'@

$chrootScript | Out-File -FilePath "chroot-and-build.sh" -Encoding ASCII
wsl -d Athena bash '/mnt/c/Users/Chintu/Documents/Dev Zone/Dev work web/lfs-automated/chroot-and-build.sh'

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  SUCCESS!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your LFS system is built!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Build Linux kernel: .\BUILD-KERNEL.ps1"
    Write-Host "  2. Install GRUB: .\INSTALL-GRUB.ps1"
    Write-Host "  3. Create bootable ISO: .\CREATE-ISO.ps1"
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "Build encountered errors - check logs" -ForegroundColor Red
    Write-Host ""
}
