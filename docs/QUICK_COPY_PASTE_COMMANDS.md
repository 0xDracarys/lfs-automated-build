# 🎯 COPY-PASTE COMMANDS - GET YOUR PROJECT LIVE IN 15 MINUTES

**Before you start**: Replace `YOUR_PROJECT_ID` with your actual Google Cloud project ID  
**Get it from**: `gcloud config get-value project`

---

## ✅ STEP 1: Authenticate Docker (2 minutes)

```powershell
gcloud auth configure-docker gcr.io
```

Expected output: `Adding credentials for gcr.io`

---

## ✅ STEP 2: Set Your Project ID (1 minute)

```powershell
$PROJECT_ID = "YOUR_PROJECT_ID"
echo "Using project: $PROJECT_ID"
```

---

## ✅ STEP 3: Push Docker Image to Cloud (5 minutes)

```powershell
docker push gcr.io/${PROJECT_ID}/lfs-builder:latest
```

Expected output: `Successfully pushed gcr.io/YOUR_PROJECT_ID/lfs-builder:latest`

---

## ✅ STEP 4: Create Service Account (2 minutes)

```powershell
gcloud iam service-accounts create lfs-builder `
    --display-name="LFS Builder Service Account" `
    --project=$PROJECT_ID
```

---

## ✅ STEP 5: Grant Permissions to Service Account (2 minutes)

```powershell
$SERVICE_ACCOUNT = "lfs-builder@${PROJECT_ID}.iam.gserviceaccount.com"

# Firestore access
gcloud projects add-iam-policy-binding $PROJECT_ID `
    --member=serviceAccount:$SERVICE_ACCOUNT `
    --role=roles/datastore.user

# Storage access
gcloud projects add-iam-policy-binding $PROJECT_ID `
    --member=serviceAccount:$SERVICE_ACCOUNT `
    --role=roles/storage.objectAdmin

# Logging access
gcloud projects add-iam-policy-binding $PROJECT_ID `
    --member=serviceAccount:$SERVICE_ACCOUNT `
    --role=roles/logging.logWriter
```

---

## ✅ STEP 6: Create Cloud Run Job (2 minutes)

```powershell
$REGION = "us-east1"
$IMAGE = "gcr.io/${PROJECT_ID}/lfs-builder:latest"

gcloud run jobs create lfs-builder `
    --project=$PROJECT_ID `
    --region=$REGION `
    --image=$IMAGE `
    --service-account=$SERVICE_ACCOUNT `
    --memory=4Gi `
    --cpu=2 `
    --timeout=3600
```

Expected output: `✓ Job [lfs-builder] created successfully`

---

## ✅ STEP 7: Grant Cloud Function Permissions (2 minutes)

```powershell
$FUNCTIONS_SA = "cloud-functions@${PROJECT_ID}.iam.gserviceaccount.com"

# Permission to create Cloud Run jobs
gcloud projects add-iam-policy-binding $PROJECT_ID `
    --member=serviceAccount:$FUNCTIONS_SA `
    --role=roles/run.admin

# Firestore access
gcloud projects add-iam-policy-binding $PROJECT_ID `
    --member=serviceAccount:$FUNCTIONS_SA `
    --role=roles/datastore.user

# Logging access
gcloud projects add-iam-policy-binding $PROJECT_ID `
    --member=serviceAccount:$FUNCTIONS_SA `
    --role=roles/logging.logWriter
```

---

## 📝 CHECK: Verify Everything

```powershell
# Verify Cloud Run job was created
gcloud run jobs describe lfs-builder `
    --region=$REGION `
    --project=$PROJECT_ID

# Should show job details without errors
```

---

## 🎉 YOU'RE DONE WITH CLOUD SETUP!

Your infrastructure is now ready:
- ✅ Docker image in Google Cloud
- ✅ Cloud Run job created
- ✅ Service accounts configured
- ✅ Permissions granted

---

## Next: Deploy Code to Cloud

Go to your project folder and run:

```powershell
cd "c:\Users\Chintu\Documents\Dev Zone\Dev work web\lfs-automated"

# Install functions dependencies
cd functions
npm install
cd ..

# Deploy everything
firebase deploy --only functions --project=$PROJECT_ID
firebase deploy --only firestore:rules --project=$PROJECT_ID
firebase deploy --only hosting --project=$PROJECT_ID
```

---

## 🚀 THEN: Test It

1. Visit: `https://YOUR_PROJECT_ID.firebaseapp.com`
2. Fill out the build form
3. Click "Submit"
4. Watch the magic happen! ✨

Check logs:
```powershell
firebase functions:log --project=$PROJECT_ID
```

---

**Time Estimate**: 15-20 minutes total  
**Cost**: $0 (your free trial credits cover everything)
