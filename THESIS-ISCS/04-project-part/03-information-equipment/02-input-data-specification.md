# 4.3.2 Input Data Specifications

## 4.3.2.1 Build Submission Input

The primary user input is the build configuration submitted via the Install Wizard interface.

### Table 16. Build Submission Data Structure

| Field Name | Data Type | Constraints | Default Value | Required | Source UI Element |
|------------|-----------|-------------|---------------|----------|-------------------|
| `projectName` | string | 3-50 chars, no special chars | "" | Yes | Text input field |
| `lfsVersion` | string | Enum: "12.0" | "12.0" | Yes | Dropdown (single option) |
| `buildOptions` | object | See Table 17 | {} | Yes | Checkbox group |
| `additionalNotes` | string | Max 500 chars, optional | "" | No | Textarea |

**Validation Logic** (`lfs-learning-platform/app/install/page.tsx`):
```typescript
const validateBuildConfig = (config: BuildConfig): ValidationResult => {
  if (!config.projectName || config.projectName.trim().length < 3) {
    return { valid: false, error: 'Project name must be at least 3 characters' };
  }
  
  if (config.projectName.length > 50) {
    return { valid: false, error: 'Project name cannot exceed 50 characters' };
  }
  
  if (!/^[a-zA-Z0-9\s-]+$/.test(config.projectName)) {
    return { valid: false, error: 'Project name can only contain letters, numbers, spaces, and hyphens' };
  }
  
  return { valid: true };
};
```

---

### Table 17. Build Options Detailed Specification

| Option Key | Type | Description | Impact on Build | Default |
|------------|------|-------------|-----------------|---------|
| `includeGlibcDev` | boolean | Include glibc development headers | +120MB to artifact, enables debugging | `true` |
| `includeKernel` | boolean | Build Linux kernel 6.4.12 | +45 minutes, +200MB | `false` |
| `optimizeSize` | boolean | Use -Os compiler flag instead of -O2 | -15% artifact size, +20% slower binaries | `false` |

**Configuration Propagation**:
1. Frontend validates inputs
2. Firestore document created with `buildOptions` object
3. Cloud Function reads options, adds to Pub/Sub message
4. `lfs-build.sh` parses JSON, sets environment variables:
   ```bash
   export INCLUDE_GLIBC_DEV=$(echo "${LFS_CONFIG_JSON}" | jq -r '.buildOptions.includeGlibcDev')
   ```

---

## 4.3.2.2 User Registration Input

Authentication inputs captured during account creation via Firebase Authentication.

### Table 18. User Registration Data Specification

| Field | Type | Format | Validation | Example |
|-------|------|--------|------------|---------|
| `email` | string | RFC 5322 email | Firebase Auth validates format, checks uniqueness | "user@example.com" |
| `password` | string | UTF-8, min 6 chars | Firebase Auth enforces complexity | "Secure123!" |
| `displayName` | string (optional) | UTF-8, max 100 chars | Frontend validates length | "John Doe" |
| `provider` | string (auto) | Enum: "password", "google.com" | Set by Firebase Auth | "google.com" |

**Firebase Auth Configuration** (`firebase.json`):
```json
{
  "auth": {
    "users": {
      "requireEmailVerification": false,
      "enablePasswordPolicy": {
        "enforcementState": "ENFORCE",
        "constraints": {
          "requireUppercase": false,
          "requireLowercase": false,
          "requireNumeric": false,
          "requireNonAlphanumeric": false,
          "minLength": 6,
          "maxLength": 4096
        }
      }
    }
  }
}
```

**Data Flow**:
1. User submits email/password → Firebase Auth
2. Firebase creates UID (e.g., "abc123xyz456")
3. Frontend creates Firestore `users/{uid}` document:
   ```typescript
   await setDoc(doc(db, 'users', user.uid), {
     email: user.email,
     displayName: user.displayName || '',
     photoURL: user.photoURL || '',
     provider: user.providerData[0]?.providerId || 'password',
     createdAt: serverTimestamp(),
     lastLoginAt: serverTimestamp(),
     builds: [],
     totalBuilds: 0
   });
   ```

---

## 4.3.2.3 Lesson Progress Input

Learning platform tracks lesson completion via structured progress documents.

### Table 19. Lesson Progress Input Specification

| Field | Type | Constraints | Description | Example |
|-------|------|-------------|-------------|---------|
| `lessonId` | string | Format: "module-X-lesson-Y" | Unique lesson identifier | "module-1-lesson-3" |
| `completed` | boolean | true/false | Completion status | true |
| `completedAt` | timestamp | Firestore Timestamp | Completion time | 2024-12-10T14:30:00Z |
| `timeSpent` | number | Seconds, 0-7200 | Time on lesson page | 420 (7 minutes) |
| `quizScore` | number (optional) | 0-100 | Quiz percentage if applicable | 85 |

**Client-Side Tracking** (`lfs-learning-platform/lib/services/progress-service.ts`):
```typescript
export async function markLessonComplete(
  userId: string,
  lessonId: string,
  timeSpent: number,
  quizScore?: number
) {
  const progressRef = doc(
    db,
    'users',
    userId,
    'lessonProgress',
    lessonId
  );
  
  await setDoc(progressRef, {
    lessonId,
    completed: true,
    completedAt: serverTimestamp(),
    timeSpent,
    quizScore: quizScore || null,
    lastUpdated: serverTimestamp()
  }, { merge: true });
}
```

**Usage**: Called when user clicks "Mark as Complete" button or completes quiz with passing score (≥70%).

---

## 4.3.2.4 Build Log Input (Internal)

Build logs are generated internally by `lfs-build.sh` and written via `helpers/firestore-logger.js`.

### Table 20. Build Log Entry Specification

| Field | Type | Constraints | Source | Example |
|-------|------|-------------|--------|---------|
| `buildId` | string | 20-char alphanumeric | Firestore-generated ID | "eM2w6RRvdFm3zheuTM1Q" |
| `timestamp` | timestamp | Firestore Timestamp | System time in container | 2024-12-10T15:22:18Z |
| `level` | string | Enum: INFO, WARN, ERROR, DEBUG | `lfs-build.sh` log functions | "INFO" |
| `message` | string | Max 2000 chars | Build script output | "[GCC] Compiling pass 1" |
| `packageName` | string (optional) | Max 50 chars | Package being built | "gcc-13.2.0" |
| `phase` | string (optional) | Enum: DOWNLOAD, CONFIGURE, COMPILE, INSTALL | Current build stage | "COMPILE" |
| `source` | string | Fixed: "lfs-build.sh" | Script name | "lfs-build.sh" |

**Write Implementation** (`helpers/firestore-logger.js` lines 60-90):
```javascript
const logEntry = {
  buildId: BUILD_ID,
  timestamp: admin.firestore.FieldValue.serverTimestamp(),
  level: LEVEL,
  message: MESSAGE,
  packageName: PACKAGE_NAME || null,
  phase: PHASE || null,
  source: 'lfs-build.sh'
};

await db.collection('buildLogs').add(logEntry);
console.log(`[Firestore Logger] Log written for build ${BUILD_ID}`);
```

**Write Frequency**: 50-100 writes per minute during active compilation phases.

---

<!--
EXTRACTION SOURCES:
- lfs-learning-platform/app/install/page.tsx: Build form validation (lines 65-120)
- firebase.json: Auth configuration
- lfs-learning-platform/lib/services/progress-service.ts: Lesson tracking logic
- helpers/firestore-logger.js: Log entry structure (lines 50-120)
- Firestore schema: Document structure from collections
-->
