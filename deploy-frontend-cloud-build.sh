#!/bin/bash
# Deploy Frontend with Cloud Build Integration
# Run this script to deploy the updated build page to Netlify

set -e

echo "========================================="
echo "  LFS Cloud Build - Frontend Deployment"
echo "========================================="
echo ""

# Navigate to frontend directory
cd lfs-learning-platform

echo "✓ Checking environment variables..."
if [ ! -f .env.local ]; then
    echo "❌ ERROR: .env.local not found"
    echo "   Please create .env.local with Firebase configuration"
    exit 1
fi

# Check for required environment variables
if ! grep -q "NEXT_PUBLIC_FIREBASE_API_KEY" .env.local; then
    echo "❌ ERROR: Missing NEXT_PUBLIC_FIREBASE_API_KEY in .env.local"
    exit 1
fi

echo "✓ Environment variables configured"
echo ""

echo "📦 Installing dependencies..."
npm install
echo "✓ Dependencies installed"
echo ""

echo "🔨 Building Next.js application..."
npm run build
echo "✓ Build completed"
echo ""

echo "🚀 Deploying to Netlify..."
netlify deploy --prod
echo "✓ Deployed successfully"
echo ""

echo "========================================="
echo "  ✅ Deployment Complete!"
echo "========================================="
echo ""
echo "🌐 Live site: https://sams-lfs.netlify.app"
echo "📋 Test the Cloud Build feature:"
echo "   1. Navigate to /build page"
echo "   2. Click 'Cloud Build' tab"
echo "   3. Sign in with Google"
echo "   4. Submit a test build"
echo ""
echo "🔍 Monitor builds:"
echo "   Firebase Console: https://console.firebase.google.com/project/alfs-bd1e0/firestore"
echo "   Cloud Run Jobs: gcloud run jobs executions list --job=lfs-builder --region=us-central1"
echo ""
