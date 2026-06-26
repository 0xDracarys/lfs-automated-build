# LFS Automated Cloud Build - Pre-Flight Checklist

This checklist documents the critical architectural requirements for a successful Linux From Scratch (LFS) compilation inside Google Cloud Run. Before deploying new changes, ensure these rules are followed, or run `VALIDATE-CLOUD-BUILD.ps1` to automate these checks.

## 1. Dockerfile Script Inclusions (The Missing File Problem)
If `lfs-build.sh` (or any script it calls) invokes another script via `bash "${SCRIPT_DIR}/new-script.sh"`, you MUST:
- [ ] Add `COPY new-script.sh /app/` to `Dockerfile.cloudrun`
- [ ] Add `COPY new-script.sh /app/` to `Dockerfile`
- [ ] Ensure `RUN chmod +x /app/*.sh` is present in both Dockerfiles AFTER all COPY commands.

## 2. Environment Variables & Paths
Cloud Run executes the script in an isolated container. It does NOT have access to your local Windows environment.
- [ ] **No Local Paths:** Scripts must not reference `C:\` or `/mnt/c/`.
- [ ] **LFS Root:** All scripts must respect `$LFS_MNT` (which defaults to `/mnt/lfs` inside the container).
- [ ] **Google Cloud Paths:** The container uses `/usr/bin/gcloud`, make sure the script `$PATH` includes this (already configured in Layer 8/9).

## 3. Node.js & Helper Dependencies
The Cloud Run builder relies on a Node.js helper (`helpers/firestore-logger.js`) to stream logs back to Firestore.
- [ ] Ensure `helpers/package.json` exists.
- [ ] Ensure `helpers/package.json` lists `firebase-admin` as a dependency.
- [ ] Ensure the Dockerfile runs `cd /app/helpers && npm install --production`.

## 4. Syntax Verification
Bash scripts running in the cloud should be syntactically valid before uploading.
- [ ] Run `bash -n script.sh` on any modified shell scripts to catch unclosed quotes or syntax errors.

## 5. Artifact Packaging
Once the build completes, the output must be compressed and uploaded to GCS.
- [ ] Ensure `package-lfs-outputs.sh` is copied into the Dockerfile.
- [ ] Ensure `GCS_BUCKET_NAME` is exported in the `ENTRYPOINT` or `ENV` of the Dockerfile so the packaging script knows where to upload the final artifacts.
