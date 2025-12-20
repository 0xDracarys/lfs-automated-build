# LFS Builder Installer - Native Windows Architecture

## Overview

The LFS Builder installer is a **professional native Windows application** built with C# Windows Forms and WiX Toolset. It provides the same polished installation experience as commercial Windows applications (Visual Studio, Chrome, etc.) with native dialog boxes, progress bars, and system integration.

## Technology Stack

### Primary: C# Windows Forms (.NET 8.0)
- **Framework**: .NET 8.0 with Windows Desktop support
- **UI**: Native Windows Forms (no PowerShell GUI)
- **Dialogs**: Native Windows MessageBox, FolderBrowserDialog, etc.
- **Threading**: Async/await for non-blocking operations
- **Process Management**: System.Diagnostics for WSL/PowerShell execution

### Secondary: WiX Toolset (MSI Generation)
- **Version**: WiX 3.11+ or WiX 4.0+
- **Format**: MSI installer package
- **Features**: Start Menu integration, uninstaller, upgrade support
- **Custom Actions**: WSL2 feature enablement

## Installer Workflow

### Step 1: Welcome Screen (`WelcomeForm.cs`)
```
┌─────────────────────────────────────────┐
│  [LOGO]  LFS Builder Setup              │
│                                         │
│  Welcome to the Linux From Scratch      │
│  Builder Installer                      │
│                                         │
│  This wizard will guide you through:    │
│  • Installing and configuring WSL2      │
│  • Setting up LFS build environment     │
│  • Creating shortcuts and tools         │
│                                         │
│                                         │
│          [Cancel]  [Next >]             │
└─────────────────────────────────────────┘
```

**Key features**:
- Admin rights check (requires elevation)
- Professional branding with logo
- Clear expectations for user
- Cancel confirmation dialog

### Step 2: Prerequisites Check (`PrerequisitesForm.cs`)
```
┌─────────────────────────────────────────┐
│  System Requirements Check              │
│                                         │
│  Verifying system compatibility...      │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ ✓ Windows 10 2004+      Pass    │   │
│  │ ✓ 8 GB RAM              Pass    │   │
│  │ ✓ 30 GB Free Space      Pass    │   │
│  │ ✓ 2+ CPU Cores          Pass    │   │
│  │ ⚠ Virtualization        Warning │   │
│  └─────────────────────────────────┘   │
│                                         │
│       [Cancel] [< Back]  [Next >]       │
└─────────────────────────────────────────┘
```

**Checks performed**:
1. **Windows Version**: Build 19041+ (Windows 10 2004+)
2. **RAM**: Minimum 8 GB physical memory
3. **Disk Space**: Minimum 30 GB free on C:
4. **CPU**: Minimum 2 cores
5. **Virtualization**: Check if enabled (warning only)

**Implementation**:
- Uses `System.Management` for WMI queries
- Real-time system detection
- Color-coded status (Green/Red/Orange)
- Blocks "Next" if requirements not met

### Step 3: Configuration (`ConfigurationForm.cs`)
```
┌─────────────────────────────────────────┐
│  Installation Configuration             │
│                                         │
│  Installation Directory:                │
│  [C:\LFSBuilder           ] [Browse...] │
│                                         │
│  Linux Distribution: [Ubuntu ▼]        │
│  Build Cores: [4 ▲▼]                   │
│                                         │
│  Additional Options:                    │
│  ☑ Create desktop shortcut              │
│  ☑ Create Start Menu shortcuts          │
│  ☑ Launch LFS Builder after install     │
│  ☑ Enable automatic updates             │
│                                         │
│       [Cancel] [< Back]  [Next >]       │
└─────────────────────────────────────────┘
```

**Configurable options**:
- Installation path (with folder browser)
- Linux distribution (Ubuntu, Debian, etc.)
- CPU cores for parallel builds
- Shortcut preferences
- Auto-launch and auto-update settings

**Validation**:
- Path exists and has write permissions
- Non-empty directory warning
- Valid drive with sufficient space

### Step 4: Installation Progress (`ProgressForm.cs`)
```
┌─────────────────────────────────────────┐
│  Installing LFS Builder                 │
│                                         │
│  Enabling WSL2 features...              │
│                                         │
│  ████████████░░░░░░░░░░░  45%          │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 12:34:56 Starting installation  │   │
│  │ 12:34:58 Checking prerequisites │   │
│  │ 12:35:02 Enabling VM Platform   │   │
│  │ 12:35:15 Installing Ubuntu...   │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│                        [Cancel]         │
└─────────────────────────────────────────┘
```

**Installation stages** (with progress %):
1. **0-10%**: Check prerequisites
2. **10-25%**: Enable WSL2 features (Virtual Machine Platform, WSL)
3. **25-50%**: Install Linux distribution via `wsl --install`
4. **50-70%**: Configure LFS environment variables and directories
5. **70-90%**: Create shortcuts (Desktop, Start Menu)
6. **90-100%**: Finalize and cleanup

**Key features**:
- Real-time progress bar
- Scrolling log window (console-style)
- Non-blocking async operations
- Cancel with confirmation
- Prevents closing during critical operations

### Step 5: Completion (`CompletionForm.cs`)
```
┌─────────────────────────────────────────┐
│  [✓]  Installation Complete             │
│                                         │
│  ✓ LFS Builder has been successfully    │
│    installed                            │
│                                         │
│  What's been installed:                 │
│  • WSL2 with Ubuntu Linux               │
│  • LFS build environment configured     │
│  • Build scripts and tools              │
│  • Desktop and Start Menu shortcuts     │
│                                         │
│  ☑ Launch LFS Builder now               │
│                                         │
│                          [Finish]       │
└─────────────────────────────────────────┘
```

**Final actions**:
- Success message with summary
- Optional immediate launch
- Exits installer gracefully

## Core Components

### `InstallationManager.cs`
**Purpose**: Orchestrates the entire installation process

**Key methods**:
```csharp
public async Task<bool> InstallAsync()
public async Task<bool> CheckPrerequisitesAsync()
public async Task<bool> EnableWSL2Async()
public async Task<bool> InstallLinuxDistributionAsync()
public async Task<bool> ConfigureLFSEnvironmentAsync()
public async Task<bool> CreateShortcutsAsync()
```

**Events**:
```csharp
event EventHandler<ProgressEventArgs> ProgressChanged;  // Updates progress bar
event EventHandler<string> StatusChanged;               // Updates status label
event EventHandler<string> LogMessage;                  // Adds log entry
```

### `InstallationConfig.cs`
**Purpose**: Configuration model with user preferences

```csharp
public class InstallationConfig
{
    public string InstallationPath { get; set; }
    public string LinuxDistribution { get; set; }
    public string LFSVersion { get; set; }
    public bool CreateDesktopShortcut { get; set; }
    public bool CreateStartMenuShortcut { get; set; }
    public bool LaunchAfterInstall { get; set; }
    public int BuildCores { get; set; }
    public bool EnableAutoUpdates { get; set; }
}
```

## Installation Steps (Technical)

### 1. Enable WSL2 Features
```powershell
# Enable Virtual Machine Platform
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

# Enable WSL
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart

# Set WSL2 as default
wsl --set-default-version 2
```

### 2. Install Linux Distribution
```powershell
# Install Ubuntu (or selected distro)
wsl --install -d Ubuntu

# Verify installation
wsl --list --verbose
```

### 3. Configure LFS Environment
```bash
# Create LFS directory structure
export LFS=/mnt/lfs
sudo mkdir -pv $LFS
sudo chown -v $USER $LFS

# Set environment variables
export LFS_TGT=x86_64-lfs-linux-gnu
export PATH=/tools/bin:/usr/bin:/bin
export MAKEFLAGS="-j$(nproc)"
```

### 4. Copy Build Scripts
```
Copy from installer package to WSL:
  C:\LFSBuilder\scripts\*.sh → /mnt/c/LFSBuilder/scripts/
  
Create symlinks in WSL home:
  ~/lfs-automated → /mnt/c/LFSBuilder/scripts/
```

### 5. Create Shortcuts
```powershell
# Desktop shortcut
Target: wsl.exe
Arguments: bash -c 'cd ~/lfs-automated && bash lfs-build.sh'
Icon: LFS Builder logo

# Start Menu shortcut
Location: %APPDATA%\Microsoft\Windows\Start Menu\Programs\LFS Builder\
Same target and arguments
```

## Build Process

### C# WinForms Installer
```powershell
cd installer/LFSInstaller
dotnet publish --configuration Release --self-contained true --runtime win-x64
# Output: LFSBuilderSetup.exe (self-contained, no .NET required)
```

### MSI Package with WiX
```powershell
cd installer/WiX
candle Product.wxs -ext WixUIExtension
light Product.wixobj -ext WixUIExtension -out LFSBuilderSetup.msi
# Output: LFSBuilderSetup.msi (Windows Installer package)
```

## Distribution

### Recommended: Self-Contained EXE
**Pros**:
- Single file distribution
- No .NET runtime required
- Instant execution
- Easier for users

**Cons**:
- Larger file size (~50-80 MB)

### Alternative: MSI Package
**Pros**:
- Professional Windows Installer format
- Add/Remove Programs integration
- Clean uninstallation
- Group Policy deployment

**Cons**:
- Requires WiX build tools
- More complex build process

## Error Handling

### Common Issues
1. **Insufficient Permissions**: Check admin rights on startup
2. **WSL2 Already Installed**: Skip enablement, verify configuration
3. **Network Issues**: Retry Linux distribution download
4. **Disk Space**: Pre-validate before installation
5. **Virtualization Disabled**: Warn user, provide BIOS instructions

### Logging
- All operations logged to `C:\LFSBuilder\logs\install.log`
- Real-time display in progress form
- Error dialogs with actionable messages

## Uninstallation

### Via Control Panel
```
Settings > Apps > LFS Builder > Uninstall
```

**Cleanup performed**:
- Remove installation directory
- Delete shortcuts (Desktop, Start Menu)
- Remove registry entries
- **Preserve** WSL2 installation (user may want it)
- **Preserve** user data in LFS directories

## Future Enhancements

- [ ] Silent installation mode (`/S` flag)
- [ ] Custom branding/themes
- [ ] Multiple language support
- [ ] Rollback support for failed installations
- [ ] Digital signature for installer
- [ ] Automatic update check and download
- [ ] Telemetry and usage analytics (opt-in)

---

**See also**:
- `BUILD-GUIDE.md` - Building the installer
- `LFSInstaller/` - C# source code
- `WiX/Product.wxs` - MSI configuration
