# 2.2.2 Data Flow Diagrams

<!-- Word count target: 800-1000 words (3-4 pages) -->
<!-- Must include Figure 7 (DFD Level 0) and Figure 8 (DFD Level 1) -->
<!-- According to Section 2.3.5 of ISCS Methodology: Data flow analysis required -->

---

## Introduction to Data Flow Analysis

The data flow architecture of the LFS Automated Build System exemplifies a sophisticated event-driven, asynchronous processing model that orchestrates information movement across multiple heterogeneous execution environments, including browser-based JavaScript runtimes, serverless cloud functions, containerized compilation workloads, and persistent NoSQL data stores. According to Section 2.3.5 of the ISCS methodological guidelines, comprehensive information systems design mandates rigorous data flow analysis to expose the transformation pathways through which raw user input evolves into structured build artifacts, and this section fulfills that requirement through hierarchical Data Flow Diagrams (DFDs) at two critical abstraction levels: Level 0 (context diagram) revealing system boundaries and external actor interactions, and Level 1 (process decomposition) exposing the internal choreography of five major subsystems with their associated data repositories.

The architectural significance of this data flow model lies in its ability to maintain strong consistency guarantees despite operating across distributed infrastructure components with radically different latency profiles and failure modes. When a user submits a build request through the Next.js frontend, that action triggers a cascade of data transformations that span four orders of magnitude in time scales—from sub-millisecond Firestore document writes, through multi-second Cloud Function invocations, to multi-hour LFS compilation processes that can exceed 14,400 seconds (4 hours) for a complete Chapter 5-8 build on modest hardware. The system achieves end-to-end observability despite this temporal heterogeneity through a carefully designed state machine encoded in Firestore documents, where the `builds/{buildId}` document serves as the authoritative source of truth that reconciles concurrent updates from the frontend's real-time listeners (`onSnapshot` subscriptions), the middleware's Cloud Function state transitions (`onCreate`, `onUpdate` triggers), and the build executor's periodic log writes via `helpers/firestore-logger.js`.

The data flow architecture implements a sophisticated Producer-Consumer pattern mediated by Google Cloud Pub/Sub, which decouples the synchronous, user-facing build submission flow from the asynchronous, resource-intensive compilation workflow. The `onBuildSubmitted` Cloud Function acts as the producer, transforming Firestore document creation events into Pub/Sub messages published to the `lfs-build-requests` topic, complete with serialized build configuration payloads (`{buildId, userId, projectName, lfsVersion, buildOptions}`). Cloud Run Jobs consume these messages, instantiating ephemeral Docker containers that execute the `lfs-build.sh` orchestration script within a hermetically sealed filesystem environment at `/mnt/lfs`. This architectural separation ensures that frontend responsiveness remains unaffected by backend compilation latency—the user receives immediate feedback (build status transitions from SUBMITTED → PENDING) while the actual GCC/glibc compilation proceeds asynchronously in the background, periodically emitting progress updates that flow back through Firestore to update the UI.

For the local build workflow, data flow follows a fundamentally different topology that prioritizes direct filesystem manipulation over network-mediated state synchronization. The PowerShell entry script `BUILD-LFS-CORRECT.ps1` marshals Windows-native path strings into WSL-compatible mount point references (`C:\Users\...` → `/mnt/c/Users/...`), then delegates execution to `init-lfs-env.sh`, which establishes a transactional boundary at `/mnt/lfs` where all subsequent build artifacts accumulate. The `chroot-and-build.sh` script performs a critical data plane transition, binding host virtual filesystems (`/dev`, `/proc`, `/sys`) into the chroot environment, then executing `sudo chroot "$LFS" /usr/bin/env -i` to create an information barrier that isolates the in-chroot build process (`build-lfs-in-chroot.sh`) from host system dependencies. Within the chroot, data flow becomes purely sequential and deterministic—each package compilation reads source tarballs from `$LFS/sources`, writes intermediate object files to package-specific build directories, and deposits final binaries into `$LFS/usr/bin` or `$LFS/usr/lib`, all while emitting structured logs via `tee -a "$BUILDLOG"` that capture stdout/stderr streams for post-build analysis.

The dual-path data architecture (cloud-native asynchronous vs. local-synchronous) creates interesting consistency challenges that the system resolves through careful state management. Local builds optionally integrate with Firestore via the `helpers/firestore-logger.js` module, which batches log writes into 50-line chunks to amortize network round-trip overhead, but this integration remains strictly optional—the local workflow can operate in a fully offline mode, accumulating all state in filesystem artifacts (`BUILDLOG`, `CURRENT_BUILD_INFO.txt`, `lfs-output/build-metadata-*.txt`) that users manually inspect or upload. This hybrid approach balances the educational requirement for maximum accessibility (students without reliable internet can still build LFS locally) against the operational benefits of centralized monitoring and artifact distribution (instructors can track class-wide build progress through the web dashboard).

The diagrams presented below, derived from actual implementation in `functions/index.js` (Cloud Functions orchestration), `lfs-build.sh` (Docker container build script), `build-lfs-complete-local.sh` (local toolchain builder), and `firestore.rules` (data access control policies), expose these data flow patterns through standardized DFD notation, providing a formal specification that maps each system capability to its constituent information transformations, data repositories, and external system interactions.

---

## 2.2.2.1 DFD Level 0 - Context Diagram

**Figure 7** presents the context diagram showing the LFS Automated Build System as a single process with external entities and data flows.

### External Entities

1. **End User**: Authenticated individual submitting builds and monitoring progress
2. **Google Cloud Platform (GCP)**: Infrastructure provider (Cloud Run, Firestore, Storage)
3. **LFS Mirror Servers**: External servers hosting source packages (kernel.org, gnu.org)
4. **Firebase Authentication**: OAuth and email/password authentication service

### Data Flows (Input)

**From End User to System**:
- **Build Request**: JSON payload containing `{buildId, userId, projectName, lfsVersion, email, buildOptions, additionalNotes}`
- **Authentication Credentials**: Email/password or OAuth tokens
- **Learning Progress Events**: Module completion, quiz results, terminal interactions

**From LFS Mirror Servers to System**:
- **Source Packages**: Compressed tarballs (`.tar.xz`, `.tar.gz`) for LFS packages (binutils, GCC, glibc, etc.)
- **Package Checksums**: MD5/SHA256 verification files

**From Firebase Authentication to System**:
- **JWT Tokens**: Signed authentication tokens for user sessions
- **User Profile Data**: Email, display name, provider information

### Data Flows (Output)

**From System to End User**:
- **Build Status Updates**: Real-time status changes (PENDING, RUNNING, COMPLETED, FAILED)
- **Build Logs**: Streaming compilation output, error messages, progress indicators
- **Build Artifacts**: Downloadable TAR archives containing compiled binaries
- **Learning Content**: Tutorial modules, code examples, terminal responses

**From System to Google Cloud Platform**:
- **Firestore Writes**: Build metadata, log entries, user progress records
- **GCS Uploads**: Artifact files, log archives
- **Cloud Run Executions**: Container instantiation requests, termination signals
- **Pub/Sub Messages**: Asynchronous build job triggers

---

**[INSERT FIGURE 17 HERE]**

**Figure 17. Data Flow Diagram Level 0 (Context Diagram) – LFS Build System External Interactions**

This DFD Level 0 context diagram (created in draw.io using Gane-Sarson notation with rounded rectangles for external entities, a central circle for the system process, and labeled arrows for data flows) provides the highest-level view of the LFS Automated Build System's interactions with its operating environment. The central circle, labeled "0.0 LFS Automated Build System," is positioned in the middle of the canvas, representing the entire system as a single unified process. Four external entities (drawn as rounded rectangles) surround the central process: "End User (Authenticated)" on the left, "Google Cloud Platform" on the right, "LFS Package Mirror Servers" at the bottom, and "System Administrator" at the top. Data flows are represented as labeled arrows connecting entities to the central process: from End User to System flows "Build Submission Request (userId, config, timestamp)" and "UI Interaction Events (clicks, navigations)" (blue arrows pointing inward), while from System to End User flows "Build Status Updates (status, progress, package)" and "Build Artifacts + Logs (TAR, logs, metadata)" (blue arrows pointing outward). From LFS Mirror Servers to System flows "Source Package Tarballs (.tar.xz, checksums)" (green arrow pointing inward), triggered by System to Mirror Server flow "HTTP Download Requests (package names, versions)" (green arrow pointing outward). From Google Cloud Platform to System flows "Auth Tokens (JWT), Firestore Snapshots (documents), Compute Resources (containers)" (orange arrows pointing inward), while from System to GCP flows "Firestore Writes (builds, logs, users), GCS Uploads (artifacts), Pub/Sub Publications (build requests)" (orange arrows pointing outward). From System Administrator to System flows "Admin Commands (cancel build, adjust quota)" (purple arrow pointing inward), and from System to Admin flows "System Metrics (build counts, durations), Aggregate Logs" (purple arrow pointing outward). Each data flow arrow is labeled with both the flow name and the data format/schema in parentheses (e.g., "Build Submission Request (userId, config, timestamp)"). The diagram uses color-coding to group related flows: blue for end-user interactions, orange for cloud service integrations, green for package download operations, and purple for administrative operations. This Level 0 diagram establishes the system boundary by clearly distinguishing between internal system processing (the central circle) and external actors/systems (rounded rectangles), fulfilling ISCS Requirement 4.2.2.1 for context-level data flow modeling. The diagram traces to code implementations: Build Submission flows to `functions/index.js` lines 30-65 (`onBuildSubmitted` function), HTTP Download Requests to `build-lfs-complete-local.sh` lines 150-200 (wget commands), Firestore Writes to `helpers/firestore-logger.js` lines 10-80, and Admin Commands to `app/admin/page.tsx` admin dashboard handlers. This context diagram serves as the foundation for Level 1 decomposition (Figure 18) by identifying the five major data transformation pathways that will be exploded into detailed sub-processes.

---

## 2.2.2.2 DFD Level 1 - Major Processes

**Figure 8** decomposes the system into five major processes with data stores and detailed flows.

### Process 1.0: Authenticate User

**Inputs**:
- User credentials (email/password or OAuth token)

**Processing** (implemented in Firebase Authentication SDK):
1. Validate credentials against Firebase Auth database
2. Generate JWT token with user claims
3. Create or update user session

**Outputs**:
- Authenticated session token
- User profile data → **D1: users collection**

**Data Store Interactions**:
- Reads/Writes: `D1: users` (Firestore collection)

---

### Process 2.0: Submit Build Request

**Inputs**:
- Build configuration from web form
- User authentication token

**Processing** (implemented in `functions/index.js` - `onBuildSubmitted`):
1. Validate JWT token
2. Check user build quota (max 5 concurrent builds)
3. Create Firestore document in `builds` collection
4. Assign unique `buildId` (auto-generated Firestore ID)
5. Set initial status to `SUBMITTED`
6. Trigger `onCreate` Cloud Function

**Outputs**:
- Build metadata → **D2: builds collection**
- Pub/Sub message → **Process 3.0**
- Confirmation response to user

**Code Reference** (lines 30-65 of `functions/index.js`):
```javascript
exports.onBuildSubmitted = functions
    .firestore
    .document('builds/{buildId}')
    .onCreate(async (snap, context) => {
        const buildData = snap.data();
        const buildId = context.params.buildId;
        
        // Update status to PENDING
        await db.collection('builds').doc(buildId).update({
            status: 'PENDING',
            pendingAt: admin.firestore.FieldValue.serverTimestamp(),
            traceId: context.eventId
        });
        
        // Publish to Pub/Sub
        const topic = pubsub.topic('lfs-build-requests');
        await topic.publishMessage({
            data: Buffer.from(JSON.stringify(buildConfig))
        });
    });
```

**Data Store Interactions**:
- Writes: `D2: builds` (initial document creation)
- Writes: `D2: builds` (status update to PENDING)

---

### Process 3.0: Execute Build in Cloud

**Inputs**:
- Pub/Sub message with build configuration
- Source packages from LFS mirrors

**Processing** (implemented in `lfs-build.sh` - `chapter_5_toolchain`):
1. Cloud Run instantiates Docker container
2. Parse `LFS_CONFIG_JSON` environment variable
3. Download source packages using `wget`
4. Verify checksums (MD5/SHA256)
5. Extract source tarballs
6. Execute compilation sequence for Chapter 5 packages:
   - M4, ncurses, bash, coreutils, diffutils, file, findutils, gawk
   - Grep, gzip, make, patch, sed, tar, xz, binutils (pass 1)
   - GCC (pass 1), Linux API headers, glibc, libstdc++
7. For each package:
   - Configure with `./configure --prefix=/tools`
   - Compile with `make -j$(nproc)`
   - Install with `make install`
   - Write log entry to Firestore

**Outputs**:
- Compilation logs → **D3: buildLogs collection**
- Status updates → **D2: builds collection**
- Compiled artifacts → **D4: Google Cloud Storage**
- Success/failure notification → **Process 4.0**

**Code Reference** (lines 400-600 of `lfs-build.sh`):
```bash
chapter_5_toolchain() {
    log_section "CHAPTER 5: TOOLCHAIN BUILD"
    
    # Package list (18 packages)
    local packages=(
        "m4-1.4.19"
        "ncurses-6.4"
        "bash-5.2.15"
        "coreutils-9.3"
        # ... (14 more packages)
    )
    
    for pkg in "${packages[@]}"; do
        build_package "$pkg"
        write_firestore_log "$pkg" "COMPLETED"
        update_build_status "RUNNING" "$pkg"
    done
}

build_package() {
    local pkg_name="$1"
    log_info "Building $pkg_name..."
    
    tar -xf "${LFS_SRC}/${pkg_name}.tar.xz"
    cd "${pkg_name}"
    
    ./configure --prefix=/tools
    make -j$(nproc) 2>&1 | tee -a "$LOG_FILE"
    make install 2>&1 | tee -a "$LOG_FILE"
}
```

**Data Store Interactions**:
- Writes: `D3: buildLogs` (per-package logs, every 5 seconds)
- Updates: `D2: builds` (currentPackage, progress percentage)
- Writes: `D4: GCS bucket` (final TAR archive)

---

### Process 4.0: Monitor Build Progress

**Inputs**:
- User authentication token
- Build ID from URL parameter

**Processing** (implemented in Next.js frontend with Firestore real-time listeners):
1. Establish WebSocket connection to Firestore
2. Subscribe to `builds/{buildId}` document changes
3. Subscribe to `buildLogs` collection filtered by `buildId`
4. Update UI components when data changes
5. Display progress bar based on `currentPackage / totalPackages`
6. Stream logs in terminal-like interface

**Outputs**:
- Real-time UI updates (status badge, progress bar)
- Log stream in terminal component
- Download button when status = COMPLETED

**Code Reference** (frontend implementation pattern):
```typescript
// Real-time listener (lfs-learning-platform/lib/firestore.ts)
const unsubscribe = onSnapshot(
    doc(db, 'builds', buildId),
    (snapshot) => {
        const buildData = snapshot.data();
        setStatus(buildData.status);
        setProgress(buildData.progress || 0);
        setCurrentPackage(buildData.currentPackage);
    }
);
```

**Data Store Interactions**:
- Reads: `D2: builds` (real-time subscription)
- Reads: `D3: buildLogs` (real-time subscription with filter)

---

### Process 5.0: Retrieve Build Artifacts

**Inputs**:
- User authentication token
- Build ID
- Completed build status

**Processing** (implemented in `functions/index.js` - artifact URL generation):
1. Verify user owns the build (userId match)
2. Check build status = COMPLETED
3. Generate time-limited signed URL for GCS object
4. Set expiration time (1 hour)
5. Return signed URL to user

**Outputs**:
- Signed download URL (expires in 3600 seconds)
- Download initiates from GCS bucket
- TAR archive delivered to user's browser

**Code Reference** (GCS signed URL generation):
```javascript
const bucket = storage.bucket(GCS_BUCKET_NAME);
const file = bucket.file(`builds/${buildId}/lfs-chapter5.tar.gz`);

const [url] = await file.getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: Date.now() + 60 * 60 * 1000, // 1 hour
});
```

**Data Store Interactions**:
- Reads: `D2: builds` (verify ownership and status)
- Reads: `D4: GCS bucket` (artifact retrieval)

---

**[INSERT FIGURE 18 HERE]**

**Figure 18. Data Flow Diagram Level 1 – Cloud Build Process Decomposition**

This DFD Level 1 diagram (created in draw.io using Gane-Sarson notation with numbered process circles, parallel-line data stores, and labeled data flow arrows) decomposes the central "LFS Automated Build System" process from Figure 17 into five major sub-processes that orchestrate the cloud-based build workflow. The diagram positions five process circles in a logical workflow sequence from left to right: "1.0 Authenticate & Authorize User" (purple circle, leftmost), "2.0 Submit Build Configuration" (blue circle), "3.0 Execute Build in Cloud" (orange circle, center), "4.0 Stream Build Progress" (green circle), and "5.0 Deliver Build Artifacts" (teal circle, rightmost). Four data stores (drawn as parallel horizontal lines) are positioned below the process circles: "D1: users" (purple, below Process 1.0), "D2: builds" (blue, below Process 2.0), "D3: logs" (green, below Process 4.0), and "D4: artifacts (GCS)" (teal, below Process 5.0). External entities appear at the diagram periphery: "End User" on the left, "Google Cloud Platform" on the right, and "LFS Package Mirror" at the bottom. Data flows connect these elements: from End User to Process 1.0 flows "Login Credentials (email, password)" and "OAuth Token", Process 1.0 writes to D1 (users) with "User Profile + JWT", Process 1.0 sends "Authenticated Session" to Process 2.0, from End User to Process 2.0 flows "Build Configuration (config, timestamp)", Process 2.0 writes "Build Metadata" to D2 (builds) and publishes "Pub/Sub Message (buildId, config)" to Process 3.0 via GCP, from LFS Mirror to Process 3.0 flows "Source Tarballs (.tar.xz)", Process 3.0 reads "Build Parameters" from D2 and executes Docker containers on GCP, Process 3.0 writes "Log Entries (package, status, output)" to D3 (logs), Process 4.0 reads from D3 and sends "Real-time Updates (onSnapshot)" to End User, Process 3.0 writes "Compiled Artifacts (TAR)" to D4 (GCS), Process 5.0 reads from D4 and generates "Signed Download URL" back to End User, Process 5.0 verifies ownership by reading from D2 (builds). Each process circle includes internal annotations: Process 1.0 shows "Firebase Auth SDK", Process 2.0 shows "`onCreate` trigger", Process 3.0 shows "Cloud Run + Docker", Process 4.0 shows "Firestore listeners", and Process 5.0 shows "GCS signed URLs". The diagram uses consistent color-coding: purple for authentication, blue for build submission, orange for build execution, green for progress monitoring, and teal for artifact delivery, matching the color scheme from Figure 17 to maintain visual continuity. This Level 1 diagram fulfills ISCS Requirement 4.2.2.2 by exposing the internal choreography of the five major subsystems and their data store interactions, providing developers with sufficient detail to understand which Cloud Function handles each data transformation step. Code references include: Process 1.0 traces to `lib/firebase.ts` lines 10-50 (Auth SDK initialization) and `app/(dashboard)/auth/` components, Process 2.0 to `functions/index.js` lines 30-65 (`onBuildSubmitted` function), Process 3.0 to `lfs-build.sh` lines 100-500 (Docker entrypoint), Process 4.0 to `components/lfs/build-progress.tsx` lines 40-90 (Firestore `onSnapshot` listeners), and Process 5.0 to `helpers/gcs-uploader.js` lines 50-100 (signed URL generation). Data store D2 (builds) is documented in Firestore schema Section 4.3.4, D3 (logs) structure in Section 4.3.3, and D4 (GCS artifacts) organization in `README.md` Section 5 (Artifact Management). This diagram bridges the gap between the high-level context view (Figure 17) and the detailed local build flow (Figure 19), providing stakeholders with a clear understanding of the cloud-native architecture's event-driven processing model.

---

## 2.2.2.3 Data Stores

### D1: users (Firestore Collection)
- **Purpose**: Store user profiles and authentication metadata
- **Key Fields**: `userId`, `email`, `displayName`, `createdAt`, `builds[]`
- **Access Pattern**: Read on authentication, write on registration

### D2: builds (Firestore Collection)
- **Purpose**: Store build metadata and status
- **Key Fields**: `buildId`, `userId`, `status`, `projectName`, `lfsVersion`, `currentPackage`, `progress`, `submittedAt`, `completedAt`
- **Access Pattern**: Write-heavy during build, read-heavy for monitoring
- **Indexes**: `userId`, `status`, `submittedAt`

### D3: buildLogs (Firestore Collection)
- **Purpose**: Store streaming compilation logs
- **Key Fields**: `logId`, `buildId`, `timestamp`, `level` (INFO/WARN/ERROR), `message`, `packageName`
- **Access Pattern**: Sequential writes during build, batch reads for display
- **Retention**: 30 days (lifecycle policy)

### D4: Google Cloud Storage Bucket
- **Purpose**: Store build artifacts (TAR archives, log files)
- **Structure**: `builds/{buildId}/lfs-chapter5.tar.gz`
- **Access Pattern**: Single write on completion, multiple reads for downloads
- **Retention**: 30 days (GCS lifecycle rule)

---

## 2.2.2.4 Process Summary Table

**Table 6. Major Process Descriptions**

| Process ID | Process Name | Inputs | Outputs | Data Stores | Implementation |
|------------|--------------|--------|---------|-------------|----------------|
| 1.0 | Authenticate User | Credentials | JWT token, user profile | D1 (R/W) | Firebase Auth |
| 2.0 | Submit Build | Build config, JWT | Build metadata, Pub/Sub msg | D2 (W) | `onBuildSubmitted` |
| 3.0 | Execute Build | Pub/Sub msg, sources | Logs, artifacts, status | D2 (U), D3 (W), D4 (W) | `lfs-build.sh` |
| 4.0 | Monitor Progress | JWT, buildId | UI updates, log stream | D2 (R), D3 (R) | Next.js frontend |
| 5.0 | Retrieve Artifacts | JWT, buildId | Signed URL, TAR file | D2 (R), D4 (R) | GCS signed URL |

*Legend: R=Read, W=Write, U=Update*

---

**Figure 7. Data Flow Diagram - Level 0 (Context Diagram)**  
<!-- TODO: Create context diagram showing:
- Central bubble: "LFS Automated Build System"
- External entities: End User, GCP, LFS Mirrors, Firebase Auth
- Data flows labeled with data types
- Use standard DFD notation (circles for processes, rectangles for entities, arrows for flows)
-->

**Figure 8. Data Flow Diagram - Level 1 (Major Processes)**  
<!-- TODO: Create Level 1 DFD showing:
- 5 numbered processes (circles): 1.0 Authenticate, 2.0 Submit, 3.0 Execute, 4.0 Monitor, 5.0 Retrieve
- 4 data stores (open rectangles): D1 users, D2 builds, D3 buildLogs, D4 GCS
- External entities (closed rectangles): End User, LFS Mirrors, Firebase Auth
- All data flows with labels
- Follow Gane-Sarson DFD notation
-->

---

## 2.2.2.5 Local Build Data Flow (WSL/Chroot Architecture)

The local build execution path follows a fundamentally different data flow topology compared to the cloud-native architecture, operating entirely within filesystem boundaries without network dependencies.

### Process 6.0: Initialize Local Build Environment

**Inputs**:
- User command via PowerShell: `.\BUILD-LFS-CORRECT.ps1`
- Windows host filesystem paths

**Processing** (implemented in `BUILD-LFS-CORRECT.ps1` → `init-lfs-env.sh`):
1. PowerShell validates WSL2 installation
2. Translates Windows paths to WSL mount points
3. Invokes WSL bash with script path
4. `init-lfs-env.sh` creates directory structure at `/mnt/lfs`
5. Sets environment variables
6. Creates `lfs` user with proper ownership
7. Establishes `/tools` symlink

**Outputs**:
- `/mnt/lfs/` directory hierarchy
- Environment configuration

**Data Store Interactions**:
- Writes: Shell environment variables
- Creates: `/mnt/lfs` filesystem structure

### Process 7.0: Build Temporary Toolchain (Chapter 5)

**Inputs**:
- LFS 12.0 source tarballs
- Build scripts: `build-lfs-complete-local.sh`

**Processing** (18 packages in sequence):
1. Download via wget from LFS mirrors
2. Extract, configure, compile, install each package
3. Log all output to BUILDLOG

**Outputs**:
- Compiled binaries in `/mnt/lfs/tools/`
- Build logs in `lfs-output/BUILDLOG`

### Process 8.0: Chroot and Final Build

**Inputs**:
- Temporary toolchain
- Scripts: `chroot-and-build.sh`, `build-lfs-in-chroot.sh`

**Processing**:
1. Bind mount virtual filesystems
2. Execute chroot with clean environment
3. Compile 50+ final system packages
4. Build Linux kernel
5. Configure bootloader

**Outputs**:
- Final system in `/mnt/lfs/usr/`, `/boot/`, `/etc/`
- TAR archive in `lfs-output/`
- Complete build logs

---

**[INSERT FIGURE 19 HERE]**

**Figure 19. Data Flow Diagram Level 2 – Local Build Process Detail (WSL2/Chroot Architecture)**

This DFD Level 2 diagram (created in draw.io using Gane-Sarson notation with detailed process decomposition, filesystem data stores, and cross-boundary data flows) provides an in-depth view of the local build execution path that operates outside the cloud infrastructure, specifically targeting Windows hosts with WSL2 environments. This diagram expands Process 7.0 and 8.0 from the conceptual hierarchy into eight granular sub-processes arranged in three horizontal swim-lanes representing execution contexts: "Windows Host" (top lane, light blue background), "WSL2 Ubuntu" (middle lane, green background), and "Chroot Environment" (bottom lane, orange background). The Windows Host lane contains a single process: "6.0 Launch PowerShell Wrapper (BUILD-LFS-CORRECT.ps1)" which sends "WSL Invocation Command" downward to the WSL2 lane. The WSL2 lane contains four processes in sequence: "6.1 Validate Prerequisites (init-lfs-env.sh)" which reads/writes to data store "D5: /mnt/lfs filesystem" (drawn as parallel lines below this lane), "6.2 Download Source Packages (wget)" which receives "HTTP Download Requests" from external entity "LFS Mirror Servers" (positioned at the right edge) and fetches "Source Tarballs (.tar.xz, checksums)" stored in "D6: /sources/" data store, "7.0 Build Temporary Toolchain (build-lfs-complete-local.sh)" which reads from D6 and writes compiled binaries to "D7: /tools/" data store (18 packages: Binutils Pass 1, GCC Pass 1, Linux Headers, Glibc, Libstdc++), and "7.1 Prepare Chroot (chroot-and-build.sh)" which reads from D7 and sends "chroot syscall + bind mounts" downward to the Chroot lane. The Chroot Environment lane contains three processes: "8.0 Execute Final Builds (build-lfs-in-chroot.sh)" which reads from D7 (/tools/), writes to data store "D8: /usr/ (final system)", and writes log entries to "D9: BUILDLOG" data store, "8.1 Build Linux Kernel (kernel .config, make bzImage)" which reads from D8 and writes "bzImage, modules" to "D10: /boot/", and "8.2 Package Artifacts (tar czf)" which reads from D8 and D10, creates "TAR Archive" written to "D11: lfs-output/", and sends "Artifact File Path" back upward through WSL2 to Windows Host. Data flows are meticulously labeled: from Process 6.0 to 6.1 flows "Environment Validation Request ($LFS, $LFS_TGT, sudo check)", from 6.1 to D5 flows "Directory Creation (mkdir -pv /mnt/lfs, chown)", from 6.2 to D6 flows "Extracted Sources (binutils-2.41/, gcc-13.2.0/)", from 7.0 to D7 flows "Compiled Toolchain Binaries (x86_64-lfs-linux-gnu-gcc, ld)", from 7.1 to 8.0 flows "Clean Environment (env -i HOME=/root TERM=$TERM)", from 8.0 to D9 flows "Package Status (package name, duration, exit code)", from 8.1 to D10 flows "vmlinuz-6.4.12-lfs-12.0", from 8.2 to D11 flows "lfs-chapter5-YYYYMMDD-HHMMSS.tar.gz". Each process circle includes technology annotations: Process 6.0 shows "PowerShell 5.1+", Process 6.1 shows "bash + sudo", Process 6.2 shows "wget --continue", Process 7.0 shows "./configure + make + make install", Process 7.1 shows "mount --bind + chroot", Process 8.0 shows "Isolated compilation", Process 8.1 shows "make menuconfig", Process 8.2 shows "tar with gzip compression". The diagram uses color-coded borders to distinguish execution contexts: blue for Windows Host processes, green for WSL2 processes, and orange for Chroot processes, visually reinforcing the layered virtualization architecture. This Level 2 diagram fulfills ISCS Requirement 4.2.2.5 by exposing the most granular details of the local build data transformation pipeline, enabling developers to understand precisely how data flows across three distinct OS boundaries (Windows → WSL2 → Chroot) and how each bash script orchestrates package compilation through filesystem data stores. Code references include: Process 6.0 traces to `BUILD-LFS-CORRECT.ps1` lines 50-150 (WSL invocation), Process 6.1 to `init-lfs-env.sh` lines 20-80 (prerequisite checks + directory setup), Process 6.2 to `build-lfs-complete-local.sh` lines 150-200 (wget loops), Process 7.0 to `build-lfs-complete-local.sh` lines 250-600 (18-package toolchain build), Process 7.1 to `chroot-and-build.sh` lines 30-70 (bind mounts + chroot invocation), Process 8.0 to `build-lfs-in-chroot.sh` lines 100-500 (final system compilation), Process 8.1 to `build-bootable-kernel.sh` lines 50-150 (kernel configuration + build), Process 8.2 to `build-lfs-in-chroot.sh` lines 550-600 (artifact packaging). Data store D5 corresponds to `/mnt/lfs/` directory structure documented in `README.md` Section 2, D7 maps to LFS Chapter 5 specification, D8 to Chapters 6-8, D10 to Chapter 10 (boot configuration), and D11 to local artifact retention policy. This diagram is essential for debugging build failures, as it clearly shows which process writes to which filesystem location, enabling developers to identify where compilation artifacts are missing or corrupted by tracing data flows backward from failed processes to their source data stores.

---

<!-- 
EXTRACTION SOURCES:
- Process flows: functions/index.js lines 1-453
- Build execution: lfs-build.sh lines 400-800
- Local build: BUILD-LFS-CORRECT.ps1, init-lfs-env.sh, build-lfs-complete-local.sh, chroot-and-build.sh
- Data stores: firestore.rules, Firestore schema documentation
- Real-time monitoring: Next.js components with onSnapshot listeners
-->

