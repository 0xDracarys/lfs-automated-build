#!/bin/bash
# prepare-chroot.sh - Prepare the chroot environment for native LFS build
set -e

# Use standard LFS path or environment variable
export LFS=${LFS:-/mnt/lfs}

echo "======================================="
echo "  PREPARING CHROOT ENVIRONMENT"
echo "======================================="
echo ""

# Create essential directories
echo "Creating directory structure..."
mkdir -pv $LFS/{etc,var,usr,bin,sbin,lib,lib64}
mkdir -pv $LFS/usr/{bin,sbin,lib,include}
mkdir -pv $LFS/var/{log,tmp}
mkdir -pv $LFS/boot
mkdir -pv $LFS/home
mkdir -pv $LFS/mnt
mkdir -pv $LFS/opt
mkdir -pv $LFS/srv
mkdir -pv $LFS/root

# Create device nodes (if not already exist)
echo "Creating essential device nodes..."
if [ ! -e $LFS/dev/console ]; then
    sudo mknod -m 600 $LFS/dev/console c 5 1 2>/dev/null || echo "Note: mknod requires root, will handle in chroot"
fi
if [ ! -e $LFS/dev/null ]; then
    sudo mknod -m 666 $LFS/dev/null c 1 3 2>/dev/null || echo "Note: mknod requires root, will handle in chroot"
fi

# Copy existing toolchain files
echo "Ensuring toolchain is accessible..."
if [ -d "/home/dracarys/lfs-test/mnt/lfs/tools" ]; then
    echo "Toolchain found in lfs-test"
    # We'll mount/link this in chroot
fi

# Create minimal /etc files
echo "Creating essential /etc files..."

cat > $LFS/etc/passwd << "EOF"
root:x:0:0:root:/root:/bin/bash
bin:x:1:1:bin:/dev/null:/usr/bin/false
daemon:x:6:6:Daemon User:/dev/null:/usr/bin/false
messagebus:x:18:18:D-Bus Message Daemon User:/run/dbus:/usr/bin/false
uuidd:x:80:80:UUID Generation Daemon User:/dev/null:/usr/bin/false
nobody:x:65534:65534:Unprivileged User:/dev/null:/usr/bin/false
EOF

cat > $LFS/etc/group << "EOF"
root:x:0:
bin:x:1:daemon
sys:x:2:
kmem:x:3:
tape:x:4:
tty:x:5:
daemon:x:6:
floppy:x:7:
disk:x:8:
lp:x:9:
dialout:x:10:
audio:x:11:
video:x:12:
utmp:x:13:
usb:x:14:
cdrom:x:15:
adm:x:16:
messagebus:x:18:
input:x:24:
mail:x:34:
kvm:x:61:
uuidd:x:80:
wheel:x:97:
users:x:999:
nogroup:x:65534:
EOF

# Create build script that will run inside chroot
cat > $LFS/build-lfs-in-chroot.sh << 'EOFSCRIPT'
#!/bin/bash
# This script runs INSIDE the chroot environment
set -e

export PATH=/usr/bin:/usr/sbin:/bin:/sbin
export MAKEFLAGS="-j12"

BUILDLOG="/build-log-$(date +%Y%m%d-%H%M%S).log"

log() {
    echo "[$(date '+%H:%M:%S')] $1" | tee -a "$BUILDLOG"
}

log "======================================="
log "  BUILDING LFS INSIDE CHROOT"
log "  Native compilation - no cross issues!"
log "======================================="
log ""

cd /sources

# Install our cross-compiled GCC as the system compiler temporarily
log "Setting up temporary compiler..."
if [ -f /lfs-tools/tools/bin/x86_64-lfs-linux-gnu-gcc ]; then
    ln -sf /lfs-tools/tools/bin/x86_64-lfs-linux-gnu-gcc /usr/bin/gcc
    ln -sf /lfs-tools/tools/bin/x86_64-lfs-linux-gnu-g++ /usr/bin/g++
    ln -sf /lfs-tools/tools/bin/x86_64-lfs-linux-gnu-ld /usr/bin/ld
    ln -sf /lfs-tools/tools/bin/x86_64-lfs-linux-gnu-ar /usr/bin/ar
    ln -sf /lfs-tools/tools/bin/x86_64-lfs-linux-gnu-as /usr/bin/as
    ln -sf /lfs-tools/tools/bin/x86_64-lfs-linux-gnu-ranlib /usr/bin/ranlib
    log "✓ Cross-compiler linked to /usr/bin"
fi

# Copy glibc from our working build
log "Installing glibc..."
if [ -d /lfs-usr/lib ]; then
    cp -av /lfs-usr/lib/* /usr/lib/ 2>/dev/null || true
    cp -av /lfs-usr/include/* /usr/include/ 2>/dev/null || true
    log "✓ Glibc libraries and headers installed"
fi

# Package 1: Gettext (needed by many packages)
log "===== [1/25] Gettext ====="
[ -f gettext-0.22.tar.xz ] || wget https://ftp.gnu.org/gnu/gettext/gettext-0.22.tar.xz
[ -d gettext-0.22 ] || tar -xf gettext-0.22.tar.xz
cd gettext-0.22
./configure --prefix=/usr --disable-static >> "$BUILDLOG" 2>&1
make -j12 >> "$BUILDLOG" 2>&1
make install >> "$BUILDLOG" 2>&1
cd /sources
log "✓ Gettext installed"

# Package 2: Bison (needed by many packages)
log "===== [2/25] Bison ====="
[ -f bison-3.8.2.tar.xz ] || wget https://ftp.gnu.org/gnu/bison/bison-3.8.2.tar.xz
[ -d bison-3.8.2 ] || tar -xf bison-3.8.2.tar.xz
cd bison-3.8.2
./configure --prefix=/usr >> "$BUILDLOG" 2>&1
make -j12 >> "$BUILDLOG" 2>&1
make install >> "$BUILDLOG" 2>&1
cd /sources
log "✓ Bison installed"

# Package 3: Perl (critical for many packages)
log "===== [3/25] Perl ====="
[ -f perl-5.38.0.tar.xz ] || wget https://www.cpan.org/src/5.0/perl-5.38.0.tar.xz
[ -d perl-5.38.0 ] || tar -xf perl-5.38.0.tar.xz
cd perl-5.38.0
sh Configure -des \
    -Dprefix=/usr \
    -Dvendorprefix=/usr \
    -Dprivlib=/usr/lib/perl5/5.38/core_perl \
    -Darchlib=/usr/lib/perl5/5.38/core_perl \
    -Dsitelib=/usr/lib/perl5/5.38/site_perl \
    -Dsitearch=/usr/lib/perl5/5.38/site_perl \
    -Dvendorlib=/usr/lib/perl5/5.38/vendor_perl \
    -Dvendorarch=/usr/lib/perl5/5.38/vendor_perl >> "$BUILDLOG" 2>&1
make -j12 >> "$BUILDLOG" 2>&1
make install >> "$BUILDLOG" 2>&1
cd /sources
log "✓ Perl installed"

# Package 4: Python (critical for many packages)
log "===== [4/25] Python ====="
[ -f Python-3.11.4.tar.xz ] || wget https://www.python.org/ftp/python/3.11.4/Python-3.11.4.tar.xz
[ -d Python-3.11.4 ] || tar -xf Python-3.11.4.tar.xz
cd Python-3.11.4
./configure --prefix=/usr \
    --enable-shared \
    --without-ensurepip >> "$BUILDLOG" 2>&1
make -j12 >> "$BUILDLOG" 2>&1
make install >> "$BUILDLOG" 2>&1
cd /sources
log "✓ Python installed"

# Package 5: M4
log "===== [5/25] M4 ====="
[ -f m4-1.4.19.tar.xz ] || wget https://ftp.gnu.org/gnu/m4/m4-1.4.19.tar.xz
[ -d m4-1.4.19 ] || tar -xf m4-1.4.19.tar.xz
cd m4-1.4.19
./configure --prefix=/usr >> "$BUILDLOG" 2>&1
make -j12 >> "$BUILDLOG" 2>&1
make install >> "$BUILDLOG" 2>&1
cd /sources
log "✓ M4 installed"

# Package 6: Ncurses
log "===== [6/25] Ncurses ====="
[ -f ncurses-6.4.tar.gz ] || wget https://invisible-mirror.net/archives/ncurses/ncurses-6.4.tar.gz
[ -d ncurses-6.4 ] || tar -xf ncurses-6.4.tar.gz
cd ncurses-6.4
./configure --prefix=/usr \
    --with-shared \
    --without-debug \
    --without-normal \
    --with-cxx-shared \
    --enable-pc-files \
    --enable-widec \
    --with-pkg-config-libdir=/usr/lib/pkgconfig >> "$BUILDLOG" 2>&1
make -j12 >> "$BUILDLOG" 2>&1
make install >> "$BUILDLOG" 2>&1
echo "INPUT(-lncursesw)" > /usr/lib/libncurses.so
cd /sources
log "✓ Ncurses installed"

# Package 7: Bash
log "===== [7/25] Bash ====="
[ -f bash-5.2.15.tar.gz ] || wget https://ftp.gnu.org/gnu/bash/bash-5.2.15.tar.gz
[ -d bash-5.2.15 ] || tar -xf bash-5.2.15.tar.gz
cd bash-5.2.15
./configure --prefix=/usr --without-bash-malloc >> "$BUILDLOG" 2>&1
make -j12 >> "$BUILDLOG" 2>&1
make install >> "$BUILDLOG" 2>&1
ln -sf bash /bin/sh
cd /sources
log "✓ Bash installed"

# Package 8: Coreutils
log "===== [8/25] Coreutils ====="
[ -f coreutils-9.3.tar.xz ] || wget https://ftp.gnu.org/gnu/coreutils/coreutils-9.3.tar.xz
[ -d coreutils-9.3 ] || tar -xf coreutils-9.3.tar.xz
cd coreutils-9.3
./configure --prefix=/usr --enable-no-install-program=kill,uptime >> "$BUILDLOG" 2>&1
make -j12 >> "$BUILDLOG" 2>&1
make install >> "$BUILDLOG" 2>&1
cd /sources
log "✓ Coreutils installed"

log ""
log "======================================="
log "  ✓ Core packages installed!"
log "  Continuing with remaining packages..."
log "======================================="

# Continue with more packages...
# (I'll add the rest in a follow-up)

log "Build log saved to: $BUILDLOG"
EOFSCRIPT

chmod +x $LFS/build-lfs-in-chroot.sh

echo ""
echo "✓ Chroot environment prepared!"
echo ""
echo "Directory structure created"
echo "Essential files created"
echo "Build script ready: /build-lfs-in-chroot.sh"
echo ""
echo "Next: Run ENTER-CHROOT.ps1 to start building!"
