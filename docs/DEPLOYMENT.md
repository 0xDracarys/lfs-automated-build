# LFS Automated Builder - Deployment Guide

## 🔧 Pre-Deployment Setup

### 1. Google Cloud Project Setup

```bash
# Create a new project (if needed)
gcloud projects create lfs-automated --name="LFS Automated Builder"

# Set the project
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable \
  firebase.googleapis.com \
  cloudfunctions.googleapis.com \
  run.googleapis.com \
  firestore.googleapis.com \
  container.googleapis.com \
  artifactregistry.googleapis.com
```

### 2. Firebase Initialization

```bash
# Login to Firebase
firebase login

# Initialize Firebase project
firebase init

# Follow prompts and select:
# - Firestore Database
# - Cloud Functions
# - Hosting
```

### 3. Configuration

Update the following files:

- **firebase.json**: Set correct project ID and configuration
- **public/index.html**: Update Firebase configuration credentials
- **functions/index.js**: Configure Cloud Run job integration

## 📦 Docker Image Build & Push

### Build Locally

```bash
# Build Docker image
docker build -t lfs-builder:latest .

# Test locally
docker run -it lfs-builder:latest shell
```

### Push to Google Container Registry

```bash
# Configure Docker to authenticate
gcloud auth configure-docker gcr.io

# Tag image for GCR
docker tag lfs-builder:latest gcr.io/YOUR_PROJECT_ID/lfs-builder:latest

# Push to registry
docker push gcr.io/YOUR_PROJECT_ID/lfs-builder:latest
```

### Using Artifact Registry (Alternative)

```bash
# Create repository
gcloud artifacts repositories create lfs-builder \
  --location=us-central1 \
  --repository-format=docker

# Configure Docker
gcloud auth configure-docker us-central1-docker.pkg.dev

# Tag and push
docker tag lfs-builder:latest \
  us-central1-docker.pkg.dev/YOUR_PROJECT_ID/lfs-builder/lfs-builder:latest

docker push us-central1-docker.pkg.dev/YOUR_PROJECT_ID/lfs-builder/lfs-builder:latest
```

## 🚀 Deploy Cloud Run Job

### Create the Job

```bash
# Create Cloud Run Job
gcloud run jobs create lfs-builder \
  --image gcr.io/YOUR_PROJECT_ID/lfs-builder:latest \
  --region us-central1 \
  --tasks 1 \
  --timeout 3600 \
  --memory 4Gi \
  --cpu 4 \
  --service-account lfs-builder@YOUR_PROJECT_ID.iam.gserviceaccount.com \
  --set-cloudsql-instances='' \
  --args=build \
  --no-wait
```

### Service Account Setup

```bash
# Create service account
gcloud iam service-accounts create lfs-builder \
  --display-name="LFS Builder Service Account"

# Grant necessary permissions
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member=serviceAccount:lfs-builder@YOUR_PROJECT_ID.iam.gserviceaccount.com \
  --role=roles/firestore.user

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member=serviceAccount:lfs-builder@YOUR_PROJECT_ID.iam.gserviceaccount.com \
  --role=roles/storage.admin

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member=serviceAccount:lfs-builder@YOUR_PROJECT_ID.iam.gserviceaccount.com \
  --role=roles/logging.logWriter
```

## 🔐 Firestore Setup

### Initialize Firestore

```bash
# Create Firestore database
gcloud firestore databases create --region=us-central1

# Deploy security rules
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes
```

## 🚀 Deploy Firebase Functions

```bash
# Deploy all functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:onBuildSubmitted

# View logs
firebase functions:log
```

## 🌐 Deploy Hosting

```bash
# Deploy frontend
firebase deploy --only hosting

# View deployed site
firebase open hosting:site
```

## 🔗 Connect Cloud Functions to Cloud Run Jobs

Update `functions/index.js` to implement Cloud Run job triggering:

```javascript
const { CloudRunClient } = require('@google-cloud/run');

const client = new CloudRunClient();

async function triggerCloudRunJob(buildData, buildId) {
    const request = {
        name: `projects/YOUR_PROJECT_ID/locations/us-central1/jobs/lfs-builder`,
    };

    try {
        const operation = await client.runJob(request);
        return operation;
    } catch (error) {
        throw new Error(`Failed to trigger job: ${error.message}`);
    }
}
```

Add dependency:
```bash
cd functions && npm install @google-cloud/run && cd ..
```

## ✅ Testing Deployment

### 1. Test Firebase Hosting

```bash
# Open your deployed site
firebase open hosting:site
```

### 2. Test Cloud Functions

```bash
# List deployed functions
gcloud functions list

# Call HTTP function
curl https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/getBuildStatus?buildId=test
```

### 3. Test Cloud Run Job

```bash
# Execute job manually
gcloud run jobs execute lfs-builder \
  --region us-central1 \
  --env LFS_BUILD_ID=test-001 \
  --env LFS_VERSION=12.0

# Check job status
gcloud run jobs describe lfs-builder --region us-central1

# View logs
gcloud logging read "resource.type=cloud_run_job" --limit 50
```

### 4. Monitor Firestore

```bash
# Query Firestore (using Firebase CLI)
firebase firestore:delete builds/test --force

# Or use Cloud Console
# Navigate to: Firebase Console → Firestore Database
```

## 📊 Monitoring & Logs

### Cloud Functions Logs

```bash
firebase functions:log
```

### Cloud Run Logs

```bash
gcloud logging read "resource.type=cloud_run_job" --limit 50
```

### Firestore Metrics

```bash
# View in Cloud Console
# Firestore → Metrics
```

## 🔄 CI/CD Deployment (Optional)

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: YOUR_PROJECT_ID
```

## 🧹 Cleanup (if needed)

```bash
# Delete Cloud Run Job
gcloud run jobs delete lfs-builder --region us-central1

# Delete Firestore database
gcloud firestore databases delete --database='(default)'

# Delete Firebase project
firebase projects:list
firebase projects:clear
```

## 🆘 Troubleshooting

### Function Deployment Issues

```bash
# Check function logs
firebase functions:log

# Deploy with verbose output
firebase deploy --only functions --debug
```

### Cloud Run Job Issues

```bash
# Check job status
gcloud run jobs describe lfs-builder --region us-central1

# View detailed logs
gcloud logging read "resource.type=cloud_run_job AND resource.labels.job_name=lfs-builder" --limit 100
```

### Firestore Issues

```bash
# Check Firestore quota and usage
# Cloud Console → Firestore → Metrics

# Clear Firestore (CAUTION!)
firebase firestore:delete --all --yes
```

## 📝 Next Steps

1. Implement automated backups for Firestore
2. Set up monitoring alerts
3. Configure email notifications
4. Add metrics and analytics
5. Implement build cancellation
6. Add progress tracking to UI
7. Set up scaling policies

## 📚 Additional Resources

- [Firebase Deployment Docs](https://firebase.google.com/docs/deploy)
- [Cloud Run Jobs Docs](https://cloud.google.com/run/docs/quickstarts/jobs/create-execute)
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)
- [Google Cloud CLI Reference](https://cloud.google.com/cli/docs)
