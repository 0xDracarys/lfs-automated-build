# Quick Cloud Build Test Script
param()

Write-Host "`n=== CLOUD BUILD FEATURE TESTING ===`n" -ForegroundColor Cyan

$tests = @()

# Test 1: Real Firestore Integration
Write-Host "Test 1: Firestore Integration..." -ForegroundColor Yellow
$check1 = (Test-Path "lfs-learning-platform\lib\firebase-admin.ts") -and `
          ((Get-Content "lfs-learning-platform\app\api\lfs\status\[buildId]\route.ts" -Raw -ErrorAction SilentlyContinue) -match "adminDb")
if ($check1) {
    Write-Host "  [OK] Real Firestore integration" -ForegroundColor Green
    $tests += "[OK] Fix #1: Real Build Monitoring"
} else {
    Write-Host "  [FAIL] Missing Firestore integration" -ForegroundColor Red
    $tests += "[FAIL] Fix #1"
}

# Test 2: Email Function
Write-Host "`nTest 2: Email Function..." -ForegroundColor Yellow
$check2 = (Get-Content "functions\index.js" -Raw -ErrorAction SilentlyContinue) -match "sendBuildEmail.*TEST MODE"
if ($check2) {
    Write-Host "  [OK] Email function with logging" -ForegroundColor Green
    $tests += "[OK] Fix #2: Email Notifications (TEST MODE)"
} else {
    Write-Host "  [FAIL] Email function not configured" -ForegroundColor Red
    $tests += "[FAIL] Fix #2"
}

# Test 3: Packaging Scripts
Write-Host "`nTest 3: Packaging Scripts..." -ForegroundColor Yellow
$check3 = (Test-Path "package-lfs-outputs.sh") -and `
          (Test-Path "helpers\update-download-urls.js") -and `
          ((Get-Content "lfs-build.sh" -Raw -ErrorAction SilentlyContinue) -match "package-lfs-outputs")
if ($check3) {
    Write-Host "  [OK] Packaging scripts integrated" -ForegroundColor Green
    $tests += "[OK] Fix #3: Mountable Outputs"
} else {
    Write-Host "  [FAIL] Packaging incomplete" -ForegroundColor Red
    $tests += "[FAIL] Fix #3"
}

# Test 4: Test Page
Write-Host "`nTest 4: Test Page..." -ForegroundColor Yellow
$check4 = Test-Path "lfs-learning-platform\app\test\page.tsx"
if ($check4) {
    Write-Host "  [OK] Test page available" -ForegroundColor Green
    $tests += "[OK] Test Page at /test"
} else {
    Write-Host "  [FAIL] Test page missing" -ForegroundColor Red
    $tests += "[FAIL] Test Page"
}

# Summary
Write-Host "`n=== TEST RESULTS ===`n" -ForegroundColor Cyan
foreach ($test in $tests) {
    if ($test -match "OK") {
        Write-Host "  $test" -ForegroundColor Green
    } else {
        Write-Host "  $test" -ForegroundColor Red
    }
}

# Next Steps
Write-Host "`n=== NEXT STEPS ===`n" -ForegroundColor Cyan
Write-Host "1. Deploy Functions:" -ForegroundColor Yellow
Write-Host "   firebase deploy --only functions`n"

Write-Host "2. Start Dev Server:" -ForegroundColor Yellow
Write-Host "   cd lfs-learning-platform && npm run dev`n"

Write-Host "3. Open Test Page:" -ForegroundColor Yellow
Write-Host "   http://localhost:3000/test`n"

Write-Host "4. View Logs:" -ForegroundColor Yellow
Write-Host "   firebase functions:log`n"

Write-Host "See TEST-CLOUD-BUILD.md for full guide`n" -ForegroundColor Cyan
