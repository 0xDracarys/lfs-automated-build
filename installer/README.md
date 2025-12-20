# LFS Builder Installer

## Overview

This directory contains a **professional Windows installer** for the Linux From Scratch automated build system. The installer provides a native Windows GUI experience similar to commercial application installers.

## Installer Features

✅ **Windows Forms GUI** - Professional installer interface  
✅ **Automated WSL2 Setup** - One-click WSL configuration  
✅ **Progress Tracking** - Visual progress bars and status updates  
✅ **System Requirements Check** - Validates before installation  
✅ **Desktop Shortcuts** - Quick access to build tools  
✅ **Error Handling** - Graceful recovery and logging  
✅ **Resume Support** - Continue after interruption  

---

## Quick Start

### For End Users

1. **Download** the installer package:
   - `LFS-Builder-Setup-v1.0.0.zip`

2. **Extract and run:**
   ```cmd
   Install-LFS-Builder.bat
   ```

3. **Follow the wizard:**
   - 7 simple steps
   - 15-30 minutes total time
   - Fully automated

4. **Start building:**
   - Double-click "LFS Builder" on your desktop
   - Or run from Start Menu

### For Developers

**Build the installer package:**

```powershell
cd installer
.\Build-Installer.ps1
```

This creates:
- `dist/LFS-Builder-Setup-v1.0.0.zip` - Distributable package
- `dist/LFS-Builder-Setup-v1.0.0.exe` - Self-extracting (with -CreateSFX)

---

## File Structure

```
installer/
├── LFS-Setup.ps1                   # Main GUI installer (Windows Forms)
├── Build-Installer.ps1             # Package builder script
├── installer-manifest.json         # Installation metadata
├── installer.config                # Configuration settings
├── INSTALLATION-GUIDE.md           # User documentation
└── README.md                       # This file

After packaging:
dist/
├── LFS-Builder-Setup-v1.0.0.zip   # Distributable ZIP
├── LFS-Builder-Setup-v1.0.0.exe   # Self-extracting (optional)
└── build/                          # Temporary build files
    ├── installer/
    ├── scripts/
    ├── docs/
    ├── helpers/
    ├── Install-LFS-Builder.bat
    ├── README.txt
    └── version.json
```

---

## Installation Stages

The installer guides users through 7 stages:

### 1. Welcome (30 seconds)
- Introduction to LFS Builder
- License and terms
- Feature overview

### 2. System Check (1 minute)
Verifies:
- ✓ Windows 10/11 (Build 19041+)
- ✓ 30GB+ disk space
- ✓ 4GB+ RAM (8GB recommended)
- ✓ CPU virtualization support
- ✓ Existing WSL installation

### 3. Dependencies (5-10 minutes)
Installs:
- WSL (Windows Subsystem for Linux)
- Virtual Machine Platform
- WSL2 kernel updates

### 4. WSL Setup (5-10 minutes)
- Downloads Ubuntu distribution
- Configures WSL2 settings
- Optimizes performance settings

### 5. Environment (2-3 minutes)
Creates:
- `/mnt/lfs` directory structure
- Build environment variables
- Source/tools/logs directories

### 6. Scripts (1 minute)
Installs:
- Build scripts to Program Files
- Desktop shortcuts
- PowerShell helpers

### 7. Complete (30 seconds)
- Installation summary
- Quick start guide
- Launch options

**Total Time:** 15-30 minutes

---

## Components

### LFS-Setup.ps1

**Main GUI installer using Windows Forms**

Features:
- Professional Windows Forms interface
- Progress bars and status updates
- Real-time log display
- Error handling and recovery
- Stage navigation (Next/Back/Cancel)

Key functions:
```powershell
Initialize-GUI              # Create Windows Forms
Show-WelcomePage           # Stage 1
Test-SystemRequirements    # Stage 2
Install-Dependencies       # Stage 3
Setup-WSL                  # Stage 4
Setup-LFSEnvironment       # Stage 5
Install-BuildScripts       # Stage 6
Show-CompletionPage        # Stage 7
```

Requirements:
- PowerShell 5.1+
- Administrator privileges
- Windows 10 Build 19041+

### Build-Installer.ps1

**Packages the installer for distribution**

Creates:
- ZIP package with all files
- Self-extracting .exe (with -CreateSFX)
- Version manifest
- README and documentation

Usage:
```powershell
# Basic package
.\Build-Installer.ps1

# With self-extracting archive
.\Build-Installer.ps1 -CreateSFX

# Custom output location
.\Build-Installer.ps1 -OutputDir "C:\Release"

# Sign the package
.\Build-Installer.ps1 -SignPackage
```

### installer-manifest.json

**Installation metadata and configuration**

Contains:
- System requirements
- Dependency list
- Installation stages
- File paths
- Features list

### installer.config

**User-configurable settings**

Settings:
```ini
[Installation]
AppName=LFS Builder
InstallPath=%ProgramFiles%\LFS-Builder

[System]
MinDiskSpaceGB=30
MinRAMGB=4

[Build]
ParallelJobs=0  # 0 = auto-detect

[Features]
WebDashboard=true
ProgressTracking=true
```

### INSTALLATION-GUIDE.md

**Complete user documentation**

Covers:
- Quick start guide
- System requirements
- Installation steps
- Troubleshooting
- Uninstallation
- Advanced configuration

---

## Building the Installer

### Prerequisites

- Windows 10/11
- PowerShell 5.1+
- Administrator privileges
- 7-Zip (optional, for self-extracting archives)

### Build Steps

1. **Navigate to installer directory:**
   ```powershell
   cd installer
   ```

2. **Run the build script:**
   ```powershell
   .\Build-Installer.ps1
   ```

3. **Output is created in:**
   ```
   dist/LFS-Builder-Setup-v1.0.0.zip
   ```

### Build Options

```powershell
# Create self-extracting .exe (requires 7-Zip)
.\Build-Installer.ps1 -CreateSFX

# Specify version
.\Build-Installer.ps1 -Version "1.0.1"

# Custom output directory
.\Build-Installer.ps1 -OutputDir "C:\Releases"

# Sign the package (requires code signing certificate)
.\Build-Installer.ps1 -SignPackage
```

### What Gets Packaged

The build script includes:

**From installer/ directory:**
- LFS-Setup.ps1
- installer-manifest.json
- installer.config

**From root directory:**
- BUILD-LFS-CORRECT.ps1
- CHECK_BUILD_STATUS.ps1
- build-next-package.ps1
- ENTER-LFS-SHELL.ps1
- lfs-build.sh
- build-chapter6-fixed.sh
- build-bootable-kernel.sh

**From docs/:**
- README.md
- LOCAL-LFS-BUILD-ARCHITECTURE.md
- PROJECT-DOCUMENTATION-INDEX.md

**From helpers/:**
- firestore-logger.js
- package.json

**Generated files:**
- Install-LFS-Builder.bat (launcher)
- README.txt (quick start)
- version.json (build metadata)

---

## Distribution

### Release Channels

1. **GitHub Releases**
   - Upload ZIP to GitHub Releases
   - Tag with version (v1.0.0)
   - Include INSTALLATION-GUIDE.md

2. **Direct Download**
   - Host on web server
   - Provide checksum (SHA256)
   - Version in filename

3. **Self-Extracting Executable**
   - For users without ZIP support
   - Requires 7-Zip to build
   - Larger file size

### Checksums

Generate checksums for verification:

```powershell
# SHA256
Get-FileHash dist\LFS-Builder-Setup-v1.0.0.zip -Algorithm SHA256

# MD5
Get-FileHash dist\LFS-Builder-Setup-v1.0.0.zip -Algorithm MD5
```

Include checksums in release notes.

---

## Testing

### Test Installation

1. **Extract package to test location:**
   ```powershell
   Expand-Archive dist\LFS-Builder-Setup-v1.0.0.zip -DestinationPath C:\Temp\LFS-Test
   ```

2. **Run installer:**
   ```cmd
   cd C:\Temp\LFS-Test
   Install-LFS-Builder.bat
   ```

3. **Verify:**
   - All stages complete successfully
   - Desktop shortcuts created
   - Files installed to Program Files
   - WSL environment configured

### Test Build Process

After installation:

1. **Launch LFS Builder:**
   - Double-click desktop shortcut
   - Or run BUILD-LFS-CORRECT.ps1

2. **Monitor progress:**
   - Check logs in `/mnt/lfs/logs/`
   - Use CHECK_BUILD_STATUS.ps1

3. **Verify environment:**
   ```bash
   wsl bash -c "source ~/.lfsrc && env | grep LFS"
   ```

### Automated Testing

```powershell
# Run system checks only
.\LFS-Setup.ps1 -TestMode

# Silent installation
.\LFS-Setup.ps1 -Silent -LogPath "C:\test-install.log"
```

---

## Troubleshooting

### Common Build Issues

#### "LFS-Setup.ps1 not found"

**Solution:**
Ensure you're running Build-Installer.ps1 from the `installer/` directory.

#### "Permission denied"

**Solution:**
Run PowerShell as Administrator:
```powershell
Start-Process powershell -Verb RunAs
```

#### "7-Zip not found" (with -CreateSFX)

**Solution:**
Install 7-Zip or build without SFX:
```powershell
.\Build-Installer.ps1  # Without -CreateSFX flag
```

### Common Installation Issues

See [INSTALLATION-GUIDE.md](INSTALLATION-GUIDE.md#troubleshooting) for complete troubleshooting guide.

---

## Customization

### Change Installation Path

Edit `installer.config`:

```ini
[Installation]
InstallPath=C:\Custom\Path\LFS-Builder
```

### Modify System Requirements

Edit `installer-manifest.json`:

```json
{
  "systemRequirements": {
    "hardware": {
      "diskSpace": {
        "minimum": "50 GB"
      }
    }
  }
}
```

### Add Custom Scripts

Edit `Build-Installer.ps1`:

```powershell
$FilesToInclude = @{
    "BuildScripts" = @(
        "BUILD-LFS-CORRECT.ps1",
        "my-custom-script.ps1"  # Add your script
    )
}
```

### Branding

Modify colors and text in `LFS-Setup.ps1`:

```powershell
$headerPanel.BackColor = [System.Drawing.Color]::FromArgb(41, 128, 185)
$titleLabel.Text = "Your Custom Title"
```

---

## Advanced Features

### Silent Installation

```powershell
.\LFS-Setup.ps1 -Silent -LogPath "C:\install.log"
```

### Custom Configuration

```powershell
.\LFS-Setup.ps1 -ConfigFile "custom.config"
```

### Code Signing

Sign the package for enterprise deployment:

```powershell
# Requires code signing certificate
.\Build-Installer.ps1 -SignPackage -CertThumbprint "ABC123..."
```

### MSI Package

Convert to MSI using WiX Toolset:

```cmd
candle installer.wxs
light -out LFS-Builder.msi installer.wixobj
```

---

## Version History

### v1.0.0 (Current)
- Initial release
- Windows Forms GUI installer
- WSL2 automated setup
- Desktop shortcuts
- Progress tracking
- Error handling

### Future Versions

Planned features:
- [ ] MSI package option
- [ ] Offline installation mode
- [ ] Custom WSL distro selection
- [ ] Multi-language support
- [ ] Automatic updates
- [ ] Cloud build integration

---

## Developer Notes

### Architecture

The installer follows a stage-based architecture:

1. **GUI Layer** - Windows Forms interface
2. **Stage Handlers** - Individual stage logic
3. **System Integration** - WSL, filesystem operations
4. **Error Handling** - Try/catch with logging

### Code Structure

```powershell
# Configuration
$Script:Config = @{ ... }
$Script:Stages = @( ... )

# GUI Components
Initialize-GUI
Write-Status

# Stage Handlers
Show-WelcomePage
Test-SystemRequirements
Install-Dependencies
Setup-WSL
Setup-LFSEnvironment
Install-BuildScripts
Show-CompletionPage

# Navigation
Move-ToNextStage
Move-ToPreviousStage

# Entry Point
Start-LFSSetup
```

### Testing

Test individual stages:

```powershell
# Load functions
. .\LFS-Setup.ps1

# Test specific stage
Test-SystemRequirements
```

### Logging

Installer logs to:
- GUI status box (real-time)
- `$Script:InstallLog` array (in-memory)
- `%TEMP%\lfs-installer.log` (file)

---

## Support

### Documentation

- [INSTALLATION-GUIDE.md](INSTALLATION-GUIDE.md) - User guide
- [../docs/LOCAL-LFS-BUILD-ARCHITECTURE.md](../docs/LOCAL-LFS-BUILD-ARCHITECTURE.md) - Architecture
- [../README.md](../README.md) - Project overview

### Community

- GitHub Issues: Report bugs
- LFS Forums: Community support
- Documentation: Full LFS book

---

## License

MIT License - See project root for full license text.

---

**Happy building!** 🚀
