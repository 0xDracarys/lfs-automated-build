# Mount LFS Toolchain Helper
# Usage: Run this script from the folder where you extracted 'tools' and 'usr'

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   LFS Toolchain Mounter" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if tools/usr exist in current dir
if (!(Test-Path ".\tools") -or !(Test-Path ".\usr")) {
    Write-Host "❌ Error: Could not find 'tools' or 'usr' folders." -ForegroundColor Red
    Write-Host "Please run this script from the directory where you extracted the toolchain."
    exit 1
}

# Ask for WSL Distro
$distro = Read-Host "Enter your WSL Distro Name (default: Ubuntu)"
if ([string]::IsNullOrWhiteSpace($distro)) {
    $distro = "Ubuntu"
}

Write-Host "Using Distro: $distro" -ForegroundColor Gray

# Create mount points
Write-Host "Creating /mnt/lfs directories..."
wsl -d $distro -u root mkdir -p /mnt/lfs/tools
wsl -d $distro -u root mkdir -p /mnt/lfs/usr

# Get absolute paths (WSL friendly)
$currentDir = Get-Location
$wslPath = "/mnt/c" + $currentDir.Path.Substring(2).Replace("\", "/")

# Mount
Write-Host "Mounting toolchain..."
wsl -d $distro -u root mount --bind "$wslPath/tools" /mnt/lfs/tools
wsl -d $distro -u root mount --bind "$wslPath/usr" /mnt/lfs/usr

Write-Host "✅ Mounted successfully!" -ForegroundColor Green
Write-Host "Entering LFS Shell..."
wsl -d $distro -u root chroot /mnt/lfs /tools/bin/env -i HOME=/root term=$TERM PS1='\u:\w\$ ' PATH=/bin:/usr/bin:/sbin:/usr/sbin:/tools/bin /tools/bin/bash --login +h
