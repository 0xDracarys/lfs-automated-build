#!/bin/bash
# build-next-package.sh - Build LFS packages one at a time with full control
# Usage: ./build-next-package.sh [package-name]

set -e

# WSL Environment (adjust if needed)
export LFS=/home/dracarys/lfs-local-build/mnt/lfs
export LFS_TGT=x86_64-lfs-linux-gnu
export PATH=/tools/bin:/usr/bin:/bin:/usr/sbin:/sbin
export MAKEFLAGS=-j12

# Package definitions
declare -A PACKAGES
declare -A URLS
declare -A SIZES
declare -A TIMES
declare -A DESCRIPTIONS
declare -A PRIORITY

# ===== MINIMAL PATH (17 packages) - PRIORITY 1 =====

# 1. Bash
PACKAGES[bash]="bash-5.2.15"
URLS[bash]="https://ftp.gnu.org/gnu/bash/bash-5.2.15.tar.gz"
SIZES[bash]="11M"
TIMES[bash]="20m"
DESCRIPTIONS[bash]="Command shell - CRITICAL for running scripts"
PRIORITY[bash]=1

# 2. Coreutils
PACKAGES[coreutils]="coreutils-9.3"
URLS[coreutils]="https://ftp.gnu.org/gnu/coreutils/coreutils-9.3.tar.xz"
SIZES[coreutils]="32M"
TIMES[coreutils]="30m"
DESCRIPTIONS[coreutils]="Basic commands: ls, cp, mv, cat, rm, mkdir - ESSENTIAL"
PRIORITY[coreutils]=1

# 3. Grep
PACKAGES[grep]="grep-3.11"
URLS[grep]="https://ftp.gnu.org/gnu/grep/grep-3.11.tar.xz"
SIZES[grep]="6M"
TIMES[grep]="10m"
DESCRIPTIONS[grep]="Pattern matching - used everywhere"
PRIORITY[grep]=1

# 4. Sed
PACKAGES[sed]="sed-4.9"
URLS[sed]="https://ftp.gnu.org/gnu/sed/sed-4.9.tar.xz"
SIZES[sed]="5M"
TIMES[sed]="10m"
DESCRIPTIONS[sed]="Stream editor - text processing"
PRIORITY[sed]=1

# 5. Gawk
PACKAGES[gawk]="gawk-5.2.2"
URLS[gawk]="https://ftp.gnu.org/gnu/gawk/gawk-5.2.2.tar.xz"
SIZES[gawk]="11M"
TIMES[gawk]="15m"
DESCRIPTIONS[gawk]="Text processing language"
PRIORITY[gawk]=1

# 6. Make
PACKAGES[make]="make-4.4.1"
URLS[make]="https://ftp.gnu.org/gnu/make/make-4.4.1.tar.gz"
SIZES[make]="8M"
TIMES[make]="15m"
DESCRIPTIONS[make]="Build automation - CRITICAL for building packages"
PRIORITY[make]=1

# 7. Tar
PACKAGES[tar]="tar-1.35"
URLS[tar]="https://ftp.gnu.org/gnu/tar/tar-1.35.tar.xz"
SIZES[tar]="9M"
TIMES[tar]="15m"
DESCRIPTIONS[tar]="Archive management - ESSENTIAL"
PRIORITY[tar]=1

# 8. Gzip
PACKAGES[gzip]="gzip-1.13"
URLS[gzip]="https://ftp.gnu.org/gnu/gzip/gzip-1.13.tar.xz"
SIZES[gzip]="4M"
TIMES[gzip]="10m"
DESCRIPTIONS[gzip]="Compression utility"
PRIORITY[gzip]=1

# 9. Findutils
PACKAGES[findutils]="findutils-4.9.0"
URLS[findutils]="https://ftp.gnu.org/gnu/findutils/findutils-4.9.0.tar.xz"
SIZES[findutils]="7M"
TIMES[findutils]="15m"
DESCRIPTIONS[findutils]="File search: find, xargs"
PRIORITY[findutils]=1

# 10. Diffutils
PACKAGES[diffutils]="diffutils-3.10"
URLS[diffutils]="https://ftp.gnu.org/gnu/diffutils/diffutils-3.10.tar.xz"
SIZES[diffutils]="5M"
TIMES[diffutils]="10m"
DESCRIPTIONS[diffutils]="File comparison: diff, cmp"
PRIORITY[diffutils]=1

# 11. Systemd (or SysVinit)
PACKAGES[systemd]="systemd-254"
URLS[systemd]="https://github.com/systemd/systemd/archive/v254.tar.gz"
SIZES[systemd]="80M"
TIMES[systemd]="60m"
DESCRIPTIONS[systemd]="Init system - CRITICAL for booting"
PRIORITY[systemd]=1

# 12. Util-linux
PACKAGES[util-linux]="util-linux-2.39.1"
URLS[util-linux]="https://www.kernel.org/pub/linux/utils/util-linux/v2.39/util-linux-2.39.1.tar.xz"
SIZES[util-linux]="35M"
TIMES[util-linux]="30m"
DESCRIPTIONS[util-linux]="System utilities: mount, umount, etc. - CRITICAL"
PRIORITY[util-linux]=1

# 13. E2fsprogs
PACKAGES[e2fsprogs]="e2fsprogs-1.47.0"
URLS[e2fsprogs]="https://downloads.sourceforge.net/project/e2fsprogs/e2fsprogs/v1.47.0/e2fsprogs-1.47.0.tar.gz"
SIZES[e2fsprogs]="20M"
TIMES[e2fsprogs]="25m"
DESCRIPTIONS[e2fsprogs]="Ext4 filesystem utilities - CRITICAL"
PRIORITY[e2fsprogs]=1

# 14. Shadow
PACKAGES[shadow]="shadow-4.13"
URLS[shadow]="https://github.com/shadow-maint/shadow/releases/download/v4.13/shadow-4.13.tar.xz"
SIZES[shadow]="7M"
TIMES[shadow]="15m"
DESCRIPTIONS[shadow]="Login and password management - CRITICAL"
PRIORITY[shadow]=1

# 15. Procps-ng
PACKAGES[procps-ng]="procps-ng-4.0.3"
URLS[procps-ng]="https://sourceforge.net/projects/procps-ng/files/Production/procps-ng-4.0.3.tar.xz"
SIZES[procps-ng]="6M"
TIMES[procps-ng]="15m"
DESCRIPTIONS[procps-ng]="Process monitoring: ps, top, kill"
PRIORITY[procps-ng]=1

# 16. Linux Kernel
PACKAGES[linux]="linux-6.4.12"
URLS[linux]="https://www.kernel.org/pub/linux/kernel/v6.x/linux-6.4.12.tar.xz"
SIZES[linux]="140M"
TIMES[linux]="90m"
DESCRIPTIONS[linux]="Linux kernel - CRITICAL for booting"
PRIORITY[linux]=1

# 17. GRUB
PACKAGES[grub]="grub-2.06"
URLS[grub]="https://ftp.gnu.org/gnu/grub/grub-2.06.tar.xz"
SIZES[grub]="25M"
TIMES[grub]="30m"
DESCRIPTIONS[grub]="Bootloader - CRITICAL for booting"
PRIORITY[grub]=1

# ===== STANDARD PATH (additional packages) - PRIORITY 2 =====

# 18. M4
PACKAGES[m4]="m4-1.4.19"
URLS[m4]="https://ftp.gnu.org/gnu/m4/m4-1.4.19.tar.xz"
SIZES[m4]="5M"
TIMES[m4]="10m"
DESCRIPTIONS[m4]="Macro processor"
PRIORITY[m4]=2

# 19. Ncurses
PACKAGES[ncurses]="ncurses-6.4"
URLS[ncurses]="https://invisible-mirror.net/archives/ncurses/ncurses-6.4.tar.gz"
SIZES[ncurses]="12M"
TIMES[ncurses]="20m"
DESCRIPTIONS[ncurses]="Terminal handling library"
PRIORITY[ncurses]=2

# 20. File
PACKAGES[file]="file-5.45"
URLS[file]="http://ftp.astron.com/pub/file/file-5.45.tar.gz"
SIZES[file]="4M"
TIMES[file]="10m"
DESCRIPTIONS[file]="File type detection"
PRIORITY[file]=2

# 21. Bison
PACKAGES[bison]="bison-3.8.2"
URLS[bison]="https://ftp.gnu.org/gnu/bison/bison-3.8.2.tar.xz"
SIZES[bison]="8M"
TIMES[bison]="15m"
DESCRIPTIONS[bison]="Parser generator"
PRIORITY[bison]=2

# 22. Perl
PACKAGES[perl]="perl-5.38.0"
URLS[perl]="https://www.cpan.org/src/5.0/perl-5.38.0.tar.xz"
SIZES[perl]="45M"
TIMES[perl]="60m"
DESCRIPTIONS[perl]="Scripting language - many packages need this"
PRIORITY[perl]=2

# 23. Python
PACKAGES[python]="Python-3.11.4"
URLS[python]="https://www.python.org/ftp/python/3.11.4/Python-3.11.4.tar.xz"
SIZES[python]="50M"
TIMES[python]="60m"
DESCRIPTIONS[python]="Scripting language - many packages need this"
PRIORITY[python]=2

# 24. Vim
PACKAGES[vim]="vim-9.0.1677"
URLS[vim]="https://github.com/vim/vim/archive/v9.0.1677.tar.gz"
SIZES[vim]="18M"
TIMES[vim]="25m"
DESCRIPTIONS[vim]="Text editor - useful for editing configs"
PRIORITY[vim]=2

# Add more standard packages here...

# ===== HELPER FUNCTIONS =====

list_packages() {
    local priority=$1
    echo "===== AVAILABLE PACKAGES (Priority $priority) ====="
    echo ""
    for pkg in "${!PACKAGES[@]}"; do
        if [ "${PRIORITY[$pkg]}" == "$priority" ]; then
            printf "%-15s | Size: %-4s | Time: %-5s | %s\n" \
                "$pkg" "${SIZES[$pkg]}" "${TIMES[$pkg]}" "${DESCRIPTIONS[$pkg]}"
        fi
    done | sort
    echo ""
}

list_all_packages() {
    echo "===== MINIMAL PATH (Priority 1) - 17 packages ====="
    list_packages 1
    echo ""
    echo "===== STANDARD PATH (Priority 2) - Additional packages ====="
    list_packages 2
}

show_status() {
    echo "===== BUILD STATUS ====="
    echo ""
    echo "Built packages:"
    if [ -f "$LFS/build-status.txt" ]; then
        cat "$LFS/build-status.txt"
    else
        echo "  (none yet)"
    fi
    echo ""
    echo "Next recommended:"
    # Show first unbuilt priority 1 package
    for pkg in bash coreutils grep sed gawk make tar gzip findutils diffutils systemd util-linux e2fsprogs shadow procps-ng linux grub; do
        if ! grep -q "^$pkg$" "$LFS/build-status.txt" 2>/dev/null; then
            echo "  $pkg - ${DESCRIPTIONS[$pkg]}"
            echo "  Command: ./build-next-package.sh $pkg"
            break
        fi
    done
    echo ""
}

download_package() {
    local pkg=$1
    local package_name="${PACKAGES[$pkg]}"
    local url="${URLS[$pkg]}"
    
    echo "===== DOWNLOADING $package_name ====="
    cd $LFS/sources
    
    if [ -f "${package_name}.tar.gz" ] || [ -f "${package_name}.tar.xz" ]; then
        echo "Already downloaded: $package_name"
    else
        echo "Downloading from: $url"
        wget -c "$url"
    fi
}

build_package() {
    local pkg=$1
    local package_name="${PACKAGES[$pkg]}"
    
    echo "===== BUILDING $package_name ====="
    echo "Description: ${DESCRIPTIONS[$pkg]}"
    echo "Estimated time: ${TIMES[$pkg]}"
    echo ""
    
    cd $LFS/sources
    
    # Extract
    if [ ! -d "$package_name" ]; then
        echo "Extracting..."
        tar -xf ${package_name}.tar.*
    fi
    
    cd "$package_name"
    
    # Build based on package type
    case $pkg in
        bash)
            ./configure --prefix=/usr \
                --without-bash-malloc \
                --with-installed-readline
            make
            make DESTDIR=$LFS install
            ;;
            
        coreutils)
            ./configure --prefix=/usr \
                --enable-no-install-program=kill,uptime
            make
            make DESTDIR=$LFS install
            ;;
            
        grep|sed|gawk|make|tar|gzip|findutils|diffutils)
            ./configure --prefix=/usr
            make
            make DESTDIR=$LFS install
            ;;
            
        systemd)
            # Systemd is complex, needs meson
            echo "Systemd requires special setup. See LFS book Chapter 8.76"
            ;;
            
        util-linux)
            ./configure --prefix=/usr \
                --disable-chfn-chsh \
                --disable-login \
                --disable-nologin \
                --disable-su \
                --disable-setpriv \
                --disable-runuser \
                --disable-pylibmount \
                --disable-static \
                --without-python
            make
            make DESTDIR=$LFS install
            ;;
            
        e2fsprogs)
            mkdir -v build
            cd build
            ../configure --prefix=/usr \
                --sysconfdir=/etc \
                --enable-elf-shlibs \
                --disable-libblkid \
                --disable-libuuid \
                --disable-uuidd \
                --disable-fsck
            make
            make DESTDIR=$LFS install
            ;;
            
        shadow)
            ./configure --prefix=/usr \
                --sysconfdir=/etc \
                --disable-static \
                --with-group-name-max-length=32
            make
            make DESTDIR=$LFS install
            ;;
            
        procps-ng)
            ./configure --prefix=/usr \
                --disable-static \
                --disable-kill
            make
            make DESTDIR=$LFS install
            ;;
            
        linux)
            echo "===== KERNEL BUILD - This takes a while! ====="
            make mrproper
            make defconfig
            make -j12
            make INSTALL_MOD_PATH=$LFS modules_install
            cp -iv arch/x86/boot/bzImage $LFS/boot/vmlinuz-6.4.12-lfs
            cp -iv System.map $LFS/boot/System.map-6.4.12
            cp -iv .config $LFS/boot/config-6.4.12
            ;;
            
        grub)
            ./configure --prefix=/usr \
                --sysconfdir=/etc \
                --disable-efiemu \
                --disable-werror
            make
            make DESTDIR=$LFS install
            ;;
            
        *)
            echo "Build instructions for $pkg not yet implemented"
            echo "See LFS book for manual instructions"
            return 1
            ;;
    esac
    
    # Mark as built
    echo "$pkg" >> "$LFS/build-status.txt"
    echo ""
    echo "===== SUCCESS: $package_name built! ====="
    echo ""
}

# ===== MAIN SCRIPT =====

if [ $# -eq 0 ]; then
    echo "LFS Step-by-Step Package Builder"
    echo "================================="
    echo ""
    echo "Usage:"
    echo "  ./build-next-package.sh list           # Show all packages"
    echo "  ./build-next-package.sh status         # Show build status"
    echo "  ./build-next-package.sh <package>      # Build specific package"
    echo ""
    echo "Examples:"
    echo "  ./build-next-package.sh bash           # Build bash"
    echo "  ./build-next-package.sh coreutils      # Build coreutils"
    echo ""
    show_status
    exit 0
fi

case "$1" in
    list)
        list_all_packages
        ;;
    status)
        show_status
        ;;
    *)
        PKG="$1"
        if [ -z "${PACKAGES[$PKG]}" ]; then
            echo "Error: Unknown package '$PKG'"
            echo "Run './build-next-package.sh list' to see available packages"
            exit 1
        fi
        
        # Check if already built
        if grep -q "^$PKG$" "$LFS/build-status.txt" 2>/dev/null; then
            echo "Warning: $PKG already built. Rebuild anyway? (y/N)"
            read -r response
            if [ "$response" != "y" ]; then
                exit 0
            fi
        fi
        
        download_package "$PKG"
        build_package "$PKG"
        ;;
esac
