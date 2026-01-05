#!/bin/bash
# build-minimal-bootable.sh - Automated build of 17 minimal packages for bootable LFS
set -e

# Initialize environment - Use standard path or environment variable
export LFS=${LFS:-/mnt/lfs}
export LFS_TGT=${LFS_TGT:-x86_64-lfs-linux-gnu}
export LFS_TOOLS=${LFS_TOOLS:-$LFS}
export PATH=$LFS_TOOLS/tools/bin:/usr/bin:/bin:/usr/sbin:/sbin
export MAKEFLAGS=${MAKEFLAGS:--j$(nproc)}

# Create directories
mkdir -p $LFS/sources
mkdir -p $LFS/usr/{bin,lib,include,sbin}
mkdir -p $LFS/etc
mkdir -p $LFS/var
mkdir -p $LFS/boot
mkdir -p $LFS/build-logs

# Build log
BUILDLOG="$LFS/build-logs/minimal-bootable-$(date +%Y%m%d-%H%M%S).log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$BUILDLOG"
}

download_if_needed() {
    local url=$1
    local filename=$(basename "$url")
    
    if [ -f "$LFS/sources/$filename" ]; then
        log "✓ Already downloaded: $filename"
        return 0
    fi
    
    log "⬇ Downloading: $filename"
    cd "$LFS/sources"
    wget -q --show-progress "$url" || {
        log "❌ Download failed: $url"
        return 1
    }
    log "✓ Downloaded: $filename"
}

extract_source() {
    local package=$1
    local sourcedir=$2
    
    cd "$LFS/sources"
    if [ -d "$sourcedir" ]; then
        log "✓ Already extracted: $sourcedir"
        return 0
    fi
    
    log "📦 Extracting: $package"
    tar -xf "$package"* 2>/dev/null || {
        log "❌ Extraction failed: $package"
        return 1
    }
    log "✓ Extracted: $sourcedir"
}

log "======================================"
log "  LFS MINIMAL BOOTABLE BUILD"
log "  Building 17 packages for bootable system"
log "======================================"
log ""
log "Environment:"
log "  LFS=$LFS"
log "  LFS_TGT=$LFS_TGT"
log "  LFS_TOOLS=$LFS_TOOLS"
log "  MAKEFLAGS=$MAKEFLAGS"
log ""

# ===== PACKAGE 1: M4 (needed by many packages) =====
log "===== [1/17] Building M4 ====="
download_if_needed "https://ftp.gnu.org/gnu/m4/m4-1.4.19.tar.xz"
extract_source "m4-1.4.19" "m4-1.4.19"
cd "$LFS/sources/m4-1.4.19"
log "Configuring M4..."
./configure --prefix=/usr --host=$LFS_TGT --build=$(build-aux/config.guess) >> "$BUILDLOG" 2>&1
log "Building M4..."
make -j12 >> "$BUILDLOG" 2>&1
log "Installing M4..."
make DESTDIR=$LFS install >> "$BUILDLOG" 2>&1
log "✅ M4 complete!"
log ""

# ===== PACKAGE 2: Ncurses (needed by bash) =====
log "===== [2/17] Building Ncurses ====="
download_if_needed "https://invisible-mirror.net/archives/ncurses/ncurses-6.4.tar.gz"
extract_source "ncurses-6.4" "ncurses-6.4"
cd "$LFS/sources/ncurses-6.4"
log "Configuring Ncurses..."
mkdir -p build
cd build
../configure --prefix=/usr \
    --host=$LFS_TGT \
    --build=$(../config.guess) \
    --mandir=/usr/share/man \
    --with-manpage-format=normal \
    --with-shared \
    --without-normal \
    --with-cxx-shared \
    --without-debug \
    --without-ada \
    --disable-stripping \
    --enable-widec >> "$BUILDLOG" 2>&1
log "Building Ncurses..."
make -j12 >> "$BUILDLOG" 2>&1
log "Installing Ncurses..."
make DESTDIR=$LFS TIC_PATH=$(pwd)/build/progs/tic install >> "$BUILDLOG" 2>&1
echo "INPUT(-lncursesw)" > $LFS/usr/lib/libncurses.so
log "✅ Ncurses complete!"
log ""

# ===== PACKAGE 3: Bash =====
log "===== [3/17] Building Bash ====="
download_if_needed "https://ftp.gnu.org/gnu/bash/bash-5.2.15.tar.gz"
extract_source "bash-5.2.15" "bash-5.2.15"
cd "$LFS/sources/bash-5.2.15"
log "Configuring Bash..."
./configure --prefix=/usr \
    --host=$LFS_TGT \
    --build=$(sh support/config.guess) \
    --without-bash-malloc >> "$BUILDLOG" 2>&1
log "Building Bash..."
make -j12 >> "$BUILDLOG" 2>&1
log "Installing Bash..."
make DESTDIR=$LFS install >> "$BUILDLOG" 2>&1
ln -svf bash $LFS/usr/bin/sh
log "✅ Bash complete!"
log ""

# ===== PACKAGE 4: Coreutils =====
log "===== [4/17] Building Coreutils ====="
download_if_needed "https://ftp.gnu.org/gnu/coreutils/coreutils-9.3.tar.xz"
extract_source "coreutils-9.3" "coreutils-9.3"
cd "$LFS/sources/coreutils-9.3"
log "Configuring Coreutils..."
./configure --prefix=/usr \
    --host=$LFS_TGT \
    --build=$(build-aux/config.guess) \
    --enable-install-program=hostname \
    --enable-no-install-program=kill,uptime >> "$BUILDLOG" 2>&1
log "Building Coreutils..."
make -j12 >> "$BUILDLOG" 2>&1
log "Installing Coreutils..."
make DESTDIR=$LFS install >> "$BUILDLOG" 2>&1
# Move to proper location
mv -v $LFS/usr/bin/chroot $LFS/usr/sbin || true
mkdir -pv $LFS/usr/share/man/man8 || true
mv -v $LFS/usr/share/man/man1/chroot.1 $LFS/usr/share/man/man8/chroot.8 || true
sed -i 's/"1"/"8"/' $LFS/usr/share/man/man8/chroot.8 || true
log "✅ Coreutils complete!"
log ""

# ===== PACKAGE 5: Diffutils =====
log "===== [5/17] Building Diffutils ====="
download_if_needed "https://ftp.gnu.org/gnu/diffutils/diffutils-3.10.tar.xz"
extract_source "diffutils-3.10" "diffutils-3.10"
cd "$LFS/sources/diffutils-3.10"
log "Configuring Diffutils..."
./configure --prefix=/usr --host=$LFS_TGT --build=$(./build-aux/config.guess) >> "$BUILDLOG" 2>&1
log "Building Diffutils..."
make -j12 >> "$BUILDLOG" 2>&1
log "Installing Diffutils..."
make DESTDIR=$LFS install >> "$BUILDLOG" 2>&1
log "✅ Diffutils complete!"
log ""

# ===== PACKAGE 6: File =====
log "===== [6/17] Building File ====="
download_if_needed "http://ftp.astron.com/pub/file/file-5.45.tar.gz"
extract_source "file-5.45" "file-5.45"
cd "$LFS/sources/file-5.45"
# Build native version first for host
mkdir -p build-native
cd build-native
log "Building native File for host..."
../configure --disable-bzlib --disable-libseccomp --disable-xzlib --disable-zlib >> "$BUILDLOG" 2>&1
make -j12 >> "$BUILDLOG" 2>&1
cd ..
# Now build target version
log "Configuring File for target..."
./configure --prefix=/usr --host=$LFS_TGT --build=$(./config.guess) >> "$BUILDLOG" 2>&1
log "Building File..."
make FILE_COMPILE=$(pwd)/build-native/src/file -j12 >> "$BUILDLOG" 2>&1
log "Installing File..."
make DESTDIR=$LFS install >> "$BUILDLOG" 2>&1
rm -v $LFS/usr/lib/libmagic.la || true
log "✅ File complete!"
log ""

# ===== PACKAGE 7: Findutils =====
log "===== [7/17] Building Findutils ====="
download_if_needed "https://ftp.gnu.org/gnu/findutils/findutils-4.9.0.tar.xz"
extract_source "findutils-4.9.0" "findutils-4.9.0"
cd "$LFS/sources/findutils-4.9.0"
log "Configuring Findutils..."
./configure --prefix=/usr \
    --localstatedir=/var/lib/locate \
    --host=$LFS_TGT \
    --build=$(build-aux/config.guess) >> "$BUILDLOG" 2>&1
log "Building Findutils..."
make -j12 >> "$BUILDLOG" 2>&1
log "Installing Findutils..."
make DESTDIR=$LFS install >> "$BUILDLOG" 2>&1
log "✅ Findutils complete!"
log ""

# ===== PACKAGE 8: Gawk =====
log "===== [8/17] Building Gawk ====="
download_if_needed "https://ftp.gnu.org/gnu/gawk/gawk-5.2.2.tar.xz"
extract_source "gawk-5.2.2" "gawk-5.2.2"
cd "$LFS/sources/gawk-5.2.2"
log "Configuring Gawk..."
sed -i 's/extras//' Makefile.in
./configure --prefix=/usr --host=$LFS_TGT --build=$(build-aux/config.guess) >> "$BUILDLOG" 2>&1
log "Building Gawk..."
make -j12 >> "$BUILDLOG" 2>&1
log "Installing Gawk..."
make DESTDIR=$LFS install >> "$BUILDLOG" 2>&1
log "✅ Gawk complete!"
log ""

# ===== PACKAGE 9: Grep =====
log "===== [9/17] Building Grep ====="
download_if_needed "https://ftp.gnu.org/gnu/grep/grep-3.11.tar.xz"
extract_source "grep-3.11" "grep-3.11"
cd "$LFS/sources/grep-3.11"
log "Configuring Grep..."
./configure --prefix=/usr --host=$LFS_TGT --build=$(./build-aux/config.guess) >> "$BUILDLOG" 2>&1
log "Building Grep..."
make -j12 >> "$BUILDLOG" 2>&1
log "Installing Grep..."
make DESTDIR=$LFS install >> "$BUILDLOG" 2>&1
log "✅ Grep complete!"
log ""

# ===== PACKAGE 10: Gzip =====
log "===== [10/17] Building Gzip ====="
download_if_needed "https://ftp.gnu.org/gnu/gzip/gzip-1.13.tar.xz"
extract_source "gzip-1.13" "gzip-1.13"
cd "$LFS/sources/gzip-1.13"
log "Configuring Gzip..."
./configure --prefix=/usr --host=$LFS_TGT >> "$BUILDLOG" 2>&1
log "Building Gzip..."
make -j12 >> "$BUILDLOG" 2>&1
log "Installing Gzip..."
make DESTDIR=$LFS install >> "$BUILDLOG" 2>&1
log "✅ Gzip complete!"
log ""

# ===== PACKAGE 11: Make =====
log "===== [11/17] Building Make ====="
download_if_needed "https://ftp.gnu.org/gnu/make/make-4.4.1.tar.gz"
extract_source "make-4.4.1" "make-4.4.1"
cd "$LFS/sources/make-4.4.1"
log "Configuring Make..."
./configure --prefix=/usr \
    --without-guile \
    --host=$LFS_TGT \
    --build=$(build-aux/config.guess) >> "$BUILDLOG" 2>&1
log "Building Make..."
make -j12 >> "$BUILDLOG" 2>&1
log "Installing Make..."
make DESTDIR=$LFS install >> "$BUILDLOG" 2>&1
log "✅ Make complete!"
log ""

# ===== PACKAGE 12: Patch =====
log "===== [12/17] Building Patch ====="
download_if_needed "https://ftp.gnu.org/gnu/patch/patch-2.7.6.tar.xz"
extract_source "patch-2.7.6" "patch-2.7.6"
cd "$LFS/sources/patch-2.7.6"
log "Configuring Patch..."
./configure --prefix=/usr --host=$LFS_TGT --build=$(build-aux/config.guess) >> "$BUILDLOG" 2>&1
log "Building Patch..."
make -j12 >> "$BUILDLOG" 2>&1
log "Installing Patch..."
make DESTDIR=$LFS install >> "$BUILDLOG" 2>&1
log "✅ Patch complete!"
log ""

# ===== PACKAGE 13: Sed =====
log "===== [13/17] Building Sed ====="
download_if_needed "https://ftp.gnu.org/gnu/sed/sed-4.9.tar.xz"
extract_source "sed-4.9" "sed-4.9"
cd "$LFS/sources/sed-4.9"
log "Configuring Sed..."
./configure --prefix=/usr --host=$LFS_TGT --build=$(./build-aux/config.guess) >> "$BUILDLOG" 2>&1
log "Building Sed..."
make -j12 >> "$BUILDLOG" 2>&1
log "Installing Sed..."
make DESTDIR=$LFS install >> "$BUILDLOG" 2>&1
log "✅ Sed complete!"
log ""

# ===== PACKAGE 14: Tar =====
log "===== [14/17] Building Tar ====="
download_if_needed "https://ftp.gnu.org/gnu/tar/tar-1.35.tar.xz"
extract_source "tar-1.35" "tar-1.35"
cd "$LFS/sources/tar-1.35"
log "Configuring Tar..."
./configure --prefix=/usr \
    --host=$LFS_TGT \
    --build=$(build-aux/config.guess) >> "$BUILDLOG" 2>&1
log "Building Tar..."
make -j12 >> "$BUILDLOG" 2>&1
log "Installing Tar..."
make DESTDIR=$LFS install >> "$BUILDLOG" 2>&1
log "✅ Tar complete!"
log ""

# ===== PACKAGE 15: Xz =====
log "===== [15/17] Building Xz ====="
download_if_needed "https://tukaani.org/xz/xz-5.4.4.tar.xz"
extract_source "xz-5.4.4" "xz-5.4.4"
cd "$LFS/sources/xz-5.4.4"
log "Configuring Xz..."
./configure --prefix=/usr \
    --host=$LFS_TGT \
    --build=$(build-aux/config.guess) \
    --disable-static >> "$BUILDLOG" 2>&1
log "Building Xz..."
make -j12 >> "$BUILDLOG" 2>&1
log "Installing Xz..."
make DESTDIR=$LFS install >> "$BUILDLOG" 2>&1
rm -v $LFS/usr/lib/liblzma.la || true
log "✅ Xz complete!"
log ""

# ===== PACKAGE 16: Binutils Pass 2 =====
log "===== [16/17] Building Binutils Pass 2 ====="
cd "$LFS/sources"
if [ ! -d "binutils-2.41" ]; then
    extract_source "binutils-2.41" "binutils-2.41"
fi
cd binutils-2.41
rm -rf build-pass2
mkdir -v build-pass2
cd build-pass2
log "Configuring Binutils Pass 2..."
../configure \
    --prefix=/usr \
    --build=$(../config.guess) \
    --host=$LFS_TGT \
    --disable-nls \
    --enable-shared \
    --enable-gprofng=no \
    --disable-werror \
    --enable-64-bit-bfd >> "$BUILDLOG" 2>&1
log "Building Binutils Pass 2..."
make -j12 >> "$BUILDLOG" 2>&1
log "Installing Binutils Pass 2..."
make DESTDIR=$LFS install >> "$BUILDLOG" 2>&1
rm -v $LFS/usr/lib/lib{bfd,ctf,ctf-nobfd,opcodes,sframe}.{a,la} || true
log "✅ Binutils Pass 2 complete!"
log ""

# ===== PACKAGE 17: GCC Pass 2 =====
log "===== [17/17] Building GCC Pass 2 ====="
cd "$LFS/sources"
if [ ! -d "gcc-13.2.0" ]; then
    extract_source "gcc-13.2.0" "gcc-13.2.0"
fi
cd gcc-13.2.0
rm -rf build-pass2
mkdir -v build-pass2
cd build-pass2
log "Configuring GCC Pass 2..."
mkdir -pv $LFS_TGT/libgcc
ln -s ../../../libgcc/gthr-posix.h $LFS_TGT/libgcc/gthr-default.h
../configure \
    --build=$(../config.guess) \
    --host=$LFS_TGT \
    --target=$LFS_TGT \
    LDFLAGS_FOR_TARGET=-L$PWD/$LFS_TGT/libgcc \
    --prefix=/usr \
    --with-build-sysroot=$LFS \
    --enable-default-pie \
    --enable-default-ssp \
    --disable-nls \
    --disable-multilib \
    --disable-libatomic \
    --disable-libgomp \
    --disable-libquadmath \
    --disable-libsanitizer \
    --disable-libssp \
    --disable-libvtv \
    --enable-languages=c,c++ >> "$BUILDLOG" 2>&1
log "Building GCC Pass 2... (this takes a while!)"
make -j12 >> "$BUILDLOG" 2>&1
log "Installing GCC Pass 2..."
make DESTDIR=$LFS install >> "$BUILDLOG" 2>&1
ln -sv gcc $LFS/usr/bin/cc
log "✅ GCC Pass 2 complete!"
log ""

log "======================================"
log "  ✅ MINIMAL BOOTABLE BUILD COMPLETE!"
log "======================================"
log ""
log "Built packages:"
log "  1. M4"
log "  2. Ncurses"
log "  3. Bash"
log "  4. Coreutils"
log "  5. Diffutils"
log "  6. File"
log "  7. Findutils"
log "  8. Gawk"
log "  9. Grep"
log "  10. Gzip"
log "  11. Make"
log "  12. Patch"
log "  13. Sed"
log "  14. Tar"
log "  15. Xz"
log "  16. Binutils Pass 2"
log "  17. GCC Pass 2"
log ""
log "Next steps:"
log "  - Build Linux kernel"
log "  - Install bootloader (GRUB)"
log "  - Configure system"
log "  - Create bootable image"
log ""
log "Build log saved to: $BUILDLOG"
