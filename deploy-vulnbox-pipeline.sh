#!/bin/bash
# deploy-vulnbox-pipeline.sh
# Full deployment of the VulnBox builder pipeline to GCP
# Run this AFTER billing is enabled on project alfs-bd1e0
set -e

PROJECT_ID="alfs-bd1e0"
REGION="us-central1"
REPO_NAME="vulnbox-builds"
IMAGE_NAME="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/vulnbox-builder"
JOB_NAME="vulnbox-builder"
GCS_BUCKET="alfs-bd1e0-builds"
SA_EMAIL="firebase-adminsdk-fbsvc@${PROJECT_ID}.iam.gserviceaccount.com"

echo "=================================================="
echo "VULNBOX PIPELINE FULL DEPLOYMENT"
echo "   Project: $PROJECT_ID"
echo "   Region:  $REGION"
echo "   Image:   $IMAGE_NAME"
echo "=================================================="

echo ""
echo "[1/7] Setting active GCP project..."
gcloud config set project $PROJECT_ID
echo "OK: Project set to $PROJECT_ID"

echo ""
echo "[2/7] Enabling required GCP APIs..."
gcloud services enable \
    run.googleapis.com \
    artifactregistry.googleapis.com \
    cloudbuild.googleapis.com \
    storage.googleapis.com \
    firestore.googleapis.com \
    --project $PROJECT_ID
echo "OK: APIs enabled"

echo ""
echo "[3/7] Setting up Artifact Registry repository..."
if gcloud artifacts repositories describe $REPO_NAME \
    --location=$REGION \
    --project=$PROJECT_ID 2>/dev/null; then
    echo "   Repository already exists, skipping."
else
    gcloud artifacts repositories create $REPO_NAME \
        --repository-format=docker \
        --location=$REGION \
        --description="VulnBox LFS builder images" \
        --project=$PROJECT_ID
    echo "OK: Repository created"
fi

echo ""
echo "[4/7] Configuring Docker authentication..."
gcloud auth configure-docker ${REGION}-docker.pkg.dev --quiet
echo "OK: Docker authenticated"

echo ""
echo "[5/7] Building and pushing VulnBox Docker image..."
IMAGE_TAG="${IMAGE_NAME}:latest"
docker build -f Dockerfile.vulnbox -t "$IMAGE_TAG" .
docker push "$IMAGE_TAG"
echo "OK: Image pushed: $IMAGE_TAG"

echo ""
echo "[6/7] Ensuring GCS bucket exists..."
if gcloud storage buckets describe "gs://$GCS_BUCKET" --project=$PROJECT_ID 2>/dev/null; then
    echo "   Bucket already exists, skipping."
else
    gcloud storage buckets create "gs://$GCS_BUCKET" \
        --location=$REGION \
        --project=$PROJECT_ID \
        --uniform-bucket-level-access
    echo "OK: Bucket created"
fi
gcloud storage buckets add-iam-policy-binding "gs://$GCS_BUCKET" \
    --member="allUsers" \
    --role="roles/storage.objectViewer" \
    --project=$PROJECT_ID 2>/dev/null || true

echo ""
echo "[7/7] Creating Cloud Run Job '$JOB_NAME'..."
if gcloud run jobs describe $JOB_NAME --region=$REGION --project=$PROJECT_ID 2>/dev/null; then
    gcloud run jobs update $JOB_NAME \
        --image "$IMAGE_TAG" \
        --region=$REGION \
        --project=$PROJECT_ID \
        --memory=8Gi \
        --cpu=4 \
        --task-timeout=3600 \
        --max-retries=0 \
        --set-env-vars "PROJECT_ID=$PROJECT_ID,GCS_BUCKET=$GCS_BUCKET,HELPER_SCRIPTS_DIR=/app/helpers,LFS_MNT=/mnt/lfs,OUTPUT_DIR=/output"
else
    gcloud run jobs create $JOB_NAME \
        --image "$IMAGE_TAG" \
        --region=$REGION \
        --project=$PROJECT_ID \
        --memory=8Gi \
        --cpu=4 \
        --task-timeout=3600 \
        --max-retries=0 \
        --service-account="$SA_EMAIL" \
        --set-env-vars "PROJECT_ID=$PROJECT_ID,GCS_BUCKET=$GCS_BUCKET,HELPER_SCRIPTS_DIR=/app/helpers,LFS_MNT=/mnt/lfs,OUTPUT_DIR=/output"
fi
echo "OK: Cloud Run Job '$JOB_NAME' ready"

echo ""
echo "Granting service account permissions..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/storage.objectAdmin" --quiet 2>/dev/null || true
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/datastore.user" --quiet 2>/dev/null || true
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/run.invoker" --quiet 2>/dev/null || true
echo "OK: IAM permissions granted"

echo ""
echo "=================================================="
echo "VULNBOX PIPELINE FULLY DEPLOYED!"
echo ""
echo "Docker Image:  $IMAGE_TAG"
echo "Cloud Run Job: $JOB_NAME (region: $REGION)"
echo "GCS Bucket:    gs://$GCS_BUCKET"
echo ""
echo "Next step - Deploy Firebase Functions:"
echo "  firebase deploy --only functions --project $PROJECT_ID"
echo "=================================================="
