# 4.4.1 System Architecture Overview

## 4.4.1.1 Three-Tier Architecture

The LFS Automated Build System implements a cloud-native three-tier architecture following modern serverless principles (Google Cloud, 2024).

### Table 26. System Architecture Layers

| Layer | Technologies | Components | Hosting | Purpose |
|-------|--------------|------------|---------|---------|
| **Presentation** | React 19, Next.js 16, Tailwind CSS 4 | Web UI, dashboard, terminal emulator | Netlify CDN | User interaction, visualization |
| **Application** | Firebase Functions, Node.js 20, Cloud Run | Build orchestration, API endpoints | Google Cloud Platform | Business logic, event processing |
| **Data** | Firestore, Cloud Storage, Pub/Sub | Database, artifact storage, message queue | Google Cloud Platform | Persistence, state management |

**Diagram Reference**: See Figure 15 for complete architecture visualization.

---

## 4.4.1.2 Frontend Component Architecture

The Next.js application follows a modular component structure with clear separation of concerns.

### Directory Structure

```
lfs-learning-platform/
├── app/                        # Next.js 16 App Router pages
│   ├── (dashboard)/           # Dashboard routes (protected)
│   │   └── dashboard/page.tsx # Main dashboard
│   ├── install/page.tsx       # Build wizard
│   ├── learn/page.tsx         # Learning platform
│   ├── downloads/page.tsx     # Artifact downloads
│   └── admin/page.tsx         # Admin panel
├── components/                 # React components
│   ├── auth/                  # Authentication
│   │   └── ProtectedRoute.tsx
│   ├── lfs/                   # LFS-specific
│   │   ├── log-viewer.tsx     # Terminal emulator
│   │   └── build-progress.tsx # Progress bar
│   ├── wizard/                # Build wizard
│   │   ├── CommandBlock.tsx   # Code display
│   │   └── ProgressSidebar.tsx
│   └── ui/                    # Reusable UI components
│       └── hero-odyssey.tsx   # Landing page hero
├── lib/                       # Utilities and services
│   ├── firebase.ts            # Firebase SDK setup
│   └── services/              # API services
│       ├── analytics-service.ts
│       └── progress-service.ts
└── contexts/                  # React Context providers
    └── AuthContext.tsx        # Authentication state
```

**Key Components** (extracted from actual codebase):

1. **Build Wizard** (`app/install/page.tsx`):
   - 5-step wizard: Introduction → Configuration → Review → Submit → Monitor
   - Form validation with Zod schema
   - Real-time Firestore document creation
   - Auto-redirect to build status page

2. **Log Viewer** (`components/lfs/log-viewer.tsx`):
   - Terminal-style display with ANSI color codes
   - Auto-scroll to latest log entry
   - Firestore `onSnapshot` real-time updates
   - Syntax highlighting for commands

3. **Dashboard** (`app/admin/page.tsx`):
   - Aggregate statistics (total builds, success rate)
   - Build history table with sorting/filtering
   - Real-time status updates via Firestore listeners

**Component Communication**:
```typescript
// Context-based state management
<AuthProvider>
  <FirebaseProvider>
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  </FirebaseProvider>
</AuthProvider>
```

**Figure 16**: Frontend Component Diagram
<!-- TODO: Create component diagram showing:
- AuthContext providing user state to all components
- FirebaseProvider wrapping app
- Data flow: User → Form → Firebase SDK → Firestore
- Real-time updates: Firestore → onSnapshot → Component re-render
-->

---

## 4.4.1.3 Backend Service Architecture

The backend implements an event-driven microservices architecture using Firebase Cloud Functions and Cloud Run.

### Service Inventory

| Service Name | Type | Trigger | Runtime | Purpose |
|--------------|------|---------|---------|---------|
| `onBuildSubmitted` | Cloud Function | Firestore onCreate | Node.js 20 | Orchestrate build job |
| `executeLfsBuild` | Cloud Run Job | Pub/Sub message | Debian Bookworm | Execute LFS compilation |
| `generateDownloadUrl` | Cloud Function | HTTPS request | Node.js 20 | Create signed GCS URLs |
| `updateBuildStatus` | Cloud Function | Firestore update | Node.js 20 | Notify users via email |

**Service Interaction Flow**:

1. User submits build → Frontend creates Firestore document
2. `onBuildSubmitted` Cloud Function triggers
3. Function publishes message to Pub/Sub topic `lfs-build-requests`
4. Cloud Run Job `executeLfsBuild` consumes message
5. Job updates Firestore with progress logs
6. Frontend receives real-time updates via `onSnapshot`

**Implementation** (`functions/index.js` lines 1-100):
```javascript
const functions = require('firebase-functions');
const { PubSub } = require('@google-cloud/pubsub');
const admin = require('firebase-admin');

admin.initializeApp();
const pubsub = new PubSub();
const db = admin.firestore();

exports.onBuildSubmitted = functions
  .runWith({
    timeoutSeconds: 60,
    memory: '256MB',
    maxInstances: 100
  })
  .firestore
  .document('builds/{buildId}')
  .onCreate(async (snap, context) => {
    const { buildId } = context.params;
    const buildData = snap.data();
    
    // Update status to PENDING
    await db.collection('builds').doc(buildId).update({
      status: 'PENDING',
      pendingAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Publish to Pub/Sub
    const topic = pubsub.topic('lfs-build-requests');
    const message = Buffer.from(JSON.stringify({
      buildId,
      userId: buildData.userId,
      buildOptions: buildData.buildOptions
    }));
    
    await topic.publishMessage({ data: message });
    console.log(`Published build ${buildId} to Pub/Sub`);
  });
```

**Figure 17**: Backend Service Diagram
<!-- TODO: Create sequence diagram showing:
1. Firestore onCreate event
2. Cloud Function execution
3. Pub/Sub message publication
4. Cloud Run Job subscription
5. Firestore status updates
6. Frontend real-time listener
-->

---

## 4.4.1.4 Cloud Run Job Architecture

The build execution environment runs in an isolated Docker container orchestrated by Cloud Run Jobs.

### Container Specifications

**Resource Allocation**:
- **Memory**: 4 GB (for GCC compilation)
- **CPU**: 4 vCPUs (enables `make -j4` parallelism)
- **Timeout**: 3600 seconds (1 hour)
- **Max Retries**: 0 (builds are not idempotent due to timing logs)
- **Concurrency**: 1 task per job (single-threaded build process)

**Environment Variables**:
```bash
# Injected by Cloud Run from Pub/Sub message
LFS_CONFIG_JSON='{"buildId":"abc123","userId":"user456",...}'
GCLOUD_PROJECT='lfs-automated-builds'
GCS_BUCKET='lfs-automated-builds-artifacts'
GOOGLE_APPLICATION_CREDENTIALS='/workspace/service-account-key.json'
```

**Execution Flow** (`docker-entrypoint.sh`):
```bash
#!/bin/bash
set -euo pipefail

echo "[Entrypoint] Starting LFS build job"
echo "[Entrypoint] Build ID: ${BUILD_ID}"

# Parse configuration
export BUILD_ID=$(echo "${LFS_CONFIG_JSON}" | jq -r '.buildId')

# Initialize build environment
source /workspace/init-lfs-env.sh

# Execute build script
bash /workspace/lfs-build.sh

# Upload artifact to GCS
node /workspace/helpers/gcs-uploader.js \
    "/output/lfs-chapter5-${BUILD_ID}.tar.gz" \
    "${GCS_BUCKET}" \
    "builds/${BUILD_ID}/"

echo "[Entrypoint] Build completed successfully"
```

**Logging Integration**:
- Stdout/stderr → Cloud Logging (structured logs with severity)
- Build progress → Firestore `buildLogs` collection (real-time UI updates)
- Final status → Firestore `builds` document (COMPLETED/FAILED)

---

## 4.4.1.5 Data Flow Architecture

### Build Submission Data Flow

```
User (Browser)
  ↓ [HTTPS]
Next.js Frontend
  ↓ [Firebase SDK]
Firestore (builds collection)
  ↓ [onCreate Trigger]
Cloud Function (onBuildSubmitted)
  ↓ [Pub/Sub Publish]
Pub/Sub Topic (lfs-build-requests)
  ↓ [Pull Subscription]
Cloud Run Job (executeLfsBuild)
  ↓ [Firestore Writes]
buildLogs Collection
  ↓ [onSnapshot Listener]
Frontend Log Viewer (Real-time Update)
```

### Artifact Download Data Flow

```
User (Browser)
  ↓ [HTTPS Request]
Cloud Function (generateDownloadUrl)
  ↓ [GCS signBlob API]
Signed URL (7-day expiry)
  ↓ [Direct Download]
Cloud Storage Bucket
  ↓ [Binary Stream]
User (Download Manager)
```

---

<!--
EXTRACTION SOURCES:
- lfs-learning-platform/ directory structure: Actual Next.js app organization
- lfs-learning-platform/app/install/page.tsx: Build wizard implementation (lines 65-300)
- lfs-learning-platform/components/lfs/log-viewer.tsx: Terminal component (lines 1-100)
- functions/index.js: Cloud Function implementation (lines 1-150)
- docker-entrypoint.sh: Container startup logic (lines 1-50)
- Dockerfile: Resource specifications and environment setup (lines 1-235)
- Cloud Run documentation: https://cloud.google.com/run/docs/configuring/cpu
-->
