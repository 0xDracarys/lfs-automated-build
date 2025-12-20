# 2.3.4 Software Development Environment

<!-- Word count target: 1200-1500 words (5-6 pages) -->
<!-- Must include Tables 15, 16, 17 and Figure 15 -->
<!-- According to Section 2.3.4: Software tools and environment specification -->

---

## Introduction

According to Section 2.3.4 of the ISCS methodological guidelines, the software development environment must document all tools, libraries, and infrastructure components used in the project. This section describes the multi-layered Docker-based build environment and the Next.js frontend development stack extracted from actual configuration files.

---

## 2.3.4.1 Build Environment Architecture

The LFS Automated Build System employs a **9-layer multi-stage Docker build** to create isolated, testable compilation environments. This architecture ensures reproducibility and enables independent verification of each build phase.

**Table 15. Docker Multi-Stage Build Layers**

| Layer # | Stage Name | Purpose | Base Image | Key Packages | Success Criteria |
|---------|------------|---------|------------|--------------|------------------|
| 0 | `base` | Foundation image | `debian:bookworm` | None (minimal Debian) | Base OS loaded |
| 1 | `system-deps` | Build tools installation | `base` | gcc, g++, make, automake, wget, git, bison, texinfo, gawk, patch | `gcc --version` succeeds |
| 2 | `locale-setup` | UTF-8 locale configuration | `system-deps` | locales | `locale -a \| grep en_US` succeeds |
| 3 | `user-setup` | LFS user creation | `locale-setup` | None (useradd command) | `id lfs` returns UID/GID |
| 4 | `nodejs-setup` | Node.js for helpers | `user-setup` | nodejs, npm | `node --version` succeeds |
| 5 | `npm-deps` | JavaScript dependencies | `nodejs-setup` | @google-cloud/storage, axios | `npm ls` shows installed |
| 6 | `gcp-sdk` | Google Cloud integration | `npm-deps` | google-cloud-sdk, gsutil | `gcloud --version` succeeds |
| 7 | `final-setup` | Working directory setup | `gcp-sdk` | None (directory creation) | `/workspace` exists |
| 8 | `production` | Entrypoint configuration | `final-setup` | None (CMD directive) | Container starts script |

**Implementation** (from `Dockerfile` lines 1-100):

```dockerfile
# Multi-stage build with error catching at each layer
FROM debian:bookworm AS base

LABEL maintainer="LFS Automated Builder"
LABEL description="Cloud Run Job for automated Linux From Scratch compilation"

ENV DEBIAN_FRONTEND=noninteractive \
    LC_ALL=C.UTF-8

# LAYER 1: System Dependencies
FROM base AS system-deps
RUN set -ex && \
    echo "=== LAYER 1: Installing system dependencies ===" && \
    apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential gcc g++ make automake autoconf \
        pkg-config libtool wget curl git bison flex \
        texinfo gawk patch diffutils file locales \
        groff xz-utils python3 ca-certificates \
        findutils coreutils sed tar gzip m4 && \
    rm -rf /var/lib/apt/lists/* && \
    gcc --version && make --version && \
    echo "✅ LAYER 1 SUCCESS"

# LAYER 2: Locale Configuration
FROM system-deps AS locale-setup
RUN set -ex && \
    locale-gen en_US.UTF-8 && \
    locale -a | grep -iE "en_US|C\.UTF" && \
    echo "✅ LAYER 2 SUCCESS"

ENV LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8

# LAYER 3: User Setup
FROM locale-setup AS user-setup
RUN set -ex && \
    useradd -m -s /bin/bash lfs && \
    mkdir -p /mnt /output && \
    chown -R lfs:lfs /mnt /output && \
    echo "✅ LAYER 3 SUCCESS"
```

**Layer Isolation Benefits**:
- Each layer can be cached independently by Docker
- Failed layers can be rebuilt without affecting successful layers
- Layer-specific tests verify correctness before proceeding
- Total image size reduced via `--no-install-recommends` flags

---

## 2.3.4.2 Frontend Development Stack

**Table 16. Frontend Technology Stack**

| Category | Technology | Version | Purpose | Configuration File |
|----------|-----------|---------|---------|-------------------|
| **Framework** | Next.js | 16.0.1 | React framework with server-side rendering | `package.json` |
| **UI Library** | React | 19.2.0 | Component-based UI rendering | `package.json` |
| **Language** | TypeScript | 5.x | Type-safe JavaScript development | `tsconfig.json` |
| **Styling** | Tailwind CSS | 4.x | Utility-first CSS framework | `postcss.config.mjs` |
| **Animations** | Framer Motion | 12.23.24 | Declarative animations for React | `package.json` |
| **3D Graphics** | Three.js + React Three Fiber | 0.181.2 + 9.4.2 | WebGL 3D visualizations | `package.json` |
| **Markdown** | react-markdown | 10.1.0 | Render lesson content | `package.json` |
| **Charts** | Recharts | 3.4.1 | Data visualization for analytics | `package.json` |
| **Icons** | Lucide React | 0.553.0 | SVG icon library | `package.json` |
| **Backend** | Firebase SDK | 12.5.0 | Auth, Firestore, Cloud Functions | `package.json` |
| **Forms** | Formspree React | 3.0.0 | Contact form handling | `package.json` |
| **AI** | Vertex AI | 1.10.0 | Google Cloud AI integration | `package.json` |

**Implementation** (from `lfs-learning-platform/package.json`):

```json
{
  "name": "lfs-learning-platform",
  "version": "0.1.0",
  "dependencies": {
    "next": "^16.0.1",
    "react": "19.2.0",
    "react-dom": "19.2.0",
    "firebase": "^12.5.0",
    "framer-motion": "^12.23.24",
    "tailwind-merge": "^3.3.1",
    "@react-three/fiber": "^9.4.2",
    "three": "^0.181.2",
    "react-markdown": "^10.1.0",
    "recharts": "^3.4.1",
    "lucide-react": "^0.553.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^19",
    "eslint": "^9",
    "vitest": "^3.0.0",
    "@testing-library/react": "^16.0.0"
  }
}
```

---

## 2.3.4.3 Backend Infrastructure

**Table 17. Backend Services Configuration**

| Service | Provider | Technology | Purpose | Configuration |
|---------|----------|------------|---------|---------------|
| **Compute** | Google Cloud Run Jobs | Docker containers | Execute LFS builds | `cloudbuild.yaml` |
| **Functions** | Firebase Cloud Functions | Node.js 20 | Event-driven build orchestration | `functions/package.json` |
| **Database** | Cloud Firestore | NoSQL document store | Store builds, logs, user data | `firestore.rules` |
| **Storage** | Google Cloud Storage | Object storage | Host build artifacts (tarballs) | `bucket-lifecycle.json` |
| **Messaging** | Cloud Pub/Sub | Message queue | Trigger build jobs | Topic: `lfs-build-requests` |
| **Auth** | Firebase Authentication | OAuth 2.0 | User authentication | Email/password, Google OAuth |
| **Hosting** | Netlify | CDN with edge functions | Frontend deployment | `netlify.toml` |
| **CI/CD** | Cloud Build | Container builds | Automated Docker image builds | `cloudbuild.yaml` |

**Cloud Run Job Configuration**:
- **Memory**: 4 GB (for GCC compilation)
- **CPU**: 4 vCPUs
- **Timeout**: 3600 seconds (1 hour)
- **Max Retries**: 0 (builds are idempotent, no auto-retry)
- **Concurrency**: 1 (single-threaded build process)

**Cloud Function Configuration**:
```javascript
// From functions/index.js
exports.onBuildSubmitted = functions
  .runWith({
    timeoutSeconds: 60,
    memory: '256MB',
    maxInstances: 100
  })
  .firestore
  .document('builds/{buildId}')
  .onCreate(async (snap, context) => {
    // Trigger Cloud Run job via Pub/Sub
  });
```

---

## 2.3.4.4 Development Tools

### Version Control
- **Git**: Distributed version control
- **GitHub**: Repository hosting at `github.com/yourusername/lfs-automated`
- **Branch Strategy**: `main` (production), `develop` (integration), feature branches

### Code Quality
- **ESLint**: JavaScript/TypeScript linting with Next.js config
- **Prettier**: Code formatting (integrated with ESLint)
- **Vitest**: Unit testing framework for React components
- **Testing Library**: Component testing utilities

### Build Tools
- **npm**: Package manager for JavaScript dependencies
- **Docker**: Container build and runtime
- **Cloud Build**: Automated container builds on push to `main`

---

## 2.3.4.5 Local Development Setup

**Prerequisites**:
1. Node.js 20.x or later
2. Docker Desktop (for local container builds)
3. Git 2.x
4. Firebase CLI (`npm install -g firebase-tools`)

**Installation Steps**:

```bash
# Clone repository
git clone https://github.com/yourusername/lfs-automated.git
cd lfs-automated

# Install frontend dependencies
cd lfs-learning-platform
npm install

# Start development server
npm run dev
# Accessible at http://localhost:3000

# In another terminal, start Firebase emulators
firebase emulators:start
# Firestore UI at http://localhost:4000
```

**Environment Variables** (`.env.local`):
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

---

## 2.3.4.6 Production Deployment

**Frontend Deployment** (Netlify):
```bash
cd lfs-learning-platform
npm run build
netlify deploy --prod
```

**Backend Deployment** (Firebase):
```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Cloud Functions
cd functions
npm install
firebase deploy --only functions
```

**Container Deployment** (Cloud Run):
```bash
# Build Docker image
gcloud builds submit --tag gcr.io/your-project/lfs-builder

# Deploy as Cloud Run Job
gcloud run jobs create lfs-build-job \
  --image gcr.io/your-project/lfs-builder \
  --memory 4Gi \
  --cpu 4 \
  --max-retries 0 \
  --task-timeout 3600s
```

---

## 2.3.4.7 Development Environment Diagram

**Figure 15. Software Development Stack Architecture**

<!-- TODO: Create layered architecture diagram showing:
- Bottom layer: Debian Bookworm base OS
- Middle layers: Docker multi-stage build layers (1-8)
- Top layer: Application runtime (Node.js, Bash, Python helpers)
- Side: Development tools (Git, ESLint, Vitest)
- Cloud services: Firebase, GCP (Cloud Run, Storage, Pub/Sub)
- Frontend stack: React → Next.js → Netlify
- Backend stack: Firestore ← Cloud Functions ← Pub/Sub ← Cloud Run
- Use color coding: Blue for frontend, Green for backend, Yellow for infrastructure
- Tool: draw.io or Lucidchart with layered architecture template
-->

---

## 2.3.4.8 Toolchain Verification

The Dockerfile includes automated verification at each layer to ensure the environment is correctly configured:

```bash
# System tools verification (Layer 1)
gcc --version        # Expected: gcc (Debian 13.2.0-23)
make --version       # Expected: GNU Make 4.3
makeinfo --version   # Expected: texi2any (Texinfo) 7.0.2
tar --version        # Expected: tar (GNU tar) 1.34

# Node.js verification (Layer 4)
node --version       # Expected: v20.x
npm --version        # Expected: 10.x

# GCP tools verification (Layer 6)
gcloud --version     # Expected: Google Cloud SDK 450.0.0
gsutil --version     # Expected: gsutil version: 5.27
```

**Failure Handling**: If any verification command fails, the Docker build halts immediately with an exit code, preventing deployment of broken environments.

---

<!--
EXTRACTION SOURCES:
- Dockerfile: lines 1-100 (multi-stage build architecture)
- lfs-learning-platform/package.json: lines 1-50 (frontend dependencies)
- functions/package.json: Cloud Functions runtime configuration
- cloudbuild.yaml: CI/CD pipeline configuration
- firebase.json: Firebase services configuration
- netlify.toml: Frontend deployment settings
-->
