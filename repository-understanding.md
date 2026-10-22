# Repository Understanding — lfs-automated

*A plain-language tour of this repository, written for a beginner.*

---

## 1. What type of application is this?

This is a **full-stack web application + automated build pipeline** called the
**Linux From Scratch (LFS) Builder**.

It does three related things:

1. **Teaches** — a website ("learning platform") with lessons that walk a student
   through building their own Linux operating system from source code.
2. **Builds** — it can actually *compile a complete Linux system* for the user,
   either in the cloud (Google Cloud Run) or on a local machine, using
   PowerShell/Bash scripts. The result is downloadable files: a `.tar.gz`
   tarball, a bootable `.iso`, or a Windows installer (`.exe`).
3. **Tracks** — users log in with Firebase, and their lesson progress and build
   history are saved in a Firestore database.

There is also a newer feature called **VulnBox** (a "vulnerable box" — an
intentionally vulnerable Linux environment builder, likely for security
training), with its own wizard page and API endpoints.

A thesis (PDF/TXT files like `Shubham_bhasker_Thesis.txt`) confirms this is an
academic capstone/research project.

---

## 2. What programming languages does it use?

| Language | Where it's used |
|---|---|
| **TypeScript / TSX (React)** | The entire web app in `lfs-learning-platform/` (frontend + its API routes) |
| **JavaScript** | Firebase Cloud Functions (`functions/index.js`), helper scripts (`helpers/`), small Node tools |
| **Bash (shell)** | All the LFS build scripts at the repo root (`lfs-build.sh`, `build-*.sh`, `vulnbox-build.sh`, …) |
| **PowerShell** | Windows automation (`BUILD-LFS-CORRECT.ps1`, `START-LFS-BUILD.ps1`, `installer/`) |
| **Docker / YAML / JSON** | Container definitions and cloud configs (`Dockerfile`, `cloudbuild.yaml`, `render.yaml`, `firebase.json`, `netlify.toml`) |
| **Markdown** | Documentation (`README.md`, `docs/`, `lfs-learning-platform/public/docs/`) |

---

## 3. Where is the frontend?

**`lfs-learning-platform/`** — a **Next.js 16** app (App Router) with React 19.

- `app/` — every page/post-routable folder: home page, `learn/`, `build/`,
  `downloads/`, `docs/`, `commands/`, `dashboard/`, `auth/`, `admin/`,
  `about/`, `contact/`, `research/`, `terminal/`, `vulnbox/`
- `components/` — React components (navigation, landing page, build wizard,
  AI chat, 3D penguin, etc.)
- `contexts/AuthContext.tsx` — current logged-in user
- `lib/data/` — lesson content (`modules.ts` etc.)
- Styling: Tailwind CSS 4 + Framer Motion + Three.js (3D penguin)

It is deployed to **Vercel** (also has Netlify config, but `.vercel/` is present).

---

## 4. Where is the backend?

The backend is spread over a few places (this is a "serverless-ish" project,
not one big server folder):

1. **Next.js API routes** — `lfs-learning-platform/app/api/…`
   The Next.js app itself is also the backend server. Each `route.ts` file
   there is one HTTP endpoint (see §11).
2. **Firebase Cloud Functions** — `functions/index.js`
   Firestore triggers that fire when a build document is written; they publish
   to Pub/Sub and kick off the Cloud Run build job.
3. **Build scripts** — the many Bash scripts at the repo root. These run inside
   the Docker container on the build machine (Cloud Run or locally) and are
   the "real" heavy backend (see §5).
4. **PowerShell orchestration** — `installer/` + `*.ps1` scripts automate the
   local Windows build flow.

---

## 5. Where is the LFS builder?

**`lfs-build.sh`** (repo root) is the **main build script** — it's the entrypoint
that the Cloud Run container (`Dockerfile` + `docker-entrypoint.sh`) runs.
Supporting scripts:

| File | Purpose |
|---|---|
| `lfs-build.sh` | Main pipeline: reads config, logs to Firestore, runs chapters 5 & 6+ & 8, uploads results |
| `lfs-chapter5-real.sh` | Builds the cross-toolchain (Binutils, GCC 1st pass, etc.) |
| `build-gcc-pass1.sh`, `build-glibc.sh`, `build-linux-headers.sh`, `build-libstdcpp.sh` | Individual core-tool builds |
| `build-minimal-bootable.sh` | Builds a smaller, bootable system |
| `prepare-chroot.sh`, `enter-lfs-shell.sh` / `ENTER-LFS-SHELL.ps1` | Enter the build environment |
| `init-lfs-env.sh` | Sets up the environment (also spawned by the Next.js dev runner) |
| `vulnbox-build.sh`, `Dockerfile.vulnbox` | The VulnBox variant build |
| `lfs-12.0-toolchain.tar.gz`, `lfs-system.tar.gz` etc. | Pre-built cached toolchain/system artifacts |

---

## 6. Which files start the application?

- **`package.json` (repo root)** — the umbrella `npm` scripts (they just `cd`
  into the platform and run its scripts, plus Firebase commands).
- **`lfs-learning-platform/package.json`** — the real app scripts
  (`dev`, `build`, `start`, `test`).
- **`Dockerfile` (repo root)** — container that runs `lfs-build.sh` (the cloud build).
- **`lfs-learning-platform/Dockerfile`** — container for the web app itself.
- **`docker-entrypoint.sh`** — entrypoint used inside the build container.
- **Firebase config** (`firebase.json`, `.firebaserc`) — for emulators/deploys.

---

## 7. What commands start the application?

Run from the repo root (Node 24):

```bash
# Start the learning platform in dev mode (both of these work:)
npm run dev                                     # root → runs platform's dev
cd lfs-learning-platform && npm run dev         # direct

# Production build + serve (web app)
cd lfs-learning-platform
npm run build && npm run start

# Run the tests (Vitest)
cd lfs-learning-platform && npm run test

# Firebase Functions build / Firebase emulators / deploy  (from repo root)
npm run build:functions
npm run serve           # firebase emulators:start
npm run deploy
```

Local Windows cloud-build helpers (PowerShell, *not* the web app):
`START-LFS-BUILD.ps1`, `BUILD-LFS-CORRECT.ps1`, `MONITOR_BUILD.ps1`,
`CHECK_BUILD_STATUS.ps1`.

---

## 8. What ports does it use?

| Port | What |
|---|---|
| **3000** | Next.js dev server (`next dev`) — default, not overwritten anywhere |
| **8080** | Web app in Docker (`lfs-learning-platform/Dockerfile`: `ENV PORT=8080`, `EXPOSE 8080`) — also the Cloud Run convention |
| **5000** | Firebase Hosting emulator |
| **5001** | Firebase Functions emulator |
| **8080** | Firestore emulator |
| **9099** | Firebase Auth emulator |

---

## 9. What database does it use?

**Google Firestore** (Firebase's NoSQL document database). There is **no SQL
database** in this project.

- Collections store: users & progress, lesson records, build records + logs,
  command-reference/API-usage stats.
- Timeline: **client SDK** (`lfs-learning-platform/lib/firebase.ts`) for browser
  reads; **Admin SDK** (`lfs-learning-platform/lib/firebase-admin.ts`,
  `functions/index.js`, root `firebase-admin` dependency) for server writes.
- Rules/indexes: `firestore.rules`, `firestore.indexes.json` (repo root and in
  the platform folder).
- Helper CLI: `helpers/firestore-admin.js` (list/get/set/delete docs).

Also uses file-system storage for results — see the next section.

---

## 10. What Google Cloud services does it use?

| Service | Used for |
|---|---|
| **Firebase Auth** | Login (Google OAuth + email/password) |
| **Firestore** | Database (above) |
| **Cloud Functions for Firebase** | `functions/index.js` — build status triggers, starts the Cloud Run job via Pub/Sub |
| **Google Cloud Run (Jobs)** | The big LFS build container (job `lfs-builder`, region `us-central1`, 8 vCPU / 32 GB) |
| **Cloud Storage** | Artifacts: `lfs-system.tar.gz`, bootable ISO, toolchain tarballs, installer |
| **Pub/Sub** | `lfs-build-requests` topic connecting Functions → Cloud Run job |
| **Cloud Build** | `cloudbuild.yaml`, `cloudbuild-web.yaml`, `/api/cloud-build` webhook |
| **Vertex AI (Gemini)** | The in-app AI tutor (`/api/ai/chat`, dependency `@google-cloud/vertexai`) |
| **googleapis / google-auth-library** | Auth for talking to these APIs |

⚠️ Security note: `functions/service-account.json` and `auth.json` exist locally
but are **correctly Git-ignored** (they are NOT tracked in Git). Don't commit them.

---

## 11. Where are the API endpoints defined?

All HTTP endpoints are **Next.js route handlers** under
**`lfs-learning-platform/app/api/`** (one `route.ts` per folder):

| Endpoint | File | What it does |
|---|---|---|
| `POST /api/lfs/trigger` | `app/api/lfs/trigger/route.ts` | Starts a build (currently runs it **locally** via `LfsRunner`) |
| `GET /api/lfs/status`, `/api/lfs/status/[buildId]` | `app/api/lfs/status/` | Poll build progress/logs (Firestore) |
| `POST /api/lfs/cancel`, `/api/lfs/cancel/[buildId]` | `app/api/lfs/cancel/` | Cancel a running build |
| `GET /api/build` | `app/api/build/` | Firestore/Firebase Admin build-record management |
| `POST /api/cloud-build` | `app/api/cloud-build/` | Cloud Build webhook (used by the `/build` page's CloudBuildForm) |
| `GET /api/docs/[...slug]` | `app/api/docs/` | Serves Markdown documentation from `public/docs/` |
| `GET /api/commands` | `app/api/commands/` | LFS command reference lookup |
| `POST /api/ai/chat` | `app/api/ai/chat/route.ts` | AI assistant (Vertex AI Gemini) |
| `/api/chat` | `app/api/chat/` | Another chat endpoint |
| `/api/progress` | `app/api/progress/` | User learning progress |
| `/api/activities` | `app/api/activities/` | User activity records |
| `/api/notify` | `app/api/notify/` | Notifications |
| `GET/POST /api/support/hr` | `app/api/support/hr/` | Support/helpdesk feature |
| `/api/vulnbox` | `app/api/vulnbox/` | VulnBox builds (security playground) |

Server-side Firebase Cloud Functions (`functions/index.js`) are a separate,
second set of "endpoints" triggered by Firestore events rather than HTTP.

---

## 12. Where are the frontend API requests defined?

Client-side `fetch()` calls live in these files:

| File | Calls |
|---|---|
| `lfs-learning-platform/lib/build-client.ts` | `POST /api/build`, `GET /api/build?buildId=…` |
| `lib/services/ai-service.ts`, `lib/services/ai-enhanced.ts` | `POST /api/ai/chat` |
| `components/ai-chat-improved.tsx` | `POST /api/ai/chat` |
| `components/BuildTicker.tsx` | `GET /api/lfs/status` (live status ticker) |
| `app/build/[buildId]/page.tsx` | `GET /api/lfs/status/[buildId]`, `POST /api/lfs/cancel/[buildId]` |
| `components/cloud-build/CloudBuildForm.tsx` (used by `app/build/page.tsx`) | `POST /api/cloud-build` |
| `app/docs/[...slug]/page.tsx` | `GET /api/docs/<path>` |
| `components/vulnbox/VulnBoxWizard.tsx` | `POST /api/vulnbox` |
| `lib/hooks/useSupportHR.ts` | `GET/POST /api/support/hr` |
| `app/learn/[moduleId]/[lessonId]/page.tsx` | records API usage against `/api/progress` |

---

## 13. Where are the tests?

| Location | Framework | Content |
|---|---|---|
| `lfs-learning-platform/tests/integration.test.ts` | Vitest | Integration test |
| `lfs-learning-platform/__tests__/` | Vitest + Testing Library | `app.test.tsx`, plus **property-based tests** in `__tests__/wizard/` (command copy, platform detection, progress bar, script generator, stage data/prereqs/reset, wizard storage) using `fast-check` |
| `lfs-learning-platform/vitest.config.ts`, `__tests__/setup.ts` | — | Test configuration |
| `test-build-submission.js` (root) | Plain Node | API/build-submission smoke test |
| `test-entrypoint.sh`, `test-toolchain.sh`, `VALIDATE-LFS-ENV.sh` (root) | Bash | Build-environment validation scripts |

Run unit tests with: `cd lfs-learning-platform && npm run test`
(the `npm run test:coverage` flag exists too).

---

## How the project appears to work — beginner summary

1. **You open the website** (Next.js app). The home page introduces the project;
   there are lessons (`/learn`), docs (`/docs`), a searchable Linux command
   reference, a downloads page, and a build page.
2. **You sign in** with Firebase (Google or email/password). Your account and
   your lesson progress are stored in Firestore. Some pages only load if
   you're logged in (protected routes).
3. **The big idea:** instead of spending 6+ hours compiling Linux locally, you
   click a button on the `/build` page and the *cloud* builds your Linux for you.
4. **What happens on that click:** the page calls a backend endpoint. An API
   route writes a "build" record in Firestore; a Firebase Cloud Function
   notices it, sends a message over **Pub/Sub**, and starts a **Cloud Run Job**.
   That job is a Docker container running `lfs-build.sh`.
5. **Inside the container,** the Bash script downloads the source code of ~100
   packages and compiles them step by step — first a toolchain (compiler,
   linker, C library), then the system tools, then the Linux kernel — exactly
   following the LFS Book 12.0. Progress is logged to Firestore. The finished
   system is packaged into a `.tar.gz` and a bootable `.iso` and uploaded to
   **Cloud Storage**.
6. **Meanwhile, the website** polls the status endpoint every few seconds and
   shows live logs and a progress bar. When the status becomes "complete",
   download links appear.
7. **You download your own Linux** as a tarball (for WSL), as an ISO (boot in
   VirtualBox/real hardware), or as a Windows installer. The `installer/`
   folder contains the Windows installer that imports this into WSL2 for you.
8. **Optional:** an AI assistant in the corner answers your Linux questions
   using Google's Gemini AI (Vertex AI), and the newer **VulnBox** feature lets
   you build an intentionally-vulnerable Linux box for security practice.

In one sentence: **a teaching website for building Linux from scratch, backed by
a cloud build pipeline that actually does the (very long) compilation for you.**
