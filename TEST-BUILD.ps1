# Quick Cloud Build Test Script
# Tests all 3 fixes: Real monitoring, Email logging, Packaging integration

Write-Host "`n╔══════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🧪 CLOUD BUILD FEATURE TESTING  ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════╝`n" -ForegroundColor Cyan

$ErrorActionPreference = "Continue"
$testResults = @()

# Test 1: Real Firestore Integration
Write-Host "Test 1: Checking Real Firestore Integration..." -ForegroundColor Yellow
$hasFirebaseAdmin = Test-Path "lfs-learning-platform\node_modules\firebase-admin"
$hasAdminLib = Test-Path "lfs-learning-platform\lib\firebase-admin.ts"
$hasRealAPI = (Get-Content "lfs-learning-platform\app\api\lfs\status\[buildId]\route.ts" -Raw) -match "adminDb\.collection"

if ($hasFirebaseAdmin -and $hasAdminLib -and $hasRealAPI) {
    Write-Host "  ✅ Real Firestore integration active" -ForegroundColor Green
    $testResults += "✅ Fix #1: Real Build Monitoring"
} else {
    Write-Host "  ❌ Firestore integration incomplete" -ForegroundColor Red
    $testResults += "❌ Fix #1: Real Build Monitoring"
}

# Test 2: Email Function with Logging
Write-Host "`nTest 2: Checking Email Function..." -ForegroundColor Yellow
$functionsCode = Get-Content "functions\index.js" -Raw
$hasEmailFunction = $functionsCode -match "sendBuildEmail"
$hasTestMode = $functionsCode -match "\[TEST MODE\]"

if ($hasEmailFunction -and $hasTestMode) {
    Write-Host "  ✅ Email function with TEST MODE logging" -ForegroundColor Green
    $testResults += "✅ Fix #2: Email Notifications (TEST MODE)"
} else {
    Write-Host "  ❌ Email function not configured" -ForegroundColor Red
    $testResults += "❌ Fix #2: Email Notifications"
}

# Test 3: Packaging Scripts
Write-Host "`nTest 3: Checking Packaging Scripts..." -ForegroundColor Yellow
$hasPackageScript = Test-Path "package-lfs-outputs.sh"
$hasUpdateHelper = Test-Path "helpers\update-download-urls.js"
$hasIntegration = (Get-Content "lfs-build.sh" -Raw) -match "package-lfs-outputs"
$hasDockerfile = (Get-Content "Dockerfile.cloudrun" -Raw) -match "package-lfs-outputs"

if ($hasPackageScript -and $hasUpdateHelper -and $hasIntegration -and $hasDockerfile) {
    Write-Host "  ✅ Packaging scripts integrated" -ForegroundColor Green
    $testResults += "✅ Fix #3: Mountable Outputs"
} else {
    Write-Host "  ❌ Packaging scripts incomplete" -ForegroundColor Red
    $testResults += "❌ Fix #3: Mountable Outputs"
}

# Test 4: Test Page
Write-Host "`nTest 4: Checking Test Page..." -ForegroundColor Yellow
$hasTestPage = Test-Path "lfs-learning-platform\app\test\page.tsx"

if ($hasTestPage) {
    Write-Host "  ✅ Test page available at /test" -ForegroundColor Green
    $testResults += "✅ Test Page Created"
} else {
    Write-Host "  ❌ Test page missing" -ForegroundColor Red
    $testResults += "❌ Test Page Missing"
}

# Test 5: Firebase Functions Deployed
Write-Host "`nTest 5: Checking Deployed Functions..." -ForegroundColor Yellow
$deployedFunctions = firebase functions:list 2>&1 | Out-String
$hasTriggerBuild = $deployedFunctions -match "triggerCloudBuild"
$hasTestFunction = $deployedFunctions -match "testBuildComplete"

if ($hasTriggerBuild) {
    Write-Host "  ✅ triggerCloudBuild deployed" -ForegroundColor Green
    $testResults += "✅ triggerCloudBuild Function"
} else {
    Write-Host "  ⚠️  triggerCloudBuild not deployed" -ForegroundColor Yellow
    $testResults += "⚠️  triggerCloudBuild Function (deploy needed)"
}

# Summary
Write-Host "`n╔══════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         TEST SUMMARY              ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════╝`n" -ForegroundColor Cyan

foreach ($result in $testResults) {
    Write-Host "  $result"
}

Write-Host "`n╔══════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║        NEXT STEPS                 ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "1. Deploy Cloud Functions:" -ForegroundColor Yellow
Write-Host "   cd `"c:\Users\Chintu\Documents\Dev Zone\Dev work web\lfs-automated`""
Write-Host "   firebase deploy --only functions`n"

Write-Host "2. Start Dev Server:" -ForegroundColor Yellow
Write-Host "   cd lfs-learning-platform"
Write-Host "   npm run dev`n"

Write-Host "3. Test the Pipeline:" -ForegroundColor Yellow
Write-Host "   http://localhost:3000/test`n"

Write-Host "4. View Email Logs:" -ForegroundColor Yellow
Write-Host "   firebase functions:log --only sendBuildEmail`n"

Write-Host "5. Monitor Real Build:" -ForegroundColor Yellow
Write-Host "   http://localhost:3000/dashboard`n"

Write-Host "Full Guide: TEST-CLOUD-BUILD.md`n" -ForegroundColor Cyan
