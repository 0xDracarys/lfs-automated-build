#!/bin/bash
set -e
export LFS=/home/dracarys/lfs-local-build/mnt/lfs
export LFS_TGT=x86_64-lfs-linux-gnu
export PATH=/tools/bin:/usr/bin:/bin:/usr/sbin:/sbin
export MAKEFLAGS=-j12

cd $LFS/sources/gcc-13.2.0
rm -rf build-libstdcpp
mkdir -v build-libstdcpp
cd build-libstdcpp

../libstdc++-v3/configure \
    --host=$LFS_TGT \
    --build=$(../config.guess) \
    --prefix=/usr \
    --disable-multilib \
    --disable-nls \
    --disable-libstdcxx-pch \
    --with-gxx-include-dir=/tools/$LFS_TGT/include/c++/13.2.0

make -j12
make DESTDIR=$LFS install

# Remove libtool archive (not needed)
rm -v $LFS/usr/lib/libstdc++.la

echo "✅ Libstdc++ build complete!"
