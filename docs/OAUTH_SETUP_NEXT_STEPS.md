# 🎯 YOUR OAUTH SETUP - NEXT STEPS (VERY BASIC WALKTHROUGH)

**Date**: November 5, 2025  
**Your Project ID**: `alfs-bd1e0`  
**Status**: OAuth client created ✅

---

## 🔐 YOUR CREDENTIALS (SAVE THESE SAFELY!)

```
OAuth Client ID:
92549920661-qtlcva684qaosdtddlc8om9d8potmf79.apps.googleusercontent.com

OAuth Client Secret:
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

Service Account 1:
lfs-builder-service-account@alfs-477317.iam.gserviceaccount.com

Service Account 2:
alfs-firebase-service@alfs-bd1e0.iam.gserviceaccount.com

Project ID:
alfs-bd1e0
```

---

## ⚠️ IMPORTANT: TWO DIFFERENT PROJECTS?

I notice you have TWO different project IDs:
- `alfs-477317` (lfs-builder-service-account)
- `alfs-bd1e0` (Firebase service, OAuth client)

**ACTION NEEDED**: Tell me which ONE is your main project?

For now, I'll assume: **`alfs-bd1e0`** (where Firebase is)

---

## 🚀 YOUR NEXT STEPS (VERY BASIC)

### STEP 1: Verify Your Project ID (1 minute)

**In your browser**:
1. Go to: https://console.cloud.google.com
2. Look at **TOP LEFT** - see your project name
3. Find the **PROJECT ID** - should be `alfs-bd1e0`
4. If different, tell me the correct one

**In PowerShell**:
```powershell
gcloud config get-value project
```

**Expected output**: `alfs-bd1e0`

---

### STEP 2: Set Your Project in PowerShell (1 minute)

**Do this** (copy-paste into PowerShell):
```powershell
$PROJECT_ID = "alfs-bd1e0"
echo "Your project is: $PROJECT_ID"
```

**What it does**: Saves your project ID so you don't have to type it repeatedly

---

### STEP 3: Check Your Docker Image (1 minute)

**Do this** (copy-paste into PowerShell):
```powershell
docker images | Select-String "lfs-builder"
```

**Expected output**: You should see:
```
gcr.io/lfs-automated-builder/lfs-builder   latest   ...   1.62GB
```

**What it means**: Your Docker image is ready to push ✅

---

### STEP 4: Authenticate with Google Cloud (2 minutes)

**Do this** (copy-paste into PowerShell):
```powershell
gcloud auth configure-docker gcr.io
```

**What it does**: Tells Docker it's OK to push images to Google Cloud  
**Expected**: Message about "credentials"  
**Time**: ~30 seconds

---

### STEP 5: Push Your Docker Image (5 minutes)

**Do this** (copy-paste into PowerShell):
```powershell
$PROJECT_ID = "alfs-bd1e0"
docker push gcr.io/${PROJECT_ID}/lfs-builder:latest
```

**What it does**: Uploads your Docker image to Google Cloud  
**Time**: ~5 minutes (shows progress bars)  
**Expected output ends with**:
```
Successfully pushed gcr.io/alfs-bd1e0/lfs-builder:latest
```

**Important**: This will take a few minutes. Be patient!

---

### STEP 6: Verify Image Uploaded (1 minute)

**In Google Cloud Console**:
1. Go to: https://console.cloud.google.com
2. Click **☰ Menu** (top left hamburger)
3. Click **Artifact Registry** (search if you can't find it)
4. You should see your `lfs-builder` image

**In PowerShell** (optional):
```powershell
gcloud artifacts repositories list --project=$PROJECT_ID
```

---

## 📋 WHAT COMES NEXT (After Image is Pushed)

Once your Docker image is uploaded, you'll need to:

### PART A: Create Cloud Run Job (Uses your Docker image)
- Command: `gcloud run jobs create lfs-builder ...`
- Time: 2 minutes
- What it does: Tells Google Cloud how to run your image

### PART B: Set Permissions (Uses your service accounts)
- Commands: `gcloud projects add-iam-policy-binding ...`
- Time: 3 minutes
- What it does: Lets Cloud Function talk to Cloud Run

### PART C: Deploy Cloud Function (Uses OAuth client)
- Command: `firebase deploy --only functions`
- Time: 3 minutes
- What it does: Uploads your Node.js code

### PART D: Deploy Website (Uses OAuth client for Firebase)
- Command: `firebase deploy --only hosting`
- Time: 2 minutes
- What it does: Uploads your website

### PART E: Test Everything (Uses all the above)
- Visit: `https://alfs-bd1e0.firebaseapp.com`
- Submit a test build
- Watch it work!

---

## 🎯 RIGHT NOW - DO THIS IMMEDIATELY

### COPY-PASTE THESE 3 COMMANDS (in order):

#### Command 1:
```powershell
$PROJECT_ID = "alfs-bd1e0"
```
*Press Enter*

#### Command 2:
```powershell
gcloud auth configure-docker gcr.io
```
*Press Enter* (wait ~30 seconds)

#### Command 3:
```powershell
docker push gcr.io/${PROJECT_ID}/lfs-builder:latest
```
*Press Enter* (wait ~5 minutes - this is the big upload!)

---

## ✅ HOW TO KNOW IF IT'S WORKING

### While Uploading:
```
You'll see lots of:
Pushing layer 1/16
Pushing layer 2/16
...
[================================================>] 500MB/500MB
```

This is NORMAL - just let it run!

### When Done:
```
Successfully pushed gcr.io/alfs-bd1e0/lfs-builder:latest
```

When you see this → ✅ IMAGE IS PUSHED! 🎉

---

## 🆘 IF SOMETHING GOES WRONG

### Problem: "Not authenticated"
**Fix**: Run `gcloud auth login` and follow browser

### Problem: "Docker daemon not running"
**Fix**: Open Docker Desktop and wait 30 seconds

### Problem: "Permission denied"
**Fix**: Make sure you ran `gcloud auth configure-docker gcr.io`

### Problem: Upload stuck or slow
**Fix**: Be patient! Upload can take 5-10 minutes for 1.6GB

### Problem: "Image not found"
**Fix**: Verify Docker image exists: `docker images | Select-String "lfs-builder"`

---

## 📊 AFTER IMAGE IS PUSHED (THEN WHAT?)

Once you see "Successfully pushed...", reply to me and I'll give you:

1. **Create Cloud Run Job** commands (copy-paste)
2. **Set Permissions** commands (copy-paste)
3. **Deploy Cloud Function** commands (copy-paste)
4. **Deploy Website** commands (copy-paste)
5. **Test** instructions

Each part is copy-paste, just like this!

---

## 🎓 WHAT'S HAPPENING

```
Your Computer                    Google Cloud
    ↓                               ↓
 Docker Image ─────────────────> Artifact Registry
                                      ↓
                                   (stored)
                                      ↓
         Cloud Run Job ◄─── (will pull from here)
         Cloud Function ◄── (will start jobs)
         Website ◄─────────── (you upload here)
```

---

## 📝 QUICK REFERENCE

### Your Project Details:
```
Project ID: alfs-bd1e0
Docker Image: gcr.io/alfs-bd1e0/lfs-builder:latest
OAuth Client ID: 92549920661-qtlcva684qaosdtddlc8om9d8potmf79.apps.googleusercontent.com
```

### Three Commands to Run:
```powershell
$PROJECT_ID = "alfs-bd1e0"
gcloud auth configure-docker gcr.io
docker push gcr.io/${PROJECT_ID}/lfs-builder:latest
```

### Expected Time:
- Authenticate: 30 seconds
- Upload: 5-10 minutes

**Total**: ~10 minutes

---

## ✅ WHAT YOU SHOULD DO RIGHT NOW

1. **Copy the 3 commands above** (or from next section)
2. **Open PowerShell**
3. **Paste command 1** → Press Enter
4. **Paste command 2** → Press Enter (wait 30 sec)
5. **Paste command 3** → Press Enter (wait 5-10 min)
6. **Wait for "Successfully pushed"** ✅
7. **Tell me when done!** 👉 I'll give you the next steps

---

## 🚀 READY? LET'S GO!

**Start with these 3 commands:**

```powershell
# Command 1: Set project
$PROJECT_ID = "alfs-bd1e0"

# Command 2: Authenticate
gcloud auth configure-docker gcr.io

# Command 3: Upload (takes 5-10 min)
docker push gcr.io/${PROJECT_ID}/lfs-builder:latest
```

**Run them in order, then tell me when done!**

---

**Status**: ✅ OAuth created | ⏳ Image needs to push  
**Next**: Push Docker image  
**Time**: 10 minutes (mostly waiting)  
**Difficulty**: Very Easy (just copy-paste)
