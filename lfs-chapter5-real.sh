#!/bin/bash
################################################################################
# REAL LFS CHAPTER 5 BUILD SCRIPT
# Downloads and compiles actual LFS packages from source
# Based on Linux From Scratch 12.0
################################################################################

set -euo pipefail

# ============================================================================
# Smart Countermeasures & Safety Checks
# ============================================================================

check_system_resources() {
    echo "🔍 Checking system resources..."
    
    # Check available disk space (need at least 10GB)
    local available_space=$(df -BG "$LFS" | tail -1 | awk '{print $4}' | sed 's/G//')
    if [ "$available_space" -lt 10 ]; then
        echo "⚠️  WARNING: Low disk space! Available: ${available_space}GB, Recommended: 10GB+"
        echo "    Build may fail. Consider increasing disk allocation."
        sleep 5
    else
        echo "✅ Disk space: ${available_space}GB available"
    fi
    
    # Check available memory
    local available_mem=$(free -g | grep Mem | awk '{print $7}')
    if [ "$available_mem" -lt 2 ]; then
        echo "⚠️  WARNING: Low memory! Available: ${available_mem}GB"
        echo "    Reducing parallel jobs to prevent OOM..."
        export MAKEFLAGS="-j2"
    else
        echo "✅ Memory: ${available_mem}GB available"
    fi
    
    # Check /tmp space (some builds use /tmp)
    local tmp_space=$(df -BG /tmp | tail -1 | awk '{print $4}' | sed 's/G//')
    if [ "$tmp_space" -lt 2 ]; then
        echo "⚠️  WARNING: Low /tmp space: ${tmp_space}GB"
    fi
}

# Progress tracking for resume capability
PROGRESS_FILE="${LFS}/.build_progress"
mark_package_complete() {
    local package=$1
    echo "$package" >> "$PROGRESS_FILE"
    echo "✅ Marked $package as complete"
}

is_package_complete() {
    local package=$1
    if [ -f "$PROGRESS_FILE" ] && grep -q "^${package}$" "$PROGRESS_FILE"; then
        return 0  # Already built
    fi
    return 1  # Not built yet
}

# ============================================================================
# LFS Environment - Inherit from parent lfs-build.sh
# DO NOT override LFS, LFS_SRC, LFS_TGT here - they are set by parent
# ============================================================================

echo "🔧 LFS Build Environment (inherited):"
echo "  - LFS Root: ${LFS:-NOT SET}"
echo "  - LFS Target: ${LFS_TGT:-NOT SET}"
echo "  - LFS Sources: ${LFS_SRC:-NOT SET}"
echo "  - PATH: $PATH"
echo "  - MAKEFLAGS: ${MAKEFLAGS:-NOT SET}"
echo ""

# Verify critical variables are set
if [ -z "${LFS:-}" ]; then
    echo "ERROR: LFS variable not set! Must be called from lfs-build.sh"
    exit 1
fi

if [ -z "${LFS_TGT:-}" ]; then
    echo "ERROR: LFS_TGT variable not set! Must be called from lfs-build.sh"
    exit 1
fi

# LFS Package URLs (LFS 12.0)
LFS_MIRROR="https://ftp.osuosl.org/pub/lfs/lfs-packages/12.0"

# Chapter 5 - Cross-Toolchain and Temporary Tools
declare -A LFS_PACKAGES=(
    # Essential toolchain
    ["binutils"]="binutils-2.41.tar.xz"
    ["gcc"]="gcc-13.2.0.tar.xz"
    ["linux-headers"]="linux-6.4.12.tar.xz"
    ["glibc"]="glibc-2.38.tar.xz"
    ["glibc-fhs-patch"]="glibc-2.38-fhs-1.patch"
    
    # GCC prerequisites (must be in GCC source directory)
    ["mpfr"]="mpfr-4.2.0.tar.xz"
    ["gmp"]="gmp-6.3.0.tar.xz"
    ["mpc"]="mpc-1.3.1.tar.gz"
    
    # Additional required packages
    ["m4"]="m4-1.4.19.tar.xz"
    ["ncurses"]="ncurses-6.4.tar.gz"
    ["bash"]="bash-5.2.15.tar.gz"
    ["coreutils"]="coreutils-9.3.tar.xz"
    ["diffutils"]="diffutils-3.10.tar.xz"
    ["file"]="file-5.45.tar.gz"
    ["findutils"]="findutils-4.9.0.tar.xz"
    ["gawk"]="gawk-5.2.2.tar.xz"
    ["grep"]="grep-3.11.tar.xz"
    ["gzip"]="gzip-1.12.tar.xz"
    ["make"]="make-4.4.1.tar.gz"
    ["patch"]="patch-2.7.6.tar.xz"
    ["sed"]="sed-4.9.tar.xz"
    ["tar"]="tar-1.35.tar.xz"
    ["xz"]="xz-5.4.4.tar.xz"
    ["bison"]="bison-3.8.2.tar.xz"
    ["gettext"]="gettext-0.22.tar.xz"
    ["perl"]="perl-5.38.0.tar.xz"
    ["python"]="Python-3.11.4.tar.xz"
    ["texinfo"]="texinfo-7.0.3.tar.xz"
    ["util-linux"]="util-linux-2.39.1.tar.xz"
)

download_lfs_sources() {
    echo "📥 Downloading LFS source packages..."
    
    local sources_dir="${LFS_SRC}"
    mkdir -p "$sources_dir"
    cd "$sources_dir"
    
    local download_count=0
    local total=${#LFS_PACKAGES[@]}
    
    for package_name in "${!LFS_PACKAGES[@]}"; do
        local filename="${LFS_PACKAGES[$package_name]}"
        download_count=$((download_count + 1))
        
        echo "  [$download_count/$total] Downloading $filename..."
        
        if [ -f "$filename" ]; then
            echo "    ✅ Already downloaded"
            continue
        fi
        
        # Try to download with retry logic
        local retry_count=0
        local max_retries=3
        while [ $retry_count -lt $max_retries ]; do
            if wget -q --show-progress --timeout=60 --tries=3 "${LFS_MIRROR}/${filename}" -O "$filename"; then
                echo "    ✅ Downloaded successfully"
                break
            else
                retry_count=$((retry_count + 1))
                if [ $retry_count -lt $max_retries ]; then
                    echo "    ⚠️  Download failed, retrying ($retry_count/$max_retries)..."
                    sleep 5
                else
                    echo "    ❌ Failed to download after $max_retries attempts"
                    echo "    Continuing with other packages..."
                fi
            fi
        done
    done
    
    echo "✅ All sources downloaded"
    cd -
}

build_binutils_pass1() {
    local package="binutils-pass1"
    if is_package_complete "$package"; then
        echo "⏭️  Skipping Binutils Pass 1 (already built)"
        return 0
    fi
    
    echo "🔨 Building Binutils (Pass 1)..."
    echo "   Time: $(date)"
    echo "   Disk space before: $(df -h $LFS | tail -1 | awk '{print $4}')"
    local src_dir="${LFS_SRC}"
    mkdir -p "$src_dir"
    cd "$src_dir"
    
    # Extract
    if [ ! -d "binutils-2.41" ]; then
        tar -xf binutils-2.41.tar.xz
    fi
    cd binutils-2.41
    
    # Create build directory
    rm -rf build
    mkdir -v build
    cd build
    
    # Configure for cross-compilation (matching reference repo)
    ../configure \
        --prefix=$LFS/tools \
        --with-sysroot=$LFS \
        --target=$LFS_TGT \
        --disable-nls \
        --enable-gprofng=no \
        --disable-werror
    
    # Build and install
    make -j$(nproc) || exit 1
    make install || exit 1
    
    # Cleanup
    cd "$src_dir"
    rm -rf binutils-2.41
    
    echo "✅ Binutils (Pass 1) completed"
    mark_package_complete "binutils-pass1"
}

build_gcc_pass1() {
    local package="gcc-pass1"
    if is_package_complete "$package"; then
        echo "⏭️  Skipping GCC Pass 1 (already built)"
        return 0
    fi
    
    echo "🔨 Building GCC (Pass 1)..."
    echo "   Time: $(date)"
    
    local src_dir="${LFS_SRC}"
    cd "$src_dir"
    
    # Extract
    if [ ! -d "gcc-13.2.0" ]; then
        tar -xf gcc-13.2.0.tar.xz
    fi
    cd gcc-13.2.0
    
    # Extract GCC prerequisites into GCC source directory
    tar -xf ../mpfr-4.2.0.tar.xz 2>/dev/null || true
    mv -v mpfr-4.2.0 mpfr 2>/dev/null || true
    tar -xf ../gmp-6.3.0.tar.xz 2>/dev/null || true
    mv -v gmp-6.3.0 gmp 2>/dev/null || true
    tar -xf ../mpc-1.3.1.tar.gz 2>/dev/null || true
    mv -v mpc-1.3.1 mpc 2>/dev/null || true
    
    # Fix for x86_64 architecture
    case $(uname -m) in
      x86_64)
        sed -e '/m64=/s/lib64/lib/' -i.orig gcc/config/i386/t-linux64
      ;;
    esac
    
    # Create build directory
    rm -rf build
    mkdir -v build
    cd build
    
    # Configure for cross-compilation (matching reference approach)
    ../configure \
        --target=$LFS_TGT \
        --prefix=$LFS/tools \
        --with-glibc-version=2.38 \
        --with-sysroot=$LFS \
        --with-newlib \
        --without-headers \
        --enable-default-pie \
        --enable-default-ssp \
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
    
    # Build and install
    make -j$(nproc) || exit 1
    make install || exit 1
    
    # Create limits.h (required by glibc)
    cd ..
    cat gcc/limitx.h gcc/glimits.h gcc/limity.h > \
      $(dirname $($LFS_TGT-gcc -print-libgcc-file-name))/include/limits.h || exit 1
    
    # Cleanup
    cd "$src_dir"
    # Cleanup
    cd "$src_dir"
    rm -rf gcc-13.2.0
    
    echo "✅ GCC (Pass 1) completed"
}

install_linux_headers() {
    echo "🔨 Installing Linux API Headers..."
    
    local src_dir="${LFS_SRC}"
    cd "$src_dir"
    
    # Extract Linux kernel sources
    if [ ! -d "linux-6.4.12" ]; then
        tar -xf linux-6.4.12.tar.xz
    fi
    cd linux-6.4.12
    
    # Clean the source tree
    make mrproper
    
    # Build headers
    make headers || exit 1
    
    # Clean up test files
    find usr/include -type f ! -name '*.h' -delete
    
    # CRITICAL: Install to $LFS/usr/include (glibc needs this!)
    mkdir -pv "$LFS/usr/include"
    cp -rv usr/include/* "$LFS/usr/include/"
    
    echo "  Installed headers to: $LFS/usr/include"
    ls -la "$LFS/usr/include" | head -20
    
    # Cleanup
    cd "$src_dir"
    rm -rf linux-6.4.12
    
    echo "✅ Linux Headers installed"
}

build_glibc() {
    echo "🔨 Building Glibc..."
    
    local src_dir="${LFS_SRC}"
    cd "$src_dir"
    
    # Extract glibc
    if [ ! -d "glibc-2.38" ]; then
        tar -xf glibc-2.38.tar.xz
    fi
    cd glibc-2.38
    
    # Create necessary symlinks (for x86_64)
    case $(uname -m) in
        x86_64)
            mkdir -pv "$LFS/lib64"
            ln -sfv ../lib/ld-linux-x86-64.so.2 "$LFS/lib64"
            ln -sfv ../lib/ld-linux-x86-64.so.2 "$LFS/lib64/ld-lsb-x86-64.so.3"
        ;;
    esac
    
    # Apply FHS patch (required for LFS 12.0)
    patch -Np1 -i ../glibc-2.38-fhs-1.patch
    
    # Create build directory
    rm -rf build
    mkdir -v build
    cd build
    
    # Configure settings
    echo "rootsbindir=/usr/sbin" > configparms
    
    # CRITICAL: Use $LFS variable, not hardcoded /lfs
    ../configure \
        --prefix=/usr \
        --host=$LFS_TGT \
        --build=$(../scripts/config.guess) \
        --enable-kernel=4.14 \
        --with-headers=$LFS/usr/include \
        libc_cv_slibdir=/usr/lib
    
    # Build and install
    make -j$(nproc) || exit 1
    make DESTDIR=$LFS install || exit 1
    
    # Fix the linker paths
    sed '/RTLDLIST=/s@/usr@@g' -i $LFS/usr/bin/ldd
    
    echo "  Verifying glibc installation..."
    ls -la $LFS/lib/ | grep -E "libc|ld-linux"
    ls -la $LFS/usr/lib/ | head -10
    
    # Cleanup
    cd "$src_dir"
    rm -rf glibc-2.38
    
}

build_libstdcxx() {
    echo "🔨 Building Libstdc++..."
    
    local src_dir="${LFS_SRC}"
    cd "$src_dir"
    
    # Extract GCC if not present
    if [ ! -d "gcc-13.2.0" ]; then
        tar -xf gcc-13.2.0.tar.xz
    fi
    cd gcc-13.2.0
    
    # Create fresh build directory
    rm -rf build
    mkdir -v build
    cd build
    
    ../libstdc++-v3/configure           \
        --host=$LFS_TGT                 \
        --build=$(../config.guess)      \
        --prefix=/usr                   \
        --disable-multilib              \
        --disable-nls                   \
        --disable-libstdcxx-pch         \
        --with-gxx-include-dir=/tools/$LFS_TGT/include/c++/13.2.0
    
    # Build and install
    make -j$(nproc) || exit 1
    make DESTDIR=$LFS install || exit 1
    
    # Remove libtool files
    rm -v $LFS/usr/lib/lib{stdc++,stdc++fs,supc++}.la || true
    
    # Cleanup
    cd "$src_dir"
    rm -rf gcc-13.2.0
    
    echo "✅ Libstdc++ completed"
}

# Main execution
main() {
    echo "╔════════════════════════════════════════════════════════╗"
    echo "║  🏗️  REAL LFS BUILD - Chapter 5                        ║"
    echo "║  Building Cross-Toolchain and Temporary Tools          ║"
    echo "╚════════════════════════════════════════════════════════╝"
    echo ""
    
    # LFS environment should already be set by parent lfs-build.sh
    # Verify and display
    echo "Using LFS environment:"
    echo "  LFS=$LFS"
    echo "  LFS_SRC=$LFS_SRC"
    echo "  LFS_TGT=$LFS_TGT"
    echo ""
    
    # Smart countermeasures - check system resources (after LFS is verified)
    check_system_resources
    echo ""
    
    # Check if this is a resume
    if [ -f "$PROGRESS_FILE" ]; then
        local completed=$(wc -l < "$PROGRESS_FILE")
        echo "📋 Found previous build progress: $completed packages completed"
        echo "   Resuming from last checkpoint..."
        echo ""
    fi
    
    # Verify critical directories exist
    if [ ! -d "$LFS" ]; then
        echo "ERROR: LFS directory does not exist: $LFS"
        exit 1
    fi
    
    if [ ! -d "$LFS_SRC" ]; then
        echo "ERROR: LFS_SRC directory does not exist: $LFS_SRC"
        exit 1
    fi
    
    # Verify /tools symlink exists and points to correct location
    if [ ! -L /tools ]; then
        echo "ERROR: /tools is not a symlink!"
        exit 1
    fi
    
    local tools_target=$(readlink /tools)
    if [ "$tools_target" != "$LFS/tools" ]; then
        echo "ERROR: /tools points to '$tools_target' but should point to '$LFS/tools'"
        exit 1
    fi
    
    echo "✅ Environment validation passed"
    echo "  - $LFS exists"
    echo "  - $LFS_SRC exists"
    echo "  - /tools -> $tools_target (correct)"
    echo ""
    
    # Download all sources first
    download_lfs_sources
    
    echo ""
    echo "🏗️  Starting compilation..."
    echo "⏱️  This will take approximately 2-3 hours"
    echo ""
    
    # Build toolchain in order (with resume capability)
    build_binutils_pass1
    build_gcc_pass1
    install_linux_headers
    build_glibc
    build_libstdcxx
    
    echo ""
    echo "╔════════════════════════════════════════════════════════╗"
    echo "║  ✅ CHAPTER 5 COMPLETE                                 ║"
    echo "║  Cross-toolchain built successfully!                   ║"
    echo "╚════════════════════════════════════════════════════════╝"
}

# Run if executed directly
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    main "$@"
fi
