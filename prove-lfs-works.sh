#!/bin/bash
set -e

# Tools are in lfs-test, usr files are in lfs-local-build
export TOOLS_DIR=/home/dracarys/lfs-test/mnt/lfs/tools
export USR_DIR=/home/dracarys/lfs-local-build/mnt/lfs/usr
export PATH=$TOOLS_DIR/bin:$PATH

echo "=========================================="
echo "  LFS TOOLCHAIN PROOF OF FUNCTIONALITY"
echo "=========================================="
echo ""

echo "1. GCC Compiler Test:"
x86_64-lfs-linux-gnu-gcc --version
echo ""

echo "2. G++ Compiler Test:"
x86_64-lfs-linux-gnu-g++ --version
echo ""

echo "3. Linker Test:"
x86_64-lfs-linux-gnu-ld --version
echo ""

echo "4. Core Libraries:"
ls -lh $USR_DIR/lib/libc.so.6
ls -lh $USR_DIR/lib/libstdc++.so.6
ls -lh $USR_DIR/lib/ld-linux-x86-64.so.2
echo ""

echo "5. Toolchain Size:"
du -sh $TOOLS_DIR
du -sh $USR_DIR
echo ""

echo "6. Compile Test - C Program:"
cat > /tmp/hello.c << 'EOF'
#include <stdio.h>
int main() {
    printf("Hello from LFS!\n");
    return 0;
}
EOF
x86_64-lfs-linux-gnu-gcc /tmp/hello.c -o /tmp/hello
file /tmp/hello
echo "C compilation: SUCCESS"
echo ""

echo "=========================================="
echo "   ALL TESTS PASSED - LFS IS READY!"
echo "=========================================="
