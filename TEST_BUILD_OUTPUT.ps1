# LFS Build Output Test Script
# Tests and verifies LFS build outputs automatically

param(
    [Parameter(Mandatory=$false)]
    [string]$BuildId,
    
    [Parameter(Mandatory=$false)]
    [string]$ArchivePath = "./lfs-build-output.tar.gz"
)

Write-Host "`n" -NoNewline
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "    LFS Build Output Verification Tool" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Check if archive exists
Write-Host "[TEST 1] Checking archive file..." -ForegroundColor Yellow
if (Test-Path $ArchivePath) {
    $file = Get-Item $ArchivePath
    Write-Host "  ✅ Archive found: $($file.Name)" -ForegroundColor Green
    Write-Host "  📦 Size: $($file.Length) bytes" -ForegroundColor Gray
    Write-Host "  📅 Modified: $($file.LastWriteTime)" -ForegroundColor Gray
} else {
    Write-Host "  ❌ Archive not found: $ArchivePath" -ForegroundColor Red
    exit 1
}

# Test 2: Extract and verify contents
Write-Host "`n[TEST 2] Extracting archive..." -ForegroundColor Yellow
$tempDir = ".\temp-lfs-test-$(Get-Random)"
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

try {
    tar -xzf $ArchivePath -C $tempDir
    $files = Get-ChildItem $tempDir -Recurse
    Write-Host "  ✅ Extraction successful" -ForegroundColor Green
    Write-Host "  📁 Files extracted: $($files.Count)" -ForegroundColor Gray
    
    # List contents
    Write-Host "`n  Contents:" -ForegroundColor Cyan
    foreach ($file in $files) {
        $fileSize = $file.Length
        Write-Host "    - $($file.Name) ($fileSize bytes)" -ForegroundColor Gray
    }
} catch {
    Write-Host "  ❌ Extraction failed: $_" -ForegroundColor Red
    Remove-Item $tempDir -Recurse -Force -ErrorAction SilentlyContinue
    exit 1
}

# Test 3: Check build metadata
Write-Host "`n[TEST 3] Analyzing build metadata..." -ForegroundColor Yellow
$metadataFiles = Get-ChildItem $tempDir -Filter "build-metadata-*.txt" -Recurse
if ($metadataFiles) {
    $metadata = Get-Content $metadataFiles[0].FullName
    Write-Host "  ✅ Metadata found" -ForegroundColor Green
    Write-Host "`n  Build Info:" -ForegroundColor Cyan
    $metadata | ForEach-Object { Write-Host "    $_" -ForegroundColor Gray }
} else {
    Write-Host "  ⚠️  No metadata file found" -ForegroundColor Yellow
}

# Test 4: Check for LFS directory structure
Write-Host "`n[TEST 4] Checking LFS directory structure..." -ForegroundColor Yellow
$expectedDirs = @("bin", "sbin", "lib", "usr", "etc", "var", "boot")
$lfsRoot = Get-ChildItem $tempDir -Directory | Where-Object { $_.Name -eq "lfs" -or $_.Name -eq "rootfs" }

if ($lfsRoot) {
    Write-Host "  ✅ LFS root directory found: $($lfsRoot.Name)" -ForegroundColor Green
    $foundDirs = Get-ChildItem $lfsRoot.FullName -Directory | Select-Object -ExpandProperty Name
    foreach ($dir in $expectedDirs) {
        if ($foundDirs -contains $dir) {
            Write-Host "    ✅ /$dir" -ForegroundColor Green
        } else {
            Write-Host "    ⚠️  /$dir (missing)" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "  ⚠️  LFS root directory not found (may be placeholder build)" -ForegroundColor Yellow
    Write-Host "    This is expected for test builds" -ForegroundColor Gray
}

# Test 5: Check build log
Write-Host "`n[TEST 5] Checking build log..." -ForegroundColor Yellow
if (Test-Path "./build.log") {
    $log = Get-Content "./build.log"
    $errors = $log | Select-String -Pattern "ERROR|FAILED" -AllMatches
    $completed = $log | Select-String -Pattern "completed successfully|COMPLETED" -AllMatches
    
    Write-Host "  ✅ Build log found" -ForegroundColor Green
    Write-Host "  📊 Log size: $(Get-Item './build.log' | Select-Object -ExpandProperty Length) bytes" -ForegroundColor Gray
    Write-Host "  ✅ Completion markers: $($completed.Count)" -ForegroundColor Green
    Write-Host "  ⚠️  Error markers: $($errors.Count)" -ForegroundColor $(if ($errors.Count -eq 0) { "Green" } else { "Yellow" })
} else {
    Write-Host "  ⚠️  Build log not found in current directory" -ForegroundColor Yellow
}

# Test 6: Check manifest
Write-Host "`n[TEST 6] Checking manifest.json..." -ForegroundColor Yellow
if (Test-Path "./manifest.json") {
    $manifest = Get-Content "./manifest.json" | ConvertFrom-Json
    Write-Host "  ✅ Manifest found" -ForegroundColor Green
    Write-Host "`n  Manifest Details:" -ForegroundColor Cyan
    Write-Host "    Build ID: $($manifest.buildId)" -ForegroundColor Gray
    Write-Host "    LFS Version: $($manifest.lfsVersion)" -ForegroundColor Gray
    Write-Host "    Build Date: $($manifest.buildDate)" -ForegroundColor Gray
    Write-Host "    Archive Size: $($manifest.archiveSize) bytes" -ForegroundColor Gray
    Write-Host "    Duration: $($manifest.buildDuration)s" -ForegroundColor Gray
    Write-Host "    Errors: $($manifest.errors)" -ForegroundColor $(if ($manifest.errors -eq 0) { "Green" } else { "Red" })
    Write-Host "    Warnings: $($manifest.warnings)" -ForegroundColor Yellow
} else {
    Write-Host "  ⚠️  Manifest not found in current directory" -ForegroundColor Yellow
}

# Test 7: GCS verification (if BuildId provided)
if ($BuildId) {
    Write-Host "`n[TEST 7] Verifying GCS upload..." -ForegroundColor Yellow
    try {
        $gcsPath = "gs://alfs-bd1e0-builds/$BuildId/"
        $gcsFiles = gsutil ls $gcsPath 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ GCS upload verified" -ForegroundColor Green
            Write-Host "`n  Files in GCS:" -ForegroundColor Cyan
            $gcsFiles | ForEach-Object { 
                if ($_ -match '^\s*\d+\s+') {
                    Write-Host "    $_" -ForegroundColor Gray
                }
            }
        } else {
            Write-Host "  ❌ GCS verification failed" -ForegroundColor Red
        }
    } catch {
        Write-Host "  ⚠️  Could not verify GCS (gsutil not available or auth issue)" -ForegroundColor Yellow
    }
}

# Test 8: Binary analysis (if real binaries exist)
Write-Host "`n[TEST 8] Checking for compiled binaries..." -ForegroundColor Yellow
$binaries = Get-ChildItem $tempDir -Filter "*.so*" -Recurse -ErrorAction SilentlyContinue
if ($binaries) {
    Write-Host "  ✅ Found $($binaries.Count) shared libraries" -ForegroundColor Green
    Write-Host "    This appears to be a REAL LFS build!" -ForegroundColor Green
} else {
    $exes = Get-ChildItem $tempDir -File -Recurse | Where-Object { $_.Length -gt 10KB }
    if ($exes) {
        Write-Host "  ✅ Found $($exes.Count) files > 10KB" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  No compiled binaries found" -ForegroundColor Yellow
        Write-Host "    This appears to be a PLACEHOLDER/TEST build" -ForegroundColor Gray
    }
}

# Cleanup
Write-Host "`n[CLEANUP] Removing temporary files..." -ForegroundColor Yellow
Remove-Item $tempDir -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "  ✅ Cleanup complete" -ForegroundColor Green

# Summary
Write-Host "`n" -NoNewline
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "                TEST SUMMARY" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

$archiveSize = (Get-Item $ArchivePath).Length
if ($archiveSize -lt 1MB) {
    Write-Host "`n⚠️  BUILD TYPE: PLACEHOLDER/TEST" -ForegroundColor Yellow
    Write-Host "   This is a test build to verify the pipeline works." -ForegroundColor Gray
    Write-Host "   For a real LFS system, submit a full build via:" -ForegroundColor Gray
    Write-Host "   https://alfs-bd1e0.web.app/" -ForegroundColor Cyan
} elseif ($archiveSize -lt 100MB) {
    Write-Host "`n⚠️  BUILD TYPE: PARTIAL/INCOMPLETE" -ForegroundColor Yellow
    Write-Host "   This build may be incomplete or failed." -ForegroundColor Gray
} else {
    Write-Host "`n✅ BUILD TYPE: FULL LFS SYSTEM" -ForegroundColor Green
    Write-Host "   This appears to be a complete LFS build!" -ForegroundColor Gray
    Write-Host "`n   Next steps:" -ForegroundColor Cyan
    Write-Host "   1. Set up a VM (Hyper-V, VirtualBox, or WSL2)" -ForegroundColor Gray
    Write-Host "   2. Deploy the LFS system" -ForegroundColor Gray
    Write-Host "   3. Configure bootloader (GRUB)" -ForegroundColor Gray
    Write-Host "   4. Boot and test!" -ForegroundColor Gray
}

Write-Host "`n📖 For detailed instructions, see:" -ForegroundColor Cyan
Write-Host "   TESTING_AND_USAGE_GUIDE.md" -ForegroundColor White

Write-Host "`n================================================`n" -ForegroundColor Cyan
