# Self-Healing Installer Build Pipeline
# Implements multi-layered validation and automatic error correction

param(
    [switch]$SkipValidation,
    [switch]$ForceRebuild,
    [string]$OutputDir = ".\publish",
    [string]$StagingDir = ".\staging",
    [int]$MaxRetries = 3
)

$ErrorActionPreference = "Stop"
$BuildLog = @{
    BuildId = (Get-Date -Format "yyyyMMdd_HHmmss")
    StartTime = Get-Date
    Steps = @()
    Warnings = @()
    Errors = @()
    Checksums = @{}
}

function Write-BuildLog {
    param([string]$Level, [string]$Message, [string]$Step = "General")
    
    $logEntry = @{
        Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        Level = $Level
        Step = $Step
        Message = $Message
    }
    
    $BuildLog.Steps += $logEntry
    
    $color = switch ($Level) {
        "INFO" { "Cyan" }
        "SUCCESS" { "Green" }
        "WARNING" { "Yellow" }
        "ERROR" { "Red" }
        "CRITICAL" { "Magenta" }
        default { "White" }
    }
    
    Write-Host "[$Level] $Message" -ForegroundColor $color
    
    if ($Level -eq "WARNING") { $BuildLog.Warnings += $logEntry }
    if ($Level -in @("ERROR", "CRITICAL")) { $BuildLog.Errors += $logEntry }
}

function Test-ExitCode {
    param([int]$ExitCode, [string]$Operation)
    
    if ($ExitCode -ne 0) {
        Write-BuildLog "ERROR" "Operation '$Operation' failed with exit code $ExitCode" "Validation"
        return $false
    }
    Write-BuildLog "SUCCESS" "Operation '$Operation' completed with exit code 0" "Validation"
    return $true
}

function Get-FileChecksum {
    param([string]$FilePath)
    
    if (-not (Test-Path $FilePath)) {
        Write-BuildLog "ERROR" "Cannot compute checksum: File not found - $FilePath" "Checksum"
        return $null
    }
    
    $hash = Get-FileHash -Path $FilePath -Algorithm SHA256
    Write-BuildLog "INFO" "SHA-256: $($hash.Hash)" "Checksum"
    return $hash.Hash
}

function Test-BuildArtifact {
    param([string]$FilePath, [string]$ExpectedName)
    
    Write-BuildLog "INFO" "Validating build artifact: $ExpectedName" "Validation"
    
    if (-not (Test-Path $FilePath)) {
        Write-BuildLog "CRITICAL" "Build artifact NOT found: $FilePath" "Validation"
        return $false
    }
    
    $file = Get-Item $FilePath
    Write-BuildLog "SUCCESS" "Artifact exists: $($file.Name) ($($file.Length) bytes)" "Validation"
    
    # Verify it's a valid PE executable
    if ($file.Extension -eq ".exe") {
        $bytes = [System.IO.File]::ReadAllBytes($FilePath)
        if ($bytes[0] -eq 0x4D -and $bytes[1] -eq 0x5A) { # MZ header
            Write-BuildLog "SUCCESS" "Valid Windows executable (MZ header verified)" "Validation"
            return $true
        } else {
            Write-BuildLog "ERROR" "Invalid executable: Missing MZ header" "Validation"
            return $false
        }
    }
    
    return $true
}

function Invoke-SmokeTest {
    param([string]$ExecutablePath)
    
    Write-BuildLog "INFO" "Running smoke test on installer..." "SmokeTest"
    
    # Test 1: Executable launches without immediate crash
    try {
        $process = Start-Process $ExecutablePath -ArgumentList "--help" -PassThru -WindowStyle Hidden -ErrorAction Stop
        Start-Sleep -Seconds 2
        
        if ($process.HasExited -and $process.ExitCode -ne 0) {
            Write-BuildLog "ERROR" "Installer crashed immediately (Exit code: $($process.ExitCode))" "SmokeTest"
            return $false
        }
        
        # Kill the process if still running
        if (-not $process.HasExited) {
            Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
        }
        
        Write-BuildLog "SUCCESS" "Installer launches without immediate crash" "SmokeTest"
        return $true
    } catch {
        Write-BuildLog "ERROR" "Smoke test failed: $($_.Exception.Message)" "SmokeTest"
        return $false
    }
}

function Repair-CommonIssues {
    param([string]$ErrorType)
    
    Write-BuildLog "INFO" "Attempting automatic repair for: $ErrorType" "SelfHealing"
    
    switch ($ErrorType) {
        "IconMissing" {
            Write-BuildLog "INFO" "Regenerating icon file..." "SelfHealing"
            # Create fallback icon
            $iconPath = "installer\LFSInstaller\animal_linux_penguin_2598.ico"
            if (Test-Path "installer\LFSInstaller\lfs-icon.ico") {
                Copy-Item "installer\LFSInstaller\lfs-icon.ico" $iconPath -Force
                Write-BuildLog "SUCCESS" "Icon repaired" "SelfHealing"
                return $true
            }
        }
        "PublishDirNotClean" {
            Write-BuildLog "INFO" "Cleaning publish directory..." "SelfHealing"
            if (Test-Path $OutputDir) {
                Remove-Item $OutputDir -Recurse -Force
            }
            Write-BuildLog "SUCCESS" "Publish directory cleaned" "SelfHealing"
            return $true
        }
        "ObjCacheCorrupt" {
            Write-BuildLog "INFO" "Cleaning obj and bin directories..." "SelfHealing"
            Get-ChildItem -Path "installer\LFSInstaller" -Include "obj","bin" -Recurse -Directory | Remove-Item -Recurse -Force
            Write-BuildLog "SUCCESS" "Build cache cleaned" "SelfHealing"
            return $true
        }
    }
    
    Write-BuildLog "WARNING" "No automatic repair available for: $ErrorType" "SelfHealing"
    return $false
}

# MAIN BUILD PIPELINE

Write-Host "`n╔══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Self-Healing Installer Build Pipeline v1.0        ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$attempt = 1
$buildSuccess = $false

while ($attempt -le $MaxRetries -and -not $buildSuccess) {
    Write-BuildLog "INFO" "Build attempt $attempt of $MaxRetries" "Pipeline"
    
    try {
        # STEP 1: Pre-Build Validation
        if (-not $SkipValidation) {
            Write-BuildLog "INFO" "Step 1: Pre-build asset validation" "PreBuild"
            $validationResult = & "installer\LFSInstaller\validate-build-assets.ps1"
            
            if (-not (Test-ExitCode $LASTEXITCODE "Asset Validation")) {
                Repair-CommonIssues "IconMissing"
                $attempt++
                continue
            }
        }
        
        # STEP 2: Clean Build Environment
        Write-BuildLog "INFO" "Step 2: Cleaning build environment" "Build"
        if ($ForceRebuild) {
            Repair-CommonIssues "ObjCacheCorrupt"
            Repair-CommonIssues "PublishDirNotClean"
        }
        
        # STEP 3: Restore Dependencies
        Write-BuildLog "INFO" "Step 3: Restoring NuGet packages" "Build"
        Push-Location "installer\LFSInstaller"
        dotnet restore
        
        if (-not (Test-ExitCode $LASTEXITCODE "Restore Dependencies")) {
            Pop-Location
            $attempt++
            continue
        }
        
        # STEP 4: Build
        Write-BuildLog "INFO" "Step 4: Building installer" "Build"
        dotnet build --configuration Release --no-restore
        
        if (-not (Test-ExitCode $LASTEXITCODE "Build")) {
            Pop-Location
            Repair-CommonIssues "ObjCacheCorrupt"
            $attempt++
            continue
        }
        
        # STEP 5: Publish Self-Contained Executable
        Write-BuildLog "INFO" "Step 5: Publishing self-contained executable" "Build"
        dotnet publish --configuration Release --output $OutputDir --self-contained true --runtime win-x64 --no-build
        
        Pop-Location
        
        if (-not (Test-ExitCode $LASTEXITCODE "Publish")) {
            $attempt++
            continue
        }
        
        # STEP 6: Validate Build Artifacts
        Write-BuildLog "INFO" "Step 6: Validating build artifacts" "Validation"
        $exePath = Join-Path "installer\LFSInstaller" "$OutputDir\LFSBuilderSetup.exe"
        
        if (-not (Test-BuildArtifact $exePath "LFSBuilderSetup.exe")) {
            Write-BuildLog "CRITICAL" "Build artifact validation FAILED" "Validation"
            $attempt++
            continue
        }
        
        # STEP 7: Generate Checksum
        Write-BuildLog "INFO" "Step 7: Generating SHA-256 checksum" "Checksum"
        $checksum = Get-FileChecksum $exePath
        
        if ($null -eq $checksum) {
            Write-BuildLog "ERROR" "Checksum generation failed" "Checksum"
            $attempt++
            continue
        }
        
        $BuildLog.Checksums["LFSBuilderSetup.exe"] = $checksum
        
        # STEP 8: Smoke Test
        Write-BuildLog "INFO" "Step 8: Running smoke test" "SmokeTest"
        if (-not (Invoke-SmokeTest $exePath)) {
            Write-BuildLog "ERROR" "Smoke test FAILED" "SmokeTest"
            $attempt++
            continue
        }
        
        # STEP 9: Stage for Production
        Write-BuildLog "INFO" "Step 9: Staging for production" "Staging"
        if (-not (Test-Path $StagingDir)) {
            New-Item -Path $StagingDir -ItemType Directory | Out-Null
        }
        
        $stagingExe = Join-Path $StagingDir "LFSBuilderSetup.exe"
        Copy-Item $exePath $stagingExe -Force
        
        # Create checksum file
        $checksumFile = Join-Path $StagingDir "LFSBuilderSetup.exe.sha256"
        $checksum | Out-File $checksumFile -Encoding ASCII
        
        # Create manifest
        $manifest = @{
            BuildId = $BuildLog.BuildId
            BuildDate = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            Version = "1.0.0"
            File = "LFSBuilderSetup.exe"
            Size = (Get-Item $stagingExe).Length
            SHA256 = $checksum
            Validated = $true
        }
        
        $manifestFile = Join-Path $StagingDir "build-manifest.json"
        $manifest | ConvertTo-Json -Depth 10 | Out-File $manifestFile -Encoding UTF8
        
        Write-BuildLog "SUCCESS" "Build staged successfully" "Staging"
        Write-BuildLog "SUCCESS" "Checksum saved to: $checksumFile" "Staging"
        Write-BuildLog "SUCCESS" "Manifest saved to: $manifestFile" "Staging"
        
        $buildSuccess = $true
        
    } catch {
        Write-BuildLog "ERROR" "Unexpected error: $($_.Exception.Message)" "Pipeline"
        Write-BuildLog "ERROR" "Stack trace: $($_.ScriptStackTrace)" "Pipeline"
        $attempt++
    }
}

# FINAL REPORT
$BuildLog.EndTime = Get-Date
$BuildLog.Duration = ($BuildLog.EndTime - $BuildLog.StartTime).ToString()
$BuildLog.Success = $buildSuccess
$BuildLog.Attempts = $attempt - 1

$logFile = "build-log-$($BuildLog.BuildId).json"
$BuildLog | ConvertTo-Json -Depth 10 | Out-File $logFile -Encoding UTF8

Write-Host "`n╔══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                  BUILD SUMMARY                        ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "Build ID: $($BuildLog.BuildId)" -ForegroundColor White
Write-Host "Duration: $($BuildLog.Duration)" -ForegroundColor White
Write-Host "Attempts: $($BuildLog.Attempts)" -ForegroundColor White
Write-Host "Warnings: $($BuildLog.Warnings.Count)" -ForegroundColor Yellow
Write-Host "Errors: $($BuildLog.Errors.Count)" -ForegroundColor Red

if ($buildSuccess) {
    Write-Host "`n✓ BUILD SUCCESSFUL" -ForegroundColor Green
    Write-Host "Staged Executable: $stagingExe" -ForegroundColor Green
    Write-Host "SHA-256: $checksum" -ForegroundColor Green
    Write-Host "`nReady for deployment verification." -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n✗ BUILD FAILED after $MaxRetries attempts" -ForegroundColor Red
    Write-Host "Check log file: $logFile" -ForegroundColor Red
    exit 1
}
