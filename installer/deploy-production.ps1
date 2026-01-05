# Production Deployment Script
# Kills running processes, rebuilds, and creates production artifacts

param(
    [switch]$Force
)

$ErrorActionPreference = "Stop"
$InformationPreference = "Continue"

Write-Host "`n=== LFS Installer Production Deployment ===" -ForegroundColor Cyan

# Step 1: Kill running processes
Write-Host "`n[1/5] Terminating running installer instances..." -ForegroundColor Yellow
$processes = Get-Process -Name "LFSBuilderSetup" -ErrorAction SilentlyContinue
if ($processes) {
    Write-Host "Found $($processes.Count) running instance(s)" -ForegroundColor Yellow
    foreach ($proc in $processes) {
        try {
            Stop-Process -Id $proc.Id -Force
            Write-Host "  Killed PID $($proc.Id)" -ForegroundColor Green
        } catch {
            Write-Host "  Failed to kill PID $($proc.Id): $_" -ForegroundColor Red
        }
    }
    Start-Sleep -Seconds 2
} else {
    Write-Host "  No running instances" -ForegroundColor Green
}

# Step 2: Clean build artifacts
Write-Host "`n[2/5] Cleaning build artifacts..." -ForegroundColor Yellow
Set-Location "c:\Users\Chintu\Documents\Dev Zone\Dev work web\lfs-automated\installer\LFSInstaller"
& dotnet clean --configuration Release | Out-Null
Write-Host "  Cleaned" -ForegroundColor Green

# Step 3: Build and publish
Write-Host "`n[3/5] Building installer..." -ForegroundColor Yellow
$buildOutput = & dotnet publish --configuration Release --output ./publish --self-contained true --runtime win-x64 2>&1
$buildSuccess = $LASTEXITCODE -eq 0

if (-not $buildSuccess) {
    Write-Host "  Build failed!" -ForegroundColor Red
    Write-Host $buildOutput
    exit 1
}

$warnings = ($buildOutput | Select-String "warning").Count
$errors = ($buildOutput | Select-String "error").Count
Write-Host "  Build completed: $errors error(s), $warnings warning(s)" -ForegroundColor $(if ($errors -eq 0) { "Green" } else { "Red" })

# Step 4: Validate artifacts
Write-Host "`n[4/5] Validating artifacts..." -ForegroundColor Yellow
$exePath = "c:\Users\Chintu\Documents\Dev Zone\Dev work web\lfs-automated\installer\LFSInstaller\publish\LFSBuilderSetup.exe"

if (-not (Test-Path $exePath)) {
    Write-Host "  ERROR: Executable not found at $exePath" -ForegroundColor Red
    exit 1
}

$fileInfo = Get-Item $exePath
$fileSizeMB = [math]::Round($fileInfo.Length / 1MB, 2)
Write-Host "  Executable: $exePath" -ForegroundColor Green
Write-Host "  Size: $fileSizeMB MB" -ForegroundColor Green
Write-Host "  Modified: $($fileInfo.LastWriteTime)" -ForegroundColor Green

# Calculate checksum
$hash = (Get-FileHash -Path $exePath -Algorithm SHA256).Hash
Write-Host "  SHA-256: $hash" -ForegroundColor Green

# Step 5: Create production manifest
Write-Host "`n[5/5] Creating production manifest..." -ForegroundColor Yellow
$manifest = @{
    version = "1.0.0"
    buildDate = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    executable = "LFSBuilderSetup.exe"
    size = $fileInfo.Length
    sha256 = $hash
    runtime = "win-x64"
    framework = "net8.0-windows"
} | ConvertTo-Json

$manifestPath = "c:\Users\Chintu\Documents\Dev Zone\Dev work web\lfs-automated\installer\LFSInstaller\publish\manifest.json"
Set-Content -Path $manifestPath -Value $manifest
Write-Host "  Manifest: $manifestPath" -ForegroundColor Green

Write-Host "`n=== DEPLOYMENT COMPLETE ===" -ForegroundColor Green
Write-Host "`nProduction artifacts:" -ForegroundColor Cyan
Write-Host "  Executable: $exePath" -ForegroundColor White
Write-Host "  Manifest: $manifestPath" -ForegroundColor White
Write-Host "`nSHA-256: $hash" -ForegroundColor White

Write-Host "`nReady for distribution!" -ForegroundColor Green
exit 0
