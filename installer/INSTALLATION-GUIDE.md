# LFS Builder - Installation Guide

## Welcome to LFS Builder!

LFS Builder is a comprehensive Windows installer that automates the setup and building of Linux From Scratch (LFS) on your Windows system using WSL2.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [System Requirements](#system-requirements)
3. [Installation Steps](#installation-steps)
4. [After Installation](#after-installation)
5. [Building LFS](#building-lfs)
6. [Troubleshooting](#troubleshooting)
7. [Uninstallation](#uninstallation)

---

## Quick Start

**3 Simple Steps:**

1. **Download** the installer package (LFS-Builder-Setup-v1.0.0.zip)
2. **Extract** and run `Install-LFS-Builder.bat`
3. **Follow** the installation wizard

That's it! The installer handles everything automatically.

---

## System Requirements

### Minimum Requirements

| Component | Requirement |
|-----------|-------------|
| **Operating System** | Windows 10 Build 19041+ or Windows 11 |
| **Disk Space** | 30 GB free space |
| **RAM** | 4 GB |
| **CPU** | Dual-core processor |
| **Virtualization** | VT-x (Intel) or AMD-V enabled in BIOS |

### Recommended Specifications

| Component | Recommendation |
|-----------|----------------|
| **RAM** | 8 GB or more |
| **CPU** | 4+ cores with SMT/HyperThreading |
| **Disk Space** | 50 GB free space (SSD preferred) |
| **Internet** | High-speed connection for downloads |

---

## Installation Steps

### Step 1: Download the Installer

Download **LFS-Builder-Setup-v1.0.0.zip** from the official distribution source.

### Step 2: Extract the Package

1. Right-click the downloaded ZIP file
2. Select **Extract All...**
3. Choose a temporary location (e.g., `C:\Temp\LFS-Setup`)
4. Click **Extract**

### Step 3: Run the Installer

1. Navigate to the extracted folder
2. **Right-click** on `Install-LFS-Builder.bat`
3. Select **Run as Administrator**
   - ⚠️ **Important:** Administrator privileges are required
4. If prompted by User Account Control (UAC), click **Yes**

### Step 4: Follow the Wizard

The installer will guide you through 7 stages:

#### Stage 1: Welcome
- Read the introduction
- Click **Next** to continue

#### Stage 2: System Check (1 minute)
The installer verifies:
- ✓ Windows version (10/11, Build 19041+)
- ✓ Available disk space (30GB+)
- ✓ System memory (4GB+ recommended: 8GB)
- ✓ CPU virtualization support
- ✓ Existing WSL installation

#### Stage 3: Dependencies (5-10 minutes)
Automatically installs:
- WSL (Windows Subsystem for Linux)
- Virtual Machine Platform
- WSL2 updates

#### Stage 4: WSL Setup (5-10 minutes)
- Downloads and installs Ubuntu for WSL
- Configures WSL2 settings
- Optimizes performance (8GB RAM, 4 CPU cores)

#### Stage 5: Environment (2-3 minutes)
Creates LFS build environment:
- `/mnt/lfs` directory structure
- Environment variables (LFS, LFS_TGT, PATH)
- Build dependency packages

#### Stage 6: Scripts (1 minute)
Installs:
- Build scripts to `C:\Program Files\LFS-Builder`
- Desktop shortcuts
- Quick start guide

#### Stage 7: Complete
- Installation summary
- Next steps
- Quick start guide opens automatically

**Total Installation Time:** 15-30 minutes

---

## After Installation

### What's Installed?

#### Desktop Shortcuts

| Shortcut | Purpose |
|----------|---------|
| **LFS Builder** | Start the automated LFS build process |
| **LFS Shell** | Open a terminal in the LFS environment |
| **Check Build Status** | Monitor build progress and logs |

#### File Locations

| Location | Contents |
|----------|----------|
| `C:\Program Files\LFS-Builder\` | Installed scripts and tools |
| `/mnt/lfs/` | LFS build root (inside WSL) |
| `/mnt/lfs/sources/` | Downloaded source packages |
| `/mnt/lfs/logs/` | Build logs |
| Desktop | Quick access shortcuts |

#### Quick Start Guide

A **QUICK-START.txt** file opens automatically after installation with:
- Next steps
- Command references
- Build time estimates
- Support resources

---

## Building LFS

### Option 1: One-Click Build (Recommended)

1. **Double-click** the **LFS Builder** shortcut on your desktop
2. The build starts automatically
3. Estimated time: **8-12 hours**

### Option 2: Manual Build

Open PowerShell and run:

```powershell
cd "C:\Program Files\LFS-Builder"
.\BUILD-LFS-CORRECT.ps1
```

### Build Stages

| Stage | Description | Time |
|-------|-------------|------|
| **Chapter 5** | Cross-compilation toolchain | 1-2 hours |
| **Chapter 6** | Temporary tools in chroot | 2-3 hours |
| **Chapter 7-8** | Complete LFS system | 4-6 hours |
| **Chapter 9** | Kernel compilation and boot setup | 1 hour |

**Total:** 8-12 hours (varies by CPU speed)

### Monitoring Progress

**Option 1:** Desktop shortcut
- Double-click **Check Build Status**

**Option 2:** PowerShell command
```powershell
.\CHECK_BUILD_STATUS.ps1
```

**Option 3:** View logs directly
```bash
# In WSL
tail -f /mnt/lfs/logs/build.log
```

### Resuming After Interruption

The build system supports **automatic resume**:

1. Simply re-run the build command
2. The system detects completed stages
3. Resumes from the last checkpoint

---

## Troubleshooting

### Common Issues

#### 1. "WSL not found" or "WSL installation failed"

**Solution:**
1. Check Windows version: **Settings > System > About**
   - Requires Build 19041 or later
2. Run Windows Update to get latest WSL support
3. Manually enable WSL:
   ```powershell
   dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
   dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
   ```
4. Restart your computer
5. Re-run the installer

#### 2. "Virtualization not enabled"

**Solution:**
1. Restart computer and enter BIOS/UEFI settings
   - Common keys: F2, F10, Del, Esc (during boot)
2. Find virtualization settings:
   - **Intel:** Look for "VT-x" or "Intel Virtualization Technology"
   - **AMD:** Look for "AMD-V" or "SVM Mode"
3. Enable the setting
4. Save and exit BIOS
5. Re-run the installer

#### 3. "Insufficient disk space"

**Solution:**
1. Free up at least 30GB on your C: drive
2. Use Disk Cleanup: `cleanmgr.exe`
3. Remove unnecessary files
4. Consider using an external drive (not recommended for performance)

#### 4. Build fails during compilation

**Solution:**
1. Check logs:
   ```bash
   wsl cat /mnt/lfs/logs/build.log
   ```
2. Verify environment variables:
   ```bash
   wsl bash -c "source ~/.lfsrc && env | grep LFS"
   ```
3. Resume the build (it will skip completed packages):
   ```powershell
   .\BUILD-LFS-CORRECT.ps1
   ```

#### 5. "Ubuntu WSL not starting"

**Solution:**
1. Check WSL status:
   ```powershell
   wsl --status
   ```
2. Restart WSL:
   ```powershell
   wsl --shutdown
   wsl
   ```
3. Update WSL:
   ```powershell
   wsl --update
   ```

### Getting Help

1. **View Logs:**
   - Installation: `%TEMP%\lfs-installer.log`
   - Build: `/mnt/lfs/logs/build.log`

2. **Documentation:**
   - Quick Start: `C:\Program Files\LFS-Builder\QUICK-START.txt`
   - Architecture: `docs\LOCAL-LFS-BUILD-ARCHITECTURE.md`
   - LFS Book: https://www.linuxfromscratch.org/lfs/

3. **System Check:**
   ```powershell
   # Check WSL distributions
   wsl -l -v
   
   # Check disk space
   Get-PSDrive C
   
   # Check system info
   systeminfo
   ```

---

## Uninstallation

### Complete Removal

To completely remove LFS Builder:

#### 1. Remove WSL Distribution (Optional)

```powershell
# List distributions
wsl -l -v

# Unregister (WARNING: This deletes all LFS data)
wsl --unregister Ubuntu
```

#### 2. Delete Installation Directory

```powershell
Remove-Item "C:\Program Files\LFS-Builder" -Recurse -Force
```

#### 3. Delete Desktop Shortcuts

Delete the following from your desktop:
- LFS Builder.lnk
- LFS Shell.lnk
- Check Build Status.lnk

#### 4. Clean WSL Data (Optional)

```powershell
# Remove .wslconfig
Remove-Item "$env:USERPROFILE\.wslconfig" -Force

# Uninstall WSL (only if you don't use it for anything else)
wsl --uninstall
```

### Partial Removal (Keep WSL)

To keep WSL but remove only LFS build files:

```bash
# In WSL
sudo rm -rf /mnt/lfs
```

---

## Advanced Configuration

### Custom Installation Path

Edit `installer\installer.config` before running the installer:

```ini
[Installation]
InstallPath=%ProgramFiles%\LFS-Builder
```

### Performance Tuning

Adjust WSL resources in `%USERPROFILE%\.wslconfig`:

```ini
[wsl2]
memory=16GB          # Allocate more RAM
processors=8         # Use more CPU cores
swap=8GB             # Increase swap space
```

Restart WSL after changes:
```powershell
wsl --shutdown
```

### Build Parallelization

Edit `installer.config`:

```ini
[Build]
ParallelJobs=8  # Adjust based on CPU cores (0 = auto-detect)
```

---

## Additional Resources

### Official Documentation

- **LFS Book:** https://www.linuxfromscratch.org/lfs/
- **LFS FAQ:** https://www.linuxfromscratch.org/faq/
- **LFS Wiki:** https://wiki.linuxfromscratch.org/

### Project Documentation

- `docs/LOCAL-LFS-BUILD-ARCHITECTURE.md` - Build system architecture
- `docs/PROJECT-DOCUMENTATION-INDEX.md` - Complete documentation index
- `README.md` - Project overview

### Community Support

- LFS Mailing Lists: http://www.linuxfromscratch.org/mail.html
- LFS Forums: https://www.linuxfromscratch.org/
- IRC: #lfs-support on Libera.Chat

---

## License

This installer and build system are released under the MIT License.

Linux From Scratch® is a registered trademark of Gerard Beekmans.

---

## Credits

**LFS Automated Build Team**

Based on:
- Linux From Scratch 12.0
- Windows Subsystem for Linux 2
- Ubuntu 20.04+ LTS

---

**Thank you for using LFS Builder!**

*Happy building!* 🐧🔨
