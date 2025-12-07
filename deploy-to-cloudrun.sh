#!/bin/bash
set -e

# Configuration
PROJECT_ID="lfs-builder-441212"
REGION="us-central1"
SERVICE_NAME="lfs-builder"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"
IMAGE_TAG="v-local-$(date +%Y%m%d-%H%M%S)"

echo "=== LFS Cloud Run Deployment ==="
echo "Project: ${PROJECT_ID}"
echo "Image: ${IMAGE_NAME}:${IMAGE_TAG}"
echo ""

# Build Docker image
echo "Step 1: Building Docker image with pre-built toolchain..."
docker build -f Dockerfile.cloudrun -t ${IMAGE_NAME}:${IMAGE_TAG} .

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed!"
    exit 1
fi

echo "✅ Docker image built successfully!"
echo ""

# Push to Google Container Registry
echo "Step 2: Pushing image to GCR..."
docker push ${IMAGE_NAME}:${IMAGE_TAG}

if [ $? -ne 0 ]; then
    echo "❌ Docker push failed!"
    exit 1
fi

echo "✅ Image pushed successfully!"
echo ""

# Deploy to Cloud Run
echo "Step 3: Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
    --image ${IMAGE_NAME}:${IMAGE_TAG} \
    --platform managed \
    --region ${REGION} \
    --memory 8Gi \
    --cpu 4 \
    --timeout 3600 \
    --max-instances 1 \
    --no-allow-unauthenticated \
    --project ${PROJECT_ID}

if [ $? -ne 0 ]; then
    echo "❌ Cloud Run deployment failed!"
    exit 1
fi

echo ""
echo "=== ✅ DEPLOYMENT COMPLETE ==="
echo ""
echo "The LFS toolchain is now deployed to Cloud Run!"
echo "Image: ${IMAGE_NAME}:${IMAGE_TAG}"
echo ""
echo "To run a build:"
echo "gcloud run jobs execute ${SERVICE_NAME} --region ${REGION} --project ${PROJECT_ID}"
