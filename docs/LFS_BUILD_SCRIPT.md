# LFS Build Script Documentation

## Overview

`lfs-build.sh` is the main orchestration script for the LFS Automated Builder. It runs inside the Docker container and handles:

- Parsing build configuration from JSON
- Validating Firebase and build environment setup
- Executing LFS compilation stages (Chapter 5, 6, 7)
- Logging progress to Firestore
- Creating and uploading build artifacts to Google Cloud Storage

## Configuration

### Environment Variables

The script reads build configuration from the `LFS_CONFIG_JSON` environment variable, which must be a JSON string.

#### Required Variables

- **LFS_CONFIG_JSON** *(string, required)*
  - JSON-encoded build configuration
  - Must include: `buildId`, `projectId`, `gcsBucket`
  - Example:
    ```json
    {
      "buildId": "build-12345",
      "lfsVersion": "12.0",
      "projectId": "my-gcp-project",
      "gcsBucket": "lfs-builds",
      "projectName": "My LFS Build",
      "email": "user@example.com",
      "buildOptions": {
        "includeGlibcDev": true,
        "includeKernel": true,
        "optimizeSize": false
      }
    }
    ```

#### Optional Variables

- **BUILD_ID** *(string)*
  - Extracted from `LFS_CONFIG_JSON`
  - Unique build identifier

- **PROJECT_ID** *(string)*
  - Google Cloud Project ID
  - Extracted from `LFS_CONFIG_JSON` or passed separately
  - Required for Firestore and GCS access

- **GCS_BUCKET_NAME** *(string)*
  - Google Cloud Storage bucket name
  - Extracted from `LFS_CONFIG_JSON` or passed separately
  - Where build artifacts are uploaded

- **GOOGLE_APPLICATION_CREDENTIALS** *(file path)*
  - Path to service account JSON file
  - Default: Uses gcloud application default credentials

- **LFS_VERSION** *(string, default: "12.0")*
  - LFS version to build

- **MAKEFLAGS** *(string, default: "-j4")*
  - Compiler parallelization flags

- **BUILD_TIMEOUT** *(seconds, default: 3600)*
  - Total build timeout

- **CHAPTER5_TIMEOUT** *(seconds, default: 1800)*
  - Chapter 5 (Toolchain) timeout

- **CHAPTER6_TIMEOUT** *(seconds, default: 1800)*
  - Chapter 6 (System Software) timeout

- **LOG_DIR** *(path, default: "./logs")*
  - Directory for build logs

- **OUTPUT_DIR** *(path, default: "./output")*
  - Directory for build artifacts

- **LFS_SRC** *(path, default: "./sources")*
  - LFS source packages directory

- **LFS_MNT** *(path, default: "./lfs")*
  - LFS root filesystem mount point

- **DEBUG** *(0 or 1, default: 0)*
  - Enable debug logging

## Usage

### Basic Usage

```bash
#!/bin/bash

export LFS_CONFIG_JSON='{
  "buildId": "build-001",
  "lfsVersion": "12.0",
  "projectId": "my-gcp-project",
  "gcsBucket": "lfs-builds",
  "projectName": "My LFS Build",
  "email": "user@example.com",
  "buildOptions": {
    "includeGlibcDev": true,
    "includeKernel": true,
    "optimizeSize": false
  }
}'

export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"

/app/lfs-build.sh
```

### Command Line Options

```bash
# Show help
./lfs-build.sh --help

# Enable debug logging
./lfs-build.sh --debug

# Show version
./lfs-build.sh --version
```

### Docker Usage

```bash
# Build Docker image
docker build -t lfs-builder:latest .

# Run with configuration
docker run -it \
  -e LFS_CONFIG_JSON='{"buildId":"build-001","lfsVersion":"12.0",...}' \
  -e GOOGLE_APPLICATION_CREDENTIALS=/secrets/sa.json \
  -v /path/to/sa.json:/secrets/sa.json:ro \
  lfs-builder:latest

# Interactive shell for debugging
docker run -it \
  -e LFS_CONFIG_JSON='{"buildId":"build-001",...}' \
  -e GOOGLE_APPLICATION_CREDENTIALS=/secrets/sa.json \
  -v /path/to/sa.json:/secrets/sa.json:ro \
  --entrypoint /bin/bash \
  lfs-builder:latest
```

### Cloud Run Jobs

```bash
# Create the job
gcloud run jobs create lfs-builder \
  --image gcr.io/my-project/lfs-builder:latest \
  --region us-central1 \
  --tasks 1 \
  --timeout 3600 \
  --memory 8Gi \
  --cpu 4

# Execute job with configuration
gcloud run jobs execute lfs-builder \
  --region us-central1 \
  --set-env-vars LFS_CONFIG_JSON='{"buildId":"build-001",...}' \
  --set-env-vars GCS_BUCKET_NAME=lfs-builds

# Monitor execution
gcloud run jobs logs read lfs-builder \
  --region us-central1 \
  --limit 100
```

## Firestore Integration

### Overview

The script logs build progress to Firestore automatically. Logs are stored in the `builds/{buildId}/logs` subcollection.

### Log Structure

Each log entry in Firestore has the following structure:

```javascript
{
  buildId: string,           // e.g., "build-001"
  timestamp: Timestamp,      // Server-side timestamp
  stage: string,             // e.g., "chapter5", "chapter6", "upload"
  status: string,            // "started", "completed", "error"
  message: string,           // Log message
  createdAt: Timestamp       // When log was created
}
```

### Build Status Updates

The build document in Firestore is updated with:

```javascript
{
  // ... original build fields ...
  status: "building" | "completed" | "error",
  startedAt: Timestamp,
  completedAt: Timestamp,
  lastLog: string,
  lastLogStage: string,
  lastLogStatus: string,
  lastLogTime: Timestamp
}
```

### Firestore Queries

```javascript
// Get all logs for a build
db.collection('builds')
  .doc('build-001')
  .collection('logs')
  .orderBy('timestamp', 'desc')
  .get()

// Get only error logs
db.collection('builds')
  .doc('build-001')
  .collection('logs')
  .where('status', '==', 'error')
  .get()

// Get Chapter 5 logs
db.collection('builds')
  .doc('build-001')
  .collection('logs')
  .where('stage', '==', 'chapter5')
  .get()
```

## GCS Upload

### Overview

The script uploads build artifacts to Google Cloud Storage after successful completion.

### Upload Process

1. Creates output archive: `lfs-build-{buildId}-{version}.tar.gz`
2. Uploads to: `gs://{bucket}/builds/{buildId}/`
3. Logs upload status to Firestore
4. Returns GCS URI

### GCS Path Structure

```
lfs-builds/
├── builds/
│   ├── build-001/
│   │   └── lfs-build-build-001-12.0.tar.gz
│   ├── build-002/
│   │   └── lfs-build-build-002-12.0.tar.gz
│   └── ...
└── logs/
    └── [optional log archives]
```

### Accessing Build Artifacts

```bash
# List all builds
gsutil ls gs://lfs-builds/builds/

# List specific build
gsutil ls gs://lfs-builds/builds/build-001/

# Download artifact
gsutil cp gs://lfs-builds/builds/build-001/lfs-build-build-001-12.0.tar.gz ./

# View file info
gsutil stat gs://lfs-builds/builds/build-001/lfs-build-build-001-12.0.tar.gz
```

## Build Stages

### Chapter 5: Toolchain (Temporary Tools)

**Location in script**: `chapter_5_toolchain()`

Builds temporary tools including:
- Binutils (for the target architecture)
- GCC (bootstrap compiler)
- Linux headers
- Glibc (C standard library)
- GCC (final compiler)

**Status transitions**:
- Start: `write_firestore_log "chapter5" "started"`
- End: `write_firestore_log "chapter5" "completed"`

**Placeholder execution**:
```bash
# Current implementation shows placeholder echo statements
# To implement real build:
# 1. Download source packages from LFS mirrors
# 2. Configure each package
# 3. Compile and install
# 4. Run verification tests
```

### Chapter 6: System Software (Chroot)

**Location in script**: `chapter_6_chroot()`

Installs system packages including:
- Gettext (localization)
- Patch (source patching)
- Final Glibc, GCC, Binutils
- System utilities (man-db, tar, gzip)
- Package management tools (Make)

**Status transitions**:
- Start: `write_firestore_log "chapter6" "started"`
- End: `write_firestore_log "chapter6" "completed"`

### Chapter 7: Bootloader & System Configuration

**Location in script**: `chapter_7_bootloader()`

Configures:
- System hostname
- GRUB bootloader
- Kernel configuration

## Logging

### Log Levels

| Level | Color  | Usage |
|-------|--------|-------|
| INFO  | Green  | Important information |
| WARN  | Yellow | Warnings and recoverable errors |
| ERROR | Red    | Critical errors |
| DEBUG | Cyan   | Detailed debugging info (with DEBUG=1) |

### Log Output

Logs are written to multiple destinations:

1. **Console**: `stdout` and `stderr`
2. **File**: `${LOG_DIR}/build-{buildId}.log`
3. **Firestore**: Via `write_firestore_log()` and helper scripts
4. **Reference**: `${LOG_DIR}/firestore-{buildId}.log` (local copy)

### Enabling Debug Logging

```bash
# Enable via environment variable
export DEBUG=1

# Or via command line
./lfs-build.sh --debug
```

## Error Handling

### Error Trap

The script sets up an error trap that:
1. Logs the error with line number
2. Updates build status to "error"
3. Writes error log to Firestore
4. Prints summary
5. Exits with code 1

```bash
trap 'error_handler ${LINENO}' ERR
```

### Error Recovery

Some operations have fallback mechanisms:

- **Firestore logging**: Falls back to Node.js helper if gcloud fails
- **GCS upload**: Warns but doesn't fail build

## Helper Scripts

### firestore-logger.js

Writes logs to Firestore from Node.js.

**Usage**:
```bash
node helpers/firestore-logger.js \
  "build-001" \
  "chapter5" \
  "completed" \
  "Chapter 5 build successful" \
  "my-gcp-project"
```

**Requirements**:
- `firebase-admin` npm package
- Service account credentials (via `GOOGLE_APPLICATION_CREDENTIALS`)

### gcs-uploader.js

Uploads files to Google Cloud Storage with progress tracking.

**Usage**:
```bash
node helpers/gcs-uploader.js \
  "./output/lfs-build-001.tar.gz" \
  "lfs-builds" \
  "builds/build-001" \
  "my-gcp-project"
```

**Requirements**:
- `@google-cloud/storage` npm package
- Service account credentials

## Security Considerations

1. **Credentials**: Store in secure locations, not in environment
2. **Logs**: May contain sensitive information
3. **GCS Uploads**: Ensure bucket has proper access controls
4. **Service Account**: Use minimal required IAM roles

### Required IAM Roles

For service account:
```
roles/firestore.user
roles/storage.admin
roles/logging.logWriter
```

## Troubleshooting

### Script won't start

```bash
# Check permissions
chmod +x lfs-build.sh

# Check environment variables
echo $LFS_CONFIG_JSON
echo $GOOGLE_APPLICATION_CREDENTIALS
echo $PROJECT_ID
```

### Firestore logging fails

```bash
# Check gcloud access
gcloud firestore databases list --project=my-project

# Try Node.js helper directly
node helpers/firestore-logger.js build-001 chapter5 completed "Test" my-project
```

### GCS upload fails

```bash
# Check bucket exists and is accessible
gsutil ls gs://lfs-builds/

# Check gsutil is configured
gsutil config list

# Test upload directly
gsutil cp test.tar.gz gs://lfs-builds/test/
```

### Debug build script

```bash
# Run with debug output
DEBUG=1 ./lfs-build.sh

# Run specific function
source lfs-build.sh
init_directories
parse_config
verify_firebase
```

## Extending the Build

### Adding Custom Stages

```bash
custom_chapter() {
    log_section "Custom Stage"
    
    write_firestore_log "custom" "started" "Starting custom stage"
    
    # Your build commands here
    log_info "Doing something custom..."
    
    write_firestore_log "custom" "completed" "Custom stage completed"
    
    return 0
}

# In main(), add:
# if ! custom_chapter; then
#     log_error "Custom stage failed"
#     exit 1
# fi
```

### Modifying Timeouts

```bash
export CHAPTER5_TIMEOUT=2400  # 40 minutes
export CHAPTER6_TIMEOUT=2400  # 40 minutes
```

### Custom Output Processing

```bash
# Before create_output_archive():
custom_archive() {
    log_info "Creating custom archive..."
    
    # Your custom archiving logic
    tar czf "$OUTPUT_DIR/custom-output.tar.gz" ...
}
```

## Performance Optimization

### Parallel Compilation

```bash
# Use more cores
export MAKEFLAGS="-j8"

# Or auto-detect
export MAKEFLAGS="-j$(nproc)"
```

### Memory Usage

```bash
# Limit memory usage if needed
export CFLAGS="-O2"
export CXXFLAGS="-O2"

# Or use -O1 for slower but less memory usage
export CFLAGS="-O1"
```

## Monitoring

### Real-time Log Monitoring

```bash
# Watch logs in real-time
tail -f logs/build-build-001.log

# Monitor Firestore updates
gcloud firestore documents list builds/build-001/logs \
  --project=my-project --watch
```

### Check Build Status

```bash
# Via Firestore
gcloud firestore documents get builds/build-001 --project=my-project

# Via GCS
gsutil ls -L gs://lfs-builds/builds/build-001/
```

## Example Complete Workflow

```bash
#!/bin/bash

# Set configuration
export LFS_CONFIG_JSON='{
  "buildId": "prod-build-20231105",
  "lfsVersion": "12.0",
  "projectId": "my-gcp-project",
  "gcsBucket": "lfs-builds",
  "projectName": "Production LFS",
  "email": "admin@example.com",
  "buildOptions": {
    "includeGlibcDev": true,
    "includeKernel": true,
    "optimizeSize": true
  }
}'

# Set credentials
export GOOGLE_APPLICATION_CREDENTIALS="/secure/sa-key.json"

# Enable debug for first build
export DEBUG=1

# Run build with timeout
timeout 7200 /app/lfs-build.sh

# Check result
if [ $? -eq 0 ]; then
    echo "Build successful!"
    gsutil ls gs://lfs-builds/builds/prod-build-20231105/
else
    echo "Build failed!"
    exit 1
fi
```

## References

- [LFS Official Guide](https://www.linuxfromscratch.org/)
- [Bash Script Best Practices](https://mywiki.wooledge.org/BashGuide)
- [Google Cloud Run Jobs](https://cloud.google.com/run/docs/quickstarts/jobs/create-execute)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Google Cloud Storage](https://cloud.google.com/storage/docs)
