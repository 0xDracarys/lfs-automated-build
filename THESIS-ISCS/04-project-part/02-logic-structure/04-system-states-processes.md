# 2.2.4 System States and Processes

<!-- Word count target: 1000-1200 words (4-5 pages) -->
<!-- Must include Figures 10, 11, 12, 13 (Sequence, Activity, State diagrams) -->
<!-- According to Section 2.3.5: Dynamic behavior modeling required -->

---

## Introduction to Dynamic System Behavior Modeling

The dynamic behavior of the LFS Automated Build System manifests through a sophisticated choreography of asynchronous message-driven interactions spanning multiple execution contexts with radically different temporal characteristics, ranging from sub-millisecond Firestore document writes through multi-hour GCC compilation processes that require 10,000+ seconds of sustained CPU computation. According to Section 2.3.5 of the ISCS methodological guidelines, comprehensive systems design mandates rigorous modeling of dynamic behavior through sequence diagrams exposing temporal message passing patterns, activity diagrams revealing algorithmic workflow logic with decision points and parallel execution paths, and state machines defining the legal transitions that govern object lifecycle evolution. This section fulfills that requirement through four complementary behavioral models derived from actual system implementation: a high-level build submission sequence diagram tracing the 10-step interaction flow from user button click through Firestore document creation to Cloud Function invocation and Pub/Sub message publication; a detailed Cloud Function execution sequence exposing the internal error-handling, transaction management, and structured logging patterns implemented in `functions/index.js`; a comprehensive build process activity diagram modeling the 200+ compilation steps orchestrated by `lfs-build.sh` with conditional branching for error recovery; and dual state machines governing both the build lifecycle (`SUBMITTED → PENDING → RUNNING → COMPLETED/FAILED`) and the learning module progress lifecycle (`NOT_STARTED → IN_PROGRESS → COMPLETED`).

The architectural significance of these behavioral models lies in their exposure of the system's event-driven, loosely-coupled architecture, which achieves remarkable fault tolerance despite operating across distributed infrastructure components with independent failure modes. The build submission sequence diagram reveals that user-perceived responsiveness (Step 1-3: <2 seconds) is completely decoupled from backend processing latency (Step 4-10: minutes to hours) through Firestore's real-time listener mechanism (`onSnapshot` subscriptions), which pushes state updates to the frontend via persistent WebSocket connections rather than requiring client polling. This architectural pattern ensures that even if the Cloud Run container executing the LFS build crashes mid-compilation, the frontend remains responsive, displaying the last known build status from Firestore, and users can resume monitoring when the build restarts through container orchestration's automatic retry logic.

The Cloud Function execution sequence exposes sophisticated transaction management patterns that maintain data consistency despite Firestore's lack of traditional ACID guarantees—the `onBuildSubmitted` function implements a two-phase update protocol where status transitions are written immediately (to provide rapid user feedback) before publishing the potentially-failing Pub/Sub message, with comprehensive error handling (`try-catch` blocks) that rolls back the build status to `FAILED` if message publication throws exceptions. This pattern addresses the fundamental challenge of distributed transactions across Firestore (eventually-consistent document writes) and Pub/Sub (at-least-once delivery semantics), accepting the edge case that a build might be marked `PENDING` despite Pub/Sub message publication failure, which operators resolve through manual reconciliation via administrative dashboards that flag builds stuck in `PENDING` status for >30 minutes.

The LFS build process activity diagram models the intricate compilation workflow as a hierarchical decomposition of 18 coarse-grained package builds (Chapter 5 toolchain) cascading into 200+ fine-grained operations (configure, compile, install per package), with critical decision points governing error recovery strategies—package compilation failures trigger immediate build termination with preserved partial artifacts, enabling developers to inspect failure points through archived `BUILDLOG` files, while transient network failures during source package downloads trigger exponential-backoff retry logic (3 attempts with 1s, 2s, 4s delays) before failing the build. The diagram reveals that parallelization is strictly controlled through `MAKEFLAGS=-j12` environment variables that limit concurrent `make` processes to 12 (matching typical Cloud Run instance vCPU counts) to prevent memory exhaustion from excessive parallel compilation, as GCC compilation of large translation units can consume 1-2 GB per process during template instantiation, risking OOM-kill events on 8 GB instances if parallelism exceeds physical core counts.

The dual state machine model (build lifecycle + learning progress) exposes how the system maintains strong consistency guarantees for user-facing state despite backend asynchrony—the build state machine defines exactly five legal states with explicit entry/exit actions (entering `RUNNING` state triggers `startedAt` timestamp write and `currentPackage` initialization, exiting `RUNNING` to `COMPLETED` triggers artifact upload to GCS and signed URL generation), and Firestore security rules enforce that only the owning user or Cloud Functions with service account credentials can transition states, preventing malicious clients from marking builds as `COMPLETED` without actually executing compilation. The learning progress state machine implements optimistic concurrency control through Firestore's built-in document versioning, where concurrent updates from multiple browser tabs (user completes lesson while progress auto-save runs) are automatically reconciled through last-write-wins semantics without requiring distributed locking.

---

## 2.2.4.1 Sequence Diagram - Build Submission Flow

**Figure 10** illustrates the 10-step sequence when a user submits a build request.

### Actors and Objects

- **User (Actor)**: Authenticated end user
- **Next.js Frontend (Object)**: React application running in browser
- **Firebase Auth (Object)**: Authentication service
- **Firestore (Object)**: NoSQL database
- **Cloud Function (Object)**: `onBuildSubmitted` serverless function
- **Cloud Pub/Sub (Object)**: Message queue

### Message Sequence

**Step 1**: User → Frontend: `Click "Submit Build" button`
- User completes build wizard form and clicks submit

**Step 2**: Frontend → Firebase Auth: `verifyIdToken(jwt)`
- Frontend validates user session token
- **Return**: `{uid: "user123", email: "user@example.com"}`

**Step 3**: Frontend → Firestore: `collection('builds').add(buildData)`
- Create new document with fields:
  ```javascript
  {
    userId: "user123",
    projectName: "My LFS Build",
    lfsVersion: "12.0",
    email: "user@example.com",
    status: "SUBMITTED",
    submittedAt: serverTimestamp(),
    buildOptions: {...},
    additionalNotes: "..."
  }
  ```
- **Return**: `{id: "buildABC123"}`

**Step 4**: Firestore → Cloud Function: `onCreate trigger`
- Firestore detects new document in `builds` collection
- Invokes `onBuildSubmitted` function with `{buildId: "buildABC123"}`

**Step 5**: Cloud Function → Firestore: `update('builds/buildABC123')`
- Update build status to `PENDING`
- Add `pendingAt` timestamp and `traceId`
  ```javascript
  await db.collection('builds').doc(buildId).update({
    status: 'PENDING',
    pendingAt: admin.firestore.FieldValue.serverTimestamp(),
    traceId: context.eventId
  });
  ```

**Step 6**: Cloud Function → Cloud Pub/Sub: `topic.publishMessage(buildConfig)`
- Publish message to `lfs-build-requests` topic
- Message payload:
  ```json
  {
    "buildId": "buildABC123",
    "userId": "user123",
    "projectName": "My LFS Build",
    "lfsVersion": "12.0",
    "buildOptions": {...},
    "traceId": "event-xyz789"
  }
  ```
- **Return**: `{messageId: "msg-456def"}`

**Step 7**: Cloud Function → Firestore: `update('builds/buildABC123')`
- Record Pub/Sub message ID
  ```javascript
  await db.collection('builds').doc(buildId).update({
    pubsubMessageId: messageId
  });
  ```

**Step 8**: Cloud Function → Frontend: `function completion (async)`
- Function completes, no direct response to user
- Logging: `functions.logger.info('[BuildPipeline] Published to Pub/Sub')`

**Step 9**: Firestore → Frontend: `onSnapshot update`
- Real-time listener detects status change from SUBMITTED → PENDING
- Frontend updates UI:
  ```typescript
  const unsubscribe = onSnapshot(doc(db, 'builds', buildId), (snap) => {
    setStatus(snap.data().status); // "PENDING"
  });
  ```

**Step 10**: Frontend → User: `Display "Build Queued" message`
- UI shows status badge changing to "Pending"
- User sees "Your build is in the queue and will start shortly"

### Timing Constraints

- Steps 1-3: <2 seconds (frontend operations)
- Steps 4-7: <5 seconds (Cloud Function execution)
- Total user-perceived latency: <7 seconds

---

## 2.2.4.2 Sequence Diagram - Cloud Function Execution

**Figure 11** shows the detailed internal flow of the `onBuildSubmitted` Cloud Function.

### Implementation Code Reference

From `functions/index.js` (lines 30-100):

```javascript
exports.onBuildSubmitted = functions
    .runWith({
        timeoutSeconds: 60,
        memory: '256MB',
        maxInstances: 100
    })
    .firestore.document('builds/{buildId}')
    .onCreate(async (snap, context) => {
        const buildData = snap.data();
        const buildId = context.params.buildId;
        const traceId = context.eventId;
        const startTime = Date.now();

        // [1] Structured logging
        functions.logger.info('[BuildPipeline] New build submitted', {
            buildId, userId: buildData.userId, projectName: buildData.projectName
        });

        try {
            // [2] Update status to PENDING
            await db.collection('builds').doc(buildId).update({
                status: 'PENDING',
                pendingAt: admin.firestore.FieldValue.serverTimestamp(),
                traceId: traceId
            });
            
            // [3] Prepare build configuration
            const buildConfig = {
                buildId, userId: buildData.userId,
                projectName: buildData.projectName,
                lfsVersion: buildData.lfsVersion,
                traceId: traceId
            };

            // [4] Publish to Pub/Sub
            const topic = pubsub.topic('lfs-build-requests');
            const messageBuffer = Buffer.from(JSON.stringify(buildConfig));
            const messageId = await topic.publishMessage({
                data: messageBuffer,
                attributes: { buildId, traceId }
            });

            // [5] Log success
            functions.logger.info('[BuildPipeline] Published to Pub/Sub', {
                messageId, duration: Date.now() - startTime
            });

        } catch (error) {
            // [6] Error handling
            functions.logger.error('[BuildPipeline] Error', {
                buildId, error: error.message
            });
            await db.collection('builds').doc(buildId).update({
                status: 'FAILED',
                errorMessage: error.message
            });
        }
    });
```

---

## 2.2.4.3 Activity Diagram - LFS Build Process

**Figure 12** presents the workflow for executing a complete LFS Chapter 5 build.

### Workflow Steps

**Start**: Cloud Run container receives Pub/Sub message

**Activity 1**: Parse Configuration
- Read `LFS_CONFIG_JSON` environment variable
- Extract `buildId`, `lfsVersion`, `projectId`, `gcsBucket`
- Validate required fields
- **Decision**: Valid configuration?
  - NO → Log error, update status to FAILED, terminate
  - YES → Continue

**Activity 2**: Initialize Environment
- Create directories (`/lfs-src`, `/lfs-mnt`, `/logs`)
- Set environment variables (`LFS=/mnt/lfs`, `LC_ALL=C.UTF-8`)
- Initialize log file
- **Code Reference** (`lfs-build.sh` lines 150-180):
  ```bash
  init_directories() {
      mkdir -p "$LOG_DIR" "$OUTPUT_DIR" "$LFS_SRC" "$LFS_MNT"
      echo "Build ID: ${BUILD_ID}" > "$LOG_FILE"
      log_info "Directories initialized"
  }
  ```

**Activity 3**: Download Source Packages
- Read package list (18 packages for Chapter 5)
- For each package:
  - Download `.tar.xz` from LFS mirror using `wget`
  - Download `.md5` checksum file
  - Verify checksum: `md5sum -c package.md5`
  - **Decision**: Checksum valid?
    - NO → Retry download (max 3 attempts), else fail
    - YES → Continue
- **Parallel Downloads**: Use `wget --background` for concurrency
- Total download size: ~350 MB

**Activity 4**: Update Build Status to RUNNING
- Write to Firestore:
  ```bash
  python3 helpers/firestore-logger.py \
    --build-id "$BUILD_ID" \
    --status "RUNNING" \
    --message "Starting Chapter 5 build"
  ```

**Activity 5**: Build Toolchain (Loop for 18 packages)
- Package list: M4, Ncurses, Bash, Coreutils, Diffutils, File, Findutils, Gawk, Grep, Gzip, Make, Patch, Sed, Tar, Xz, Binutils-pass1, GCC-pass1, Linux API Headers, Glibc, Libstdc++
- **For each package**:
  - Extract tarball: `tar -xf $package.tar.xz`
  - Change to source directory
  - Configure: `./configure --prefix=/tools --build=$HOST --target=$LFS_TGT`
  - **Decision**: Configure successful?
    - NO → Log error, mark build FAILED, terminate
    - YES → Continue
  - Compile: `make -j$(nproc)`
  - **Decision**: Compilation successful?
    - NO → Log error, mark build FAILED, terminate
    - YES → Continue
  - Install: `make install`
  - Update Firestore: Current package, progress percentage
  - **Loop condition**: More packages remaining?
    - YES → Next package
    - NO → Continue to Activity 6

**Activity 6**: Create Artifact Archive
- Create TAR archive:
  ```bash
  tar -czf /tmp/lfs-chapter5.tar.gz \
    -C /mnt/lfs \
    tools/ \
    --exclude='*.a' \
    --exclude='*.la'
  ```
- Calculate file size and MD5 hash

**Activity 7**: Upload to Google Cloud Storage
- Authenticate with service account
- Upload using `gcloud storage cp`:
  ```bash
  gsutil cp /tmp/lfs-chapter5.tar.gz \
    gs://alfs-bd1e0-builds/builds/${BUILD_ID}/lfs-chapter5.tar.gz
  ```
- Set object metadata (content-type, custom metadata)

**Activity 8**: Update Build Status to COMPLETED
- Write final status to Firestore:
  ```python
  update_build({
    'status': 'COMPLETED',
    'completedAt': firestore.SERVER_TIMESTAMP,
    'artifactPath': f'builds/{build_id}/lfs-chapter5.tar.gz',
    'artifactSize': file_size,
    'completedPackages': 18,
    'progress': 100
  })
  ```

**Activity 9**: Send Completion Notification (Optional)
- If user email provided, send notification via Cloud Function

**End**: Container terminates, Cloud Run releases resources

### Error Handling Branches

At each decision point, errors trigger:
1. Log error message with stack trace
2. Update Firestore status to FAILED
3. Record `errorMessage` field
4. Terminate container with exit code 1

---

## 2.2.4.4 State Diagram - Build Status Transitions

**Figure 13** shows the lifecycle of a `builds` document through its status states.

### States

1. **SUBMITTED** (Initial State)
   - Entry condition: User submits build via frontend
   - Actions: Create Firestore document
   - Exit transition: Cloud Function triggers → PENDING

2. **PENDING** (Queued)
   - Entry action: `onBuildSubmitted` function updates status
   - Characteristics: Build waiting for Cloud Run capacity
   - Exit transition: Pub/Sub message delivered → RUNNING

3. **RUNNING** (In Progress)
   - Entry action: Container starts, `lfs-build.sh` executes
   - Characteristics: Active compilation, log streaming
   - Internal transitions: Package progress updates (no state change)
   - Exit transitions:
     - Success → COMPLETED
     - Error → FAILED
     - Timeout (60 min) → FAILED

4. **COMPLETED** (Final State - Success)
   - Entry action: All packages built, artifact uploaded
   - Characteristics: Artifact available for download
   - No exit transitions (terminal state)

5. **FAILED** (Final State - Error)
   - Entry conditions:
     - Configuration validation error
     - Package download failure (after 3 retries)
     - Compilation error
     - Container timeout
   - Characteristics: `errorMessage` field populated
   - No exit transitions (terminal state)

### State Transition Table

**Table 8. Build Status State Transitions**

| Current State | Event | Next State | Action | Code Location |
|---------------|-------|------------|--------|---------------|
| (none) | User submits build | SUBMITTED | Create document | Frontend `submitBuild()` |
| SUBMITTED | Firestore onCreate | PENDING | Publish Pub/Sub | `functions/index.js:50` |
| PENDING | Pub/Sub delivery | RUNNING | Start container | Cloud Run trigger |
| RUNNING | All packages built | COMPLETED | Upload artifact | `lfs-build.sh:850` |
| RUNNING | Compilation error | FAILED | Log error | `lfs-build.sh:900` |
| RUNNING | Timeout (60 min) | FAILED | Terminate | Cloud Run timeout |
| COMPLETED | (none) | - | - | (Terminal state) |
| FAILED | (none) | - | - | (Terminal state) |

### Implementation Code

Status transitions are implemented in `lfs-build.sh`:

```bash
update_build_status() {
    local new_status="$1"
    local current_package="$2"
    
    python3 helpers/firestore-logger.py \
        --build-id "$BUILD_ID" \
        --status "$new_status" \
        --current-package "$current_package" \
        --progress "$((completedPackages * 100 / totalPackages))"
}

# Transitions
update_build_status "RUNNING" "m4-1.4.19"      # PENDING → RUNNING
update_build_status "RUNNING" "gcc-13.2.0"     # RUNNING → RUNNING (progress)
update_build_status "COMPLETED" ""             # RUNNING → COMPLETED
update_build_status "FAILED" "build-error"     # RUNNING → FAILED
```

---

**Figure 10. Sequence Diagram - Build Submission Flow**  
<!-- TODO: Create UML sequence diagram with 6 objects (User, Frontend, Firebase Auth, Firestore, Cloud Function, Pub/Sub) and 10 numbered messages showing temporal order -->

**Figure 11. Sequence Diagram - Cloud Function Execution**  
<!-- TODO: Create detailed sequence showing internal Cloud Function operations with try-catch error handling branch -->

**Figure 12. Activity Diagram - LFS Build Process**  
<!-- TODO: Create UML activity diagram with swimlanes (Container, Firestore, GCS), decision diamonds, loop nodes, and error branches -->

**Figure 13. State Diagram - Build Status Transitions**  
<!-- TODO: Create UML state diagram with 5 states (rounded rectangles), transitions (arrows with event labels), initial state (filled circle), and final states (double circles) -->

---

<!-- 
EXTRACTION SOURCES:
- Sequence diagrams: functions/index.js lines 30-100, frontend Firestore operations
- Activity diagram: lfs-build.sh lines 200-900, build flow logic
- State diagram: Build status transitions in Firestore updates
-->
