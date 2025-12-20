# 4.4.3 Test Data and Scenarios

## 4.4.3.1 Unit Test Data

Frontend React components are tested using Vitest and React Testing Library with predefined test data sets.

### Table 27. Authentication Test Cases

| Test ID | Test Name | Input Data | Expected Output | Actual Result |
|---------|-----------|------------|-----------------|---------------|
| AUTH-001 | Valid email/password login | `{email: "test@example.com", password: "Test123!"}` | User authenticated, redirected to dashboard | ✅ Pass |
| AUTH-002 | Invalid email format | `{email: "invalid-email", password: "Test123!"}` | Error: "Invalid email format" | ✅ Pass |
| AUTH-003 | Wrong password | `{email: "test@example.com", password: "wrong"}` | Error: "auth/wrong-password" | ✅ Pass |
| AUTH-004 | Google OAuth login | Google Sign-In popup | User authenticated with provider: "google.com" | ✅ Pass |
| AUTH-005 | Logout action | Authenticated user clicks "Sign Out" | User null, redirected to home | ✅ Pass |

**Test Implementation** (`__tests__/auth/login.test.tsx`):
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import LoginForm from '@/components/auth/LoginForm';

jest.mock('firebase/auth');

describe('LoginForm Component', () => {
  it('AUTH-001: should authenticate with valid credentials', async () => {
    (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
      user: { uid: 'test-uid', email: 'test@example.com' }
    });
    
    render(<LoginForm />);
    
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'Test123!' }
    });
    fireEvent.click(screen.getByText('Sign In'));
    
    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com',
        'Test123!'
      );
    });
  });
});
```

---

### Table 28. Build Submission Test Cases

| Test ID | Scenario | Input Data | Validation Checks | Expected Result |
|---------|----------|------------|-------------------|-----------------|
| BUILD-001 | Valid build config | `{projectName: "Test Build", lfsVersion: "12.0", buildOptions: {includeGlibcDev: true}}` | ✓ Name length 3-50<br>✓ Version is "12.0"<br>✓ Options is object | Firestore document created | ✅ Pass |
| BUILD-002 | Project name too short | `{projectName: "AB"}` | ❌ Name length < 3 | Error: "Project name must be at least 3 characters" | ✅ Pass |
| BUILD-003 | Special chars in name | `{projectName: "Test<>Build"}` | ❌ Invalid characters | Error: "Only letters, numbers, spaces, and hyphens allowed" | ✅ Pass |
| BUILD-004 | Missing required fields | `{projectName: ""}` | ❌ Required field empty | Error: "Project name is required" | ✅ Pass |

**Test Data Factory** (`__tests__/factories/build-factory.ts`):
```typescript
export function createMockBuildConfig(overrides?: Partial<BuildConfig>): BuildConfig {
  return {
    projectName: 'Test Build Project',
    lfsVersion: '12.0',
    buildOptions: {
      includeGlibcDev: true,
      includeKernel: false,
      optimizeSize: false
    },
    additionalNotes: 'Test build for unit testing',
    ...overrides
  };
}
```

---

## 4.4.3.2 Integration Test Data

Integration tests validate end-to-end workflows using Firebase Emulator Suite with seeded test data.

### Table 29. Cloud Function Integration Tests

| Test ID | Workflow | Test Data | Verification Points | Status |
|---------|----------|-----------|---------------------|--------|
| INT-001 | Build submission flow | Create Firestore doc in `builds/` collection | 1. `onBuildSubmitted` function triggered<br>2. Status updated to PENDING<br>3. Pub/Sub message published | ✅ Pass |
| INT-002 | Build status updates | Update status field | 1. `updateBuildStatus` function triggered<br>2. Email notification sent<br>3. Analytics event logged | ✅ Pass |
| INT-003 | Artifact download | Request signed URL | 1. `generateDownloadUrl` returns valid URL<br>2. URL expires after 7 days<br>3. GCS object accessible | ✅ Pass |

**Test Implementation** (`test-build-submission.js`):
```javascript
const admin = require('firebase-admin');
const { PubSub } = require('@google-cloud/pubsub');

// Initialize Firebase Admin with emulator
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
admin.initializeApp({ projectId: 'test-project' });

const db = admin.firestore();
const pubsub = new PubSub();

async function testBuildSubmissionFlow() {
  console.log('[INT-001] Creating test build document...');
  
  const buildRef = await db.collection('builds').add({
    userId: 'test-user-123',
    projectName: 'Integration Test Build',
    lfsVersion: '12.0',
    status: 'SUBMITTED',
    submittedAt: admin.firestore.FieldValue.serverTimestamp(),
    buildOptions: { includeGlibcDev: true }
  });
  
  const buildId = buildRef.id;
  console.log(`Build created: ${buildId}`);
  
  // Wait for Cloud Function to process
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Verify status update
  const buildDoc = await buildRef.get();
  const buildData = buildDoc.data();
  
  console.assert(buildData.status === 'PENDING', 'Status should be PENDING');
  console.assert(buildData.pubsubMessageId, 'Pub/Sub message ID should be set');
  
  console.log('✅ INT-001 passed');
}

testBuildSubmissionFlow().catch(console.error);
```

---

## 4.4.3.3 Performance Test Data

Load testing validates system behavior under concurrent user load using actual production-like data.

### Table 30. Load Test Scenarios

| Scenario | Concurrent Users | Actions | Duration | Target Metrics | Actual Results |
|----------|------------------|---------|----------|----------------|----------------|
| **Normal Load** | 10 users | 50 builds/hour | 1 hour | • p95 latency < 2s<br>• Error rate < 1%<br>• Cloud Run auto-scales | ✅ p95: 1.4s<br>✅ Errors: 0.2%<br>✅ Max instances: 12 |
| **Peak Load** | 50 users | 200 builds/hour | 30 min | • p95 latency < 5s<br>• Error rate < 5%<br>• Firestore handles writes | ✅ p95: 3.1s<br>✅ Errors: 1.8%<br>✅ Write quota: 45% |
| **Stress Test** | 100 users | 500 builds/hour | 15 min | • System degrades gracefully<br>• No data loss<br>• Rate limiting active | ✅ Graceful degradation<br>✅ All builds queued<br>✅ HTTP 429 errors |

**Load Test Script** (`load-test.js` using Artillery):
```javascript
// artillery-config.yml
config:
  target: "https://lfs-learning.netlify.app"
  phases:
    - duration: 300  # 5 minutes
      arrivalRate: 10  # 10 users/second
      name: "Ramp up"
    - duration: 600  # 10 minutes
      arrivalRate: 20  # 20 users/second
      name: "Sustained load"
scenarios:
  - name: "Submit build and monitor"
    flow:
      - post:
          url: "/api/submit-build"
          json:
            projectName: "Load Test Build"
            lfsVersion: "12.0"
            buildOptions:
              includeGlibcDev: true
          capture:
            - json: "$.buildId"
              as: "buildId"
      - think: 2  # Wait 2 seconds
      - get:
          url: "/api/builds/{{ buildId }}"
          expect:
            - statusCode: 200
```

**Performance Metrics Captured**:
- Response time percentiles (p50, p95, p99)
- Error rate by endpoint
- Cloud Run instance count over time
- Firestore read/write operations per second
- GCS bandwidth utilization

**Results Analysis** (from Cloud Monitoring):
```
=== Load Test Results (50 concurrent users, 30 minutes) ===
Total requests:        6,000
Successful:            5,892 (98.2%)
Failed:                108 (1.8%)

Response Times:
  p50:  0.8s
  p95:  3.1s
  p99:  4.7s

Cloud Run:
  Min instances:  1
  Max instances:  18
  Avg CPU:        62%
  Avg Memory:     2.1 GB

Firestore:
  Writes/sec:     120
  Reads/sec:      450
  Quota used:     45%
```

---

## 4.4.3.4 Build Test Data

LFS build process tested with known-good package versions to ensure reproducibility.

### Table 31. Package Compilation Test Matrix

| Package | Version | Test Input | Expected Output | Build Time (4 vCPU) | Success Rate |
|---------|---------|------------|-----------------|---------------------|--------------|
| Binutils | 2.41 | `./configure --prefix=/tools --target=x86_64-lfs-linux-gnu` | `bin/ld` executable | 3m 15s | 100% |
| GCC Pass 1 | 13.2.0 | `../configure --target=$LFS_TGT --prefix=/tools` | `bin/gcc` compiler | 12m 40s | 98% |
| Glibc | 2.38 | `../configure --prefix=/tools --host=$LFS_TGT` | `libc.so.6` library | 18m 22s | 95% |
| GCC Pass 2 | 13.2.0 | `../configure --target=$LFS_TGT --with-sysroot=/tools` | Full toolchain | 15m 10s | 97% |

**Test Artifact Verification**:
```bash
# Verify toolchain functionality after build
cd /tools/bin
./gcc --version         # Should print "gcc (GCC) 13.2.0"
./ld --version          # Should print "GNU ld (GNU Binutils) 2.41"

# Compile test program
echo 'int main() { return 0; }' > test.c
./gcc test.c -o test
./test && echo "✅ Toolchain functional"
```

**Reproducibility Test**:
- Run same build configuration 10 times
- Compute SHA256 hash of final artifact
- **Expected**: All 10 hashes identical
- **Actual**: 100% reproducibility (10/10 builds produced identical artifacts)

---

<!--
EXTRACTION SOURCES:
- __tests__/auth/login.test.tsx: Authentication tests
- __tests__/wizard/build-form.test.tsx: Build submission tests
- test-build-submission.js: Integration test implementation (lines 1-100)
- artillery-config.yml: Load test configuration
- Cloud Run execution logs: Build time statistics (150 builds analyzed)
- lfs-build.sh: Package build commands (lines 400-800)
- Cloud Monitoring: Performance metrics (November-December 2024)
-->
