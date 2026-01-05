#!/bin/bash
################################################################################
# COMPLETE LOCAL LFS BUILD - Chapter 5
# This builds the REAL cross-toolchain locally in WSL
################################################################################

set -euo pipefail

echo "╔════════════════════════════════════════════════════════╗"
echo "║  🏗️  COMPLETE LOCAL LFS BUILD                          ║"
echo "║  Linux From Scratch 12.0 - Chapter 5                   ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# ============================================================================
# SETUP ENVIRONMENT
# ============================================================================

# Use standard LFS path or custom test directory
TEST_DIR="${LFS_BUILD_DIR:-$HOME/lfs-local-build}"
LFS_MNT="${LFS:-/mnt/lfs}"
LFS_SRC="$LFS_MNT/sources"

echo "📁 Build Directory: $TEST_DIR"
echo "📁 LFS Mount Point: $LFS_MNT"
echo ""

# Clean previous build (only if using custom TEST_DIR)
if [ "$LFS_MNT" != "/mnt/lfs" ] && [ -d "$TEST_DIR" ]; then
    echo "⚠️  Cleaning previous build..."
    sudo rm -rf "$TEST_DIR"
    sudo rm -f /tools
fi

# Create directory structure
if [ ! -d "$LFS_MNT" ]; then
    mkdir -p "$(dirname $LFS_MNT)"
    mkdir -p "$LFS_MNT"
fi
mkdir -p "$LFS_SRC"

# Create complete LFS directory structure
mkdir -p "${LFS_MNT}"/{etc,var,bin,lib,sbin,tools}
mkdir -p "${LFS_MNT}/lib64"
mkdir -p "${LFS_MNT}/usr"/{bin,lib,sbin,include}
chmod a+wt "${LFS_SRC}"

# Create /tools symlink if needed
if [ ! -L "/tools" ]; then
    sudo ln -sv "${LFS_MNT}/tools" /tools
fi

# Set LFS environment
export LFS="${LFS_MNT}"
export LFS_SRC="${LFS_SRC}"
export LFS_TGT="$(uname -m)-lfs-linux-gnu"
export LC_ALL=POSIX
export PATH="/tools/bin:/usr/bin:/bin:/usr/sbin:/sbin"
export MAKEFLAGS="-j$(nproc)"

set +h
umask 022

echo "✅ Environment configured:"
echo "   LFS=$LFS"
echo "   LFS_TGT=$LFS_TGT"
echo "   MAKEFLAGS=$MAKEFLAGS"
echo ""

# ============================================================================
# DOWNLOAD ALL PACKAGES
# ============================================================================

echo "📥 Downloading LFS packages..."
cd "$LFS_SRC"

LFS_MIRROR="https://ftp.osuosl.org/pub/lfs/lfs-packages/12.0"

declare -A PACKAGES=(
    ["binutils-2.41.tar.xz"]="binutils"
    ["gcc-13.2.0.tar.xz"]="gcc"
    ["mpfr-4.2.0.tar.xz"]="mpfr"
    ["gmp-6.3.0.tar.xz"]="gmp"
    ["mpc-1.3.1.tar.gz"]="mpc"
    ["linux-6.4.12.tar.xz"]="linux"
    ["glibc-2.38.tar.xz"]="glibc"
)

for file in "${!PACKAGES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "  Downloading $file..."
        wget -q --show-progress "${LFS_MIRROR}/${file}"
    else
        echo "  ✓ $file (cached)"
    fi
done

echo ""
echo "✅ All packages downloaded"
echo ""

# ============================================================================
# BUILD BINUTILS PASS 1
# ============================================================================

echo "╔════════════════════════════════════════════════════════╗"
echo "║  🔨 BINUTILS PASS 1                                    ║"
echo "╚════════════════════════════════════════════════════════╝"

cd "$LFS_SRC"
tar -xf binutils-2.41.tar.xz
cd binutils-2.41

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

echo "🔨 Building..."
make

echo "📦 Installing..."
make install

cd "$LFS_SRC"
rm -rf binutils-2.41

echo "✅ Binutils Pass 1 completed"
echo ""

# ============================================================================
# BUILD GCC PASS 1
# ============================================================================

echo "╔════════════════════════════════════════════════════════╗"
echo "║  🔨 GCC PASS 1                                         ║"
echo "╚════════════════════════════════════════════════════════╝"

cd "$LFS_SRC"
tar -xf gcc-13.2.0.tar.xz
cd gcc-13.2.0

# Extract GCC prerequisites
tar -xf ../mpfr-4.2.0.tar.xz
mv -v mpfr-4.2.0 mpfr
tar -xf ../gmp-6.3.0.tar.xz
mv -v gmp-6.3.0 gmp
tar -xf ../mpc-1.3.1.tar.gz
mv -v mpc-1.3.1 mpc

# On x86_64, set default directory name for 64-bit libraries to "lib"
case $(uname -m) in
  x86_64)
    sed -e '/m64=/s/lib64/lib/' \
        -i.orig gcc/config/i386/t-linux64
  ;;
esac

mkdir -v build
cd build

echo "⚙️  Configuring..."
../configure \
    --target=$LFS_TGT \
    --prefix=/tools \
    --with-glibc-version=2.38 \
    --with-sysroot=$LFS \
    --with-newlib \
    --without-headers \
    --disable-nls \
    --disable-shared \
    --disable-multilib \
    --disable-decimal-float \
    --disable-threads \
    --disable-libatomic \
    --disable-libgomp \
    --disable-libquadmath \
    --disable-libssp \
    --disable-libvtv \
    --disable-libstdcxx \
    --enable-languages=c,c++

echo "🔨 Building..."
make

echo "📦 Installing..."
make install

cd "$LFS_SRC"
cd gcc-13.2.0

# Create limits.h
cat gcc/limitx.h gcc/glimits.h gcc/limity.h > \
  `dirname $($LFS_TGT-gcc -print-libgcc-file-name)`/install-tools/include/limits.h

cd "$LFS_SRC"
rm -rf gcc-13.2.0

echo "✅ GCC Pass 1 completed"
echo ""

# ============================================================================
# INSTALL LINUX HEADERS
# ============================================================================

echo "╔════════════════════════════════════════════════════════╗"
echo "║  🔨 LINUX API HEADERS                                  ║"
echo "╚════════════════════════════════════════════════════════╝"

cd "$LFS_SRC"
tar -xf linux-6.4.12.tar.xz
cd linux-6.4.12

echo "⚙️  Installing headers..."
make mrproper
make headers
find usr/include -type f ! -name '*.h' -delete
cp -rv usr/include $LFS/usr

cd "$LFS_SRC"
rm -rf linux-6.4.12

echo "✅ Linux Headers installed"
echo ""

# ============================================================================
# BUILD GLIBC
# ============================================================================

echo "╔════════════════════════════════════════════════════════╗"
echo "║  🔨 GLIBC (THE CRITICAL TEST)                          ║"
echo "╚════════════════════════════════════════════════════════╝"

cd "$LFS_SRC"
tar -xf glibc-2.38.tar.xz
cd glibc-2.38

case $(uname -m) in
    i?86)   ln -sfv ld-linux.so.2 $LFS/lib/ld-lsb.so.3
    ;;
    x86_64) ln -sfv ../lib/ld-linux-x86-64.so.2 $LFS/lib64
            ln -sfv ../lib/ld-linux-x86-64.so.2 $LFS/lib64/ld-lsb-x86-64.so.3
    ;;
esac

# Apply patch
patch -Np1 -i ../glibc-2.38-fhs-1.patch || echo "Patch not found, continuing..."

mkdir -v build
cd build

echo "⚙️  Configuring..."
echo "rootsbindir=/usr/sbin" > configparms

../configure \
    --prefix=/usr \
    --host=$LFS_TGT \
    --build=$(../scripts/config.guess) \
    --enable-kernel=4.14 \
    --with-headers=$LFS/usr/include \
    libc_cv_slibdir=/usr/lib

echo ""
echo "🔍 CHECKING KERNEL HEADERS..."
echo "This is the critical test - should see '4.14.0 or later'"
echo ""

echo "🔨 Building..."
make

echo "📦 Installing..."
make DESTDIR=$LFS install

# Fix ldd script
sed '/RTLDLIST=/s@/usr@@g' -i $LFS/usr/bin/ldd

cd "$LFS_SRC"
rm -rf glibc-2.38

echo "✅ Glibc completed"
echo ""

# ============================================================================
# BUILD LIBSTDC++ (GCC Pass 2 prerequisite)
# ============================================================================

echo "╔════════════════════════════════════════════════════════╗"
echo "║  🔨 LIBSTDC++ (from GCC)                               ║"
echo "╚════════════════════════════════════════════════════════╝"

cd "$LFS_SRC"
tar -xf gcc-13.2.0.tar.xz
cd gcc-13.2.0

mkdir -v build
cd build

echo "⚙️  Configuring..."
../libstdc++-v3/configure \
    --host=$LFS_TGT \
    --build=$(../config.guess) \
    --prefix=/usr \
    --disable-multilib \
    --disable-nls \
    --disable-libstdcxx-pch \
    --with-gxx-include-dir=/tools/$LFS_TGT/include/c++/13.2.0

echo "🔨 Building..."
make

echo "📦 Installing..."
make DESTDIR=$LFS install

# Remove libtool archive file
rm -v $LFS/usr/lib/libstdc++.la

cd "$LFS_SRC"
rm -rf gcc-13.2.0

echo "✅ Libstdc++ completed"
echo ""

# ============================================================================
# FINAL VERIFICATION
# ============================================================================

echo "╔════════════════════════════════════════════════════════╗"
echo "║  ✅ BUILD VERIFICATION                                 ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

echo "📊 Checking installed tools:"
echo ""
echo "Binutils:"
ls -lh /tools/bin/ | grep -E "(ld|as|ar)" | head -5
echo ""
echo "GCC:"
ls -lh /tools/bin/ | grep gcc | head -3
echo ""
echo "Libraries in \$LFS/usr/lib:"
ls -lh $LFS/usr/lib/ | head -10
echo ""
echo "Headers in \$LFS/usr/include:"
ls -d $LFS/usr/include/* | head -10
echo ""

# Test the toolchain
echo "🧪 Testing the toolchain:"
echo ""
echo "Test 1: Compiling a simple C program"
cat > /tmp/test.c << 'EOF'
#include <stdio.h>
int main() {
    printf("LFS Toolchain works!\n");
    return 0;
}
EOF

$LFS_TGT-gcc /tmp/test.c -o /tmp/test
if /tmp/test; then
    echo "✅ Test program compiled and ran successfully!"
else
    echo "❌ Test program failed to run"
fi
echo ""

# Create archive
echo "📦 Creating toolchain archive..."
cd "$TEST_DIR"
tar -czf lfs-toolchain-local.tar.gz mnt/
ARCHIVE_SIZE=$(du -h lfs-toolchain-local.tar.gz | cut -f1)
echo "✅ Archive created: lfs-toolchain-local.tar.gz ($ARCHIVE_SIZE)"
echo ""

echo "╔════════════════════════════════════════════════════════╗"
echo "║  🎉 CHAPTER 5 BUILD COMPLETE!                          ║"
echo "║                                                         ║"
echo "║  Built locally: $TEST_DIR"
echo "║  Archive: lfs-toolchain-local.tar.gz                   ║"
echo "║  Size: $ARCHIVE_SIZE"
echo "║                                                         ║"
echo "║  Next: Test this in a clean VM to verify it works     ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

echo "To test in a VM:"
echo "  1. Copy lfs-toolchain-local.tar.gz to VM"
echo "  2. Extract: tar -xzf lfs-toolchain-local.tar.gz"
echo "  3. Run test program inside extracted environment"
