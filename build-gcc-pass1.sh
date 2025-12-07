#!/bin/bash
set -e

export LFS=/home/dracarys/lfs-local-build/mnt/lfs
export LFS_TGT=x86_64-lfs-linux-gnu
export PATH=/tools/bin:/usr/bin:/bin:/usr/sbin:/sbin
export MAKEFLAGS=-j12

cd $LFS/sources/gcc-13.2.0/build

echo "Configuring GCC Pass 1..."
../configure \
    --target=$LFS_TGT \
    --prefix=/tools \
    --with-glibc-version=2.38 \
    --with-sysroot=$LFS \
    --with-newlib \
    --without-headers \
    --enable-default-pie \
    --enable-default-ssp \
    --disable-nls \
    --disable-shared \
    --disable-multilib \
    --disable-threads \
    --disable-libatomic \
    --disable-libgomp \
    --disable-libquadmath \
    --disable-libssp \
    --disable-libvtv \
    --disable-libstdcxx \
    --enable-languages=c,c++

echo ""
echo "========================================="
echo "Configuration complete!"
echo "========================================="
echo ""
echo "Building GCC Pass 1 (this will take 30-45 minutes)..."
make

echo ""
echo "========================================="
echo "Build complete! Installing..."
echo "========================================="
echo ""
make install

echo ""
echo "========================================="
echo "GCC Pass 1 installation complete!"
echo "========================================="
echo ""
echo "Verifying installation..."
$LFS_TGT-gcc --version
