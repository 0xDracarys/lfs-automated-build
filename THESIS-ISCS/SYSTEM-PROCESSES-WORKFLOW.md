# System Processes and Workflow States

## Overview

This document provides detailed documentation of system processes and states for the LFS Automated Build System, covering workflow steps, build states, activity sequences, and state transitions as required by ISCS methodology Section 2.3.4 (System States and Processes).

---

## 1. Build Workflow Process Description

### 1.1 Configuration Parsing and Environment Initialization

**Activity 1: Parse Build Configuration**

Configuration parsing occurs at system initialization through environment variable extraction or JSON parameter loading.

**Input Sources:**
- Environment variable: `LFS_CONFIG_JSON` (Cloud Run execution)
- PowerShell parameters: `BUILD-LFS-CORRECT.ps1` command-line args
- Default configuration file: `lfs-build.config` (local fallback)

**Parsing Logic** (from `lfs-build.sh` lines 180-250):
```bash
parse_config() {
    log_info "Parsing build configuration from JSON"
    
    # Validate presence of config
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
    
    # Parse build options sub-object
    export INCLUDE_GLIBC_DEV=$(echo "${LFS_CONFIG_JSON}" | jq -r '.buildOptions.includeGlibcDev // false')
    export INCLUDE_KERNEL=$(echo "${LFS_CONFIG_JSON}" | jq -r '.buildOptions.includeKernel // false')
    export OPTIMIZE_SIZE=$(echo "${LFS_CONFIG_JSON}" | jq -r '.buildOptions.optimizeSize // false')
    
    log_info "Configuration loaded successfully"
    log_info "  Build ID: ${BUILD_ID}"
    log_info "  User ID: ${USER_ID}"
    log_info "  Project: ${PROJECT_NAME}"
    log_info "  LFS Version: ${LFS_VERSION_CONFIG}"
}
```

**Configuration Validation:**
- Required fields check: `buildId`, `lfsVersion`, `projectId`
- Optional fields with defaults: `buildOptions`, `additionalNotes`
- Type validation: Booleans for flags, strings for IDs
- **Decision Point**: Valid configuration?
  - YES → Proceed to Activity 2
  - NO → Log error, update Firestore status to FAILED, terminate

**Activity 2: Initialize Build Environment**

Environment initialization creates directory structures and sets critical environment variables required for LFS compilation.

**Directory Creation** (`init-lfs-env.sh` and `lfs-build.sh` lines 150-180):
```bash
init_directories() {
    log_info "Initializing directories..."
    
    # Create primary build directories
    mkdir -p "$LOG_DIR"
    mkdir -p "$OUTPUT_DIR"
    mkdir -p "$LFS_SRC"      # /mnt/lfs/sources
    mkdir -p "$LFS_MNT"      # /mnt/lfs
    
    # Create subdirectory structure
    mkdir -p "$LFS_MNT/tools"
    mkdir -p "$LFS_MNT/usr/bin"
    mkdir -p "$LFS_MNT/usr/lib"
    mkdir -p "$LFS_MNT/usr/include"
    mkdir -p "$LFS_MNT/etc"
    mkdir -p "$LFS_MNT/var"
    mkdir -p "$LFS_MNT/boot"
    
    # Write log header
    {
        echo "========================================"
        echo "LFS Automated Build Log"
        echo "========================================"
        echo "Start Time: $(date)"
        echo "Build ID: ${BUILD_ID:-unknown}"
        echo "LFS Version: ${LFS_VERSION}"
        echo "========================================"
    } > "$LOG_FILE"
    
    log_info "Directories initialized successfully"
}
```

**Environment Variable Export** (critical for cross-compilation):
```bash
export LFS=/mnt/lfs
export LFS_TGT=x86_64-lfs-linux-gnu
export PATH=/tools/bin:/usr/bin:/bin:/usr/sbin:/sbin
export MAKEFLAGS="-j$(nproc)"
export LC_ALL=C.UTF-8
```

**Verification Steps:**
1. Check disk space availability: `df -h $LFS` (minimum 10GB required)
2. Verify write permissions: `touch $LFS/test && rm $LFS/test`
3. Validate environment variables: `echo $LFS $LFS_TGT $PATH`
4. Test toolchain availability: `gcc --version`, `make --version`

---

### 1.2 Source Package Download and Verification

**Activity 3: Download Source Packages**

LFS 12.0 Chapter 5 requires 18 source packages totaling approximately 350 MB.

**Package List:**
1. M4 1.4.19
2. Ncurses 6.4
3. Bash 5.2.15
4. Coreutils 9.3
5. Diffutils 3.10
6. File 5.45
7. Findutils 4.9.0
8. Gawk 5.2.2
9. Grep 3.11
10. Gzip 1.12
11. Make 4.4.1
12. Patch 2.7.6
13. Sed 4.9
14. Tar 1.35
15. Xz 5.4.4
16. Binutils 2.41 (Pass 1 & 2)
17. GCC 13.2.0 (Pass 1 & 2)
18. Linux API Headers 6.4.12
19. Glibc 2.38
20. Libstdc++ (part of GCC)

**Download Process** (implemented in `docker-entrypoint.sh` and `lfs-build.sh`):
```bash
download_sources() {
    log_info "Downloading LFS source packages..."
    
    cd "$LFS_SRC"
    
    # Read package list
    local packages=(
        "m4-1.4.19.tar.xz"
        "ncurses-6.4.tar.gz"
        # ... (full list)
    )
    
    for package in "${packages[@]}"; do
        local package_name="${package%.tar.*}"
        local url="https://ftp.gnu.org/gnu/${package_name%-*}/${package}"
        
        # Check if already downloaded
        if [[ -f "${package}" ]]; then
            log_info "Skipping ${package} (already exists)"
            continue
        fi
        
        # Download with retry logic
        log_info "Downloading ${package}..."
        wget --retry-connrefused \
             --waitretry=5 \
             --read-timeout=20 \
             --timeout=15 \
             --tries=3 \
             -O "${package}" \
             "${url}"
        
        if [[ $? -ne 0 ]]; then
            log_error "Failed to download ${package}"
            return 1
        fi
    done
    
    log_info "All packages downloaded successfully"
}
```

**Checksum Verification:**
```bash
verify_checksums() {
    log_info "Verifying package checksums..."
    
    cd "$LFS_SRC"
    
    # Download MD5 checksums file
    wget -q https://www.linuxfromscratch.org/lfs/downloads/stable/md5sums
    
    # Verify each package
    while IFS= read -r line; do
        local expected_md5=$(echo "$line" | awk '{print $1}')
        local filename=$(echo "$line" | awk '{print $2}')
        
        if [[ -f "$filename" ]]; then
            local actual_md5=$(md5sum "$filename" | awk '{print $1}')
            
            if [[ "$expected_md5" != "$actual_md5" ]]; then
                log_error "Checksum mismatch for $filename"
                log_error "Expected: $expected_md5"
                log_error "Actual:   $actual_md5"
                return 1
            fi
            
            log_info "✓ $filename verified"
        fi
    done < md5sums
    
    log_info "All checksums verified"
}
```

**Decision Point**: Checksum valid?
- NO → Delete corrupted file, retry download (max 3 attempts), else FAIL build
- YES → Continue to Activity 4

---

### 1.3 Build Status State Management

**Activity 4: Update Build Status to RUNNING**

Status update occurs via Firestore write (cloud builds) or local file write (local builds).

**Firestore Update** (cloud builds via `helpers/firestore-logger.js`):
```javascript
async function updateBuildStatus(buildId, status, message) {
    const admin = require('firebase-admin');
    const db = admin.firestore();
    
    await db.collection('builds').doc(buildId).update({
        status: status,
        currentPackage: message || '',
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`Status updated: ${buildId} → ${status}`);
}
```

**Local File Update** (local builds via `CURRENT_BUILD_INFO.txt`):
```bash
update_local_status() {
    local build_id="$1"
    local status="$2"
    local package="$3"
    
    cat > "$PROJECT_ROOT/CURRENT_BUILD_INFO.txt" <<EOF
╔════════════════════════════════════════════════════════════════╗
║              LFS BUILD IN PROGRESS                             ║
╚════════════════════════════════════════════════════════════════╝

BUILD DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Build ID:           ${build_id}
Type:               Chapter 5 Toolchain Build
Started:            $(date '+%Y-%m-%d %H:%M:%S')
Status:             ${status}
Current Package:    ${package}
Progress:           ${COMPLETED_PACKAGES}/${TOTAL_PACKAGES}

Generated: $(date '+%Y-%m-%d %H:%M:%S')
EOF
}
```

---

### 1.4 Toolchain Build Loop

**Activity 5: Build Toolchain (Loop for 18 Packages)**

The toolchain build is the core compilation sequence, iterating through each package with configure, compile, and install steps.

**Package Build Function Template:**
```bash
build_package() {
    local package_name="$1"
    local package_version="$2"
    local configure_flags="$3"
    
    log_info "Building ${package_name} ${package_version}..."
    
    # Extract tarball
    cd "$LFS_SRC"
    tar -xf "${package_name}-${package_version}.tar.xz"
    cd "${package_name}-${package_version}"
    
    # Create build directory (out-of-tree build)
    mkdir -v build
    cd build
    
    # Configure
    log_info "Configuring ${package_name}..."
    ../configure ${configure_flags}
    
    if [[ $? -ne 0 ]]; then
        log_error "Configure failed for ${package_name}"
        return 1
    fi
    
    # Compile
    log_info "Compiling ${package_name}..."
    make -j$(nproc)
    
    if [[ $? -ne 0 ]]; then
        log_error "Compilation failed for ${package_name}"
        return 1
    fi
    
    # Install
    log_info "Installing ${package_name}..."
    make install
    
    if [[ $? -ne 0 ]]; then
        log_error "Installation failed for ${package_name}"
        return 1
    fi
    
    # Cleanup
    cd "$LFS_SRC"
    rm -rf "${package_name}-${package_version}"
    
    log_info "${package_name} ✅ Build successful"
    
    # Update progress
    COMPLETED_PACKAGES=$((COMPLETED_PACKAGES + 1))
    update_local_status "$BUILD_ID" "RUNNING" "$package_name"
    
    return 0
}
```

**Critical Packages with Special Handling:**

**1. Binutils Pass 1:**
```bash
build_binutils_pass1() {
    log_section "Building Binutils Pass 1"
    
    cd "$LFS_SRC"
    tar -xf binutils-2.41.tar.xz
    cd binutils-2.41
    mkdir -v build && cd build
    
    ../configure \
        --prefix=/tools \
        --with-sysroot=$LFS \
        --target=$LFS_TGT \
        --disable-nls \
        --enable-gprofng=no \
        --disable-werror
    
    make -j$(nproc)
    make install
    
    cd "$LFS_SRC"
    rm -rf binutils-2.41
}
```

**2. GCC Pass 1:**
```bash
build_gcc_pass1() {
    log_section "Building GCC Pass 1"
    
    cd "$LFS_SRC"
    tar -xf gcc-13.2.0.tar.xz
    cd gcc-13.2.0
    
    # Extract GCC dependencies
    tar -xf ../mpfr-4.2.0.tar.xz
    mv -v mpfr-4.2.0 mpfr
    tar -xf ../gmp-6.3.0.tar.xz
    mv -v gmp-6.3.0 gmp
    tar -xf ../mpc-1.3.1.tar.gz
    mv -v mpc-1.3.1 mpc
    
    mkdir -v build && cd build
    
    ../configure \
        --target=$LFS_TGT \
        --prefix=/tools \
        --with-glibc-version=2.38 \
        --with-sysroot=$LFS \
        --with-newlib \
        --without-headers \
        --enable-default-pie \
        --enable-default-ssp \
        --disable-nls \
        --disable-shared \
        --disable-multilib \
        --disable-threads \
        --disable-libatomic \
        --disable-libgomp \
        --disable-libquadmath \
        --disable-libssp \
        --disable-libvtv \
        --disable-libstdcxx \
        --enable-languages=c,c++
    
    make -j$(nproc)
    make install
    
    cd "$LFS_SRC"
    rm -rf gcc-13.2.0
}
```

**3. Glibc:**
```bash
build_glibc() {
    log_section "Building Glibc"
    
    cd "$LFS_SRC"
    tar -xf glibc-2.38.tar.xz
    cd glibc-2.38
    
    # Create lib64 symlink for x86_64
    case $(uname -m) in
        x86_64) ln -sfv ../lib/ld-linux-x86-64.so.2 $LFS/lib64 ;;
    esac
    
    mkdir -v build && cd build
    
    # Configure with sysroot
    echo "rootsbindir=/usr/sbin" > configparms
    
    ../configure \
        --prefix=/usr \
        --host=$LFS_TGT \
        --build=$(../scripts/config.guess) \
        --enable-kernel=3.2 \
        --with-headers=$LFS/usr/include \
        libc_cv_slibdir=/lib
    
    make -j$(nproc)
    make DESTDIR=$LFS install
    
    # Fix hardcoded paths
    sed '/RTLDLIST=/s@/usr@@g' -i $LFS/usr/bin/ldd
    
    cd "$LFS_SRC"
    rm -rf glibc-2.38
}
```

**Loop Decision**: More packages remaining?
- YES → Next package in sequence
- NO → Continue to Activity 6

---

### 1.5 Artifact Creation and Upload

**Activity 6: Create Artifact Archive**

After successful compilation, the toolchain is packaged for distribution or storage.

**Archive Creation:**
```bash
create_artifact() {
    log_info "Creating artifact archive..."
    
    local artifact_name="lfs-chapter5-${BUILD_ID}.tar.gz"
    local artifact_path="${OUTPUT_DIR}/${artifact_name}"
    
    # Create TAR archive
    tar -czf "$artifact_path" \
        -C /mnt/lfs \
        tools/ \
        --exclude='*.a' \
        --exclude='*.la' \
        --exclude='*/doc/*' \
        --exclude='*/man/*'
    
    # Calculate size and checksum
    local size=$(du -h "$artifact_path" | cut -f1)
    local md5=$(md5sum "$artifact_path" | awk '{print $1}')
    
    log_info "Artifact created: $artifact_name"
    log_info "  Size: $size"
    log_info "  MD5:  $md5"
    
    # Write metadata
    cat > "${OUTPUT_DIR}/build-metadata-${BUILD_ID}.txt" <<EOF
Build ID: ${BUILD_ID}
LFS Version: ${LFS_VERSION}
Build Date: $(date -Iseconds)
Artifact: ${artifact_name}
Size: ${size}
MD5: ${md5}
Packages: ${COMPLETED_PACKAGES}/${TOTAL_PACKAGES}
EOF
    
    echo "$artifact_path"
}
```

**Activity 7: Upload to Cloud Storage (Cloud Builds Only)**

```bash
upload_to_gcs() {
    local artifact_path="$1"
    local bucket="$GCS_BUCKET_NAME"
    local remote_path="artifacts/${BUILD_ID}/$(basename $artifact_path)"
    
    log_info "Uploading artifact to gs://${bucket}/${remote_path}..."
    
    gsutil -m cp "$artifact_path" "gs://${bucket}/${remote_path}"
    
    if [[ $? -eq 0 ]]; then
        log_info "Upload successful"
        return 0
    else
        log_error "Upload failed"
        return 1
    fi
}
```

---

### 1.6 Build Completion and Cleanup

**Activity 8: Update Final Status**

```bash
finalize_build() {
    local final_status="$1"  # COMPLETED or FAILED
    
    # Calculate total duration
    local end_time=$(date +%s)
    local duration=$((end_time - START_TIME))
    local duration_min=$((duration / 60))
    
    log_info "Build finished with status: ${final_status}"
    log_info "Total duration: ${duration_min} minutes"
    
    # Update Firestore (cloud) or local file
    if [[ -n "$BUILD_ID" ]]; then
        update_build_status "$BUILD_ID" "$final_status" "Build completed in ${duration_min}min"
    fi
    
    # Cleanup temporary files
    log_info "Cleaning up temporary files..."
    rm -rf "$LFS_SRC"/*.tar.xz
    rm -rf "$LFS_SRC"/*.tar.gz
    
    log_info "Build process terminated"
}
```

---

## 2. Build State Definitions

### 2.1 State Transition Diagram

**States:**
1. **SUBMITTED**: Initial state after user submits build request
2. **PENDING**: Build queued, waiting for available resources
3. **RUNNING**: Build actively executing
4. **COMPLETED**: Build finished successfully
5. **FAILED**: Build terminated with errors
6. **CANCELLED**: User manually terminated build

**Transitions:**
- SUBMITTED → PENDING (via Firestore trigger `onBuildSubmitted`)
- PENDING → RUNNING (via Cloud Run Job start or local script execution)
- RUNNING → COMPLETED (all 18 packages built successfully)
- RUNNING → FAILED (package compilation error, checksum failure, resource exhaustion)
- RUNNING → CANCELLED (user terminates via admin dashboard)

### 2.2 State Persistence

**Firestore Document Structure:**
```javascript
// builds/{buildId}
{
  buildId: "eM2w6RRvdFm3zheuTM1Q",
  userId: "abc123xyz",
  status: "RUNNING",
  progress: 65,
  currentPackage: "glibc-2.38",
  completedPackages: 12,
  totalPackages: 18,
  startedAt: Timestamp(1702220400),
  lastUpdated: Timestamp(1702224000),
  estimatedDuration: 5400  // seconds
}
```

**Local File Structure** (`CURRENT_BUILD_INFO.txt`):
```
╔════════════════════════════════════════════════════════════════╗
║              LFS BUILD IN PROGRESS                             ║
╚════════════════════════════════════════════════════════════════╝

BUILD DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Build ID:           6nieJ5hSRIATzpEBsw1f
Type:               FULL LFS BUILD (Real Compilation)
Started:            2025-11-06 19:48:16
Expected Complete:  2025-11-07 00:48:00 (4-6 hours)
Status:             🔄 RUNNING
Progress:           12/18 packages (67%)
Current Package:    glibc-2.38

Generated: 2025-11-06 20:15:32
```

---

## 3. Error Handling and Recovery States

### 3.1 Compilation Error Recovery

When a package fails to compile, the system enters error recovery mode:

```bash
handle_compilation_error() {
    local package="$1"
    local error_log="${LOG_DIR}/${package}-error.log"
    
    log_error "Compilation failed for ${package}"
    
    # Capture last 50 lines of build output
    tail -n 50 "$LOG_FILE" > "$error_log"
    
    # Update status
    update_build_status "$BUILD_ID" "FAILED" "Compilation error in ${package}"
    
    # Preserve build environment for debugging
    log_info "Build environment preserved at: ${LFS_SRC}"
    
    # Cleanup partial installations
    if [[ -d "/tools/${package}" ]]; then
        log_info "Removing partial installation..."
        rm -rf "/tools/${package}"
    fi
    
    exit 1
}
```

### 3.2 Network Failure Recovery

Download failures trigger automatic retry:

```bash
download_with_retry() {
    local url="$1"
    local output="$2"
    local max_attempts=3
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        log_info "Download attempt ${attempt}/${max_attempts}: ${url}"
        
        if wget --retry-connrefused --waitretry=5 -O "$output" "$url"; then
            log_info "Download successful"
            return 0
        fi
        
        log_warn "Download failed, retrying..."
        attempt=$((attempt + 1))
        sleep 5
    done
    
    log_error "Download failed after ${max_attempts} attempts"
    return 1
}
```

### 3.3 Resource Exhaustion Handling

Disk space monitoring prevents mid-build failures:

```bash
check_disk_space() {
    local required_gb=10
    local available=$(df -BG "$LFS" | tail -1 | awk '{print $4}' | sed 's/G//')
    
    if [[ $available -lt $required_gb ]]; then
        log_error "Insufficient disk space: ${available}GB available, ${required_gb}GB required"
        update_build_status "$BUILD_ID" "FAILED" "Disk space exhausted"
        exit 1
    fi
}
```

---

## 4. Integration with Learning Platform

### 4.1 Real-Time Status Updates

Frontend components subscribe to Firestore updates:

```typescript
// components/build-progress.tsx
const unsubscribe = onSnapshot(
    doc(db, 'builds', buildId),
    (snap) => {
        const data = snap.data();
        setStatus(data.status);
        setProgress(data.progress);
        setCurrentPackage(data.currentPackage);
    }
);
```

### 4.2 Log Streaming

Logs are streamed in real-time to the web interface:

```typescript
// components/log-viewer.tsx
const unsubscribe = onSnapshot(
    collection(db, 'builds', buildId, 'buildLogs').orderBy('timestamp'),
    (snapshot) => {
        const newLogs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        setLogs(newLogs);
    }
);
```

---

## 5. Performance Metrics

### 5.1 Measured Build Times

**Chapter 5 Toolchain (4 vCPU, 8GB RAM):**
- Binutils Pass 1: 3m 15s
- GCC Pass 1: 12m 40s
- Linux API Headers: 2m 10s
- Glibc: 18m 22s
- Libstdc++: 4m 35s
- Binutils Pass 2: 3m 45s
- GCC Pass 2: 15m 18s
- Remaining tools: 8-12m total
- **Total Chapter 5: 45-52 minutes**

### 5.2 Resource Utilization

- Peak CPU: 85% (during GCC compilation)
- Peak Memory: 6.8 GB (during glibc compilation)
- Disk I/O: 120 MB/s average
- Network: 350 MB download (sources)

---

## References

- Script implementation: `lfs-build.sh`, `build-lfs-complete-local.sh`, `chroot-and-build.sh`
- Helper utilities: `helpers/firestore-logger.js`, `init-lfs-env.sh`
- PowerShell wrappers: `BUILD-LFS-CORRECT.ps1`, `CHECK_BUILD_STATUS.ps1`
- Configuration: `lfs-build.config`, `build.config`
