# Cloud Build System - Setup and Deployment Guide

## Overview
The cloud build system allows authenticated users to initiate LFS builds on Google Cloud Run infrastructure. Each user can have only ONE active build at a time, and all builds are logged to Firestore.

## Architecture

```
User (Frontend) → Firebase Auth → API Endpoint → Firestore → Cloud Function → Cloud Run Job
```

### Flow:
1. **User Authentication**: User logs in via Google Sign-In
2. **Build Submission**: User fills form and submits to `/api/cloud-build`
3. **API Validation**: Backend verifies auth token and checks for active builds
4. **Firestore Document**: Build document created with status "SUBMITTED"
5. **Cloud Function Trigger**: `onBuildSubmitted` fires automatically
6. **Cloud Run Execution**: Function triggers Cloud Run Job `lfs-builder`
7. **Build Execution**: Job runs `lfs-build.sh` with configuration
8. **Real-time Logging**: Progress logged to Firestore `buildLogs` collection

## Files Created/Modified

### Frontend Components
- **`components/cloud-build/CloudBuildForm.tsx`**: Main cloud build UI
  - Authentication check
  - Active build detection
  - Build configuration form
  - One-build-per-user enforcement

### API Endpoints
- **`app/api/cloud-build/route.ts`**: Server-side build handler
  - POST: Submit new cloud build
  - GET: Check active build status
  - Firebase Auth token verification
  - Active build validation

### Security Rules
- **`firestore.rules`**: Updated with authentication requirements
  - Users must be logged in to read builds
  - Users can only create builds with their own userId
  - Users can only update/delete their own builds
  - Build logs are read-only (server-side writes)

### Frontend Pages
- **`app/build/page.tsx`**: Updated build page
  - Firebase Auth integration
  - Google Sign-In support
  - CloudBuildForm integration
  - Dynamic tab badge (shows "Login Required" if not authenticated)

## Firestore Schema

### Collection: `builds`
```javascript
{
  buildId: "auto-generated",
  
  // User information
  userId: "firebase-uid",
  email: "user@example.com",
  displayName: "John Doe",
  
  // Build configuration
  projectName: "my-custom-linux",
  lfsVersion: "12.0",
  kernelVersion: "6.4.12",
  buildOptions: {
    optimization: "O2",
    enableNetworking: true,
    enableDebug: false
  },
  additionalNotes: "Optional notes",
  
  // Status tracking
  status: "SUBMITTED" | "PENDING" | "RUNNING" | "SUCCESS" | "FAILED",
  submittedAt: Timestamp,
  startTime: Timestamp | null,
  endTime: Timestamp | null,
  
  // Metadata
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Collection: `buildLogs`
```javascript
{
  buildId: "build-id-reference",
  userId: "firebase-uid",
  stage: "submission" | "chapter5" | "chapter6" | "kernel" | "complete",
  timestamp: Timestamp,
  level: "info" | "warning" | "error",
  message: "Log message",
  metadata: {
    // Additional context
  }
}
```

## Required Environment Variables

### Frontend (`.env.local` in `lfs-learning-platform/`)
```bash
# Firebase Client SDK (already configured)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=alfs-bd1e0
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

### Backend (for Firebase Admin SDK)
```bash
# Option 1: Service Account JSON file
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json

# Option 2: Environment variables (for Netlify/Vercel)
NEXT_PUBLIC_FIREBASE_PROJECT_ID=alfs-bd1e0
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@alfs-bd1e0.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## Deployment Steps

### 1. Deploy Firestore Rules
```bash
cd /path/to/lfs-automated
firebase deploy --only firestore:rules
```

**Verify rules:**
```bash
firebase firestore:rules:get
```

### 2. Create Firestore Indexes
The active build query requires a composite index:

```bash
# Create index via Firebase Console or CLI
firebase firestore:indexes
```

**Required index:**
- Collection: `builds`
- Fields: `userId` (Ascending), `status` (Ascending), `submittedAt` (Descending)

Or create manually in Firebase Console:
1. Go to Firestore → Indexes
2. Create composite index with fields above

### 3. Deploy Frontend
```bash
cd lfs-learning-platform
npm run build
netlify deploy --prod
```

### 4. Test Cloud Functions (Local)
```bash
firebase emulators:start --only functions,firestore,auth
```

Test endpoints:
- Auth: http://localhost:9099
- Firestore: http://localhost:8080
- Functions: http://localhost:5001

### 5. Deploy Cloud Functions
```bash
firebase deploy --only functions
```

**Functions deployed:**
- `onBuildSubmitted`: Firestore trigger (automatically runs when build created)
- `triggerBuildViaCloudRun`: HTTP endpoint for manual triggers

## Testing Guide

### 1. Test Authentication
1. Navigate to https://sams-lfs.netlify.app/build
2. Click "Cloud Build" tab
3. Verify "Authentication Required" prompt appears
4. Click "Sign In to Continue"
5. Authenticate with Google
6. Verify you're redirected back to the form

### 2. Test Build Submission
1. Fill out the build form:
   - Project Name: `test-build`
   - LFS Version: `12.0`
   - Kernel Version: `6.4.12`
   - Options: Enable networking
2. Click "Start Cloud Build"
3. Verify redirect to `/build/{buildId}` page
4. Check build status in real-time

### 3. Test One-Build-Per-User Restriction
1. Submit a build (status: PENDING/RUNNING)
2. Navigate back to `/build` page
3. Click "Cloud Build" tab
4. Verify warning message: "Active Build in Progress"
5. Verify "Start Cloud Build" button is disabled
6. Click "View Active Build" to see progress

### 4. Verify Firestore Logging
```bash
# Check build document
firebase firestore:get builds/{buildId}

# Check build logs
firebase firestore:query buildLogs --where buildId=={buildId}
```

Or use Firebase Console:
1. Go to Firestore Database
2. View `builds` collection → find your buildId
3. View `buildLogs` collection → filter by buildId

### 5. Test Cloud Run Trigger
```bash
# Check if Cloud Function triggered the job
gcloud run jobs executions list \
  --job=lfs-builder \
  --region=us-central1 \
  --project=alfs-bd1e0 \
  --limit=5
```

## Monitoring Commands

### Check Recent Builds
```bash
# Via Firebase CLI
firebase firestore:query builds --order-by submittedAt --limit 10

# Via gcloud
gcloud firestore documents list builds \
  --project=alfs-bd1e0 \
  --limit=10
```

### Check Build Logs
```bash
# Via Firebase CLI
firebase firestore:query buildLogs \
  --where buildId==YOUR_BUILD_ID \
  --order-by timestamp

# Via gcloud
gcloud logging read "resource.type=cloud_run_job AND resource.labels.job_name=lfs-builder" \
  --limit=50 \
  --project=alfs-bd1e0
```

### Check Cloud Run Job Status
```bash
gcloud run jobs describe lfs-builder \
  --region=us-central1 \
  --project=alfs-bd1e0
```

## Troubleshooting

### Issue: "Missing or insufficient permissions"
**Solution:** Deploy Firestore rules
```bash
firebase deploy --only firestore:rules
```

### Issue: "Index required" error
**Solution:** Create composite index
```bash
firebase firestore:indexes
# Follow the link provided in the error message
```

### Issue: "Unauthorized - Invalid authentication token"
**Solution:** 
1. Check Firebase Auth is configured in `lib/firebase.ts`
2. Verify user is logged in: `console.log(auth.currentUser)`
3. Regenerate ID token: `await user.getIdToken(true)`

### Issue: Build not starting (stays in SUBMITTED status)
**Solution:**
1. Check Cloud Function logs:
```bash
firebase functions:log --only onBuildSubmitted
```
2. Verify Pub/Sub topic exists:
```bash
gcloud pubsub topics list --project=alfs-bd1e0
```
3. Verify Cloud Run Job exists:
```bash
gcloud run jobs list --region=us-central1 --project=alfs-bd1e0
```

### Issue: "You already have an active build" but no build visible
**Solution:** Check Firestore for orphaned builds
```bash
firebase firestore:query builds \
  --where userId==YOUR_USER_ID \
  --where status==RUNNING
```

If found, manually update status:
```bash
firebase firestore:update builds/{buildId} status=FAILED
```

## Security Considerations

### Current Implementation
✅ Authentication required for all operations
✅ Users can only create builds with their own userId
✅ Users can only modify their own builds
✅ Build logs are read-only from client
✅ One build per user enforcement

### Recommended Enhancements
🔒 Add rate limiting (e.g., max 5 builds per user per day)
🔒 Add build timeout (auto-cancel after 8 hours)
🔒 Add email verification requirement
🔒 Add build cost estimation and quotas
🔒 Add IP-based rate limiting
🔒 Add CAPTCHA for build submission

## Cost Optimization

### Current Setup
- **Cloud Run Job**: Pay per second of execution (4-6 hours)
- **Firestore**: Pay per read/write operation
- **Cloud Storage**: Pay per GB stored
- **Pub/Sub**: Pay per message

### Recommendations
1. **Set build timeout**: Max 8 hours
2. **Limit concurrent builds**: Max 10 simultaneous
3. **Auto-delete old builds**: After 30 days
4. **Compress build artifacts**: Before storing in GCS
5. **Use budget alerts**: Set up billing alerts

## Next Steps

1. **Add Build Monitoring Page** (`/build/[buildId]/page.tsx`)
   - Real-time status updates
   - Live log streaming
   - Download button when complete
   - Cancel build option

2. **Add Email Notifications**
   - Build started
   - Build completed
   - Build failed
   - Download link

3. **Add Build History Page** (`/dashboard/builds`)
   - List all user builds
   - Filter by status
   - Download past builds
   - Delete old builds

4. **Add Admin Dashboard**
   - Monitor all builds
   - View system metrics
   - Cancel runaway builds
   - Manage user quotas

## Support

For issues or questions:
1. Check Firebase Console logs
2. Check Cloud Run execution logs
3. Check Firestore data
4. Review this guide
5. Contact: your-email@example.com

---

**Last Updated:** January 1, 2026
**Version:** 1.0.0
