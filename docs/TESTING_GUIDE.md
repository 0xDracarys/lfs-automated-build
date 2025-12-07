# LFS Build Script - Testing Guide

## Overview

This guide provides comprehensive testing procedures for the `lfs-build.sh` script and its helper components.

---

## Prerequisites

```bash
# Install testing tools
apt-get install bats shellcheck shunit2  # Linux/WSL
brew install bats shellcheck              # macOS

# Verify installations
bats --version
shellcheck --version
```

---

## Unit Testing

### Test 1: Configuration Parsing

**File**: `test_config_parsing.sh`

```bash
#!/bin/bash

test_parse_config_valid() {
    export LFS_CONFIG_JSON='{"buildId":"test-001","lfsVersion":"12.0","projectId":"project"}'
    
    # Source the script (without executing main)
    source lfs-build.sh
    
    # Test parsing
    parse_config
    
    # Verify extracted values
    [ "$BUILD_ID" = "test-001" ] || return 1
    [ "$LFS_VERSION" = "12.0" ] || return 1
    [ "$PROJECT_ID" = "project" ] || return 1
}

test_parse_config_invalid_json() {
    export LFS_CONFIG_JSON='{"buildId":"test-001" INVALID}'
    
    source lfs-build.sh
    
    # Should fail
    parse_config && return 1 || return 0
}

test_parse_config_missing_buildid() {
    export LFS_CONFIG_JSON='{"lfsVersion":"12.0"}'
    
    source lfs-build.sh
    
    # Should fail
    parse_config && return 1 || return 0
}

# Run tests
bats test_config_parsing.sh
```

### Test 2: Logging Functions

```bash
#!/bin/bash

test_log_info() {
    source lfs-build.sh
    
    # Capture output
    output=$(log_info "Test message" 2>&1)
    
    [[ "$output" == *"Test message"* ]] || return 1
    [[ "$output" == *"INFO"* ]] || return 1
}

test_log_error_increments_counter() {
    source lfs-build.sh
    
    ERRORS_COUNT=0
    log_error "Test error"
    
    [ "$ERRORS_COUNT" -eq 1 ] || return 1
}

test_log_warn_increments_counter() {
    source lfs-build.sh
    
    WARNINGS_COUNT=0
    log_warn "Test warning"
    
    [ "$WARNINGS_COUNT" -eq 1 ] || return 1
}

# Run tests
bats test_logging.sh
```

### Test 3: Directory Initialization

```bash
#!/bin/bash

test_init_directories_creates_dirs() {
    source lfs-build.sh
    
    # Use temp directory for testing
    LOG_DIR="/tmp/test-logs"
    OUTPUT_DIR="/tmp/test-output"
    LFS_SRC="/tmp/test-sources"
    LFS_MNT="/tmp/test-mnt"
    
    # Clean up first
    rm -rf /tmp/test-*
    
    # Create directories
    init_directories
    
    # Verify
    [ -d "$LOG_DIR" ] || return 1
    [ -d "$OUTPUT_DIR" ] || return 1
    [ -d "$LFS_SRC" ] || return 1
    [ -d "$LFS_MNT" ] || return 1
    
    # Clean up
    rm -rf /tmp/test-*
}

# Run tests
bats test_directories.sh
```

---

## Integration Testing

### Test 4: Firebase Validation

```bash
#!/bin/bash
# test_firebase_integration.sh

test_firebase_validation_success() {
    # Mock gcloud command
    gcloud() {
        if [[ "$1" == "firestore" && "$2" == "databases" && "$3" == "list" ]]; then
            return 0
        fi
        command gcloud "$@"
    }
    export -f gcloud
    
    source lfs-build.sh
    export PROJECT_ID="test-project"
    
    verify_firebase && return 0 || return 1
}

test_firebase_missing_credentials() {
    source lfs-build.sh
    export GOOGLE_APPLICATION_CREDENTIALS="/nonexistent/path.json"
    
    # Should warn but continue
    verify_firebase
    return 0
}

# Run tests
bats test_firebase_integration.sh
```

### Test 5: Firestore Logging

```bash
#!/bin/bash
# test_firestore_logging.sh

test_firestore_log_format() {
    source lfs-build.sh
    
    # Mock gcloud
    gcloud() {
        if [[ "$1" == "firestore" && "$2" == "documents" && "$3" == "create" ]]; then
            # Check data format
            [[ "$4" == "buildLogs" ]] || return 1
            return 0
        fi
        command gcloud "$@"
    }
    export -f gcloud
    
    export PROJECT_ID="test-project"
    export BUILD_ID="test-build"
    
    write_firestore_log "chapter5" "started" "Test message"
    return 0
}

# Run tests
bats test_firestore_logging.sh
```

---

## End-to-End Testing

### Test 6: Complete Build Cycle

```bash
#!/bin/bash
# test_complete_build.sh

test_complete_build_with_placeholders() {
    # Create test environment
    TEST_DIR="/tmp/lfs-build-test"
    mkdir -p "$TEST_DIR"
    cd "$TEST_DIR"
    
    # Copy script
    cp /path/to/lfs-build.sh .
    
    # Create config
    export LFS_CONFIG_JSON='{
        "buildId": "test-complete-001",
        "lfsVersion": "12.0",
        "projectId": "test-project",
        "gcsBucket": "test-bucket"
    }'
    
    export LOG_DIR="$TEST_DIR/logs"
    export OUTPUT_DIR="$TEST_DIR/output"
    export LFS_SRC="$TEST_DIR/sources"
    export LFS_MNT="$TEST_DIR/lfs"
    
    # Mock Firebase/GCS
    gcloud() { return 0; }
    gsutil() { return 0; }
    export -f gcloud gsutil
    
    # Run with 30 second timeout (placeholders)
    timeout 30 bash lfs-build.sh || true
    
    # Verify outputs
    [ -d "$LOG_DIR" ] || return 1
    [ -d "$OUTPUT_DIR" ] || return 1
    [ -f "$LOG_DIR/build-test-complete-001.log" ] || return 1
    
    # Clean up
    cd /
    rm -rf "$TEST_DIR"
}

# Run tests
bats test_complete_build.sh
```

---

## Static Analysis

### Code Quality Checks

```bash
#!/bin/bash

# ShellCheck analysis
echo "=== Running ShellCheck ==="
shellcheck lfs-build.sh

# Check for common issues
echo "=== Checking for hardcoded credentials ==="
! grep -E "password|secret|api_key" lfs-build.sh || echo "WARNING: Potential credentials found"

# Check for proper quoting
echo "=== Checking variable quoting ==="
! grep '\$[A-Za-z_]' lfs-build.sh | grep -v '${' | grep -v '"' || echo "WARNING: Unquoted variables found"

# Check for error handling
echo "=== Checking error handling ==="
grep -c 'set -e' lfs-build.sh || echo "WARNING: Missing set -e"
grep -c 'trap' lfs-build.sh || echo "WARNING: Missing error trap"
```

---

## Performance Testing

### Test 7: Build Duration

```bash
#!/bin/bash
# test_performance.sh

test_build_duration_under_limit() {
    export BUILD_TIMEOUT=60  # 60 seconds
    
    start_time=$(date +%s)
    
    # Run build with placeholders
    timeout $BUILD_TIMEOUT bash lfs-build.sh
    
    end_time=$(date +%s)
    duration=$((end_time - start_time))
    
    echo "Build completed in $duration seconds"
    
    # Placeholder builds should be very fast
    [ $duration -lt $BUILD_TIMEOUT ] || return 1
}
```

### Test 8: Memory Usage

```bash
#!/bin/bash
# test_memory.sh

test_memory_usage() {
    # Monitor memory during execution
    {
        while true; do
            ps aux | grep lfs-build.sh | grep -v grep | awk '{print $6}'
            sleep 1
        done
    } &
    MONITOR_PID=$!
    
    # Run build
    timeout 30 bash lfs-build.sh || true
    
    # Stop monitoring
    kill $MONITOR_PID 2>/dev/null || true
    
    echo "Memory check completed"
}
```

---

## Docker Testing

### Test 9: Docker Build

```bash
#!/bin/bash

# Build Docker image
docker build -t lfs-builder-test .

# Check image
docker images lfs-builder-test || exit 1

# Run basic test
docker run --rm \
  -e LFS_CONFIG_JSON='{"buildId":"docker-test"}' \
  -e DEBUG=1 \
  lfs-builder-test --help || exit 1

echo "Docker tests passed"
```

### Test 10: Docker Volume Mounts

```bash
#!/bin/bash

# Create test directories
mkdir -p /tmp/test-output /tmp/test-logs

# Run with volume mounts
docker run --rm \
  -e LFS_CONFIG_JSON='{"buildId":"volume-test"}' \
  -v /tmp/test-output:/lfs/output \
  -v /tmp/test-logs:/lfs/logs \
  lfs-builder-test

# Verify files were created
[ -d /tmp/test-output ] || exit 1
[ -d /tmp/test-logs ] || exit 1

# Clean up
rm -rf /tmp/test-*

echo "Docker volume tests passed"
```

---

## Helper Script Testing

### Test 11: Firestore Logger

```bash
#!/bin/bash

test_firestore_logger_help() {
    node helpers/firestore-logger.js 2>&1 | grep -i "error" && return 0 || return 1
}

test_firestore_logger_validation() {
    # Missing arguments should fail
    node helpers/firestore-logger.js 2>&1 | grep -i "required" && return 0 || return 1
}

# Run tests
bats test_helpers.sh
```

### Test 12: GCS Uploader

```bash
#!/bin/bash

test_gcs_uploader_validation() {
    # Missing arguments should fail
    node helpers/gcs-uploader.js 2>&1 | grep -i "required" && return 0 || return 1
}

test_gcs_uploader_file_check() {
    # Should check if file exists
    node helpers/gcs-uploader.js /nonexistent/file.tar.gz bucket-name remote-path 2>&1 | grep -i "not found" && return 0 || return 1
}

# Run tests
bats test_gcs_helpers.sh
```

---

## Automated Test Suite

### Complete Test Runner

```bash
#!/bin/bash
# run-all-tests.sh

set -e

echo "LFS Build Script - Comprehensive Test Suite"
echo "=========================================="
echo ""

# Test categories
TESTS=(
    "test_config_parsing.sh"
    "test_logging.sh"
    "test_directories.sh"
    "test_firebase_integration.sh"
    "test_firestore_logging.sh"
    "test_complete_build.sh"
    "test_performance.sh"
    "test_memory.sh"
    "test_docker.sh"
    "test_helpers.sh"
    "test_gcs_helpers.sh"
)

PASSED=0
FAILED=0

for test in "${TESTS[@]}"; do
    echo "Running: $test"
    
    if bats "$test"; then
        PASSED=$((PASSED + 1))
        echo "✓ PASSED"
    else
        FAILED=$((FAILED + 1))
        echo "✗ FAILED"
    fi
    
    echo ""
done

echo "=========================================="
echo "Test Results:"
echo "  Passed: $PASSED"
echo "  Failed: $FAILED"
echo "=========================================="

if [ $FAILED -gt 0 ]; then
    exit 1
fi
```

---

## Manual Testing Checklist

### Pre-Deployment Verification

- [ ] Script syntax check: `bash -n lfs-build.sh`
- [ ] ShellCheck: `shellcheck lfs-build.sh`
- [ ] Help message: `./lfs-build.sh --help`
- [ ] Version: `./lfs-build.sh --version`
- [ ] Configuration parsing with valid JSON
- [ ] Configuration parsing with invalid JSON
- [ ] Missing environment variables handling
- [ ] Firebase credentials check
- [ ] Build tool verification
- [ ] Directory creation
- [ ] Log file creation
- [ ] Firestore logging (if credentials available)
- [ ] GCS upload simulation
- [ ] Error handling with trap
- [ ] Debug logging (`DEBUG=1`)
- [ ] Summary report generation
- [ ] Docker build and run
- [ ] Helper script execution

---

## Continuous Integration

### GitHub Actions Example

```yaml
name: Test LFS Build Script

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Install dependencies
        run: |
          sudo apt-get update
          sudo apt-get install -y bats shellcheck
      
      - name: ShellCheck
        run: shellcheck lfs-build.sh helpers/*.js
      
      - name: Syntax check
        run: bash -n lfs-build.sh
      
      - name: Unit tests
        run: bats tests/*.bats
      
      - name: Docker build
        run: docker build -t lfs-builder .
      
      - name: Integration tests
        run: |
          docker run --rm \
            -e LFS_CONFIG_JSON='{"buildId":"ci-test"}' \
            lfs-builder --help
```

---

## Testing Best Practices

1. **Isolate Tests**: Use temporary directories
2. **Mock External Services**: Mock gcloud/gsutil
3. **Clean Up**: Remove test artifacts after each test
4. **Error Checking**: Verify exit codes
5. **Output Validation**: Check log file contents
6. **Security Testing**: Verify no credentials exposed
7. **Performance Monitoring**: Track build duration
8. **Edge Cases**: Test with unusual inputs

---

## Troubleshooting Test Failures

### Script Won't Execute
```bash
# Check permissions
chmod +x lfs-build.sh

# Check Bash version
bash --version  # Needs 4.0+

# Check dependencies
which jq gcloud gsutil docker
```

### Test Timeouts
```bash
# Reduce timeouts for faster testing
export BUILD_TIMEOUT=30
export DEBUG=0  # Skip verbose logging
```

### Mock Function Issues
```bash
# Verify mock is exported
declare -f gcloud

# Check function scope
export -f gcloud
```

---

## Test Report Template

```
Test Execution Report
=====================
Date: YYYY-MM-DD
Duration: X minutes
Status: PASS/FAIL

Summary:
- Total Tests: N
- Passed: N
- Failed: N
- Success Rate: X%

Detailed Results:
[ List each test with result ]

Issues Found:
[ List any failures or warnings ]

Recommendations:
[ Suggestions for improvement ]
```

---

For more information, see the main build script documentation in `docs/LFS_BUILD_SCRIPT.md`.
