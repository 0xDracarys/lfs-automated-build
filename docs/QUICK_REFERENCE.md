# LFS Build Script - Quick Reference

## Installation & Setup

### 1. Prerequisites

```bash
# Ensure script is executable
chmod +x lfs-build.sh

# Install Node.js helpers
cd helpers && npm install && cd ..

# Set up Google Cloud authentication
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
```

### 2. Basic Configuration

```bash
# Minimal required config
export LFS_CONFIG_JSON='{
  "buildId": "build-001",
  "lfsVersion": "12.0",
  "projectId": "my-gcp-project",
  "gcsBucket": "lfs-builds"
}'

# Run the script
./lfs-build.sh
```

## Common Commands

### Local Testing

```bash
# Run with debug logging
DEBUG=1 ./lfs-build.sh

# Run specific chapter
# (Modify lfs-build.sh to export functions, then:)
source lfs-build.sh
chapter_5_toolchain

# Show help
./lfs-build.sh --help

# Show version
./lfs-build.sh --version
```

### Docker

```bash
# Build image
docker build -t lfs-builder .

# Run container
docker run -it \
  -e LFS_CONFIG_JSON='{"buildId":"build-001",...}' \
  lfs-builder

# Debug container
docker run -it --entrypoint /bin/bash lfs-builder
```

### Cloud Run

```bash
# Create job
gcloud run jobs create lfs-builder \
  --image gcr.io/PROJECT_ID/lfs-builder

# Execute job
gcloud run jobs execute lfs-builder \
  --set-env-vars 'LFS_CONFIG_JSON={"buildId":"build-001",...}'

# View logs
gcloud run jobs logs read lfs-builder

# Delete job
gcloud run jobs delete lfs-builder
```

## Configuration Examples

### Minimal Config

```json
{
  "buildId": "b1",
  "lfsVersion": "12.0",
  "projectId": "project",
  "gcsBucket": "bucket"
}
```

### Full Config

```json
{
  "buildId": "b1",
  "lfsVersion": "12.0",
  "projectId": "project",
  "gcsBucket": "bucket",
  "projectName": "My Build",
  "email": "user@example.com",
  "buildOptions": {
    "includeGlibcDev": true,
    "includeKernel": true,
    "optimizeSize": false
  }
}
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `LFS_CONFIG_JSON` | - | **Required** Build configuration |
| `GOOGLE_APPLICATION_CREDENTIALS` | - | Path to service account JSON |
| `PROJECT_ID` | from config | Google Cloud Project |
| `GCS_BUCKET_NAME` | from config | GCS bucket for uploads |
| `LFS_VERSION` | 12.0 | LFS version |
| `MAKEFLAGS` | -j4 | Compiler parallelization |
| `LOG_DIR` | ./logs | Log directory |
| `OUTPUT_DIR` | ./output | Output directory |
| `DEBUG` | 0 | Enable debug (1/0) |

## Monitoring

### View Build Logs

```bash
# Real-time
tail -f logs/build-build-001.log

# Last 50 lines
tail -50 logs/build-build-001.log

# Search for errors
grep ERROR logs/build-build-001.log
```

### Check Firestore Status

```bash
# Get build document
gcloud firestore documents get builds/build-001 \
  --project=my-project

# List logs
gcloud firestore documents list builds/build-001/logs \
  --project=my-project

# Watch logs
gcloud firestore documents list builds/build-001/logs \
  --project=my-project --watch
```

### Check GCS Upload

```bash
# List build artifacts
gsutil ls gs://lfs-builds/builds/build-001/

# Download artifact
gsutil cp gs://lfs-builds/builds/build-001/*.tar.gz ./
```

## Troubleshooting

### Script won't run

```bash
# Check if executable
ls -la lfs-build.sh

# Make executable
chmod +x lfs-build.sh

# Check bash version (needs bash 4.0+)
bash --version
```

### Firebase connection fails

```bash
# Check credentials
cat $GOOGLE_APPLICATION_CREDENTIALS

# Test gcloud access
gcloud firestore databases list --project=PROJECT_ID

# Check permissions
gcloud projects get-iam-policy PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:SERVICE_ACCOUNT_EMAIL"
```

### GCS upload fails

```bash
# Check bucket exists
gsutil ls gs://BUCKET_NAME

# Test permissions
gsutil -D cp test.txt gs://BUCKET_NAME/test/

# Check bucket policies
gsutil bucketpolicyonly get gs://BUCKET_NAME
```

### Node.js helpers fail

```bash
# Check npm modules installed
ls helpers/node_modules/

# Install if missing
cd helpers && npm install && cd ..

# Test helper directly
node helpers/firestore-logger.js \
  build-001 chapter5 completed "Test" project-id
```

## Performance Tuning

### Fast Build

```bash
export MAKEFLAGS="-j8"           # More cores
export CFLAGS="-O2"              # Optimization
```

### Conservative Build

```bash
export MAKEFLAGS="-j2"           # Fewer cores
export CFLAGS="-O1"              # Lower optimization
```

### Extend Timeouts

```bash
export CHAPTER5_TIMEOUT=2400     # 40 min
export CHAPTER6_TIMEOUT=2400     # 40 min
export BUILD_TIMEOUT=7200        # 2 hours
```

## Common Workflows

### Local Test Build

```bash
#!/bin/bash
export LFS_CONFIG_JSON='{"buildId":"test-001","lfsVersion":"12.0","projectId":"my-project","gcsBucket":"lfs-builds"}'
export DEBUG=1
./lfs-build.sh
```

### Cloud Run Job Execution

```bash
#!/bin/bash
BUILD_ID="prod-$(date +%s)"
CONFIG="{\"buildId\":\"$BUILD_ID\",\"lfsVersion\":\"12.0\",\"projectId\":\"my-project\",\"gcsBucket\":\"lfs-builds\"}"

gcloud run jobs execute lfs-builder \
  --project my-project \
  --region us-central1 \
  --set-env-vars "LFS_CONFIG_JSON=$CONFIG"
```

### Monitor Multiple Builds

```bash
#!/bin/bash
# Watch all build IDs
for build in build-001 build-002 build-003; do
    echo "=== $build ==="
    gcloud firestore documents get builds/$build \
      --project=my-project \
      --format=json | jq '.fields.status.stringValue'
done
```

## Log File Locations

```
logs/
├── build-build-001.log           # Main build log
├── build-build-002.log
├── firestore-build-001.log       # Firestore writes (local copy)
├── firestore-build-002.log
└── archive-path.txt              # Archive path reference
```

## Output Directory Structure

```
output/
├── lfs-build-build-001-12.0.tar.gz      # Build artifact
├── build-metadata-build-001.txt         # Metadata
└── archive-path.txt                      # Path reference
```

## Command Cheat Sheet

```bash
# Execute full build
./lfs-build.sh

# Run with debug
DEBUG=1 ./lfs-build.sh

# Show help
./lfs-build.sh -h

# Test in Docker
docker run -e LFS_CONFIG_JSON='...' lfs-builder

# Check Firestore logs
gcloud firestore documents list builds/BUILD_ID/logs --project=PROJECT

# Download build
gsutil cp gs://BUCKET/builds/BUILD_ID/*.tar.gz ./

# Tail logs
tail -f logs/build-BUILD_ID.log
```

## Exit Codes

| Code | Meaning |
|------|---------|
| 0    | Success |
| 1    | Build failed |
| 127  | Command not found |

## Notes

- All timestamps are UTC
- Logs are appended (not overwritten)
- Firestore logs are asynchronous
- GCS uploads may take time for large files
- Keep service account credentials secure
- Monitor Cloud Run costs

---
For detailed documentation, see `docs/LFS_BUILD_SCRIPT.md`
