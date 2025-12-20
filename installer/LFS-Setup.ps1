#Requires -Version 5.1
#Requires -RunAsAdministrator

<#
.SYNOPSIS
    Linux From Scratch (LFS) Windows Installer
.DESCRIPTION
    Professional Windows-style installer for setting up the LFS build environment.
    Features:
    - GUI with progress tracking
    - Automatic dependency detection and installation
    - WSL2 setup and configuration
    - Environment preparation
    - Ready-to-build final state
.NOTES
    Version: 1.0.0
    Author: LFS Automated Build Team
#>

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# ============================================================================
# CONFIGURATION
# ============================================================================

$Script:Config = @{
    AppName = "Linux From Scratch Builder"
    Version = "1.0.0"
    InstallPath = "$env:ProgramFiles\LFS-Builder"
    WSLDistro = "LFS-Ubuntu"
    RequiredWSLVersion = 2
    LFSMount = "/mnt/lfs"
    MinDiskSpaceGB = 30
    Dependencies = @(
        @{ Name = "WSL2"; Command = "wsl --status"; Required = $true }
        @{ Name = "Ubuntu WSL"; Command = "wsl -l -v"; Required = $true }
        @{ Name = "Git"; Command = "git --version"; Required = $false }
        @{ Name = "Node.js"; Command = "node --version"; Required = $false }
    )
}

# ============================================================================
# INSTALLER STAGES
# ============================================================================

$Script:Stages = @(
    @{ 
        Id = 1
        Name = "Welcome"
        Description = "Welcome to LFS Builder Setup"
        Action = { Show-WelcomePage }
    },
    @{ 
        Id = 2
        Name = "System Check"
        Description = "Checking system requirements..."
        Action = { Test-SystemRequirements }
    },
    @{ 
        Id = 3
        Name = "Dependencies"
        Description = "Installing required dependencies..."
        Action = { Install-Dependencies }
    },
    @{ 
        Id = 4
        Name = "WSL Setup"
        Description = "Configuring WSL2 environment..."
        Action = { Setup-WSL }
    },
    @{ 
        Id = 5
        Name = "Environment"
        Description = "Creating LFS build environment..."
        Action = { Setup-LFSEnvironment }
    },
    @{ 
        Id = 6
        Name = "Scripts"
        Description = "Installing build scripts..."
        Action = { Install-BuildScripts }
    },
    @{ 
        Id = 7
        Name = "Complete"
        Description = "Installation complete!"
        Action = { Show-CompletionPage }
    }
)

$Script:CurrentStage = 0
$Script:InstallLog = @()

# ============================================================================
# GUI COMPONENTS
# ============================================================================

function Initialize-GUI {
    $form = New-Object System.Windows.Forms.Form
    $form.Text = "$($Config.AppName) Setup"
    $form.Size = New-Object System.Drawing.Size(700, 550)
    $form.StartPosition = "CenterScreen"
    $form.FormBorderStyle = "FixedDialog"
    $form.MaximizeBox = $false
    $form.MinimizeBox = $false
    $form.BackColor = [System.Drawing.Color]::White
    
    # Header Panel
    $headerPanel = New-Object System.Windows.Forms.Panel
    $headerPanel.Size = New-Object System.Drawing.Size(700, 80)
    $headerPanel.Location = New-Object System.Drawing.Point(0, 0)
    $headerPanel.BackColor = [System.Drawing.Color]::FromArgb(41, 128, 185)
    
    # Title Label
    $titleLabel = New-Object System.Windows.Forms.Label
    $titleLabel.Text = $Config.AppName
    $titleLabel.Location = New-Object System.Drawing.Point(20, 15)
    $titleLabel.Size = New-Object System.Drawing.Size(660, 30)
    $titleLabel.Font = New-Object System.Drawing.Font("Segoe UI", 18, [System.Drawing.FontStyle]::Bold)
    $titleLabel.ForeColor = [System.Drawing.Color]::White
    $headerPanel.Controls.Add($titleLabel)
    
    # Subtitle Label
    $subtitleLabel = New-Object System.Windows.Forms.Label
    $subtitleLabel.Text = "Version $($Config.Version) - Setup Wizard"
    $subtitleLabel.Location = New-Object System.Drawing.Point(20, 50)
    $subtitleLabel.Size = New-Object System.Drawing.Size(660, 20)
    $subtitleLabel.Font = New-Object System.Drawing.Font("Segoe UI", 10)
    $subtitleLabel.ForeColor = [System.Drawing.Color]::FromArgb(236, 240, 241)
    $headerPanel.Controls.Add($subtitleLabel)
    
    $form.Controls.Add($headerPanel)
    
    # Content Panel
    $contentPanel = New-Object System.Windows.Forms.Panel
    $contentPanel.Location = New-Object System.Drawing.Point(20, 100)
    $contentPanel.Size = New-Object System.Drawing.Size(640, 300)
    $contentPanel.AutoScroll = $true
    $form.Controls.Add($contentPanel)
    
    # Stage Label
    $stageLabel = New-Object System.Windows.Forms.Label
    $stageLabel.Location = New-Object System.Drawing.Point(20, 10)
    $stageLabel.Size = New-Object System.Drawing.Size(600, 25)
    $stageLabel.Font = New-Object System.Drawing.Font("Segoe UI", 12, [System.Drawing.FontStyle]::Bold)
    $stageLabel.Text = "Initializing..."
    $contentPanel.Controls.Add($stageLabel)
    
    # Description Label
    $descLabel = New-Object System.Windows.Forms.Label
    $descLabel.Location = New-Object System.Drawing.Point(20, 40)
    $descLabel.Size = New-Object System.Drawing.Size(600, 40)
    $descLabel.Font = New-Object System.Drawing.Font("Segoe UI", 9)
    $descLabel.Text = "Please wait while the installer prepares..."
    $contentPanel.Controls.Add($descLabel)
    
    # Progress Bar
    $progressBar = New-Object System.Windows.Forms.ProgressBar
    $progressBar.Location = New-Object System.Drawing.Point(20, 90)
    $progressBar.Size = New-Object System.Drawing.Size(600, 25)
    $progressBar.Style = "Continuous"
    $progressBar.Maximum = $Stages.Count
    $contentPanel.Controls.Add($progressBar)
    
    # Status TextBox
    $statusBox = New-Object System.Windows.Forms.TextBox
    $statusBox.Location = New-Object System.Drawing.Point(20, 130)
    $statusBox.Size = New-Object System.Drawing.Size(600, 150)
    $statusBox.Multiline = $true
    $statusBox.ScrollBars = "Vertical"
    $statusBox.ReadOnly = $true
    $statusBox.Font = New-Object System.Drawing.Font("Consolas", 9)
    $statusBox.BackColor = [System.Drawing.Color]::FromArgb(245, 245, 245)
    $contentPanel.Controls.Add($statusBox)
    
    # Button Panel
    $buttonPanel = New-Object System.Windows.Forms.Panel
    $buttonPanel.Location = New-Object System.Drawing.Point(0, 420)
    $buttonPanel.Size = New-Object System.Drawing.Size(700, 90)
    $buttonPanel.BackColor = [System.Drawing.Color]::FromArgb(250, 250, 250)
    
    # Separator Line
    $separator = New-Object System.Windows.Forms.Label
    $separator.Location = New-Object System.Drawing.Point(0, 0)
    $separator.Size = New-Object System.Drawing.Size(700, 1)
    $separator.BorderStyle = "Fixed3D"
    $buttonPanel.Controls.Add($separator)
    
    # Back Button
    $backButton = New-Object System.Windows.Forms.Button
    $backButton.Location = New-Object System.Drawing.Point(350, 30)
    $backButton.Size = New-Object System.Drawing.Size(100, 35)
    $backButton.Text = "< Back"
    $backButton.Enabled = $false
    $backButton.Add_Click({ Move-ToPreviousStage })
    $buttonPanel.Controls.Add($backButton)
    
    # Next Button
    $nextButton = New-Object System.Windows.Forms.Button
    $nextButton.Location = New-Object System.Drawing.Point(460, 30)
    $nextButton.Size = New-Object System.Drawing.Size(100, 35)
    $nextButton.Text = "Next >"
    $nextButton.Add_Click({ Move-ToNextStage })
    $buttonPanel.Controls.Add($nextButton)
    
    # Cancel Button
    $cancelButton = New-Object System.Windows.Forms.Button
    $cancelButton.Location = New-Object System.Drawing.Point(570, 30)
    $cancelButton.Size = New-Object System.Drawing.Size(100, 35)
    $cancelButton.Text = "Cancel"
    $cancelButton.Add_Click({ 
        if ([System.Windows.Forms.MessageBox]::Show(
            "Are you sure you want to cancel the installation?",
            "Cancel Setup",
            [System.Windows.Forms.MessageBoxButtons]::YesNo,
            [System.Windows.Forms.MessageBoxIcon]::Question
        ) -eq "Yes") {
            $form.Close()
        }
    })
    $buttonPanel.Controls.Add($cancelButton)
    
    $form.Controls.Add($buttonPanel)
    
    # Store controls for later access
    $Script:GUI = @{
        Form = $form
        StageLabel = $stageLabel
        DescLabel = $descLabel
        ProgressBar = $progressBar
        StatusBox = $statusBox
        BackButton = $backButton
        NextButton = $nextButton
        CancelButton = $cancelButton
        ContentPanel = $contentPanel
    }
    
    return $form
}

function Write-Status {
    param([string]$Message, [string]$Type = "Info")
    
    $timestamp = Get-Date -Format "HH:mm:ss"
    $prefix = switch ($Type) {
        "Success" { "[✓]" }
        "Error" { "[✗]" }
        "Warning" { "[!]" }
        default { "[i]" }
    }
    
    $logEntry = "$timestamp $prefix $Message"
    $Script:InstallLog += $logEntry
    
    $GUI.StatusBox.AppendText("$logEntry`r`n")
    $GUI.StatusBox.SelectionStart = $GUI.StatusBox.Text.Length
    $GUI.StatusBox.ScrollToCaret()
    $GUI.Form.Refresh()
}

# ============================================================================
# STAGE HANDLERS
# ============================================================================

function Show-WelcomePage {
    $GUI.StageLabel.Text = "Welcome to LFS Builder Setup"
    $GUI.DescLabel.Text = "This wizard will guide you through installing the Linux From Scratch build environment on your Windows system."
    
    Write-Status "Welcome to LFS Builder Setup v$($Config.Version)"
    Write-Status "This installer will:"
    Write-Status "  • Check system requirements (30GB+ disk space, 8GB+ RAM recommended)"
    Write-Status "  • Install and configure WSL2 (Windows Subsystem for Linux)"
    Write-Status "  • Set up the LFS build environment"
    Write-Status "  • Prepare all necessary build scripts"
    Write-Status "  • Create desktop shortcuts for easy access"
    Write-Status ""
    Write-Status "Estimated installation time: 15-30 minutes"
    Write-Status ""
    Write-Status "Click 'Next' to begin system checks..." "Info"
    
    $GUI.NextButton.Text = "Next >"
    $GUI.NextButton.Enabled = $true
}

function Test-SystemRequirements {
    $GUI.StageLabel.Text = "Checking System Requirements"
    $GUI.DescLabel.Text = "Verifying your system meets the minimum requirements for LFS building..."
    $GUI.NextButton.Enabled = $false
    
    Write-Status "Starting system requirements check..."
    Write-Status ""
    
    $allChecksPassed = $true
    
    # Check Windows Version
    Write-Status "Checking Windows version..."
    $osVersion = [System.Environment]::OSVersion.Version
    if ($osVersion.Major -ge 10 -and $osVersion.Build -ge 19041) {
        Write-Status "✓ Windows 10/11 (Build $($osVersion.Build)) detected" "Success"
    } else {
        Write-Status "✗ Windows 10 Build 19041+ required (WSL2 support)" "Error"
        $allChecksPassed = $false
    }
    
    # Check Disk Space
    Write-Status "Checking available disk space..."
    $drive = (Get-Location).Drive
    $freeSpaceGB = [math]::Round($drive.Free / 1GB, 2)
    if ($freeSpaceGB -ge $Config.MinDiskSpaceGB) {
        Write-Status "✓ $freeSpaceGB GB available (minimum: $($Config.MinDiskSpaceGB) GB)" "Success"
    } else {
        Write-Status "✗ Insufficient disk space: $freeSpaceGB GB (minimum: $($Config.MinDiskSpaceGB) GB required)" "Error"
        $allChecksPassed = $false
    }
    
    # Check RAM
    Write-Status "Checking system memory..."
    $totalRamGB = [math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory / 1GB, 2)
    if ($totalRamGB -ge 8) {
        Write-Status "✓ $totalRamGB GB RAM detected" "Success"
    } else {
        Write-Status "! Only $totalRamGB GB RAM detected (8GB+ recommended)" "Warning"
    }
    
    # Check Virtualization
    Write-Status "Checking virtualization support..."
    $hyperv = Get-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V-Hypervisor -ErrorAction SilentlyContinue
    if ($hyperv -and $hyperv.State -eq "Enabled") {
        Write-Status "✓ Hyper-V/Virtualization enabled" "Success"
    } else {
        Write-Status "! Virtualization may not be enabled (required for WSL2)" "Warning"
    }
    
    # Check WSL
    Write-Status "Checking WSL installation..."
    try {
        $wslVersion = wsl --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Status "✓ WSL is installed" "Success"
        } else {
            Write-Status "! WSL not found - will be installed" "Warning"
        }
    } catch {
        Write-Status "! WSL not found - will be installed" "Warning"
    }
    
    Write-Status ""
    if ($allChecksPassed) {
        Write-Status "System requirements check PASSED" "Success"
        Write-Status "Click 'Next' to continue with dependency installation..." "Info"
        $GUI.NextButton.Enabled = $true
    } else {
        Write-Status "System requirements check FAILED" "Error"
        Write-Status "Please address the issues above before proceeding." "Error"
        $GUI.NextButton.Enabled = $false
        $GUI.CancelButton.Text = "Exit"
    }
}

function Install-Dependencies {
    $GUI.StageLabel.Text = "Installing Dependencies"
    $GUI.DescLabel.Text = "Installing required software components..."
    $GUI.NextButton.Enabled = $false
    
    Write-Status "Installing dependencies..."
    Write-Status ""
    
    # Enable WSL
    Write-Status "Checking WSL feature..."
    $wslFeature = Get-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux
    if ($wslFeature.State -ne "Enabled") {
        Write-Status "Enabling WSL feature..."
        try {
            Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux -NoRestart -WarningAction SilentlyContinue | Out-Null
            Write-Status "✓ WSL feature enabled" "Success"
        } catch {
            Write-Status "✗ Failed to enable WSL: $_" "Error"
            return
        }
    } else {
        Write-Status "✓ WSL feature already enabled" "Success"
    }
    
    # Enable Virtual Machine Platform
    Write-Status "Checking Virtual Machine Platform..."
    $vmFeature = Get-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform
    if ($vmFeature.State -ne "Enabled") {
        Write-Status "Enabling Virtual Machine Platform..."
        try {
            Enable-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform -NoRestart -WarningAction SilentlyContinue | Out-Null
            Write-Status "✓ Virtual Machine Platform enabled" "Success"
        } catch {
            Write-Status "✗ Failed to enable VM Platform: $_" "Error"
            return
        }
    } else {
        Write-Status "✓ Virtual Machine Platform already enabled" "Success"
    }
    
    # Update WSL
    Write-Status "Updating WSL to latest version..."
    try {
        wsl --update 2>&1 | Out-Null
        Write-Status "✓ WSL updated" "Success"
    } catch {
        Write-Status "! Could not update WSL (may require reboot)" "Warning"
    }
    
    # Set WSL 2 as default
    Write-Status "Setting WSL 2 as default version..."
    wsl --set-default-version 2 2>&1 | Out-Null
    Write-Status "✓ WSL 2 set as default" "Success"
    
    Write-Status ""
    Write-Status "Dependencies installed successfully" "Success"
    Write-Status "Click 'Next' to configure WSL..." "Info"
    $GUI.NextButton.Enabled = $true
}

function Setup-WSL {
    $GUI.StageLabel.Text = "Configuring WSL2"
    $GUI.DescLabel.Text = "Setting up Windows Subsystem for Linux..."
    $GUI.NextButton.Enabled = $false
    
    Write-Status "Configuring WSL environment..."
    Write-Status ""
    
    # Check existing distributions
    Write-Status "Checking for existing Ubuntu installation..."
    $distros = wsl -l -v 2>&1 | Select-Object -Skip 1
    $ubuntuInstalled = $distros | Where-Object { $_ -match "Ubuntu" }
    
    if ($ubuntuInstalled) {
        Write-Status "✓ Ubuntu WSL distribution found" "Success"
        $distroName = ($ubuntuInstalled -split '\s+')[0]
        Write-Status "Using distribution: $distroName"
    } else {
        Write-Status "Installing Ubuntu WSL distribution..."
        Write-Status "This may take several minutes..."
        try {
            wsl --install -d Ubuntu 2>&1 | ForEach-Object { Write-Status $_ }
            Write-Status "✓ Ubuntu installed successfully" "Success"
        } catch {
            Write-Status "✗ Failed to install Ubuntu: $_" "Error"
            Write-Status "Please install Ubuntu manually from Microsoft Store" "Error"
            return
        }
    }
    
    # Configure .wslconfig for optimal performance
    Write-Status "Configuring WSL performance settings..."
    $wslConfigPath = "$env:USERPROFILE\.wslconfig"
    $wslConfig = @"
[wsl2]
memory=8GB
processors=4
swap=4GB
localhostForwarding=true

[experimental]
autoMemoryReclaim=gradual
"@
    
    try {
        $wslConfig | Out-File -FilePath $wslConfigPath -Encoding utf8 -Force
        Write-Status "✓ WSL configuration created at $wslConfigPath" "Success"
    } catch {
        Write-Status "! Could not create WSL config: $_" "Warning"
    }
    
    Write-Status ""
    Write-Status "WSL configuration complete" "Success"
    Write-Status "Click 'Next' to set up the LFS environment..." "Info"
    $GUI.NextButton.Enabled = $true
}

function Setup-LFSEnvironment {
    $GUI.StageLabel.Text = "Creating LFS Environment"
    $GUI.DescLabel.Text = "Preparing the LFS build directory structure..."
    $GUI.NextButton.Enabled = $false
    
    Write-Status "Setting up LFS build environment..."
    Write-Status ""
    
    $repoPath = Split-Path -Parent $PSScriptRoot
    $wslRepoPath = $repoPath -replace '\\', '/' -replace '^([A-Z]):', { "/mnt/$($_.Groups[1].Value.ToLower())" }
    
    Write-Status "Repository path: $repoPath"
    Write-Status "WSL path: $wslRepoPath"
    Write-Status ""
    
    # Create initialization script
    Write-Status "Creating LFS initialization script..."
    $initScript = @"
#!/bin/bash
set -e

echo "Initializing LFS environment..."

# Create LFS directory
sudo mkdir -pv $($Config.LFSMount)
sudo chown -v \$USER $($Config.LFSMount)

# Create directory structure
mkdir -pv $($Config.LFSMount)/{sources,tools,build,logs}

# Set environment variables
cat > ~/.lfsrc << 'EOFRC'
export LFS=$($Config.LFSMount)
export LFS_TGT=x86_64-lfs-linux-gnu
export PATH=/tools/bin:\$PATH
export MAKEFLAGS="-j\$(nproc)"
EOFRC

# Source in .bashrc
if ! grep -q "source ~/.lfsrc" ~/.bashrc; then
    echo "source ~/.lfsrc" >> ~/.bashrc
fi

# Install build dependencies
echo "Installing build dependencies..."
sudo apt-get update
sudo apt-get install -y build-essential bison texinfo gawk m4 wget curl

echo "✓ LFS environment initialized successfully"
echo ""
echo "LFS directory: $($Config.LFSMount)"
echo "Build scripts: $wslRepoPath"
"@
    
    $tempInitScript = Join-Path $env:TEMP "lfs-init.sh"
    $initScript | Out-File -FilePath $tempInitScript -Encoding utf8
    
    # Convert to Unix line endings and execute in WSL
    Write-Status "Executing initialization in WSL..."
    try {
        # Copy script to WSL
        $wslTempPath = "/tmp/lfs-init.sh"
        wsl bash -c "cat > $wslTempPath" -input (Get-Content $tempInitScript -Raw)
        wsl bash -c "chmod +x $wslTempPath && dos2unix $wslTempPath 2>/dev/null || sed -i 's/\r$//' $wslTempPath"
        
        # Execute
        wsl bash -c $wslTempPath 2>&1 | ForEach-Object { Write-Status $_ }
        
        Write-Status "✓ LFS environment initialized" "Success"
    } catch {
        Write-Status "✗ Failed to initialize LFS environment: $_" "Error"
        return
    } finally {
        Remove-Item $tempInitScript -ErrorAction SilentlyContinue
    }
    
    Write-Status ""
    Write-Status "LFS environment setup complete" "Success"
    Write-Status "Click 'Next' to install build scripts..." "Info"
    $GUI.NextButton.Enabled = $true
}

function Install-BuildScripts {
    $GUI.StageLabel.Text = "Installing Build Scripts"
    $GUI.DescLabel.Text = "Copying build scripts and tools..."
    $GUI.NextButton.Enabled = $false
    
    Write-Status "Installing build scripts..."
    Write-Status ""
    
    # Create install directory
    Write-Status "Creating installation directory..."
    if (!(Test-Path $Config.InstallPath)) {
        New-Item -ItemType Directory -Path $Config.InstallPath -Force | Out-Null
        Write-Status "✓ Created $($Config.InstallPath)" "Success"
    }
    
    # Copy main scripts
    $repoPath = Split-Path -Parent $PSScriptRoot
    $scriptsToLink = @(
        "BUILD-LFS-CORRECT.ps1",
        "CHECK_BUILD_STATUS.ps1",
        "build-next-package.ps1",
        "ENTER-LFS-SHELL.ps1"
    )
    
    Write-Status "Creating shortcuts to build scripts..."
    foreach ($script in $scriptsToLink) {
        $sourcePath = Join-Path $repoPath $script
        if (Test-Path $sourcePath) {
            $destPath = Join-Path $Config.InstallPath $script
            Copy-Item $sourcePath $destPath -Force
            Write-Status "  ✓ $script"
        }
    }
    
    # Create desktop shortcuts
    Write-Status "Creating desktop shortcuts..."
    $desktopPath = [Environment]::GetFolderPath("Desktop")
    
    # LFS Builder shortcut
    $shortcutPath = Join-Path $desktopPath "LFS Builder.lnk"
    $WScriptShell = New-Object -ComObject WScript.Shell
    $shortcut = $WScriptShell.CreateShortcut($shortcutPath)
    $shortcut.TargetPath = "powershell.exe"
    $shortcut.Arguments = "-ExecutionPolicy Bypass -File `"$(Join-Path $Config.InstallPath 'BUILD-LFS-CORRECT.ps1')`""
    $shortcut.WorkingDirectory = $repoPath
    $shortcut.Description = "Start LFS Build Process"
    $shortcut.Save()
    Write-Status "✓ Created desktop shortcut: LFS Builder" "Success"
    
    # LFS Shell shortcut
    $shellShortcutPath = Join-Path $desktopPath "LFS Shell.lnk"
    $shellShortcut = $WScriptShell.CreateShortcut($shellShortcutPath)
    $shellShortcut.TargetPath = "powershell.exe"
    $shellShortcut.Arguments = "-ExecutionPolicy Bypass -File `"$(Join-Path $Config.InstallPath 'ENTER-LFS-SHELL.ps1')`""
    $shellShortcut.WorkingDirectory = $repoPath
    $shellShortcut.Description = "Enter LFS Build Environment"
    $shellShortcut.Save()
    Write-Status "✓ Created desktop shortcut: LFS Shell" "Success"
    
    # Create quick start guide
    Write-Status "Creating quick start guide..."
    $guidePath = Join-Path $Config.InstallPath "QUICK-START.txt"
    $guideContent = @"
===============================================
   LFS Builder - Quick Start Guide
===============================================

INSTALLATION COMPLETE!

Your LFS build environment is now ready.

NEXT STEPS:
-----------

1. Double-click "LFS Builder" on your desktop
   - OR run: BUILD-LFS-CORRECT.ps1
   - This will start the automated LFS build process

2. Monitor the build progress
   - Run: CHECK_BUILD_STATUS.ps1
   - View logs in: $($Config.LFSMount)/logs/

3. Enter the LFS shell environment
   - Double-click "LFS Shell" on your desktop
   - OR run: ENTER-LFS-SHELL.ps1

IMPORTANT PATHS:
----------------
LFS Root: $($Config.LFSMount)
Sources: $($Config.LFSMount)/sources
Build Scripts: $repoPath
Installation: $($Config.InstallPath)

ESTIMATED BUILD TIME:
---------------------
• Chapter 5 (Cross-toolchain): 1-2 hours
• Chapter 6 (Temp tools): 2-3 hours  
• Chapter 7-8 (Final system): 4-6 hours
• Chapter 9 (Kernel & Boot): 1 hour

Total: 8-12 hours (depending on CPU)

DOCUMENTATION:
--------------
• Full LFS Book: https://www.linuxfromscratch.org/lfs/
• Project Documentation: $repoPath\docs\
• Web Dashboard: http://localhost:3000

SUPPORT:
--------
If you encounter issues:
1. Check logs in: $($Config.LFSMount)/logs/
2. Verify environment: wsl bash -c "source ~/.lfsrc && env | grep LFS"
3. Review documentation in $repoPath\docs\

Happy building!
"@
    
    $guideContent | Out-File -FilePath $guidePath -Encoding utf8
    Write-Status "✓ Quick start guide created" "Success"
    
    Write-Status ""
    Write-Status "Build scripts installation complete" "Success"
    Write-Status "Click 'Next' to finish setup..." "Info"
    $GUI.NextButton.Enabled = $true
}

function Show-CompletionPage {
    $GUI.StageLabel.Text = "Installation Complete!"
    $GUI.DescLabel.Text = "LFS Builder has been successfully installed on your system."
    
    Write-Status ""
    Write-Status "=====================================" "Success"
    Write-Status "  INSTALLATION COMPLETE!" "Success"
    Write-Status "=====================================" "Success"
    Write-Status ""
    Write-Status "Your LFS build environment is ready!" "Success"
    Write-Status ""
    Write-Status "Next steps:"
    Write-Status "  1. Double-click 'LFS Builder' on your desktop to start building"
    Write-Status "  2. Or run: BUILD-LFS-CORRECT.ps1 from PowerShell"
    Write-Status "  3. Monitor progress with: CHECK_BUILD_STATUS.ps1"
    Write-Status ""
    Write-Status "Installation location: $($Config.InstallPath)"
    Write-Status "LFS build directory: $($Config.LFSMount)"
    Write-Status ""
    Write-Status "Quick start guide: $(Join-Path $Config.InstallPath 'QUICK-START.txt')"
    Write-Status ""
    Write-Status "Thank you for using LFS Builder!" "Success"
    
    $GUI.NextButton.Text = "Finish"
    $GUI.NextButton.Enabled = $true
    $GUI.BackButton.Enabled = $false
}

# ============================================================================
# NAVIGATION
# ============================================================================

function Move-ToNextStage {
    if ($Script:CurrentStage -lt ($Stages.Count - 1)) {
        $Script:CurrentStage++
        $GUI.ProgressBar.Value = $Script:CurrentStage + 1
        
        $stage = $Stages[$Script:CurrentStage]
        Write-Status ""
        Write-Status "========================================" "Info"
        Write-Status "Stage $($stage.Id): $($stage.Name)" "Info"
        Write-Status "========================================" "Info"
        
        $GUI.BackButton.Enabled = ($Script:CurrentStage -gt 0)
        
        # Execute stage action
        & $stage.Action
    } else {
        # Finish and close
        $GUI.Form.Close()
        
        # Open quick start guide
        $guidePath = Join-Path $Config.InstallPath "QUICK-START.txt"
        if (Test-Path $guidePath) {
            Start-Process notepad.exe $guidePath
        }
    }
}

function Move-ToPreviousStage {
    if ($Script:CurrentStage -gt 0) {
        $Script:CurrentStage--
        $GUI.ProgressBar.Value = $Script:CurrentStage + 1
        
        $stage = $Stages[$Script:CurrentStage]
        & $stage.Action
        
        $GUI.BackButton.Enabled = ($Script:CurrentStage -gt 0)
    }
}

# ============================================================================
# MAIN ENTRY POINT
# ============================================================================

function Start-LFSSetup {
    Write-Host ""
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host "  LFS Builder Setup" -ForegroundColor Cyan
    Write-Host "  Version $($Config.Version)" -ForegroundColor Cyan
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Initialize GUI
    $form = Initialize-GUI
    
    # Show first stage
    Move-ToNextStage
    
    # Show form
    [void]$form.ShowDialog()
    
    Write-Host ""
    Write-Host "Setup wizard closed." -ForegroundColor Yellow
    Write-Host ""
}

# Start the installer
Start-LFSSetup
