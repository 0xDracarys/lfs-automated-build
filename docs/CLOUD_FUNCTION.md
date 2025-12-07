# Cloud Function Implementation - Firestore to Cloud Run

## Overview

The updated `functions/index.js` implements a Firestore onCreate trigger that automatically starts a Cloud Run Job execution when a new build is submitted. The entire build configuration is passed to the Cloud Run Job via the `LFS_CONFIG_JSON` environment variable.

---

## 📋 Key Features

### 1. Firestore onCreate Trigger ✅
```javascript
exports.onBuildSubmitted = functions
    .runWith({
        timeoutSeconds: 300,  // 5-minute timeout
        memory: '256MB',
        maxInstances: 100,
    })
    .firestore
    .document('builds/{buildId}')
    .onCreate(async (snap, context) => { ... })
```

**Purpose**: Automatically triggered when a new document is created in `/builds/{buildId}`

**Timeout**: 300 seconds (5 minutes) to ensure Cloud Run job is registered

**Memory**: 256MB sufficient for API calls

**Max Instances**: 100 to prevent throttling during concurrent builds

### 2. Cloud Run V2 API Integration ✅
```javascript
const { ExecutionsClient } = require('@google-cloud/run');
const executionsClient = new ExecutionsClient();
```

**Library**: `@google-cloud/run` (V2 API)

**Functionality**: 
- Creates job executions
- Manages execution lifecycle
- Passes environment variables
- Tracks execution state

### 3. LFS_CONFIG_JSON Environment Variable ✅
```javascript
const lfsConfigJson = JSON.stringify({
    buildId: buildId,
    userId: buildData.userId,
    projectName: buildData.projectName,
    lfsVersion: buildData.lfsVersion,
    email: buildData.email,
    buildOptions: buildData.buildOptions || {},
    additionalNotes: buildData.additionalNotes || '',
    submittedAt: buildData.submittedAt,
    metadata: buildData.metadata || {},
    firestoreDocId: snap.ref.id,
});
```

**Structure**: Complete build document as JSON string

**Passed to Container**: Via `LFS_CONFIG_JSON` environment variable

**Usage in Container**: `lfs-build.sh` parses this using `jq` or Node.js

---

## 🔄 Execution Flow

```
┌─────────────────────────────────────────────────┐
│ 1. User Submits Build Form (Frontend)           │
│    → Creates document in /builds/{buildId}      │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│ 2. Firestore onCreate Trigger Fires             │
│    (functions/index.js)                         │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│ 3. Function Updates Build Status to 'RUNNING'   │
│    in Firestore                                 │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│ 4. Function Prepares LFS_CONFIG_JSON            │
│    (serialized build document)                  │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│ 5. Function Calls Cloud Run V2 API              │
│    executionsClient.createExecution()           │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│ 6. Cloud Run Job Starts                         │
│    Receives LFS_CONFIG_JSON as env var          │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│ 7. Container Runs lfs-build.sh                  │
│    Parses LFS_CONFIG_JSON                       │
│    Executes build stages                        │
│    Uploads artifacts to GCS                     │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│ 8. Cloud Function Updates Firestore             │
│    with execution details and status            │
└─────────────────────────────────────────────────┘
```

---

## 📝 Code Breakdown

### Configuration Constants

```javascript
const projectId = process.env.GCP_PROJECT_ID || 'lfs-automated-builder';
const cloudRunJobName = process.env.CLOUD_RUN_JOB_NAME || 'lfs-builder';
const cloudRunRegion = process.env.CLOUD_RUN_REGION || 'us-east1';
```

**Explanation**:
- `projectId`: Your GCP project ID
- `cloudRunJobName`: Name of the Cloud Run Job to execute
- `cloudRunRegion`: Region where the job runs

**Override via Environment Variables**: Set in Firebase Functions config

### Main Function: onBuildSubmitted

```javascript
exports.onBuildSubmitted = functions
    .runWith({
        timeoutSeconds: 300,  // 5 minutes for job registration
        memory: '256MB',
        maxInstances: 100,
    })
    .firestore
    .document('builds/{buildId}')
    .onCreate(async (snap, context) => {
        const buildData = snap.data();
        const buildId = context.params.buildId;
        
        // Process build...
    });
```

**Parameters**:
- `snap`: FirebaseFirestore.DocumentSnapshot (the new document)
- `context`: functions.EventContext (contains buildId from path)

**Key Points**:
- `timeoutSeconds: 300` - Critical for ensuring API call completes
- Triggered on document **creation** only
- Automatic retry on failure (up to 5 times)

### Build Configuration Preparation

```javascript
const lfsConfigJson = JSON.stringify({
    buildId: buildId,
    userId: buildData.userId,
    projectName: buildData.projectName,
    lfsVersion: buildData.lfsVersion,
    email: buildData.email,
    buildOptions: buildData.buildOptions || {},
    additionalNotes: buildData.additionalNotes || '',
    submittedAt: buildData.submittedAt,
    metadata: buildData.metadata || {},
    firestoreDocId: snap.ref.id,
});
```

**What it Contains**:
- Build ID (UUID from frontend)
- User ID (Firebase UID)
- Project name
- LFS version
- Build options (checkbox selections)
- Additional notes
- Metadata (browser info)
- Firestore document ID

**Size Consideration**: Typically 1-5 KB (well within env var limits)

### Cloud Run Execution Request

```javascript
const executionRequest = {
    parent: jobResourceName,
    execution: {
        environmentVariables: {
            LFS_CONFIG_JSON: lfsConfigJson,
            BUILD_ID: buildId,
            PROJECT_ID: projectId,
            GCS_BUCKET_NAME: process.env.GCS_BUCKET_NAME || 'lfs-builds',
            DEBUG: process.env.DEBUG || 'false',
        },
        labels: {
            'build-id': buildId,
            'user-email': buildData.email || 'unknown',
            'lfs-version': buildData.lfsVersion || 'unknown',
            'trigger': 'firestore-onCreate',
        },
        annotations: {
            'build-config': JSON.stringify({
                projectName: buildData.projectName,
                submittedAt: buildData.submittedAt,
            }),
        },
    },
};
```

**Environment Variables Passed**:
| Variable | Value | Used By |
|----------|-------|---------|
| `LFS_CONFIG_JSON` | Full build config | lfs-build.sh |
| `BUILD_ID` | UUID | Logging, status tracking |
| `PROJECT_ID` | GCP project ID | Firestore, GCS |
| `GCS_BUCKET_NAME` | Bucket name | Artifact upload |
| `DEBUG` | true/false | Verbose logging |

**Labels**: For filtering and organization in Cloud Run console

**Annotations**: For custom metadata tracking

### Creating the Execution

```javascript
const [execution] = await executionsClient.createExecution(executionRequest);

return {
    executionName: execution.name,
    createTime: execution.createTime?.toISOString ? execution.createTime.toISOString() : execution.createTime,
    uid: execution.uid,
    state: execution.state,
};
```

**What Happens**:
1. Cloud Run V2 API creates a new execution
2. Container starts with provided environment variables
3. Function returns execution details
4. Details saved to Firestore for tracking

---

## 🛠️ Setup & Configuration

### Step 1: Update package.json

Already done! The `@google-cloud/run` dependency is added:

```json
"dependencies": {
    "firebase-admin": "^11.11.0",
    "firebase-functions": "^4.7.0",
    "@google-cloud/run": "^1.1.0"
}
```

### Step 2: Install Dependencies

```bash
cd functions
npm install
```

This installs:
- `firebase-admin` - Firebase operations
- `firebase-functions` - Cloud Functions framework
- `@google-cloud/run` - Cloud Run V2 API client

### Step 3: Set Environment Variables

In `.env.local` or Firebase config:

```bash
# GCP Configuration
GCP_PROJECT_ID=lfs-automated-builder
CLOUD_RUN_JOB_NAME=lfs-builder
CLOUD_RUN_REGION=us-east1

# Optional
GCS_BUCKET_NAME=lfs-builds
DEBUG=false
```

Or via Firebase console:
```bash
firebase functions:config:set gcp.project_id="lfs-automated-builder"
firebase functions:config:set cloudrun.job_name="lfs-builder"
firebase functions:config:set cloudrun.region="us-east1"
```

### Step 4: Deploy Function

```bash
# Deploy only functions
firebase deploy --only functions

# Or with verbose logging
firebase deploy --only functions --debug
```

### Step 5: Create Cloud Run Job (if not exists)

```bash
# Create the Cloud Run job named 'lfs-builder'
gcloud run jobs create lfs-builder \
    --image gcr.io/lfs-automated-builder/lfs-builder:latest \
    --region us-east1 \
    --set-env-vars "PROJECT_ID=lfs-automated-builder,GCS_BUCKET_NAME=lfs-builds" \
    --memory 4Gi \
    --cpu 2 \
    --timeout 3600 \
    --max-retries 1 \
    --service-account lfs-builder@lfs-automated-builder.iam.gserviceaccount.com
```

---

## 📊 Environment Variables in Container

When the Cloud Run Job starts, it receives these environment variables:

```bash
# Primary build configuration (as JSON string)
LFS_CONFIG_JSON='{"buildId":"...", "userId":"...", ...}'

# Individual helpers
BUILD_ID=550e8400-e29b-41d4-a716-446655440000
PROJECT_ID=lfs-automated-builder
GCS_BUCKET_NAME=lfs-builds
DEBUG=false
```

### In lfs-build.sh

Access like this:

```bash
#!/bin/bash

# Parse LFS_CONFIG_JSON
BUILD_ID=$(echo "$LFS_CONFIG_JSON" | jq -r '.buildId')
PROJECT_ID=$(echo "$LFS_CONFIG_JSON" | jq -r '.projectId')
EMAIL=$(echo "$LFS_CONFIG_JSON" | jq -r '.email')

echo "Starting build: $BUILD_ID"
echo "Project ID: $PROJECT_ID"
echo "Email: $EMAIL"

# Use environment variables
gsutil cp artifact.tar.gz "gs://$GCS_BUCKET_NAME/builds/$BUILD_ID/"
```

---

## 🔐 Authentication & Permissions

### Service Account Permissions Required

The Cloud Function service account needs:

```bash
# For Firestore
roles/datastore.user

# For Cloud Run
roles/run.admin

# For Cloud Storage
roles/storage.objectAdmin

# For Cloud Logging
roles/logging.logWriter
```

### Grant Permissions

```bash
PROJECT_ID=lfs-automated-builder
FUNCTION_SERVICE_ACCOUNT=cloud-functions@${PROJECT_ID}.iam.gserviceaccount.com

# Firestore
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member=serviceAccount:$FUNCTION_SERVICE_ACCOUNT \
    --role=roles/datastore.user

# Cloud Run
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member=serviceAccount:$FUNCTION_SERVICE_ACCOUNT \
    --role=roles/run.admin

# Cloud Storage
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member=serviceAccount:$FUNCTION_SERVICE_ACCOUNT \
    --role=roles/storage.objectAdmin

# Cloud Logging
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member=serviceAccount:$FUNCTION_SERVICE_ACCOUNT \
    --role=roles/logging.logWriter
```

---

## ⏱️ Timeout Configuration

### Why 300 seconds?

```javascript
.runWith({
    timeoutSeconds: 300,  // 5 minutes
})
```

**Reasons**:
1. **Network latency**: 0-5 seconds to reach Google Cloud APIs
2. **Authentication**: 2-5 seconds for IAM verification
3. **Job scheduling**: 10-30 seconds for Cloud Run scheduler
4. **API round-trip**: 20-50 seconds for completion
5. **Buffer**: 200+ seconds for edge cases

**Default**: 60 seconds (too short for Cloud Run API calls)

**Maximum**: 540 seconds (9 minutes)

**Recommendation**: Start with 300 seconds, reduce if always completes faster

---

## 🧪 Testing the Function

### Test 1: Local Testing with Emulator

```bash
# Start Firebase emulator
firebase emulators:start --only functions,firestore

# In another terminal, run test script
node tests/test-cloud-function.js
```

### Test 2: Deploy and Test

```bash
# Deploy to production
firebase deploy --only functions

# Create a build document
# This will trigger the function
```

### Test 3: Check Logs

```bash
# View function logs
firebase functions:log

# Or via Cloud Logging
gcloud functions logs read onBuildSubmitted --region us-east1

# With filtering
gcloud functions logs read onBuildSubmitted \
    --region us-east1 \
    --limit 50 \
    --format=json | jq '.[] | select(.severity=="ERROR")'
```

---

## 📊 Monitoring & Debugging

### Cloud Function Metrics

In Firebase Console:
- **Executions**: Count of trigger invocations
- **Error Rate**: Percentage of failed executions
- **Duration**: Time to complete
- **Memory**: Memory usage

### Cloud Run Job Metrics

In Cloud Run Console:
- **Execution Status**: QUEUED, RUNNING, SUCCEEDED, FAILED
- **Duration**: Execution time
- **Memory/CPU Usage**: Resource consumption
- **Exit Code**: Job completion status

### Logging

#### Function Logs
```javascript
functions.logger.info(`Build ${buildId} started`);
functions.logger.error(`Error:`, error);
functions.logger.debug(`Debug info`);
```

#### Cloud Run Logs
```bash
# Get recent executions
gcloud run jobs list-executions lfs-builder --region us-east1

# View execution logs
gcloud run jobs log lfs-builder --region us-east1 --limit 50
```

#### Firestore Audit Logs
```bash
# View Firestore operations
gcloud logging read "resource.type=firestore_database" --limit 50
```

---

## 🚨 Error Handling

### Common Issues & Solutions

#### Issue 1: "ExecutionsClient is not a constructor"
```
Error: ExecutionsClient is not a constructor
```

**Solution**: Install `@google-cloud/run`:
```bash
npm install @google-cloud/run
```

#### Issue 2: "Permission denied on Cloud Run"
```
Error: Permission denied to execute gRPC call
```

**Solution**: Grant `roles/run.admin` to function service account:
```bash
gcloud projects add-iam-policy-binding PROJECT_ID \
    --member=serviceAccount:cloud-functions@PROJECT_ID.iam.gserviceaccount.com \
    --role=roles/run.admin
```

#### Issue 3: "Cloud Run job not found"
```
Error: Could not find job lfs-builder in region us-east1
```

**Solution**: 
- Check job name matches: `gcloud run jobs list --region us-east1`
- Check region: Verify Cloud Run job in correct region
- Create job if missing: `gcloud run jobs create lfs-builder ...`

#### Issue 4: "Function timeout exceeded"
```
Error: Function execution took 301 seconds, exceeding timeout of 60
```

**Solution**: Increase timeout:
```javascript
.runWith({ timeoutSeconds: 300 })
```

#### Issue 5: "LFS_CONFIG_JSON too large"
```
Error: Environment variable exceeds size limit
```

**Solution**: 
- Reduce data in config
- Move large data to Cloud Storage
- Use shorter field names

---

## 🔄 Integration Points

### Frontend → Cloud Function

```
User submits form
    ↓
Creates Firestore document at /builds/{buildId}
    ↓
onBuildSubmitted trigger fires
```

### Cloud Function → Cloud Run

```
Function prepares LFS_CONFIG_JSON
    ↓
Calls Cloud Run V2 API
    ↓
Creates execution with env vars
    ↓
Container starts lfs-build.sh
```

### Cloud Run → Firestore

```
lfs-build.sh parses LFS_CONFIG_JSON
    ↓
Reads build document from Firestore
    ↓
Updates status during execution
    ↓
Writes completion status when done
```

---

## 📈 Performance Considerations

### Cold Start Time
- **First invocation**: 2-5 seconds
- **Warm invocation**: 0.1-0.5 seconds
- **With dependencies**: Add 1-2 seconds

### Memory Impact
```javascript
memory: '256MB'  // Min needed for Cloud Function
```

### Concurrency
```javascript
maxInstances: 100  // Allow up to 100 concurrent functions
```

### Throughput
- **Per function**: ~1000 invocations/second
- **Per project**: Limited by GCP quota
- **Per region**: Regional limits apply

---

## 📚 Code Examples

### Example 1: Access Config in Container

```bash
#!/bin/bash

# Parse JSON
BUILD_ID=$(echo "$LFS_CONFIG_JSON" | jq -r '.buildId')
BUILD_OPTIONS=$(echo "$LFS_CONFIG_JSON" | jq -r '.buildOptions')

echo "Build ID: $BUILD_ID"
echo "Options: $BUILD_OPTIONS"
```

### Example 2: Custom Error Handling

```javascript
try {
    const [execution] = await executionsClient.createExecution(request);
} catch (error) {
    if (error.code === 5) {  // NOT_FOUND
        functions.logger.error(`Job not found: ${cloudRunJobName}`);
    } else if (error.code === 7) {  // PERMISSION_DENIED
        functions.logger.error(`Permission denied`);
    }
}
```

### Example 3: Track Execution

```javascript
// Save execution name for later tracking
await db.collection('builds').doc(buildId).update({
    executionName: execution.name,
    // Can later query execution status
});
```

---

## ✅ Deployment Checklist

- [ ] `@google-cloud/run` added to package.json
- [ ] `npm install` run in functions directory
- [ ] Service account has `roles/run.admin` permission
- [ ] Cloud Run job created in correct region
- [ ] Environment variables configured (if needed)
- [ ] Function deployed: `firebase deploy --only functions`
- [ ] Firestore rules allow document creation
- [ ] Test form submission triggers function
- [ ] Check Cloud Function logs for success
- [ ] Check Cloud Run executions started
- [ ] Verify LFS_CONFIG_JSON received in container

---

## 🔗 Related Documentation

- [Cloud Functions Documentation](https://cloud.google.com/functions/docs)
- [Cloud Run Jobs API](https://cloud.google.com/run/docs/execute/jobs)
- [Cloud Run V2 API Client](https://github.com/googleapis/nodejs-run)
- [Firestore Triggers](https://firebase.google.com/docs/functions/firestore-events)
- [Environment Variables](https://cloud.google.com/functions/docs/env-var)

---

## 🎯 Summary

### What This Function Does
1. ✅ Listens for new builds in Firestore
2. ✅ Updates status to 'RUNNING'
3. ✅ Prepares build config as JSON
4. ✅ Creates Cloud Run job execution
5. ✅ Passes config via LFS_CONFIG_JSON
6. ✅ Tracks execution in Firestore
7. ✅ Handles errors gracefully

### Key Configuration
- **Timeout**: 300 seconds (5 minutes)
- **Memory**: 256MB
- **Max Instances**: 100
- **Trigger**: Firestore onCreate
- **API**: Cloud Run V2 (`@google-cloud/run`)

### Environment Variables
- `LFS_CONFIG_JSON` - Full build configuration
- `BUILD_ID` - Unique build identifier
- `PROJECT_ID` - GCP project
- `GCS_BUCKET_NAME` - Storage bucket

---

**Last Updated**: November 5, 2025  
**Status**: ✅ Production Ready  
**Version**: 1.0.0
