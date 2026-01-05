# Pre-Build Asset Validation Script
# Ensures all required assets exist before compilation

param(
    [string]$ProjectDir = $PSScriptRoot
)

$ErrorActionPreference = "Stop"
$ValidationResults = @{
    Passed = @()
    Failed = @()
}

Write-Host "`n=== Pre-Build Asset Validation ===" -ForegroundColor Cyan

# 1. Verify Icon File
$iconPath = Join-Path $ProjectDir "animal_linux_penguin_2598.ico"
if (Test-Path $iconPath) {
    $iconSize = (Get-Item $iconPath).Length
    Write-Host "[PASS] Icon file found: $iconPath ($iconSize bytes)" -ForegroundColor Green
    $ValidationResults.Passed += "Icon file exists"
} else {
    Write-Host "[FAIL] Icon file NOT found: $iconPath" -ForegroundColor Red
    $ValidationResults.Failed += "Icon file missing"
}

# 2. Verify Core Directory Structure
$requiredDirs = @("Core", "Forms")
foreach ($dir in $requiredDirs) {
    $dirPath = Join-Path $ProjectDir $dir
    if (Test-Path $dirPath) {
        Write-Host "[PASS] Directory exists: $dir" -ForegroundColor Green
        $ValidationResults.Passed += "Directory: $dir"
    } else {
        Write-Host "[FAIL] Directory missing: $dir" -ForegroundColor Red
        $ValidationResults.Failed += "Directory missing: $dir"
    }
}

# 3. Verify Critical Source Files
$requiredFiles = @(
    "Program.cs",
    "Core\InstallationManager.cs",
    "Core\InstallationConfig.cs",
    "Forms\WelcomeForm.cs",
    "Forms\ProgressForm.cs"
)

foreach ($file in $requiredFiles) {
    $filePath = Join-Path $ProjectDir $file
    if (Test-Path $filePath) {
        Write-Host "[PASS] Source file found: $file" -ForegroundColor Green
        $ValidationResults.Passed += "Source: $file"
    } else {
        Write-Host "[FAIL] Source file missing: $file" -ForegroundColor Red
        $ValidationResults.Failed += "Source missing: $file"
    }
}

# 4. Verify .NET SDK
try {
    $dotnetVersion = dotnet --version
    Write-Host "[PASS] .NET SDK detected: $dotnetVersion" -ForegroundColor Green
    $ValidationResults.Passed += ".NET SDK available"
} catch {
    Write-Host "[FAIL] .NET SDK not found" -ForegroundColor Red
    $ValidationResults.Failed += ".NET SDK missing"
}

# Summary
Write-Host "`n=== Validation Summary ===" -ForegroundColor Cyan
Write-Host "Passed: $($ValidationResults.Passed.Count)" -ForegroundColor Green
Write-Host "Failed: $($ValidationResults.Failed.Count)" -ForegroundColor Red

if ($ValidationResults.Failed.Count -gt 0) {
    Write-Host "`nFailed Checks:" -ForegroundColor Red
    $ValidationResults.Failed | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    Write-Host "`nBuild CANNOT proceed. Fix the issues above.`n" -ForegroundColor Red
    exit 1
}

Write-Host "`nAll validations PASSED. Build can proceed.`n" -ForegroundColor Green
exit 0
