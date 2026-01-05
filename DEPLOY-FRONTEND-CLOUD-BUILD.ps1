# Deploy Frontend with Cloud Build Integration
# PowerShell script for Windows

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  LFS Cloud Build - Frontend Deployment" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to frontend directory
Set-Location lfs-learning-platform

Write-Host "✓ Checking environment variables..." -ForegroundColor Green
if (-not (Test-Path .env.local)) {
    Write-Host "❌ ERROR: .env.local not found" -ForegroundColor Red
    Write-Host "   Please create .env.local with Firebase configuration"
    exit 1
}

# Check for required environment variables
$envContent = Get-Content .env.local -Raw
if ($envContent -notmatch "NEXT_PUBLIC_FIREBASE_API_KEY") {
    Write-Host "❌ ERROR: Missing NEXT_PUBLIC_FIREBASE_API_KEY in .env.local" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Environment variables configured" -ForegroundColor Green
Write-Host ""

Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERROR: npm install failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Dependencies installed" -ForegroundColor Green
Write-Host ""

Write-Host "🔨 Building Next.js application..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERROR: Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Build completed" -ForegroundColor Green
Write-Host ""

Write-Host "🚀 Deploying to Netlify..." -ForegroundColor Yellow
netlify deploy --prod
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERROR: Deployment failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Deployed successfully" -ForegroundColor Green
Write-Host ""

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  ✅ Deployment Complete!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Live site: " -NoNewline
Write-Host "https://sams-lfs.netlify.app" -ForegroundColor Blue
Write-Host "📋 Test the Cloud Build feature:" -ForegroundColor Yellow
Write-Host "   1. Navigate to /build page"
Write-Host "   2. Click 'Cloud Build' tab"
Write-Host "   3. Sign in with Google"
Write-Host "   4. Submit a test build"
Write-Host ""
Write-Host "🔍 Monitor builds:" -ForegroundColor Yellow
Write-Host "   Firebase Console: " -NoNewline
Write-Host "https://console.firebase.google.com/project/alfs-bd1e0/firestore" -ForegroundColor Blue
Write-Host "   Cloud Run: gcloud run jobs executions list --job=lfs-builder --region=us-central1"
Write-Host ""

# Return to root directory
Set-Location ..
