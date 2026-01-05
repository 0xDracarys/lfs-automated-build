# INIT-LFS-NATIVE.ps1
# Initialize LFS build environment for native Windows/WSL builds

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  LFS Native Build Environment Setup" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$wslDistro = "Athena"

Write-Host "Setting up LFS directories in WSL ($wslDistro)..." -ForegroundColor Yellow

$initScript = @'
#!/bin/bash
set -e

echo "Creating LFS directory structure..."
sudo mkdir -p /mnt/lfs
sudo mkdir -p /mnt/lfs/sources
sudo mkdir -p /mnt/lfs/tools
sudo mkdir -p /mnt/lfs/logs

echo "Setting ownership to current user..."
sudo chown -R $(whoami):$(whoami) /mnt/lfs

echo "Creating environment file..."
cat > /mnt/lfs/.lfs-env << 'EOF'
export LFS=/mnt/lfs
export LFS_TGT=x86_64-lfs-linux-gnu
export PATH=/mnt/lfs/tools/bin:/usr/bin:/bin:/usr/sbin:/sbin
export MAKEFLAGS=-j$(nproc)
EOF

chmod +x /mnt/lfs/.lfs-env

echo ""
echo "=== LFS Environment Ready ==="
echo "Directory: /mnt/lfs"
echo "Size: $(df -h /mnt/lfs | tail -1 | awk '{print $2" available, "$4" free"}')"
echo ""
echo "To activate environment in any script:"
echo "  source /mnt/lfs/.lfs-env"
echo ""
ls -lah /mnt/lfs
'@

$initScript | wsl -d $wslDistro bash

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ LFS environment initialized successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Run: .\BUILD-LFS-CORRECT.ps1" -ForegroundColor White
    Write-Host "  2. Or use: wsl -d $wslDistro" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Failed to initialize LFS environment" -ForegroundColor Red
    Write-Host ""
    exit 1
}
