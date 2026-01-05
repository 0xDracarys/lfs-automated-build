#!/bin/bash
# package-lfs-outputs.sh - Package LFS build outputs for distribution
# Creates mountable archives for Windows/WSL users

set -e

echo "================================================"
echo "  PACKAGING LFS BUILD OUTPUTS"
echo "================================================"

# Configuration
export LFS=${LFS:-/mnt/lfs}
BUILD_ID=${BUILD_ID:-"local-$(date +%Y%m%d-%H%M%S)"}
OUTPUT_DIR=${OUTPUT_DIR:-"$LFS/outputs"}
GCS_BUCKET=${GCS_BUCKET:-"alfs-bd1e0-builds"}

# Create output directory
mkdir -p "$OUTPUT_DIR"

echo ""
echo "Build ID: $BUILD_ID"
echo "Output Directory: $OUTPUT_DIR"
echo ""

# ============================================================================
# PACKAGE 1: Full LFS Toolchain (for mounting)
# ============================================================================
echo "[1/4] Creating LFS Toolchain Archive..."
echo "   This archive can be mounted directly in WSL/Linux"

cd "$LFS"

# Create a comprehensive tarball with proper structure
tar -czf "$OUTPUT_DIR/lfs-toolchain-${BUILD_ID}.tar.gz" \
    --exclude='./outputs' \
    --exclude='./sources' \
    --exclude='./lost+found' \
    --transform='s,^\./,lfs/,' \
    ./

echo "   ✓ Created: lfs-toolchain-${BUILD_ID}.tar.gz"
echo "   Size: $(du -h "$OUTPUT_DIR/lfs-toolchain-${BUILD_ID}.tar.gz" | cut -f1)"

# ============================================================================
# PACKAGE 2: Bootable ISO (if kernel exists)
# ============================================================================
if [ -f "$LFS/boot/vmlinuz" ] || [ -f "$LFS/bootable/boot/vmlinuz-6.4.12-lfs" ]; then
    echo ""
    echo "[2/4] Creating Bootable ISO..."
    
    ISO_ROOT="$OUTPUT_DIR/iso-root"
    mkdir -p "$ISO_ROOT"/{boot/grub,lfs}
    
    # Copy kernel
    if [ -f "$LFS/bootable/boot/vmlinuz-6.4.12-lfs" ]; then
        cp "$LFS/bootable/boot/vmlinuz-6.4.12-lfs" "$ISO_ROOT/boot/vmlinuz"
    elif [ -f "$LFS/boot/vmlinuz" ]; then
        cp "$LFS/boot/vmlinuz" "$ISO_ROOT/boot/"
    fi
    
    # Create initrd (simple init system)
    mkdir -p "$ISO_ROOT/lfs"/{bin,lib,dev,proc,sys,mnt}
    
    # Copy essential binaries
    cp -a "$LFS/usr/bin"/{bash,sh,ls,cat,mount} "$ISO_ROOT/lfs/bin/" 2>/dev/null || true
    
    # Copy libraries
    cp -a "$LFS/usr/lib"/lib*.so* "$ISO_ROOT/lfs/lib/" 2>/dev/null || true
    
    # Create GRUB configuration
    cat > "$ISO_ROOT/boot/grub/grub.cfg" << 'EOF'
set default=0
set timeout=5

menuentry "Linux From Scratch 12.0" {
    linux /boot/vmlinuz root=/dev/ram0 init=/init
}

menuentry "Linux From Scratch 12.0 (Recovery)" {
    linux /boot/vmlinuz root=/dev/ram0 init=/bin/bash
}
EOF
    
    # Build ISO using grub-mkrescue or genisoimage
    if command -v grub-mkrescue &> /dev/null; then
        grub-mkrescue -o "$OUTPUT_DIR/lfs-bootable-${BUILD_ID}.iso" "$ISO_ROOT"
        echo "   ✓ Created: lfs-bootable-${BUILD_ID}.iso"
        echo "   Size: $(du -h "$OUTPUT_DIR/lfs-bootable-${BUILD_ID}.iso" | cut -f1)"
    elif command -v genisoimage &> /dev/null; then
        genisoimage -R -o "$OUTPUT_DIR/lfs-bootable-${BUILD_ID}.iso" \
            -b boot/grub/grub.cfg \
            -no-emul-boot -boot-load-size 4 -boot-info-table \
            "$ISO_ROOT"
        echo "   ✓ Created: lfs-bootable-${BUILD_ID}.iso"
        echo "   Size: $(du -h "$OUTPUT_DIR/lfs-bootable-${BUILD_ID}.iso" | cut -f1)"
    else
        echo "   ⚠ Skipped: No ISO creation tool found (install grub-mkrescue or genisoimage)"
    fi
    
    # Cleanup
    rm -rf "$ISO_ROOT"
else
    echo ""
    echo "[2/4] Skipping ISO creation (no kernel found)"
fi

# ============================================================================
# PACKAGE 3: Windows/WSL Installation Script
# ============================================================================
echo ""
echo "[3/4] Creating Windows/WSL Installation Script..."

cat > "$OUTPUT_DIR/install-lfs-windows.ps1" << 'PSEOF'
# LFS Installation Script for Windows/WSL
# Usage: .\install-lfs-windows.ps1 -BuildId "YOUR_BUILD_ID"

param(
    [Parameter(Mandatory=$true)]
    [string]$BuildId,
    
    [string]$InstallPath = "C:\LFS",
    [string]$WSLDistro = "Ubuntu"
)

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  LFS WINDOWS/WSL INSTALLER" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if WSL is installed
$wslCheck = wsl --list 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ WSL not found. Installing WSL..." -ForegroundColor Yellow
    wsl --install -d $WSLDistro
    Write-Host "✓ WSL installed. Please restart your computer and run this script again." -ForegroundColor Green
    exit
}

Write-Host "✓ WSL is installed" -ForegroundColor Green

# Create installation directory
New-Item -ItemType Directory -Force -Path $InstallPath | Out-Null
Write-Host "✓ Created: $InstallPath" -ForegroundColor Green

# Download LFS toolchain
$downloadUrl = "https://firebasestorage.googleapis.com/v0/b/alfs-bd1e0.firebasestorage.app/o/builds%2F${BuildId}%2Flfs-toolchain.tar.gz?alt=media"
$tarballPath = "$InstallPath\lfs-toolchain.tar.gz"

Write-Host ""
Write-Host "Downloading LFS toolchain..." -ForegroundColor Cyan
try {
    Invoke-WebRequest -Uri $downloadUrl -OutFile $tarballPath
    Write-Host "✓ Downloaded to: $tarballPath" -ForegroundColor Green
} catch {
    Write-Host "❌ Download failed: $_" -ForegroundColor Red
    exit 1
}

# Extract to WSL
Write-Host ""
Write-Host "Extracting to WSL (this may take a few minutes)..." -ForegroundColor Cyan

$wslPath = "/mnt/c/LFS/lfs-toolchain.tar.gz" -replace '\\', '/' -replace 'C:', '/mnt/c'
wsl -d $WSLDistro bash -c @"
    sudo mkdir -p /mnt/lfs
    sudo tar -xzf '$wslPath' -C /mnt/lfs
    echo '✓ Extracted to /mnt/lfs'
"@

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "  INSTALLATION COMPLETE!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "To enter your LFS environment:" -ForegroundColor Cyan
Write-Host "  wsl -d $WSLDistro" -ForegroundColor Yellow
Write-Host "  sudo chroot /mnt/lfs /bin/bash" -ForegroundColor Yellow
Write-Host ""
Write-Host "LFS files location in Windows: $InstallPath" -ForegroundColor Cyan
Write-Host "LFS mount point in WSL: /mnt/lfs" -ForegroundColor Cyan
PSEOF

echo "   ✓ Created: install-lfs-windows.ps1"

# ============================================================================
# PACKAGE 4: README with Usage Instructions
# ============================================================================
echo ""
echo "[4/4] Creating README..."

cat > "$OUTPUT_DIR/README.md" << 'MDEOF'
# Linux From Scratch Build Outputs

## What's Included

This package contains your custom Linux From Scratch 12.0 build:

- `lfs-toolchain-*.tar.gz` - Full LFS filesystem (mountable)
- `lfs-bootable-*.iso` - Bootable ISO image (if kernel was built)
- `install-lfs-windows.ps1` - Windows/WSL installation script
- `README.md` - This file

## Quick Start (Windows/WSL)

### Option 1: Automated Installation (Recommended)

```powershell
# Download your build files
# Run the PowerShell script
.\install-lfs-windows.ps1 -BuildId "YOUR_BUILD_ID"
```

### Option 2: Manual Installation

```bash
# In WSL (Ubuntu/Debian)
sudo mkdir -p /mnt/lfs
sudo tar -xzf lfs-toolchain-*.tar.gz -C /mnt/lfs

# Enter LFS environment
sudo chroot /mnt/lfs /bin/bash
```

## Usage Instructions

### Mounting in WSL

```bash
# Create mount point
sudo mkdir -p /mnt/lfs

# Extract toolchain
sudo tar -xzf lfs-toolchain-YOUR_BUILD_ID.tar.gz -C /mnt/lfs

# Mount proc and sys
sudo mount -t proc proc /mnt/lfs/proc
sudo mount -t sysfs sysfs /mnt/lfs/sys

# Enter chroot
sudo chroot /mnt/lfs /bin/bash

# You're now inside your LFS system!
```

### Booting the ISO in VirtualBox

1. Create a new VM in VirtualBox
2. Settings → Storage → Add optical drive
3. Select `lfs-bootable-*.iso`
4. Boot the VM
5. You'll see GRUB menu with LFS options

### Building Additional Packages

Once inside the LFS environment:

```bash
# Set environment variables
export LFS=/
export LFS_TGT=x86_64-lfs-linux-gnu
export PATH=/tools/bin:/usr/bin:/bin

# Install additional software
cd /sources
# Download package
wget https://example.com/package.tar.gz
tar -xzf package.tar.gz
cd package
./configure --prefix=/usr
make
make install
```

## File Sizes

- Toolchain TAR.GZ: ~450 MB compressed, ~2.5 GB extracted
- Bootable ISO: ~130 MB

## System Requirements

- **For WSL**: Windows 10/11 with WSL2 enabled
- **For VirtualBox**: 2GB RAM, 10GB disk space, x86_64 processor
- **Disk Space**: At least 5GB free for extraction

## Troubleshooting

### "Permission denied" errors

Run commands with `sudo` in WSL:
```bash
sudo chroot /mnt/lfs /bin/bash
```

### "No such file or directory" in chroot

Ensure paths are correct:
```bash
ls -la /mnt/lfs/bin/bash  # Should exist
```

### WSL not installed

```powershell
wsl --install -d Ubuntu
```

Restart your computer after installation.

## Support

- Documentation: https://lfs-automated.netlify.app/docs
- Build Monitoring: https://lfs-automated.netlify.app/build/YOUR_BUILD_ID
- LFS Book: https://www.linuxfromscratch.org/lfs/view/12.0/

## Build Information

- **LFS Version**: 12.0
- **Build Date**: $(date)
- **Build ID**: ${BUILD_ID}
- **Kernel**: Linux 6.4.12 (if included)
- **Toolchain**: GCC 13.2.0, Glibc 2.38, Binutils 2.41

---

**Built with ❤️ using the LFS Automated Build Platform**
MDEOF

echo "   ✓ Created: README.md"

# ============================================================================
# Upload to Google Cloud Storage (if BUILD_ID and GCS_BUCKET are set)
# ============================================================================
if [ -n "$GCS_BUCKET" ] && command -v gsutil &> /dev/null; then
    echo ""
    echo "================================================"
    echo "  UPLOADING TO GOOGLE CLOUD STORAGE"
    echo "================================================"
    
    for file in "$OUTPUT_DIR"/*; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            echo "Uploading: $filename"
            gsutil cp "$file" "gs://$GCS_BUCKET/builds/$BUILD_ID/$filename"
            
            # Make publicly accessible
            gsutil acl ch -u AllUsers:R "gs://$GCS_BUCKET/builds/$BUILD_ID/$filename"
            
            echo "   ✓ Uploaded: gs://$GCS_BUCKET/builds/$BUILD_ID/$filename"
        fi
    done
    
    echo ""
    echo "✓ All files uploaded to GCS"
    echo "Public URL: https://storage.googleapis.com/$GCS_BUCKET/builds/$BUILD_ID/"
    
    # Update Firestore with download URLs
    if command -v node &> /dev/null && [ -f "/app/helpers/update-download-urls.js" ]; then
        echo ""
        echo "Updating Firestore with download URLs..."
        node /app/helpers/update-download-urls.js "$BUILD_ID"
    fi
else
    echo ""
    echo "⚠ Skipping GCS upload (gsutil not found or BUILD_ID not set)"
fi

# ============================================================================
# Summary
# ============================================================================
echo ""
echo "================================================"
echo "  PACKAGING COMPLETE!"
echo "================================================"
echo ""
echo "Output files:"
ls -lh "$OUTPUT_DIR"
echo ""
echo "Total size: $(du -sh "$OUTPUT_DIR" | cut -f1)"
echo ""
echo "These files are ready for distribution to end users."
echo "Users can mount the toolchain or boot the ISO in VirtualBox."
echo ""
