#!/bin/bash

# LFS Automated Builder - Cloud Run Job Trigger Script
# This script demonstrates how to trigger the Cloud Run Job from Cloud Functions

# Configuration
PROJECT_ID="${PROJECT_ID:-your-project-id}"
CLOUD_RUN_JOB_NAME="${CLOUD_RUN_JOB_NAME:-lfs-builder}"
REGION="${REGION:-us-central1}"

# Function to trigger Cloud Run Job
trigger_cloud_run_job() {
    local build_id=$1
    local lfs_version=$2
    local email=$3
    
    echo "Triggering Cloud Run Job: $CLOUD_RUN_JOB_NAME"
    echo "Build ID: $build_id"
    echo "LFS Version: $lfs_version"
    
    # Execute the Cloud Run Job
    gcloud run jobs execute "$CLOUD_RUN_JOB_NAME" \
        --project "$PROJECT_ID" \
        --region "$REGION" \
        --env LFS_BUILD_ID="$build_id" \
        --env LFS_VERSION="$lfs_version" \
        --env BUILD_EMAIL="$email" \
        --no-wait
    
    if [ $? -eq 0 ]; then
        echo "Job triggered successfully"
        return 0
    else
        echo "Failed to trigger job"
        return 1
    fi
}

# Example usage
if [ $# -lt 2 ]; then
    echo "Usage: $0 <build_id> <lfs_version> [email]"
    exit 1
fi

trigger_cloud_run_job "$1" "$2" "${3:-noemail@example.com}"
