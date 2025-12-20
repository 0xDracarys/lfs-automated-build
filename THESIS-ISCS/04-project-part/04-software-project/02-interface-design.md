# 4.4.2 Interface Design

## Introduction

The interface design layer defines the contracts and communication protocols between system components, ensuring loose coupling, modularity, and maintainability of the LFS Automated Build System. This subsection specifies the programmatic interfaces, API endpoints, data exchange formats, and inter-component dependencies that enable the distributed architecture to function as a cohesive whole.

Following the ISCS methodological requirements, the interface specifications detail both the **conceptual interfaces** (e.g., IAuthService, IBuildService) that abstract component responsibilities and the **concrete implementations** (e.g., Firebase REST APIs, Firestore gRPC endpoints) that realize these contracts in the deployed system. The design adheres to industry-standard interface definition languages (IDL) and follows RESTful principles for HTTP-based communication, WebSocket protocols for real-time data streaming, and gRPC for efficient inter-service communication within Google Cloud Platform infrastructure.

The interface architecture employs several key design patterns:

1. **Interface Segregation Principle (ISP):** Components depend only on the specific interfaces they require, avoiding monolithic interface bloat. For example, the Build Executor component requires only IDatabase (for log writes) and IStorage (for artifact uploads), not the full suite of Firebase services.

2. **Dependency Inversion Principle (DIP):** High-level modules (e.g., Firebase Functions orchestration logic) depend on abstractions (interface contracts) rather than concrete implementations, enabling testability through mock implementations and facilitating future technology substitutions.

3. **API Versioning Strategy:** All external-facing APIs implement versioning (`/api/v1/submitBuild`) to maintain backward compatibility during system evolution, preventing breaking changes for client applications.

The interface specifications documented herein cover four primary categories: (1) **Frontend-Middleware Interfaces** governing Next.js ↔ Firebase Functions communication via RESTful HTTP endpoints, (2) **Middleware-Infrastructure Interfaces** defining Firebase Functions ↔ Firestore/GCS/Pub/Sub interactions using Google Cloud SDK, (3) **Execution Layer Interfaces** specifying the local PowerShell ↔ WSL2 ↔ Chroot communication protocols, and (4) **Real-time Subscription Interfaces** enabling WebSocket-based Firestore listeners for live progress updates.

Each interface definition includes method signatures (function name, parameters, return types), data contracts (request/response schemas with JSON examples), error handling specifications (HTTP status codes, error message formats), and performance requirements (timeout values, rate limits). This comprehensive documentation ensures that both human developers and automated testing frameworks can validate interface compliance throughout the system lifecycle.

---

## 4.4.2.1 Component Interface Contracts

### IAuthService Interface

**Responsibility:** User authentication, JWT token validation, session management

**Provided By:** Firebase Authentication service

**Consumed By:** Next.js Frontend, Firebase Functions

**Methods:**

```typescript
interface IAuthService {
  /**
   * Verify ID token from Firebase Auth
   * @param token - JWT token from client
   * @returns Decoded token with user claims
   * @throws AuthError if token invalid/expired
   */
  verifyIdToken(token: string): Promise<DecodedIdToken>;
  
  /**
   * Get user profile from Firebase Auth
   * @param uid - User unique identifier
   * @returns User profile data
   * @throws UserNotFoundError if uid invalid
   */
  getUserProfile(uid: string): Promise<UserProfile>;
  
  /**
   * Create new user account
   * @param email - User email address
   * @param password - User password (min 6 chars)
   * @returns Created user UID
   * @throws EmailExistsError if duplicate
   */
  createUser(email: string, password: string): Promise<string>;
}
```

**Data Contracts:**

```json
// DecodedIdToken
{
  "uid": "abc123xyz...",
  "email": "user@example.com",
  "email_verified": true,
  "auth_time": 1733932800,
  "iat": 1733932800,
  "exp": 1733936400
}

// UserProfile
{
  "uid": "abc123xyz...",
  "email": "user@example.com",
  "displayName": "John Doe",
  "photoURL": "https://...",
  "provider": "google.com"
}
```

**Error Responses:**

- `401 Unauthorized` - Invalid or expired JWT token
- `404 Not Found` - User UID does not exist
- `409 Conflict` - Email already registered
- `500 Internal Server Error` - Firebase Auth service unavailable

**Implementation Reference:** `functions/index.js` lines 60-90 (verifyIdToken wrapper)

---

### IBuildService Interface

**Responsibility:** Build job submission, status tracking, log retrieval

**Provided By:** Firebase Cloud Functions

**Consumed By:** Next.js Frontend

**Methods:**

```typescript
interface IBuildService {
  /**
   * Submit new LFS build request
   * @param config - Build configuration
   * @param authToken - JWT for authentication
   * @returns Build job ID and initial status
   * @throws ValidationError if config invalid
   */
  submitBuild(config: BuildConfig, authToken: string): Promise<BuildSubmissionResponse>;
  
  /**
   * Get current build status
   * @param buildId - Build job identifier
   * @param authToken - JWT for authorization
   * @returns Current build state and progress
   * @throws NotFoundError if buildId invalid
   */
  getBuildStatus(buildId: string, authToken: string): Promise<BuildStatusResponse>;
  
  /**
   * Retrieve build log entries
   * @param buildId - Build job identifier
   * @param authToken - JWT for authorization
   * @param limit - Max entries to return (default: 100)
   * @returns Array of log entries
   */
  getBuildLogs(buildId: string, authToken: string, limit?: number): Promise<LogEntry[]>;
}
```

**Data Contracts:**

```json
// BuildConfig (Request)
{
  "projectName": "my-lfs-build",
  "lfsVersion": "12.0",
  "buildOptions": {
    "enableOptimizations": true,
    "includeDebugSymbols": false,
    "parallelJobs": 12
  }
}

// BuildSubmissionResponse
{
  "buildId": "build_abc123xyz",
  "status": "SUBMITTED",
  "submittedAt": "2025-12-11T10:30:00Z",
  "estimatedDuration": 5400  // seconds
}

// BuildStatusResponse
{
  "buildId": "build_abc123xyz",
  "status": "RUNNING",
  "progress": 45,
  "currentPackage": "glibc-2.38",
  "completedPackages": 31,
  "totalPackages": 69,
  "startedAt": "2025-12-11T10:35:00Z"
}
```

**HTTP Endpoints:**

- `POST /api/v1/submitBuild` - Submit new build
- `GET /api/v1/builds/{buildId}` - Get build status
- `GET /api/v1/builds/{buildId}/logs` - Retrieve logs

**Rate Limits:**

- `submitBuild`: 5 requests per minute per user
- `getBuildStatus`: 30 requests per minute per user
- `getBuildLogs`: 10 requests per minute per user

**Implementation Reference:** `functions/index.js` lines 100-250

---

### IDatabase Interface

**Responsibility:** CRUD operations on Firestore collections

**Provided By:** Google Cloud Firestore

**Consumed By:** Firebase Functions, Build Executor (local)

**Methods:**

```typescript
interface IDatabase {
  /**
   * Create new document
   * @param collection - Collection name
   * @param data - Document data
   * @returns Auto-generated document ID
   */
  create(collection: string, data: object): Promise<string>;
  
  /**
   * Update existing document
   * @param docPath - Full document path
   * @param data - Fields to update
   * @returns void on success
   * @throws NotFoundError if document missing
   */
  update(docPath: string, data: object): Promise<void>;
  
  /**
   * Query collection with filters
   * @param collection - Collection name
   * @param filters - Array of query filters
   * @returns Matching documents
   */
  query(collection: string, filters: Filter[]): Promise<Document[]>;
  
  /**
   * Real-time listener on document
   * @param docPath - Document path to watch
   * @param callback - Called on every change
   * @returns Unsubscribe function
   */
  onSnapshot(docPath: string, callback: (doc: Document) => void): UnsubscribeFunction;
}
```

**Filter Syntax:**

```typescript
// Filter types
type Filter = {
  field: string;
  operator: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'in' | 'array-contains';
  value: any;
};

// Example query
query('builds', [
  { field: 'userId', operator: '==', value: 'user123' },
  { field: 'status', operator: '==', value: 'RUNNING' }
])
```

**Security Constraints:**

- All operations require authentication (except public reads if allowed by rules)
- Firestore Security Rules enforce user ownership validation
- Admin SDK bypasses security rules (server-side only)

**Implementation Reference:** Firebase Admin SDK, `firestore.rules` lines 1-50

---

### IStorage Interface

**Responsibility:** Artifact upload, signed URL generation

**Provided By:** Google Cloud Storage

**Consumed By:** Firebase Functions, Build Executor (local)

**Methods:**

```typescript
interface IStorage {
  /**
   * Upload file to GCS bucket
   * @param path - GCS object path
   * @param file - File buffer or stream
   * @returns Public GCS URL
   */
  upload(path: string, file: Buffer | ReadableStream): Promise<string>;
  
  /**
   * Generate signed URL for download
   * @param path - GCS object path
   * @param expiry - Expiration time (seconds)
   * @returns Signed URL valid for expiry duration
   */
  generateSignedUrl(path: string, expiry: number): Promise<string>;
  
  /**
   * Delete object from bucket
   * @param path - GCS object path
   * @returns void on success
   */
  delete(path: string): Promise<void>;
}
```

**Path Conventions:**

- Artifacts: `builds/{buildId}/lfs-system-{timestamp}.tar.gz`
- Logs: `logs/{buildId}/BUILDLOG-{timestamp}.txt`
- Metadata: `builds/{buildId}/metadata.json`

**Upload Constraints:**

- Max file size: 10 GB per upload
- Allowed MIME types: `application/gzip`, `application/x-tar`, `text/plain`, `application/json`
- Bucket ACL: Private (requires signed URLs for access)

**Implementation Reference:** `helpers/gcs-uploader.js` lines 20-100

---

### IPubSub Interface

**Responsibility:** Asynchronous message delivery

**Provided By:** Google Cloud Pub/Sub

**Consumed By:** Firebase Functions

**Methods:**

```typescript
interface IPubSub {
  /**
   * Publish message to topic
   * @param topic - Topic name
   * @param message - Message payload (JSON serialized)
   * @returns Message ID
   */
  publish(topic: string, message: object): Promise<string>;
  
  /**
   * Subscribe to topic
   * @param subscription - Subscription name
   * @param handler - Message handler function
   * @returns void
   */
  subscribe(subscription: string, handler: (message: PubSubMessage) => void): void;
}
```

**Topic Definitions:**

- `build-requests` - New build submissions
- `build-completed` - Build completion notifications
- `build-failed` - Build failure alerts

**Message Schema:**

```json
{
  "buildId": "build_abc123",
  "userId": "user_xyz789",
  "config": {
    "lfsVersion": "12.0",
    "parallelJobs": 12
  },
  "traceId": "trace_abc",
  "timestamp": "2025-12-11T10:30:00Z"
}
```

**Implementation Reference:** `functions/index.js` lines 150-180 (Pub/Sub publish)

---

### IRealtimeService Interface

**Responsibility:** WebSocket-based real-time data sync

**Provided By:** Firestore real-time listeners

**Consumed By:** Next.js Frontend

**Methods:**

```typescript
interface IRealtimeService {
  /**
   * Subscribe to document changes
   * @param docPath - Document path
   * @param callback - Called on every update
   * @returns Unsubscribe function
   */
  onSnapshot(docPath: string, callback: (doc: DocumentSnapshot) => void): UnsubscribeFunction;
  
  /**
   * Subscribe to collection query changes
   * @param query - Firestore query object
   * @param callback - Called when query results change
   * @returns Unsubscribe function
   */
  onQuerySnapshot(query: Query, callback: (snapshot: QuerySnapshot) => void): UnsubscribeFunction;
}
```

**Usage Example:**

```typescript
// Subscribe to build status updates
const unsubscribe = onSnapshot(`builds/${buildId}`, (doc) => {
  const { status, progress, currentPackage } = doc.data();
  updateUI({ status, progress, currentPackage });
});

// Cleanup on component unmount
return () => unsubscribe();
```

**WebSocket Protocol:** Firestore uses WebSocket Secure (WSS) on port 443

**Implementation Reference:** Frontend `contexts/BuildContext.tsx` lines 50-120

---

### IBuildExecutor Interface

**Responsibility:** Execute LFS build scripts

**Provided By:** Local WSL2/Chroot environment or Cloud Run container

**Consumed By:** Pub/Sub message handler

**Methods:**

```typescript
interface IBuildExecutor {
  /**
   * Execute full LFS build
   * @param config - Build configuration
   * @param callbacks - Progress callbacks
   * @returns Build result with artifact path
   */
  executeBuild(config: BuildConfig, callbacks: BuildCallbacks): Promise<BuildResult>;
  
  /**
   * Cancel running build
   * @param buildId - Build to cancel
   * @returns void
   */
  cancelBuild(buildId: string): Promise<void>;
}

interface BuildCallbacks {
  onProgress: (pkg: string, progress: number) => void;
  onLog: (level: string, message: string) => void;
  onError: (error: Error) => void;
}

interface BuildResult {
  success: boolean;
  artifactPath?: string;
  artifactSize?: number;
  sha256?: string;
  errorMessage?: string;
  duration: number;  // seconds
}
```

**Implementation Reference:** 
- Local: `BUILD-LFS-CORRECT.ps1`, `build-lfs-complete-local.sh`
- Cloud: `lfs-build.sh`, `Dockerfile`

---

## 4.4.2.2 API Endpoint Specifications

### REST API Endpoints

**Base URL:** `https://us-central1-lfs-automated.cloudfunctions.net/`

**Authentication:** All endpoints require `Authorization: Bearer <JWT>` header

**Content-Type:** `application/json`

#### POST /api/v1/submitBuild

Submit new LFS build request.

**Request:**
```json
{
  "projectName": "production-lfs",
  "lfsVersion": "12.0",
  "buildOptions": {
    "enableOptimizations": true,
    "parallelJobs": 12
  }
}
```

**Response (201 Created):**
```json
{
  "buildId": "build_20251211_abc123",
  "status": "SUBMITTED",
  "submittedAt": "2025-12-11T10:30:00Z"
}
```

**Errors:**
- `400` - Invalid request body
- `401` - Missing or invalid JWT
- `429` - Rate limit exceeded

#### GET /api/v1/builds/{buildId}

Retrieve build status.

**Response (200 OK):**
```json
{
  "buildId": "build_20251211_abc123",
  "status": "RUNNING",
  "progress": 67,
  "currentPackage": "systemd-254",
  "completedPackages": 46,
  "totalPackages": 69,
  "startedAt": "2025-12-11T10:35:00Z"
}
```

**Errors:**
- `401` - Unauthorized (not owner)
- `404` - Build ID not found

#### GET /api/v1/builds/{buildId}/logs

Retrieve build logs.

**Query Parameters:**
- `limit` (optional, default: 100) - Max entries
- `level` (optional) - Filter by log level (DEBUG, INFO, WARN, ERROR)
- `after` (optional) - Timestamp for pagination

**Response (200 OK):**
```json
[
  {
    "timestamp": "2025-12-11T10:40:23Z",
    "level": "INFO",
    "message": "Compiling glibc-2.38...",
    "packageName": "glibc-2.38",
    "phase": "COMPILE"
  }
]
```

#### GET /api/v1/builds/{buildId}/artifact

Get signed URL for artifact download.

**Response (200 OK):**
```json
{
  "signedUrl": "https://storage.googleapis.com/...",
  "expiresAt": "2025-12-11T11:30:00Z",
  "size": 2987654321,
  "sha256": "abc123..."
}
```

---

## 4.4.2.3 Data Exchange Formats

All API requests and responses use JSON format with UTF-8 encoding. Date/time values follow ISO 8601 format (`YYYY-MM-DDTHH:MM:SSZ`). Binary data (artifacts) is transferred separately via signed URLs rather than embedded in JSON.

**Standard Error Response Format:**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid lfsVersion: must be one of [12.0, 11.3, 11.2]",
    "details": {
      "field": "lfsVersion",
      "value": "13.0",
      "allowedValues": ["12.0", "11.3", "11.2"]
    }
  }
}
```

---

##### Figure 33: Component Interaction Diagram

**[INSERT FIGURE 33 HERE]**

**Prompt Reference:** See `DIAGRAM-PROMPTS-GUIDE.md` - Figure 33

**Figure 33. UML Component Diagram** illustrating the 7 major system components and their interface contracts. The NextJS Frontend component requires three interfaces (IAuthService, IBuildService, IRealtimeService) satisfied by Firebase Auth, Firebase Functions, and Firestore respectively, demonstrating loose coupling through interface-based design. Firebase Functions acts as the central orchestration hub, requiring IDatabase (Firestore), IPubSub (Pub/Sub), and IStorage (Cloud Storage) interfaces. The Build Executor component (local WSL2/chroot implementation) requires only IDatabase and IStorage for log streaming and artifact uploads, enabling independent testing with mock implementations. Interface specifications (shown in boxes) define method signatures enforcing contracts: e.g., IBuildService.submitBuild() returns Promise<BuildId>, establishing asynchronous non-blocking behavior. This diagram supports architecture documentation by clarifying component responsibilities and inter-component dependencies, facilitating future refactoring (e.g., swapping Build Executor from local to Cloud Run without affecting Firebase Functions). The diagram traces to actual implementations: IAuthService → `functions/index.js` lines 60-90 (verifyIdToken wrapper), IBuildService → lines 100-250 (HTTP endpoint handlers), IDatabase → Firestore Admin SDK with `firestore.rules` enforcement, IPubSub → Google Cloud Pub/Sub SDK, IStorage → `helpers/gcs-uploader.js` lines 20-100, IRealtimeService → Firestore WebSocket listeners in `contexts/BuildContext.tsx` lines 50-120, IBuildExecutor → `BUILD-LFS-CORRECT.ps1` + `build-lfs-complete-local.sh` (local) or `lfs-build.sh` + `Dockerfile` (cloud).

---

##### Figure 34: Deployment Diagram

**[INSERT FIGURE 34 HERE]**

**Prompt Reference:** See `DIAGRAM-PROMPTS-GUIDE.md` - Figure 34

**Figure 34. UML Deployment Diagram** showing physical infrastructure topology across 8 execution nodes: User's Browser (client-side SPA), Netlify CDN (static asset distribution), Google Cloud Functions (serverless compute), Firestore (NoSQL database), Cloud Storage (artifact repository), Firebase Auth (identity provider), Pub/Sub (message broker), and Windows Host (local WSL2 build environment). Communication paths use HTTPS/WebSocket for browser-cloud interactions, gRPC for efficient inter-service communication within GCP, and TLS 1.3 encryption universally. The Windows Host node contains a nested WSL2 execution environment, illustrating the layered virtualization (Windows → WSL2 → chroot) characteristic of the local build architecture. Firestore and Cloud Storage reside in us-central1 region with multi-zone replication for 99.95% SLA, while Cloud Functions auto-scale to 1000 concurrent instances. The diagram omits the unused Cloud Run node (60-min timeout constraint), focusing on the operational hybrid architecture: cloud-hosted frontend/middleware, local execution layer. Deployment artifacts are specified per node: Next.js SPA JavaScript bundles in User's Browser, static assets (_next/static/*, public/images/*) on Netlify CDN with HTTP/2 protocol, Node.js 20 runtime with functions/index.js on Cloud Functions (256 MB memory per instance), Firestore collections (users/, builds/, buildLogs/, analytics/) with 3-zone replication, GCS buckets (lfs-artifacts/, logs/) with Standard storage class, Firebase Auth JWT signing using RS256 algorithm, Pub/Sub topics (build-requests, build-completed) with 7-day message retention, and Windows Host executing BUILD-LFS-CORRECT.ps1 → WSL2 Ubuntu 22.04 → /mnt/lfs chroot environment (8 GB RAM, 4-8 cores, 50 GB disk). Security annotations specify TLS 1.3 encryption for all connections, JWT authentication for API endpoints, IAM service accounts for GCP inter-service authentication, and Firestore security rules for data access control.

---

## 4.4.2.4 Error Handling and Status Codes

All HTTP responses follow standard status code conventions:

**Success Codes:**
- `200 OK` - Successful GET/PUT/DELETE
- `201 Created` - Successful POST creating resource
- `204 No Content` - Successful DELETE with no body

**Client Error Codes:**
- `400 Bad Request` - Invalid request syntax or parameters
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Valid auth but insufficient permissions
- `404 Not Found` - Resource does not exist
- `409 Conflict` - Resource already exists
- `422 Unprocessable Entity` - Valid syntax but semantic error
- `429 Too Many Requests` - Rate limit exceeded

**Server Error Codes:**
- `500 Internal Server Error` - Unhandled exception
- `502 Bad Gateway` - Upstream service failure
- `503 Service Unavailable` - Temporary overload
- `504 Gateway Timeout` - Upstream service timeout

**Implementation:** Error handling middleware in `functions/index.js` lines 30-60

---

## 4.4.2.5 Performance Requirements

**API Response Time Targets:**

| Endpoint | P50 (Median) | P95 | P99 | Timeout |
|----------|--------------|-----|-----|---------|
| POST /submitBuild | <200ms | <500ms | <1s | 10s |
| GET /builds/{id} | <50ms | <150ms | <300ms | 5s |
| GET /logs | <100ms | <300ms | <600ms | 10s |
| Real-time subscription | <50ms (latency) | N/A | N/A | - |

**Firestore Query Limits:**

- Max results per query: 1000 documents
- Recommended batch size: 100 documents
- Index required for composite queries

**GCS Upload Performance:**

- Average upload speed: 50 Mbps
- 2.8 GB artifact → ~8 minutes upload time
- Multipart upload for files >10 MB

**Implementation:** Performance monitoring via Cloud Functions metrics, Firebase Performance SDK in frontend

---

This interface design specification ensures clear contracts between all system components, enabling independent development, testing, and deployment while maintaining system cohesion and reliability.
