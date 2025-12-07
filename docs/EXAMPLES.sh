#!/bin/bash

################################################################################
# LFS Build Script - Usage Examples
#
# This file contains various examples of how to use lfs-build.sh
# Copy and modify examples for your specific use case
################################################################################

# ============================================================================
# Example 1: Simple Local Build
# ============================================================================

example_simple_local() {
    cat << 'EOF'
#!/bin/bash
# Simple local build with minimal configuration

export LFS_CONFIG_JSON='{
  "buildId": "local-test-001",
  "lfsVersion": "12.0",
  "projectId": "my-gcp-project",
  "gcsBucket": "lfs-builds",
  "projectName": "Local Test",
  "email": "user@example.com",
  "buildOptions": {
    "includeGlibcDev": true,
    "includeKernel": false,
    "optimizeSize": false
  }
}'

export GOOGLE_APPLICATION_CREDENTIALS="$HOME/.config/gcloud/sa-key.json"

# Run build
./lfs-build.sh
EOF
}

# ============================================================================
# Example 2: Docker Build with Volume Mounts
# ============================================================================

example_docker_build() {
    cat << 'EOF'
#!/bin/bash
# Build in Docker container with volume mounts

BUILD_ID="docker-build-$(date +%s)"

docker run -it \
  --name lfs-builder-$BUILD_ID \
  -e BUILD_ID="$BUILD_ID" \
  -e LFS_CONFIG_JSON='{
    "buildId": "'$BUILD_ID'",
    "lfsVersion": "12.0",
    "projectId": "my-gcp-project",
    "gcsBucket": "lfs-builds"
  }' \
  -e GOOGLE_APPLICATION_CREDENTIALS="/secrets/sa.json" \
  -e DEBUG=1 \
  -v "$HOME/.config/gcloud/sa-key.json:/secrets/sa.json:ro" \
  -v "$(pwd)/output:/lfs/output" \
  -v "$(pwd)/logs:/lfs/logs" \
  gcr.io/my-gcp-project/lfs-builder:latest

echo "Build ID: $BUILD_ID"
echo "Output: ./output/lfs-build-$BUILD_ID-12.0.tar.gz"
echo "Logs: ./logs/build-$BUILD_ID.log"
EOF
}

# ============================================================================
# Example 3: Cloud Run Job Submission
# ============================================================================

example_cloud_run_submission() {
    cat << 'EOF'
#!/bin/bash
# Submit build to Google Cloud Run

PROJECT_ID="my-gcp-project"
REGION="us-central1"
BUILD_ID="cloud-build-$(date +%s)"

# Create build configuration
CONFIG=$(cat <<CONFIG_EOF
{
  "buildId": "$BUILD_ID",
  "lfsVersion": "12.0",
  "projectId": "$PROJECT_ID",
  "gcsBucket": "lfs-builds",
  "projectName": "Cloud Run Build",
  "email": "admin@example.com",
  "buildOptions": {
    "includeGlibcDev": true,
    "includeKernel": true,
    "optimizeSize": false
  }
}
CONFIG_EOF
)

# Execute Cloud Run Job
gcloud run jobs execute lfs-builder \
  --project "$PROJECT_ID" \
  --region "$REGION" \
  --set-env-vars "LFS_CONFIG_JSON=$CONFIG" \
  --no-wait

echo "Build submitted!"
echo "Build ID: $BUILD_ID"
echo ""
echo "Monitor with:"
echo "  gcloud run jobs logs read lfs-builder --project=$PROJECT_ID --region=$REGION"
EOF
}

# ============================================================================
# Example 4: Batch Build Submission
# ============================================================================

example_batch_builds() {
    cat << 'EOF'
#!/bin/bash
# Submit multiple builds with different LFS versions

PROJECT_ID="my-gcp-project"
VERSIONS=("12.0" "11.3" "11.2")

for version in "${VERSIONS[@]}"; do
    BUILD_ID="batch-$(date +%s)-$version"
    
    CONFIG="{
      \"buildId\": \"$BUILD_ID\",
      \"lfsVersion\": \"$version\",
      \"projectId\": \"$PROJECT_ID\",
      \"gcsBucket\": \"lfs-builds\",
      \"projectName\": \"Batch Build $version\"
    }"
    
    echo "Submitting build: $BUILD_ID"
    
    gcloud run jobs execute lfs-builder \
      --project "$PROJECT_ID" \
      --region "us-central1" \
      --set-env-vars "LFS_CONFIG_JSON=$CONFIG" \
      --no-wait
    
    sleep 2  # Avoid rate limiting
done

echo "Batch build submission complete"
EOF
}

# ============================================================================
# Example 5: Development/Debug Build
# ============================================================================

example_debug_build() {
    cat << 'EOF'
#!/bin/bash
# Build with debug logging enabled

source lfs-build.config  # Load configuration

# Enable debug
export DEBUG=1

# Use slower compiler for debugging
export CFLAGS="-O0 -g"
export CXXFLAGS="-O0 -g"

# Single-threaded build for easier debugging
export MAKEFLAGS="-j1"

# Run with debug
echo "Starting debug build..."
./lfs-build.sh --debug

# Show summary
echo ""
echo "Build logs:"
tail -20 logs/build-*.log
EOF
}

# ============================================================================
# Example 6: Monitor Build Status
# ============================================================================

example_monitor_status() {
    cat << 'EOF'
#!/bin/bash
# Monitor build status from Firestore

PROJECT_ID="my-gcp-project"
BUILD_ID="$1"

if [ -z "$BUILD_ID" ]; then
    echo "Usage: $0 <build-id>"
    exit 1
fi

echo "Monitoring build: $BUILD_ID"
echo ""

# Watch Firestore document
gcloud firestore documents get "builds/$BUILD_ID" \
    --project="$PROJECT_ID" \
    --watch --format=json | jq '.fields | {
        buildId: .buildId.stringValue,
        status: .status.stringValue,
        startedAt: .startedAt.timestampValue,
        completedAt: .completedAt.timestampValue,
        error: .error.stringValue
    }'
EOF
}

# ============================================================================
# Example 7: Download Build Artifact
# ============================================================================

example_download_artifact() {
    cat << 'EOF'
#!/bin/bash
# Download completed build from GCS

BUCKET="lfs-builds"
BUILD_ID="$1"
OUTPUT_DIR="${2:-.}"

if [ -z "$BUILD_ID" ]; then
    echo "Usage: $0 <build-id> [output-dir]"
    exit 1
fi

GCS_PATH="gs://$BUCKET/builds/$BUILD_ID/"

echo "Downloading from: $GCS_PATH"

# List available files
echo ""
echo "Available files:"
gsutil ls "$GCS_PATH"

# Download all files
echo ""
echo "Downloading to: $OUTPUT_DIR"
gsutil -m cp -r "$GCS_PATH" "$OUTPUT_DIR/"

echo "Download complete!"
EOF
}

# ============================================================================
# Example 8: View Build Logs
# ============================================================================

example_view_logs() {
    cat << 'EOF'
#!/bin/bash
# View build logs from Firestore

PROJECT_ID="my-gcp-project"
BUILD_ID="$1"
LOG_TYPE="${2:-all}"

if [ -z "$BUILD_ID" ]; then
    echo "Usage: $0 <build-id> [all|error|chapter5|chapter6]"
    exit 1
fi

case "$LOG_TYPE" in
    error)
        gcloud firestore documents list "builds/$BUILD_ID/logs" \
            --project="$PROJECT_ID" \
            --filter="fields.status.stringValue=error" \
            --format=json | jq '.documents[] | .fields'
        ;;
    chapter5)
        gcloud firestore documents list "builds/$BUILD_ID/logs" \
            --project="$PROJECT_ID" \
            --filter="fields.stage.stringValue=chapter5" \
            --format=json | jq '.documents[] | .fields'
        ;;
    chapter6)
        gcloud firestore documents list "builds/$BUILD_ID/logs" \
            --project="$PROJECT_ID" \
            --filter="fields.stage.stringValue=chapter6" \
            --format=json | jq '.documents[] | .fields'
        ;;
    all)
        gcloud firestore documents list "builds/$BUILD_ID/logs" \
            --project="$PROJECT_ID" \
            --format=json | jq '.documents[] | .fields | {timestamp, stage, status, message}'
        ;;
    *)
        echo "Unknown log type: $LOG_TYPE"
        exit 1
        ;;
esac
EOF
}

# ============================================================================
# Example 9: Setup & First Build
# ============================================================================

example_first_time_setup() {
    cat << 'EOF'
#!/bin/bash
# Complete setup for first-time use

set -e

echo "LFS Build System - First Time Setup"
echo "===================================="
echo ""

# Step 1: Check prerequisites
echo "Step 1: Checking prerequisites..."
for cmd in docker gcloud gsutil node npm; do
    if ! command -v $cmd &> /dev/null; then
        echo "ERROR: $cmd not found. Please install it first."
        exit 1
    fi
    echo "  ✓ $cmd"
done

# Step 2: Create directories
echo ""
echo "Step 2: Creating directories..."
mkdir -p logs output sources lfs docs
echo "  ✓ Directories created"

# Step 3: Install helper dependencies
echo ""
echo "Step 3: Installing Node.js dependencies..."
cd helpers && npm install && cd ..
echo "  ✓ Dependencies installed"

# Step 4: Build Docker image
echo ""
echo "Step 4: Building Docker image..."
docker build -t lfs-builder:latest . || {
    echo "ERROR: Docker build failed"
    exit 1
}
echo "  ✓ Docker image built"

# Step 5: Test with local build
echo ""
echo "Step 5: Testing with local build..."
export LFS_CONFIG_JSON='{"buildId":"setup-test","lfsVersion":"12.0"}'
timeout 30 ./lfs-build.sh || echo "  ⚠ Build timeout (expected for test)"
echo "  ✓ Script works"

echo ""
echo "Setup complete! Ready to use."
echo ""
echo "Next steps:"
echo "  1. Update lfs-build.config with your GCP settings"
echo "  2. Set GOOGLE_APPLICATION_CREDENTIALS environment variable"
echo "  3. Run: ./lfs-build.sh"
EOF
}

# ============================================================================
# Example 10: CI/CD Integration
# ============================================================================

example_cicd_integration() {
    cat << 'EOF'
#!/bin/bash
# Example GitHub Actions workflow integration

cat > .github/workflows/lfs-build.yml << 'GITHUB_EOF'
name: LFS Automated Build

on:
  workflow_dispatch:
    inputs:
      lfs_version:
        description: 'LFS Version'
        required: true
        default: '12.0'

jobs:
  build:
    runs-on: ubuntu-latest
    
    permissions:
      contents: read
      id-token: write
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v1
        with:
          project_id: ${{ secrets.GCP_PROJECT_ID }}
          credentials_json: ${{ secrets.GCP_SA_KEY }}
      
      - name: Build Docker image
        run: docker build -t gcr.io/${{ secrets.GCP_PROJECT_ID }}/lfs-builder .
      
      - name: Push to GCR
        run: docker push gcr.io/${{ secrets.GCP_PROJECT_ID }}/lfs-builder
      
      - name: Submit build job
        run: |
          BUILD_ID=$(date +%s)
          CONFIG="{\"buildId\":\"github-$BUILD_ID\",\"lfsVersion\":\"${{ github.event.inputs.lfs_version }}\"}"
          
          gcloud run jobs execute lfs-builder \
            --set-env-vars "LFS_CONFIG_JSON=$CONFIG" \
            --no-wait
GITHUB_EOF

echo "Created .github/workflows/lfs-build.yml"
EOF
}

# ============================================================================
# Main: Display Examples
# ============================================================================

echo "LFS Build Script - Usage Examples"
echo "=================================="
echo ""
echo "Available examples:"
echo "  1. Simple local build"
echo "  2. Docker build with volumes"
echo "  3. Cloud Run job submission"
echo "  4. Batch build submission"
echo "  5. Debug build with debug logging"
echo "  6. Monitor build status"
echo "  7. Download build artifact"
echo "  8. View build logs"
echo "  9. First-time setup"
echo "  10. CI/CD integration"
echo ""

# If argument provided, show specific example
if [ -n "${1:-}" ]; then
    example_func="example_$(echo "simple_local docker_build cloud_run_submission batch_builds debug_build monitor_status download_artifact view_logs first_time_setup cicd_integration" | awk '{print $'$1'}')"
    
    if type -t "$example_func" &>/dev/null; then
        echo "=== Example $1 ==="
        echo ""
        $example_func
        echo ""
    else
        echo "Unknown example: $1"
        exit 1
    fi
else
    echo "Usage: $0 <example-number>"
    echo ""
    echo "Example:"
    echo "  $0 1  # Show simple local build example"
fi
