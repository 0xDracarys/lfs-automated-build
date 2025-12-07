# 🚀 Manual Setup Checklist - What You Need to Do NOW

## ⚠️ CRITICAL: Do These FIRST (Required Before Anything Else)

### 1️⃣ Replace YOUR_PROJECT_ID in Code/Config

These are hardcoded for now. Replace them with YOUR actual Google Cloud Project ID:

#### In `functions/index.js` (Lines 8-10)
```javascript
// CHANGE THIS:
const projectId = process.env.GCP_PROJECT_ID || 'lfs-automated-builder';
const cloudRunJobName = process.env.CLOUD_RUN_JOB_NAME || 'lfs-builder';
const cloudRunRegion = process.env.CLOUD_RUN_REGION || 'us-east1';

// TO THIS (example):
const projectId = process.env.GCP_PROJECT_ID || 'my-actual-project-id';
const cloudRunJobName = process.env.CLOUD_RUN_JOB_NAME || 'lfs-builder';
const cloudRunRegion = process.env.CLOUD_RUN_REGION || 'us-central1';  // Your region
```

**Steps to find your project ID**:
```bash
gcloud config get-value project
# Output: my-actual-project-id
```

#### In `functions/index.js` (Line 110-120 area - Container Image)
Find where it says `gcr.io/lfs-automated-builder/lfs-builder:latest` and update:
```bash
# FIND: gcr.io/lfs-automated-builder/lfs-builder:latest
# REPLACE WITH: gcr.io/YOUR_PROJECT_ID/lfs-builder:latest
```

---

## 📋 Phase 1: Google Cloud Setup (5-10 minutes)

### ✅ 1. Create Cloud Run Job

```bash
# Set your variables
PROJECT_ID="your-actual-project-id"  # From: gcloud config get-value project
REGION="us-east1"                     # or your preferred region
SERVICE_ACCOUNT="lfs-builder"
IMAGE="gcr.io/${PROJECT_ID}/lfs-builder:latest"

# Create service account (if not exists)
gcloud iam service-accounts create lfs-builder \
    --display-name="LFS Builder Service Account" \
    --project=$PROJECT_ID

# Grant permissions to service account
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member=serviceAccount:${SERVICE_ACCOUNT}@${PROJECT_ID}.iam.gserviceaccount.com \
    --role=roles/datastore.user

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member=serviceAccount:${SERVICE_ACCOUNT}@${PROJECT_ID}.iam.gserviceaccount.com \
    --role=roles/storage.objectAdmin

# Create the Cloud Run Job
gcloud run jobs create lfs-builder \
    --project=$PROJECT_ID \
    --region=$REGION \
    --image=$IMAGE \
    --service-account=${SERVICE_ACCOUNT}@${PROJECT_ID}.iam.gserviceaccount.com \
    --memory=4Gi \
    --cpu=2 \
    --timeout=3600

# Verify it was created
gcloud run jobs describe lfs-builder \
    --project=$PROJECT_ID \
    --region=$REGION
```

**✓ Success**: You see job details without errors

---

### ✅ 2. Grant Cloud Function Service Account Permissions

```bash
PROJECT_ID="your-actual-project-id"

# Get Cloud Functions default service account name
FUNCTIONS_SA="cloud-functions@${PROJECT_ID}.iam.gserviceaccount.com"

# Grant role to create Cloud Run executions
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member=serviceAccount:$FUNCTIONS_SA \
    --role=roles/run.admin

# Grant Firestore access
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member=serviceAccount:$FUNCTIONS_SA \
    --role=roles/datastore.user

# Grant Cloud Logging access
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member=serviceAccount:$FUNCTIONS_SA \
    --role=roles/logging.logWriter

# Verify permissions
gcloud projects get-iam-policy $PROJECT_ID \
    --flatten="bindings[].members" \
    --filter="bindings.members:serviceAccount:$FUNCTIONS_SA"
```

**✓ Success**: Command shows at least these 3 roles:
- `roles/run.admin`
- `roles/datastore.user`
- `roles/logging.logWriter`

---

## 🔧 Phase 2: Firebase Configuration (5 minutes)

### ✅ 3. Configure Firebase Environment Variables

```bash
PROJECT_ID="your-actual-project-id"
REGION="us-east1"
BUCKET_NAME="gs://${PROJECT_ID}-lfs-builds"

# Set Firebase config
firebase functions:config:set \
    gcp.project_id="$PROJECT_ID" \
    cloudrun.region="$REGION" \
    cloudrun.job_name="lfs-builder" \
    storage.bucket="$BUCKET_NAME" \
    --project=$PROJECT_ID

# Verify it was set
firebase functions:config:get --project=$PROJECT_ID
```

**✓ Success**: Output shows all 4 config values

---

## 📦 Phase 3: Install Dependencies (2-3 minutes)

### ✅ 4. Install Cloud Function Dependencies

```bash
# Navigate to functions directory
cd "c:\Users\Chintu\Documents\Dev Zone\Dev work web\lfs-automated\functions"

# Install npm dependencies
npm install

# This will install:
# - firebase-admin
# - firebase-functions
# - @google-cloud/run  (← NEW)

# Verify @google-cloud/run is installed
npm list @google-cloud/run

# You should see: @google-cloud/run@1.1.0 (or similar)
```

**✓ Success**: 
- No errors during `npm install`
- `npm list @google-cloud/run` shows the package installed
- `node_modules/@google-cloud/run/` folder exists

---

## 🚀 Phase 4: Deploy to Firebase (3-5 minutes)

### ✅ 5. Deploy Cloud Function

```bash
PROJECT_ID="your-actual-project-id"

# From project root directory
firebase deploy --only functions --project=$PROJECT_ID

# This will:
# - Package the functions code
# - Deploy to Firebase
# - Create the Firestore trigger
# - Set function timeout to 300 seconds
```

**Expected Output**:
```
✔ Deploy complete!

Function URL: https://us-east1-PROJECT_ID.cloudfunctions.net/onBuildSubmitted
Function URL: https://us-east1-PROJECT_ID.cloudfunctions.net/onExecutionStatusChange
```

**✓ Success**: 
- No errors in deployment
- Both functions listed in output
- Deployment says "✔ Deploy complete!"

---

## ✅ Phase 5: Verify Everything Works (5 minutes)

### ✅ 6. Test the Integration

```bash
# 1. Check function is deployed
firebase functions:list --project=$PROJECT_ID

# 2. Check Cloud Run job exists
gcloud run jobs list --region=us-east1 --project=$PROJECT_ID

# 3. View function logs (should be empty now)
firebase functions:log --project=$PROJECT_ID

# 4. Create test build by visiting your website
# Go to: https://YOUR_FIREBASE_HOSTING_URL
# Fill the form and submit

# 5. After 10-20 seconds, check if function triggered
firebase functions:log --limit=50 --project=$PROJECT_ID

# Should see logs like:
# "New build submitted: xxxxxxx-xxxx-xxxx..."
# "Starting Cloud Run Job Execution..."
```

### ✅ 7. Check Cloud Run Job Started

```bash
# View executions started
gcloud run jobs list-executions lfs-builder \
    --region=us-east1 \
    --project=$PROJECT_ID

# Should show at least one execution

# Get execution details
gcloud run jobs describe lfs-builder \
    --region=us-east1 \
    --project=$PROJECT_ID
```

---

## 📊 Phase 6: Monitor Everything (Ongoing)

### ✅ 8. Set Up Monitoring

```bash
# Watch function logs in real-time
firebase functions:log --follow --project=$PROJECT_ID

# In another terminal, watch Cloud Run logs
gcloud run jobs log lfs-builder \
    --region=us-east1 \
    --project=$PROJECT_ID \
    --follow \
    --limit=50

# Check Firestore for build documents
firebase firestore:get builds/ --project=$PROJECT_ID
```

---

## 🎯 Summary: What Happens When You Complete This

### Current Flow
```
1. User fills form on website
   ↓
2. Frontend creates build document in Firestore (/builds/{buildId})
   ↓
3. Cloud Function trigger fires (onBuildSubmitted)
   ↓
4. Function updates status to 'RUNNING'
   ↓
5. Function creates Cloud Run Job Execution
   ↓
6. Cloud Run container receives LFS_CONFIG_JSON
   ↓
7. lfs-build.sh script parses config and starts build
   ↓
8. Build output uploaded to GCS bucket
```

---

## ⏱️ Estimated Time

| Phase | Task | Time |
|-------|------|------|
| **CRITICAL** | Replace YOUR_PROJECT_ID | 2 min |
| **1** | Cloud Run Job Setup | 8 min |
| **2** | Firebase Config | 3 min |
| **3** | Install Dependencies | 3 min |
| **4** | Deploy to Firebase | 5 min |
| **5** | Verify Integration | 5 min |
| **TOTAL** | | **29 minutes** |

---

## 🔑 Key Variables You Need

Save these values somewhere safe - you'll need them repeatedly:

```bash
# Edit these with YOUR values
PROJECT_ID="your-actual-project-id"              # Get from: gcloud config get-value project
REGION="us-east1"                                 # Your GCP region
SERVICE_ACCOUNT="lfs-builder"                    # Name of service account
GCS_BUCKET="gs://${PROJECT_ID}-lfs-builds"      # Storage bucket
DOCKER_IMAGE="gcr.io/${PROJECT_ID}/lfs-builder:latest"  # Your container image
FIREBASE_PROJECT=$PROJECT_ID                     # Same as PROJECT_ID
```

---

## 🆘 If Something Goes Wrong

### Error: "Permission denied to execute gRPC call"
```bash
# Run this:
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member=serviceAccount:cloud-functions@${PROJECT_ID}.iam.gserviceaccount.com \
    --role=roles/run.admin
```

### Error: "Could not find job lfs-builder"
```bash
# The Cloud Run job doesn't exist. Create it:
gcloud run jobs create lfs-builder \
    --region=us-east1 \
    --image=gcr.io/${PROJECT_ID}/lfs-builder:latest \
    --project=$PROJECT_ID
```

### Error: "@google-cloud/run not found"
```bash
# The npm dependency isn't installed:
cd functions
npm install @google-cloud/run
```

### Function not triggered after creating build
```bash
# Check function logs:
firebase functions:log --error-only --project=$PROJECT_ID

# If empty, check Cloud Functions dashboard:
gcloud functions describe onBuildSubmitted \
    --region=us-east1 \
    --project=$PROJECT_ID
```

---

## ✓ Done Checklist

- [ ] Replaced `lfs-automated-builder` with your PROJECT_ID in `functions/index.js`
- [ ] Replaced `lfs-automated-builder` with your PROJECT_ID in Cloud Run image references
- [ ] Created Cloud Run job: `lfs-builder`
- [ ] Granted Cloud Functions service account `roles/run.admin`
- [ ] Granted Cloud Functions service account `roles/datastore.user`
- [ ] Granted Cloud Functions service account `roles/logging.logWriter`
- [ ] Set Firebase environment variables via `firebase functions:config:set`
- [ ] Ran `npm install` in functions directory
- [ ] Ran `firebase deploy --only functions`
- [ ] Verified functions deployed without errors
- [ ] Tested by creating a build document
- [ ] Checked function triggered (visible in logs)
- [ ] Verified Cloud Run job execution was created

---

**Status**: ✅ Action Items Identified  
**Priority**: 🔴 HIGH - Complete setup before deploying  
**Est. Time**: ~30 minutes total
