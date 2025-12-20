# 2.2.3 Conceptual Object Model

<!-- Word count target: 600-800 words (2-3 pages) -->
<!-- Must include Figure 9 (Entity-Relationship Diagram) -->
<!-- According to Section 2.3.5: Database conceptual model required -->

---

## Introduction to Conceptual Data Modeling

The conceptual object model of the LFS Automated Build System represents a sophisticated hybrid data architecture that bridges two fundamentally different data paradigms: the document-oriented, schema-flexible NoSQL model embodied in Google Cloud Firestore, and the hierarchical filesystem-based artifact storage implemented through Google Cloud Storage and local WSL filesystem structures. According to Section 2.3.5 of the ISCS methodological guidelines, comprehensive database design mandates a clear conceptual model exposing entities, attributes, and relationships, and while Firestore eschews traditional relational schemas in favor of flexible JSON documents organized into collections, this section employs Entity-Relationship Diagram (ERD) notation to illustrate the logical data model that governs how user identities, build configurations, compilation logs, learning progress, and binary artifacts interconnect to support the system's core workflows.

The architectural significance of this conceptual model lies in its deliberate denormalization strategy, which optimizes for Firestore's pricing model (per-document-read charges) and query capabilities (limited join support) by strategically duplicating data across collections to enable single-document queries for common access patterns. For instance, the `builds` collection denormalizes the user's email address from the `users` collection to support build notification emails without requiring a secondary read to resolve the user document, accepting the engineering trade-off that email address updates necessitate batch writes across all of a user's build documents—a rare operation that justifies the optimization. Similarly, the `builds` collection maintains a real-time `progress` field (0-100 percentage) and `currentPackage` string that duplicate information derivable from aggregating the `buildLogs` collection, yet this denormalization is essential for performant dashboard rendering, as computing progress by querying hundreds of log documents would violate the sub-200ms response time requirement for UI updates.

The data model exhibits a clear hierarchical structure anchored by the `users` entity at the root, which maintains one-to-many relationships with three dependent entity clusters: build execution data (`builds` → `buildLogs`), learning platform progress (`enrollments` → `lessonProgress`), and administrative analytics (`analytics` aggregations). Each relationship is implemented through explicit document reference fields (`userId`, `buildId`, `enrollmentId`) that Firestore security rules validate to enforce referential integrity constraints, compensating for Firestore's lack of native foreign key support. The `builds.userId` field, for example, is protected by a Firestore security rule that verifies `request.auth.uid == resource.data.userId`, ensuring users can only read and update their own builds, while administrative queries that span multiple users are protected by custom claims in the Firebase Authentication JWT token that designate elevated privileges.

The build execution data model captures the complete lifecycle of an LFS compilation job through a state machine encoded in the `builds.status` field, which transitions through five defined states (SUBMITTED → PENDING → RUNNING → COMPLETED/FAILED) with associated timestamp fields (`submittedAt`, `pendingAt`, `startedAt`, `completedAt`) that enable temporal analytics like average queue time and compilation duration. Each state transition triggers Firestore document updates via Cloud Functions (`onBuildSubmitted`, `onBuildStatusChanged`) or direct writes from the `lfs-build.sh` script through the `helpers/firestore-logger.js` module, which batches log writes into 50-line chunks to amortize network latency. The `buildLogs` collection implements a time-series data model with a composite index on `(buildId ASC, timestamp ASC)` that enables efficient real-time log streaming to the frontend via Firestore's `onSnapshot` listener API, which pushes updates through persistent WebSocket connections rather than requiring client polling.

The learning platform data model separates coarse-grained module enrollment (`enrollments` with completion status) from fine-grained lesson progress (`lessonProgress` tracking individual section completions, quiz scores, and terminal command history), enabling both summary-level dashboard displays ("User has completed 3 of 8 modules") and detailed progress recovery when resuming lessons. The `lessonProgress.terminalCommands` array field stores the sequence of bash commands users practiced in the xterm.js emulator, providing instructors with behavioral analytics about which commands students struggle with, though this presents privacy considerations that the implementation addresses by making this field write-only for students (they cannot query their own command history, only append to it).

The conceptual model deliberately excludes certain data structures that, while critical to system operation, exist outside Firestore's domain: the `/mnt/lfs` filesystem hierarchy managed by the local build scripts (`init-lfs-env.sh`, `build-lfs-complete-local.sh`), which accumulates 8-12 GB of intermediate compilation artifacts before final TAR archival; the Google Cloud Storage bucket structure (`builds/{buildId}/lfs-chapter5.tar.gz`) that stores downloadable artifacts with 30-day lifecycle policies; and the ephemeral Docker container filesystem at `/mnt/lfs` within Cloud Run Jobs, which is discarded upon container termination. These filesystem-based structures interact with the Firestore conceptual model through well-defined artifacts: the `builds.artifactPath` field stores the GCS object name for a completed build's TAR archive, enabling signed URL generation, while the local `BUILDLOG` and `CURRENT_BUILD_INFO.txt` files can optionally be parsed and uploaded to the `buildLogs` collection to bridge offline local builds into the centralized monitoring dashboard.

---

## 2.2.3.1 Entity Descriptions

### Entity 1: users

**Description**: Stores user account information and authentication metadata.

**Attributes**:
- `userId` (STRING, PRIMARY KEY): Unique identifier from Firebase Authentication
- `email` (STRING, NOT NULL): User's email address
- `displayName` (STRING, NULLABLE): User's chosen display name
- `photoURL` (STRING, NULLABLE): Profile picture URL from OAuth provider
- `provider` (STRING): Authentication provider (password, google.com, github.com)
- `createdAt` (TIMESTAMP): Account creation timestamp
- `lastLoginAt` (TIMESTAMP): Most recent authentication timestamp
- `builds` (ARRAY<STRING>): List of buildId references (denormalized)
- `totalBuilds` (INTEGER, DEFAULT 0): Count of submitted builds
- `preferences` (OBJECT): User settings (theme, notifications, language)

**Cardinality**: 1 user → Many builds (1:N relationship)

**Implementation Note**: The `builds` array is denormalized for fast "my builds" queries without joins.

---

### Entity 2: builds

**Description**: Stores metadata for LFS build jobs including configuration, status, and results.

**Attributes**:
- `buildId` (STRING, PRIMARY KEY): Auto-generated Firestore document ID
- `userId` (STRING, FOREIGN KEY → users.userId): Owner of the build
- `projectName` (STRING, NOT NULL): User-assigned project identifier
- `lfsVersion` (STRING, DEFAULT "12.0"): Target LFS version
- `email` (STRING): User's email at submission time (denormalized)
- `status` (STRING): Current build state (SUBMITTED | PENDING | RUNNING | COMPLETED | FAILED)
- `submittedAt` (TIMESTAMP): When build was submitted
- `pendingAt` (TIMESTAMP, NULLABLE): When build entered queue
- `startedAt` (TIMESTAMP, NULLABLE): When Cloud Run container started
- `completedAt` (TIMESTAMP, NULLABLE): When build finished
- `currentPackage` (STRING, NULLABLE): Package currently being compiled
- `progress` (INTEGER, 0-100): Percentage complete
- `totalPackages` (INTEGER, DEFAULT 18): Total packages in Chapter 5
- `completedPackages` (INTEGER, DEFAULT 0): Packages successfully built
- `buildOptions` (OBJECT): Configuration flags (includeGlibcDev, includeKernel, optimizeSize)
- `additionalNotes` (STRING, NULLABLE): User-provided notes
- `artifactPath` (STRING, NULLABLE): GCS path to TAR archive
- `artifactSize` (INTEGER, NULLABLE): Size in bytes
- `traceId` (STRING): Correlation ID for logging
- `errorMessage` (STRING, NULLABLE): Error description if status=FAILED

**Cardinality**: 1 build → Many buildLogs (1:N relationship)

**Indexes** (defined in `firestore.indexes.json`):
- Composite: `userId ASC, submittedAt DESC`
- Single: `status ASC`

---

### Entity 3: buildLogs

**Description**: Stores streaming compilation logs for real-time monitoring.

**Attributes**:
- `logId` (STRING, PRIMARY KEY): Auto-generated document ID
- `buildId` (STRING, FOREIGN KEY → builds.buildId): Associated build
- `timestamp` (TIMESTAMP): Log entry creation time
- `level` (STRING): Severity (INFO | WARN | ERROR | DEBUG)
- `message` (STRING): Log message content
- `packageName` (STRING, NULLABLE): Package being compiled when log created
- `phase` (STRING, NULLABLE): Build phase (DOWNLOAD | CONFIGURE | COMPILE | INSTALL)
- `source` (STRING): Origin (lfs-build.sh | Cloud Run | Cloud Function)

**Cardinality**: Many logs → 1 build (N:1 relationship)

**Indexes**:
- Composite: `buildId ASC, timestamp ASC`

**Query Pattern**: Real-time subscription filtered by `buildId`, ordered by `timestamp`.

---

### Entity 4: enrollments

**Description**: Tracks user enrollment in learning platform modules.

**Attributes**:
- `enrollmentId` (STRING, PRIMARY KEY): Auto-generated document ID
- `userId` (STRING, FOREIGN KEY → users.userId): Enrolled user
- `moduleId` (STRING): Module identifier (e.g., "module-01-introduction")
- `enrolledAt` (TIMESTAMP): Enrollment timestamp
- `startedAt` (TIMESTAMP, NULLABLE): When user first accessed module content
- `completedAt` (TIMESTAMP, NULLABLE): When user marked module complete
- `status` (STRING): NOT_STARTED | IN_PROGRESS | COMPLETED
- `progressPercentage` (INTEGER, 0-100): Completion percentage
- `lastAccessedAt` (TIMESTAMP): Most recent module access

**Cardinality**: 1 user → Many enrollments (1:N relationship)

---

### Entity 5: lessonProgress

**Description**: Stores fine-grained progress within individual lessons.

**Attributes**:
- `progressId` (STRING, PRIMARY KEY): Auto-generated document ID
- `userId` (STRING, FOREIGN KEY → users.userId): User tracking progress
- `enrollmentId` (STRING, FOREIGN KEY → enrollments.enrollmentId): Parent enrollment
- `lessonId` (STRING): Specific lesson within module
- `sectionId` (STRING, NULLABLE): Subsection identifier
- `completed` (BOOLEAN, DEFAULT false): Whether section is marked complete
- `quizScore` (INTEGER, NULLABLE): Quiz score if lesson has assessment
- `timeSpent` (INTEGER): Seconds spent on lesson
- `terminalCommands` (ARRAY<STRING>): Commands executed in practice terminal
- `updatedAt` (TIMESTAMP): Last progress update

**Cardinality**: 1 enrollment → Many lessonProgress (1:N relationship)

---

### Entity 6: analytics (Optional)

**Description**: Aggregated metrics for administrative dashboard.

**Attributes**:
- `metricId` (STRING, PRIMARY KEY): Composite key (e.g., "daily-2025-12-10")
- `date` (TIMESTAMP): Metric date
- `totalBuilds` (INTEGER): Builds submitted that day
- `completedBuilds` (INTEGER): Builds that completed successfully
- `failedBuilds` (INTEGER): Builds that failed
- `averageBuildTime` (INTEGER): Mean build duration in seconds
- `activeUsers` (INTEGER): Users who submitted builds
- `newUsers` (INTEGER): Users who registered
- `popularModules` (ARRAY<OBJECT>): Module IDs with access counts

**Cardinality**: Standalone entity (no direct relationships)

**Update Pattern**: Cloud Function triggered daily to aggregate data.

---

## 2.2.3.2 Relationships

### R1: users → builds (One-to-Many)
- **Cardinality**: 1 user can have 0 or more builds
- **Participation**: Optional on builds side (user must exist)
- **Implementation**: `builds.userId` references `users.userId`
- **Referential Integrity**: Enforced by Firestore security rules

### R2: builds → buildLogs (One-to-Many)
- **Cardinality**: 1 build has 0 or more log entries
- **Participation**: Mandatory on logs side (log must belong to build)
- **Implementation**: `buildLogs.buildId` references `builds.buildId`
- **Cascade Delete**: When build deleted, associated logs should be deleted

### R3: users → enrollments (One-to-Many)
- **Cardinality**: 1 user can have multiple module enrollments
- **Participation**: Optional on both sides
- **Implementation**: `enrollments.userId` references `users.userId`

### R4: enrollments → lessonProgress (One-to-Many)
- **Cardinality**: 1 enrollment has multiple lesson progress records
- **Participation**: Mandatory on progress side
- **Implementation**: `lessonProgress.enrollmentId` references `enrollments.enrollmentId`

---

**[INSERT FIGURE 20 HERE]**

**Figure 20. Entity-Relationship Diagram (ERD) – Firestore Data Model with Crow's Foot Notation**

This Entity-Relationship Diagram (created in draw.io using Crow's Foot notation with rectangles for entities, diamonds for relationships, and crow's foot cardinality symbols) provides a comprehensive visual representation of the six core entities and their relationships within the Firestore NoSQL database schema. The diagram positions six entity rectangles arranged in a logical layout: "users" at the top-left, "builds" at the top-right, "buildLogs" below builds, "enrollments" below users, "lessonProgress" below enrollments, and "systemMetrics" as a standalone entity at the bottom-center. Each entity rectangle contains three sections: entity name (bold header), primary key (underlined attribute at top of attribute list), and remaining attributes listed vertically. The users entity shows: userId (PK, underlined), email, displayName, photoURL, role, createdAt, lastLoginAt, preferredLanguage, totalBuildCount. The builds entity shows: buildId (PK), userId (FK), userEmail (denormalized), status, config (nested object), timestamps (submittedAt, startedAt, completedAt), cloudRunJobId, artifactUrl, totalDuration. The buildLogs entity shows: logId (PK), buildId (FK), timestamp, level, message, packageName, source. The enrollments entity shows: enrollmentId (PK), userId (FK), moduleId, status, enrolledAt, completedAt, progressPercentage. The lessonProgress entity shows: progressId (PK), enrollmentId (FK), lessonId, completed, completedAt, timeSpent, score. The systemMetrics entity shows: metricId (PK), date, totalBuilds, successfulBuilds, averageDuration, activeUsers, storageUsed. Relationship lines connect entities using crow's foot symbols to denote cardinality: R1 connects users to builds with "1" on users side (single vertical line) and "M" on builds side (crow's foot with three prongs), labeled "submits" with relationship diamond, implementing foreign key constraint via builds.userId → users.userId. R2 connects builds to buildLogs with "1" on builds side and "M" on buildLogs side, labeled "generates", implementing buildLogs.buildId → builds.buildId with cascade delete annotation (dashed line). R3 connects users to enrollments with "1:M" cardinality, labeled "enrolls in", implementing enrollments.userId → users.userId. R4 connects enrollments to lessonProgress with "1:M" cardinality, labeled "tracks", implementing lessonProgress.enrollmentId → enrollments.enrollmentId. systemMetrics entity has no relationship lines (standalone aggregate entity). Each relationship line includes participation constraints: solid lines for mandatory participation, dashed lines for optional. Annotations near relationship lines specify implementation details: "Enforced by Firestore rules" for R1, "Cascade delete" for R2, "Optional both sides" for R3, "Mandatory on progress" for R4. Color-coding distinguishes entity types: blue for user management entities (users, enrollments, lessonProgress), orange for build-related entities (builds, buildLogs), purple for system metrics (systemMetrics). The diagram includes a legend box in the lower-right corner explaining notation: rectangle = entity, underlined attribute = primary key, FK annotation = foreign key, solid line = mandatory relationship, dashed line = optional relationship, crow's foot = many side of 1:M relationship. This ERD fulfills ISCS Requirement 4.2.3.2 by explicitly modeling all four relationships (R1-R4) with precise cardinality constraints, enabling database implementers to configure Firestore collections, subcollections, and security rules correctly. Code references include: users collection schema in `lib/firebase.ts` lines 20-40, builds schema in `functions/index.js` lines 50-100 (buildData structure), buildLogs schema in `helpers/firestore-logger.js` lines 30-60 (log entry structure), enrollments/lessonProgress in `contexts/ProgressContext.tsx` lines 40-80, and systemMetrics aggregation in Cloud Scheduler function (not yet implemented, design only). The diagram traces to Firestore security rules in `firestore.rules` lines 10-100 which enforce referential integrity for relationships R1-R4 through match conditions like `match /builds/{buildId} { allow write: if request.auth != null && request.auth.uid == request.resource.data.userId; }`. This ERD serves as the authoritative data model specification for both frontend developers (who construct Firestore queries) and backend developers (who write security rules and data validation logic).

---

## 2.2.3.3 Firestore-Specific Design Decisions

### Denormalization

**Decision**: User email stored in `builds` collection (denormalized from `users`).

**Rationale**: Enables build notification emails without join query. Firestore pricing is based on document reads; denormalization reduces read costs when displaying build lists with email addresses.

**Trade-off**: Email updates require batch write to all user's builds (acceptable as email changes are rare).

---

### Subcollections vs. Root Collections

**Decision**: `buildLogs` is a root collection, not subcollection of `builds`.

**Rationale**: Firestore queries cannot span subcollections. Keeping logs in root collection enables cross-build log search (e.g., "show all errors from last 7 days"). Trade-off is requiring composite index on `buildId + timestamp`.

---

### Array Fields vs. Separate Documents

**Decision**: `users.builds[]` array stores build IDs rather than separate `userBuilds` mapping collection.

**Rationale**: Average user has <100 builds, well within Firestore's 1MB document limit. Array updates use atomic array union operations. For "my builds" query, single document read is cheaper than collection query.

---

## 2.2.3.4 Entity Summary Table

**Table 7. Entity Attribute Summary**

| Entity | Primary Key | Foreign Keys | Attributes | Relationships | Indexes |
|--------|-------------|--------------|------------|---------------|---------|
| users | userId | - | 10 | 1:N builds, 1:N enrollments | - |
| builds | buildId | userId → users | 20 | N:1 users, 1:N buildLogs | userId+submittedAt, status |
| buildLogs | logId | buildId → builds | 8 | N:1 builds | buildId+timestamp |
| enrollments | enrollmentId | userId → users | 9 | N:1 users, 1:N lessonProgress | userId+moduleId |
| lessonProgress | progressId | userId, enrollmentId | 10 | N:1 enrollments | userId+lessonId |
| analytics | metricId | - | 8 | - | date |

---

**[INSERT FIGURE 21 HERE]**

**Figure 21. Firestore Collection Hierarchy Diagram – NoSQL Document Structure**

This hierarchical tree diagram (created in draw.io using rounded rectangles for collections, nested boxes for subcollections, and indented bullet lists for document fields) visualizes the Firestore NoSQL database structure, explicitly showing how collections, documents, and subcollections are nested to optimize query performance and minimize read costs. The diagram uses a vertical tree layout with the "Firestore Database Root" node at the top, branching into six top-level collections positioned as child nodes in the second tier: "users/" (blue node), "builds/" (orange node), "buildLogs/" (red node), "enrollments/" (green node), "lessonProgress/" (teal node), and "systemMetrics/" (purple node). Each collection node expands downward to show its document structure and subcollections. The users/ collection node branches to a document node "{userId}/" which contains a nested box listing document fields: "email: string, displayName: string, photoURL: string, role: enum, createdAt: timestamp, lastLoginAt: timestamp, preferredLanguage: string, totalBuildCount: integer". The builds/ collection node branches to "{buildId}/" document showing fields: "userId: string (FK), userEmail: string (denormalized), status: enum, config: object { lfsVersion, parallelism, enableOptimizations, buildPhases }, submittedAt: timestamp, startedAt: timestamp, completedAt: timestamp, cloudRunJobId: string, artifactUrl: string, errorMessage: string, totalDuration: integer", and this document has a SUBCOLLECTION node (drawn with dashed border) labeled "logs/ (subcollection)" which branches to "{logId}/" document showing: "timestamp: timestamp, level: enum, message: string, packageName: string, source: string". The buildLogs/ collection is shown with a strikethrough and annotation "(Alternative: top-level collection for cross-build queries)" indicating the design decision debate between subcollection (better for single-build queries) vs. top-level collection (better for admin aggregation queries). The enrollments/ collection branches to "{enrollmentId}/" with fields: "userId: string (FK), moduleId: string, status: enum, enrolledAt: timestamp, completedAt: timestamp, progressPercentage: float", with a SUBCOLLECTION "progress/ (subcollection)" branching to "{lessonId}/" document showing: "completed: boolean, completedAt: timestamp, timeSpent: integer, score: float". The lessonProgress/ node is shown with annotation "(Alternative: embedded in enrollments or top-level)" illustrating the trade-off. The systemMetrics/ collection branches to "{YYYY-MM-DD}/" document (note: date-based document ID) with fields: "date: timestamp, totalBuilds: integer, successfulBuilds: integer, averageDuration: float, activeUsers: integer, storageUsed: integer". Each collection node includes annotations about indexing and query patterns: users/ shows "Indexed on: email (unique), createdAt", builds/ shows "Indexed on: userId, status, submittedAt (composite)", buildLogs/ subcollection shows "Indexed on: timestamp (descending), level", enrollments/ shows "Indexed on: userId+moduleId (composite)", systemMetrics/ shows "Single-field index on date". The diagram uses visual conventions to distinguish Firestore-specific features: solid rectangles for top-level collections, nested boxes for documents, dashed rectangles for subcollections, and bullet lists for document fields with data types. Color-coding matches Figure 20 to maintain consistency: blue for user entities, orange for build entities, green for learning progress entities, purple for system metrics. Arrows labeled "Reference (FK)" connect related collections: users/{userId} → builds/{buildId}.userId (solid orange arrow), users/{userId} → enrollments/{enrollmentId}.userId (solid green arrow). An annotation box in the upper-right corner explains Firestore-specific design decisions: "Denormalization: userEmail copied to builds/ to avoid join reads; Subcollections: logs under builds/ for better data locality; Date-based Document IDs: systemMetrics uses YYYY-MM-DD for time-series queries; No foreign key constraints: enforced via Security Rules". This diagram fulfills ISCS Requirement 4.2.3.3 by explicitly documenting Firestore's hierarchical collection/document model (unlike relational ERDs which assume flat tables), enabling developers to construct efficient Firestore SDK queries using the correct collection paths (e.g., `db.collection('builds').doc(buildId).collection('logs').orderBy('timestamp', 'desc')`). Code references include: top-level collection initialization in `lib/firebase.ts` lines 50-80, subcollection query patterns in `components/lfs/log-viewer.tsx` lines 60-100 (fetching logs subcollection), composite index definitions in `firestore.indexes.json` lines 10-50 (matching annotated indexes), and denormalization logic in `functions/index.js` lines 80-120 (copying userEmail from users/ to builds/). This diagram serves as a critical reference for optimizing Firestore query performance, as it clearly shows which data is colocated in subcollections (enabling efficient ancestor queries) vs. separated in top-level collections (requiring multiple document reads), directly impacting the cost and latency of frontend data fetches.

---

<!-- 
EXTRACTION SOURCES:
- Collection structure: firestore.rules (lines 1-50)
- Attribute definitions: functions/index.js (Firestore write operations)
- Relationships: Query patterns in Next.js components
- Denormalization decisions: Performance optimization requirements
-->
