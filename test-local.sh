#!/bin/bash
################################################################################
# LOCAL LFS TEST - Run this in WSL to test the build locally
################################################################################

set -euo pipefail

echo "🧪 LOCAL LFS BUILD TEST"
echo "======================="
echo ""

# Create local test directory
TEST_DIR="$HOME/lfs-test"
LFS_MNT="$TEST_DIR/mnt/lfs"
LFS_SRC="$LFS_MNT/sources"

echo "📁 Setting up test environment..."
echo "   Test directory: $TEST_DIR"
echo "   LFS root: $LFS_MNT"
echo ""

# Clean up any previous test
if [ -d "$TEST_DIR" ]; then
    echo "⚠️  Previous test found, cleaning up..."
    rm -rf "$TEST_DIR"
fi

# Create directory structure
mkdir -p "$TEST_DIR/mnt"
mkdir -p "$LFS_MNT"
mkdir -p "$LFS_SRC"

# Create complete LFS directory structure
echo "📂 Creating LFS directory structure..."
mkdir -p "${LFS_MNT}"/{etc,var,bin,lib,sbin,tools}
mkdir -p "${LFS_MNT}/lib64"
mkdir -p "${LFS_MNT}/usr"/{bin,lib,sbin,include}
chmod a+wt "${LFS_SRC}"

# Create /tools symlink
if [ -L "/tools" ]; then
    sudo rm -f /tools
fi
sudo ln -sv "${LFS_MNT}/tools" /tools

echo "✅ Directory structure created"
echo ""

# Set LFS environment
export LFS="${LFS_MNT}"
export LFS_SRC="${LFS_SRC}"
export LFS_TGT="$(uname -m)-lfs-linux-gnu"
export LC_ALL=POSIX
export PATH="/tools/bin:/usr/bin:/bin:/usr/sbin:/sbin"
export MAKEFLAGS="-j$(nproc)"

set +h
umask 022

echo "🔧 Environment configured:"
echo "   LFS=$LFS"
echo "   LFS_SRC=$LFS_SRC"
echo "   LFS_TGT=$LFS_TGT"
echo "   PATH=$PATH"
echo "   MAKEFLAGS=$MAKEFLAGS"
echo "   set +h: enabled"
echo "   umask: 022"
echo ""

# Verify all directories exist
echo "✓ Checking directories..."
for dir in "$LFS" "$LFS_SRC" "$LFS/bin" "$LFS/lib" "$LFS/lib64" "$LFS/tools"; do
    if [ -d "$dir" ]; then
        echo "  ✓ $dir"
    else
        echo "  ✗ $dir - MISSING!"
        exit 1
    fi
done
echo ""

# Check /tools symlink
if [ -L "/tools" ] && [ "$(readlink /tools)" = "${LFS}/tools" ]; then
    echo "✓ /tools -> $(readlink /tools)"
else
    echo "✗ /tools symlink incorrect!"
    exit 1
fi
echo ""

echo "✅ All checks passed!"
echo ""
echo "📥 Next step: Download a single test package"
echo ""

# Test download
cd "$LFS_SRC"
echo "Testing download of Binutils..."
wget -q --show-progress https://ftp.osuosl.org/pub/lfs/lfs-packages/12.0/binutils-2.41.tar.xz || {
    echo "❌ Download failed!"
    exit 1
}

echo ""
echo "✅ Download successful!"
echo "   File: $(ls -lh binutils-2.41.tar.xz)"
echo ""

# Test extraction
echo "Testing extraction..."
tar -xf binutils-2.41.tar.xz || {
    echo "❌ Extraction failed!"
    exit 1
}

echo "✅ Extraction successful!"
echo "   Directory: $(ls -ld binutils-2.41)"
echo ""

echo "╔════════════════════════════════════════════════════════╗"
echo "║  ✅ LOCAL TEST PASSED                                  ║"
echo "║  Environment is correctly configured                   ║"
echo "║  Ready to proceed with build                           ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "To continue with full build, run:"
echo "  cd binutils-2.41"
echo "  mkdir build && cd build"
echo "  ../configure --prefix=/tools --with-sysroot=\$LFS --target=\$LFS_TGT --disable-nls"
echo "  make"
echo "  make install"
