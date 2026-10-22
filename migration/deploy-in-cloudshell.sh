#!/usr/bin/env bash
# =====================================================================
# deploy-in-cloudshell.sh — rebuild the LFS cloud pipeline in a NEW project
# (mirrors alfs-bd1e0's June-2026 recipe, with both IAM/billing lessons baked in)
#
# Usage in Cloud Shell:
#   cd lfs-automated
#   export NEW_PROJECT_ID=<your-new-project-id>
#   bash migration/deploy-in-cloudshell.sh
# =====================================================================
set -euo pipefail

: "${NEW_PROJECT_ID:?Set NEW_PROJECT_ID first, e.g. export NEW_PROJECT_ID=lfs-thesis-123456}"
REGION="us-central1"
export REGION

say(){ echo; echo "=== $1 ==="; }

say "0. Project setup"
gcloud config set project "$NEW_PROJECT_ID"
PROJECT_NUMBER=$(gcloud projects describe "$NEW_PROJECT_ID" --format="value(projectNumber)")
RUN_AGENT="service-${PROJECT_NUMBER}@serverless-robot-prod.iam.gserviceaccount.com"
COMPUTE_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"
echo "project=$NEW_PROJECT_ID  number=$PROJECT_NUMBER"

say "1. BILLING PRECHECK (lesson #1 — refuse to continue if not active)"
ENABLED=$(gcloud billing projects describe "$NEW_PROJECT_ID" --format="value(billingEnabled)")
if [ "$ENABLED" != "True" ]; then
  echo "FATAL: billing is NOT enabled for this project. In Console: Billing → link/activate an account, then rerun."
  exit 1
fi
echo "billing enabled: OK"

say "2. Enable required APIs"
gcloud services enable run.googleapis.com cloudbuild.googleapis.com \
  artifactregistry.googleapis.com firestore.googleapis.com pubsub.googleapis.com \
  cloudfunctions.googleapis.com eventarc.googleapis.com storage.googleapis.com \
  logging.googleapis.com

say "3. Cloud Run service agent image-read grants (lesson #2 — unconditional)"
grant_agents() {
  gcloud projects add-iam-policy-binding "$NEW_PROJECT_ID" \
    --member="serviceAccount:${RUN_AGENT}" --role="roles/storage.objectViewer" 2>/dev/null
  gcloud projects add-iam-policy-binding "$NEW_PROJECT_ID" \
    --member="serviceAccount:${RUN_AGENT}" --role="roles/artifactregistry.reader" 2>/dev/null
}
if grant_agents; then echo "grants: OK"; else echo "grants: agent not provisioned yet — will retry at the end of the script"; fi

say "4. Create Firestore (Native) + builds bucket (if new)"
gcloud firestore databases create --location="$REGION" --type=firestore-native 2>/dev/null \
  && echo "firestore created" || echo "firestore: exists or skipped"
gcloud storage buckets create "gs://${NEW_PROJECT_ID}-builds" --location="$REGION" 2>/dev/null \
  && echo "bucket created" || echo "bucket: exists or skipped"

say "5. Build the builder image → Artifact Registry"
gcloud artifacts repositories create lfs --repository-format=docker --location="$REGION" \
  2>/dev/null && echo "AR repo 'lfs' created" || echo "AR repo: exists or skipped"
IMAGE="us-central1-docker.pkg.dev/${NEW_PROJECT_ID}/lfs/lfs-builder"
cat > /tmp/_build-lfs.yaml <<EOF
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build','-f','Dockerfile.cloudrun','-t','${IMAGE}:latest','.']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push','${IMAGE}:latest']
images: ['${IMAGE}:latest']
timeout: 2400s
options:
  machineType: 'E2_HIGHCPU_8'
  logging: CLOUD_LOGGING_ONLY
EOF
gcloud builds submit --config /tmp/_build-lfs.yaml .

say "6. Create the Cloud Run job (exact old spec: 8 vCPU / 32 GiB / 10 h / GEN2)"
gcloud run jobs create lfs-builder \
  --project "$NEW_PROJECT_ID" --region "$REGION" \
  --image "${IMAGE}:latest" \
  --service-account "$COMPUTE_SA" \
  --cpu 8 --memory 32Gi \
  --task-timeout 36000 \
  --max-retries 1 \
  --execution-environment gen2 \
  --set-env-vars "ENABLE_FULL_BUILD=true,GCS_BUCKET=${NEW_PROJECT_ID}-builds,PROJECT_ID=${NEW_PROJECT_ID}" \
  2>/dev/null && echo "job created" || echo "job: exists or skipped"

say "7. Deploy the trigger function (optional for smoke; needs one firebase login if fresh)"
( cd functions && npm install --no-audit --no-fund ) || true
if ! npx --yes firebase-tools deploy --only functions --project "$NEW_PROJECT_ID" --non-interactive; then
  echo ">>> function deploy needs auth: run 'npx --yes firebase-tools login' in Cloud Shell, then rerun script (steps are rerun-safe)."
fi
cd - >/dev/null 2>&1 || true

say "8. SMOKE TEST — run only if you approve (never runs a full build)"
grant_agents && echo "grants re-check: OK" || echo "grants: still not set — run the two add-iam-policy-binding commands in phase 3 again after the first execution attempt"
echo "--- agent roles (both must show condition-less) ---"
gcloud projects get-iam-policy "$NEW_PROJECT_ID" \
  --flatten="bindings[].members" \
  --filter="bindings.members:${RUN_AGENT}" \
  --format="table(bindings.role, bindings.condition)" || true
echo "  gcloud run jobs execute lfs-builder --region $REGION \\"
echo "    --update-env-vars ENABLE_FULL_BUILD=false,BUILD_ID=smoke-\$(date +%Y%m%d%H%M%S) --wait"
echo
echo "=== DONE. Project summary ==="
echo "image: $IMAGE"
echo "job:   $NEW_PROJECT_ID / $REGION / lfs-builder"
echo "db/bucket: Firestore $REGION, gs://$NEW_PROJECT_ID-builds"
