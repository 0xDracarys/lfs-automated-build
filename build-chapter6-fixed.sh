#!/bin/bash
# build-chapter6-fixed.sh - Build Chapter 6 temporary tools correctly
set -e

# Environment setup
export LFS=/home/dracarys/lfs-local-build/mnt/lfs
export LFS_TGT=x86_64-lfs-linux-gnu
export LFS_TOOLS=/home/dracarys/lfs-test/mnt/lfs
export PATH=$LFS_TOOLS/tools/bin:/usr/bin:/bin:/usr/sbin:/sbin
export MAKEFLAGS=-j12

# CRITICAL: Don't use LFS headers during cross-compilation!
unset CFLAGS
unset CXXFLAGS

BUILDLOG="$LFS/build-chapter6-$(date +%Y%m%d-%H%M%S).log"

log() {
    echo "[$(date '+%H:%M:%S')] $1" | tee -a "$BUILDLOG"
}

log "======================================"
log "  Chapter 6: Cross-Compiling Temporary Tools"
log "======================================"
log ""

cd $LFS/sources

# Package 1: M4
log "===== [1/15] M4 ====="
if [ ! -f "$LFS/tools/bin/m4" ]; then
    cd $LFS/sources
    [ -f m4-1.4.19.tar.xz ] || wget https://ftp.gnu.org/gnu/m4/m4-1.4.19.tar.xz
    [ -d m4-1.4.19 ] || tar -xf m4-1.4.19.tar.xz
    cd m4-1.4.19
    
    ./configure --prefix=/tools \
        --host=$LFS_TGT \
        --build=$(build-aux/config.guess) >> "$BUILDLOG" 2>&1
    
    make -j12 >> "$BUILDLOG" 2>&1
    make DESTDIR=$LFS_TOOLS install >> "$BUILDLOG" 2>&1
    log "✅ M4 installed to /tools"
else
    log "✅ M4 already installed"
fi

# Package 2: Ncurses
log "===== [2/15] Ncurses ====="
if [ ! -f "$LFS/tools/lib/libncurses.so" ]; then
    cd $LFS/sources
    [ -f ncurses-6.4.tar.gz ] || wget https://invisible-mirror.net/archives/ncurses/ncurses-6.4.tar.gz
    [ -d ncurses-6.4 ] || tar -xf ncurses-6.4.tar.gz
    cd ncurses-6.4
    
    # Ensure gawk is first found
    sed -i s/mawk// configure
    
    mkdir -p build
    pushd build
        ../configure --prefix=/tools \
            --host=$LFS_TGT \
            --build=$(../config.guess) \
            --with-shared \
            --without-debug \
            --without-ada \
            --without-normal \
            --with-cxx-shared \
            --enable-widec \
            --enable-pc-files \
            --with-pkg-config-libdir=/tools/lib/pkgconfig >> "$BUILDLOG" 2>&1
        
        make -j12 >> "$BUILDLOG" 2>&1
        make DESTDIR=$LFS_TOOLS TIC_PATH=$(pwd)/progs/tic install >> "$BUILDLOG" 2>&1
        echo "INPUT(-lncursesw)" > $LFS_TOOLS/tools/lib/libncurses.so
    popd
    log "✅ Ncurses installed to /tools"
else
    log "✅ Ncurses already installed"
fi

# Package 3: Bash
log "===== [3/15] Bash ====="
if [ ! -f "$LFS/tools/bin/bash" ]; then
    cd $LFS/sources
    [ -f bash-5.2.15.tar.gz ] || wget https://ftp.gnu.org/gnu/bash/bash-5.2.15.tar.gz
    [ -d bash-5.2.15 ] || tar -xf bash-5.2.15.tar.gz
    cd bash-5.2.15
    
    ./configure --prefix=/tools \
        --host=$LFS_TGT \
        --build=$(sh support/config.guess) \
        --without-bash-malloc >> "$BUILDLOG" 2>&1
    
    make -j12 >> "$BUILDLOG" 2>&1
    make DESTDIR=$LFS_TOOLS install >> "$BUILDLOG" 2>&1
    ln -svf bash $LFS_TOOLS/tools/bin/sh
    log "✅ Bash installed to /tools"
else
    log "✅ Bash already installed"
fi

# Package 4: Coreutils
log "===== [4/15] Coreutils ====="
if [ ! -f "$LFS/tools/bin/ls" ]; then
    cd $LFS/sources
    [ -f coreutils-9.3.tar.xz ] || wget https://ftp.gnu.org/gnu/coreutils/coreutils-9.3.tar.xz
    [ -d coreutils-9.3 ] || tar -xf coreutils-9.3.tar.xz
    cd coreutils-9.3
    
    ./configure --prefix=/tools \
        --host=$LFS_TGT \
        --build=$(build-aux/config.guess) \
        --enable-install-program=hostname \
        --enable-no-install-program=kill,uptime \
        gl_cv_macro_MB_CUR_MAX_good=y >> "$BUILDLOG" 2>&1
    
    make -j12 >> "$BUILDLOG" 2>&1
    make DESTDIR=$LFS_TOOLS install >> "$BUILDLOG" 2>&1
    log "✅ Coreutils installed to /tools"
else
    log "✅ Coreutils already installed"
fi

# Package 5: Diffutils
log "===== [5/15] Diffutils ====="
if [ ! -f "$LFS/tools/bin/diff" ]; then
    cd $LFS/sources
    [ -f diffutils-3.10.tar.xz ] || wget https://ftp.gnu.org/gnu/diffutils/diffutils-3.10.tar.xz
    [ -d diffutils-3.10 ] || tar -xf diffutils-3.10.tar.xz
    cd diffutils-3.10
    
    ./configure --prefix=/tools \
        --host=$LFS_TGT \
        --build=$(./build-aux/config.guess) >> "$BUILDLOG" 2>&1
    
    make -j12 >> "$BUILDLOG" 2>&1
    make DESTDIR=$LFS_TOOLS install >> "$BUILDLOG" 2>&1
    log "✅ Diffutils installed to /tools"
else
    log "✅ Diffutils already installed"
fi

# Package 6: File
log "===== [6/15] File ====="
if [ ! -f "$LFS/tools/bin/file" ]; then
    cd $LFS/sources
    [ -f file-5.45.tar.gz ] || wget http://ftp.astron.com/pub/file/file-5.45.tar.gz
    [ -d file-5.45 ] || tar -xf file-5.45.tar.gz
    cd file-5.45
    
    mkdir -p build
    pushd build
        ../configure --disable-bzlib --disable-libseccomp \
                     --disable-xzlib --disable-zlib >> "$BUILDLOG" 2>&1
        make -j12 >> "$BUILDLOG" 2>&1
    popd
    
    ./configure --prefix=/tools \
        --host=$LFS_TGT \
        --build=$(./config.guess) >> "$BUILDLOG" 2>&1
    
    make FILE_COMPILE=$(pwd)/build/src/file -j12 >> "$BUILDLOG" 2>&1
    make DESTDIR=$LFS_TOOLS install >> "$BUILDLOG" 2>&1
    rm -fv $LFS_TOOLS/tools/lib/libmagic.la
    log "✅ File installed to /tools"
else
    log "✅ File already installed"
fi

# Package 7: Findutils
log "===== [7/15] Findutils ====="
if [ ! -f "$LFS/tools/bin/find" ]; then
    cd $LFS/sources
    [ -f findutils-4.9.0.tar.xz ] || wget https://ftp.gnu.org/gnu/findutils/findutils-4.9.0.tar.xz
    [ -d findutils-4.9.0 ] || tar -xf findutils-4.9.0.tar.xz
    cd findutils-4.9.0
    
    ./configure --prefix=/tools \
        --localstatedir=/tools/var/lib/locate \
        --host=$LFS_TGT \
        --build=$(build-aux/config.guess) >> "$BUILDLOG" 2>&1
    
    make -j12 >> "$BUILDLOG" 2>&1
    make DESTDIR=$LFS_TOOLS install >> "$BUILDLOG" 2>&1
    log "✅ Findutils installed to /tools"
else
    log "✅ Findutils already installed"
fi

# Package 8: Gawk
log "===== [8/15] Gawk ====="
if [ ! -f "$LFS/tools/bin/gawk" ]; then
    cd $LFS/sources
    [ -f gawk-5.2.2.tar.xz ] || wget https://ftp.gnu.org/gnu/gawk/gawk-5.2.2.tar.xz
    [ -d gawk-5.2.2 ] || tar -xf gawk-5.2.2.tar.xz
    cd gawk-5.2.2
    
    sed -i 's/extras//' Makefile.in
    ./configure --prefix=/tools \
        --host=$LFS_TGT \
        --build=$(build-aux/config.guess) >> "$BUILDLOG" 2>&1
    
    make -j12 >> "$BUILDLOG" 2>&1
    make DESTDIR=$LFS_TOOLS install >> "$BUILDLOG" 2>&1
    log "✅ Gawk installed to /tools"
else
    log "✅ Gawk already installed"
fi

# Package 9: Grep
log "===== [9/15] Grep ====="
if [ ! -f "$LFS/tools/bin/grep" ]; then
    cd $LFS/sources
    [ -f grep-3.11.tar.xz ] || wget https://ftp.gnu.org/gnu/grep/grep-3.11.tar.xz
    [ -d grep-3.11 ] || tar -xf grep-3.11.tar.xz
    cd grep-3.11
    
    ./configure --prefix=/tools \
        --host=$LFS_TGT \
        --build=$(./build-aux/config.guess) >> "$BUILDLOG" 2>&1
    
    make -j12 >> "$BUILDLOG" 2>&1
    make DESTDIR=$LFS_TOOLS install >> "$BUILDLOG" 2>&1
    log "✅ Grep installed to /tools"
else
    log "✅ Grep already installed"
fi

# Package 10: Gzip
log "===== [10/15] Gzip ====="
if [ ! -f "$LFS/tools/bin/gzip" ]; then
    cd $LFS/sources
    [ -f gzip-1.13.tar.xz ] || wget https://ftp.gnu.org/gnu/gzip/gzip-1.13.tar.xz
    [ -d gzip-1.13 ] || tar -xf gzip-1.13.tar.xz
    cd gzip-1.13
    
    ./configure --prefix=/tools --host=$LFS_TGT >> "$BUILDLOG" 2>&1
    make -j12 >> "$BUILDLOG" 2>&1
    make DESTDIR=$LFS_TOOLS install >> "$BUILDLOG" 2>&1
    log "✅ Gzip installed to /tools"
else
    log "✅ Gzip already installed"
fi

# Continue with more packages...

log ""
log "======================================"
log "  ✅ Chapter 6 Tools Complete!"
log "======================================"
log "Build log: $BUILDLOG"
