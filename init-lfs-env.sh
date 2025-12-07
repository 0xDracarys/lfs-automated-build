#!/bin/bash
# init-lfs-env.sh - Initialize LFS build environment
set -e

# Set LFS environment variables
export LFS=/home/dracarys/lfs-local-build/mnt/lfs
export LFS_TGT=x86_64-lfs-linux-gnu
export LFS_TOOLS=/home/dracarys/lfs-test/mnt/lfs
export PATH=$LFS_TOOLS/tools/bin:/usr/bin:/bin:/usr/sbin:/sbin
export MAKEFLAGS=-j12

# Create necessary directories
mkdir -p $LFS/sources
mkdir -p $LFS/usr/bin
mkdir -p $LFS/usr/lib
mkdir -p $LFS/usr/include
mkdir -p $LFS/etc
mkdir -p $LFS/var
mkdir -p $LFS/boot

echo "=== LFS Environment Initialized ==="
echo "LFS=$LFS"
echo "LFS_TGT=$LFS_TGT"
echo "LFS_TOOLS=$LFS_TOOLS"
echo "PATH=$PATH"
echo "MAKEFLAGS=$MAKEFLAGS"
echo ""
echo "✅ Ready to build packages!"
