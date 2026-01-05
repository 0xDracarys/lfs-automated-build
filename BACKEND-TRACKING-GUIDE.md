# Backend Build Tracking Guide

## Overview
Multiple ways to track LFS builds in the backend:

---

## 1. Firebase Console (Best for Viewing Data)

### Firestore Database
**URL**: https://console.firebase.google.com/project/alfs-bd1e0/firestore/data/builds

**What you'll see**:
- All builds in the `builds` collection
- Each document shows: `buildId`, `status`, `progress`, `userId`, `config`
- Click any build → see subcollection `logs` for detailed logs
- Real-time updates as builds progress

**Quick Access**:
```
Direct URL to specific build:
https://console.firebase.google.com/project/alfs-bd1e0/firestore/data/builds/[BUILD_ID]

Example:
https://console.firebase.google.com/project/alfs-bd1e0/firestore/data/builds/CnfEFNfCafXcTF8Wu0Bz
```

### Cloud Functions Logs
**URL**: https://console.firebase.google.com/project/alfs-bd1e0/functions/logs

**What you'll see**:
- Function execution logs (triggerCloudBuild, sendBuildEmail, getBuildStatus)
- Errors and debug messages
- Email notifications (currently in TEST MODE - logged, not sent)

---

## 2. Google Cloud Console (Best for Job Execution)

### Cloud Run Jobs
**URL**: https://console.cloud.google.com/run/jobs?project=alfs-bd1e0

**What you'll see**:
- Job: `lfs-builder` (the actual build container)
- List of all executions with status (Running/Succeeded/Failed)
- Execution time (should be 4-6 hours for real builds)
- Resource usage: 8 CPU, 32GB RAM

**Click any execution to see**:
- Real-time logs from `lfs-build.sh`
- Package compilation progress
- Error messages if build fails

### Cloud Storage Bucket
**URL**: https://console.cloud.google.com/storage/browser/alfs-bd1e0-builds?project=alfs-bd1e0

**What you'll see**:
- `builds/[BUILD_ID]/` folders
- Output files: `lfs-toolchain.tar.gz`, `lfs-bootable.iso`, `install-lfs.ps1`
- Auto-deleted after 7 days (lifecycle policy)

---

## 3. Command Line (Best for Automation)

### List Recent Builds (Firestore)
```bash
# Using Firebase CLI
firebase firestore:get builds --project alfs-bd1e0

# Using gcloud Firestore API
gcloud firestore collections list --project=alfs-bd1e0
```

### Watch Cloud Run Job Executions
```bash
# List recent executions
gcloud run jobs executions list \
  --job=lfs-builder \
  --region=us-central1 \
  --project=alfs-bd1e0 \
  --limit=10

# Get specific execution details
gcloud run jobs executions describe [EXECUTION_ID] \
  --region=us-central1 \
  --project=alfs-bd1e0

# Stream logs in real-time
gcloud run jobs executions logs [EXECUTION_ID] \
  --region=us-central1 \
  --project=alfs-bd1e0 \
  --follow
```

### Check Cloud Functions Logs
```bash
# View recent function logs
firebase functions:log --project alfs-bd1e0

# Filter by specific function
firebase functions:log --only triggerCloudBuild,sendBuildEmail --project alfs-bd1e0

# Stream logs in real-time
gcloud logging tail "resource.type=cloud_function" --project=alfs-bd1e0
```

### List GCS Bucket Files
```bash
# List all builds
gsutil ls gs://alfs-bd1e0-builds/builds/

# List specific build outputs
gsutil ls gs://alfs-bd1e0-builds/builds/[BUILD_ID]/

# Get file metadata
gsutil stat gs://alfs-bd1e0-builds/builds/[BUILD_ID]/lfs-toolchain.tar.gz
```

---

## 4. Frontend API Monitoring

### Build Status API
**Endpoint**: `http://localhost:3000/api/lfs/status/[buildId]`

**How it works**:
1. Frontend calls API every 2 seconds
2. API routes to Cloud Function `getBuildStatus`
3. Cloud Function queries Firestore and returns JSON

**Example Response**:
```json
{
  "buildId": "CnfEFNfCafXcTF8Wu0Bz",
  "status": "running",
  "progress": 50,
  "currentPhase": "chapter6-tools",
  "currentStep": "Building GCC Pass 1",
  "logs": [
    { "timestamp": "2026-01-03T10:30:00Z", "message": "Starting GCC compilation", "level": "INFO" }
  ],
  "downloadUrls": {
    "tarball": "https://storage.googleapis.com/...",
    "iso": "https://storage.googleapis.com/...",
    "installer": "https://storage.googleapis.com/..."
  }
}
```

---

## 5. Build Progress Tracking Workflow

### When User Submits Build:
1. **Frontend** → POST `/api/build` → Creates Firestore doc with `status: PENDING`
2. **Cloud Function** `triggerCloudBuild` → Triggered by Firestore write
3. **Cloud Run Job** `lfs-builder` → Starts execution (4-6 hours)

### During Build Execution:
- **Firestore** `builds/{buildId}` → Updates `status: RUNNING`, `progress: 0-100`
- **Firestore** `builds/{buildId}/logs/{logId}` → New log entries every few minutes
- **Frontend** → Polls `/api/lfs/status/{buildId}` every 2 seconds
- **User sees** → Real-time progress bar and log messages

### After Build Completes:
- **packaging script** → Creates TAR.GZ, ISO, PowerShell installer
- **GCS** → Uploads to `gs://alfs-bd1e0-builds/builds/{buildId}/`
- **update-download-urls.js** → Generates 7-day signed URLs
- **Firestore** → Updates `status: SUCCESS`, `downloadUrls: {...}`
- **Cloud Function** `sendBuildEmail` → Logs email notification (TEST MODE)
- **Frontend** → Shows download buttons

---

## 6. Troubleshooting Backend Issues

### Issue: Build stuck at "PENDING"
**Check**:
```bash
# 1. Verify Cloud Function triggered
firebase functions:log --only triggerCloudBuild

# 2. Check if job execution started
gcloud run jobs executions list --job=lfs-builder --region=us-central1 --limit=1

# 3. Inspect Firestore document
# Go to: https://console.firebase.google.com/project/alfs-bd1e0/firestore/data/builds/[BUILD_ID]
```

### Issue: Build shows "RUNNING" but no logs
**Check**:
```bash
# 1. Get execution ID from Cloud Run
gcloud run jobs executions list --job=lfs-builder --region=us-central1 --limit=1

# 2. Stream execution logs
gcloud run jobs executions logs [EXECUTION_ID] --region=us-central1 --follow
```

### Issue: Build completed but no download URLs
**Check**:
```bash
# 1. Verify files uploaded to GCS
gsutil ls gs://alfs-bd1e0-builds/builds/[BUILD_ID]/

# 2. Check if update-download-urls.js ran
firebase functions:log | grep "update-download-urls"

# 3. Check Firestore document for downloadUrls field
# URL: https://console.firebase.google.com/project/alfs-bd1e0/firestore/data/builds/[BUILD_ID]
```

### Issue: Email not received
**Note**: Emails currently in **TEST MODE** - they log to console instead of sending!

**Check**:
```bash
# View email logs
firebase functions:log --only sendBuildEmail

# You'll see: "📧 [TEST MODE] Email logged to console..."
```

**To enable real email sending**:
1. Edit `functions/index.js`
2. Find line ~630: `// await transporter.sendMail(mailOptions);`
3. Uncomment to: `await transporter.sendMail(mailOptions);`
4. Deploy: `firebase deploy --only functions:sendBuildEmail`

---

## 7. Admin Dashboard (Future Enhancement)

### Planned Features:
- `/admin/builds` page showing all builds in table
- Real-time status updates without manual refresh
- Direct links to Cloud Run executions and GCS files
- User build history and statistics
- Failed build error analysis

### Current Workaround:
Use Firebase Console and Google Cloud Console links above.

---

## Quick Reference Links

| Resource | URL |
|----------|-----|
| **Firestore Builds** | https://console.firebase.google.com/project/alfs-bd1e0/firestore/data/builds |
| **Cloud Run Jobs** | https://console.cloud.google.com/run/jobs?project=alfs-bd1e0 |
| **Cloud Functions Logs** | https://console.firebase.google.com/project/alfs-bd1e0/functions/logs |
| **GCS Bucket** | https://console.cloud.google.com/storage/browser/alfs-bd1e0-builds?project=alfs-bd1e0 |
| **Project Dashboard** | https://console.firebase.google.com/project/alfs-bd1e0/overview |

---

**Next Steps**:
1. Bookmark the Firebase Console and Cloud Console links
2. Test build submission and track in real-time
3. Consider creating admin dashboard page for better UX
