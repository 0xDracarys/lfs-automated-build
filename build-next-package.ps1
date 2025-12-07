# build-next-package.ps1 - Windows wrapper for step-by-step LFS building
# Usage: .\build-next-package.ps1 [package-name]
# Examples:
#   .\build-next-package.ps1              # Show status and help
#   .\build-next-package.ps1 list         # List all packages
#   .\build-next-package.ps1 status       # Show build status
#   .\build-next-package.ps1 bash         # Build bash

param(
    [string]$Package = ""
)

$scriptPath = "C:\Users\Chintu\Documents\Dev Zone\Dev work web\lfs-automated\build-next-package.sh"

if ($Package -eq "") {
    Write-Host "🚀 LFS Step-by-Step Builder" -ForegroundColor Cyan
    Write-Host "===========================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\build-next-package.ps1 list           # Show all packages"
    Write-Host "  .\build-next-package.ps1 status         # Show build status"
    Write-Host "  .\build-next-package.ps1 <package>      # Build specific package"
    Write-Host ""
    Write-Host "Minimal Path (Priority 1) - 17 packages for bootable system:" -ForegroundColor Green
    Write-Host "  1. bash         - Command shell"
    Write-Host "  2. coreutils    - Basic commands (ls, cp, mv, etc.)"
    Write-Host "  3. grep         - Pattern matching"
    Write-Host "  4. sed          - Stream editor"
    Write-Host "  5. gawk         - Text processing"
    Write-Host "  6. make         - Build automation"
    Write-Host "  7. tar          - Archive management"
    Write-Host "  8. gzip         - Compression"
    Write-Host "  9. findutils    - File search"
    Write-Host " 10. diffutils    - File comparison"
    Write-Host " 11. systemd      - Init system"
    Write-Host " 12. util-linux   - System utilities (mount, etc.)"
    Write-Host " 13. e2fsprogs    - Filesystem utilities"
    Write-Host " 14. shadow       - Login/password"
    Write-Host " 15. procps-ng    - Process monitoring (ps, top)"
    Write-Host " 16. linux        - Kernel (90 min build!)"
    Write-Host " 17. grub         - Bootloader"
    Write-Host ""
    Write-Host "Standard Path (Priority 2) - Additional packages:" -ForegroundColor Yellow
    Write-Host " 18. m4, ncurses, file, bison, perl, python, vim, etc."
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Cyan
    Write-Host "  .\build-next-package.ps1 bash"
    Write-Host "  .\build-next-package.ps1 coreutils"
    Write-Host "  .\build-next-package.ps1 linux"
    Write-Host ""
    
    # Show current status
    wsl -d Athena bash -c "cd /home/dracarys/lfs-local-build/mnt/lfs && if [ -f build-status.txt ]; then echo 'Built packages:'; cat build-status.txt | sed 's/^/  ✓ /'; else echo 'No packages built yet. Start with: .\build-next-package.ps1 bash'; fi"
    
} else {
    Write-Host "🔨 Building $Package..." -ForegroundColor Cyan
    wsl -d Athena bash "$scriptPath" "$Package"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ SUCCESS! $Package is built and installed!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "  1. Run: .\build-next-package.ps1 status"
        Write-Host "  2. Build the next package in the list"
        Write-Host "  3. Repeat until all 17 minimal packages are done!"
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "❌ Build failed! Check the output above for errors." -ForegroundColor Red
        Write-Host ""
    }
}
