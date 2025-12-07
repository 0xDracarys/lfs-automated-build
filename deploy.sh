#!/bin/bash

# LFS Learning Platform - Deployment Script
# This script automates the deployment process to Google Cloud Run

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="${PROJECT_ID:-lfs-learning-platform}"
REGION="${REGION:-us-central1}"
SERVICE_NAME="${SERVICE_NAME:-lfs-web-platform}"
ARTIFACT_REPO="${ARTIFACT_REPO:-lfs-app}"
IMAGE_NAME="${REGION}-docker.pkg.dev/${PROJECT_ID}/${ARTIFACT_REPO}/${SERVICE_NAME}"

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command -v gcloud &> /dev/null; then
        log_error "gcloud CLI not found. Please install it first."
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker not found. Please install it first."
        exit 1
    fi
    
    # Check gcloud is configured
    if ! gcloud config get-value project &> /dev/null; then
        log_error "gcloud not configured. Run: gcloud init"
        exit 1
    fi
    
    log_info "All prerequisites satisfied ✓"
}

# Setup GCP project
setup_gcp() {
    log_info "Setting up Google Cloud project..."
    
    # Set project
    gcloud config set project ${PROJECT_ID}
    
    # Enable required services
    log_info "Enabling required APIs..."
    gcloud services enable \
        run.googleapis.com \
        build.googleapis.com \
        artifactregistry.googleapis.com \
        firestore.googleapis.com \
        storage-api.googleapis.com
    
    log_info "GCP setup complete ✓"
}

# Setup Artifact Registry
setup_artifact_registry() {
    log_info "Setting up Artifact Registry..."
    
    # Check if repository exists
    if gcloud artifacts repositories describe ${ARTIFACT_REPO} \
        --location=${REGION} &> /dev/null; then
        log_warn "Repository ${ARTIFACT_REPO} already exists"
    else
        log_info "Creating repository ${ARTIFACT_REPO}..."
        gcloud artifacts repositories create ${ARTIFACT_REPO} \
            --repository-format=docker \
            --location=${REGION}
    fi
    
    # Configure Docker authentication
    log_info "Configuring Docker authentication..."
    gcloud auth configure-docker ${REGION}-docker.pkg.dev
    
    log_info "Artifact Registry setup complete ✓"
}

# Build Docker image
build_image() {
    log_info "Building Docker image..."
    
    docker build \
        -f lfs-learning-platform/Dockerfile \
        -t ${IMAGE_NAME}:${SHORT_SHA:-latest} \
        -t ${IMAGE_NAME}:latest \
        .
    
    log_info "Docker image built successfully ✓"
}

# Push image to Artifact Registry
push_image() {
    log_info "Pushing image to Artifact Registry..."
    
    docker push ${IMAGE_NAME}:${SHORT_SHA:-latest}
    docker push ${IMAGE_NAME}:latest
    
    log_info "Image pushed successfully ✓"
}

# Deploy to Cloud Run
deploy_cloudrun() {
    log_info "Deploying to Cloud Run..."
    
    gcloud run deploy ${SERVICE_NAME} \
        --image ${IMAGE_NAME}:${SHORT_SHA:-latest} \
        --region ${REGION} \
        --platform managed \
        --allow-unauthenticated \
        --port 8080 \
        --memory 1Gi \
        --cpu 1 \
        --timeout 3600 \
        --max-instances 100 \
        --set-env-vars NODE_ENV=production
    
    # Get service URL
    SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} \
        --region ${REGION} \
        --format 'value(status.url)')
    
    log_info "Cloud Run deployment complete ✓"
    log_info "Service URL: ${SERVICE_URL}"
}

# Verify deployment
verify_deployment() {
    log_info "Verifying deployment..."
    
    SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} \
        --region ${REGION} \
        --format 'value(status.url)')
    
    if curl -s -o /dev/null -w "%{http_code}" ${SERVICE_URL} | grep -q "200"; then
        log_info "Deployment verification successful ✓"
    else
        log_warn "Could not verify deployment health"
    fi
}

# Show logs
show_logs() {
    log_info "Recent deployment logs:"
    gcloud run services logs read ${SERVICE_NAME} \
        --region ${REGION} \
        --limit 20
}

# Main flow
main() {
    log_info "Starting LFS Learning Platform deployment..."
    
    # Get short SHA for tagging
    export SHORT_SHA=$(git rev-parse --short HEAD || echo "local")
    
    # Run setup steps
    check_prerequisites
    setup_gcp
    setup_artifact_registry
    
    # Build and deploy
    log_info "Building application..."
    build_image
    push_image
    deploy_cloudrun
    verify_deployment
    show_logs
    
    log_info "Deployment completed successfully! 🎉"
}

# Parse arguments
case "${1:-deploy}" in
    setup)
        check_prerequisites
        setup_gcp
        setup_artifact_registry
        ;;
    build)
        build_image
        ;;
    push)
        push_image
        ;;
    deploy)
        main
        ;;
    logs)
        show_logs
        ;;
    verify)
        verify_deployment
        ;;
    *)
        echo "Usage: $0 {setup|build|push|deploy|logs|verify}"
        echo ""
        echo "Commands:"
        echo "  setup   - Set up GCP and Artifact Registry"
        echo "  build   - Build Docker image locally"
        echo "  push    - Push image to Artifact Registry"
        echo "  deploy  - Full deployment (build, push, deploy)"
        echo "  logs    - Show recent deployment logs"
        echo "  verify  - Verify deployment health"
        exit 1
        ;;
esac
