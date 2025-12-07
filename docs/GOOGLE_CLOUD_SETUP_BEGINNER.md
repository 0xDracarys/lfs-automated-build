# 🎯 Google Cloud Setup - COMPLETE BEGINNER WALKTHROUGH

**Status**: You have $200 free trial ✅  
**Goal**: Set up your LFS project on Google Cloud, step by step  
**Time**: ~60 minutes

---

## 📍 WHERE YOU ARE NOW

✅ You're logged into Google Cloud Console  
✅ You have $200 free trial credits  
❌ Project is only on your local PC  
❌ Nothing deployed to cloud yet  

---

## 🔑 WHAT IS WHAT (BASIC TERMS)

Before we start, understand these Google Cloud services:

| Service | What It Does | Why You Need It |
|---------|-------------|-----------------|
| **Google Cloud Project** | Container for everything | Holds all your code, data, settings |
| **Cloud Functions** | Runs your Node.js code | Listens to Firestore and starts jobs |
| **Cloud Run (Jobs)** | Runs Docker containers | Executes your LFS build script |
| **Firestore** | Database (cloud) | Stores build requests and status |
| **Cloud Storage (GCS)** | File storage (cloud) | Stores build outputs |
| **Container Registry** | Docker image storage | Holds your Docker container |
| **Cloud Logging** | Logs viewer | See what's happening |

---

## ✋ STOP: Before You Click Anything

### You Need 2 Things on Your Local PC:

1. **Google Cloud CLI installed**
   - Check if you have it:
   ```bash
   gcloud --version
   ```
   - If you don't: Download from https://cloud.google.com/sdk/docs/install

2. **Docker installed**
   - Check if you have it:
   ```bash
   docker --version
   ```
   - If you don't: Download from https://www.docker.com/products/docker-desktop

---

## 🚀 STEP-BY-STEP WALKTHROUGH

### **STEP 1: Get Your Project ID from Google Cloud Console** (2 minutes)

**What you're doing**: Finding your project's unique ID

**Actions**:
1. Open: https://console.cloud.google.com
2. Look at the **TOP LEFT** - you'll see a dropdown that says something like:
   ```
   Select a Project ▼
   ```
3. Click it
4. You'll see your project name (something like "My Project" or "lfs-automated-builder")
5. Look for the **PROJECT ID** column - it looks like: `my-project-id-12345`
6. **COPY IT** - you'll use it many times!

**Store it**:
```bash
# On your LOCAL PC, open PowerShell and type this (REPLACE the ID):
$PROJECT_ID = "your-project-id-12345"
```

---

### **STEP 2: Enable Required Google Cloud Services** (3 minutes)

**What you're doing**: Telling Google Cloud "I want to use these features"

**Go to APIs & Services**:
1. In Google Cloud Console, click **☰ Menu** (top left hamburger icon)
2. Click **APIs & Services** → **Dashboard**
3. Click **ENABLE APIS AND SERVICES** (blue button at top)

**Enable These Services** (One by one):

#### Service 1: Cloud Functions API
1. Search box: type `Cloud Functions`
2. Click **Cloud Functions API**
3. Click **ENABLE** (blue button)
4. Wait until it says "API enabled" ✅

#### Service 2: Cloud Run API
1. Go back to **ENABLE APIS AND SERVICES**
2. Search: `Cloud Run`
3. Click **Cloud Run API**
4. Click **ENABLE**
5. Wait until it says "API enabled" ✅

#### Service 3: Firestore API
1. Go back to **ENABLE APIS AND SERVICES**
2. Search: `Firestore`
3. Click **Cloud Firestore API**
4. Click **ENABLE**
5. Wait until it says "API enabled" ✅

#### Service 4: Cloud Build API
1. Go back to **ENABLE APIS AND SERVICES**
2. Search: `Cloud Build`
3. Click **Cloud Build API**
4. Click **ENABLE**
5. Wait until it says "API enabled" ✅

#### Service 5: Artifact Registry API
1. Go back to **ENABLE APIS AND SERVICES**
2. Search: `Artifact Registry`
3. Click **Artifact Registry API**
4. Click **ENABLE**
5. Wait until it says "API enabled" ✅

**Expected Result**: You enabled 5 APIs ✅

---

### **STEP 3: Create a Firestore Database** (5 minutes)

**What you're doing**: Creating a cloud database where build requests are stored

**Actions**:
1. In Google Cloud Console, click **☰ Menu** (top left)
2. Click **Firestore Database** (under "Databases" section)
3. Click **CREATE DATABASE** (big blue button)

**Configure it**:
- **Location**: Select your region (e.g., `us-east1` or closest to you)
- **Mode**: Select **Native mode**
- Click **CREATE** (wait ~2 minutes for it to create)

**Expected Result**: You see a database with collections like "builds" (you'll create this automatically later)

---

### **STEP 4: Create a Cloud Storage Bucket** (3 minutes)

**What you're doing**: Creating a folder in the cloud to store build outputs

**Actions**:
1. In Google Cloud Console, click **☰ Menu**
2. Click **Cloud Storage** → **Buckets**
3. Click **CREATE** (big blue button)

**Configure it**:
- **Bucket name**: Type: `YOUR_PROJECT_ID-lfs-builds`
  - Example: `my-project-id-12345-lfs-builds`
- **Location**: Same region as Firestore (e.g., `us-east1`)
- Click **CREATE**

**Store the bucket name**:
```bash
$GCS_BUCKET = "your-project-id-12345-lfs-builds"
```

**Expected Result**: You see your bucket in the list

---

### **STEP 5: Create Service Accounts (These are "Robot Users")** (5 minutes)

**What you're doing**: Creating special user accounts for:
1. Cloud Functions (to call Cloud Run)
2. Cloud Run Job (to read/write Firestore and Storage)

#### Service Account 1: Cloud Run Job Service Account

**Actions**:
1. In Google Cloud Console, click **☰ Menu**
2. Click **IAM & Admin** → **Service Accounts**
3. Click **CREATE SERVICE ACCOUNT** (blue button)

**Fill in**:
- **Service account name**: `lfs-builder`
- **Service account ID**: `lfs-builder` (auto-fills)
- Click **CREATE AND CONTINUE**

**Grant Roles** (This step):
- Click **ADD ANOTHER ROLE** and add these 3 roles:
  1. `Firestore User` (search and select)
  2. `Storage Object Admin` (search and select)
  3. `Logging Log Writer` (search and select)
- Click **CONTINUE**

**Create Key**:
- Click **CREATE KEY** → **JSON**
- A file downloads automatically
- **SAVE IT SOMEWHERE SAFE** (you'll need it later for Docker)

**Expected Result**: Service account created with 3 roles ✅

---

### **STEP 6: Set Up Cloud CLI on Your Local PC** (5 minutes)

**What you're doing**: Connecting your local computer to Google Cloud

**On Your Local PC - Open PowerShell**:

```powershell
# Step 1: Authenticate with Google Cloud
gcloud auth login

# A browser window opens - log in with your Google account
# After logging in, close the browser and return to PowerShell

# Step 2: Set your project ID
$PROJECT_ID = "your-project-id-12345"  # REPLACE WITH YOUR ID
gcloud config set project $PROJECT_ID

# Step 3: Verify it worked
gcloud config list

# You should see:
# [core]
# project = your-project-id-12345
```

**Expected Result**: `gcloud config list` shows your project ID

---

### **STEP 7: Set Up Docker** (10 minutes)

**What you're doing**: Preparing your local Docker to push images to Google Cloud

**On Your Local PC - Open PowerShell**:

```powershell
# Step 1: Configure Docker to use Google Cloud
gcloud auth configure-docker gcr.io

# Step 2: Verify Docker is running
docker ps

# You should see a list (might be empty)
# If you get an error, start Docker Desktop first

# Step 3: Test Docker with a simple command
docker run hello-world
```

**Expected Result**: Docker commands work without errors

---

### **STEP 8: Build Your Docker Image Locally** (5 minutes)

**What you're doing**: Creating a Docker container from your code

**On Your Local PC - Open PowerShell**:

```powershell
# Navigate to your project
cd "c:\Users\Chintu\Documents\Dev Zone\Dev work web\lfs-automated"

# Build the Docker image
$PROJECT_ID = "your-project-id-12345"
docker build -t gcr.io/${PROJECT_ID}/lfs-builder:latest .

# This takes ~2-3 minutes (first time)
# You'll see lots of output - that's normal
```

**Expected Result**: Build completes with no errors ✅

**Verify it was created**:
```powershell
docker images | Select-String "lfs-builder"

# You should see your image listed
```

---

### **STEP 9: Push Docker Image to Google Cloud** (5 minutes)

**What you're doing**: Uploading your Docker container to Google Cloud Registry

**On Your Local PC - Open PowerShell**:

```powershell
$PROJECT_ID = "your-project-id-12345"

# Push the image to Google Cloud
docker push gcr.io/${PROJECT_ID}/lfs-builder:latest

# This takes ~1-2 minutes
# You'll see progress bars
```

**Expected Result**: Push completes with: `Successfully pushed gcr.io/...`

**Verify in Google Cloud Console**:
1. Go to Google Cloud Console
2. Click **☰ Menu** → **Artifact Registry** (or **Container Registry**)
3. You should see your `lfs-builder` image

---

### **STEP 10: Create Cloud Run Job** (5 minutes)

**What you're doing**: Telling Google Cloud "Run my Docker container as a job"

**On Your Local PC - Open PowerShell**:

```powershell
$PROJECT_ID = "your-project-id-12345"
$REGION = "us-east1"
$SERVICE_ACCOUNT = "lfs-builder@${PROJECT_ID}.iam.gserviceaccount.com"
$IMAGE = "gcr.io/${PROJECT_ID}/lfs-builder:latest"

# Create the Cloud Run Job
gcloud run jobs create lfs-builder `
    --region=$REGION `
    --image=$IMAGE `
    --service-account=$SERVICE_ACCOUNT `
    --memory=4Gi `
    --cpu=2 `
    --timeout=3600 `
    --project=$PROJECT_ID

# Wait for completion
```

**Expected Result**: Command completes and shows: `✓ Job [lfs-builder] created successfully`

**Verify in Google Cloud Console**:
1. Go to Google Cloud Console
2. Click **☰ Menu** → **Cloud Run** → **Jobs**
3. You should see `lfs-builder` in the list

---

### **STEP 11: Install Dependencies on Your Local PC** (3 minutes)

**What you're doing**: Installing Node.js packages your Cloud Function needs

**On Your Local PC - Open PowerShell**:

```powershell
# Navigate to functions folder
cd "c:\Users\Chintu\Documents\Dev Zone\Dev work web\lfs-automated\functions"

# Install npm packages
npm install

# This takes ~1-2 minutes
# You'll see packages being installed
```

**Verify it worked**:
```powershell
# Check if @google-cloud/run was installed
npm list @google-cloud/run

# You should see: @google-cloud/run@1.1.0 (or similar)
```

**Expected Result**: No errors, packages installed ✅

---

### **STEP 12: Grant Permissions to Cloud Functions** (5 minutes)

**What you're doing**: Telling Google Cloud "Cloud Functions can start Cloud Run jobs"

**On Your Local PC - Open PowerShell**:

```powershell
$PROJECT_ID = "your-project-id-12345"

# Find your Cloud Functions service account
$FUNCTIONS_SA = "cloud-functions@${PROJECT_ID}.iam.gserviceaccount.com"

# Grant permission to create Cloud Run jobs
gcloud projects add-iam-policy-binding $PROJECT_ID `
    --member=serviceAccount:$FUNCTIONS_SA `
    --role=roles/run.admin

# Grant Firestore access
gcloud projects add-iam-policy-binding $PROJECT_ID `
    --member=serviceAccount:$FUNCTIONS_SA `
    --role=roles/datastore.user

# Grant Logging access
gcloud projects add-iam-policy-binding $PROJECT_ID `
    --member=serviceAccount:$FUNCTIONS_SA `
    --role=roles/logging.logWriter

# Verify permissions
gcloud projects get-iam-policy $PROJECT_ID `
    --flatten="bindings[].members" `
    --filter="bindings.members:serviceAccount:$FUNCTIONS_SA"
```

**Expected Result**: You see 3 roles listed:
- `roles/datastore.user`
- `roles/run.admin`
- `roles/logging.logWriter`

---

### **STEP 13: Configure Firebase** (5 minutes)

**What you're doing**: Setting up Firebase with your Google Cloud project

**On Your Local PC - Open PowerShell**:

```powershell
# Navigate to project root
cd "c:\Users\Chintu\Documents\Dev Zone\Dev work web\lfs-automated"

# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# A browser window opens - log in
# After logging in, return to PowerShell

# Set your project
$PROJECT_ID = "your-project-id-12345"
firebase use --add

# Select your project from the list
# Give it an alias (just press Enter for default)
```

---

### **STEP 14: Deploy Cloud Function** (5 minutes)

**What you're doing**: Uploading your Node.js code to Google Cloud Functions

**On Your Local PC - Open PowerShell**:

```powershell
# Navigate to project root
cd "c:\Users\Chintu\Documents\Dev Zone\Dev work web\lfs-automated"

$PROJECT_ID = "your-project-id-12345"

# Deploy
firebase deploy --only functions --project=$PROJECT_ID

# This takes ~2-3 minutes
# You'll see progress
```

**Expected Output**:
```
✔ Deploy complete!

Function URL: https://us-east1-PROJECT_ID.cloudfunctions.net/onBuildSubmitted
Function URL: https://us-east1-PROJECT_ID.cloudfunctions.net/onExecutionStatusChange
```

**Expected Result**: Deployment succeeds with function URLs ✅

---

### **STEP 15: Deploy Firestore Rules** (2 minutes)

**What you're doing**: Setting security rules so only your app can read/write

**On Your Local PC - Open PowerShell**:

```powershell
cd "c:\Users\Chintu\Documents\Dev Zone\Dev work web\lfs-automated"

$PROJECT_ID = "your-project-id-12345"

# Deploy Firestore security rules
firebase deploy --only firestore:rules --project=$PROJECT_ID
```

**Expected Result**: Deployment succeeds ✅

---

### **STEP 16: Deploy Frontend (Website)** (3 minutes)

**What you're doing**: Uploading your website to Google Cloud Hosting

**On Your Local PC - Open PowerShell**:

```powershell
cd "c:\Users\Chintu\Documents\Dev Zone\Dev work web\lfs-automated"

$PROJECT_ID = "your-project-id-12345"

# Deploy hosting
firebase deploy --only hosting --project=$PROJECT_ID

# This takes ~1 minute
```

**Expected Output**:
```
✔ Deploy complete!

Hosting URL: https://PROJECT_ID.firebaseapp.com
```

**You can now visit this URL in your browser!** 🎉

---

### **STEP 17: Test Everything Works** (5 minutes)

**What you're doing**: Making sure everything is connected

**Actions**:

1. **Open your website**:
   ```
   https://YOUR_PROJECT_ID.firebaseapp.com
   ```

2. **Fill out the form**:
   - Project Name: "Test Build"
   - LFS Version: "12.0"
   - Email: "test@example.com"
   - Leave other fields as default
   - Click **Submit**

3. **Check if it worked**:
   ```powershell
   # View function logs (should show new build)
   firebase functions:log --limit=50 --project=$PROJECT_ID

   # You should see: "New build submitted: xxxxxxx-xxxx-xxxx"
   ```

4. **Check if Cloud Run job started**:
   ```powershell
   gcloud run jobs list-executions lfs-builder `
       --region=us-east1 `
       --project=$PROJECT_ID

   # You should see at least one execution
   ```

**Expected Result**: You see logs and executions ✅

---

## 🎉 YOU'RE DONE!

If you got here without errors, your entire system is working:

```
Website Form
    ↓
Firestore Database (stores request)
    ↓
Cloud Function (triggers automatically)
    ↓
Cloud Run Job (starts container)
    ↓
Docker Container (runs your build script)
    ↓
Cloud Storage (saves results)
    ↓
Firestore (updates status)
```

---

## 📊 Your Google Cloud Setup Summary

| Component | Status | Where to Check |
|-----------|--------|-----------------|
| **Project ID** | ✅ | Google Cloud Console (top left) |
| **APIs Enabled** | ✅ | Cloud Console → APIs & Services |
| **Firestore Database** | ✅ | Cloud Console → Firestore |
| **Cloud Storage Bucket** | ✅ | Cloud Console → Cloud Storage |
| **Service Accounts** | ✅ | Cloud Console → IAM & Admin → Service Accounts |
| **Docker Image** | ✅ | Cloud Console → Artifact Registry (or Container Registry) |
| **Cloud Run Job** | ✅ | Cloud Console → Cloud Run → Jobs |
| **Cloud Function** | ✅ | Cloud Console → Cloud Functions |
| **Firestore Rules** | ✅ | Cloud Console → Firestore → Rules |
| **Hosting** | ✅ | Cloud Console → Firebase Hosting |

---

## 💰 How Much Will This Cost?

With your $200 free trial:

| Service | Free Tier | Estimated Cost |
|---------|-----------|-----------------|
| **Cloud Functions** | 2M invocations/month | ~Free (if <2M builds) |
| **Cloud Run** | 180,000 vCPU-seconds/month | ~Free (if <180k seconds) |
| **Firestore** | 50k reads/day | ~Free (if <50k reads) |
| **Cloud Storage** | 5GB/month | ~Free (if <5GB) |
| **Artifact Registry** | First 0.5GB free | ~Free |

**Result**: You'll probably never hit paid tier with free trial credits! 🎉

---

## 🆘 If Something Fails

### Problem: "API is not enabled"
**Fix**:
```bash
gcloud services enable cloudrun.googleapis.com
gcloud services enable cloudfunctions.googleapis.com
gcloud services enable firestore.googleapis.com
```

### Problem: "Permission denied"
**Fix**:
```powershell
# Make sure you logged in
gcloud auth login

# Make sure you set the right project
gcloud config set project $PROJECT_ID
```

### Problem: "Docker image not found"
**Fix**:
```powershell
# Make sure image was pushed
docker push gcr.io/${PROJECT_ID}/lfs-builder:latest

# Verify it exists
gcloud artifacts repositories list --project=$PROJECT_ID
```

### Problem: "Cloud Function didn't trigger"
**Fix**:
```powershell
# Check function logs
firebase functions:log --error-only

# Check Firestore has the document
firebase firestore:get builds

# Check Cloud Run job exists
gcloud run jobs list --region=us-east1
```

---

## ✓ Next: What to Do After This

1. **Monitor your builds** in Cloud Console
2. **Check build outputs** in Cloud Storage bucket
3. **View build status** in Firestore
4. **Watch logs** in Cloud Logging

---

**Status**: 🎉 Your Google Cloud Project is LIVE!  
**Your Website**: https://YOUR_PROJECT_ID.firebaseapp.com  
**Your Budget**: $200 free trial (hopefully unused!)
