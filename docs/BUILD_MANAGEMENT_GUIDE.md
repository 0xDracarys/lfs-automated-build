# 🚀 LFS Build Management - Complete User Guide

**Last Updated:** November 6, 2025  
**Status:** Build 3982c67e deployed, tool verification fix applied

---

## 📋 Table of Contents

1. [Current Status](#current-status)
2. [Cleanup Process](#cleanup-process)
3. [Preventing Concurrent Builds](#preventing-concurrent-builds)
4. [How to Download Build Output](#how-to-download-build-output)
5. [What to Do After Download](#what-to-do-after-download)
6. [Automated Cleanup](#automated-cleanup)
7. [Troubleshooting](#troubleshooting)

---

## ✅ Current Status

### **Completed:**
- ✅ Build 3982c67e: Successfully built and deployed
- ✅ Docker image SHA: `d633ef465e080b38b053fc20233a4eb893737a9362e12340e7f77a4f91418da4`
- ✅ Tool verification bug fixed (`makeinfo`/`diff` command names)
- ✅ Cloud Run Job updated with latest image
- ✅ **16 failed builds deleted** from archive

### **Remaining Issues:**
- ⚠️ 11 builds stuck in "RUNNING" status (actually completed and failed)
- ⚠️ Latest test build `FINAL-TEST-VERIFIED-FIX` also failed (needs investigation)
- ⚠️ System allows multiple concurrent builds (needs prevention mechanism)

---

## 🧹 Cleanup Process

### **Manual Cleanup via Web Interface**

**Step 1: Access Build Archive**
```
URL: https://alfs-bd1e0.web.app/build-archive.html
```

**Step 2: Delete Stuck "RUNNING" Builds**

These builds show as "RUNNING" but are actually failed:

1. Click **"🔄 Running"** filter button
2. You'll see 11 builds marked as RUNNING
3. For each build, click **"🗑️ Delete"** button
4. Confirm deletion

**Alternative: Bulk Delete Failed Builds**
1. Click **"🗑️ Delete All Failed Builds"** button
2. Confirm deletion
3. System will delete all builds with status = FAILED
4. Note: Stuck "RUNNING" builds won't be deleted this way

**Step 3: Clean Old Builds (Optional)**
1. Click **"🕐 Delete Builds Older Than 30 Days"**
2. System automatically deletes builds created >30 days ago
3. Useful for freeing up storage

---

## 🚫 Preventing Concurrent Builds

### **Problem:**
Currently, the system allows multiple builds to run simultaneously, which can:
- Consume excessive resources
- Make debugging harder
- Cause race conditions in storage

### **Solution: Build Queue System**

We need to modify the Cloud Function to check for running builds before starting a new one.

**File to Modify:** `functions/index.js`

**Add to `processBuildRequest` function:**

```javascript
exports.processBuildRequest = onDocumentCreated('build-requests/{buildId}', async (event) => {
    const buildId = event.params.buildId;
    const buildData = event.data.data();
    
    // ✅ NEW: Check for running builds
    const runningBuildsQuery = await admin.firestore()
        .collection('builds')
        .where('status', '==', 'RUNNING')
        .get();
    
    if (!runningBuildsQuery.empty) {
        console.log(`❌ Build ${buildId} blocked: ${runningBuildsQuery.size} build(s) already running`);
        
        // Mark as QUEUED instead of starting immediately
        await admin.firestore().collection('builds').doc(buildId).update({
            status: 'QUEUED',
            queuedReason: `Waiting for ${runningBuildsQuery.size} running build(s) to complete`,
            queuedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        return;
    }
    
    // ... rest of existing code (start Cloud Run Job)
});
```

**Add Queue Processor Function:**

```javascript
// Process queued builds when a build completes
exports.processQueuedBuilds = onDocumentUpdated('builds/{buildId}', async (event) => {
    const newStatus = event.data.after.data().status;
    const oldStatus = event.data.before.data().status;
    
    // Only trigger when a build completes
    if (oldStatus === 'RUNNING' && (newStatus === 'SUCCESS' || newStatus === 'FAILED')) {
        console.log('✅ Build completed, checking queue...');
        
        // Find oldest queued build
        const queuedBuild = await admin.firestore()
            .collection('builds')
            .where('status', '==', 'QUEUED')
            .orderBy('queuedAt', 'asc')
            .limit(1)
            .get();
        
        if (!queuedBuild.empty) {
            const nextBuild = queuedBuild.docs[0];
            console.log(`🚀 Starting queued build: ${nextBuild.id}`);
            
            // Start the next build
            // ... (copy Cloud Run Job execution code from processBuildRequest)
        }
    }
});
```

**Deploy the updated functions:**
```powershell
cd functions
firebase deploy --only functions:processBuildRequest,functions:processQueuedBuilds
```

---

## 📥 How to Download Build Output

### **Method 1: Web Interface (Easiest)**

**Step 1: Navigate to Build Archive**
```
https://alfs-bd1e0.web.app/build-archive.html
```

**Step 2: Filter for Successful Builds**
- Click **"✅ Successful"** filter button
- You'll see only builds with status = SUCCESS

**Step 3: Download**
- Find your build in the list
- Click **"📥 Download"** button
- Browser will download `output.tar.gz` file
- File size: ~1-2 GB (full LFS compilation)

### **Method 2: Google Cloud Storage (Direct)**

**Using Web Console:**
```
1. Go to: https://console.cloud.google.com/storage/browser/alfs-bd1e0-builds
2. Find folder with your Build ID (e.g., HgAIFG1zubY8e36cdjB1)
3. Click on "output.tar.gz"
4. Click "Download"
```

**Using gsutil command:**
```powershell
# List outputs for specific build
gsutil ls gs://alfs-bd1e0-builds/YOUR_BUILD_ID/

# Download output
gsutil cp gs://alfs-bd1e0-builds/YOUR_BUILD_ID/output.tar.gz ./

# Example:
gsutil cp gs://alfs-bd1e0-builds/HgAIFG1zubY8e36cdjB1/output.tar.gz ./
```

### **Method 3: Firebase Storage (Alternative)**

**Using Firebase Console:**
```
1. Go to: https://console.firebase.google.com/project/alfs-bd1e0/storage
2. Navigate to build folder
3. Download output.tar.gz
```

---

## 🎯 What to Do After Download

### **Step 1: Extract the Output**

**On Windows (PowerShell):**
```powershell
# Extract using tar (Windows 10+)
tar -xzf output.tar.gz

# Alternative: Use 7-Zip
7z x output.tar.gz
7z x output.tar
```

**On Linux/Mac:**
```bash
tar -xzf output.tar.gz
```

### **Step 2: Understand the Contents**

**Expected Directory Structure:**
```
output/
├── lfs-system/           # Compiled LFS filesystem
│   ├── bin/              # Essential binaries
│   ├── sbin/             # System binaries
│   ├── lib/              # Shared libraries
│   ├── usr/              # User programs
│   ├── etc/              # Configuration files
│   └── boot/             # Bootloader files
│
├── toolchain/            # Cross-compilation tools
│   ├── bin/              # gcc, g++, make, etc.
│   └── lib/              # Toolchain libraries
│
├── logs/                 # Build logs per package
│   ├── binutils.log
│   ├── gcc-pass1.log
│   ├── glibc.log
│   ├── gcc-pass2.log
│   └── ... (one log per package)
│
└── metadata.json         # Build information
```

**Check metadata.json:**
```powershell
# View build info
cat metadata.json

# Example content:
{
  "buildId": "HgAIFG1zubY8e36cdjB1",
  "projectName": "FINAL-TEST-VERIFIED-FIX",
  "lfsVersion": "12.0",
  "buildTimestamp": "2025-11-06T13:19:50Z",
  "packages": [
    {"name": "binutils-2.41", "status": "success"},
    {"name": "gcc-13.2.0-pass1", "status": "success"},
    {"name": "glibc-2.38", "status": "success"}
  ]
}
```

### **Step 3: Verify the Build**

**Check for Errors:**
```powershell
# Search for errors in logs
Get-ChildItem logs/*.log | Select-String "error" -Context 2

# Check if all essential binaries exist
Test-Path lfs-system/bin/bash
Test-Path lfs-system/bin/sh
Test-Path lfs-system/sbin/init
```

### **Step 4: Test in VirtualBox**

**Create New VM:**
1. Open VirtualBox
2. Click "New"
3. Settings:
   - Name: `LFS-Test`
   - Type: `Linux`
   - Version: `Other Linux (64-bit)`
   - Memory: `4096 MB` (4 GB)
   - Hard Disk: `Create a virtual hard disk now`

**Configure Virtual Disk:**
1. Disk type: `VDI (VirtualBox Disk Image)`
2. Storage: `Dynamically allocated`
3. Size: `20 GB`

**Attach LFS System:**

**Option A: Create bootable ISO**
```powershell
# Install genisoimage (or use mkisofs)
# On Windows, download from: https://sourceforge.net/projects/tumagcc/

# Create ISO
genisoimage -o lfs-system.iso -b boot/grub/stage2_eltorito -no-emul-boot -boot-load-size 4 -boot-info-table -R -J lfs-system/
```

**Option B: Use disk image directly**
```powershell
# Convert directory to VDI
VBoxManage convertfromraw lfs-system.img lfs-system.vdi --format VDI

# Attach to VM
VBoxManage storageattach "LFS-Test" --storagectl "SATA" --port 0 --device 0 --type hdd --medium lfs-system.vdi
```

**Option C: Network boot (Advanced)**
- Set up PXE server
- Boot VM from network
- Load LFS system via TFTP

**Boot and Test:**
1. Start the VM
2. Watch boot process
3. Expected boot messages:
   ```
   Starting Linux From Scratch...
   Mounting /proc...
   Mounting /sys...
   Starting init...
   ```
4. Login prompt should appear
5. Test basic commands:
   ```bash
   # Check kernel
   uname -a
   
   # Check installed packages
   ls /bin
   ls /usr/bin
   
   # Test compiler
   gcc --version
   
   # Test basic tools
   ls -la /
   cat /etc/os-release
   ```

### **Step 5: Troubleshooting Boot Issues**

**If VM doesn't boot:**

1. **Check bootloader:**
   ```
   # Verify GRUB installation
   ls lfs-system/boot/grub/
   cat lfs-system/boot/grub/grub.cfg
   ```

2. **Check kernel:**
   ```
   ls lfs-system/boot/vmlinuz*
   ```

3. **Check init system:**
   ```
   ls lfs-system/sbin/init
   file lfs-system/sbin/init
   ```

4. **Review build logs:**
   ```powershell
   # Check if kernel was built
   cat logs/linux-kernel.log
   
   # Check if GRUB was installed
   cat logs/grub.log
   ```

---

## 🤖 Automated Cleanup

### **Cloud Function for Auto-Cleanup**

Add this to `functions/index.js`:

```javascript
// Run daily at midnight
exports.cleanupOldBuilds = onSchedule('0 0 * * *', async (context) => {
    console.log('🧹 Starting daily cleanup...');
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Find old failed builds
    const oldBuilds = await admin.firestore()
        .collection('builds')
        .where('status', '==', 'FAILED')
        .where('createdAt', '<', thirtyDaysAgo)
        .get();
    
    console.log(`Found ${oldBuilds.size} old failed builds`);
    
    // Delete from Firestore
    const batch = admin.firestore().batch();
    oldBuilds.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    
    // Delete from Storage
    const bucket = admin.storage().bucket('alfs-bd1e0-builds');
    for (const doc of oldBuilds.docs) {
        const buildId = doc.id;
        await bucket.deleteFiles({
            prefix: `${buildId}/`
        });
        console.log(`✅ Deleted storage for build: ${buildId}`);
    }
    
    console.log('✅ Cleanup complete');
});
```

**Deploy:**
```powershell
firebase deploy --only functions:cleanupOldBuilds
```

### **Manual Cleanup Script**

Create `cleanup-builds.ps1`:

```powershell
# Cleanup script for LFS builds
param(
    [int]$DaysOld = 30,
    [switch]$DryRun
)

Write-Host "🧹 LFS Build Cleanup Script" -ForegroundColor Cyan
Write-Host "Deleting builds older than $DaysOld days..." -ForegroundColor Yellow

if ($DryRun) {
    Write-Host "[DRY RUN MODE - No changes will be made]" -ForegroundColor Magenta
}

# Calculate cutoff date
$cutoffDate = (Get-Date).AddDays(-$DaysOld).ToString("yyyy-MM-ddTHH:mm:ss")

# Get old builds
$builds = gcloud firestore export-data --collection=builds --project=alfs-bd1e0 | ConvertFrom-Json

$count = 0
foreach ($build in $builds) {
    if ($build.createdAt -lt $cutoffDate -and $build.status -eq "FAILED") {
        $buildId = $build.id
        Write-Host "Deleting build: $buildId" -ForegroundColor Red
        
        if (-not $DryRun) {
            # Delete from Firestore
            gcloud firestore documents delete "builds/$buildId" --project=alfs-bd1e0 --quiet
            
            # Delete from Storage
            gsutil -m rm -r "gs://alfs-bd1e0-builds/$buildId/"
        }
        
        $count++
    }
}

Write-Host "✅ Deleted $count builds" -ForegroundColor Green
```

**Usage:**
```powershell
# Dry run (preview only)
.\cleanup-builds.ps1 -DaysOld 30 -DryRun

# Actual cleanup
.\cleanup-builds.ps1 -DaysOld 30
```

---

## 🐛 Troubleshooting

### **Issue: Build Stuck in "RUNNING" Status**

**Cause:** Cloud Run Job completed but didn't update Firestore status

**Solution:**
```powershell
# Check if execution actually completed
gcloud run jobs executions list --job=lfs-builder --region=us-central1 --project=alfs-bd1e0 --limit=5

# Manually update status in Firestore
# (Use Firebase Console)
1. Go to: https://console.firebase.google.com/project/alfs-bd1e0/firestore
2. Find the build document
3. Change status from "RUNNING" to "FAILED"
4. Add field: completedAt = [current timestamp]
```

### **Issue: Multiple Builds Running Simultaneously**

**Cause:** No concurrency control implemented

**Solution:** Follow [Preventing Concurrent Builds](#preventing-concurrent-builds) section above

### **Issue: Download Button Doesn't Work**

**Cause:** GCS bucket permissions or missing output file

**Check:**
```powershell
# Verify file exists
gsutil ls gs://alfs-bd1e0-builds/YOUR_BUILD_ID/

# Check bucket permissions
gsutil iam get gs://alfs-bd1e0-builds/

# Make bucket publicly readable (if needed)
gsutil iam ch allUsers:objectViewer gs://alfs-bd1e0-builds/
```

### **Issue: Build Fails at Tool Verification**

**Cause:** Build 3982c67e should have fixed this, but check logs

**Verify Fix:**
```powershell
# Check which image is deployed
gcloud container images describe gcr.io/alfs-bd1e0/lfs-builder:latest --format="value(image_summary.digest)"

# Should be: sha256:d633ef465e080b38b053fc20233a4eb893737a9362e12340e7f77a4f91418da4
```

**If wrong image:**
```powershell
# Force update to correct image
gcloud run jobs update lfs-builder --image gcr.io/alfs-bd1e0/lfs-builder@sha256:d633ef465e080b38b053fc20233a4eb893737a9362e12340e7f77a4f91418da4 --region us-central1 --project alfs-bd1e0
```

---

## 📝 Summary Checklist

**Before Starting New Build:**
- [ ] Check no other builds are running
- [ ] Verify latest Docker image is deployed
- [ ] Clean up old failed builds

**During Build:**
- [ ] Monitor via build-status.html
- [ ] Watch Cloud Run logs
- [ ] Note any errors immediately

**After Build Completes:**
- [ ] Download output.tar.gz
- [ ] Extract and verify contents
- [ ] Check logs for errors
- [ ] Test in VirtualBox

**If Build Fails:**
- [ ] Check logs for root cause
- [ ] Delete failed build from archive
- [ ] Fix issue and retry

---

## 🎬 Quick Commands Reference

```powershell
# Check running builds
gcloud run jobs executions list --job=lfs-builder --region=us-central1 --project=alfs-bd1e0

# View logs
gcloud logging read "resource.type=cloud_run_job AND resource.labels.job_name=lfs-builder" --limit=50 --project=alfs-bd1e0

# Download output
gsutil cp gs://alfs-bd1e0-builds/BUILD_ID/output.tar.gz ./

# Extract output
tar -xzf output.tar.gz

# Deploy updated functions
cd functions
firebase deploy --only functions
```

---

**Next Steps:**
1. ✅ Cleanup stuck "RUNNING" builds manually
2. ✅ Implement build queue system
3. ✅ Test successful build download
4. ✅ Verify LFS system boots in VirtualBox

**Good luck with your LFS build! 🚀**
