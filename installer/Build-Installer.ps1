#Requires -Version 5.1

<#
.SYNOPSIS
    Build and package the LFS Windows Installer
.DESCRIPTION
    Creates a distributable installer package for LFS Builder.
    This script bundles the GUI installer, configuration files, and build scripts
    into a single downloadable package.
.NOTES
    Version: 1.0.0
    Output: LFS-Builder-Setup-v{version}.zip
#>

param(
    [string]$OutputDir = ".\dist",
    [string]$Version = "1.0.0",
    [switch]$CreateSFX,  # Create self-extracting archive (requires 7-Zip)
    [switch]$SignPackage  # Code sign the package (requires certificate)
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "  LFS Builder - Installer Packager" -ForegroundColor Cyan
Write-Host "  Version $Version" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# CONFIGURATION
# ============================================================================

$RootDir = Split-Path -Parent $PSScriptRoot
$InstallerDir = $PSScriptRoot
$BuildDir = Join-Path $OutputDir "build"
$PackageName = "LFS-Builder-Setup-v$Version"
$PackagePath = Join-Path $OutputDir "$PackageName.zip"

# Files to include in the installer package
$FilesToInclude = @{
    # Main installer
    "Installer" = @(
        "LFS-Setup.ps1",
        "installer-manifest.json",
        "installer.config"
    )
    
    # Build scripts (from root)
    "BuildScripts" = @(
        "BUILD-LFS-CORRECT.ps1",
        "CHECK_BUILD_STATUS.ps1",
        "build-next-package.ps1",
        "ENTER-LFS-SHELL.ps1",
        "lfs-build.sh",
        "build-chapter6-fixed.sh",
        "build-bootable-kernel.sh"
    )
    
    # Documentation
    "Documentation" = @(
        "README.md",
        "docs/LOCAL-LFS-BUILD-ARCHITECTURE.md",
        "docs/PROJECT-DOCUMENTATION-INDEX.md"
    )
    
    # Helper scripts
    "Helpers" = @(
        "helpers/firestore-logger.js",
        "helpers/package.json"
    )
}

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

function Write-Step {
    param([string]$Message, [string]$Status = "Info")
    
    $icon = switch ($Status) {
        "Success" { "✓" }
        "Error" { "✗" }
        "Warning" { "!" }
        default { "•" }
    }
    
    $color = switch ($Status) {
        "Success" { "Green" }
        "Error" { "Red" }
        "Warning" { "Yellow" }
        default { "White" }
    }
    
    Write-Host "  $icon $Message" -ForegroundColor $color
}

function Test-Prerequisites {
    Write-Host "Checking prerequisites..." -ForegroundColor Yellow
    Write-Host ""
    
    $allGood = $true
    
    # Check PowerShell version
    if ($PSVersionTable.PSVersion.Major -ge 5) {
        Write-Step "PowerShell $($PSVersionTable.PSVersion)" "Success"
    } else {
        Write-Step "PowerShell 5.1+ required (found $($PSVersionTable.PSVersion))" "Error"
        $allGood = $false
    }
    
    # Check if running from correct directory
    if (Test-Path (Join-Path $InstallerDir "LFS-Setup.ps1")) {
        Write-Step "Installer files found" "Success"
    } else {
        Write-Step "LFS-Setup.ps1 not found in installer directory" "Error"
        $allGood = $false
    }
    
    # Check if build scripts exist
    if (Test-Path (Join-Path $RootDir "BUILD-LFS-CORRECT.ps1")) {
        Write-Step "Build scripts found" "Success"
    } else {
        Write-Step "Build scripts not found in root directory" "Error"
        $allGood = $false
    }
    
    # Check 7-Zip if SFX requested
    if ($CreateSFX) {
        if (Test-Path "$env:ProgramFiles\7-Zip\7z.exe") {
            Write-Step "7-Zip found (for SFX creation)" "Success"
        } else {
            Write-Step "7-Zip not found (required for SFX)" "Error"
            $allGood = $false
        }
    }
    
    Write-Host ""
    return $allGood
}

function New-BuildDirectory {
    Write-Host "Creating build directory..." -ForegroundColor Yellow
    
    # Clean existing build directory
    if (Test-Path $BuildDir) {
        Remove-Item $BuildDir -Recurse -Force
        Write-Step "Cleaned existing build directory" "Success"
    }
    
    # Create fresh directory structure
    New-Item -ItemType Directory -Path $BuildDir -Force | Out-Null
    New-Item -ItemType Directory -Path "$BuildDir\installer" -Force | Out-Null
    New-Item -ItemType Directory -Path "$BuildDir\scripts" -Force | Out-Null
    New-Item -ItemType Directory -Path "$BuildDir\docs" -Force | Out-Null
    New-Item -ItemType Directory -Path "$BuildDir\helpers" -Force | Out-Null
    
    Write-Step "Build directory structure created" "Success"
    Write-Host ""
}

function Copy-InstallerFiles {
    Write-Host "Copying installer files..." -ForegroundColor Yellow
    
    # Copy installer files
    foreach ($file in $FilesToInclude.Installer) {
        $source = Join-Path $InstallerDir $file
        $dest = Join-Path "$BuildDir\installer" $file
        
        if (Test-Path $source) {
            Copy-Item $source $dest -Force
            Write-Step $file "Success"
        } else {
            Write-Step "$file not found" "Warning"
        }
    }
    
    Write-Host ""
}

function Copy-BuildScripts {
    Write-Host "Copying build scripts..." -ForegroundColor Yellow
    
    foreach ($file in $FilesToInclude.BuildScripts) {
        $source = Join-Path $RootDir $file
        $dest = Join-Path "$BuildDir\scripts" (Split-Path $file -Leaf)
        
        if (Test-Path $source) {
            Copy-Item $source $dest -Force
            Write-Step $file "Success"
        } else {
            Write-Step "$file not found" "Warning"
        }
    }
    
    Write-Host ""
}

function Copy-Documentation {
    Write-Host "Copying documentation..." -ForegroundColor Yellow
    
    foreach ($file in $FilesToInclude.Documentation) {
        $source = Join-Path $RootDir $file
        $dest = Join-Path "$BuildDir\docs" (Split-Path $file -Leaf)
        
        if (Test-Path $source) {
            Copy-Item $source $dest -Force
            Write-Step $file "Success"
        } else {
            Write-Step "$file not found" "Warning"
        }
    }
    
    Write-Host ""
}

function Copy-Helpers {
    Write-Host "Copying helper scripts..." -ForegroundColor Yellow
    
    foreach ($file in $FilesToInclude.Helpers) {
        $source = Join-Path $RootDir $file
        $dest = Join-Path "$BuildDir\helpers" (Split-Path $file -Leaf)
        
        if (Test-Path $source) {
            Copy-Item $source $dest -Force
            Write-Step $file "Success"
        } else {
            Write-Step "$file not found" "Warning"
        }
    }
    
    Write-Host ""
}

function New-LauncherScript {
    Write-Host "Creating installer launcher..." -ForegroundColor Yellow
    
    $launcherContent = @'
@echo off
REM LFS Builder Setup Launcher
REM This script launches the PowerShell-based installer with proper permissions

echo.
echo =============================================
echo   LFS Builder Setup
echo =============================================
echo.
echo This installer requires Administrator privileges.
echo.

net session >nul 2>&1
if %errorLevel% == 0 (
    echo Running with Administrator privileges...
    echo.
    powershell.exe -ExecutionPolicy Bypass -File "%~dp0installer\LFS-Setup.ps1"
) else (
    echo Requesting Administrator privileges...
    echo.
    powershell.exe -Command "Start-Process powershell.exe -ArgumentList '-ExecutionPolicy Bypass -File \"%~dp0installer\LFS-Setup.ps1\"' -Verb RunAs"
)

if %errorLevel% neq 0 (
    echo.
    echo ERROR: Installation failed or was cancelled.
    echo.
    pause
    exit /b %errorLevel%
)

echo.
echo Installation completed successfully!
echo.
pause
'@
    
    $launcherPath = Join-Path $BuildDir "Install-LFS-Builder.bat"
    $launcherContent | Out-File -FilePath $launcherPath -Encoding ascii
    
    Write-Step "Install-LFS-Builder.bat created" "Success"
    Write-Host ""
}

function New-ReadmeFile {
    Write-Host "Creating package README..." -ForegroundColor Yellow
    
    $readmeContent = @"
===============================================
   LFS Builder - Windows Installer
   Version $Version
===============================================

QUICK START:
------------
1. Double-click "Install-LFS-Builder.bat"
2. Follow the setup wizard
3. Click "LFS Builder" on your desktop when complete

SYSTEM REQUIREMENTS:
--------------------
• Windows 10/11 (Build 19041 or later)
• 30GB+ free disk space
• 8GB+ RAM (recommended)
• CPU virtualization enabled (VT-x/AMD-V)

WHAT GETS INSTALLED:
--------------------
• WSL2 (Windows Subsystem for Linux)
• Ubuntu WSL distribution
• LFS build environment at /mnt/lfs
• Build scripts and tools
• Desktop shortcuts

INSTALLATION TIME:
------------------
• Total: 15-30 minutes (depending on internet speed)

AFTER INSTALLATION:
-------------------
Launch "LFS Builder" from your desktop to start building Linux From Scratch!

The build process takes 8-12 hours total:
• Chapter 5: Cross toolchain (1-2h)
• Chapter 6: Temporary tools (2-3h)
• Chapter 7-8: Final system (4-6h)
• Chapter 9: Kernel & boot (1h)

DOCUMENTATION:
--------------
Full documentation is available in the "docs" folder after installation,
or at: %ProgramFiles%\LFS-Builder\

SUPPORT:
--------
• LFS Official Book: https://www.linuxfromscratch.org/lfs/
• Project Docs: See /docs folder
• Web Dashboard: http://localhost:3000 (after installation)

TROUBLESHOOTING:
----------------
If you encounter issues:
1. Ensure CPU virtualization is enabled in BIOS
2. Check Windows version: Settings > System > About
3. Verify disk space: At least 30GB free on C:
4. Run Windows Update to get latest WSL updates

LICENSE:
--------
MIT License - See project repository for full license text

COPYRIGHT:
----------
© 2025 LFS Automated Build Team

===============================================
"@
    
    $readmePath = Join-Path $BuildDir "README.txt"
    $readmeContent | Out-File -FilePath $readmePath -Encoding utf8
    
    Write-Step "README.txt created" "Success"
    Write-Host ""
}

function New-VersionFile {
    Write-Host "Creating version manifest..." -ForegroundColor Yellow
    
    $versionInfo = @{
        version = $Version
        buildDate = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        buildMachine = $env:COMPUTERNAME
        buildUser = $env:USERNAME
        gitCommit = try { (git rev-parse --short HEAD 2>$null) } catch { "unknown" }
        gitBranch = try { (git rev-parse --abbrev-ref HEAD 2>$null) } catch { "unknown" }
    }
    
    $versionPath = Join-Path $BuildDir "version.json"
    $versionInfo | ConvertTo-Json -Depth 10 | Out-File -FilePath $versionPath -Encoding utf8
    
    Write-Step "version.json created" "Success"
    Write-Host ""
}

function New-Package {
    Write-Host "Creating installer package..." -ForegroundColor Yellow
    
    # Create output directory
    if (!(Test-Path $OutputDir)) {
        New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
    }
    
    # Remove existing package
    if (Test-Path $PackagePath) {
        Remove-Item $PackagePath -Force
    }
    
    # Create ZIP archive
    Write-Step "Compressing files..."
    Compress-Archive -Path "$BuildDir\*" -DestinationPath $PackagePath -CompressionLevel Optimal
    
    $packageSize = [math]::Round((Get-Item $PackagePath).Length / 1MB, 2)
    Write-Step "Package created: $PackageName.zip ($packageSize MB)" "Success"
    
    Write-Host ""
}

function New-SelfExtractingArchive {
    if (!$CreateSFX) { return }
    
    Write-Host "Creating self-extracting archive..." -ForegroundColor Yellow
    
    $7zipPath = "$env:ProgramFiles\7-Zip\7z.exe"
    $sfxModule = "$env:ProgramFiles\7-Zip\7z.sfx"
    $sfxConfig = Join-Path $env:TEMP "sfx-config.txt"
    $sfxPath = Join-Path $OutputDir "$PackageName.exe"
    
    # Create SFX config
    $sfxConfigContent = @"
;!@Install@!UTF-8!
Title="LFS Builder Setup"
BeginPrompt="This will install LFS Builder on your system.`n`nClick OK to continue."
RunProgram="Install-LFS-Builder.bat"
;!@InstallEnd@!
"@
    $sfxConfigContent | Out-File -FilePath $sfxConfig -Encoding ascii
    
    # Create temporary 7z archive
    $temp7z = Join-Path $env:TEMP "lfs-temp.7z"
    & $7zipPath a -t7z $temp7z "$BuildDir\*" -mx9 | Out-Null
    
    # Combine SFX module + config + archive
    cmd /c copy /b "$sfxModule" + "$sfxConfig" + "$temp7z" "$sfxPath" | Out-Null
    
    # Cleanup
    Remove-Item $temp7z -Force -ErrorAction SilentlyContinue
    Remove-Item $sfxConfig -Force -ErrorAction SilentlyContinue
    
    $sfxSize = [math]::Round((Get-Item $sfxPath).Length / 1MB, 2)
    Write-Step "Self-extracting archive created: $PackageName.exe ($sfxSize MB)" "Success"
    
    Write-Host ""
}

function Show-Summary {
    Write-Host ""
    Write-Host "=======================================" -ForegroundColor Green
    Write-Host "  BUILD COMPLETE" -ForegroundColor Green
    Write-Host "=======================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Installer package created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Package Details:" -ForegroundColor Cyan
    Write-Host "  Name: $PackageName" -ForegroundColor White
    Write-Host "  Version: $Version" -ForegroundColor White
    Write-Host "  Location: $PackagePath" -ForegroundColor White
    
    if ($CreateSFX) {
        $sfxPath = Join-Path $OutputDir "$PackageName.exe"
        Write-Host "  SFX: $sfxPath" -ForegroundColor White
    }
    
    Write-Host ""
    Write-Host "Distribution:" -ForegroundColor Cyan
    Write-Host "  Upload this package to your distribution channel" -ForegroundColor White
    Write-Host "  Users can download and run Install-LFS-Builder.bat" -ForegroundColor White
    Write-Host ""
    Write-Host "Testing:" -ForegroundColor Cyan
    Write-Host "  1. Extract $PackageName.zip to a test location" -ForegroundColor White
    Write-Host "  2. Run Install-LFS-Builder.bat" -ForegroundColor White
    Write-Host "  3. Follow the installation wizard" -ForegroundColor White
    Write-Host ""
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

try {
    # Check prerequisites
    if (!(Test-Prerequisites)) {
        Write-Host ""
        Write-Host "Prerequisites check failed. Please fix the issues above." -ForegroundColor Red
        exit 1
    }
    
    # Build steps
    New-BuildDirectory
    Copy-InstallerFiles
    Copy-BuildScripts
    Copy-Documentation
    Copy-Helpers
    New-LauncherScript
    New-ReadmeFile
    New-VersionFile
    New-Package
    New-SelfExtractingArchive
    
    # Show summary
    Show-Summary
    
    # Open output directory
    Start-Process explorer.exe $OutputDir
    
    exit 0
    
} catch {
    Write-Host ""
    Write-Host "ERROR: Build failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    exit 1
}
