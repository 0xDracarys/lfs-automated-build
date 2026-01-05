# 5.3.1. Native Windows Installer - System Overview

## Purpose and Scope

The Native Windows Installer is a critical component of the LFS Automated Build System, providing a professional installation experience for Windows users. This component addresses functional requirements **FR-11** through **FR-15**, enabling one-click installation of the entire LFS build environment.

## Objectives

The installer wizard achieves the following objectives:

1. **Automated WSL2 Setup** (FR-12) - Installs and configures Windows Subsystem for Linux 2 without manual intervention
2. **Professional User Experience** (FR-11) - Native Windows Forms UI matching commercial software standards
3. **System Validation** (NFR-01) - Pre-installation checks for hardware and software prerequisites
4. **Environment Configuration** (FR-13) - Automated setup of LFS-specific environment variables and paths
5. **Desktop Integration** (FR-14) - Creates shortcuts and integrates with Windows Start Menu
6. **Clean Uninstallation** (FR-15) - Professional uninstaller accessible via Windows Settings

## Installation Workflow

The installer implements a 5-step wizard pattern:

**Table 5.1** - Installer Wizard Stages

| Stage | Form Name | Primary Function | User Actions |
|-------|-----------|------------------|--------------|
| 1 | WelcomeForm | Introduction and admin rights check | Click "Next" to proceed |
| 2 | PrerequisitesForm | System requirements validation | Review checks, install missing components |
| 3 | ConfigurationForm | User preferences and path selection | Choose install path, distro, CPU cores |
| 4 | ProgressForm | Real-time installation execution | Monitor progress, view logs |
| 5 | CompletionForm | Success confirmation and next steps | Launch application or exit |

Source: compiled by author.

## Technical Architecture

The installer follows a three-tier architecture:

1. **Presentation Layer** - Windows Forms UI with native controls (System.Windows.Forms)
2. **Business Logic Layer** - InstallationManager orchestrating installation stages
3. **System Integration Layer** - WMI queries, PowerShell/WSL execution, file system operations

**Figure 5.1** - Installer Component Architecture

```
┌─────────────────────────────────────────────┐
│         Windows Forms UI Layer              │
│  (WelcomeForm, PrerequisitesForm, etc.)    │
└─────────────────┬───────────────────────────┘
                  │ Events / Progress Updates
┌─────────────────▼───────────────────────────┐
│      InstallationManager (Core Logic)       │
│  - Stage orchestration                      │
│  - Event-driven progress reporting          │
│  - Error handling and rollback              │
└─────────────────┬───────────────────────────┘
                  │ System Calls
┌─────────────────▼───────────────────────────┐
│     System Integration Layer                │
│  - System.Management (WMI)                  │
│  - System.Diagnostics (Process execution)   │
│  - PowerShell/WSL automation                │
│  - File system operations                   │
└─────────────────────────────────────────────┘
```

Source: compiled by author.

## Key Design Decisions

### 1. Native vs. Scripted Installer

**Decision**: Use C# Windows Forms instead of PowerShell GUI  
**Rationale**: 
- Native controls provide consistent Windows 11 appearance
- Better error handling and debugging capabilities
- Professional progress indicators and async operations
- Matches user expectations from commercial software (Visual Studio, Chrome installers)

### 2. WiX MSI Packaging

**Decision**: Offer both standalone EXE and MSI installer  
**Rationale**:
- MSI enables enterprise deployment via Group Policy
- Integrates with Windows Installer service for proper uninstallation
- Supports upgrade scenarios and per-user/per-machine installations

### 3. Async Installation Process

**Decision**: Use async/await for all long-running operations  
**Rationale**:
- Prevents UI freezing during WSL installation (5-10 minutes)
- Enables real-time log streaming to progress window
- Allows cancellation support (future enhancement)

## Prerequisites Validation

The installer validates the following system requirements before proceeding:

**Table 5.2** - System Prerequisites Validation

| Requirement | Detection Method | Minimum Requirement | Rationale |
|-------------|------------------|---------------------|-----------|
| Windows Version | `Environment.OSVersion` | Windows 10 Build 19041+ | WSL2 requires this minimum build |
| RAM | WMI query `Win32_ComputerSystem` | 8 GB | LFS compilation requires 4GB+, system needs buffer |
| Disk Space | `DriveInfo.AvailableFreeSpace` | 30 GB | LFS toolchain + sources ≈ 10GB, buffer for temp files |
| CPU Cores | `Environment.ProcessorCount` | 2 cores | Minimum for parallel builds |
| Virtualization | WMI query `Win32_Processor` | Enabled | WSL2 requires hardware virtualization (VT-x/AMD-V) |
| Administrator | `WindowsPrincipal.IsInRole()` | Required | WSL2 installation needs elevated privileges |

Source: compiled by author.

## Installation Stages

### Stage 1: WSL2 Feature Enablement

```powershell
# Executed via System.Diagnostics.Process
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
```

### Stage 2: WSL2 Kernel Update

Downloads and installs `wsl_update_x64.msi` from Microsoft servers if not already present.

### Stage 3: Linux Distribution Installation

```powershell
wsl --install -d Ubuntu  # User-selected distro
wsl --set-default-version 2
```

### Stage 4: LFS Environment Configuration

Creates PowerShell profile with:
```powershell
$env:LFS = "/mnt/lfs"
$env:LFS_TGT = "x86_64-lfs-linux-gnu"
$env:MAKEFLAGS = "-j$cores"
```

### Stage 5: Shortcuts Creation

- Desktop shortcut: `%USERPROFILE%\Desktop\LFS Builder.lnk`
- Start Menu: `%APPDATA%\Microsoft\Windows\Start Menu\Programs\LFS Builder\`

## Error Handling Strategy

The installer implements a comprehensive error handling system:

1. **Pre-flight Validation**: Checks fail early before making system changes
2. **Graceful Degradation**: Non-critical failures allow continuation with warnings
3. **Rollback Mechanism**: Failed installations clean up partial changes
4. **Detailed Logging**: All operations logged to `%TEMP%\LFSInstaller.log`
5. **User-Friendly Messages**: Technical errors translated to actionable messages

## Testing Approach

Testing follows three levels:

1. **Unit Tests** - Individual form and manager class methods
2. **Integration Tests** - Full wizard flow on clean Windows VM
3. **User Acceptance Testing** - Real users on various Windows configurations

Test results documented in [05-testing-validation.md](05-testing-validation.md).

## Implementation Statistics

**Table 5.3** - Installer Implementation Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| Total Lines of Code | ~2,500 | C# source excluding comments |
| Number of Forms | 5 | WelcomeForm through CompletionForm |
| Core Classes | 2 | InstallationManager, InstallationConfig |
| Supported Distros | 4 | Ubuntu, Debian, Kali, openSUSE |
| Average Install Time | 8-12 minutes | Depends on internet speed (WSL download) |
| Uninstall Time | < 1 minute | Removes shortcuts, config, optional WSL |

Source: compiled by author based on development metrics.

## Compliance with Functional Requirements

This implementation directly satisfies:

- ✅ **FR-11**: Native GUI wizard with professional appearance
- ✅ **FR-12**: Fully automated WSL2 installation
- ✅ **FR-13**: LFS environment variables configured
- ✅ **FR-14**: Desktop and Start Menu shortcuts created
- ✅ **FR-15**: MSI uninstaller via Windows Settings

See [../../FUNCTIONAL-REQUIREMENTS.md](../../FUNCTIONAL-REQUIREMENTS.md) for complete requirements list.

## Next Steps

The following sections provide detailed implementation documentation:

- [5.3.2. Wizard Implementation Details](02-wizard-implementation.md)
- [5.3.3. Technical Specifications](03-technical-specifications.md)
- [5.3.4. WSL2 Integration](04-wsl-integration.md)
- [5.3.5. Testing and Validation](05-testing-validation.md)
