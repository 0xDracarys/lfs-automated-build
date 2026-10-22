# Cloud Path Fix — Phase 3 report (2026‑10‑22)

**Goal:** make the designed Google Cloud pipeline actually build LFS images (Cloud Run Job `lfs-builder`, project `alfs-bd1e0`).
**Method:** read-only API probes + one approved-but-blocked IAM change attempt. Strictly no resource creation, no builds, no secrets printed.

---

## What the old theory got wrong

| Old belief (from Oct 20 notes) | Now verified reality |
|---|---|
| "Cloud Run job DID start, but its identity couldn't write Firestore" | The job **never started** — all four conditions (ContainerReady / ResourcesAvailable / Started / Completed) are `CONDITION_FAILED` with *"must have permission to read the image"*; **0 log entries** exist. The failure happened at image-pull, before container boot. |
| "IAM gap = builder SA's Firestore roles" | The **builder SA** (`92549920661-compute@developer.gserviceaccount.com`, correctly set in the job template) already holds `roles/datastore.user`, `roles/editor`, `roles/storage.objectAdmin`, `eventarc.eventReceiver` — Firestore writes and GCS uploads were **never the problem**. |
| — | The real missing permission belongs to a **different identity**: the **Cloud Run Service Agent** (`service-92549920661@serverless-robot-prod.iam.gserviceaccount.com`), whose only storage role is the binding that was time-limited and expired: `storage.objectViewer` with condition `request.time < timestamp("2025-11-06...")` (title "developer-connect-connection-setup"). |

## Supporting evidence

- **Image exists:** 20 successful Cloud Build runs pushed `gcr.io/alfs-bd1e0/lfs-builder`; latest June 21, 2026 (all SUCCESS).
- **Job template healthy:** image `gcr.io/alfs-bd1e0/lfs-builder:latest`, 8 vCPU / 32 GiB, task timeout **36000 s (10 h)**, `maxRetries=1`, `serviceAccount` explicitly the compute default SA, `ENABLE_FULL_BUILD=true`, GEN2 environment. Nothing to repair here.
- **New blocker #2 discovered:** GCR token endpoint, Artifact Registry, and Cloud Functions APIs all return **"requires billing to be enabled"** for project `alfs-bd1e0` (direct probes; the `cloudbilling.googleapis.com` API itself is unreachable from this key/endpoint). Cloud Run + Storage + Cloud Build reads still respond normally. If billing was detached/disabled recently, **no execution can ever charge compute time**, regardless of IAM.
  - (The expired conditional binding alone explains the Oct 20 failure; the billing state is an additional, separately-verified blocker that must be checked in the console.)
- **Attempted programmatic IAM grant was denied** (`403 Policy update access denied`) with the available service-account key. That is expected: policy-editing (`setIamPolicy`) is deliberately not part of `Editor` — it requires Owner / Security Admin / Project IAM Admin. This must be a console action performed by you.

## Exact fixes (console, ~5 minutes)

### 1. IAM — restore image-read for the Cloud Run service agent
1. Open: **https://console.cloud.google.com/iam-admin/iam?project=alfs-bd1e0**
2. Click "Grant access" (or the pencil next to the existing principal).
3. Principal: `service-92549920661@serverless-robot-prod.iam.gserviceaccount.com`
4. Add BOTH roles (safe, minimal, standard):
   - *Storage Object Viewer* (`roles/storage.objectViewer`)
   - *Artifact Registry Reader* (`roles/artifactregistry.reader`)
5. Save. Propagation is usually ≤ 1 minute. The old expired conditional binding can remain — it harms nothing.

### 2. Billing — confirm it is active
1. Open: **https://console.cloud.google.com/billing?project=alfs-bd1e0**
2. If no billing account is shown as active/linked, link one (this is required for any cloud execution; building images in GCR and running Cloud Run Jobs are billable — an idle project charges nothing).
3. If a suspended/disabled billing account is displayed, reactivate it or link a different one.

## Test plan (after the two console steps)

1. **Verify (read-only):** re-run `gcp-probe.js` — expectation: the execution conditions message unchanged for old execution; the *new* execution must show conditions progressing.
2. **Smoke run (~1–2 min compute):** `jobs:run` with correct env (`LFS_CONFIG_JSON`, `GCS_BUCKET=alfs-bd1e0-builds`, `BUILD_ID=smoke-<timestamp>`, `ENABLE_FULL_BUILD=false` to avoid a multi-hour build). Expect: image pulls → boot diagnostics ("LFS BUILD SCRIPT STARTING") → `verify_firebase` prints "Firestore access verified" (proves the SA can read Firestore through `gcloud`) → tool checks → fast-exit with the "placeholders disabled" marker (by design for a smoke).
3. **Report loop proof:** read the *new* execution's Cloud Logging entries + any `buildLogs` collection writes. If those succeed, the cloud build path is functionally restored end-to-end up to the real compilation stage.
4. Only after that: decide when to spend on a real (2–3 h / 8 vCPU) cloud build.

## Files used (all in OpenCode temp folder, outside the repo)
`gcp-probe.js`, `gcp-probe2.js`, `gcp-probe3.js`, `gcp-probe4.js`, `gcp-probe5.js`, `image-probe.js`, `grant-run-agent.js` (denied by IAM policy; kept for re-running verification).
