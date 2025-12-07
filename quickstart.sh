#!/bin/bash

# LFS Automated Builder - Quick Start Script
# This script sets up the project for local development

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐧 LFS Automated Builder - Quick Start${NC}\n"

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi
NODE_VERSION=$(node -v)
echo -e "${GREEN}✓${NC} Node.js $NODE_VERSION"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi
NPM_VERSION=$(npm -v)
echo -e "${GREEN}✓${NC} npm $NPM_VERSION"

# Check Firebase CLI
if ! command -v firebase &> /dev/null; then
    echo -e "${YELLOW}⚠${NC} Firebase CLI not installed. Installing..."
    npm install -g firebase-tools
fi
FIREBASE_VERSION=$(firebase --version)
echo -e "${GREEN}✓${NC} Firebase CLI"

echo ""
echo -e "${YELLOW}Installing dependencies...${NC}"

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Install function dependencies
echo "Installing Cloud Functions dependencies..."
cd functions
npm install
cd ..

echo ""
echo -e "${YELLOW}Initializing Firebase...${NC}"

# Check if .firebaserc exists
if [ ! -f .firebaserc ]; then
    echo -e "${YELLOW}First time setup: Please run 'firebase init'${NC}"
    echo ""
    echo "Steps to complete setup:"
    echo "1. Run: firebase init"
    echo "2. Select: Firestore, Functions, Hosting"
    echo "3. Choose your Firebase project"
    echo "4. Update Firebase config in public/index.html"
    echo ""
else
    echo -e "${GREEN}✓${NC} Firebase initialized"
fi

echo ""
echo -e "${BLUE}📝 Project Structure Created${NC}"
echo ""
echo "Key files:"
echo "  • public/index.html          - Frontend application"
echo "  • functions/index.js         - Cloud Functions"
echo "  • firebase.json              - Firebase configuration"
echo "  • Dockerfile                 - Cloud Run Job image"
echo "  • docker-entrypoint.sh       - Container startup"
echo ""

echo -e "${BLUE}🚀 Getting Started${NC}"
echo ""
echo "Local development:"
echo "  npm run serve              - Start local Firebase emulators"
echo ""
echo "Deployment:"
echo "  npm run deploy             - Deploy all services"
echo "  npm run deploy:functions   - Deploy Cloud Functions only"
echo "  npm run deploy:hosting     - Deploy Hosting only"
echo ""
echo "Docker:"
echo "  docker build -t lfs-builder .               - Build Docker image"
echo "  docker run -it lfs-builder shell            - Run interactive shell"
echo ""

echo -e "${BLUE}📚 Documentation${NC}"
echo ""
echo "  • README.md                - Project overview and structure"
echo "  • DEPLOYMENT.md            - Detailed deployment guide"
echo "  • build.config             - Build configuration"
echo ""

echo -e "${YELLOW}⚠ Next Steps:${NC}"
echo ""
echo "1. If first time: Run 'firebase init' to set up Firebase"
echo "2. Update Firebase config in public/index.html"
echo "3. Run 'npm run serve' to test locally"
echo "4. Follow DEPLOYMENT.md for cloud deployment"
echo ""

echo -e "${GREEN}✓ Setup complete!${NC}\n"
