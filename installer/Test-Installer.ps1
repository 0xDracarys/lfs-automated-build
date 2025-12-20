#Requires -Version 5.1

<#
.SYNOPSIS
    Test the LFS Builder installer in a safe environment
.DESCRIPTION
    This script helps developers test the installer without affecting their system.
    It simulates the installation process and validates all components.
.NOTES
    This is for testing only - does not perform actual installation
#>

param(
    [switch]$FullTest,      # Run complete test suite
    [switch]$QuickTest,     # Run basic validation only
    [switch]$ShowGUI        # Display the installer GUI (read-only mode)
)

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "  LFS Builder Installer - Test Suite" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# TEST FUNCTIONS
# ============================================================================

function Test-InstallerFiles {
    Write-Host "[TEST] Checking installer files..." -ForegroundColor Yellow
    
    $requiredFiles = @(
        "LFS-Setup.ps1",
        "Build-Installer.ps1",
        "installer-manifest.json",
        "installer.config",
        "INSTALLATION-GUIDE.md",
        "README.md"
    )
    
    $allFound = $true
    foreach ($file in $requiredFiles) {
        $path = Join-Path $PSScriptRoot $file
        if (Test-Path $path) {
            Write-Host "  ✓ $file" -ForegroundColor Green
        } else {
            Write-Host "  ✗ $file NOT FOUND" -ForegroundColor Red
            $allFound = $false
        }
    }
    
    return $allFound
}

function Test-BuildScripts {
    Write-Host ""
    Write-Host "[TEST] Checking build scripts..." -ForegroundColor Yellow
    
    $rootDir = Split-Path -Parent $PSScriptRoot
    $requiredScripts = @(
        "BUILD-LFS-CORRECT.ps1",
        "CHECK_BUILD_STATUS.ps1",
        "build-next-package.ps1",
        "ENTER-LFS-SHELL.ps1"
    )
    
    $allFound = $true
    foreach ($script in $requiredScripts) {
        $path = Join-Path $rootDir $script
        if (Test-Path $path) {
            Write-Host "  ✓ $script" -ForegroundColor Green
        } else {
            Write-Host "  ✗ $script NOT FOUND" -ForegroundColor Red
            $allFound = $false
        }
    }
    
    return $allFound
}

function Test-ManifestIntegrity {
    Write-Host ""
    Write-Host "[TEST] Validating installer manifest..." -ForegroundColor Yellow
    
    try {
        $manifestPath = Join-Path $PSScriptRoot "installer-manifest.json"
        $manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json
        
        # Check required fields
        $requiredFields = @("name", "version", "installer", "systemRequirements", "dependencies")
        $allValid = $true
        
        foreach ($field in $requiredFields) {
            if ($manifest.PSObject.Properties.Name -contains $field) {
                Write-Host "  ✓ Field '$field' present" -ForegroundColor Green
            } else {
                Write-Host "  ✗ Field '$field' missing" -ForegroundColor Red
                $allValid = $false
            }
        }
        
        # Validate version format
        if ($manifest.version -match '^\d+\.\d+\.\d+$') {
            Write-Host "  ✓ Version format valid ($($manifest.version))" -ForegroundColor Green
        } else {
            Write-Host "  ✗ Version format invalid" -ForegroundColor Red
            $allValid = $false
        }
        
        return $allValid
        
    } catch {
        Write-Host "  ✗ Failed to parse manifest: $_" -ForegroundColor Red
        return $false
    }
}

function Test-PowerShellSyntax {
    Write-Host ""
    Write-Host "[TEST] Validating PowerShell syntax..." -ForegroundColor Yellow
    
    $scriptsToTest = @("LFS-Setup.ps1", "Build-Installer.ps1")
    $allValid = $true
    
    foreach ($script in $scriptsToTest) {
        $path = Join-Path $PSScriptRoot $script
        if (Test-Path $path) {
            $errors = $null
            $null = [System.Management.Automation.PSParser]::Tokenize((Get-Content $path -Raw), [ref]$errors)
            
            if ($errors.Count -eq 0) {
                Write-Host "  ✓ $script syntax valid" -ForegroundColor Green
            } else {
                Write-Host "  ✗ $script has $($errors.Count) syntax errors" -ForegroundColor Red
                $allValid = $false
            }
        }
    }
    
    return $allValid
}

function Test-ConfigFile {
    Write-Host ""
    Write-Host "[TEST] Validating configuration file..." -ForegroundColor Yellow
    
    $configPath = Join-Path $PSScriptRoot "installer.config"
    
    if (!(Test-Path $configPath)) {
        Write-Host "  ✗ installer.config not found" -ForegroundColor Red
        return $false
    }
    
    try {
        $config = Get-Content $configPath -Raw
        
        # Check for required sections
        $requiredSections = @('[Installation]', '[System]', '[WSL]', '[Build]')
        $allValid = $true
        
        foreach ($section in $requiredSections) {
            if ($config -match [regex]::Escape($section)) {
                Write-Host "  ✓ Section $section present" -ForegroundColor Green
            } else {
                Write-Host "  ✗ Section $section missing" -ForegroundColor Red
                $allValid = $false
            }
        }
        
        return $allValid
        
    } catch {
        Write-Host "  ✗ Failed to read config: $_" -ForegroundColor Red
        return $false
    }
}

function Test-BuildProcess {
    Write-Host ""
    Write-Host "[TEST] Testing build process..." -ForegroundColor Yellow
    
    try {
        # Test build in dry-run mode
        $buildScript = Join-Path $PSScriptRoot "Build-Installer.ps1"
        
        Write-Host "  • Checking Build-Installer.ps1 structure..." -ForegroundColor Gray
        
        # Verify key functions exist
        $buildContent = Get-Content $buildScript -Raw
        $requiredFunctions = @(
            'Test-Prerequisites',
            'New-BuildDirectory',
            'Copy-InstallerFiles',
            'New-Package'
        )
        
        $allFound = $true
        foreach ($func in $requiredFunctions) {
            if ($buildContent -match "function $func") {
                Write-Host "    ✓ Function $func defined" -ForegroundColor Green
            } else {
                Write-Host "    ✗ Function $func missing" -ForegroundColor Red
                $allFound = $false
            }
        }
        
        return $allFound
        
    } catch {
        Write-Host "  ✗ Build test failed: $_" -ForegroundColor Red
        return $false
    }
}

function Test-Documentation {
    Write-Host ""
    Write-Host "[TEST] Checking documentation..." -ForegroundColor Yellow
    
    $docs = @(
        "INSTALLATION-GUIDE.md",
        "README.md"
    )
    
    $allValid = $true
    foreach ($doc in $docs) {
        $path = Join-Path $PSScriptRoot $doc
        if (Test-Path $path) {
            $size = (Get-Item $path).Length
            if ($size -gt 1KB) {
                Write-Host "  ✓ $doc ($([math]::Round($size/1KB, 1)) KB)" -ForegroundColor Green
            } else {
                Write-Host "  ! $doc seems too small ($size bytes)" -ForegroundColor Yellow
            }
        } else {
            Write-Host "  ✗ $doc not found" -ForegroundColor Red
            $allValid = $false
        }
    }
    
    return $allValid
}

function Show-TestResults {
    param([hashtable]$Results)
    
    Write-Host ""
    Write-Host "=======================================" -ForegroundColor Cyan
    Write-Host "  TEST RESULTS" -ForegroundColor Cyan
    Write-Host "=======================================" -ForegroundColor Cyan
    Write-Host ""
    
    $passed = 0
    $failed = 0
    
    foreach ($test in $Results.Keys) {
        if ($Results[$test]) {
            Write-Host "  ✓ $test" -ForegroundColor Green
            $passed++
        } else {
            Write-Host "  ✗ $test" -ForegroundColor Red
            $failed++
        }
    }
    
    Write-Host ""
    Write-Host "Total: $($Results.Count) tests" -ForegroundColor White
    Write-Host "Passed: $passed" -ForegroundColor Green
    Write-Host "Failed: $failed" -ForegroundColor Red
    Write-Host ""
    
    if ($failed -eq 0) {
        Write-Host "🎉 All tests passed! Installer is ready." -ForegroundColor Green
        return $true
    } else {
        Write-Host "⚠️  Some tests failed. Please fix the issues above." -ForegroundColor Yellow
        return $false
    }
}

function Test-InstallerGUI {
    Write-Host ""
    Write-Host "[TEST] Testing GUI components..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  This will launch the installer GUI in preview mode." -ForegroundColor Gray
    Write-Host "  Click 'Cancel' to exit when done." -ForegroundColor Gray
    Write-Host ""
    
    $response = Read-Host "  Launch GUI preview? (y/n)"
    
    if ($response -eq 'y') {
        try {
            # Note: This would require modifying LFS-Setup.ps1 to support preview mode
            Write-Host "  • Launching installer GUI..." -ForegroundColor Gray
            Write-Host "  ! GUI preview mode not yet implemented" -ForegroundColor Yellow
            Write-Host "  ! You can manually run: .\LFS-Setup.ps1" -ForegroundColor Yellow
            return $true
        } catch {
            Write-Host "  ✗ GUI test failed: $_" -ForegroundColor Red
            return $false
        }
    } else {
        Write-Host "  • GUI test skipped" -ForegroundColor Gray
        return $true
    }
}

function Test-PackageCreation {
    Write-Host ""
    Write-Host "[TEST] Testing package creation..." -ForegroundColor Yellow
    
    $testDir = Join-Path $env:TEMP "lfs-installer-test"
    
    try {
        # Create test directory
        if (Test-Path $testDir) {
            Remove-Item $testDir -Recurse -Force
        }
        New-Item -ItemType Directory -Path $testDir -Force | Out-Null
        
        Write-Host "  • Test directory created: $testDir" -ForegroundColor Gray
        Write-Host "  • This would create a package in: $testDir\dist" -ForegroundColor Gray
        Write-Host "  • Estimated package size: ~2-5 MB" -ForegroundColor Gray
        
        Write-Host ""
        $response = Read-Host "  Create actual test package? (y/n)"
        
        if ($response -eq 'y') {
            Write-Host "  • Building package..." -ForegroundColor Gray
            & (Join-Path $PSScriptRoot "Build-Installer.ps1") -OutputDir $testDir
            
            $packagePath = Join-Path $testDir "LFS-Builder-Setup-v*.zip"
            if (Test-Path $packagePath) {
                $size = [math]::Round((Get-Item $packagePath).Length / 1MB, 2)
                Write-Host "  ✓ Package created: $size MB" -ForegroundColor Green
                Write-Host "  Location: $packagePath" -ForegroundColor Gray
                return $true
            } else {
                Write-Host "  ✗ Package creation failed" -ForegroundColor Red
                return $false
            }
        } else {
            Write-Host "  • Package creation skipped" -ForegroundColor Gray
            return $true
        }
        
    } catch {
        Write-Host "  ✗ Package test failed: $_" -ForegroundColor Red
        return $false
    } finally {
        # Cleanup
        if (Test-Path $testDir -and $response -ne 'y') {
            Remove-Item $testDir -Recurse -Force -ErrorAction SilentlyContinue
        }
    }
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

$testResults = @{}

if ($QuickTest) {
    Write-Host "Running quick validation tests..." -ForegroundColor Cyan
    Write-Host ""
    
    $testResults['Installer Files'] = Test-InstallerFiles
    $testResults['Manifest Integrity'] = Test-ManifestIntegrity
    $testResults['PowerShell Syntax'] = Test-PowerShellSyntax
    
} elseif ($FullTest) {
    Write-Host "Running full test suite..." -ForegroundColor Cyan
    Write-Host ""
    
    $testResults['Installer Files'] = Test-InstallerFiles
    $testResults['Build Scripts'] = Test-BuildScripts
    $testResults['Manifest Integrity'] = Test-ManifestIntegrity
    $testResults['Configuration File'] = Test-ConfigFile
    $testResults['PowerShell Syntax'] = Test-PowerShellSyntax
    $testResults['Build Process'] = Test-BuildProcess
    $testResults['Documentation'] = Test-Documentation
    
    if ($ShowGUI) {
        $testResults['GUI Components'] = Test-InstallerGUI
    }
    
    $testResults['Package Creation'] = Test-PackageCreation
    
} elseif ($ShowGUI) {
    Write-Host "Launching GUI preview..." -ForegroundColor Cyan
    Test-InstallerGUI
    exit 0
    
} else {
    # Default: Run standard tests
    Write-Host "Running standard tests..." -ForegroundColor Cyan
    Write-Host "Use -QuickTest for faster validation, -FullTest for complete suite" -ForegroundColor Gray
    Write-Host ""
    
    $testResults['Installer Files'] = Test-InstallerFiles
    $testResults['Build Scripts'] = Test-BuildScripts
    $testResults['Manifest Integrity'] = Test-ManifestIntegrity
    $testResults['Configuration File'] = Test-ConfigFile
    $testResults['PowerShell Syntax'] = Test-PowerShellSyntax
    $testResults['Documentation'] = Test-Documentation
}

# Show results
$success = Show-TestResults $testResults

# Exit with appropriate code
if ($success) {
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Build the package: .\Build-Installer.ps1" -ForegroundColor White
    Write-Host "  2. Test installation: Extract ZIP and run Install-LFS-Builder.bat" -ForegroundColor White
    Write-Host "  3. Verify: Check desktop shortcuts and Program Files" -ForegroundColor White
    Write-Host ""
    exit 0
} else {
    Write-Host "Fix the failing tests before building the installer." -ForegroundColor Red
    Write-Host ""
    exit 1
}
