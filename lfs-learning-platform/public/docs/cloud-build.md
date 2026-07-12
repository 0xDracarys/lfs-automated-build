---
title: Cloud Build Orchestration & Monitoring Notes
description: Internal engineering notes on Google Cloud Build integration, container orchestration, and real-time build monitoring.
---

# Cloud Build Orchestration & Monitoring

This engineering note documents Sentinel AI's integration with **Google Cloud Build** (`cloudbuild.yaml`) and Firestore telemetry.

---

## Cloud Build Pipeline Flow

1. **Trigger Initiation**: A user submits a build request via the `/build` portal.
2. **Container Spin-Up**: Cloud Build initializes a high-CPU container environment (`n1-highcpu-8`).
3. **Multi-Stage Build**:
   - Compiles cross-toolchain in `/mnt/lfs/tools`
   - Enters `chroot` and compiles native Linux filesystem
   - Builds kernel `bzImage`
4. **Artifact Archiving**: The completed system tarball (`lfs-system.tar.gz`) is uploaded directly to Google Cloud Storage.

---

## Live Monitoring Commands

To stream logs from a running cloud build job:

```bash
gcloud builds log <BUILD_ID> --stream
```

Or run our automated monitor script:

```bash
./MONITOR_BUILD.ps1 -BuildId <BUILD_ID>
```
