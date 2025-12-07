# Cloud Function to Cloud Run Deployment Guide

## 🎯 Complete End-to-End Setup

This guide walks you through deploying the Cloud Function that triggers Cloud Run jobs.

---

## 📋 Prerequisites

✅ GCP project created  
✅ Cloud Functions enabled  
✅ Cloud Run enabled  
✅ Firebase project initialized  
✅ Docker image pushed to Container Registry  

---

## 🚀 Step 1: Set Up Cloud Run Job

### 1.1 Create Service Account for Cloud Run Job

```bash
PROJECT_ID=lfs-automated-builder

# Create service account
gcloud iam service-accounts create lfs-builder \
    --display-name="LFS Builder Service Account" \
    --project=$PROJECT_ID

# Verify
gcloud iam service-accounts list --project=$PROJECT_ID
```

### 1.2 Grant Permissions to Service Account

```bash
PROJECT_ID=lfs-automated-builder
SERVICE_ACCOUNT=lfs-builder@${PROJECT_ID}.iam.gserviceaccount.com

# Firestore access
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member=serviceAccount:$SERVICE_ACCOUNT \
    --role=roles/datastore.user

# Cloud Storage access
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member=serviceAccount:$SERVICE_ACCOUNT \
    --role=roles/storage.objectAdmin

# Cloud Logging access
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member=serviceAccount:$SERVICE_ACCOUNT \
    --role=roles/logging.logWriter

# Verify
gcloud projects get-iam-policy $PROJECT_ID \
    --flatten="bindings[].members" \
    --filter="bindings.members:serviceAccount:$SERVICE_ACCOUNT"
```

### 1.3 Create Cloud Run Job

```bash
PROJECT_ID=lfs-automated-builder
REGION=us-east1
SERVICE_ACCOUNT=lfs-builder@${PROJECT_ID}.iam.gserviceaccount.com
IMAGE=gcr.io/${PROJECT_ID}/lfs-builder:latest

# Create the job
gcloud run jobs create lfs-builder \
    --project=$PROJECT_ID \
    --region=$REGION \
    --image=$IMAGE \
    --service-account=$SERVICE_ACCOUNT \
    --memory=4Gi \
    --cpu=2 \
    --timeout=3600 \
    --max-retries=1 \
    --no-iam-bindings

# Verify
gcloud run jobs describe lfs-builder \
    --project=$PROJECT_ID \
    --region=$REGION
```

**Parameters Explained**:
- `--memory=4Gi` - 4GB RAM for build tools
- `--cpu=2` - 2 CPUs for parallel compilation
- `--timeout=3600` - 1 hour timeout
- `--max-retries=1` - Don't retry if failed
- `--no-iam-bindings` - No public access

---

## 🛠️ Step 2: Deploy Cloud Function

### 2.1 Prepare functions/index.js

The file is already updated. Verify it contains:

```bash
# Check if file has Cloud Run imports
grep "@google-cloud/run" functions/index.js

# Check if timeout is 300 seconds
grep "timeoutSeconds: 300" functions/index.js
```

### 2.2 Update functions/package.json

Verify the dependency is added:

```bash
# Check if @google-cloud/run is in dependencies
grep "@google-cloud/run" functions/package.json
```

### 2.3 Install Dependencies

```bash
cd functions
npm install
cd ..

# Verify installation
ls functions/node_modules/@google-cloud/run
```

### 2.4 Set Firebase Configuration

```bash
PROJECT_ID=lfs-automated-builder
REGION=us-east1
JOB_NAME=lfs-builder
BUCKET_NAME=lfs-builds

# Set via Firebase config
firebase functions:config:set \
    gcp.project_id="$PROJECT_ID" \
    cloudrun.region="$REGION" \
    cloudrun.job_name="$JOB_NAME" \
    storage.bucket="$BUCKET_NAME"

# Verify
firebase functions:config:get
```

### 2.5 Deploy Cloud Function

```bash
# Deploy functions only
firebase deploy --only functions

# Or with detailed logging
firebase deploy --only functions --debug

# Watch deployment
firebase deploy --only functions --debug --verbose
```

**Expected Output**:
```
...
✔ Deploy complete!

Function URL: https://region-projectid.cloudfunctions.net/onBuildSubmitted
```

### 2.6 Verify Deployment

```bash
# List deployed functions
gcloud functions list --project=$PROJECT_ID

# Get function details
gcloud functions describe onBuildSubmitted \
    --region=us-east1 \
    --project=$PROJECT_ID

# View function logs
firebase functions:log
```

---

## 🔐 Step 3: Configure IAM Permissions

### 3.1 Grant Cloud Functions Service Account Permissions

```bash
PROJECT_ID=lfs-automated-builder
FUNCTIONS_SERVICE_ACCOUNT=cloud-functions@${PROJECT_ID}.iam.gserviceaccount.com

# 1. Firestore permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member=serviceAccount:$FUNCTIONS_SERVICE_ACCOUNT \
    --role=roles/datastore.user \
    --project=$PROJECT_ID

# 2. Cloud Run permissions (to create executions)
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member=serviceAccount:$FUNCTIONS_SERVICE_ACCOUNT \
    --role=roles/run.admin \
    --project=$PROJECT_ID

# 3. Cloud Logging permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member=serviceAccount:$FUNCTIONS_SERVICE_ACCOUNT \
    --role=roles/logging.logWriter \
    --project=$PROJECT_ID

# 4. Service Account User (to run as lfs-builder)
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member=serviceAccount:$FUNCTIONS_SERVICE_ACCOUNT \
    --role=roles/iam.serviceAccountUser \
    --project=$PROJECT_ID

# Verify all permissions
gcloud projects get-iam-policy $PROJECT_ID \
    --flatten="bindings[].members" \
    --filter="bindings.members:serviceAccount:$FUNCTIONS_SERVICE_ACCOUNT" \
    --format=json
```

### 3.2 Verify Cloud Run Job Permissions

```bash
PROJECT_ID=lfs-automated-builder
JOB_NAME=lfs-builder
REGION=us-east1

# Check job exists and is accessible
gcloud run jobs describe $JOB_NAME \
    --region=$REGION \
    --project=$PROJECT_ID

# Try to create test execution (will verify permissions)
gcloud run jobs execute $JOB_NAME \
    --region=$REGION \
    --project=$PROJECT_ID \
    --wait \
    --async
```

---

## 🧪 Step 4: Testing the Integration

### 4.1 Test 1: Verify Function Deployment

```bash
# Check function exists and is deployed
gcloud functions describe onBuildSubmitted \
    --region=us-east1 \
    --project=lfs-automated-builder

# Expected output should show:
# - runtime: nodejs18
# - entryPoint: onBuildSubmitted
# - triggers.eventTrigger.resource: projects/.../documents/builds/{buildId}
```

### 4.2 Test 2: Create Test Build Document

```bash
# Use Firebase CLI to add a test document
firebase firestore:bulk-import --project=lfs-automated-builder \
    --import-path=test-build.json

# Or use Python:
python3 << 'EOF'
from firebase_admin import initialize_app, firestore
import json
import uuid

# Initialize Firebase
initialize_app()
db = firestore.client()

# Create test build
build_id = str(uuid.uuid4())
db.collection('builds').document(build_id).set({
    'buildId': build_id,
    'userId': 'test-user-123',
    'projectName': 'test-lfs-build',
    'lfsVersion': '12.0',
    'email': 'test@example.com',
    'buildOptions': {
        'includeGlibcDev': True,
        'includeKernel': False,
        'optimizeSize': True
    },
    'additionalNotes': 'Test build',
    'status': 'QUEUED',
    'progress': 0,
    'createdAt': firestore.SERVER_TIMESTAMP,
})

print(f"Test build created: {build_id}")
EOF
```

### 4.3 Test 3: Check Function Logs

```bash
# View recent function logs
firebase functions:log --limit=50

# Or use Cloud Logging
gcloud functions logs read onBuildSubmitted \
    --region=us-east1 \
    --limit=50 \
    --project=lfs-automated-builder

# Watch logs in real-time
gcloud functions logs read onBuildSubmitted \
    --region=us-east1 \
    --limit=50 \
    --project=lfs-automated-builder \
    --follow
```

### 4.4 Test 4: Verify Cloud Run Job Started

```bash
# List recent executions
gcloud run jobs list-executions lfs-builder \
    --region=us-east1 \
    --project=lfs-automated-builder \
    --limit=10

# Get details of latest execution
gcloud run jobs describe lfs-builder \
    --region=us-east1 \
    --project=lfs-automated-builder

# View execution logs
gcloud run jobs log lfs-builder \
    --region=us-east1 \
    --project=lfs-automated-builder \
    --limit=50
```

### 4.5 Test 5: Check Firestore Updates

```python
from firebase_admin import initialize_app, firestore

initialize_app()
db = firestore.client()

# Get the test build document
doc = db.collection('builds').document('<BUILD_ID>').get()
print(doc.to_dict())

# Should show:
# - status: RUNNING (updated by function)
# - cloudRunExecution: {...} (added by function)
# - startedAt: timestamp
```

---

## 📊 Monitoring & Verification

### Cloud Function Metrics

```bash
# View function execution statistics
gcloud monitoring time-series list \
    --filter='resource.type="cloud_function"' \
    --interval-start-time='2025-11-05T00:00:00Z' \
    --project=lfs-automated-builder

# View error rate
gcloud logging read "resource.type=cloud_function AND severity=ERROR" \
    --limit=50 \
    --project=lfs-automated-builder
```

### Cloud Run Metrics

```bash
# View job execution statistics
gcloud run jobs list-executions lfs-builder \
    --region=us-east1 \
    --project=lfs-automated-builder \
    --format=json | jq '.[] | {name, state, startTime, completeTime}'

# View failed executions
gcloud logging read "resource.labels.job_name=lfs-builder AND severity=ERROR" \
    --limit=50 \
    --project=lfs-automated-builder
```

### Firestore Updates

Check that documents are being updated:

```javascript
// In browser console (Firebase)
db.collection('builds').limit(5).get().then(snap => {
    snap.forEach(doc => {
        console.log(doc.id, doc.data().status, doc.data().cloudRunExecution);
    });
});
```

---

## 🚨 Troubleshooting

### Problem: Function Not Triggering

**Symptoms**: Build document created but function not called

**Solutions**:
```bash
# 1. Check function is deployed
firebase functions:list

# 2. Check Firestore trigger is set
gcloud functions describe onBuildSubmitted --region=us-east1

# 3. Enable Cloud Pub/Sub notifications
gcloud pubsub topics create cloud-firestore-builds

# 4. Check function logs for errors
firebase functions:log --error-only
```

### Problem: "Permission Denied" on Cloud Run

**Symptoms**:
```
Error: Permission denied to execute gRPC call
```

**Solution**:
```bash
# Grant Cloud Functions service account permission to create executions
gcloud projects add-iam-policy-binding PROJECT_ID \
    --member=serviceAccount:cloud-functions@PROJECT_ID.iam.gserviceaccount.com \
    --role=roles/run.admin
```

### Problem: "Cloud Run Job Not Found"

**Symptoms**:
```
Error: Could not find job lfs-builder in region us-east1
```

**Solution**:
```bash
# Verify job exists
gcloud run jobs list --region=us-east1

# Create job if missing
gcloud run jobs create lfs-builder \
    --image=gcr.io/PROJECT_ID/lfs-builder:latest \
    --region=us-east1
```

### Problem: LFS_CONFIG_JSON Not Received

**Symptoms**: Container doesn't have environment variable

**Solution**:
```bash
# Check function is passing environment variables
gcloud functions logs read onBuildSubmitted --limit=20 | grep LFS_CONFIG_JSON

# Verify config is being prepared (should see in logs)
firebase functions:log | grep "Config JSON prepared"

# Test manually
node -e "
const config = {buildId: 'test', projectName: 'test'};
console.log(JSON.stringify(config));
"
```

### Problem: Function Timeout

**Symptoms**:
```
Error: Function execution took 301 seconds, exceeding timeout of 60
```

**Solution**:
Already fixed in the code! Verify:
```bash
# Check timeout is set to 300 seconds
grep "timeoutSeconds: 300" functions/index.js

# If not, update and redeploy
firebase deploy --only functions
```

---

## 📈 Performance Tuning

### Optimize Cold Start

```javascript
// In functions/index.js
// Move heavy imports outside function
const { ExecutionsClient } = require('@google-cloud/run');
const executionsClient = new ExecutionsClient();  // Initialized at module load

// Inside function, just use it (faster than creating new instance)
```

### Scale Function Instances

```bash
# Set max instances for concurrent builds
gcloud functions deploy onBuildSubmitted \
    --max-instances=100 \
    --region=us-east1

# Check current scaling settings
gcloud functions describe onBuildSubmitted \
    --region=us-east1 \
    --format='value(maxInstances)'
```

### Monitor Memory Usage

```bash
# Check memory allocation
gcloud functions describe onBuildSubmitted --region=us-east1 --format='value(runtime.memoryMB)'

# Increase if needed (for faster startup)
gcloud functions deploy onBuildSubmitted \
    --memory=512MB \
    --region=us-east1
```

---

## 📋 Deployment Checklist

### Before Deployment
- [ ] Cloud Run Job created and tested
- [ ] Service account created with permissions
- [ ] Docker image pushed to registry
- [ ] Firebase project initialized
- [ ] Firestore database created

### During Deployment
- [ ] package.json updated with `@google-cloud/run`
- [ ] npm install run in functions/
- [ ] Environment variables configured
- [ ] Function deployed successfully
- [ ] No deployment errors in output

### After Deployment
- [ ] Function listed in gcloud functions list
- [ ] Test build document triggers function
- [ ] Function logs show successful execution
- [ ] Cloud Run job execution created
- [ ] Firestore document updated with execution details
- [ ] No errors in Cloud Logging

### Verification
- [ ] Create test build via form
- [ ] Check function triggered
- [ ] Check Cloud Run job started
- [ ] Check Firestore updated
- [ ] Check GCS upload started
- [ ] Check logs for any errors

---

## 🔗 Integration Verification

### End-to-End Test

```bash
# 1. Create test build
curl -X POST https://your-firebase-app.firebaseapp.com/addBuild \
    -H "Content-Type: application/json" \
    -d '{
        "projectName": "test",
        "lfsVersion": "12.0",
        "email": "test@example.com"
    }'

# 2. Check function triggered (wait 10-20 seconds)
firebase functions:log

# 3. Check Cloud Run job created
gcloud run jobs list-executions lfs-builder --region=us-east1

# 4. Check Firestore updated
firebase firestore:get builds/<BUILD_ID>

# 5. Check Cloud Run logs
gcloud run jobs log lfs-builder --region=us-east1
```

---

## 📞 Support & Debug Commands

### Essential Commands Reference

```bash
# Functions
firebase functions:list
firebase functions:log --error-only
gcloud functions describe onBuildSubmitted --region=us-east1

# Cloud Run
gcloud run jobs list --region=us-east1
gcloud run jobs list-executions lfs-builder --region=us-east1
gcloud run jobs log lfs-builder --region=us-east1

# IAM
gcloud projects get-iam-policy PROJECT_ID --flatten="bindings[].members"

# Firestore
firebase firestore:get builds/<BUILD_ID>

# Logs
gcloud logging read "resource.type=cloud_function" --limit=50
gcloud logging read "resource.type=cloud_run_job" --limit=50
```

---

**Status**: ✅ Production Ready  
**Last Updated**: November 5, 2025  
**Version**: 1.0.0
