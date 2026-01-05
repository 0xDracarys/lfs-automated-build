# Cloud Build Monitoring Guide
**Complete end-to-end monitoring for LFS builds**

---

## 🎯 **Build Flow Overview**

```
[Frontend] → [Firebase Function] → [Cloud Run Job] → [Container Logs] → [Storage Output]
    ↓              ↓                      ↓                  ↓                 ↓
Firestore     Cloud Logs          Cloud Run Exec      Build Logs         GCS Bucket
```

---

## **1. Frontend Submission** 🌐

### **Location**: 
- Live site: https://lfs-learning-platform.netlify.app (or your deployed URL)
- Local dev: http://localhost:3000/install

### **What to Monitor**:
```javascript
// In browser DevTools Console (F12)
// Look for these console messages:
✅ "Build submitted successfully"
✅ "Build ID: ABC123..."
❌ "Error submitting build: ..."
```

### **Network Tab (F12 → Network)**:
```
POST /api/build
Status: 200 OK
Response: { "success": true, "buildId": "..." }
```

### **Console Commands**:
```powershell
# Check recent builds from Firestore
firebase firestore:get builds --project alfs-bd1e0 --limit 5

# Or use gcloud
gcloud firestore export gs://alfs-bd1e0-builds/firestore-backup --project=alfs-bd1e0
```

---

## **2. Firestore Database** 🔥

### **Console URL**:
```
https://console.firebase.google.com/project/alfs-bd1e0/firestore/data/builds
```

### **Key Collections**:

#### **`/builds/{buildId}`**
```json
{
  "buildId": "YlavHPV8O4mXTck6CsI7",
  "userId": "user@example.com",
  "status": "PENDING" | "RUNNING" | "SUCCESS" | "FAILED",
  "projectName": "My LFS Build",
  "lfsVersion": "12.0",
  "submittedAt": "2026-01-01T14:00:00Z",
  "startTime": "...",
  "endTime": "...",
  "cloudRunExecution": {
    "name": "projects/.../executions/...",
    "uid": "...",
    "startedAt": "..."
  },
  "error": "..." // Only if failed
}
```

#### **`/buildLogs/{logId}`**
```json
{
  "buildId": "YlavHPV8O4mXTck6CsI7",
  "stage": "chapter5" | "chapter6" | "kernel",
  "timestamp": "2026-01-01T14:05:00Z",
  "level": "INFO" | "ERROR",
  "message": "Building GCC pass 1..."
}
```

### **Query Commands**:
```powershell
# Get specific build
gcloud firestore documents get "builds/YOUR_BUILD_ID" --project=alfs-bd1e0

# List recent builds
gcloud firestore query builds --limit=10 --project=alfs-bd1e0
```

---

## **3. Firebase Cloud Functions** ⚡

### **Console URL**:
```
https://console.firebase.google.com/project/alfs-bd1e0/functions
```

### **Function Names**:
- `onBuildSubmitted` - Firestore trigger when new build created
- `triggerBuildViaCloudRun` - HTTP endpoint to manually trigger builds

### **Logs Location**:
```
https://console.cloud.google.com/logs/query;query=resource.type%3D%22cloud_function%22?project=alfs-bd1e0
```

### **Command to View Logs**:
```powershell
# View Cloud Function logs
gcloud functions logs read onBuildSubmitted --limit=50 --project=alfs-bd1e0

# Real-time streaming
gcloud functions logs read onBuildSubmitted --follow --project=alfs-bd1e0
```

### **Key Log Messages to Find**:
```
✅ "[BuildPipeline] New build submitted"
   - Confirms function triggered
   - Shows buildId, userId, projectName

✅ "[BuildPipeline] Published to Pub/Sub"
   - Confirms message sent to topic
   - Shows messageId

✅ "[BuildPipeline] Cloud Run Job started"
   - Confirms job execution triggered
   - Shows execution name

❌ "[BuildPipeline] Error executing Cloud Run Job"
   - Shows error details if trigger failed
```

---

## **4. Cloud Run Job Execution** 🏃

### **Console URL**:
```
https://console.cloud.google.com/run/jobs/details/us-central1/lfs-builder?project=alfs-bd1e0
```

### **List All Executions**:
```powershell
# View recent executions
gcloud run jobs executions list \
  --job=lfs-builder \
  --region=us-central1 \
  --limit=10 \
  --project=alfs-bd1e0

# Output shows:
# EXECUTION          STATUS      START_TIME              COMPLETION_TIME
# lfs-builder-sr5kn  SUCCEEDED   2025-11-07T15:15:07Z   2025-11-07T15:19:40Z
```

### **Get Specific Execution Details**:
```powershell
# Replace with your execution name
gcloud run jobs executions describe lfs-builder-sr5kn \
  --region=us-central1 \
  --project=alfs-bd1e0
```

### **Key Fields to Check**:
```yaml
status:
  completionTime: "2025-11-07T15:19:40Z"
  conditions:
  - type: Completed
    status: "True"  # ✅ Success
    reason: "Succeeded"
    
  # OR if failed:
  - type: Completed
    status: "False"  # ❌ Failed
    reason: "NonZeroExitCode"
    message: "Task lfs-builder-sr5kn-task0 failed"
    
  failedCount: 1
  succeededCount: 0
  logUri: "https://console.cloud.google.com/logs/viewer?..."
```

### **Manual Trigger**:
```powershell
# Trigger a new execution manually
gcloud run jobs execute lfs-builder \
  --region=us-central1 \
  --project=alfs-bd1e0

# With environment variables
gcloud run jobs execute lfs-builder \
  --region=us-central1 \
  --update-env-vars "BUILD_ID=test-123,LFS_CONFIG_JSON={\"buildId\":\"test-123\"}" \
  --project=alfs-bd1e0
```

---

## **5. Container Build Logs** 📜

### **Console URL (for specific execution)**:
```
https://console.cloud.google.com/logs/query;query=resource.type%3D%22cloud_run_job%22%0Aresource.labels.job_name%3D%22lfs-builder%22?project=alfs-bd1e0
```

### **Command to View Logs**:
```powershell
# View logs for specific execution
gcloud logging read \
  "resource.type=cloud_run_job AND resource.labels.job_name=lfs-builder" \
  --limit=100 \
  --project=alfs-bd1e0 \
  --format=json

# Filter by execution name
gcloud logging read \
  "resource.type=cloud_run_job AND resource.labels.job_name=lfs-builder AND labels.execution_name=lfs-builder-sr5kn" \
  --limit=200 \
  --project=alfs-bd1e0

# Real-time streaming (for current execution)
gcloud logging tail \
  "resource.type=cloud_run_job AND resource.labels.job_name=lfs-builder" \
  --project=alfs-bd1e0
```

### **Key Log Messages to Find**:
```bash
# 1. Startup
"🚀 LFS BUILD SCRIPT STARTING"
"📋 Environment Diagnostics"
"PATH: ..."

# 2. Configuration
"Reading build configuration from LFS_CONFIG_JSON"
"Build ID: ABC123..."

# 3. Build Stages
"[INFO] Starting Chapter 5 cross-toolchain build"
"[INFO] Building GCC 13.2.0"
"[SUCCESS] GCC installed to /mnt/lfs/tools"

# 4. Firestore Updates
"Logged to Firestore: chapter5 - RUNNING"

# 5. Errors
"[ERROR] Failed to build package: ..."
"[ERROR] Missing LFS environment variable"

# 6. Completion
"Build completed successfully"
"Uploading to gs://alfs-bd1e0-builds/..."
```

---

## **6. Google Cloud Storage Output** ☁️

### **Console URL**:
```
https://console.cloud.google.com/storage/browser/alfs-bd1e0-builds?project=alfs-bd1e0
```

### **Bucket Structure**:
```
gs://alfs-bd1e0-builds/
├── {buildId}/
│   ├── lfs-system-{buildId}.tar.gz      # Final build output
│   ├── build-logs-{buildId}.txt         # Complete build log
│   └── metadata-{buildId}.json          # Build metadata
```

### **Commands to Check**:
```powershell
# List all builds
gsutil ls gs://alfs-bd1e0-builds/

# List files for specific build
gsutil ls gs://alfs-bd1e0-builds/YOUR_BUILD_ID/

# Download build output
gsutil cp gs://alfs-bd1e0-builds/YOUR_BUILD_ID/lfs-system-*.tar.gz ./

# Check file size
gsutil du -sh gs://alfs-bd1e0-builds/YOUR_BUILD_ID/
```

---

## **7. Quick Monitoring Dashboard** 📊

### **Create a monitoring script**:
```powershell
# Save as: MONITOR-BUILD.ps1
param($buildId)

Write-Host "=== Monitoring Build: $buildId ===" -ForegroundColor Cyan

# 1. Check Firestore status
Write-Host "`n1. Firestore Status:" -ForegroundColor Yellow
gcloud firestore documents get "builds/$buildId" --project=alfs-bd1e0

# 2. Check Cloud Run executions
Write-Host "`n2. Cloud Run Executions:" -ForegroundColor Yellow
gcloud run jobs executions list --job=lfs-builder --region=us-central1 --limit=5 --project=alfs-bd1e0

# 3. Check recent logs
Write-Host "`n3. Recent Logs:" -ForegroundColor Yellow
gcloud logging read "resource.type=cloud_run_job AND jsonPayload.buildId=$buildId" --limit=20 --project=alfs-bd1e0

# 4. Check storage output
Write-Host "`n4. Storage Output:" -ForegroundColor Yellow
gsutil ls gs://alfs-bd1e0-builds/$buildId/
```

---

## **8. Error Troubleshooting** 🔧

### **Common Issues and Where to Look**:

| Symptom | Check Location | Command |
|---------|---------------|---------|
| Build not starting | Firebase Function logs | `gcloud functions logs read onBuildSubmitted` |
| Job fails immediately | Cloud Run execution details | `gcloud run jobs executions describe ...` |
| Build hangs | Container logs (real-time) | `gcloud logging tail "resource.type=cloud_run_job"` |
| Missing output | GCS bucket | `gsutil ls gs://alfs-bd1e0-builds/` |
| Firestore not updating | Function logs + Firestore rules | Check `firestore.rules` |

### **Health Check Commands**:
```powershell
# Check if Cloud Run job exists
gcloud run jobs describe lfs-builder --region=us-central1 --project=alfs-bd1e0

# Check if GCS bucket is accessible
gsutil ls gs://alfs-bd1e0-builds/

# Check if Functions are deployed
gcloud functions list --project=alfs-bd1e0

# Check recent builds status
gcloud firestore query builds --limit=5 --project=alfs-bd1e0
```

---

## **9. Complete Monitoring Workflow** 🔄

### **Step-by-Step Monitoring**:

```powershell
# 1. Trigger build (from frontend or manual)
# Note the BUILD_ID from response

# 2. Monitor Firestore for status changes
gcloud firestore documents get "builds/YOUR_BUILD_ID" --project=alfs-bd1e0
# Look for: status: "PENDING" → "RUNNING" → "SUCCESS"

# 3. Find the Cloud Run execution
gcloud run jobs executions list --job=lfs-builder --region=us-central1 --limit=1 --project=alfs-bd1e0
# Note the EXECUTION_NAME (e.g., lfs-builder-sr5kn)

# 4. Stream live logs
gcloud logging tail "resource.type=cloud_run_job AND labels.execution_name=YOUR_EXECUTION_NAME" --project=alfs-bd1e0

# 5. Check final status
gcloud run jobs executions describe YOUR_EXECUTION_NAME --region=us-central1 --project=alfs-bd1e0

# 6. Download output
gsutil cp gs://alfs-bd1e0-builds/YOUR_BUILD_ID/lfs-system-*.tar.gz ./
```

---

## **10. Useful Console Shortcuts** 🔗

### **Direct Links** (replace BUILD_ID and EXECUTION_NAME):
```
# Firestore document
https://console.firebase.google.com/project/alfs-bd1e0/firestore/data/builds/YOUR_BUILD_ID

# Cloud Run execution
https://console.cloud.google.com/run/jobs/executions/details/us-central1/lfs-builder/YOUR_EXECUTION_NAME?project=alfs-bd1e0

# Logs for specific execution
https://console.cloud.google.com/logs/query;query=resource.labels.execution_name%3D%22YOUR_EXECUTION_NAME%22?project=alfs-bd1e0

# Storage bucket
https://console.cloud.google.com/storage/browser/alfs-bd1e0-builds/YOUR_BUILD_ID?project=alfs-bd1e0
```

---

## **Quick Reference Card** 📋

```powershell
# Get latest build status
gcloud firestore query builds --limit=1 --order-by submittedAt DESC --project=alfs-bd1e0

# Get latest execution
gcloud run jobs executions list --job=lfs-builder --region=us-central1 --limit=1 --project=alfs-bd1e0

# Tail live logs
gcloud logging tail "resource.type=cloud_run_job" --project=alfs-bd1e0

# List recent outputs
gsutil ls -lh gs://alfs-bd1e0-builds/ | tail -10

# Check function errors
gcloud functions logs read --limit=20 --project=alfs-bd1e0 | grep ERROR
```

---

**🎯 Pro Tip**: Bookmark the Console URLs and save the PowerShell monitoring script for quick access!
