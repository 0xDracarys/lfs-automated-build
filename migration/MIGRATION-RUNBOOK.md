# Migration Runbook — move the LFS cloud pipeline to a new account (free trial)

**Source of truth:** project `alfs-bd1e0` (frozen, nothing is deleted).
**Target:** a NEW Google account → NEW project → free trial ($300 credit / 90 days).

This whole runbook exists because of two lessons learned on the old project — **both are baked into the deploy script below so you cannot forget them**:

1. **Link the billing account FIRST, before any deploys** (an unlinked/non-active billing account silently disables Artifact Registry serving → every Cloud Run job fails to pull the image with a confusing "does not have permission to read the image" error).
2. **Grant the Cloud Run service agent unconditional image-read roles right after the first API enablement** (`roles/storage.objectViewer` + `roles/artifactregistry.reader` on `service-<PROJECT_NUMBER>@serverless-robot-prod.iam.gserviceaccount.com`). The auto-grant on new projects is condition-bound and expires — that exact expired grant is what killed the Cloud Run job.

---

## Before you start (know what the build costs)

| Item | Cost | Covered by trial? |
|---|---|---|
| Full cloud LFS build (1 job, 8 vCPU / 32 GiB, ~4 h) | **≈ $10–15 total** | ✅ trivially, by the $300 credit |
| Smoke test (1–2 min, `ENABLE_FULL_BUILD=false`) | ≈ $0.02 | ✅ |
| Idle project (nothing running) | $0 | ✅ |
| Firestore, Cloud Shell, Cloud Build (120 min/day) | free tier | ✅ |

⚠️ Trial rules: sign-up needs a **payment card**, Google allows **one trial per person/payment method** — if your card is already tied to a trial, use a different card. If no trial is offered at all, pay-as-you-go still works: the whole thesis build is ≈ $13.

---

## Phase A — New account & project (you, in the browser, ~10 min)

1. **Sign up for Google Cloud free trial** on the NEW Google account: https://console.cloud.google.com/onboarding/welcome → *"Start for free"*. (Card needed, no charge during trial.)
2. **Create the project**: Console → project selector → *New Project* → name e.g. `lfs-thesis` → note the **Project ID** (e.g. `lfs-thesis-175042`). From here called `NEW_PROJECT_ID`.
3. **Verify billing is linked and active** (lesson #1): Console → ☰ Billing → it must say the project is linked to an active billing account. Check with:
   `gcloud billing projects describe NEW_PROJECT_ID` (in Cloud Shell) → expect `billingEnabled: true`.

## Phase B — Transport the repo to Cloud Shell (free, ~5 min)

The **entire rebuild recipe is in your git repo** (Dockerfile.cloudrun, cloudbuild.yaml, lfs-build.sh, helpers/, functions/, firebase.json). The SA key is gitignored, so pushing is safe.

- Option 1 (recommended): from the repo, `git push origin main` (11 local commits go up), then in **Cloud Shell** (☰ top-right icon): `git clone <your-repo-url>` → `cd lfs-automated`.
- Option 2 (no push): zip the repo folder, Cloud Shell → ⋮ menu → *Upload* → `unzip lfs-automated.zip`.

## Phase C — Deploy everything (script does it, ~15 min)

```bash
cd lfs-automated
export NEW_PROJECT_ID=lfs-thesis-XXXX      # your new project ID
bash migration/deploy-in-cloudshell.sh
```
The script (all steps print what they do):
1. `gcloud config set project`
2. Enables the 10 required APIs (Cloud Run, Cloud Build, Artifact Registry, Firestore, Pub/Sub, Cloud Functions, Eventarc, Storage, Functions, Logging)
3. **Billing precheck** — refuses to continue if billing isn't active
4. Grants the two **unconditional** reader roles to the Cloud Run service agent (lesson #2) and verifies they exist without conditions
5. Creates Firestore (Native mode, `us-central1`) + bucket `NEW_PROJECT_ID-builds`
6. Builds the builder image from `Dockerfile.cloudrun` via Cloud Build → `Artifact Registry` (`us-central1-docker.pkg.dev/NEW/lfs/lfs-builder`)
7. Creates the Cloud Run **job** `lfs-builder` with the exact old spec: 8 vCPU / 32 GiB / 10 h timeout / maxRetries 1 / GEN2 / default compute SA / `ENABLE_FULL_BUILD=true`
8. Deploys the Cloud Function (the pub/sub pipeline) with `firebase-tools`
9. Prints the **smoke-test command** (your approval gate — it never runs a build automatically)

## Phase D — Point the local app at the new project (~10 min)

1. **New key for the app**: Console → IAM & Admin → Service Accounts → `NEW-<project-number>-compute@...` (or create a firebase-admin SA) → *Keys → Add key → JSON* → save over `functions/service-account.json` after renaming the old one to `functions/service-account-alfsbd1e0.json` (keep it; never commit).
2. **`.env.local` in `lfs-learning-platform/`** — change only:
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID` → NEW project ID (and the matching Firebase **web-app config** keys — Firebase console → project settings → web app → copy config)
   - the credentials path the server admin SDK uses → path of the new key file
3. Optional — restore old data (4 builds + 7 users, preserving IDs):
   ```bash
   node migration/firestore-import.js --restore-data
   ```
   Add `--mark-stuck-failed` to also mark `7hyDLDipTBVAzObyzRRT` FAILED in the new DB (recommended — clean board, no RUNNING 50% zombie).

## Phase E — Verify (the same smoke as today, on healthy footing)

```bash
gcloud run jobs execute lfs-builder --region us-central1 \
  --update-env-vars ENABLE_FULL_BUILD=false,BUILD_ID=smoke-$(date +%s) --wait
gcloud run jobs executions describe <execution> --region us-central1  # or watch logs
```
Success looks like: *"LFS BUILD SCRIPT STARTING"* → *"Firestore access verified"* → tool checks → fast exit.
A full build is only ever run deliberately (each run ≈ $13 against the trial credit).

---

## What was exported and where it lives

| Old-project asset | Captured as |
|---|---|
| Cloud Run job template (verbatim) | `migration/data/cloud-run-job-spec.json` |
| 61 enabled APIs (full list) | `migration/data/enabled-apis.txt` |
| Firestore `builds` (4 docs) + `users` (7) | `migration/data/firestore/*.json` |
| Last successful Cloud Build record (June 2026, 20 successes) | `migration/data/last-successful-build.txt` |
| GCS `alfs-bd1e0-builds` | empty — nothing to copy |
| Image `gcr.io/alfs-bd1e0/lfs-builder` | NOT copied (registry is billing-gated) — **rebuilt from `Dockerfile.cloudrun` in Phase C** |

`migration/data/` is gitignored — it stays local; nothing personal or sensitive is pushed.

## Old project — aftercare (decide later, do nothing today)

- Leave `alfs-bd1e0` frozen as reference; nothing deleted, nothing replaced.
- Once the new project passes its smoke, you may delete the OLD SA key (IAM → the old key file's SA → Keys) — its JSON on disk is then inert. This is optional hygiene.
- You will likely never need to pay on the old account: it hosts only stale state.

## Hardcoded references found for the record (all optional to change — env vars override them)

`functions/index.js` (fallback project/bucket literals), `functions/check-job.js`, `functions/get-logs.js`, `helpers/clear-builds.js`, `lfs-build.sh` fallbacks, `cloudbuild-test.yaml`, `deploy-vulnbox-pipeline.sh`, `docs/MANUAL_MONITORING.md`. None need changing for the migration to work; the deploy script injects the right values as env.
