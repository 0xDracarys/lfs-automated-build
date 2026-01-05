#!/bin/bash
set -e

# Use standard LFS path or environment variable
export LFS=${LFS:-/mnt/lfs}
export LFS_TGT=x86_64-lfs-linux-gnu

cd $LFS/sources

echo "========================================="
echo "Extracting Linux kernel source..."
echo "========================================="
tar -xf linux-6.4.12.tar.xz

cd linux-6.4.12

echo ""
echo "========================================="
echo "Preparing kernel headers..."
echo "========================================="
make mrproper

echo ""
echo "========================================="
echo "Installing kernel headers..."
echo "========================================="
make headers
find usr/include -type f ! -name '*.h' -delete
cp -rv usr/include $LFS/usr/

echo ""
echo "========================================="
echo "Linux API Headers installation complete!"
echo "========================================="
echo ""
echo "Verifying installation..."
ls -lh $LFS/usr/include/linux/version.h
ls -lh $LFS/usr/include/asm/
echo ""
echo "Header files installed successfully!"
