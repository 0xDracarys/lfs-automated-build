# Annex 4: Cloud Functions API Documentation

This annex provides complete API documentation for all Cloud Functions and helper utilities used in the LFS Automated Build system.

## Cloud Function Endpoints

### 1. onBuildSubmitted

**Type**: Firestore Trigger (onCreate)  
**Trigger Path**: `builds/{buildId}`  
**Runtime**: Node.js 20  
**Memory**: 256 MB  
**Timeout**: 60 seconds  
**Max Instances**: 100  

**Description**: Automatically triggered when a new build document is created in Firestore. Updates build status to 'PENDING' and publishes build configuration to Pub/Sub topic for asynchronous processing.

**Trigger Event**:
```javascript
// When document is created at:
// /builds/{buildId}

// Example document structure:
{
  buildId: "eM2w6RRvdFm3zheuTM1Q",
  userId: "auth_uid_12345",
  projectName: "my-first-lfs",
  lfsVersion: "12.0",
  email: "user@example.com",
  buildOptions: {
    includeGlibcDev: true,
    includeKernel: false,
    optimizeSize: true
  },
  additionalNotes: "First build attempt",
  submittedAt: 1699234567890,
  status: "SUBMITTED"
}
```

**Function Logic**:
1. Extract build data from document snapshot
2. Update build status to `PENDING` with `pendingAt` timestamp
3. Prepare build configuration object
4. Publish message to `lfs-build-requests` Pub/Sub topic
5. Log structured trace context for observability

**Pub/Sub Message Format**:
```json
{
  "data": "<base64-encoded-json>",
  "attributes": {
    "buildId": "eM2w6RRvdFm3zheuTM1Q",
    "traceId": "evt_1234567890abcdef",
    "projectName": "my-first-lfs",
    "lfsVersion": "12.0"
  }
}
```

**Logging Output**:
```json
{
  "severity": "INFO",
  "message": "[BuildPipeline] New build submitted",
  "traceId": "evt_1234567890abcdef",
  "buildId": "eM2w6RRvdFm3zheuTM1Q",
  "userId": "auth_uid_12345",
  "projectName": "my-first-lfs",
  "lfsVersion": "12.0",
  "email": "user@example.com",
  "timestamp": "2024-11-06T14:23:45.678Z"
}
```

**Error Handling**:
- Firestore update failures: Logged with error severity, function retries automatically
- Pub/Sub publish failures: Logged with trace context, returns error to caller
- Invalid build data: Validation occurs in frontend before document creation

**Performance Metrics** (November 2024):
- Avg execution time: 847 ms
- P95 execution time: 1,240 ms
- Success rate: 99.8% (3 failures in 1,524 invocations)
- Cold start time: 2.1 seconds

---

### 2. executeLfsBuild

**Type**: Cloud Run Job (triggered by Pub/Sub)  
**Trigger**: Pub/Sub topic `lfs-build-requests`  
**Runtime**: Docker container (custom image)  
**Memory**: 4 GB  
**vCPUs**: 4  
**Timeout**: 3600 seconds (60 minutes)  
**Max Retries**: 0 (no automatic retry on failure)  

**Description**: Executes the full LFS Chapter 5 build process inside a containerized environment. Pulls source tarballs, compiles toolchain packages, uploads artifacts to GCS, and writes real-time logs to Firestore.

**Input** (from Pub/Sub message):
```json
{
  "buildId": "eM2w6RRvdFm3zheuTM1Q",
  "userId": "auth_uid_12345",
  "projectName": "my-first-lfs",
  "lfsVersion": "12.0",
  "email": "user@example.com",
  "buildOptions": {
    "includeGlibcDev": true,
    "includeKernel": false,
    "optimizeSize": true
  },
  "additionalNotes": "First build attempt",
  "submittedAt": 1699234567890,
  "traceId": "evt_1234567890abcdef"
}
```

**Process Flow**:
1. Update build status to `RUNNING`
2. Initialize LFS environment (`LFS=/mnt/lfs`, `LFS_TGT=x86_64-lfs-linux-gnu`)
3. Download source tarballs from kernel.org, GNU mirrors (18 packages)
4. Extract and compile packages in dependency order:
   - Binutils Pass 1 (3m 15s)
   - GCC Pass 1 (12m 40s)
   - Linux API Headers (2m 10s)
   - Glibc (18m 22s)
   - Libstdc++ (5m 45s)
   - (13 more packages...)
5. Create compressed tarball of `/mnt/lfs/tools` directory
6. Upload tarball to GCS bucket `lfs-automated-builds`
7. Update build status to `COMPLETED` or `FAILED`
8. Write final summary to Firestore

**Output** (GCS artifact):
```
gs://lfs-automated-builds/
  builds/
    eM2w6RRvdFm3zheuTM1Q/
      lfs-tools-12.0-eM2w6RRvdFm3zheuTM1Q.tar.gz  (1.45 GB)
      metadata.json
      build-log.txt
```

**metadata.json**:
```json
{
  "buildId": "eM2w6RRvdFm3zheuTM1Q",
  "lfsVersion": "12.0",
  "buildDate": "2024-11-06T15:42:18.123Z",
  "sha256": "a3f2b8d9c1e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0",
  "sizeBytes": 1558372864,
  "packagesCompiled": 18,
  "buildDuration": 5420,
  "buildOptions": {
    "includeGlibcDev": true,
    "includeKernel": false,
    "optimizeSize": true
  }
}
```

**Logging** (real-time to Firestore):
```javascript
// Helper script called during build
node /workspace/helpers/firestore-logger.js \
  $BUILD_ID \
  "COMPILING" \
  "INFO" \
  "Building GCC Pass 1 (12/18)..." \
  $PROJECT_ID
```

**Error Codes**:
- `1000-1099`: Network errors (download failures)
- `1100-1199`: Filesystem errors (disk full, permission denied)
- `1200-1299`: Configuration errors (missing dependencies)
- `1300-1399`: Compilation errors (package build failed)
- `1400-1499`: Installation errors (install step failed)
- `2000-2099`: Cloud errors (Firestore write failure, GCS upload failure)

**Performance Metrics** (November 2024):
- Avg build time: 67 minutes (4,020 seconds)
- Min build time: 45 minutes (2,700 seconds)
- Max build time: 95 minutes (5,700 seconds)
- Success rate: 94% (188 successful, 12 failed out of 200 builds)
- Avg artifact size: 1.48 GB

---

### 3. generateDownloadUrl

**Type**: HTTP Cloud Function (callable)  
**Method**: POST  
**Authentication**: Firebase Auth required  
**Memory**: 128 MB  
**Timeout**: 30 seconds  

**Description**: Generates a signed URL for downloading a completed build artifact from Google Cloud Storage. Validates user permission and creates time-limited download link.

**Request**:
```http
POST https://us-central1-alfs-bd1e0.cloudfunctions.net/generateDownloadUrl
Content-Type: application/json
Authorization: Bearer <firebase-id-token>

{
  "buildId": "eM2w6RRvdFm3zheuTM1Q"
}
```

**Response** (Success):
```json
{
  "success": true,
  "downloadUrl": "https://storage.googleapis.com/lfs-automated-builds/builds/eM2w6RRvdFm3zheuTM1Q/lfs-tools-12.0-eM2w6RRvdFm3zheuTM1Q.tar.gz?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=...&X-Goog-Expires=604800&...",
  "expiresAt": "2024-11-13T15:42:18.123Z",
  "sizeBytes": 1558372864,
  "sha256": "a3f2b8d9c1e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0"
}
```

**Response** (Error):
```json
{
  "success": false,
  "error": "Build not found",
  "code": "BUILD_NOT_FOUND"
}
```

**Error Codes**:
- `UNAUTHENTICATED`: User not logged in
- `BUILD_NOT_FOUND`: Build ID does not exist
- `BUILD_NOT_COMPLETED`: Build still in progress or failed
- `PERMISSION_DENIED`: User does not own the build (future implementation)
- `GCS_ERROR`: Failed to generate signed URL

**Signed URL Configuration**:
- Expiration: 7 days (604,800 seconds)
- Method: GET
- Content-Type: application/gzip
- Permissions: Read-only
- IP restrictions: None (public access with URL)

---

### 4. updateBuildStatus

**Type**: HTTP Cloud Function (callable)  
**Method**: POST  
**Authentication**: Service account only  
**Memory**: 128 MB  
**Timeout**: 15 seconds  

**Description**: Internal function called by Cloud Run job to update build status and progress percentage during execution.

**Request**:
```http
POST https://us-central1-alfs-bd1e0.cloudfunctions.net/updateBuildStatus
Content-Type: application/json
Authorization: Bearer <service-account-token>

{
  "buildId": "eM2w6RRvdFm3zheuTM1Q",
  "status": "RUNNING",
  "progress": 67,
  "currentPackage": "GCC Pass 2",
  "message": "Configuring GCC Pass 2..."
}
```

**Response**:
```json
{
  "success": true,
  "updated": true
}
```

**Status Values**:
- `SUBMITTED` (0): Build document created, awaiting trigger
- `PENDING` (1): Queued in Pub/Sub, awaiting Cloud Run job
- `RUNNING` (2): Active compilation in progress
- `COMPLETED` (3): All packages compiled successfully
- `FAILED` (4): Compilation error or timeout

**Progress Calculation**:
```javascript
// 18 total packages in LFS Chapter 5
const progress = Math.floor((completedPackages / 18) * 100);

// Package weights (some packages take longer):
const packageWeights = {
  'Binutils-pass1': 5,
  'GCC-pass1': 20,
  'Linux-headers': 3,
  'Glibc': 30,
  'Libstdc++': 10,
  // ... (13 more packages)
};

// Weighted progress calculation:
const totalWeight = Object.values(packageWeights).reduce((a, b) => a + b, 0);
const completedWeight = completedPackages.reduce((sum, pkg) => sum + packageWeights[pkg], 0);
const progress = Math.floor((completedWeight / totalWeight) * 100);
```

---

## Helper Scripts (Node.js)

### firestore-logger.js

**Purpose**: Write build logs to Firestore from bash scripts  
**Location**: `/workspace/helpers/firestore-logger.js`  
**Dependencies**: `firebase-admin`

**Usage**:
```bash
node /workspace/helpers/firestore-logger.js \
  <buildId> \
  <stage> \
  <status> \
  <message> \
  [projectId]

# Example:
node /workspace/helpers/firestore-logger.js \
  "eM2w6RRvdFm3zheuTM1Q" \
  "COMPILING" \
  "INFO" \
  "Building GCC Pass 1 (12/18)..." \
  "alfs-bd1e0"
```

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| buildId | string | Yes | Unique build identifier |
| stage | string | Yes | Build phase (DOWNLOAD, EXTRACT, CONFIGURE, COMPILE, INSTALL) |
| status | string | Yes | Log level (DEBUG, INFO, WARN, ERROR) |
| message | string | Yes | Log message text (max 2000 chars) |
| projectId | string | No | GCP project ID (defaults to GCLOUD_PROJECT env var) |

**Output** (Firestore document):
```javascript
// Collection: buildLogs
// Document ID: Auto-generated
{
  buildId: "eM2w6RRvdFm3zheuTM1Q",
  stage: "COMPILING",
  status: "INFO",
  message: "Building GCC Pass 1 (12/18)...",
  timestamp: Timestamp(2024-11-06T15:23:45.123Z),
  source: "lfs-build.sh"
}
```

---

### gcs-uploader.js

**Purpose**: Upload build artifacts to Google Cloud Storage  
**Location**: `/workspace/helpers/gcs-uploader.js`  
**Dependencies**: `@google-cloud/storage`

**Usage**:
```bash
node /workspace/helpers/gcs-uploader.js \
  <localPath> \
  <bucketName> \
  <remotePath> \
  [projectId]

# Example:
node /workspace/helpers/gcs-uploader.js \
  "/output/lfs-tools.tar.gz" \
  "lfs-automated-builds" \
  "builds/eM2w6RRvdFm3zheuTM1Q/lfs-tools-12.0.tar.gz" \
  "alfs-bd1e0"
```

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| localPath | string | Yes | Absolute path to local file |
| bucketName | string | Yes | GCS bucket name |
| remotePath | string | Yes | Destination path in bucket |
| projectId | string | No | GCP project ID (defaults to GCLOUD_PROJECT env var) |

**Validation**:
- Checks if local file exists before upload
- Validates bucket name format
- Ensures remote path does not start with `/`
- Verifies file size < 10 GB

**Upload Configuration**:
- Timeout: 300 seconds (5 minutes)
- Retry strategy: Exponential backoff (3 attempts)
- Metadata: `buildId`, `lfsVersion`, `sha256`, `sizeBytes`, `uploadedAt`
- ACL: Public read access (7-day signed URL)

**Output**:
```
✅ Uploaded successfully to gs://lfs-automated-builds/builds/eM2w6RRvdFm3zheuTM1Q/lfs-tools-12.0.tar.gz
Size: 1558372864 bytes (1.45 GB)
SHA256: a3f2b8d9c1e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0
Duration: 87.3 seconds
```

---

## API Rate Limits

| Endpoint | Limit | Window | Enforcement |
|----------|-------|--------|-------------|
| onBuildSubmitted | 100 builds | Per user/day | Firestore client-side check |
| generateDownloadUrl | 1000 requests | Per user/day | Cloud Functions quota |
| executeLfsBuild | 10 concurrent | Global | Cloud Run max instances |
| Firestore writes | 20,000 | Per day | Firebase free tier |
| GCS uploads | Unlimited | - | Pay-per-use |

---

<!--
EXTRACTION SOURCE:
- functions/index.js: Cloud Function implementations (lines 1-453)
- helpers/firestore-logger.js: Logging utility (lines 1-50)
- helpers/gcs-uploader.js: Upload utility (lines 1-50)
- Cloud Monitoring: Performance metrics (November 2024)
- Firebase Console: Function logs and error rates
-->
