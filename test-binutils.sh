#!/bin/bash
################################################################################
# LOCAL LFS BUILD - Binutils Pass 1 Test
################################################################################

set -euo pipefail

TEST_DIR="$HOME/lfs-test"
LFS_MNT="$TEST_DIR/mnt/lfs"
LFS_SRC="$LFS_MNT/sources"

export LFS="${LFS_MNT}"
export LFS_SRC="${LFS_SRC}"
export LFS_TGT="$(uname -m)-lfs-linux-gnu"
export LC_ALL=POSIX
export PATH="/tools/bin:/usr/bin:/bin:/usr/sbin:/sbin"
export MAKEFLAGS="-j$(nproc)"
set +h
umask 022

echo "🔨 Building Binutils Pass 1 (LOCAL TEST)"
echo "=========================================="
echo ""

cd "$LFS_SRC/binutils-2.41"

# Create build directory
rm -rf build
mkdir -v build
cd build

echo "⚙️  Configuring..."
../configure \
    --prefix=/tools \
    --with-sysroot=$LFS \
    --target=$LFS_TGT \
    --disable-nls \
    --enable-gprofng=no \
    --disable-werror

echo ""
echo "🔨 Building (this will take 5-10 minutes)..."
make

echo ""
echo "📦 Installing..."
make install

echo ""
echo "✅ Binutils Pass 1 completed!"
echo ""
echo "Checking installed files:"
ls -la /tools/bin/ | head -20
