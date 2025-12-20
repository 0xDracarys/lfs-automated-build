# Building the LFS Builder Installer

## Prerequisites

### For C# WinForms Installer:
- Visual Studio 2022+ or .NET 8.0 SDK
- Windows 10 2004+ or Windows 11

### For MSI Package (WiX):
- WiX Toolset 3.11+ or WiX Toolset 4.0+
- .NET 8.0 SDK

## Build Instructions

### Option 1: Build C# WinForms Installer (Recommended)

```powershell
# Navigate to installer directory
cd installer/LFSInstaller

# Restore NuGet packages
dotnet restore

# Build Release version
dotnet build --configuration Release

# Publish self-contained executable
dotnet publish --configuration Release --output ./publish --self-contained true --runtime win-x64

# Output: ./publish/LFSBuilderSetup.exe
```

### Option 2: Build MSI with WiX Toolset

```powershell
# Navigate to WiX directory
cd installer/WiX

# Build the C# installer first
cd ../LFSInstaller
dotnet publish --configuration Release --output ../WiX/bin

# Return to WiX directory
cd ../WiX

# Compile WiX source
candle Product.wxs -ext WixUIExtension

# Link and create MSI
light Product.wixobj -ext WixUIExtension -out LFSBuilderSetup.msi

# Output: LFSBuilderSetup.msi
```

## Testing the Installer

```powershell
# Run the installer with admin rights
Start-Process -FilePath ".\LFSBuilderSetup.exe" -Verb RunAs

# Or for MSI:
Start-Process -FilePath "msiexec.exe" -ArgumentList "/i LFSBuilderSetup.msi" -Verb RunAs
```

## Distribution

### Create Setup Package
```powershell
# Create distribution folder
mkdir dist

# Copy installer
Copy-Item LFSBuilderSetup.exe dist/
# Or
Copy-Item LFSBuilderSetup.msi dist/

# Create README for users
echo "LFS Builder Setup" > dist/README.txt
echo "Run LFSBuilderSetup.exe as Administrator" >> dist/README.txt

# Compress for distribution
Compress-Archive -Path dist/* -DestinationPath LFSBuilder-v1.0.0-Setup.zip
```

## Signing the Installer (Optional but Recommended)

```powershell
# Sign with code signing certificate
signtool sign /f "certificate.pfx" /p "password" /t http://timestamp.digicert.com LFSBuilderSetup.exe
```

## Installer Features

✅ Native Windows Forms dialogs
✅ Professional progress bars and animations  
✅ System requirements validation  
✅ WSL2 automatic installation  
✅ Linux distribution setup  
✅ LFS environment configuration  
✅ Desktop and Start Menu shortcuts  
✅ Uninstaller support  
✅ Resume interrupted installations  
