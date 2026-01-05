#!/bin/bash
set -e

# Use standard LFS path or environment variable
export LFS=${LFS:-/mnt/lfs}
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
