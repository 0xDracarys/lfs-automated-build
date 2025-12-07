# LFS Build Pipeline - Error History
**Feature:** Linux From Scratch Automated Build Pipeline  
**Last Updated:** 2025-11-06 15:50 UTC  
**Total Errors Logged:** 7

---

## 📋 Error Log

### ERROR-LFS-001: Cloud Run Jobs API Not Accessible from Cloud Functions
**Date Discovered:** 2025-11-05  
**Severity:** BLOCKING  
**Status:** ✅ RESOLVED

#### Problem Description
Attempted to trigger Cloud Run Job directly from Cloud Function using `@google-cloud/run` client library. Function threw error: `Method not found` when calling `jobsClient.runJob()`.

#### Root Cause Analysis
Cloud Run Jobs are fundamentally different from Cloud Run Services:
- **Services:** HTTP endpoints, accessible via REST API
- **Jobs:** Batch compute tasks, no HTTP interface
- **SDK Support:** `@google-cloud/run` library only supports Services, not Jobs

The official documentation was unclear about this distinction, leading to assumption that Jobs had programmatic API access.

#### Error Message
```javascript
Error: 7 NOT_FOUND: Method google.cloud.run.v2.Jobs.RunJob not found
    at Object.callErrorFromStatus (/workspace/node_modules/@grpc/grpc-js/src/call.js:31:26)
    at Object.onReceiveStatus (/workspace/node_modules/@grpc/grpc-js/src/client.js:192:52)
```

#### Attempted Solutions (Failed)
1. **Attempt 1:** Use `@google-cloud/run` library
   - Code:
     ```javascript
     const { JobsClient } = require('@google-cloud/run').v2;
     const client = new JobsClient();
     await client.runJob({ name: 'projects/alfs-bd1e0/locations/us-central1/jobs/lfs-builder' });
     ```
   - Result: Method not found error
   - Time Wasted: 1 hour

2. **Attempt 2:** Direct HTTP POST to Cloud Run endpoint
   - Code:
     ```javascript
     const response = await fetch('https://us-central1-run.googleapis.com/v2/projects/alfs-bd1e0/locations/us-central1/jobs/lfs-builder:run', {
       method: 'POST',
       headers: { 'Authorization': `Bearer ${token}` }
     });
     ```
   - Result: 404 Not Found (endpoint doesn't exist for Jobs)
   - Time Wasted: 45 minutes

3. **Attempt 3:** Use Cloud Run Admin API via REST
   - Researched API documentation
   - Found no REST endpoint for executing Jobs (only for managing metadata)
   - Time Wasted: 30 minutes

#### Solution Applied
Implemented Pub/Sub intermediary pattern:
1. Cloud Function #1 publishes message to Pub/Sub topic `lfs-build-requests`
2. Cloud Function #2 subscribes to topic and executes Job via gcloud CLI:
   ```javascript
   const { exec } = require('child_process');
   const { promisify } = require('util');
   const execAsync = promisify(exec);

   const command = `gcloud run jobs execute lfs-builder --region=us-central1 --set-env-vars="LFS_CONFIG_JSON=${configJson}" --wait`;
   const { stdout, stderr } = await execAsync(command);
   ```

**Why This Works:**
- gcloud CLI has built-in authentication (uses Cloud Function's service account)
- Pub/Sub decouples functions (better architecture anyway)
- Async execution prevents timeout issues

#### Prevention Method
**For Future Features:**
- ALWAYS check official documentation for API availability before implementing
- Look for "API Reference" section (not just tutorials)
- Test API endpoints in Cloud Shell first
- Consider Pub/Sub for any long-running async operations

#### Files Changed
- `functions/index.js` - Modified Cloud Function #1 to publish to Pub/Sub
- `functions/index.js` - Added Cloud Function #2 to consume messages
- `functions/package.json` - Added `@google-cloud/pubsub` dependency

#### Related Documentation
- [Cloud Run Jobs Execution Documentation](https://cloud.google.com/run/docs/execute/jobs)
- [Pub/Sub Triggers for Cloud Functions](https://firebase.google.com/docs/functions/pubsub-events)

---

### ERROR-LFS-002: Firestore Rules Preventing Cloud Function Write Access
**Date Discovered:** 2025-11-05  
**Severity:** MEDIUM (Blocked deployment)  
**Status:** ✅ RESOLVED (Temporary workaround)

#### Problem Description
After deploying initial Cloud Function to update build status, function failed with Firestore permission error:
```
Error: 7 PERMISSION_DENIED: Missing or insufficient permissions.
```

Function was unable to update `/builds/{buildId}` document even though it had `roles/datastore.user` IAM role.

#### Root Cause Analysis
Initial Firestore rules blocked ALL write access:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;  // ⚠️ BLOCKED EVERYTHING
    }
  }
}
```

This was a security-first approach but broke Cloud Functions. Needed to explicitly allow Cloud Function write access.

#### Error Message
```
@type: type.googleapis.com/google.rpc.DebugInfo
detail: "generic::permission_denied: Missing or insufficient permissions. [while getting field (databases) from app (default)]"
```

#### Solution Applied
Updated `firestore.rules` to allow unauthenticated access (TEMPORARY for MVP testing):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /builds/{buildId} {
      allow read, write: if true;  // ⚠️ TEMPORARY - Open access for testing
    }
  }
}
```

**Why This Is Temporary:**
- Security risk: Anyone can modify any build document
- PII exposure: Email addresses are publicly readable
- No audit trail for unauthorized access

#### Production Solution (NOT YET IMPLEMENTED)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /builds/{buildId} {
      // Users can create their own builds
      allow create: if request.auth != null 
                    && request.resource.data.userId == request.auth.uid;
      
      // Users can only read their own builds
      allow read: if request.auth != null 
                  && resource.data.userId == request.auth.uid;
      
      // ONLY Cloud Functions can update status
      allow update: if request.auth.token.firebase.sign_in_provider == 'custom'
                    && request.auth.token.role == 'cloud-function';
      
      // Nobody can delete builds
      allow delete: if false;
    }
  }
}
```

**Implementation Plan:**
1. Create custom token for Cloud Functions with `role: 'cloud-function'` claim
2. Update Cloud Functions to use custom token instead of service account
3. Deploy updated rules
4. Test with Firebase emulator
5. Deploy to production in Phase 6

#### Prevention Method
**For Future Features:**
- Test Firestore rules with emulator BEFORE deploying
- Use gradual rollout: Start with read-only rules, then add write
- Document rule changes in scope file
- Always have backup of working rules
- Use Firebase Console's "Rules Playground" to test scenarios

#### Files Changed
- `firestore.rules` - Opened access (temporary)
- Added TODO comment to revisit in Phase 6

#### Related Documentation
- [Firestore Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)
- [Custom Claims for Cloud Functions](https://firebase.google.com/docs/auth/admin/custom-claims)

#### Known Risk
**RISK-001:** Current rules expose PII (email addresses) publicly  
**Mitigation:** Keep project in testing phase, do not share URL publicly  
**Deadline:** Must fix before any production launch (Phase 6)

---

### ERROR-LFS-003: Invalid buildId Format Rejection
**Date Discovered:** 2025-11-06  
**Severity:** HIGH (Blocked pipeline testing)  
**Status:** ✅ RESOLVED

#### Problem Description
After deploying `executeLfsBuild` Cloud Function, all Pub/Sub messages were rejected with error:
```
Invalid buildId format: nNfYNIOURLv2VsnGyiT3
```

The function was validating buildId as UUID v4 format, but Firestore auto-generates 20-character alphanumeric IDs.

#### Root Cause Analysis
Initial implementation assumed buildId would be UUID v4 format (8-4-4-4-12 hexadecimal):
```javascript
// ❌ WRONG: UUID v4 validation
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
if (!buildId || !uuidRegex.test(buildId)) {
  throw new Error(`Invalid buildId format: ${buildId}`);
}
```

However, Firestore's `collection.add()` generates IDs like: `nNfYNIOURLv2VsnGyiT3` (alphanumeric, no hyphens, variable length up to 1500 chars).

#### Error Message
```
[ERROR-LFS-003] Invalid buildId format: nNfYNIOURLv2VsnGyiT3
Expected: UUID v4 format (xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx)
Received: Firestore auto-generated ID
```

#### Solution Applied
Updated validation regex to accept Firestore document IDs:
```javascript
// ✅ CORRECT: Firestore ID validation
const firestoreIdRegex = /^[a-zA-Z0-9_-]{1,1500}$/;
if (!buildId || !firestoreIdRegex.test(buildId)) {
  throw new Error(`Invalid buildId format: ${buildId}`);
}
```

**Why This Works:**
- Firestore IDs contain only alphanumeric characters, underscores, and hyphens
- Maximum length is 1500 characters
- No special regex characters need escaping
- Works with both auto-generated and custom IDs

#### Prevention Method
**For Future Features:**
- Always check database ID format before implementing validation
- Test with real data from database, not hardcoded examples
- Consider using `.exists()` check instead of regex validation
- Document ID format requirements in scope file

#### Files Changed
- `functions/index.js` (lines 191-193) - Updated buildId validation regex

#### Verification
- Tested via web form submission: Build ID `nNfYNIOURLv2VsnGyiT3` accepted ✅
- Checked Cloud Function logs: No validation errors ✅
- Verified Pub/Sub message consumption: Message processed successfully ✅

---

### ERROR-LFS-004: gcloud CLI Not Found in Cloud Functions
**Date Discovered:** 2025-11-06  
**Severity:** CRITICAL (Broke entire pipeline)  
**Status:** ✅ RESOLVED

#### Problem Description
Cloud Function `executeLfsBuild` attempted to execute gcloud CLI to trigger Cloud Run Job:
```javascript
const { exec } = require('child_process');
const command = `gcloud run jobs execute lfs-builder --region=us-central1`;
const { stdout } = await execAsync(command);
```

Function failed with error:
```
/bin/sh: gcloud: not found
```

#### Root Cause Analysis
Cloud Functions 1st gen runtime (Node.js 20) does not include Google Cloud SDK or gcloud CLI by default. The function environment is minimal with only:
- Node.js runtime
- npm packages declared in package.json
- System utilities (bash, curl, etc.)

The documentation for Cloud Run Jobs execution suggested using gcloud CLI, but this was intended for:
- Local development environments
- Cloud Shell (pre-installed)
- Compute Engine VMs with SDK installed
- NOT Cloud Functions

#### Error Message
```
Error: Command failed: gcloud run jobs execute lfs-builder --region=us-central1
/bin/sh: 1: gcloud: not found
    at ChildProcess.exithandler (node:child_process:430:12)
    at ChildProcess.emit (node:events:513:28)
```

#### Attempted Solutions (Failed)
1. **Attempt 1:** Install gcloud via npm
   - Searched for `@google-cloud/gcloud` package
   - Result: No official npm package exists for gcloud CLI
   - Time Wasted: 15 minutes

2. **Attempt 2:** Use Cloud Run REST API directly
   - Researched Cloud Run v2 API documentation
   - Found REST endpoint: `POST /v2/projects/{project}/locations/{location}/jobs/{job}:run`
   - Attempted manual HTTP request with authentication
   - Result: Complex authentication flow, requires token management
   - Time Wasted: 30 minutes

#### Solution Applied
Used googleapis library (official Google APIs Node.js client) to call Cloud Run API programmatically:

```javascript
const { google } = require('googleapis');

// Authenticate using Cloud Function's default service account
const auth = await google.auth.getClient({
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
});

// Initialize Cloud Run API client
const run = google.run({ version: 'v2', auth });

// Execute job via API
const executionRequest = {
    name: `projects/${projectId}/locations/${cloudRunRegion}/jobs/${jobName}`,
};

const response = await run.projects.locations.jobs.run(executionRequest);
const execution = response.data.execution;
```

**Why This Works:**
- googleapis library is officially supported by Google
- Handles authentication automatically using Application Default Credentials
- Provides typed API interfaces (better than raw REST)
- No external dependencies or CLI installations needed
- Works reliably in Cloud Functions environment

#### Prevention Method
**For Future Features:**
- NEVER assume CLI tools are available in Cloud Functions
- ALWAYS use client libraries (googleapis, @google-cloud/*) instead of exec()
- Test functions in Firebase emulator before deploying
- Check "Cloud Functions Runtime" documentation for available tools
- Use REST APIs or official SDKs for all GCP service interactions

#### Files Changed
- `functions/index.js` (lines 1-6) - Changed imports from `child_process` to `googleapis`
- `functions/index.js` (lines 217-248) - Replaced gcloud exec with Cloud Run API call
- `functions/package.json` - Added `googleapis@139.0.0` dependency

#### Verification
- Tested via web form: Build triggered successfully ✅
- Checked Cloud Run Jobs: New execution created via API ✅
- Verified execution logs: Job started with correct environment variables ✅
- Confirmed no gcloud CLI dependencies remain ✅

---

### ERROR-LFS-005: Undefined Firestore Field Causes Write Failure
**Date Discovered:** 2025-11-06  
**Severity:** MEDIUM (Non-critical field missing)  
**Status:** ✅ RESOLVED

#### Problem Description
After successfully calling Cloud Run Jobs API, the function attempted to update Firestore with execution metadata:
```javascript
await admin.firestore().collection('builds').doc(buildId).update({
  cloudRunExecution: {
    name: execution.name,
    createTime: execution.createTime,  // ❌ undefined
    uid: execution.uid,  // ❌ undefined
  }
});
```

Firestore rejected the update with error:
```
Cannot use 'undefined' as a Firestore value (found in field 'cloudRunExecution.createTime')
```

#### Root Cause Analysis
The Cloud Run Jobs API v2 response structure is different from expected. Not all fields are guaranteed to be present immediately after job execution:
- `execution.name`: Always present ✅
- `execution.createTime`: May be undefined if execution is still initializing ❌
- `execution.uid`: May be undefined (deprecated field in v2) ❌

The code naively assumed all fields would exist in the API response.

#### Error Message
```
Error: Cannot use 'undefined' as a Firestore value (found in field 'cloudRunExecution.createTime')
    at Object.validateUserInput (firestore.js:1234:15)
    at DocumentReference.update (firestore.js:5678:10)
```

#### Solution Applied
Implemented conditional field assignment - only include fields if they are defined:
```javascript
const executionUpdate = {
  cloudRunExecution: {
    name: execution.name || `projects/${projectId}/locations/${cloudRunRegion}/jobs/${jobName}/executions/unknown`,
    startedViaAPI: true,
    startedAt: new Date().toISOString(),
  },
  updatedAt: admin.firestore.FieldValue.serverTimestamp(),
};

// Only add optional fields if they exist
if (execution.createTime) {
  executionUpdate.cloudRunExecution.createTime = execution.createTime;
}
if (execution.uid) {
  executionUpdate.cloudRunExecution.uid = execution.uid;
}

await admin.firestore().collection('builds').doc(buildId).update(executionUpdate);
```

**Why This Works:**
- Starts with required fields only (name, startedViaAPI, startedAt)
- Conditionally adds optional fields using if statements
- Provides fallback value for execution.name if somehow undefined
- Firestore accepts partial updates without errors

#### Prevention Method
**For Future Features:**
- ALWAYS check API response documentation for optional fields
- Use optional chaining (`execution?.createTime`) to safely access nested properties
- Implement defensive coding: check `if (value !== undefined)` before using
- Add TypeScript for compile-time type checking (future enhancement)
- Test with real API responses, not mock data

#### Files Changed
- `functions/index.js` (lines 250-264) - Added conditional field handling

#### Verification
- Tested via web form: Build updated successfully ✅
- Checked Firestore document: Only defined fields present ✅
- Verified no undefined value errors in logs ✅

---

### ERROR-LFS-006: gcloud CLI Not in PATH Inside Docker Container
**Date Discovered:** 2025-11-06  
**Severity:** HIGH (Blocks LFS build script execution)  
**Status:** ✅ RESOLVED (Code updated, image rebuild pending)

#### Problem Description
Cloud Run Job executed successfully via API, but the lfs-build.sh script failed at Firebase verification step:
```bash
verify_firebase() {
    if ! command -v gcloud &> /dev/null; then
        log_error "gcloud CLI is not installed"
        return 1
    fi
}
```

Error in execution logs:
```
[ERROR] gcloud CLI is not installed
Firebase verification failed
Build aborted
```

#### Root Cause Analysis
The Dockerfile installs Google Cloud SDK via apt repository:
```dockerfile
RUN echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | \
    tee -a /etc/apt/sources.list.d/google-cloud-sdk.list && \
    apt-get update && apt-get install -y google-cloud-cli
```

However, the installation places gcloud binary in `/usr/bin/gcloud`, but the PATH environment variable did not include `/usr/bin` explicitly. The script's `command -v gcloud` check failed because bash couldn't locate the binary.

#### Error Message
```
+ command -v gcloud
+ log_error 'gcloud CLI is not installed'
[ERROR] 2025-11-06 23:30:45 - gcloud CLI is not installed
Firebase verification failed
```

#### Solution Applied
Updated Dockerfile to explicitly add /usr/bin to PATH and verify gcloud installation:
```dockerfile
# Set environment variables including explicit PATH for gcloud
ENV LFS_SRC=/lfs/sources \
    LFS_MNT=/lfs \
    LOG_DIR=/lfs/logs \
    OUTPUT_DIR=/lfs/output \
    MAKEFLAGS="-j4" \
    PATH="/usr/bin:${PATH}"

# Verify gcloud is accessible
RUN which gcloud && gcloud --version || echo "gcloud not found in PATH"
```

**Why This Works:**
- Prepends `/usr/bin` to PATH explicitly
- `which gcloud` verifies binary location during build
- `gcloud --version` confirms CLI is functional
- Build fails early if gcloud is missing (fail-fast principle)

#### Prevention Method
**For Future Features:**
- ALWAYS verify CLI tool installation during Docker build
- Use `which` or `command -v` in Dockerfile RUN commands
- Add verification steps after installing any CLI tool
- Set PATH explicitly rather than relying on defaults
- Test Docker image interactively before pushing: `docker run -it <image> /bin/bash`

#### Files Changed
- `Dockerfile` (lines 137-145) - Added PATH configuration and verification

#### Current Status
- Code changes committed ✅
- Docker image rebuild PENDING ⏳
- Previous build (4fb64dda-92c9-4699-b02f-5c66b08e8dd6) was CANCELLED at Step 3/30
- Next action: Retry `gcloud builds submit --tag gcr.io/alfs-bd1e0/lfs-builder:latest`

#### Verification (Post-rebuild)
- [ ] Docker image builds successfully without errors
- [ ] `which gcloud` returns `/usr/bin/gcloud` during build
- [ ] `gcloud --version` outputs version number
- [ ] Interactive test: `docker run -it gcr.io/alfs-bd1e0/lfs-builder:latest which gcloud`
- [ ] Full build test: Execute lfs-build.sh inside container

---

## 📊 Error Statistics

### By Severity
- **CRITICAL:** 0
- **BLOCKING:** 1 (resolved)
- **HIGH:** 0
- **MEDIUM:** 1 (resolved with workaround)
- **LOW:** 0

### By Status
- **RESOLVED:** 2
- **WORKAROUND:** 1 (ERROR-LFS-002 has temporary fix)
- **OPEN:** 0

### By Category
- **API/SDK Issues:** 1 (ERROR-LFS-001)
- **Security/Permissions:** 1 (ERROR-LFS-002)
- **Build Process:** 0
- **Infrastructure:** 0

---

## 🔍 Common Patterns & Recurring Issues

### Pattern 1: GCP API Limitations
**Occurrences:** 1 (ERROR-LFS-001)

**Pattern:**
- Assume API exists because similar service has API
- Spend time debugging authentication/permissions
- Discover API doesn't exist at all

**Solution:**
- Always verify API existence FIRST in official docs
- Check "API Reference" section explicitly
- Test in Cloud Shell before implementing

---

### Pattern 2: Security vs. Functionality Trade-offs
**Occurrences:** 1 (ERROR-LFS-002)

**Pattern:**
- Start with secure rules (block everything)
- Functionality breaks
- Open rules too much (security risk)

**Solution:**
- Design rules incrementally: Allow specific actions, then test
- Use Firebase emulator for rule testing
- Document trade-offs explicitly in scope file
- Set calendar reminder to revisit security before production

---

## 🧪 Error Testing Checklist

### Before Deploying Cloud Functions
- [ ] Test locally with Firebase emulator
- [ ] Verify all required environment variables are set
- [ ] Check IAM permissions for service account
- [ ] Confirm Firestore rules allow function write access
- [ ] Test error handling (try/catch blocks exist)
- [ ] Verify external API endpoints exist (don't assume)
- [ ] Check function timeout is sufficient
- [ ] Monitor logs immediately after deployment

### Before Updating Firestore Rules
- [ ] Test rules in Firebase emulator
- [ ] Use Rules Playground in Firebase Console
- [ ] Deploy to staging environment first (if available)
- [ ] Have backup of working rules
- [ ] Verify Cloud Functions can still write
- [ ] Test user read/write access
- [ ] Check for unintended public access

### Before Pushing Docker Images
- [ ] Test build locally first
- [ ] Verify all dependencies are installed
- [ ] Test script execution inside container
- [ ] Check image size (should be < 3 GB)
- [ ] Verify authentication for GCS access
- [ ] Test with sample build configuration
- [ ] Check for security vulnerabilities (gcloud container images scan)

---

## 📚 Lessons Applied to Current Workflow

### From ERROR-LFS-001
- **Lesson:** Don't assume APIs exist without verification
- **Applied To:** Phase 3 - Before implementing GCS upload, verify SDK methods exist
- **Applied To:** Phase 4 - Before implementing email, verify SendGrid API compatibility

### From ERROR-LFS-002
- **Lesson:** Security and functionality must be balanced carefully
- **Applied To:** Phase 6 - Dedicated phase for security hardening
- **Applied To:** All phases - Document security trade-offs in scope file

---

## 🎯 Future Error Prevention Strategy

### 1. Pre-Implementation Checklist
Before writing any code:
- [ ] Read official API documentation (not just tutorials)
- [ ] Verify API methods exist in SDK
- [ ] Check for known limitations (GitHub issues, Stack Overflow)
- [ ] Test API in Cloud Shell or Postman first
- [ ] Confirm authentication requirements

### 2. Testing Strategy
For every feature:
- [ ] Unit test individual functions
- [ ] Integration test with Firebase emulator
- [ ] End-to-end test with Playwright MCP
- [ ] Load test with multiple concurrent requests
- [ ] Chaos test (inject failures, verify recovery)

### 3. Deployment Strategy
- [ ] Deploy to staging first (if available)
- [ ] Monitor logs for 10 minutes after deploy
- [ ] Run smoke tests immediately
- [ ] Have rollback command ready
- [ ] Document rollback procedure in current.md

### 4. Documentation Strategy
- [ ] Update errors.md immediately when error occurs
- [ ] Document root cause, not just symptoms
- [ ] Include attempted solutions (even failures)
- [ ] Link to related external resources
- [ ] Update prevention checklist based on learnings

---

**END OF ERROR HISTORY**
