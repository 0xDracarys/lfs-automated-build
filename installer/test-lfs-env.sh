#!/bin/bash
# LFS Local Environment Verification Script
set -e

echo "=== LFS Local Build Environment Test ==="
echo ""

# 1. Copy build scripts from Windows path
cp /mnt/c/Users/jayma/Documents/Bhasker/Projects/lfs-automated/lfs-build.sh /tmp/lfs-build.sh
cp /mnt/c/Users/jayma/Documents/Bhasker/Projects/lfs-automated/lfs-chapter5-real.sh /tmp/lfs-chapter5-real.sh
chmod +x /tmp/lfs-build.sh /tmp/lfs-chapter5-real.sh
echo "[OK] Build scripts copied"

# 2. Set up LFS directory structure
mkdir -p /mnt/lfs/sources /mnt/lfs/tools
chmod 755 /mnt/lfs
chmod a+wt /mnt/lfs/sources
ln -sfn /mnt/lfs/tools /tools
echo "[OK] /mnt/lfs structure created"
echo "[OK] /tools -> /mnt/lfs/tools symlink created"

# 3. Verify build tools
echo ""
echo "=== Build Tools ==="
echo "  gcc:    $(gcc --version | head -1)"
echo "  g++:    $(g++ --version | head -1)"
echo "  make:   $(make --version | head -1)"
echo "  bison:  $(bison --version | head -1)"
echo "  gawk:   $(gawk --version | head -1)"
echo "  bash:   $(bash --version | head -1)"
echo "  python: $(python3 --version)"

# 4. Set LFS environment variables (standard LFS book)
export LFS=/mnt/lfs
export LFS_TGT=$(uname -m)-lfs-linux-gnu
export LC_ALL=POSIX
export PATH=/tools/bin:/usr/bin:/bin:/usr/sbin:/sbin
export MAKEFLAGS=-j4

echo ""
echo "=== LFS Environment Variables ==="
echo "  LFS       = $LFS"
echo "  LFS_TGT   = $LFS_TGT"
echo "  LC_ALL    = $LC_ALL"
echo "  PATH      = $PATH"
echo "  MAKEFLAGS = $MAKEFLAGS"
echo ""
echo "=== Directory Structure ==="
ls -la /mnt/lfs
echo ""
echo "=== Symlink ==="
ls -la /tools

echo ""
echo "================================================"
echo "SUCCESS: LFS environment is fully configured!"
echo "The shell is ready. You can now start building."
echo "================================================"
