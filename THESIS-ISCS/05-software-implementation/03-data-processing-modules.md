# 03. Data Processing Modules

This section explains the backend logic for build orchestration, including Cloud Functions, helper scripts, and the main build script. These modules automate LFS Chapter 5 builds and ensure robust error handling (Beekmans & Burgess, 2023; Google Cloud, 2024).

## Cloud Functions

- **onBuildSubmitted** (`functions/index.js`): Firestore trigger that updates build status and publishes to Pub/Sub. Key logic:
```js
// ...existing code...
await db.collection('builds').doc(buildId).update({ status: 'PENDING' });
await pubsub.topic('lfs-build-requests').publishMessage({ data: buildConfig });
// ...existing code...
```
This enables asynchronous build execution and real-time status updates (Google Cloud, 2024).

## Helper Scripts

- **firestore-logger.js**: Writes structured logs to Firestore, supporting traceability and debugging. Example:
```js
// ...existing code...
admin.firestore().collection('buildLogs').add({ buildId, stage, status, message });
// ...existing code...
```

- **gcs-uploader.js**: Uploads build artifacts to Google Cloud Storage, tagging with metadata for reproducibility.

## Build Script

- **lfs-build.sh**: Orchestrates the LFS Chapter 5 toolchain build. Implements error codes (1000-3099) and status transitions. Example:
```bash
# ...existing code...
if [ $? -ne 0 ]; then
  log_error "Compilation failed for $package"
  exit 1301
fi
# ...existing code...
```
This ensures failures are logged and surfaced to the dashboard (see Table 13).

## Rationale

Automated backend processing is essential for scaling and reliability. Cloud Functions and scripts work together to fulfill Objectives 1 and 4 (automation, reproducibility).

## Figure Reference

Figure 12: Build pipeline orchestration derived from lfs-build.sh Chapter 5 wrapper; see diagrams/figure-12.png.

*Citation: Google Cloud. (2024). Cloud Functions Documentation. https://cloud.google.com/functions/docs*