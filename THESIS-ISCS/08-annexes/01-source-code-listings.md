# Annex 1: Key Source Code Listings

<!-- According to Section 2.3.8: Annexes contain supplementary materials -->

---

## A1.1 Cloud Function: Build Orchestration

**File**: `functions/index.js`

**Purpose**: Firebase Cloud Function triggered on new build submissions to orchestrate Cloud Run job execution via Pub/Sub.

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { PubSub } = require('@google-cloud/pubsub');

admin.initializeApp();
const db = admin.firestore();
const pubsub = new PubSub();

/**
 * Cloud Function triggered when a new build is submitted
 * Processes the build request and publishes to Pub/Sub for Cloud Run execution
 * 
 * @trigger onCreate builds/{buildId}
 * @param {DocumentSnapshot} snap - Firestore document snapshot
 * @param {EventContext} context - Event metadata
 */
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
    
    console.log(`[Cloud Function] Processing build ${buildId}`, {
      userId: buildData.userId,
      projectName: buildData.projectName,
      eventId: context.eventId
    });

    try {
      // Step 1: Update build status to PENDING
      await db.collection('builds').doc(buildId).update({
        status: 'PENDING',
        pendingAt: admin.firestore.FieldValue.serverTimestamp(),
        traceId: context.eventId
      });

      console.log(`[Cloud Function] Build ${buildId} marked as PENDING`);

      // Step 2: Construct build configuration for Cloud Run
      const buildConfig = {
        buildId: buildId,
        userId: buildData.userId,
        email: buildData.email,
        projectName: buildData.projectName,
        lfsVersion: buildData.lfsVersion || '12.0',
        buildOptions: buildData.buildOptions || {},
        projectId: process.env.GCLOUD_PROJECT,
        gcsBucket: `${process.env.GCLOUD_PROJECT}-lfs-builds`,
        firestoreDb: 'builds'
      };

      console.log('[Cloud Function] Build configuration:', buildConfig);

      // Step 3: Publish message to Pub/Sub topic
      const topic = pubsub.topic('lfs-build-requests');
      const messageBuffer = Buffer.from(JSON.stringify(buildConfig));
      
      const messageId = await topic.publishMessage({
        data: messageBuffer,
        attributes: {
          buildId: buildId,
          userId: buildData.userId,
          traceId: context.eventId,
          timestamp: new Date().toISOString()
        }
      });

      console.log(`[Cloud Function] Published Pub/Sub message ${messageId} for build ${buildId}`);

      // Step 4: Store Pub/Sub message ID in build document
      await db.collection('builds').doc(buildId).update({
        pubsubMessageId: messageId
      });

      console.log(`[Cloud Function] Build ${buildId} processing complete`);

      return { success: true, messageId };

    } catch (error) {
      console.error(`[Cloud Function] Error processing build ${buildId}:`, error);
      
      // Update build status to FAILED on error
      await db.collection('builds').doc(buildId).update({
        status: 'FAILED',
        errorMessage: `Cloud Function error: ${error.message}`,
        completedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      throw error; // Re-throw to mark Cloud Function execution as failed
    }
  });

/**
 * HTTP endpoint for manually triggering builds (testing/admin)
 * 
 * @trigger HTTP GET /triggerBuild?buildId={id}
 */
exports.triggerBuild = functions.https.onRequest(async (req, res) => {
  const buildId = req.query.buildId;
  
  if (!buildId) {
    res.status(400).send({ error: 'Missing buildId parameter' });
    return;
  }

  try {
    const buildDoc = await db.collection('builds').doc(buildId).get();
    
    if (!buildDoc.exists) {
      res.status(404).send({ error: 'Build not found' });
      return;
    }

    // Trigger the same logic as onCreate
    const topic = pubsub.topic('lfs-build-requests');
    const buildConfig = {
      buildId,
      ...buildDoc.data()
    };

    const messageId = await topic.publishMessage({
      data: Buffer.from(JSON.stringify(buildConfig))
    });

    res.status(200).send({
      success: true,
      buildId,
      messageId
    });

  } catch (error) {
    console.error('Error triggering build:', error);
    res.status(500).send({ error: error.message });
  }
});
```

**Key Features**:
- Event-driven architecture via Firestore onCreate trigger
- Atomic status updates with server timestamps
- Pub/Sub message publishing for decoupled processing
- Comprehensive error handling with failure status updates
- Structured logging with trace IDs for Cloud Logging correlation

---

## A1.2 Build Script: Main Orchestration Logic

**File**: `lfs-build.sh` (excerpt: initialization and logging functions)

```bash
#!/bin/bash
set -euo pipefail

# ============================================================
# LFS Automated Build Script - Version 1.0
# Orchestrates Linux From Scratch 12.0 Chapter 5 build
# ============================================================

# Global configuration
readonly LFS_VERSION="12.0"
readonly LFS=${LFS:-/mnt/lfs}
readonly LFS_TGT="x86_64-lfs-linux-gnu"
readonly MAKEFLAGS="-j$(nproc)"

# Directories
readonly LOG_DIR="/logs"
readonly OUTPUT_DIR="/output"
readonly LFS_SRC="${LFS}/sources"
readonly LFS_TOOLS="${LFS}/tools"

# Counters
TOTAL_PACKAGES=18
COMPLETED_PACKAGES=0
ERRORS_COUNT=0
WARNINGS_COUNT=0

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly CYAN='\033[0;36m'
readonly NC='\033[0m' # No Color

# ============================================================
# Logging Functions
# ============================================================

log_info() {
    local message="$1"
    echo -e "${GREEN}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - ${message}"
    
    # Write to Firestore via helper script
    if [[ -n "${BUILD_ID:-}" ]]; then
        node /workspace/helpers/firestore-logger.js \
            --buildId "${BUILD_ID}" \
            --level INFO \
            --message "${message}" \
            --source "lfs-build.sh" || true
    fi
}

log_warn() {
    local message="$1"
    echo -e "${YELLOW}[WARN]${NC} $(date '+%Y-%m-%d %H:%M:%S') - ${message}"
    ((WARNINGS_COUNT++))
    
    if [[ -n "${BUILD_ID:-}" ]]; then
        node /workspace/helpers/firestore-logger.js \
            --buildId "${BUILD_ID}" \
            --level WARN \
            --message "${message}" \
            --source "lfs-build.sh" || true
    fi
}

log_error() {
    local message="$1"
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - ${message}" >&2
    ((ERRORS_COUNT++))
    
    if [[ -n "${BUILD_ID:-}" ]]; then
        node /workspace/helpers/firestore-logger.js \
            --buildId "${BUILD_ID}" \
            --level ERROR \
            --message "${message}" \
            --source "lfs-build.sh" || true
    fi
}

log_debug() {
    local message="$1"
    if [[ "${DEBUG:-false}" == "true" ]]; then
        echo -e "${CYAN}[DEBUG]${NC} $(date '+%Y-%m-%d %H:%M:%S') - ${message}"
    fi
}

# ============================================================
# Environment Initialization
# ============================================================

init_directories() {
    log_info "Initializing build directories"
    
    mkdir -p "${LOG_DIR}" "${OUTPUT_DIR}" "${LFS_SRC}" "${LFS_TOOLS}"
    
    # Set permissions
    chmod -R 755 "${LFS}"
    
    log_info "Directory structure created:"
    log_info "  LFS root: ${LFS}"
    log_info "  Sources: ${LFS_SRC}"
    log_info "  Tools: ${LFS_TOOLS}"
    log_info "  Logs: ${LOG_DIR}"
    log_info "  Output: ${OUTPUT_DIR}"
}

parse_config() {
    log_info "Parsing build configuration from JSON"
    
    # Expects LFS_CONFIG_JSON environment variable with build config
    if [[ -z "${LFS_CONFIG_JSON:-}" ]]; then
        log_error "LFS_CONFIG_JSON environment variable not set"
        exit 1
    fi
    
    # Extract fields using jq
    export BUILD_ID=$(echo "${LFS_CONFIG_JSON}" | jq -r '.buildId')
    export USER_ID=$(echo "${LFS_CONFIG_JSON}" | jq -r '.userId')
    export PROJECT_NAME=$(echo "${LFS_CONFIG_JSON}" | jq -r '.projectName')
    export LFS_VERSION_CONFIG=$(echo "${LFS_CONFIG_JSON}" | jq -r '.lfsVersion')
    export GCS_BUCKET=$(echo "${LFS_CONFIG_JSON}" | jq -r '.gcsBucket')
    
    # Parse build options
    export INCLUDE_GLIBC_DEV=$(echo "${LFS_CONFIG_JSON}" | jq -r '.buildOptions.includeGlibcDev // false')
    export INCLUDE_KERNEL=$(echo "${LFS_CONFIG_JSON}" | jq -r '.buildOptions.includeKernel // false')
    export OPTIMIZE_SIZE=$(echo "${LFS_CONFIG_JSON}" | jq -r '.buildOptions.optimizeSize // false')
    
    log_info "Configuration loaded:"
    log_info "  Build ID: ${BUILD_ID}"
    log_info "  User ID: ${USER_ID}"
    log_info "  Project: ${PROJECT_NAME}"
    log_info "  LFS Version: ${LFS_VERSION_CONFIG}"
    log_info "  GCS Bucket: ${GCS_BUCKET}"
    log_info "  Options: glibc-dev=${INCLUDE_GLIBC_DEV}, kernel=${INCLUDE_KERNEL}, optimize=${OPTIMIZE_SIZE}"
}

update_build_status() {
    local status="$1"
    local current_package="${2:-}"
    
    log_info "Updating build status to ${status}"
    
    # Calculate progress percentage
    local progress=$((COMPLETED_PACKAGES * 100 / TOTAL_PACKAGES))
    
    # Update Firestore via gcloud CLI
    gcloud firestore documents update \
        "builds/${BUILD_ID}" \
        --data "status=${status},currentPackage=${current_package},progress=${progress},completedPackages=${COMPLETED_PACKAGES}" \
        --project="${GCLOUD_PROJECT}" || {
            log_warn "Failed to update Firestore status"
        }
}

# ============================================================
# Package Build Function
# ============================================================

build_package() {
    local package_name="$1"
    local package_version="$2"
    local build_function="$3"  # Name of function to call for build steps
    
    log_info "========================================="
    log_info "Building ${package_name} ${package_version}"
    log_info "========================================="
    
    update_build_status "RUNNING" "${package_name}-${package_version}"
    
    # Download tarball if not cached
    local tarball="${package_name}-${package_version}.tar.xz"
    if [[ ! -f "${LFS_SRC}/${tarball}" ]]; then
        log_info "Downloading ${tarball}"
        wget -P "${LFS_SRC}" "https://ftp.gnu.org/gnu/${package_name}/${tarball}" || {
            log_error "Failed to download ${package_name}"
            return 1
        }
    else
        log_info "Using cached ${tarball}"
    fi
    
    # Extract source
    local build_dir="/tmp/${package_name}-${package_version}"
    rm -rf "${build_dir}"
    tar -xf "${LFS_SRC}/${tarball}" -C /tmp || {
        log_error "Failed to extract ${tarball}"
        return 1
    }
    
    cd "${build_dir}" || return 1
    
    # Execute package-specific build function
    if declare -f "${build_function}" > /dev/null; then
        log_info "Executing build function: ${build_function}"
        ${build_function} || {
            log_error "${package_name} build failed"
            return 1
        }
    else
        log_error "Build function ${build_function} not found"
        return 1
    fi
    
    # Increment completed counter
    ((COMPLETED_PACKAGES++))
    log_info "${package_name} ✅ Build successful (${COMPLETED_PACKAGES}/${TOTAL_PACKAGES})"
    
    # Cleanup build directory
    cd /
    rm -rf "${build_dir}"
    
    return 0
}

# ============================================================
# Main Execution
# ============================================================

main() {
    log_info "LFS Automated Build Script starting"
    log_info "LFS Version: ${LFS_VERSION}"
    log_info "Target: ${LFS_TGT}"
    log_info "Parallel jobs: ${MAKEFLAGS}"
    
    # Initialize
    init_directories
    parse_config
    
    # Update status to RUNNING
    update_build_status "RUNNING" "initialization"
    
    # Start build process
    log_info "Starting Chapter 5 toolchain build"
    
    # ... (package build calls would follow)
    
    log_info "Build completed with ${ERRORS_COUNT} errors and ${WARNINGS_COUNT} warnings"
}

# Execute main function
main "$@"
```

**Key Features**:
- Comprehensive logging with color-coded output
- Firestore integration for real-time log streaming
- Error counting and status updates
- Atomic build directory management
- Configurable build options via JSON parsing

---

<!--
Additional annexes (A1.3-A1.6) would include:
- A1.3: React Component Examples (BuildWizard, LogViewer)
- A1.4: Dockerfile Complete Listing
- A1.5: Firestore Security Rules
- A1.6: Cloud Build Configuration (cloudbuild.yaml)
-->
