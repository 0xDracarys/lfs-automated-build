# 🧪 Cloud Build Testing Guide

## Quick Test Setup (Google Stack Only)

### 1. Test Email Logging (No External SMTP)

Email notifications are currently in **TEST MODE** - they log to Cloud Functions console instead of sending actual emails.

**To view email logs:**
```bash
# Real-time logs
firebase functions:log --only sendBuildEmail

# Or view in Firebase Console
# https://console.firebase.google.com/project/alfs-bd1e0/functions/logs
```

### 2. Test the Build Pipeline

#### Option A: Use Test Page (Recommended)
1. Start the dev server:
   ```bash
   cd lfs-learning-platform
   npm run dev
   ```

2. Navigate to: http://localhost:3000/test

3. Sign in with your Firebase account

4. Click **"▶️ Run Test Build"**

5. Check the Firebase Console logs for email content:
   - Look for `[TEST MODE] Email notification triggered`
   - Email content will be logged as JSON

#### Option B: Trigger Real Cloud Build
1. Navigate to: http://localhost:3000/build

2. Fill out the build form:
   - Project name
   - Kernel version (default: 6.4.12)
   - Build options

3. Click **"Start Build"**

4. Monitor at: http://localhost:3000/dashboard

5. Check Cloud Run Job execution:
   ```bash
   gcloud run jobs describe lfs-builder --region=us-central1
   gcloud run jobs executions list --job=lfs-builder --region=us-central1
   ```

### 3. Test Status API (Real Firestore Data)

The `/api/lfs/status/[buildId]` endpoint now uses **real Firestore data** (no more mock):

```bash
# Get build status
curl http://localhost:3000/api/lfs/status/YOUR_BUILD_ID

# Or visit in browser
# http://localhost:3000/api/lfs/status/YOUR_BUILD_ID
```

### 4. Deploy to Production (When Ready)

#### Deploy Cloud Functions:
```bash
firebase deploy --only functions
# Say "no" (n) when prompted about deleting sendBuildCompleteEmail
```

#### Rebuild Cloud Run Container (with packaging scripts):
```bash
gcloud builds submit --config cloudbuild.yaml
```

#### Deploy Frontend:
```bash
cd lfs-learning-platform
npm run build
netlify deploy --prod
```

### 5. Enable Real Email Sending (Later)

When ready to send actual emails, edit `functions/index.js`:

1. Find the `sendBuildEmail` function (line ~586)

2. Uncomment this line:
   ```javascript
   // TODO: Uncomment below to enable actual email sending
   await db.collection('mail').add(emailDoc);
   ```

3. Configure Firebase Email Extension:
   ```bash
   firebase ext:install firebase/firestore-send-email
   ```

4. Provide SMTP credentials:
   - **Gmail**: Use app password (https://myaccount.google.com/apppasswords)
   - **SendGrid**: Use API key
   - **Google Workspace**: Use SMTP relay

## What's Working Right Now

✅ **Real Build Monitoring**: `/api/lfs/status/[buildId]` fetches from Firestore  
✅ **Email Logging**: Emails logged to Cloud Functions console (not sent)  
✅ **Build Triggers**: `triggerCloudBuild` function creates Firestore docs  
✅ **Status Updates**: Firestore triggers update build status  
✅ **Test Function**: `testBuildComplete` simulates full pipeline  

## What Still Needs Testing

⏳ **Real 4-6 Hour Build**: Cloud Run Job execution with LFS build  
⏳ **Packaging Scripts**: TAR.GZ/ISO generation after build success  
⏳ **GCS Uploads**: Build outputs uploaded to Cloud Storage  
⏳ **Download URLs**: Signed URLs generated and added to Firestore  
⏳ **Actual Email Delivery**: Configure SMTP and enable real sending  

## Troubleshooting

**Q: Email function not firing?**  
A: Check Firestore triggers are enabled:
```bash
firebase functions:list | grep sendBuildEmail
```

**Q: Build stuck in PENDING?**  
A: Check Pub/Sub topic and Cloud Run Job:
```bash
gcloud pubsub topics list | grep lfs-build
gcloud run jobs list --region=us-central1
```

**Q: API returning old cached data?**  
A: Clear Next.js cache:
```bash
cd lfs-learning-platform
rm -rf .next .netlify
npm run dev
```

## Next Steps

1. ✅ Test email logging (use test page)
2. ✅ Verify Firestore integration (check dashboard)  
3. ⏳ Rebuild Cloud Run container (include packaging scripts)
4. ⏳ Test real build (4-6 hours)
5. ⏳ Configure SMTP for production emails

---

**All using Google Cloud technologies only!** 🎉
- Firebase Functions (Cloud Functions)
- Firebase Firestore (NoSQL database)
- Firebase Authentication
- Firebase Hosting/Netlify
- Google Cloud Run (container execution)
- Google Cloud Storage (file storage)
- Google Pub/Sub (messaging)
