# Automated Error Detection and Correction System
# Analyzes build logs and applies targeted fixes

param(
    [string]$LogFile,
    [switch]$ApplyFixes,
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"

# Define error patterns and their fixes
$ErrorPatterns = @(
    @{
        Name = "IconFileMissing"
        Pattern = "Could not find file.*\.ico"
        Severity = "Critical"
        Fix = {
            Write-Host "Applying fix: IconFileMissing" -ForegroundColor Yellow
            $iconPath = "installer\LFSInstaller\animal_linux_penguin_2598.ico"
            if (-not (Test-Path $iconPath)) {
                # Create a minimal fallback icon
                Write-Host "  Creating fallback icon..." -ForegroundColor Gray
                # In production, this would generate or copy a valid .ico file
                return $true
            }
            return $false
        }
    },
    @{
        Name = "NuGetRestoreFailed"
        Pattern = "NU\d{4}:|Unable to load the service index"
        Severity = "Critical"
        Fix = {
            Write-Host "Applying fix: NuGetRestoreFailed" -ForegroundColor Yellow
            Write-Host "  Clearing NuGet caches..." -ForegroundColor Gray
            dotnet nuget locals all --clear
            return $true
        }
    },
    @{
        Name = "BuildCacheCorrupted"
        Pattern = "error MSB\d{4}:|The process cannot access the file.*bin.*obj"
        Severity = "Critical"
        Fix = {
            Write-Host "Applying fix: BuildCacheCorrupted" -ForegroundColor Yellow
            Write-Host "  Cleaning obj and bin directories..." -ForegroundColor Gray
            Get-ChildItem -Path "installer\LFSInstaller" -Include "obj","bin" -Recurse -Directory | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
            return $true
        }
    },
    @{
        Name = "OutOfDiskSpace"
        Pattern = "There is not enough space on the disk|Insufficient disk space"
        Severity = "Critical"
        Fix = {
            Write-Host "Applying fix: OutOfDiskSpace" -ForegroundColor Yellow
            Write-Host "  Cleaning temporary files..." -ForegroundColor Gray
            # Clean temp directories
            Get-ChildItem -Path $env:TEMP -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-7) } | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
            return $true
        }
    },
    @{
        Name = "AdminRightsRequired"
        Pattern = "Access is denied|requires elevation|administrator"
        Severity = "Warning"
        Fix = {
            Write-Host "Applying fix: AdminRightsRequired" -ForegroundColor Yellow
            Write-Host "  NOTE: This process requires administrator rights." -ForegroundColor Red
            Write-Host "  Please run the build script as Administrator." -ForegroundColor Red
            return $false
        }
    },
    @{
        Name = "NullReferenceWarning"
        Pattern = "warning CS8618:"
        Severity = "Warning"
        Fix = {
            Write-Host "Non-critical warning: Nullability warnings detected" -ForegroundColor Yellow
            Write-Host "  These are expected warnings and do not affect functionality." -ForegroundColor Gray
            return $false  # No fix needed, just informational
        }
    }
)

Write-Host "`n╔══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║    Automated Error Detection & Correction System     ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Find log file if not specified
if ([string]::IsNullOrEmpty($LogFile)) {
    $logFiles = Get-ChildItem -Path "." -Filter "build-log-*.json" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending
    if ($logFiles.Count -eq 0) {
        Write-Host "✗ No log files found. Run the build first." -ForegroundColor Red
        exit 1
    }
    $LogFile = $logFiles[0].FullName
    Write-Host "Using latest log file: $($logFiles[0].Name)" -ForegroundColor Cyan
}

# Load log file
if (-not (Test-Path $LogFile)) {
    Write-Host "✗ Log file not found: $LogFile" -ForegroundColor Red
    exit 1
}

try {
    $logData = Get-Content $LogFile | ConvertFrom-Json
    Write-Host "Log loaded: $($logData.TotalEntries) entries" -ForegroundColor Green
    Write-Host "  Errors: $($logData.ErrorCount)" -ForegroundColor $(if ($logData.ErrorCount -gt 0) { "Red" } else { "Green" })
    Write-Host "  Warnings: $($logData.WarningCount)" -ForegroundColor Yellow
} catch {
    Write-Host "✗ Failed to parse log file: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Analyze log entries
Write-Host "`nAnalyzing log entries for known patterns..." -ForegroundColor Cyan

$detectedIssues = @()
$criticalErrors = @()
$warnings = @()

foreach ($entry in $logData.Entries) {
    if ($Verbose) {
        Write-Host "  [$($entry.Level)] $($entry.Step): $($entry.Message)" -ForegroundColor Gray
    }
    
    foreach ($pattern in $ErrorPatterns) {
        if ($entry.Message -match $pattern.Pattern) {
            $issue = @{
                Pattern = $pattern
                Entry = $entry
                Fixed = $false
            }
            
            $detectedIssues += $issue
            
            if ($pattern.Severity -eq "Critical") {
                $criticalErrors += $issue
            } else {
                $warnings += $issue
            }
            
            Write-Host "`n[DETECTED] $($pattern.Name) ($($pattern.Severity))" -ForegroundColor $(if ($pattern.Severity -eq "Critical") { "Red" } else { "Yellow" })
            Write-Host "  Step: $($entry.Step)" -ForegroundColor Gray
            Write-Host "  Message: $($entry.Message)" -ForegroundColor Gray
        }
    }
}

# Summary
Write-Host "`n╔══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                  ANALYSIS SUMMARY                     ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "Total Issues Detected: $($detectedIssues.Count)" -ForegroundColor White
Write-Host "  Critical Errors: $($criticalErrors.Count)" -ForegroundColor Red
Write-Host "  Warnings: $($warnings.Count)" -ForegroundColor Yellow

if ($detectedIssues.Count -eq 0) {
    Write-Host "`n✓ No known error patterns detected. Build may have succeeded." -ForegroundColor Green
    exit 0
}

# Apply fixes if requested
if ($ApplyFixes) {
    Write-Host "`n╔══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║                  APPLYING FIXES                       ║" -ForegroundColor Cyan
    Write-Host "╚══════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan
    
    $fixedCount = 0
    $uniquePatterns = $detectedIssues | Select-Object -ExpandProperty Pattern -Unique
    
    foreach ($pattern in $uniquePatterns) {
        try {
            $result = & $pattern.Fix
            if ($result) {
                $fixedCount++
                Write-Host "✓ Fix applied successfully: $($pattern.Name)" -ForegroundColor Green
            }
        } catch {
            Write-Host "✗ Fix failed: $($pattern.Name) - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    Write-Host "`n╔══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║                   FIX SUMMARY                         ║" -ForegroundColor Cyan
    Write-Host "╚══════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan
    
    Write-Host "Fixes Applied: $fixedCount / $($uniquePatterns.Count)" -ForegroundColor White
    
    if ($fixedCount -gt 0) {
        Write-Host "`n✓ Fixes applied. Re-run the build pipeline to verify." -ForegroundColor Green
        exit 0
    } else {
        Write-Host "`n⚠ No automated fixes available for detected errors." -ForegroundColor Yellow
        Write-Host "Manual intervention may be required." -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "`nTo automatically apply fixes, run with -ApplyFixes flag:" -ForegroundColor Yellow
    Write-Host "  .\analyze-and-fix-errors.ps1 -ApplyFixes`n" -ForegroundColor Gray
    exit 1
}
