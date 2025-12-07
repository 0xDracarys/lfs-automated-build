# LFS Automated Builder - Project Structure Guide

## 📁 Directory Structure

```
lfs-automated/
├── public/                     # Firebase Hosting - Frontend
│   └── index.html             # Main web application
├── functions/                 # Firebase Cloud Functions
│   ├── package.json
│   └── index.js              # Firestore triggers and HTTP functions
├── build-scripts/            # (Optional) Custom build scripts
│   └── [build automation scripts]
├── config/                   # (Optional) Configuration files
│   └── [build configurations]
├── Dockerfile                # Cloud Run Job container definition
├── docker-entrypoint.sh      # Container startup script
├── firebase.json             # Firebase project configuration
├── package.json              # Root project dependencies
├── .firebaserc               # Firebase project ID (create with: firebase init)
├── firestore.rules           # Firestore security rules (create with: firebase init firestore)
├── firestore.indexes.json    # Firestore indexes
└── README.md                 # Documentation

```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Firebase CLI (`npm install -g firebase-tools`)
- Docker (for Cloud Run)
- Google Cloud Project with Firebase enabled

### Installation

1. **Install dependencies**
   ```bash
   npm install
   cd functions && npm install && cd ..
   ```

2. **Initialize Firebase**
   ```bash
   firebase init
   ```
   Select: Firestore, Functions, Hosting

3. **Configure Firebase credentials**
   - Get your Firebase config from Firebase Console
   - Update the `firebaseConfig` in `public/index.html`

4. **Deploy locally**
   ```bash
   npm run serve
   ```

5. **Access the application**
   - Hosting: http://localhost:5000
   - Functions: http://localhost:5001
   - Firestore: http://localhost:8080

## 🔧 Configuration

### Firebase Configuration (`firebase.json`)
- **Hosting**: Serves from `public/` directory
- **Functions**: Located in `functions/` directory
- **Firestore**: Database for build records
- **Emulators**: Local development setup

### Environment Variables
Set in Cloud Functions or local `.env`:
```env
LFS_VERSION=12.0
CLOUD_RUN_JOB_NAME=lfs-builder
PROJECT_ID=your-firebase-project
```

## 📝 Cloud Function Triggers

### onBuildSubmitted
- **Trigger**: Firestore `builds` collection
- **Action**: Queues build when new document created
- **Next**: Calls Cloud Run Job API

### getBuildStatus
- **Endpoint**: `GET /getBuildStatus?buildId=xxx`
- **Returns**: Current build status and logs

### listBuilds
- **Endpoint**: `GET /listBuilds?email=user@example.com`
- **Returns**: User's build history

## 🐳 Docker / Cloud Run

### Build Docker Image
```bash
docker build -t gcr.io/YOUR_PROJECT_ID/lfs-builder .
```

### Push to Container Registry
```bash
docker push gcr.io/YOUR_PROJECT_ID/lfs-builder
```

### Create Cloud Run Job
```bash
gcloud run jobs create lfs-builder \
  --image gcr.io/YOUR_PROJECT_ID/lfs-builder \
  --tasks 1 \
  --timeout 3600 \
  --region us-central1
```

### Execute Job
```bash
gcloud run jobs execute lfs-builder \
  --region us-central1 \
  --env LFS_BUILD_ID=build_123 \
  --env LFS_VERSION=12.0
```

## 🗄️ Firestore Schema

### `builds` Collection
```javascript
{
  projectName: string,
  lfsVersion: string,
  email: string,
  buildOptions: {
    includeGlibcDev: boolean,
    includeKernel: boolean,
    optimizeSize: boolean
  },
  additionalNotes: string,
  status: "pending" | "queued" | "building" | "completed" | "error",
  timestamp: timestamp,
  createdAt: timestamp,
  queuedAt: timestamp,
  startedAt: timestamp,
  completedAt: timestamp,
  error: string (optional)
}
```

### `buildLogs` Collection (Optional)
```javascript
{
  buildId: string (reference),
  timestamp: timestamp,
  level: "INFO" | "WARN" | "ERROR",
  message: string,
  metadata: object (optional)
}
```

## 🔐 Security

### Firestore Rules
Implement in `firestore.rules`:
- Users can only read/write their own builds
- Admin users can read all builds
- Logs are append-only

### Cloud Functions
- Enable authentication for HTTP functions
- Validate input parameters
- Use environment variables for sensitive data

## 📊 Monitoring

### View Logs
```bash
firebase functions:log
```

### Cloud Run Job Logs
```bash
gcloud run jobs logs read lfs-builder --region us-central1
```

### Firestore Monitoring
- Firebase Console → Firestore → Metrics
- Monitor document count and storage usage

## 🧪 Testing Locally

### Test Form Submission
1. Open http://localhost:5000
2. Fill in the form
3. Click "Start Build"
4. Check Firestore emulator at http://localhost:8080

### Test Cloud Functions
```bash
# Get build status
curl "http://localhost:5001/getBuildStatus?buildId=test123"

# List builds
curl "http://localhost:5001/listBuilds?email=test@example.com"

# Health check
curl "http://localhost:5001/health"
```

## 🚢 Deployment

### Deploy All
```bash
npm run deploy
```

### Deploy Only Functions
```bash
npm run deploy:functions
```

### Deploy Only Hosting
```bash
npm run deploy:hosting
```

## 📚 Next Steps

1. Implement Cloud Run Job trigger in `functions/index.js`
2. Add LFS build scripts in `build-scripts/` directory
3. Configure Firestore security rules
4. Set up monitoring and alerting
5. Add email notifications
6. Implement build cancellation
7. Add progress tracking

## 🔗 Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Cloud Functions Guide](https://firebase.google.com/docs/functions)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [LFS Official Guide](https://www.linuxfromscratch.org/)
- [Docker Reference](https://docs.docker.com/reference/)

## 📝 License

MIT

