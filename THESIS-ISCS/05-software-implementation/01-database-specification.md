# 01. Database Specification

This section details the Firestore database schema powering the LFS Automated Build system. The schema is designed for scalability, real-time observability, and secure multi-user access (Firebase, 2024).

## Firestore Collections

- **builds**: Stores each build submission. Key fields: `buildId`, `userId`, `projectName`, `lfsVersion`, `status`, `submittedAt`, `pendingAt`, `completedAt`, `artifactUrl`. Status transitions (SUBMITTED → PENDING → RUNNING → COMPLETED/FAILED) are enforced by Cloud Functions (Google Cloud, 2024).
- **buildLogs**: Real-time logs for each build. Fields: `buildId`, `timestamp`, `stage`, `status`, `message`, `source`. Enables granular tracking and debugging (see helpers/firestore-logger.js).
- **users**: User profiles. Fields: `userId`, `email`, `displayName`, `role`, `photoURL`, `preferences`. Used for authentication and access control (Firebase, 2024).
- **lessonProgress**: Tracks user learning progress. Fields: `userId`, `lessonId`, `completed`, `timeSpent`, `quizScore`.
- **quizResults**: Stores quiz submissions. Fields: `userId`, `lessonId`, `score`, `submittedAt`.
- **analytics**: Aggregated system metrics. Fields: `metricId`, `type`, `value`, `timestamp`.

## Indexes and Security

Indexes are defined in `firestore.indexes.json` to optimize queries for dashboard statistics and build artifact lookups. Security rules (see Annex 3) restrict write access to authenticated users and service accounts (Firebase, 2024).

## Example Document (builds)
```json
{
  "buildId": "eM2w6RRvdFm3zheuTM1Q",
  "userId": "auth_uid_12345",
  "projectName": "my-first-lfs",
  "lfsVersion": "12.0",
  "status": "COMPLETED",
  "submittedAt": 1699234567890,
  "completedAt": 1699238567890,
  "artifactUrl": "gs://lfs-automated-builds/builds/eM2w6RRvdFm3zheuTM1Q/lfs-tools-12.0.tar.gz"
}
```

## Rationale

Firestore was chosen for its real-time capabilities, flexible schema, and seamless integration with Firebase Auth (Firebase, 2024). This supports the thesis objective of real-time build observability and secure multi-user access (see Introduction Objective 3).

## Figure Reference

Figure 15: Firestore schema diagram showing collections, key fields, and relationships. See diagrams/figure-15.png.

*Citation: Firebase. (2024). Cloud Firestore Documentation. Google Firebase. https://firebase.google.com/docs/firestore*