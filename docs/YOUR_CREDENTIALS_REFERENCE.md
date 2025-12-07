# 🔐 YOUR CREDENTIALS REFERENCE (KEEP SECURE!)

**Created**: November 5, 2025  
**Status**: DO NOT SHARE THESE CREDENTIALS!

---

## 🔑 MAIN PROJECT

```
Project ID: alfs-bd1e0
Project Name: alfs-firebase
```

---

## 👤 SERVICE ACCOUNTS

### Service Account 1: Firebase Service
```
Email: alfs-firebase-service@alfs-bd1e0.iam.gserviceaccount.com
Unique ID: 107365546643781777850
Project: alfs-bd1e0
```

### Service Account 2: LFS Builder
```
Email: lfs-builder-service-account@alfs-477317.iam.gserviceaccount.com
Project: alfs-477317
```

---

## 🔐 OAUTH CLIENT CREDENTIALS

```
Client ID: 
92549920661-qtlcva684qaosdtddlc8om9d8potmf79.apps.googleusercontent.com

Client Secret: 
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

Creation Date: 5 November 2025, 12:35:27 GMT-2

Status: ✅ Enabled
```

⚠️ **IMPORTANT**: Save this client secret! You won't be able to see it again after you close the dialog!

---

## 📌 NOTES

1. You have TWO different project IDs - need to clarify which is main
2. OAuth is restricted to test users (see OAuth consent screen)
3. Save the `client_secret_*.json` file downloaded from Google

---

## 🚀 NEXT: Push Docker Image

Use your **main project ID**: `alfs-bd1e0`

```powershell
$PROJECT_ID = "alfs-bd1e0"
docker push gcr.io/${PROJECT_ID}/lfs-builder:latest
```

---

**⚠️ SECURITY**: Don't commit this file to GitHub!  
**⚠️ BACKUP**: Save the OAuth client secret somewhere safe!
