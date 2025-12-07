# 🎯 LFS Build Pipeline - Complete Solution Visual Guide
**Created:** 2025-11-06  
**Purpose:** Quick visual reference for the entire end-to-end system

---

## 🚀 ONE-LINE SUMMARY
User submits form → Firestore → Cloud Function → Pub/Sub → Cloud Function → Cloud Run Job → Compiles LFS → Uploads to GCS → Email notification → User downloads Linux image

---

## 📊 COMPLETE SYSTEM FLOW (Visual)

```
┌──────────────────────────────────────────────────────────────────────┐
│ 1️⃣  UI LAYER (Firebase Hosting)                                     │
│ https://alfs-bd1e0.web.app                                          │
├──────────────────────────────────────────────────────────────────────┤
│ ┌─────────────┐                                                      │
│ │  Web Form   │  User fills: Project Name, LFS Version, Email       │
│ │   Submit    │  JavaScript generates UUID: d04b92ed-cef3-...       │
│ └──────┬──────┘                                                      │
│        │                                                              │
│        ↓ writes document                                             │
└────────┼──────────────────────────────────────────────────────────────┘
         │
         ↓
┌────────┼──────────────────────────────────────────────────────────────┐
│ 2️⃣  DATABASE LAYER (Firestore)                                      │
│ Collection: /builds/{buildId}                                        │
├──────────────────────────────────────────────────────────────────────┤
│ Document Created:                                                     │
│ {                                                                     │
│   buildId: "d04b92ed-cef3-4536-836b-dfec4837064d",                  │
│   projectName: "my-custom-linux",                                    │
│   lfsVersion: "12.2",                                                │
│   email: "user@example.com",                                         │
│   buildOptions: { systemd: true, multilib: false },                 │
│   status: "QUEUED",                                      ← Initial   │
│   timestamp: 1730934830000                                           │
│ }                                                                     │
│                                                                       │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │  Firestore Trigger: onCreate                                    │ │
│ └───────────────────────┬─────────────────────────────────────────┘ │
└─────────────────────────┼───────────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────┼───────────────────────────────────────────┐
│ 3️⃣  CLOUD FUNCTION #1 (onBuildSubmitted)                           │
│ functions/index.js (lines 1-50)                                      │
├──────────────────────────────────────────────────────────────────────┤
│ const spanId = startSpan('BuildPipeline', 'onBuildSubmitted');      │
│                                                                       │
│ 1. Read build document from Firestore                                │
│ 2. Update status: QUEUED → PENDING                                   │
│ 3. Publish message to Pub/Sub topic "lfs-build-requests"            │
│    Message payload:                                                   │
│    {                                                                  │
│      buildId: "d04b92ed-cef3-...",                                  │
│      config: { projectName, lfsVersion, email, buildOptions }       │
│    }                                                                  │
│ 4. Log with trace context: { traceId, buildId, userId }             │
│                                                                       │
│ endSpan(spanId, 'success');                                          │
│                                                                       │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │  Publishes to Pub/Sub                                           │ │
│ └───────────────────────┬─────────────────────────────────────────┘ │
└─────────────────────────┼───────────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────┼───────────────────────────────────────────┐
│ 4️⃣  PUB/SUB TOPIC (lfs-build-requests)                             │
│ Async Message Queue                                                  │
├──────────────────────────────────────────────────────────────────────┤
│ Message stored in queue with:                                        │
│ - Retention: 7 days                                                  │
│ - Delivery guarantee: At-least-once                                  │
│ - Max delivery attempts: 5                                           │
│ - Dead letter queue: lfs-build-requests-dlq (for failures)          │
│                                                                       │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │  Triggers Cloud Function #2                                     │ │
│ └───────────────────────┬─────────────────────────────────────────┘ │
└─────────────────────────┼───────────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────┼───────────────────────────────────────────┐
│ 5️⃣  CLOUD FUNCTION #2 (executeLfsBuild)                            │
│ functions/index.js (lines 51-100)                                    │
├──────────────────────────────────────────────────────────────────────┤
│ const spanId = startSpan('BuildPipeline', 'executeLfsBuild');       │
│                                                                       │
│ 1. Parse Pub/Sub message payload                                     │
│ 2. Update Firestore: PENDING → RUNNING                               │
│ 3. Execute Cloud Run Job via gcloud CLI:                             │
│                                                                       │
│    const configJson = JSON.stringify(config);                        │
│    const command = `gcloud run jobs execute lfs-builder \            │
│                      --region=us-central1 \                          │
│                      --set-env-vars="LFS_CONFIG_JSON=${configJson},\ │
│                                      GCS_BUCKET=alfs-bd1e0-builds,\  │
│                                      BUILD_ID=${buildId}" \          │
│                      --wait`;                                        │
│                                                                       │
│    const { stdout, stderr } = await execAsync(command);              │
│                                                                       │
│ 4. Log execution start with trace context                            │
│                                                                       │
│ endSpan(spanId, 'success');                                          │
│                                                                       │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │  Triggers Cloud Run Job                                         │ │
│ └───────────────────────┬─────────────────────────────────────────┘ │
└─────────────────────────┼───────────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────┼───────────────────────────────────────────┐
│ 6️⃣  CLOUD RUN JOB (lfs-builder)                                    │
│ gcr.io/alfs-bd1e0/lfs-builder:latest                                │
│ Region: us-central1 | Timeout: 4 hours | Memory: 8 GiB | CPU: 4     │
├──────────────────────────────────────────────────────────────────────┤
│ Entry Point: ./lfs-build.sh                                          │
│                                                                       │
│ Environment Variables Received:                                      │
│ - LFS_CONFIG_JSON: {"projectName":"my-custom-linux",...}            │
│ - GCS_BUCKET: alfs-bd1e0-builds                                      │
│ - BUILD_ID: d04b92ed-cef3-4536-836b-dfec4837064d                    │
│                                                                       │
│ Build Process (inside Docker container):                             │
│                                                                       │
│ 1. Parse LFS_CONFIG_JSON                                             │
│    #!/bin/bash                                                       │
│    CONFIG=$(echo $LFS_CONFIG_JSON | jq -r '.')                      │
│    PROJECT_NAME=$(echo $CONFIG | jq -r '.projectName')              │
│    LFS_VERSION=$(echo $CONFIG | jq -r '.lfsVersion')                │
│                                                                       │
│ 2. Download LFS source packages                                      │
│    wget http://ftp.gnu.org/gnu/gcc/gcc-12.2.0.tar.xz                │
│    sha256sum -c gcc-12.2.0.sha256  # Verify integrity               │
│                                                                       │
│ 3. Compile LFS toolchain (Phase 1)                                   │
│    - binutils (assembler, linker)                                    │
│    - gcc (C compiler)                                                │
│    - glibc (standard library)                                        │
│                                                                       │
│ 4. Compile system packages (Phase 2)                                 │
│    - bash, coreutils, util-linux, systemd, etc.                     │
│    - 80+ packages, 2-4 hours total                                   │
│                                                                       │
│ 5. Create root filesystem structure                                  │
│    /bin, /boot, /dev, /etc, /home, /lib, /mnt, /opt, /root, ...    │
│                                                                       │
│ 6. Package result as .tar.gz                                         │
│    tar -czf lfs-system.tar.gz -C /mnt/lfs .                         │
│                                                                       │
│ 7. Upload to Google Cloud Storage                                    │
│    gsutil cp lfs-system.tar.gz \                                     │
│      gs://alfs-bd1e0-builds/${BUILD_ID}/lfs-system.tar.gz           │
│    gsutil cp build.log \                                             │
│      gs://alfs-bd1e0-builds/${BUILD_ID}/build.log                   │
│    echo '{"version":"12.2","packages":80}' | \                      │
│      gsutil cp - gs://alfs-bd1e0-builds/${BUILD_ID}/manifest.json   │
│                                                                       │
│ 8. Exit with code 0 (success) or 1 (failure)                        │
│                                                                       │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │  Job Completes → Triggers Completion Event                      │ │
│ └───────────────────────┬─────────────────────────────────────────┘ │
└─────────────────────────┼───────────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────┼───────────────────────────────────────────┐
│ 7️⃣  CLOUD FUNCTION #3 (onBuildComplete)                            │
│ functions/index.js (lines 101-150)                                   │
├──────────────────────────────────────────────────────────────────────┤
│ const spanId = startSpan('BuildPipeline', 'onBuildComplete');       │
│                                                                       │
│ 1. Detect Cloud Run Job completion (Pub/Sub or polling)             │
│ 2. Query job status: SUCCESS or FAILED                               │
│ 3. Generate signed GCS download URL (valid 7 days)                   │
│                                                                       │
│    const [url] = await storage                                       │
│      .bucket('alfs-bd1e0-builds')                                    │
│      .file(`${buildId}/lfs-system.tar.gz`)                          │
│      .getSignedUrl({                                                 │
│        action: 'read',                                               │
│        expires: Date.now() + 7 * 24 * 60 * 60 * 1000  // 7 days    │
│      });                                                             │
│                                                                       │
│ 4. Update Firestore:                                                 │
│    {                                                                  │
│      status: "SUCCESS",                                ← Updated     │
│      downloadUrl: "https://storage.googleapis.com/...",             │
│      completedAt: 1730945630000,                                     │
│      duration: "3h 15m"                                              │
│    }                                                                  │
│                                                                       │
│ 5. Send email notification via SendGrid/SMTP                         │
│                                                                       │
│    Subject: "Your LFS Build is Ready!"                               │
│    Body:                                                              │
│    Hi there,                                                          │
│                                                                       │
│    Your custom Linux From Scratch system is ready to download!      │
│                                                                       │
│    Build ID: d04b92ed-cef3-4536-836b-dfec4837064d                   │
│    Project: my-custom-linux                                          │
│    LFS Version: 12.2                                                 │
│    Build Duration: 3 hours 15 minutes                                │
│                                                                       │
│    Download your system: [Download Link]                             │
│    (Link expires in 7 days)                                          │
│                                                                       │
│    View build logs: [Logs Link]                                      │
│                                                                       │
│ 6. Log completion with trace context                                 │
│                                                                       │
│ endSpan(spanId, 'success');                                          │
│                                                                       │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │  Email Sent to User                                             │ │
│ └───────────────────────┬─────────────────────────────────────────┘ │
└─────────────────────────┼───────────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────┼───────────────────────────────────────────┐
│ 8️⃣  STORAGE LAYER (Google Cloud Storage)                           │
│ Bucket: gs://alfs-bd1e0-builds                                      │
├──────────────────────────────────────────────────────────────────────┤
│ Files stored:                                                         │
│                                                                       │
│ gs://alfs-bd1e0-builds/d04b92ed-cef3.../                            │
│ ├── lfs-system.tar.gz          (2.5 GB - Main Linux image)          │
│ ├── build.log                   (50 MB - Full compilation log)       │
│ └── manifest.json               (5 KB - Package versions list)       │
│                                                                       │
│ Access:                                                               │
│ - Public read: Yes (for download links)                              │
│ - Write: Service account only                                        │
│ - Lifecycle: Auto-delete after 30 days                               │
│                                                                       │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │  User Receives Email with Download Link                         │ │
│ └───────────────────────┬─────────────────────────────────────────┘ │
└─────────────────────────┼───────────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────┼───────────────────────────────────────────┐
│ 9️⃣  USER DOWNLOADS & USES                                          │
├──────────────────────────────────────────────────────────────────────┤
│ User clicks download link → Downloads lfs-system.tar.gz             │
│                                                                       │
│ Extract and use:                                                     │
│   tar -xzf lfs-system.tar.gz                                        │
│   chroot lfs-system /bin/bash                                       │
│   # Now inside custom Linux system!                                 │
│                                                                       │
│ Or create bootable media:                                            │
│   dd if=lfs-system.img of=/dev/sdb bs=4M                            │
│   # Boot from USB drive                                             │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 📋 IMPLEMENTATION PHASES (Priority Order)

### ✅ Phase 1: Foundation (COMPLETE)
- Web form UI
- Firestore database
- Docker image with LFS tools
- Cloud Run Job created
- Basic Cloud Function #1

### ⏳ Phase 2: Orchestration (40% COMPLETE - CURRENT PHASE)
**Next Actions:**
1. Create Pub/Sub topic `lfs-build-requests`
2. Update Cloud Function #1 to publish to Pub/Sub
3. Create Cloud Function #2 to execute jobs via gcloud CLI
4. Test end-to-end: form → Firestore → Pub/Sub → Job execution

### ❌ Phase 3: Execution & Storage (NOT STARTED)
**Next Actions:**
1. Create GCS bucket `alfs-bd1e0-builds`
2. Update `lfs-build.sh` to read `LFS_CONFIG_JSON` env var
3. Add GCS upload logic to script
4. Test full build with sample config
5. Verify files appear in GCS bucket

### ❌ Phase 4: Notification & Delivery (NOT STARTED)
**Next Actions:**
1. Create Cloud Function #3 (onBuildComplete)
2. Configure SendGrid or Gmail SMTP
3. Create email template
4. Generate signed GCS URLs
5. Test email delivery

### ❌ Phase 5: Observability (NOT STARTED)
**Next Actions:**
1. Implement structured logging in all functions
2. Add trace context propagation
3. Add span tracking for performance
4. Configure log exports to BigQuery (optional)

### ❌ Phase 6: Security (CRITICAL BEFORE PRODUCTION)
**Next Actions:**
1. Update Firestore rules (restrict access)
2. Audit service account permissions
3. Move secrets to Secret Manager
4. Implement rate limiting
5. Add input validation server-side

### ❌ Phase 7: Client-Side Validation (NOT STARTED)
**Next Actions:**
1. Add email format validation
2. Add project name validation (alphanumeric + hyphens)
3. Make LFS version a dropdown (prevent invalid input)
4. Add real-time feedback for invalid fields
5. Disable submit button during submission

---

## 🎯 DATA FLOW SUMMARY

### What's Working Now ✅
```
Web Form → Firestore ✅
Firestore → Cloud Function #1 (basic version) ✅
Docker Image → Cloud Run Job (manual trigger) ✅
```

### What's Blocked 🚧
```
Cloud Function #1 → Cloud Run Job ❌ (no direct API)
```

### What Will Work After Phase 2 ⏳
```
Web Form → Firestore → Cloud Function #1 → Pub/Sub → Cloud Function #2 → Cloud Run Job
```

### What Will Work After Phase 3 ⏳
```
Full pipeline: Form → Firestore → Pub/Sub → Job → Compile LFS → Upload to GCS
```

### What Will Work After Phase 4 ⏳
```
Complete system: Form → Build → Store → Email → User downloads Linux image
```

---

## 🔑 KEY TECHNICAL DECISIONS

### Decision 1: Pub/Sub Instead of Direct API Call
**Why:** Cloud Run Jobs have no public REST API  
**Benefit:** Decouples functions, enables async processing, better error handling  
**Trade-off:** Slightly more complex architecture (3 components instead of 2)

### Decision 2: gcloud CLI Instead of SDK
**Why:** No official Node.js SDK for executing Cloud Run Jobs  
**Benefit:** Works reliably, built-in authentication  
**Trade-off:** Requires gcloud CLI in Cloud Function environment (adds startup time)

### Decision 3: Anonymous Auth for MVP
**Why:** Faster launch, no OAuth setup required  
**Benefit:** Users can submit builds without account creation  
**Trade-off:** No build history per user (deferred to Phase 8)

### Decision 4: Temporary Open Firestore Rules
**Why:** Cloud Function write access was blocked by secure rules  
**Benefit:** Unblocks development, allows rapid iteration  
**Trade-off:** Security risk - MUST fix before production (Phase 6)

### Decision 5: Structured Logging from Start
**Why:** Production debugging is impossible without proper logs  
**Benefit:** Root cause analysis in minutes instead of hours  
**Trade-off:** Slightly more code upfront (worth it)

---

## 🧪 TESTING STRATEGY

### Manual Testing (After Each Phase)
1. **Phase 2:** Submit form → Check Pub/Sub message → Verify job starts
2. **Phase 3:** Wait for job completion → Check GCS for files
3. **Phase 4:** Verify email received → Click download link → Extract .tar.gz
4. **End-to-End:** Full user journey from form to bootable Linux system

### Automated Testing (Playwright MCP)
```javascript
// Test Script (to be run after Phase 2)
1. Navigate to https://alfs-bd1e0.web.app
2. Fill form fields:
   - Project Name: "playwright-test-build"
   - LFS Version: "12.2"
   - Email: "test@example.com"
   - Options: systemd=true
3. Click "Start Build"
4. Capture Build ID from success message
5. Query Firestore for document
6. Assert status === "PENDING"
7. Wait 10 seconds
8. Query Pub/Sub for message
9. Assert message exists with correct buildId
10. Monitor Cloud Run Jobs (via gcloud CLI)
11. Assert job is running
```

---

## 📞 QUICK REFERENCE

### Project Details
- **GCP Project ID:** alfs-bd1e0
- **Firebase Project:** alfs-bd1e0
- **Hosting URL:** https://alfs-bd1e0.web.app
- **Cloud Run Region:** us-central1
- **Pub/Sub Topic:** lfs-build-requests
- **GCS Bucket:** gs://alfs-bd1e0-builds
- **Docker Image:** gcr.io/alfs-bd1e0/lfs-builder:latest

### Key Commands
```powershell
# Deploy functions
firebase deploy --only functions

# Deploy hosting
firebase deploy --only hosting

# Create Pub/Sub topic
gcloud pubsub topics create lfs-build-requests --project=alfs-bd1e0

# Create GCS bucket
gcloud storage buckets create gs://alfs-bd1e0-builds --project=alfs-bd1e0 --location=us-central1

# Build and push Docker image
gcloud builds submit --tag gcr.io/alfs-bd1e0/lfs-builder:latest

# Manually trigger job (for testing)
gcloud run jobs execute lfs-builder --region=us-central1
```

---

## 🎉 FINAL RESULT

**What the user gets:**
- Custom-compiled Linux From Scratch system (2.5 GB .tar.gz)
- Full build logs (50 MB text file)
- Package manifest (JSON with all installed packages and versions)
- Email notification with download link (valid 7 days)

**Use cases:**
- Educational: Learn how Linux is built from source
- Embedded systems: Minimal custom Linux for IoT devices
- Security: Fully auditable system (know every package)
- Performance: Optimized for specific hardware

---

**Ready to proceed with implementation? The IKB is now your roadmap!**

**START HERE:** `/docs/main.md`  
**NEXT STEPS:** Phase 2 implementation (see current.md for detailed actions)
