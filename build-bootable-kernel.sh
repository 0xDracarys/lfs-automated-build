#!/bin/bash
# build-bootable-kernel.sh - Build Linux kernel for bootable LFS
set -e

# Use standard LFS path or environment variable
export LFS=${LFS:-/mnt/lfs}
export LFS_TOOLS=${LFS_TOOLS:-$LFS}
export LFS_USR=${LFS_USR:-$LFS}
export PATH=$LFS_TOOLS/tools/bin:/usr/bin:/bin:/usr/sbin:/sbin
export MAKEFLAGS=${MAKEFLAGS:--j$(nproc)}

# Create build directory
BUILDDIR=${BUILDDIR:-$LFS/bootable}
mkdir -p $BUILDDIR/{boot,lib,bin,sbin,etc}

echo "========================================="
echo "  BUILDING BOOTABLE LFS KERNEL"
echo "========================================="
echo ""

# Download kernel if needed
cd /home/dracarys
if [ ! -f linux-6.4.12.tar.xz ]; then
    echo "Downloading Linux kernel..."
    wget https://www.kernel.org/pub/linux/kernel/v6.x/linux-6.4.12.tar.xz
fi

# Extract kernel
if [ ! -d linux-6.4.12 ]; then
    echo "Extracting kernel..."
    tar -xf linux-6.4.12.tar.xz
fi

cd linux-6.4.12

echo "Cleaning kernel source..."
make mrproper

echo "Configuring kernel (using minimal config)..."
make defconfig

# Enable some essential options
scripts/config --enable EXT4_FS
scripts/config --enable EFI
scripts/config --enable EFI_STUB  
scripts/config --enable BLK_DEV_SD
scripts/config --enable ATA
scripts/config --enable SATA_AHCI
scripts/config --enable USB_STORAGE
scripts/config --enable VGA_CONSOLE
scripts/config --enable FRAMEBUFFER_CONSOLE

echo ""
echo "Building kernel (this takes 60-90 minutes)..."
echo "Started: $(date)"
echo ""

make -j12

echo ""
echo "Kernel build complete!"
echo "Finished: $(date)"
echo ""

# Install kernel
echo "Installing kernel to $BUILDDIR/boot..."
cp -v arch/x86/boot/bzImage $BUILDDIR/boot/vmlinuz-6.4.12-lfs
cp -v System.map $BUILDDIR/boot/System.map-6.4.12
cp -v .config $BUILDDIR/boot/config-6.4.12

# Install kernel modules
echo "Installing kernel modules..."
make INSTALL_MOD_PATH=$BUILDDIR modules_install

# Copy essential libraries
echo "Copying essential libraries..."
cp -av $LFS_USR/usr/lib/libc.so.6 $BUILDDIR/lib/
cp -av $LFS_USR/usr/lib/libm.so.6 $BUILDDIR/lib/
cp -av $LFS_USR/usr/lib/libstdc++.so.6 $BUILDDIR/lib/
cp -av $LFS_USR/usr/lib/ld-linux-x86-64.so.2 $BUILDDIR/lib/

# Create minimal init
cat > $BUILDDIR/init << 'EOF'
#!/bin/sh
mount -t proc none /proc
mount -t sysfs none /sys  
mount -t devtmpfs none /dev

echo ""
echo "================================"
echo "  Welcome to LFS - Minimal Boot"
echo "================================"
echo ""
echo "Kernel: $(uname -r)"
echo ""

exec /bin/sh
EOF

chmod +x $BUILDDIR/init

# Copy busybox for minimal shell
if command -v busybox >/dev/null 2>&1; then
    cp -v $(which busybox) $BUILDDIR/bin/
    ln -sf busybox $BUILDDIR/bin/sh
else
    echo "Warning: busybox not found, boot will need /bin/sh"
fi

echo ""
echo "========================================="
echo "  ✓ BOOTABLE KERNEL READY!"
echo "========================================="
echo ""
echo "Kernel image: $BUILDDIR/boot/vmlinuz-6.4.12-lfs"
echo "Init script: $BUILDDIR/init"
echo "Libraries: $BUILDDIR/lib/"
echo ""
echo "Next: Create bootable ISO with CREATE-ISO.ps1"
