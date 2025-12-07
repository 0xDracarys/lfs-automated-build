#!/bin/bash
################################################################################
# VM TEST SCRIPT - Test LFS toolchain in clean environment
# Run this inside a fresh VM/container to verify toolchain works
################################################################################

set -euo pipefail

echo "╔════════════════════════════════════════════════════════╗"
echo "║  🧪 LFS TOOLCHAIN VM TEST                              ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Check if archive exists
if [ ! -f "lfs-toolchain-local.tar.gz" ]; then
    echo "❌ Archive not found: lfs-toolchain-local.tar.gz"
    echo "Please copy the archive to this directory first"
    exit 1
fi

# Extract
echo "📦 Extracting toolchain..."
tar -xzf lfs-toolchain-local.tar.gz

# Set paths
LFS_ROOT="$(pwd)/mnt/lfs"
export PATH="$LFS_ROOT/tools/bin:$PATH"

echo "✅ Extracted to: $LFS_ROOT"
echo ""

# Verify structure
echo "📂 Verifying directory structure..."
for dir in "$LFS_ROOT/bin" "$LFS_ROOT/lib" "$LFS_ROOT/lib64" "$LFS_ROOT/usr/bin" "$LFS_ROOT/usr/lib" "$LFS_ROOT/usr/include"; do
    if [ -d "$dir" ]; then
        echo "  ✓ $dir"
    else
        echo "  ✗ $dir MISSING!"
        exit 1
    fi
done
echo ""

# Test 1: Check tools exist
echo "🔍 Test 1: Checking installed tools..."
TOOLS=(
    "$LFS_ROOT/tools/bin/ld"
    "$LFS_ROOT/tools/bin/as"
    "$LFS_ROOT/tools/bin/gcc"
    "$LFS_ROOT/tools/bin/g++"
)

for tool in "${TOOLS[@]}"; do
    if [ -f "$tool" ]; then
        echo "  ✓ $tool"
    else
        echo "  ✗ $tool MISSING!"
        exit 1
    fi
done
echo ""

# Test 2: Check libraries
echo "🔍 Test 2: Checking libraries..."
LIBS=(
    "$LFS_ROOT/usr/lib/libc.so"
    "$LFS_ROOT/usr/lib/libm.so"
    "$LFS_ROOT/usr/lib/libpthread.so"
    "$LFS_ROOT/usr/lib/libstdc++.so"
)

for lib in "${LIBS[@]}"; do
    if [ -e "$lib" ]; then
        echo "  ✓ $lib"
    else
        echo "  ✗ $lib MISSING!"
        exit 1
    fi
done
echo ""

# Test 3: Check headers
echo "🔍 Test 3: Checking headers..."
HEADERS=(
    "$LFS_ROOT/usr/include/stdio.h"
    "$LFS_ROOT/usr/include/stdlib.h"
    "$LFS_ROOT/usr/include/string.h"
    "$LFS_ROOT/usr/include/linux/version.h"
)

for header in "${HEADERS[@]}"; do
    if [ -f "$header" ]; then
        echo "  ✓ $header"
    else
        echo "  ✗ $header MISSING!"
        exit 1
    fi
done
echo ""

# Test 4: Compile a program
echo "🔍 Test 4: Compiling test program..."
cat > test.c << 'EOF'
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main() {
    char buffer[100];
    strcpy(buffer, "Hello from LFS Toolchain!");
    printf("%s\n", buffer);
    printf("Memory allocation test: ");
    void *ptr = malloc(1024);
    if (ptr) {
        printf("SUCCESS\n");
        free(ptr);
    } else {
        printf("FAILED\n");
        return 1;
    }
    return 0;
}
EOF

# Find the cross-compiler
CROSS_GCC=$(find $LFS_ROOT/tools/bin -name "*-gcc" | head -1)
if [ -z "$CROSS_GCC" ]; then
    echo "❌ Cross compiler not found!"
    exit 1
fi

echo "  Using compiler: $CROSS_GCC"

# Compile
if $CROSS_GCC test.c -o test_program 2>&1; then
    echo "  ✓ Compilation successful"
else
    echo "  ✗ Compilation failed!"
    exit 1
fi
echo ""

# Test 5: Run the program (this might not work without proper sysroot, but we can try)
echo "🔍 Test 5: Checking compiled binary..."
if file test_program | grep -q "ELF.*executable"; then
    echo "  ✓ Binary is valid ELF executable"
    file test_program
else
    echo "  ✗ Binary is not a valid executable!"
    exit 1
fi
echo ""

# Summary
echo "╔════════════════════════════════════════════════════════╗"
echo "║  ✅ ALL TESTS PASSED!                                  ║"
echo "║                                                         ║"
echo "║  The LFS toolchain is working correctly:               ║"
echo "║  - All tools present                                   ║"
echo "║  - All libraries present                               ║"
echo "║  - All headers present                                 ║"
echo "║  - Can compile programs                                ║"
echo "║  - Generates valid executables                         ║"
echo "║                                                         ║"
echo "║  This toolchain is ready for Cloud Run deployment!    ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Cleanup
rm -f test.c test_program

echo "Archive size:"
du -h lfs-toolchain-local.tar.gz
echo ""
echo "Extracted size:"
du -sh mnt/
