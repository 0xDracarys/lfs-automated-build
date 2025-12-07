# LFS Build Pipeline - Scope Definition
**Feature:** Linux From Scratch Automated Build Pipeline  
**Last Updated:** 2025-11-06  
**Purpose:** Define clear boundaries for what IS and IS NOT in scope for this feature

---

## ✅ WHAT IS IN SCOPE

### Files YOU CAN Modify

#### Frontend (Public Web UI)
```
public/index.html                   # Main build form - ADD validation, improve UX
public/firebase-config.js           # Firebase init - DO NOT expose secrets
public/styles.css                   # Styling - safe to modify
public/app.js                       # Form logic - ADD client-side validation
```

#### Cloud Functions
```
functions/index.js                  # ADD new functions (executeLfsBuild, onBuildComplete)
functions/package.json              # ADD new dependencies (e.g., @google-cloud/pubsub)
```

#### Build Scripts & Docker
```
Dockerfile                          # ADD tools, optimize layers
lfs-build.sh                        # MODIFY to read env vars, upload to GCS
lfs-build.config                    # Template config - safe to modify
docker-entrypoint.sh                # Entry point - ADD logging, error handling
```

#### Database Configuration
```
firestore.rules                     # MUST UPDATE - currently too permissive
firestore.indexes.json              # ADD indexes for query performance
```

#### Firebase Configuration
```
firebase.json                       # Hosting/function settings - safe to modify
.firebaserc                         # Project aliases - READ ONLY
```

#### Documentation (IKB)
```
docs/main.md                        # UPDATE after completing work
docs/lfs-build-pipeline/*.md        # UPDATE current.md, prd.md, errors.md
```

### Features YOU CAN Implement

1. **Pub/Sub Topic Creation**
   - Create topic: `lfs-build-requests`
   - Configure message retention (7 days)
   - Set up dead letter queue

2. **Cloud Function #1 Modification**
   - Import `@google-cloud/pubsub`
   - Replace direct API call with Pub/Sub publish
   - Add structured logging with trace context
   - Add span tracking for performance

3. **Cloud Function #2 Creation**
   - New function: `executeLfsBuild`
   - Trigger: Pub/Sub subscription
   - Use `child_process.exec()` to call gcloud CLI
   - Update Firestore status to RUNNING
   - Add error handling and logging

4. **GCS Bucket Setup**
   - Create bucket: `alfs-bd1e0-builds`
   - Configure lifecycle policy (auto-delete after 30 days)
   - Set public read access (for download links)
   - Restrict write to service account only

5. **LFS Build Script Enhancement**
   - Read `LFS_CONFIG_JSON` environment variable
   - Parse JSON and apply build options
   - Upload final image to GCS: `gs://alfs-bd1e0-builds/{buildId}/lfs-system.tar.gz`
   - Upload logs: `gs://alfs-bd1e0-builds/{buildId}/build.log`
   - Create manifest: `gs://alfs-bd1e0-builds/{buildId}/manifest.json`

6. **Cloud Function #3 Creation**
   - New function: `onBuildComplete`
   - Detect Cloud Run Job completion
   - Generate signed GCS download URL (valid 7 days)
   - Update Firestore with downloadUrl field
   - Send email notification

7. **Client-Side Validation**
   - Email format validation (regex)
   - Project name validation (alphanumeric + hyphens, max 50 chars)
   - LFS version dropdown (prevent manual input)
   - Real-time feedback for invalid fields
   - Disable submit button during submission

8. **Structured Logging**
   - Implement in all Cloud Functions
   - Use JSON format in production
   - Add trace context propagation
   - Span tracking for all async operations
   - Log errors before throwing

### Database Collections YOU CAN Modify
```
/builds/{buildId}                   # ADD fields: downloadUrl, completedAt, errorMessage
/builds/{buildId}/logs/{logId}      # NEW: Stream build logs in real-time (optional)
```

### Environment Variables YOU CAN Add
```
Cloud Functions:
- GCP_PROJECT_ID                    # Project identifier
- PUBSUB_TOPIC                      # lfs-build-requests
- GCS_BUCKET                        # alfs-bd1e0-builds
- SENDGRID_API_KEY                  # Email service (store in Secret Manager)

Cloud Run Job:
- LFS_CONFIG_JSON                   # Build configuration (dynamic per job)
- GCS_BUCKET                        # Storage destination
- BUILD_ID                          # Unique build identifier
```

---

## ❌ WHAT IS NOT IN SCOPE

### Protected Files - DO NOT MODIFY
```
.firebaserc                         # Firebase project config (read-only)
.git/                               # Version control metadata
node_modules/                       # Dependencies (managed by package.json)
.env.local                          # Local development secrets (do not commit)
```

### Out of Scope Features
1. **User Authentication System** (beyond anonymous Firebase Auth)
   - No OAuth integration yet
   - No user profile pages
   - No build history dashboard
   - Defer to future phase

2. **Advanced Build Options**
   - No custom package selection UI (use predefined configs only)
   - No build script editor (too risky)
   - No kernel configuration UI (use defaults)

3. **Real-Time Build Logs Streaming**
   - Current scope: Logs available after completion only
   - Defer to Phase 8 (optional enhancement)

4. **Build Artifact Management UI**
   - No web-based file browser for GCS
   - No build comparison tools
   - Direct download links only

5. **Cost Optimization & Monitoring**
   - No budget alerts in this phase
   - No build cost calculator
   - Defer to Phase 9 (production readiness)

6. **Multi-Region Support**
   - Single region only: `us-central1`
   - No geo-routing or replication

---

## ⚠️ CRITICAL AREAS - HIGH RISK

### 1. Firestore Security Rules (firestore.rules)
**Current State:** Open for unauthenticated read/write (TEMPORARY)
```javascript
// CURRENT (INSECURE - FOR TESTING ONLY)
match /builds/{buildId} {
  allow read, write: if true;  // ⚠️ ANYONE CAN MODIFY ANY BUILD
}
```

**Required Fix (BEFORE PRODUCTION):**
```javascript
// SECURE - Must implement this before launch
match /builds/{buildId} {
  allow create: if request.auth != null;  // Authenticated users only
  allow read: if request.auth.uid == resource.data.userId;  // Own builds only
  allow update: if false;  // Only Cloud Functions can update
  allow delete: if false;  // Prevent accidental deletion
}
```

**Why Critical:**
- Currently anyone can delete all builds
- Malicious users could inject fake builds
- Privacy violation: Anyone can read all email addresses

**Action Required:**
- Update rules in Phase 6 (Security & Production Readiness)
- Test with Firebase emulator first
- Deploy with `firebase deploy --only firestore:rules`

---

### 2. Service Account Permissions (IAM)
**Service Account:** `lfs-builder-service-account@alfs-bd1e0.iam.gserviceaccount.com`

**Current Roles:**
- `roles/run.admin` - Can manage ALL Cloud Run resources (too broad)
- `roles/datastore.user` - Firestore read/write (correct)
- `roles/storage.objectAdmin` - GCS full access (correct for bucket)

**Risk:**
- Service account has broad permissions across entire project
- If credentials leak, attacker could delete all Cloud Run Jobs

**Required Fix:**
- Create custom IAM role with minimal permissions:
  - `run.jobs.run` (execute jobs only, not delete)
  - `run.jobs.get` (read job status)
  - Restrict to specific resources: `lfs-builder` job only

**Action Required:**
- Audit permissions in Phase 6
- Use principle of least privilege
- Document all role assignments in this file

---

### 3. Cloud Function Deployment (functions/index.js)
**Line-Specific Warnings:**

**Lines 1-50: Function `onBuildSubmitted`**
- ⚠️ MUST UPDATE: Change from direct API call to Pub/Sub publish
- Critical: Error handling must log before throwing
- Dependencies: Requires `@google-cloud/pubsub` package

**Lines 51-100: Function `executeLfsBuild` (TO BE CREATED)**
- ⚠️ NEW FUNCTION: Will use `child_process.exec()` to call gcloud CLI
- Security: Must sanitize `buildId` to prevent command injection
- Validation: Check buildId format (UUID v4 only)
- Example injection attack: `buildId = "abc; rm -rf /"`

**Lines 101-150: Function `onBuildComplete` (TO BE CREATED)**
- ⚠️ NEW FUNCTION: Will query Cloud Run API for job status
- Dependency: Job completion event (Pub/Sub or polling)
- Must handle partial failures (build succeeds but GCS upload fails)

---

### 4. Docker Image Build Process (Dockerfile)
**Lines 10-20: Package Installation**
```dockerfile
RUN apt-get update && apt-get install -y \
    gcc g++ make binutils \  # LFS build tools
    wget curl \              # Download sources
    python3 jq \             # Parse configs
    google-cloud-sdk         # Upload to GCS
```

**Risk:**
- Large image size (>2 GB) = slow cold starts
- Outdated packages = security vulnerabilities
- Missing tools = build failures

**Mitigation:**
- Use multi-stage build to reduce final image size
- Pin package versions: `gcc=4:12.2.0-1` (not `gcc`)
- Run `apt-get clean` to remove caches

---

### 5. LFS Build Script (lfs-build.sh)
**Lines 50-100: Package Compilation Loop**
```bash
for package in $PACKAGES; do
  wget $PACKAGE_URL/$package.tar.xz  # ⚠️ No checksum verification
  tar -xf $package.tar.xz
  cd $package
  ./configure --prefix=/tools         # ⚠️ No error handling
  make -j$(nproc)                     # ⚠️ Parallel jobs can OOM
  make install
  cd ..
done
```

**Risks:**
- **No checksum validation:** Compromised mirrors could serve malicious tarballs
- **No error handling:** If one package fails, script continues (broken system)
- **Memory exhaustion:** `make -j$(nproc)` on 32-core machine = OOM kill

**Required Fixes:**
1. Verify checksums: `sha256sum -c $package.sha256` before extraction
2. Exit on error: `set -e` at top of script
3. Limit parallel jobs: `make -j$(($(nproc) / 2))` (half of available cores)

---

## 🔗 INTERCONNECTED FEATURES

### Dependencies (Features This Relies On)
None - This is a greenfield implementation

### Dependents (Features That Rely On This)
None currently - But future features may include:
- **Build History Dashboard** (will query `/builds` collection)
- **User Profile System** (will need userId field in builds)
- **Build Templates** (will reference common configurations)

**When implementing future features:**
1. Read this scope file to understand constraints
2. Do NOT change Firestore document structure without updating this file
3. Test that existing Cloud Functions still work

---

## 📚 FILES TO REFERENCE

### Constants & Configuration
```
firebase.json                       # Firebase project settings
package.json (root)                 # Project metadata
functions/package.json              # Cloud Function dependencies
```

### Related Documentation
```
docs/main.md                        # IKB central index
docs/lfs-build-pipeline/lfs-build-pipeline.prd.md        # Requirements
docs/lfs-build-pipeline/lfs-build-pipeline.current.md    # Current status
docs/lfs-build-pipeline/lfs-build-pipeline.errors.md     # Error history
```

### External Resources
- [Firebase Cloud Functions Documentation](https://firebase.google.com/docs/functions)
- [Cloud Run Jobs Documentation](https://cloud.google.com/run/docs/create-jobs)
- [LFS Book (Official Guide)](https://www.linuxfromscratch.org/lfs/view/stable/)

---

## 🛡️ VALIDATION RULES

### Client-Side (public/app.js)
```javascript
// Email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  showError('Invalid email format');
}

// Project name validation
const projectNameRegex = /^[a-zA-Z0-9-]{3,50}$/;
if (!projectNameRegex.test(projectName)) {
  showError('Project name: 3-50 chars, alphanumeric + hyphens only');
}

// LFS version validation
const allowedVersions = ['12.2', '12.1', '12.0', '11.3'];
if (!allowedVersions.includes(lfsVersion)) {
  showError('Invalid LFS version selected');
}
```

### Server-Side (functions/index.js)
```javascript
// Validate buildId format (UUID v4)
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
if (!uuidRegex.test(buildId)) {
  log.error('Invalid buildId format', { buildId });
  throw new Error('Invalid build ID');
}

// Sanitize project name (prevent path traversal)
const sanitizedName = projectName.replace(/[^a-zA-Z0-9-]/g, '');
if (sanitizedName !== projectName) {
  log.warn('Project name sanitized', { original: projectName, sanitized: sanitizedName });
}
```

---

## 🎯 SCOPE SUMMARY

**In Scope:**
- Complete build pipeline (form → Cloud Run → GCS → email)
- Pub/Sub orchestration layer
- Client-side validation
- Structured logging & observability
- Basic security (Firestore rules, input validation)

**Out of Scope:**
- User authentication system (beyond anonymous)
- Real-time log streaming
- Build history dashboard
- Advanced build customization
- Multi-region deployment

**Critical to Protect:**
- Firestore security rules (must update before production)
- Service account permissions (audit and minimize)
- LFS build script (add error handling and checksum validation)

---

**END OF SCOPE DEFINITION**
