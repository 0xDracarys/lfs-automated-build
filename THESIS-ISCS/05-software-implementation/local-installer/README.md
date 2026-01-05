# Local Windows Installer - Implementation Documentation

## Overview

This section documents the **Native Windows Installer** for the LFS Automated Build System, developed as part of the Software Implementation phase according to ISCS methodological requirements.

## Structure

This folder contains ISCS-compliant documentation for the local installer component:

### 📁 Documentation Files

1. **01-installer-overview.md** - System overview and objectives (FR-11, FR-12)
2. **02-wizard-implementation.md** - 5-step wizard detailed implementation
3. **03-technical-specifications.md** - Class architecture, algorithms, data structures
4. **04-wsl-integration.md** - WSL2 automation and configuration
5. **05-testing-validation.md** - Test results and validation procedures
6. **06-user-guide.md** - End-user installation instructions
7. **07-programmer-guide.md** - Developer documentation for maintenance

### 📁 Supporting Materials

- **screenshots/** - UI screenshots for thesis figures
- **examples/** - Installation logs, configuration examples, test outputs
- **diagrams/** - UML diagrams (class, sequence, activity, component)

## Related Functional Requirements

This implementation addresses the following requirements from [FUNCTIONAL-REQUIREMENTS.md](../../FUNCTIONAL-REQUIREMENTS.md):

- **FR-11**: Native Windows installer with GUI wizard
- **FR-12**: WSL2 automated installation and configuration
- **FR-13**: LFS environment variable setup
- **FR-14**: Desktop and Start Menu shortcuts creation
- **FR-15**: Professional uninstaller via Add/Remove Programs

## Technology Stack

- **Framework**: .NET 8.0 with Windows Desktop support
- **UI**: Native Windows Forms (C#)
- **Installer Packaging**: WiX Toolset 3.11+
- **System Integration**: System.Management (WMI), System.Diagnostics
- **Threading Model**: Async/await for non-blocking UI

## Key Components

### C# Application (`installer/LFSInstaller/`)
```
LFSInstaller/
├── Program.cs                    # Application entry point
├── Forms/
│   ├── WelcomeForm.cs           # Step 1: Welcome screen
│   ├── PrerequisitesForm.cs     # Step 2: System checks
│   ├── ConfigurationForm.cs     # Step 3: User configuration
│   ├── ProgressForm.cs          # Step 4: Installation progress
│   └── CompletionForm.cs        # Step 5: Success/failure
├── Core/
│   ├── InstallationManager.cs   # Orchestrates installation
│   └── InstallationConfig.cs    # Configuration model
└── LFSInstaller.csproj          # Project file
```

### MSI Installer (`installer/WiX/`)
```
WiX/
├── Product.wxs                   # MSI configuration
└── LFSBuilderSetup.msi          # Output installer package
```

## Building the Installer

See [../../installer/BUILD-GUIDE.md](../../installer/BUILD-GUIDE.md) for complete build instructions.

Quick build:
```powershell
# C# Self-Contained EXE
cd installer/LFSInstaller
dotnet publish --configuration Release --self-contained true --runtime win-x64

# MSI Package
cd installer/WiX
candle Product.wxs -ext WixUIExtension
light Product.wixobj -ext WixUIExtension -out LFSBuilderSetup.msi
```

## ISCS Compliance

This documentation follows Vilnius University ISCS methodological requirements:
- **Section references**: Part of "05-software-implementation" (2.3.6)
- **Content structure**: Technical specifications, algorithms, test results
- **Figure/table format**: Numbered with Lithuanian captions
- **Code examples**: Annexe format with explanatory comments

## Navigation

- ⬆️ [Back to Software Implementation](../)
- 📚 [THESIS-ISCS Index](../../INDEX.md)
- 🎯 [Functional Requirements](../../FUNCTIONAL-REQUIREMENTS.md)
