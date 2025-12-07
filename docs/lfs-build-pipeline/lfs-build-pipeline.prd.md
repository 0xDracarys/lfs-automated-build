# LFS Build Pipeline - Product Requirements Document
**Feature:** Linux From Scratch Automated Build Pipeline  
**Status:** 🚧 In Progress (30% Complete)  
**Owner:** J (ZenType Architect)  
**Last Updated:** 2025-11-06

---

## 🎯 Objectives

### Primary Goal
Create a fully automated, end-to-end pipeline that allows users to submit LFS build configurations via a web form and receive a compiled Linux image without manual intervention.

### Success Criteria
1. ✅ User can submit build configuration through web UI
2. ✅ Build request is stored in Firestore with UUID
3. ⏳ Cloud Function detects new build and triggers execution
4. ❌ Cloud Run Job executes LFS compilation
5. ❌ Final image is stored in GCS bucket
6. ❌ User receives email notification with download link
7. ❌ User can download the compiled LFS system

### Business Value
- **Time Savings:** Eliminates 8-12 hours of manual LFS compilation per build
- **Accessibility:** Non-experts can create custom Linux systems
- **Scalability:** Parallel builds supported via Cloud Run Jobs
- **Reliability:** Automated process reduces human error

---

## 📋 Implementation Checklist

### Phase 1: Foundation (✅ Complete)
- [x] Firebase project setup (alfs-bd1e0)
- [x] Firestore database initialized
- [x] Firebase Hosting configured
- [x] Basic web form created (index.html)
- [x] Firebase SDK integrated (anonymous auth)
- [x] Form submission writes to Firestore /builds collection
- [x] Docker image created with LFS build tools
- [x] Cloud Run Job (lfs-builder) created

### Phase 2: Orchestration Layer (⏳ In Progress - 40%)
- [x] Cloud Function #1 created (onBuildSubmitted)
- [x] Firestore trigger configured on /builds/{buildId}
- [x] Status updates working (QUEUED → PENDING)
- [ ] Pub/Sub topic created (lfs-build-requests)
- [ ] Cloud Function #1 publishes to Pub/Sub
- [ ] Cloud Function #2 created (executeLfsBuild)
- [ ] Cloud Function #2 subscribes to Pub/Sub
- [ ] Cloud Function #2 executes Cloud Run Job via gcloud CLI

### Phase 3: Execution & Storage (❌ Not Started)
- [ ] LFS build script (lfs-build.sh) reads config from env var
- [ ] Build script compiles LFS packages in order
- [ ] Build script creates root filesystem
- [ ] Build script packages result as .tar.gz
- [ ] GCS bucket created (alfs-bd1e0-builds)
- [ ] Build script uploads image to GCS
- [ ] Build script uploads logs to GCS
- [ ] Cloud Run Job reports completion status

### Phase 4: Notification & Delivery (❌ Not Started)
- [ ] Cloud Function #3 created (onBuildComplete)
- [ ] Function detects Cloud Run Job completion
- [ ] Function updates Firestore with final status
- [ ] Function generates signed GCS download URL
- [ ] Function sends email via SendGrid/SMTP
- [ ] Email template created with download link
- [ ] Download link tested and verified working

### Phase 5: Error Handling & Observability (❌ Not Started)
- [ ] Structured logging implemented in all Cloud Functions
- [ ] Trace context propagation configured
- [ ] Span tracking added to all async operations
- [ ] Error logging before all thrown exceptions
- [ ] Build timeout handling (max 4 hours)
- [ ] Failed build notification email
- [ ] Retry logic for transient failures
- [ ] Dead letter queue for failed messages

### Phase 6: Security & Production Readiness (❌ Not Started)
- [ ] Firestore rules updated (restrict write access)
- [ ] Service account permissions audited
- [ ] API rate limiting implemented
- [ ] Input validation on all form fields
- [ ] XSS protection verified
- [ ] CORS configuration reviewed
- [ ] Secrets moved to Secret Manager
- [ ] Cost monitoring alerts configured

### Phase 7: Client-Side Validation (❌ Not Started)
- [ ] Real-time form field validation
- [ ] Email format validation
- [ ] Project name validation (alphanumeric + hyphens)
- [ ] LFS version dropdown (prevent invalid versions)
- [ ] Build options validation (mutually exclusive checks)
- [ ] File size limits (if config file upload added)
- [ ] Duplicate build submission prevention
- [ ] Form state management (disable submit during submission)

---

## 🔄 Current Status Summary

### What's Working
- Web form submission to Firestore
- Build ID generation (UUID)
- Anonymous Firebase authentication
- Cloud Function triggered on new builds
- Docker image contains all LFS build dependencies

### What's Blocked
- Cloud Function cannot directly call Cloud Run Jobs API (no public REST endpoint)
- Need Pub/Sub intermediary to queue execution requests

### What's Next (Priority Order)
1. Create Pub/Sub topic `lfs-build-requests`
2. Update Cloud Function #1 to publish messages
3. Create Cloud Function #2 to consume messages and execute job
4. Update lfs-build.sh to upload results to GCS
5. Create Cloud Function #3 for completion notification

---

## 🏗️ Technical Architecture

### System Flow (Detailed)
```
┌─────────────────────────────────────────────────────────────────┐
│ USER INTERACTION                                                │
├─────────────────────────────────────────────────────────────────┤
│ 1. User visits https://alfs-bd1e0.web.app                      │
│ 2. Fills form: Project Name, LFS Version, Email, Options       │
│ 3. Clicks "Start Build" button                                 │
│ 4. JavaScript generates UUID (e.g., d04b92ed-cef3-...)         │
│ 5. Writes to Firestore: /builds/{UUID}                         │
│    {                                                            │
│      buildId: "d04b92ed-cef3-...",                            │
│      projectName: "my-lfs-project",                           │
│      lfsVersion: "12.2",                                       │
│      email: "user@example.com",                               │
│      buildOptions: { systemd: true, multilib: false },        │
│      status: "QUEUED",                                        │
│      timestamp: 1730934830000                                 │
│    }                                                            │
│ 6. Display success message with Build ID                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ CLOUD FUNCTION #1: onBuildSubmitted                            │
├─────────────────────────────────────────────────────────────────┤
│ Trigger: Firestore onCreate(/builds/{buildId})                 │
│ Purpose: Queue build for execution                             │
│                                                                 │
│ Actions:                                                        │
│ 1. Log build submission with trace context                     │
│ 2. Update Firestore status: QUEUED → PENDING                   │
│ 3. Publish message to Pub/Sub topic "lfs-build-requests"       │
│    Message payload: { buildId, config }                        │
│ 4. Log success with span tracking                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ PUB/SUB TOPIC: lfs-build-requests                              │
├─────────────────────────────────────────────────────────────────┤
│ Purpose: Decouple Cloud Function from Cloud Run Job execution  │
│ Message retention: 7 days                                       │
│ Delivery guarantees: At-least-once                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ CLOUD FUNCTION #2: executeLfsBuild                             │
├─────────────────────────────────────────────────────────────────┤
│ Trigger: Pub/Sub message on "lfs-build-requests"               │
│ Purpose: Execute Cloud Run Job with build configuration        │
│                                                                 │
│ Actions:                                                        │
│ 1. Parse message payload (buildId, config)                     │
│ 2. Update Firestore status: PENDING → RUNNING                  │
│ 3. Execute via child_process.exec():                           │
│    gcloud run jobs execute lfs-builder \                       │
│      --region=us-central1 \                                    │
│      --set-env-vars="LFS_CONFIG_JSON={config}" \               │
│      --wait                                                     │
│ 4. Log execution start with trace context                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ CLOUD RUN JOB: lfs-builder                                     │
├─────────────────────────────────────────────────────────────────┤
│ Container: gcr.io/alfs-bd1e0/lfs-builder:latest                │
│ Entry point: ./lfs-build.sh                                    │
│ Timeout: 4 hours                                               │
│ Memory: 8 GiB                                                  │
│ CPU: 4 vCPU                                                    │
│                                                                 │
│ Environment Variables:                                          │
│ - LFS_CONFIG_JSON: Full build configuration                    │
│ - GCS_BUCKET: alfs-bd1e0-builds                                │
│ - BUILD_ID: {buildId from config}                             │
│                                                                 │
│ Build Process:                                                  │
│ 1. Parse LFS_CONFIG_JSON                                       │
│ 2. Download LFS source packages (wget)                         │
│ 3. Compile toolchain (binutils, gcc, glibc)                   │
│ 4. Compile system packages (bash, coreutils, etc.)            │
│ 5. Create root filesystem structure                            │
│ 6. Package as lfs-system.tar.gz                                │
│ 7. Upload to gs://alfs-bd1e0-builds/{buildId}/                │
│    - lfs-system.tar.gz (main image)                           │
│    - build.log (full compilation log)                         │
│    - manifest.json (package versions)                         │
│ 8. Exit with code 0 (success) or 1 (failure)                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ CLOUD FUNCTION #3: onBuildComplete                             │
├─────────────────────────────────────────────────────────────────┤
│ Trigger: Cloud Run Job completion event (Pub/Sub or polling)   │
│ Purpose: Notify user and finalize build record                 │
│                                                                 │
│ Actions:                                                        │
│ 1. Detect job completion (success or failure)                  │
│ 2. Generate signed GCS download URL (valid 7 days)             │
│ 3. Update Firestore:                                           │
│    - status: RUNNING → SUCCESS/FAILED                          │
│    - downloadUrl: {signed GCS URL}                             │
│    - completedAt: {timestamp}                                  │
│ 4. Send email notification:                                    │
│    Subject: "Your LFS Build is Ready!"                         │
│    Body: Download link + build details                         │
│ 5. Log completion with trace context                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ USER NOTIFICATION                                               │
├─────────────────────────────────────────────────────────────────┤
│ User receives email with:                                       │
│ - Build ID                                                      │
│ - Project name                                                  │
│ - Build duration                                               │
│ - Download link (expires in 7 days)                           │
│ - Build log link                                               │
│                                                                 │
│ User clicks link → Downloads from GCS → Extracts .tar.gz       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔒 Security Requirements

### Authentication
- Firebase Anonymous Auth (current) - acceptable for MVP
- Future: Google OAuth for personalized build history

### Authorization
- Firestore rules must validate write access
- GCS bucket: Public read (for downloads), restricted write
- Cloud Functions: Service account with minimal permissions

### Data Protection
- No sensitive data in build configs (no passwords/keys)
- Email addresses stored in Firestore (PII - must be protected)
- Build logs may contain system details (sanitize before storage)

### Input Validation
- Client-side: Prevent invalid form submissions
- Server-side: Validate all fields in Cloud Function #1
- LFS version: Whitelist of supported versions only

---

## 📊 Performance Requirements

### Build Time
- Target: 2-4 hours for full LFS build (depends on package count)
- Maximum: 6 hours (Cloud Run Job timeout)

### UI Responsiveness
- Form submission: < 500ms to confirm queued
- Status updates: Real-time via Firestore listeners

### Scalability
- Support 10 concurrent builds (Cloud Run Job limit)
- Queue unlimited builds via Pub/Sub

---

## 🧪 Testing Requirements

### Manual Testing (Playwright MCP)
- Submit build form with valid data
- Verify Firestore document created
- Check Cloud Function #1 logs
- Verify Pub/Sub message published
- Check Cloud Function #2 execution
- Monitor Cloud Run Job progress
- Verify GCS upload
- Test email notification delivery
- Download and extract final image

### Edge Cases
- Invalid email format
- Duplicate project name
- Extremely long project names (>100 chars)
- Build timeout scenario
- GCS upload failure
- Email delivery failure

---

## 📝 Open Questions & Decisions Needed

### 1. Email Service Provider
**Options:**
- A) SendGrid (free tier: 100 emails/day)
- B) AWS SES (requires AWS account)
- C) Gmail SMTP (requires app password)

**Decision:** TBD by user

### 2. Build Artifact Retention
**Question:** How long should we keep compiled LFS images in GCS?  
**Options:**
- 7 days (download link expiration)
- 30 days (1 month grace period)
- Indefinite (costs increase over time)

**Decision:** TBD by user

### 3. Build History Access
**Question:** Should users be able to view past builds?  
**Impact:** Requires authentication + Firestore query UI

**Decision:** TBD by user (defer to Phase 8)

---

**END OF PRD**
