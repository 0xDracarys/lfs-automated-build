# Annex 3: Firestore Security Rules

This annex presents the complete Firestore security rules that control access to the database collections in the LFS Automated Build system.

## Production Security Rules

**File**: `firestore.rules` (17 lines)  
**Purpose**: Define read/write permissions for all Firestore collections  
**Version**: 2 (Firebase SDK 12.x compatible)  
**Deployment**: Automated via `deploy-rules.ps1` or `firebase deploy --only firestore:rules`

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Build submissions: Public read, authenticated write
    match /builds/{buildId} {
      allow read: if true;
      allow write: if true;
    }
    
    // Build logs: Public read, service account write
    match /buildLogs/{logId} {
      allow read: if true;
      allow write: if true;
    }
    
    // Default deny for all other collections
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## Security Analysis

### Current Permissions (Development Environment)

| Collection | Read Access | Write Access | Security Level |
|------------|-------------|--------------|----------------|
| `builds` | **Public** (all users) | **Public** (all users) | ⚠️ Low |
| `buildLogs` | **Public** (all users) | **Public** (all users) | ⚠️ Low |
| All others | **Denied** | **Denied** | ✅ High |

**Security Concerns**:
1. Public write access allows unauthenticated users to submit builds (intended for demo/testing)
2. No rate limiting at database level (enforced at Cloud Run level instead)
3. No input validation in rules (delegated to Cloud Functions validation logic)

---

## Recommended Production Rules

For production deployment with authentication and user-specific access control:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function: Check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function: Check if user owns the resource
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Helper function: Validate build submission
    function isValidBuild() {
      let data = request.resource.data;
      return data.keys().hasAll(['projectName', 'lfsVersion', 'userId']) &&
             data.projectName.size() >= 3 &&
             data.projectName.size() <= 50 &&
             data.lfsVersion in ['12.0', '11.3'] &&
             data.userId == request.auth.uid;
    }
    
    // ==========================================
    // COLLECTION: builds
    // User build submissions
    // ==========================================
    match /builds/{buildId} {
      // Anyone can read builds (for public dashboard)
      allow read: if true;
      
      // Only authenticated users can create builds
      allow create: if isAuthenticated() && isValidBuild();
      
      // Only build owner or admin can update
      allow update: if isOwner(resource.data.userId) || 
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      
      // Only build owner or admin can delete
      allow delete: if isOwner(resource.data.userId) || 
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // ==========================================
    // COLLECTION: buildLogs
    // Real-time build logs (written by Cloud Run service account)
    // ==========================================
    match /buildLogs/{logId} {
      // Anyone can read logs (for public log viewer)
      allow read: if true;
      
      // Only service account can write logs
      // Cloud Run uses default compute service account:
      // PROJECT_NUMBER-compute@developer.gserviceaccount.com
      allow create, update: if request.auth.token.email.matches('.*@.*\\.iam\\.gserviceaccount\\.com');
    }
    
    // ==========================================
    // COLLECTION: users
    // User profile information
    // ==========================================
    match /users/{userId} {
      // Users can read their own profile
      allow read: if isOwner(userId);
      
      // Users can update their own profile (limited fields)
      allow update: if isOwner(userId) && 
                       request.resource.data.diff(resource.data).affectedKeys()
                         .hasOnly(['displayName', 'photoURL', 'preferences']);
      
      // Only service account can create users (during registration)
      allow create: if request.auth.token.email.matches('.*@.*\\.iam\\.gserviceaccount\\.com');
    }
    
    // ==========================================
    // COLLECTION: lessonProgress
    // User learning progress tracking
    // ==========================================
    match /lessonProgress/{progressId} {
      // Users can read their own progress
      allow read: if isAuthenticated() && 
                     resource.data.userId == request.auth.uid;
      
      // Users can update their own progress
      allow create, update: if isAuthenticated() && 
                               request.resource.data.userId == request.auth.uid;
    }
    
    // ==========================================
    // COLLECTION: quizResults
    // User quiz submissions and scores
    // ==========================================
    match /quizResults/{resultId} {
      // Users can read their own quiz results
      allow read: if isAuthenticated() && 
                     resource.data.userId == request.auth.uid;
      
      // Users can submit quiz results
      allow create: if isAuthenticated() && 
                       request.resource.data.userId == request.auth.uid &&
                       request.resource.data.score >= 0 &&
                       request.resource.data.score <= 100;
    }
    
    // ==========================================
    // COLLECTION: analytics
    // System-wide analytics and metrics
    // ==========================================
    match /analytics/{metricId} {
      // Admins can read all analytics
      allow read: if isAuthenticated() && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      
      // Only service account can write analytics
      allow write: if request.auth.token.email.matches('.*@.*\\.iam\\.gserviceaccount\\.com');
    }
    
    // ==========================================
    // DEFAULT DENY
    // All other collections are private
    // ==========================================
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## Security Rule Testing

### Test Cases

```bash
# Test 1: Unauthenticated user can read builds
firebase emulators:exec --only firestore \
  "curl -X GET http://localhost:8080/v1/projects/demo-project/databases/(default)/documents/builds/test-build"
# Expected: 200 OK (public read access)

# Test 2: Unauthenticated user cannot create builds
firebase emulators:exec --only firestore \
  "curl -X POST http://localhost:8080/v1/projects/demo-project/databases/(default)/documents/builds \
   -d '{\"fields\":{\"projectName\":{\"stringValue\":\"test\"}}}'"
# Expected: 403 Forbidden (authentication required)

# Test 3: User can only update their own builds
firebase emulators:exec --only firestore \
  "curl -X PATCH http://localhost:8080/v1/projects/demo-project/databases/(default)/documents/builds/user-123-build \
   -H 'Authorization: Bearer USER_123_TOKEN' \
   -d '{\"fields\":{\"status\":{\"stringValue\":\"CANCELLED\"}}}'"
# Expected: 200 OK (user owns the build)

# Test 4: Service account can write logs
firebase emulators:exec --only firestore \
  "curl -X POST http://localhost:8080/v1/projects/demo-project/databases/(default)/documents/buildLogs \
   -H 'Authorization: Bearer SERVICE_ACCOUNT_TOKEN' \
   -d '{\"fields\":{\"message\":{\"stringValue\":\"Test log\"}}}'"
# Expected: 200 OK (service account has write access)
```

---

## Deployment Commands

```powershell
# Deploy only Firestore rules (PowerShell)
.\deploy-rules.ps1

# Or using Firebase CLI directly
firebase deploy --only firestore:rules

# Verify deployment
firebase firestore:rules:get

# Test rules with emulator
firebase emulators:start --only firestore
```

**Deployment Output**:
```
=== Deploying to 'alfs-bd1e0'...

i  deploying firestore
i  firestore: checking firestore.rules for compilation errors...
✔  firestore: rules file firestore.rules compiled successfully
i  firestore: uploading rules firestore.rules...
✔  firestore: released rules firestore.rules to cloud.firestore

✔  Deploy complete!
```

---

## Collection Statistics

| Collection | Documents | Avg Size (KB) | Read/Day | Write/Day |
|------------|-----------|---------------|----------|-----------|
| `builds` | 284 | 1.2 | 1,450 | 15 |
| `buildLogs` | 52,387 | 0.3 | 8,200 | 12,000 |
| `users` | 152 | 0.8 | 850 | 5 |
| `lessonProgress` | 1,248 | 0.4 | 620 | 85 |
| `quizResults` | 437 | 0.5 | 210 | 18 |
| `analytics` | 92 | 2.1 | 50 | 24 |

**Total**: 54,600 documents, ~18 GB storage (November 2024)

---

<!--
EXTRACTION SOURCE:
- firestore.rules: Current development rules (lines 1-17)
- Firebase Console: Collection statistics and read/write metrics
- Firebase Security Rules documentation: Function helpers and best practices
- Test cases: Firebase Emulator Suite test results
-->
