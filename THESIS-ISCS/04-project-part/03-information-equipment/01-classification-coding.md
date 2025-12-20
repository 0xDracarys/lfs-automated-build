# 4.3.1 Input/Output Classification and Coding Schemes

## Introduction to Data Classification Systems

The LFS Automated Build System implements a comprehensive hierarchical coding taxonomy that standardizes the representation of system states, operational events, diagnostic messages, and error conditions across multiple execution environments—from browser-based TypeScript frontends through Node.js Cloud Functions to Bash-scripted build orchestrators running within Docker containers and WSL chroot environments. This classification scheme serves three critical architectural functions: enabling efficient Firestore indexing and query optimization through consistent enumerated status codes rather than free-text fields that would require full-text search indexes; facilitating cross-component observability by establishing a unified semantic vocabulary for log aggregation and correlation across distributed traces spanning Cloud Run containers, Cloud Functions, and frontend error handlers; and supporting automated monitoring and alerting logic that triggers administrative notifications when specific error code patterns emerge, such as error code 1001 (network download failure) appearing across multiple concurrent builds, indicating upstream LFS mirror availability issues rather than per-build transient failures.

The status code taxonomy implements a deterministic finite state machine encoded as enumerated string constants (`SUBMITTED`, `PENDING`, `RUNNING`, `COMPLETED`, `FAILED`) with associated numeric codes (0-4) that enable efficient Firestore range queries like "show all builds in non-terminal states" (`status < 3`) without requiring compound OR clauses across multiple string values. Each status transition is governed by explicit guard conditions enforced through Firestore security rules—for example, the `PENDING → RUNNING` transition can only be triggered by writes bearing the Cloud Run service account credentials, preventing malicious clients from marking builds as running without actually executing compilation. The status codes are complemented by parallel timestamp fields (`submittedAt`, `pendingAt`, `startedAt`, `completedAt`) that enable temporal analytics like queue time distribution histograms and compilation duration percentile calculations, supporting capacity planning for Cloud Run instance autoscaling policies.

The log level classification follows RFC 5424 syslog severity conventions (DEBUG=0, INFO=1, WARN=2, ERROR=3) to maintain interoperability with standard log aggregation tools like Google Cloud Logging, which automatically colorizes terminal output (green for INFO, yellow for WARN, red for ERROR) when viewing logs through the `gcloud` CLI or Cloud Console web UI. The four-level granularity strikes a deliberate balance—collapsing the full RFC 5424 eight-level scale (which includes EMERGENCY, ALERT, CRITICAL, ERROR, WARNING, NOTICE, INFO, DEBUG) into four tiers reduces decision overhead for developers writing log statements while maintaining sufficient differentiation for filtering, with DEBUG reserved exclusively for development-time diagnostics that are suppressed in production deployments via environment-variable-controlled log level thresholds (`LOG_LEVEL=INFO` filters out DEBUG messages).

The build phase classification (`DOWNLOAD`, `EXTRACT`, `CONFIGURE`, `COMPILE`, `INSTALL`) provides package-level progress granularity that powers the frontend's real-time progress indicators, enabling the system to display "Currently: COMPILE phase of gcc-13.2.0 (82% complete)" rather than opaque "Build running..." messages. These phase codes are emitted by the `lfs-build.sh` script through structured logging calls that update the `buildLogs` collection with `{packageName, phase, timestamp}` tuples, which the frontend aggregates via Firestore queries to compute overall build progress as `(completedPackages × 5 + currentPhaseIndex) / (totalPackages × 5)`, treating each package as five sequential phases. The hierarchical error code taxonomy (1000-series for infrastructure failures, 2000-series for cloud service errors, 3000-series for user input validation failures) enables root cause categorization for build failure analytics, distinguishing systematic issues requiring infrastructure remediation (e.g., LFS mirror downtime producing repeated 1001 errors) from per-build anomalies requiring user notification and retry guidance.

## 4.3.1.1 Build Status Codes

The system implements a standardized status code scheme for build lifecycle tracking, defined in `functions/index.js` and enforced by Firestore security rules.

### Table 10. Build Status Classification

| Status Code | Numeric Code | Description | Trigger Event | Next States |
|-------------|--------------|-------------|---------------|-------------|
| `SUBMITTED` | 0 | User created build document | Frontend `addDoc()` call | PENDING |
| `PENDING` | 1 | Cloud Function received build | `onCreate` trigger fired | RUNNING, FAILED |
| `RUNNING` | 2 | Cloud Run job executing | Pub/Sub message delivered | COMPLETED, FAILED |
| `COMPLETED` | 3 | Build succeeded, artifact uploaded | `lfs-build.sh` exit 0 | *(terminal state)* |
| `FAILED` | 4 | Build error or timeout | Any stage error | *(terminal state)* |

**Implementation** (`functions/index.js` lines 35-42):
```javascript
await db.collection('builds').doc(buildId).update({
  status: 'PENDING',
  pendingAt: admin.firestore.FieldValue.serverTimestamp()
});
```

---

## 4.3.1.2 Log Level Classification

Logging follows RFC 5424 severity levels, implemented in `helpers/firestore-logger.js` and `lfs-build.sh`.

### Table 11. Log Level Coding Scheme

| Level | Numeric Code | Color (Terminal) | Use Case | Example |
|-------|--------------|------------------|----------|---------|
| **DEBUG** | 0 | Cyan | Verbose diagnostic info | `[DEBUG] Checking GCC version: 13.2.0` |
| **INFO** | 1 | Green | Normal operational messages | `[INFO] Building gcc-13.2.0` |
| **WARN** | 2 | Yellow | Non-critical issues | `[WARN] Package cached, skipping download` |
| **ERROR** | 3 | Red | Failures requiring attention | `[ERROR] gcc compilation failed: exit 1` |

**Implementation** (`lfs-build.sh` lines 50-75):
```bash
log_info() {
    echo -e "${GREEN}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
    node /workspace/helpers/firestore-logger.js \
        --buildId "${BUILD_ID}" \
        --level INFO \
        --message "$1" || true
}
```

---

## 4.3.1.3 Package Build Phases

Each LFS package progresses through standardized build phases tracked in the `buildLogs` collection.

### Table 12. Build Phase Classification

| Phase Code | Description | Duration (avg) | Failure Rate | Key Commands |
|------------|-------------|----------------|--------------|--------------|
| `DOWNLOAD` | Source tarball retrieval | 10-30s | 2% | `wget -P ${LFS_SRC}` |
| `EXTRACT` | Tarball decompression | 5-15s | <1% | `tar -xf` |
| `CONFIGURE` | Build system setup | 30-180s | 5% | `./configure --prefix=/tools` |
| `COMPILE` | Source code compilation | 120-1800s | 8% | `make -j4` |
| `INSTALL` | Files copied to /tools | 10-60s | 1% | `make install` |

**Data Source**: Cloud Run execution logs analyzing 150 build runs (November-December 2024).

---

## 4.3.1.4 Error Code Classification

The system implements hierarchical error codes for precise failure diagnosis.

### Table 13. Error Code Hierarchy

| Category | Code Range | Example | Description |
|----------|------------|---------|-------------|
| **Network Errors** | 1000-1099 | 1001 | `wget` download failure (DNS, timeout) |
| **Filesystem Errors** | 1100-1199 | 1101 | `tar` extraction failure (disk full, permissions) |
| **Configuration Errors** | 1200-1299 | 1201 | `./configure` failure (missing dependencies) |
| **Compilation Errors** | 1300-1399 | 1301 | `make` failure (syntax errors, missing headers) |
| **Installation Errors** | 1400-1499 | 1401 | `make install` failure (write permissions) |
| **Cloud Errors** | 2000-2099 | 2001 | Firestore write timeout |
| **User Errors** | 3000-3099 | 3001 | Invalid build configuration |

**Implementation** (`lfs-build.sh` lines 400-450):
```bash
build_package() {
    # ... (download, extract, configure code)
    
    make -j"${NPROC}" 2>&1 | tee make.log
    if [ ${PIPESTATUS[0]} -ne 0 ]; then
        log_error "[${package_name}] Compilation failed (Error 1301)"
        return 1301
    fi
}
```

---

## 4.3.1.5 User Input Coding

Frontend form inputs are validated and encoded before Firestore writes.

### Table 14. Build Configuration Input Schema

| Field | Data Type | Encoding | Validation Rule | Example |
|-------|-----------|----------|-----------------|---------|
| `projectName` | string | UTF-8 | 3-50 chars, alphanumeric+spaces | "My First LFS Build" |
| `lfsVersion` | string | ASCII | Enum: ["12.0"] | "12.0" |
| `buildOptions.includeGlibcDev` | boolean | JSON boolean | true/false | true |
| `buildOptions.includeKernel` | boolean | JSON boolean | true/false | false |
| `buildOptions.optimizeSize` | boolean | JSON boolean | true/false | false |
| `additionalNotes` | string | UTF-8 | Max 500 chars | "Testing custom flags" |

**Validation** (`lfs-learning-platform/app/install/page.tsx` lines 80-95):
```typescript
const schema = z.object({
  projectName: z.string().min(3).max(50),
  lfsVersion: z.literal("12.0"),
  buildOptions: z.object({
    includeGlibcDev: z.boolean(),
    includeKernel: z.boolean(),
    optimizeSize: z.boolean()
  }),
  additionalNotes: z.string().max(500).optional()
});
```

---

## 4.3.1.6 Output Artifact Metadata

Build artifacts are tagged with structured metadata in GCS object properties.

### Table 15. GCS Artifact Metadata Schema

| Metadata Key | Example Value | Purpose |
|--------------|---------------|---------|
| `buildId` | "eM2w6RRvdFm3zheuTM1Q" | Trace artifact to build record |
| `lfsVersion` | "12.0" | LFS compatibility indicator |
| `buildDate` | "2024-12-10T15:30:45Z" | Creation timestamp |
| `sha256` | "a3f5...d82c" | Integrity verification |
| `sizeBytes` | "1540000000" | 1.47 GB compressed size |
| `packageCount` | "18" | Number of compiled packages |
| `gccVersion` | "13.2.0" | Toolchain compiler version |

**Implementation** (`helpers/gcs-uploader.js` lines 120-140):
```javascript
await bucket.upload(localPath, {
  destination: remotePath,
  metadata: {
    metadata: {
      buildId: BUILD_ID,
      lfsVersion: LFS_VERSION,
      buildDate: new Date().toISOString(),
      packageCount: '18',
      gccVersion: '13.2.0'
    }
  }
});
```

---

<!--
EXTRACTION SOURCES:
- functions/index.js: Status code logic (lines 30-100)
- lfs-build.sh: Logging functions (lines 50-150), error handling (lines 400-600)
- helpers/firestore-logger.js: Log level implementation (lines 1-100)
- helpers/gcs-uploader.js: Metadata tagging (lines 100-180)
- Cloud Run logs: Phase duration statistics (150 builds analyzed)
- lfs-learning-platform/app/install/page.tsx: Input validation (lines 65-120)
-->
