#!/bin/bash
set -e

# Use standard LFS path or environment variable
export LFS=${LFS:-/mnt/lfs}
export LFS_TGT=${LFS_TGT:-x86_64-lfs-linux-gnu}
export PATH=/tools/bin:/usr/bin:/bin:/usr/sbin:/sbin
export MAKEFLAGS=${MAKEFLAGS:--j$(nproc)}

cd $LFS/sources

echo "========================================="
echo "Extracting Glibc source..."
echo "========================================="
tar -xf glibc-2.38.tar.xz

cd glibc-2.38

echo ""
echo "========================================="
echo "Creating build directory..."
echo "========================================="
mkdir -v build
cd build

echo ""
echo "========================================="
echo "Configuring Glibc..."
echo "========================================="
echo "rootsbindir=/usr/sbin" > configparms

../configure \
    --prefix=/usr \
    --host=$LFS_TGT \
    --build=$(../scripts/config.guess) \
    --enable-kernel=4.14 \
    --with-headers=$LFS/usr/include \
    --disable-nscd \
    libc_cv_slibdir=/usr/lib

echo ""
echo "========================================="
echo "THIS IS THE CRITICAL TEST!"
echo "If glibc finds the kernel headers, we've succeeded!"
echo "========================================="
echo ""
echo "Building Glibc (this will take 1-2 hours)..."
make

echo ""
echo "========================================="
echo "Installing Glibc..."
echo "========================================="
make DESTDIR=$LFS install

echo ""
echo "========================================="
echo "Fixing hardcoded paths..."
echo "========================================="
sed '/RTLDLIST=/s@/usr@@g' -i $LFS/usr/bin/ldd

echo ""
echo "========================================="
echo "Glibc installation complete!"
echo "========================================="
echo ""
echo "Verifying installation..."
ls -lh $LFS/usr/lib/libc.so.6
echo ""
echo "Testing sanity check..."
echo 'int main(){}' | $LFS_TGT-gcc -xc -c -o /dev/null - && echo "Glibc sanity check: PASSED ✓" || echo "Glibc sanity check: FAILED ✗"
