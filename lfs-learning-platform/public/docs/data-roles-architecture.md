---
title: Sentinel AI Data Roles & System Architecture
description: Overview of platform permission tiers, Firestore role hierarchies, and essential links for cloud, databases, and version control.
---

# Data Roles & System Architecture Reference

This reference describes the security role hierarchy for data access and lists all critical architecture URLs, consoles, and repositories.

---

## 1. Security & Data Role Tiers

The platform enforces three distinct levels of authorization to ensure data integrity and access control.

| Role Tier | Access Scope | Protected Routes | Firestore Security Permissions |
| :--- | :--- | :--- | :--- |
| **Guest / Anonymous** | Public information, landing, guides, download assets | `/`, `/about`, `/contact`, `/downloads`, `/install`, `/docs` | Read-only on `/modules` and `/lessons`. Cannot write progress. |
| **Learner (Authenticated)** | Core interactive platform, sandbox terminal, custom builds, stats | `/learn`, `/dashboard`, `/terminal`, `/commands`, `/build` | Read/write access on `/users/{uid}` and `/userProgress/{uid}`. |
| **Administrator** | Overall user learning activity, platform analytics, API monitoring | `/admin` (Analytics Dashboard) | Complete read/write access. Modules and lessons write capability. |

---

## 2. Firestore Rule Implementation

Role security is configured via [firestore.rules](file:///c:/Users/jayma/Documents/Bhasker/Projects/lfs-automated/lfs-learning-platform/firestore.rules):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    match /userProgress/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 3. Important URLs & Architecture References

### Environment Tiers
- **Local Dev Server**: `http://localhost:3000` (Starts via `npm run dev`)
- **Render Production Service**: `https://dashboard.render.com/` (Orchestrates live Node.js web services)

### Database & Auth Consoles
- **Firebase Console**: [Firebase console for project alfs-bd1e0](https://console.firebase.google.com/project/alfs-bd1e0)
  - Manages Firestore database, Firebase Authentication, and Cloud Functions.
- **Google Cloud Console**: [Google Cloud Console](https://console.cloud.google.com/)
  - Manages Cloud Build API, Cloud Storage buckets (`alfs-bd1e0.appspot.com` / build triggers), and container images.

### Source Control & Repositories
- **GitHub Repository**: [0xDracarys/lfs-automated-build](https://github.com/0xDracarys/lfs-automated-build.git)
  - Holds code for both the automated build script pipeline and Next.js frontend learning platform.
