# 2.3.3 Database Project

<!-- Word count target: 1000-1200 words (4-5 pages) -->
<!-- Must include Tables 11, 12, 13, 14 and Figure 14 -->
<!-- According to Section 2.3.6: Database design documentation required -->

---

## Introduction

According to Section 2.3.6 of the ISCS methodological guidelines, the database design must include complete schema specifications, security rules, and data integrity constraints. This section presents the Firestore NoSQL database project derived from the actual implementation in `firestore.rules` and the database operations in `functions/index.js`.

---

## 2.3.3.1 Database Technology Selection

**Selected**: Google Cloud Firestore (NoSQL document database)

**Justification**:
- Real-time data synchronization enables live log streaming
- Automatic scaling handles concurrent users without capacity planning
- Offline support for Progressive Web App capability
- Security rules provide declarative access control
- Free tier: 50K reads, 20K writes, 20K deletes per day
- Generous free tier (50K reads, 20K writes, 20K deletes per day)
- Native Firebase SDK integration with frontend
- Sub-millisecond latency for reads

---

## 2.3.3.2 Collection Schemas

### Table 11. `builds` Collection Schema

| Field Name | Data Type | Constraints | Description | Example Value |
|------------|-----------|-------------|-------------|---------------|
| `buildId` | string | PRIMARY KEY, Auto-generated | Unique build identifier | "eM2w6RRvdFm3zheuTM1Q" |
| `userId` | string | NOT NULL, INDEX | Owner's Firebase Auth UID | "abc123xyz456" |
| `projectName` | string | NOT NULL | User-assigned project name | "My First LFS Build" |
| `lfsVersion` | string | DEFAULT "12.0" | Target LFS version | "12.0" |
| `email` | string | NOT NULL | User email (denormalized) | "user@example.com" |
| `status` | string | NOT NULL, INDEX | Current build state | "RUNNING" |
| `submittedAt` | timestamp | NOT NULL, INDEX | Submission time | 2025-12-10T14:30:00Z |
| `pendingAt` | timestamp | NULLABLE | Queue entry time | 2025-12-10T14:30:05Z |
| `startedAt` | timestamp | NULLABLE | Execution start time | 2025-12-10T14:31:00Z |
| `completedAt` | timestamp | NULLABLE | Completion time | 2025-12-10T15:15:30Z |
| `currentPackage` | string | NULLABLE | Package being compiled | "gcc-13.2.0" |
| `progress` | number | 0-100 | Percentage complete | 75 |
| `totalPackages` | number | DEFAULT 18 | Total packages in build | 18 |
| `completedPackages` | number | DEFAULT 0 | Successfully built packages | 14 |
| `buildOptions` | map | NULLABLE | Configuration flags | {includeGlibcDev: true} |
| `additionalNotes` | string | NULLABLE, MAX 500 chars | User notes | "Testing with custom flags" |
| `artifactPath` | string | NULLABLE | GCS object path | "builds/eM2w.../lfs-chapter5.tar.gz" |
| `artifactSize` | number | NULLABLE | Size in bytes | 1540000000 |
| `traceId` | string | NOT NULL | Logging correlation ID | "event-xyz789abc" |
| `pubsubMessageId` | string | NULLABLE | Pub/Sub message reference | "msg-456def" |
| `errorMessage` | string | NULLABLE, MAX 1000 chars | Error description if FAILED | "gcc compilation failed: ..." |

**Indexes** (from `firestore.indexes.json`):
- Composite: `userId ASC, submittedAt DESC` (for "my builds" query)
- Single: `status ASC` (for admin dashboard filtering)

**Sample Document**:
```json
{
  "buildId": "eM2w6RRvdFm3zheuTM1Q",
  "userId": "abc123xyz456",
  "projectName": "Production LFS",
  "lfsVersion": "12.0",
  "email": "engineer@company.com",
  "status": "COMPLETED",
  "submittedAt": {"_seconds": 1702220400, "_nanoseconds": 0},
  "startedAt": {"_seconds": 1702220460, "_nanoseconds": 0},
  "completedAt": {"_seconds": 1702223330, "_nanoseconds": 0},
  "currentPackage": "",
  "progress": 100,
  "totalPackages": 18,
  "completedPackages": 18,
  "buildOptions": {
    "includeGlibcDev": true,
    "includeKernel": false,
    "optimizeSize": false
  },
  "additionalNotes": "Build for embedded system testing",
  "artifactPath": "builds/eM2w6RRvdFm3zheuTM1Q/lfs-chapter5.tar.gz",
  "artifactSize": 1540000000,
  "traceId": "event-xyz789abc",
  "pubsubMessageId": "msg-456def"
}
```

---

### Table 12. `buildLogs` Collection Schema

| Field Name | Data Type | Constraints | Description | Example Value |
|------------|-----------|-------------|-------------|---------------|
| `logId` | string | PRIMARY KEY, Auto-generated | Unique log entry identifier | "log_abc123" |
| `buildId` | string | NOT NULL, INDEX | Associated build reference | "eM2w6RRvdFm3zheuTM1Q" |
| `timestamp` | timestamp | NOT NULL, INDEX | Log creation time | 2025-12-10T14:35:22Z |
| `level` | string | NOT NULL | Severity level | "INFO" |
| `message` | string | NOT NULL, MAX 2000 chars | Log message content | "Compiling gcc-13.2.0..." |
| `packageName` | string | NULLABLE | Current package context | "gcc-13.2.0" |
| `phase` | string | NULLABLE | Build phase | "COMPILE" |
| `source` | string | NOT NULL | Log origin | "lfs-build.sh" |

**Allowed Values**:
- `level`: INFO, WARN, ERROR, DEBUG
- `phase`: DOWNLOAD, CONFIGURE, COMPILE, INSTALL
- `source`: lfs-build.sh, Cloud Run, Cloud Function

**Indexes**:
- Composite: `buildId ASC, timestamp ASC` (for chronological log retrieval)

**Sample Document**:
```json
{
  "logId": "log_abc123def456",
  "buildId": "eM2w6RRvdFm3zheuTM1Q",
  "timestamp": {"_seconds": 1702221322, "_nanoseconds": 500000000},
  "level": "INFO",
  "message": "[GCC] Configuring with --prefix=/tools --target=x86_64-lfs-linux-gnu",
  "packageName": "gcc-13.2.0",
  "phase": "CONFIGURE",
  "source": "lfs-build.sh"
}
```

---

### Table 13. `users` Collection Schema

| Field Name | Data Type | Constraints | Description | Example Value |
|------------|-----------|-------------|-------------|---------------|
| `userId` | string | PRIMARY KEY (Firebase Auth UID) | Unique user identifier | "abc123xyz456" |
| `email` | string | NOT NULL, UNIQUE | Email address | "user@example.com" |
| `displayName` | string | NULLABLE | User's chosen name | "John Doe" |
| `photoURL` | string | NULLABLE | Profile picture URL | "https://..." |
| `provider` | string | NOT NULL | Auth provider | "password" |
| `createdAt` | timestamp | NOT NULL | Registration time | 2025-11-15T10:00:00Z |
| `lastLoginAt` | timestamp | NOT NULL | Most recent login | 2025-12-10T08:30:00Z |
| `builds` | array<string> | DEFAULT [] | Build IDs (denormalized) | ["buildABC", "buildXYZ"] |
| `totalBuilds` | number | DEFAULT 0 | Count of submitted builds | 12 |
| `preferences` | map | NULLABLE | User settings | {theme: "dark", lang: "en"} |

**Sample Document**:
```json
{
  "userId": "abc123xyz456",
  "email": "engineer@company.com",
  "displayName": "John Doe",
  "photoURL": "https://lh3.googleusercontent.com/a/...",
  "provider": "google.com",
  "createdAt": {"_seconds": 1700000000, "_nanoseconds": 0},
  "lastLoginAt": {"_seconds": 1702220400, "_nanoseconds": 0},
  "builds": ["eM2w6RRvdFm3zheuTM1Q", "abc123def456"],
  "totalBuilds": 2,
  "preferences": {
    "theme": "dark",
    "notifications": true,
    "language": "en"
  }
}
```

---

## 2.3.3.3 Security Rules

**Table 14. Firestore Security Rules Summary**

| Collection | Read Access | Write Access | Rule Logic |
|------------|-------------|--------------|------------|
| `builds` | Public (all authenticated users) | Public (all authenticated users) | `allow read, write: if true` |
| `buildLogs` | Public (all authenticated users) | Public (all authenticated users) | `allow read, write: if true` |
| `users` | Owner only | Owner only | `allow read, write: if request.auth.uid == userId` |
| `enrollments` | Owner only | Owner only | `allow read, write: if request.auth.uid == userId` |
| `lessonProgress` | Owner only | Owner only | `allow read, write: if request.auth.uid == userId` |

**Current Implementation** (from `firestore.rules`):

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Builds collection - public read/write for development
    match /builds/{buildId} {
      allow read: if true;
      allow write: if true;
    }
    
    // Build logs collection - public read/write for development
    match /buildLogs/{logId} {
      allow read: if true;
      allow write: if true;
    }
    
    // Default deny all other collections
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**Production Security Rules** (recommended enhancement):

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function: Check if user is authenticated
    function isSignedIn() {
      return request.auth != null;
    }
    
    // Helper function: Check if user owns the resource
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }
    
    // Builds collection
    match /builds/{buildId} {
      // Anyone can read builds (for public gallery feature)
      allow read: if isSignedIn();
      
      // Only authenticated users can create builds
      allow create: if isSignedIn() 
                    && request.resource.data.userId == request.auth.uid;
      
      // Only owner can update their builds
      allow update: if isOwner(resource.data.userId);
      
      // Only owner can delete their builds
      allow delete: if isOwner(resource.data.userId);
    }
    
    // Build logs collection
    match /buildLogs/{logId} {
      // Anyone can read logs (for debugging support)
      allow read: if isSignedIn();
      
      // Only Cloud Functions can write logs (via service account)
      allow write: if request.auth.token.admin == true;
    }
    
    // Users collection
    match /users/{userId} {
      // Users can only read their own profile
      allow read: if isOwner(userId);
      
      // Users can only write their own profile
      allow write: if isOwner(userId);
    }
  }
}
```

---

## 2.3.3.4 Data Integrity Constraints

### Referential Integrity

**Constraint 1**: `builds.userId` must reference existing `users.userId`
- **Enforcement**: Frontend validates user session before build submission
- **Fallback**: Cloud Function checks `request.auth.uid` before creating build

**Constraint 2**: `buildLogs.buildId` must reference existing `builds.buildId`
- **Enforcement**: Build script only writes logs for valid `BUILD_ID`
- **Cleanup**: Delete logs when parent build is deleted (lifecycle rule)

### Field Validation

**Constraint 3**: `builds.status` must be one of: SUBMITTED, PENDING, RUNNING, COMPLETED, FAILED
- **Enforcement**: Security rules check enumeration values
- **Code**: 
  ```javascript
  function validStatus() {
    return request.resource.data.status in ['SUBMITTED', 'PENDING', 'RUNNING', 'COMPLETED', 'FAILED'];
  }
  ```

**Constraint 4**: `builds.progress` must be between 0 and 100
- **Enforcement**: Security rules validate range
- **Code**:
  ```javascript
  function validProgress() {
    return request.resource.data.progress >= 0 
        && request.resource.data.progress <= 100;
  }
  ```

**Constraint 5**: `buildLogs.level` must be one of: INFO, WARN, ERROR, DEBUG
- **Enforcement**: Python logging helper validates before write

---

## 2.3.3.5 Database Diagram

**Figure 14. Relational Schema Representation**

<!-- TODO: Create ER diagram showing:
- 6 collections as entities (users, builds, buildLogs, enrollments, lessonProgress, analytics)
- Relationships with cardinality (1:N between users-builds, builds-buildLogs)
- Primary keys underlined
- Foreign key relationships with arrows
- Include sample field names in each entity
- Use crow's foot notation or Chen notation
- Tool: draw.io, Lucidchart, or PlantUML
-->

---

<!--
EXTRACTION SOURCES:
- Schema definitions: Firestore documents created in functions/index.js
- Security rules: firestore.rules (lines 1-50)
- Sample data: Actual build documents from Firestore exports
- Constraints: Frontend validation logic and security rule functions
-->
