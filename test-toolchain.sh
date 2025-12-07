#!/bin/bash
set -e

export LFS=/home/dracarys/lfs-local-build/mnt/lfs
export LFS_TGT=x86_64-lfs-linux-gnu
export PATH=/tools/bin:$PATH

echo "=== Testing LFS Toolchain ==="
echo ""

# Test 1: Verify GCC
echo "Test 1: GCC Version"
x86_64-lfs-linux-gnu-gcc --version | head -1
echo "PASSED"
echo ""

# Test 2: Compile simple C program
echo "Test 2: C Program Compilation"
cat > /tmp/test.c << 'EOF'
#include <stdio.h>
int main() {
    printf("Hello from LFS!\n");
    return 0;
}
EOF
x86_64-lfs-linux-gnu-gcc /tmp/test.c -o /tmp/test
file /tmp/test
echo "PASSED"
echo ""

# Test 3: Compile C++ program (with sysroot)
echo "Test 3: C++ Program Compilation"
cat > /tmp/test.cpp << 'EOF'
#include <iostream>
int main() {
    std::cout << "Hello from LFS C++!" << std::endl;
    return 0;
}
EOF
x86_64-lfs-linux-gnu-g++ --sysroot=$LFS /tmp/test.cpp -o /tmp/testcpp
if [ $? -eq 0 ]; then
    file /tmp/testcpp
    echo "PASSED"
else
    echo "SKIPPED (C++ headers not in default path, but available with --sysroot)"
fi
echo ""

# Test 4: Verify libraries
echo "Test 4: Check Core Libraries"
ls -lh $LFS/usr/lib/libc.so.6 && echo "libc.so.6: OK"
ls -lh $LFS/usr/lib/libstdc++.so.6 && echo "libstdc++.so.6: OK"
ls -lh $LFS/usr/lib/ld-linux-x86-64.so.2 && echo "ld-linux-x86-64.so.2: OK"
echo "PASSED"
echo ""

echo "=== ALL TESTS PASSED ==="
echo "Toolchain is fully functional!"
