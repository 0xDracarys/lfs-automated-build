# Firebase Setup & Configuration Guide

## Overview

This guide walks you through setting up Firebase for the LFS Automated Builder application. The setup includes:

- **Firebase Authentication** (Anonymous sign-in)
- **Firestore Database** (Build collection management)
- **Firebase Web App** (Frontend configuration)
- **Security Rules** (Data protection)

---

## 📋 Prerequisites

- A Google Cloud Project (or create a new one)
- Firebase Console access (https://console.firebase.google.com)
- Administrative access to your Google Cloud Project

---

## 🚀 Step 1: Create a Firebase Project

### Option A: New Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Create a project"**
3. Enter project name: `lfs-automated-builder`
4. Accept terms and click **"Continue"**
5. Choose region: **North America (us-east1)** (or your preferred region)
6. Click **"Create project"**
7. Wait for project creation to complete

### Option B: Use Existing Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your existing project
3. Skip to **Step 2**

---

## 🔑 Step 2: Set Up Firebase Web App

### 2.1 Register Web App

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Click **"Your apps"** section
3. Click **"Web"** icon (or **"Add app"** → **Web**)
4. Register app name: `LFS Builder UI`
5. Check **"Also set up Firebase Hosting for this app"** (optional)
6. Click **"Register app"**

### 2.2 Copy Firebase Configuration

You'll see your Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

**Save this configuration** - you'll need it in Step 5.

---

## 🔐 Step 3: Enable Authentication

### 3.1 Enable Anonymous Authentication

1. In Firebase Console, go to **Authentication**
2. Click **"Get Started"**
3. Go to **Sign-in method** tab
4. Find **"Anonymous"**
5. Click the toggle to **Enable**
6. Click **"Save"**

✅ **Status**: Anonymous users can now access your app

---

## 🗄️ Step 4: Create Firestore Database

### 4.1 Create Database

1. In Firebase Console, go to **Firestore Database**
2. Click **"Create database"**
3. Select location: **us-east1** (or nearest to you)
4. Start in **Test Mode** (for development)
5. Click **"Create"**

### 4.2 Set Up Security Rules

After database creation:

1. Go to **Firestore** → **Rules** tab
2. Replace the default rules with:

```firestore-rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Allow authenticated/anonymous users to read their own builds
    match /builds/{buildId} {
      allow read: if request.auth != null && 
                     (resource.data.userId == request.auth.uid ||
                      request.auth.token.admin == true);
      allow create: if request.auth != null &&
                       request.resource.data.userId == request.auth.uid &&
                       request.resource.data.status == 'QUEUED' &&
                       request.resource.data.buildId != null;
      allow update: if request.auth != null && 
                       (resource.data.userId == request.auth.uid ||
                        request.auth.token.admin == true);
      allow delete: if false; // Builds cannot be deleted
      
      // Allow authenticated users to view build logs
      match /logs/{logId} {
        allow read: if request.auth != null && 
                       (get(/databases/$(database)/documents/builds/$(buildId)).data.userId == request.auth.uid ||
                        request.auth.token.admin == true);
        allow create, update: if request.auth.token.admin == true;
      }
    }
    
    // Admin collection for system settings
    match /admin/{document=**} {
      allow read, write: if request.auth.token.admin == true;
    }
  }
}
```

3. Click **"Publish"**

---

## 🔧 Step 5: Configure Frontend Application

### 5.1 Update Firebase Config in index.html

1. Open `public/index.html` in your editor
2. Find the Firebase configuration section:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

3. Replace with your actual Firebase credentials from **Step 2.2**

**Example** (replace with your actual values):

```javascript
const firebaseConfig = {
    apiKey: "AIzaSyDVYqwZ3-K5L7MnOpQrStUvWxYz9abcDEF",
    authDomain: "lfs-automated-builder.firebaseapp.com",
    projectId: "lfs-automated-builder",
    storageBucket: "lfs-automated-builder.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef123456789abc123d"
};
```

### 5.2 Save Changes

Save the file and test locally:

```bash
cd public
python3 -m http.server 8000
```

Visit `http://localhost:8000` in your browser.

---

## 📊 Step 6: Firestore Database Schema

### Collection Structure

```
firestore-root/
├── builds/                          # Main builds collection
│   ├── {buildId}/                   # Each build document
│   │   ├── buildId: string          # Unique UUID
│   │   ├── userId: string           # Anonymous user ID
│   │   ├── projectName: string
│   │   ├── lfsVersion: string
│   │   ├── email: string
│   │   ├── buildOptions: object
│   │   ├── additionalNotes: string
│   │   ├── status: string           # QUEUED, RUNNING, SUCCESS, FAILED
│   │   ├── progress: number         # 0-100
│   │   ├── createdAt: timestamp
│   │   ├── updatedAt: timestamp
│   │   ├── completedAt: timestamp   # (optional)
│   │   ├── metadata: object
│   │   │   ├── userAgent: string
│   │   │   ├── platform: string
│   │   │   └── language: string
│   │   └── logs/                    # Subcollection for logs
│   │       ├── {logId}/
│   │       │   ├── stage: string
│   │       │   ├── message: string
│   │       │   ├── level: string
│   │       │   ├── timestamp: timestamp
│   │       │   └── metadata: object
│   │
│   ├── admin/                       # Admin configuration
│   │   └── settings/
│   │       ├── maxConcurrentBuilds: number
│   │       ├── buildTimeout: number
│   │       └── maintenanceMode: boolean
```

### Document Field Types

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `buildId` | String | Yes | UUID v4 identifier |
| `userId` | String | Yes | Firebase User ID |
| `projectName` | String | Yes | User-provided name |
| `lfsVersion` | String | Yes | LFS version (e.g., "12.0") |
| `email` | String | Yes | Notification email |
| `status` | String | Yes | QUEUED, RUNNING, SUCCESS, FAILED |
| `progress` | Number | Yes | 0-100 progress percentage |
| `createdAt` | Timestamp | Yes | Build creation time |
| `updatedAt` | Timestamp | Yes | Last update time |
| `completedAt` | Timestamp | No | Build completion time |

---

## 🧪 Step 7: Testing Firebase Setup

### 7.1 Test Anonymous Authentication

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Refresh page and check logs:

```
✓ Firebase initialized successfully. User ID: [UID]
```

### 7.2 Test Form Submission

1. Fill out the LFS Build form
2. Click **"Start Build"**
3. Check for success message with Build ID
4. Open Firebase Console → **Firestore** → **builds** collection
5. Verify new document appears with correct data

### 7.3 Check Browser DevTools Console

Look for:

```
✓ Firebase initialized successfully. User ID: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5
✓ Build saved to Firestore: [DocumentID]
Build submitted: {
  buildId: "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx",
  firestoreDocId: "[DocumentID]",
  userId: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5",
  timestamp: "2025-11-05T..."
}
```

---

## 🚨 Troubleshooting

### Issue: "Firebase not initialized"

**Cause**: Firebase credentials not correctly configured

**Solution**:
1. Verify all credentials in `firebaseConfig`
2. Check Firebase Console for correct values
3. Clear browser cache and reload

### Issue: "Anonymous sign-in failed"

**Cause**: Anonymous authentication not enabled

**Solution**:
1. Go to Firebase Console → **Authentication**
2. Enable **Anonymous** sign-in method
3. Refresh page

### Issue: "Permission denied" error when submitting form

**Cause**: Firestore security rules blocking write

**Solution**:
1. Check security rules are published
2. Verify user is authenticated (check userId in console)
3. Temporarily switch to Test Mode for debugging (NOT for production)

### Issue: "CORS error" in console

**Cause**: Browser security policy blocking Firebase SDK

**Solution**:
1. Firebase CDN URLs must be accessible
2. Check network tab in DevTools
3. Ensure using HTTPS in production

### Issue: Form submits but no document appears in Firestore

**Cause**: Database not created or rules too restrictive

**Solution**:
1. Go to Firebase Console → **Firestore Database**
2. Verify database exists and is in **Active** state
3. Check security rules allow creation
4. Check browser console for detailed error

---

## 🔒 Security Best Practices

### For Development

```firestore-rules
match /builds/{buildId} {
  allow read, write: if true;  // ⚠️ UNSAFE - FOR TESTING ONLY
}
```

### For Production

```firestore-rules
match /builds/{buildId} {
  // Only allow authenticated users
  allow read: if request.auth != null && resource.data.userId == request.auth.uid;
  
  // Only allow creation with valid data
  allow create: if request.auth != null &&
                   request.resource.data.userId == request.auth.uid &&
                   request.resource.data.status == 'QUEUED' &&
                   has(['buildId', 'projectName', 'lfsVersion', 'email']);
  
  // Only admin can update status
  allow update: if request.auth.token.admin == true;
}
```

### Environment Variables

For backend services, never hardcode credentials:

```bash
# .env (DO NOT commit to git)
FIREBASE_PROJECT_ID=lfs-automated-builder
FIREBASE_PRIVATE_KEY_ID=key123...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=123456789...
```

---

## 📈 Monitoring & Analytics

### Enable Analytics

1. Go to Firebase Console → **Analytics**
2. Click **"Get Started"**
3. Link to your Google Analytics account
4. Track build submissions and user engagement

### View Usage

In Firebase Console:
- **Authentication**: Active users, sign-in methods
- **Firestore**: Document reads/writes, storage usage
- **Realtime Database**: Connections, bandwidth (if used)

---

## 🔄 Production Deployment

### Before Going Live

1. ✅ Switch Firestore from **Test Mode** to **Production Mode**
2. ✅ Review and publish security rules
3. ✅ Set up Firebase backups
4. ✅ Enable billing (required for production)
5. ✅ Set up monitoring and alerts
6. ✅ Configure Cloud Run service account with Firestore access

### Production Rules Example

```firestore-rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    match /builds/{buildId} {
      // Only authenticated users can read their builds
      allow read: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
      
      // Only users can create builds
      allow create: if request.auth != null &&
                       request.resource.data.userId == request.auth.uid &&
                       request.resource.data.buildId != null &&
                       request.resource.data.status == 'QUEUED' &&
                       request.resource.data.createdAt != null;
      
      // Only backend (service account) can update builds
      allow update: if request.auth.token.firebase.sign_in_provider == 'custom' ||
                       request.auth.uid == 'backend-service-account';
      
      // Builds cannot be deleted
      allow delete: if false;
    }
    
    // Backend service account can write to any collection
    match /{document=**} {
      allow read, write: if request.auth.uid == 'backend-service-account';
    }
  }
}
```

---

## 🎓 Next Steps

1. **Test locally**: Run `python3 -m http.server 8000` and test form submission
2. **Deploy to Cloud Run**: Use `gcloud run deploy` with your service
3. **Set up monitoring**: Create alerts for failed builds
4. **Configure backups**: Enable automated Firestore backups
5. **Add Cloud Functions**: Implement build processing triggers

---

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/rules)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)

---

## ✅ Setup Checklist

- [ ] Firebase project created
- [ ] Web app registered
- [ ] Firebase config obtained
- [ ] Anonymous authentication enabled
- [ ] Firestore database created
- [ ] Security rules published
- [ ] Frontend config updated
- [ ] Form submission tested locally
- [ ] Firestore document verified
- [ ] Console logs verified
- [ ] Ready for production deployment

---

**Last Updated**: November 5, 2025  
**Firebase SDK Version**: 10.7.0  
**Status**: Ready for Production
