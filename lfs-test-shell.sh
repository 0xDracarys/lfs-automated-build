#!/bin/bash
# Interactive LFS Test Environment

export LFS=/home/dracarys/lfs-test/mnt/lfs
export LFS_TGT=x86_64-lfs-linux-gnu
export PATH=$LFS/tools/bin:$PATH
export LD_LIBRARY_PATH=$LFS/usr/lib:$LD_LIBRARY_PATH

echo "========================================"
echo "  LFS TOOLCHAIN TEST ENVIRONMENT"
echo "========================================"
echo ""
echo "Environment Variables:"
echo "  LFS=$LFS"
echo "  LFS_TGT=$LFS_TGT"
echo "  PATH=$PATH"
echo ""
echo "Available Commands:"
echo "  x86_64-lfs-linux-gnu-gcc     - C Compiler"
echo "  x86_64-lfs-linux-gnu-g++     - C++ Compiler"
echo "  x86_64-lfs-linux-gnu-ld      - Linker"
echo "  x86_64-lfs-linux-gnu-as      - Assembler"
echo "  x86_64-lfs-linux-gnu-ar      - Archiver"
echo ""
echo "Quick Tests:"
echo "  1. x86_64-lfs-linux-gnu-gcc --version"
echo "  2. ls -lh \$LFS/usr/lib/libc.so.6"
echo "  3. ls -lh \$LFS/usr/lib/libstdc++.so.6"
echo ""
echo "========================================"
echo ""

# Drop into interactive shell
exec bash
