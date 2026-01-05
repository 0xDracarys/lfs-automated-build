# Quick Monitoring Commands - Copy & Paste Ready

## 📊 **Status Checks**

### Check Latest Cloud Run Executions
```powershell
gcloud run jobs executions list `
  --job=lfs-builder `
  --region=us-central1 `
  --limit=5 `
  --project=alfs-bd1e0
```

### Check Latest Cloud Build
```powershell
gcloud builds list `
  --limit=5 `
  --format="table(id.slice(0:8),status,createTime,duration)" `
  --project=alfs-bd1e0
```

### Check Container Logs (Last 50 lines)
```powershell
gcloud logging read `
  "resource.type=cloud_run_job AND resource.labels.job_name=lfs-builder" `
  --limit=50 `
  --format="table(timestamp,severity,textPayload)" `
  --project=alfs-bd1e0
```

### Stream Live Logs
```powershell
gcloud logging tail `
  "resource.type=cloud_run_job AND resource.labels.job_name=lfs-builder" `
  --project=alfs-bd1e0
```

---

## 🔍 **Inspect Specific Build**

### Get Execution Details (replace EXECUTION_NAME)
```powershell
$EXECUTION = "lfs-builder-sr5kn"  # Replace with your execution name
gcloud run jobs executions describe $EXECUTION `
  --region=us-central1 `
  --project=alfs-bd1e0
```

### Get Logs for Specific Execution
```powershell
$EXECUTION = "lfs-builder-sr5kn"  # Replace with your execution name
gcloud logging read `
  "resource.type=cloud_run_job AND labels.execution_name=$EXECUTION" `
  --limit=100 `
  --format="table(timestamp,severity,textPayload)" `
  --project=alfs-bd1e0
```

---

## 🗂️ **Storage & Outputs**

### List All Build Outputs
```powershell
gsutil ls gs://alfs-bd1e0-builds/
```

### Check Specific Build Output (replace BUILD_ID)
```powershell
$BUILD_ID = "YOUR_BUILD_ID"
gsutil ls -lh gs://alfs-bd1e0-builds/$BUILD_ID/
```

### Download Build Output
```powershell
$BUILD_ID = "YOUR_BUILD_ID"
gsutil cp gs://alfs-bd1e0-builds/$BUILD_ID/lfs-system-*.tar.gz ./
```

---

## 🚀 **Manual Triggers**

### Trigger New Cloud Run Execution
```powershell
gcloud run jobs execute lfs-builder `
  --region=us-central1 `
  --project=alfs-bd1e0
```

### Trigger with Custom Config
```powershell
$CONFIG = '{"buildId":"test-123","projectName":"Test Build","lfsVersion":"12.0"}'
gcloud run jobs execute lfs-builder `
  --region=us-central1 `
  --update-env-vars "LFS_CONFIG_JSON=$CONFIG,BUILD_ID=test-123" `
  --project=alfs-bd1e0
```

---

## 🔧 **Troubleshooting**

### Check Why Last 3 Executions Failed
```powershell
gcloud run jobs executions list `
  --job=lfs-builder `
  --region=us-central1 `
  --limit=3 `
  --format="yaml(name,status.conditions)" `
  --project=alfs-bd1e0
```

### Get Error Messages from Logs
```powershell
gcloud logging read `
  "resource.type=cloud_run_job AND severity>=ERROR" `
  --limit=20 `
  --format="table(timestamp,textPayload)" `
  --project=alfs-bd1e0
```

### Check Function Logs
```powershell
gcloud functions logs read `
  --limit=50 `
  --project=alfs-bd1e0
```

---

## 📈 **Health Checks**

### Verify Job Exists
```powershell
gcloud run jobs describe lfs-builder `
  --region=us-central1 `
  --project=alfs-bd1e0
```

### Check Image Version
```powershell
gcloud container images list-tags `
  gcr.io/alfs-bd1e0/lfs-builder `
  --limit=5 `
  --format="table(tags,timestamp)"
```

### Test Storage Access
```powershell
gsutil ls gs://alfs-bd1e0-builds/ | Measure-Object -Line
```

---

## 🌐 **Console URLs**

### Cloud Run Job
```
https://console.cloud.google.com/run/jobs/details/us-central1/lfs-builder?project=alfs-bd1e0
```

### Cloud Build History
```
https://console.cloud.google.com/cloud-build/builds?project=alfs-bd1e0
```

### Container Logs
```
https://console.cloud.google.com/logs/query;query=resource.type%3D%22cloud_run_job%22?project=alfs-bd1e0
```

### Storage Browser
```
https://console.cloud.google.com/storage/browser/alfs-bd1e0-builds?project=alfs-bd1e0
```

### Firestore Database
```
https://console.firebase.google.com/project/alfs-bd1e0/firestore
```

### Firebase Functions
```
https://console.firebase.google.com/project/alfs-bd1e0/functions
```

---

## 💡 **Pro Tips**

1. **Bookmark these console URLs** for quick access
2. **Use `--format=json`** to pipe output to other tools
3. **Add `| Out-File log.txt`** to save logs locally
4. **Use `--filter` for complex queries** in gcloud logging
5. **Check execution name** from Cloud Run list before querying logs
