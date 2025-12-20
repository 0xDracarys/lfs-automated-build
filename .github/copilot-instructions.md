# Copilot Instructions for `lfs-automated-build`

## Architecture Overview

This is a **triple-purpose platform** automating Linux From Scratch (LFS 12.0) builds:
1. **Local-first build system**: Users build LFS on their own hardware (Linux/WSL) with full control
2. **Interactive learning platform**: Next.js frontend teaching LFS concepts with guided wizards
3. **Academic thesis project**: Bachelor's thesis for Vilnius University ISCS programme with comprehensive documentation

**Critical distinction**: The build system is LOCAL by design—scripts run on user machines, not in the cloud. Cloud infrastructure (Firebase/GCP) is ONLY for the learning platform (auth, progress tracking, optional remote builds).

### Three-Tier Architecture
```
┌─────────────────────────────────────────┐
│ Frontend (lfs-learning-platform/)       │
│ - Next.js 16 + React 19 + TypeScript    │
│ - Interactive wizard (app/install/)     │
│ - Lesson content (data/lessons.ts)      │
│ - Vitest tests (__tests__/)             │
└─────────────────────────────────────────┘
           ↓ (Firebase SDK)
┌─────────────────────────────────────────┐
│ Firebase Backend                         │
│ - Firestore: build metadata & logs      │
│ - Functions: Cloud Run job triggers     │
│ - Auth: user authentication             │
└─────────────────────────────────────────┘
           ↓ (Pub/Sub + Cloud Run Jobs)
┌─────────────────────────────────────────┐
│ Build Scripts (LOCAL or Cloud Run)      │
│ - lfs-build.sh: orchestrator            │
│ - helpers/: Firestore logging           │
│ - PowerShell: Windows/WSL automation    │
│ - installer/: Windows GUI installer     │
└─────────────────────────────────────────┘
```

### Fourth Component: Native Windows Installer
**Location**: `installer/`  
**Technology**: C# Windows Forms (.NET 8.0) + WiX Toolset for MSI packaging  
**Entry points**: 
- `LFSInstaller/Program.cs` - Main C# application
- `WiX/Product.wxs` - MSI installer configuration

**Purpose**: Professional native Windows installer with 5-step wizard using native dialog boxes (like Visual Studio/Chrome installers).

**Installation wizard flow**:
1. **Welcome Screen**: Introduction and admin rights check
2. **Prerequisites Check**: System requirements validation (Windows version, RAM, disk, CPU, virtualization)
3. **Configuration**: Installation path, Linux distro selection, build cores, shortcut options
4. **Progress**: Real-time installation with progress bar and log window
5. **Completion**: Success message with optional immediate launch

**Key features**:
- Native Windows Forms dialogs (NOT PowerShell GUI)
- Async/await for non-blocking operations
- WSL2 automated installation via `dism.exe` and `wsl --install`
- LFS environment configuration (`$LFS`, `$LFS_TGT`, etc.)
- Desktop and Start Menu shortcut creation
- Professional uninstaller via Add/Remove Programs
- System.Management for WMI queries (RAM, CPU detection)

**Build installer**:
```powershell
# Option 1: C# Self-Contained EXE (Recommended)
cd installer/LFSInstaller
dotnet publish --configuration Release --self-contained true --runtime win-x64
# Output: bin/Release/net8.0-windows/win-x64/publish/LFSBuilderSetup.exe

# Option 2: MSI Package with WiX
cd installer/WiX
candle Product.wxs -ext WixUIExtension
light Product.wixobj -ext WixUIExtension -out LFSBuilderSetup.msi
# Output: LFSBuilderSetup.msi
```

**Key classes**:
- `InstallationManager.cs`: Orchestrates installation stages with progress events
- `InstallationConfig.cs`: User configuration model
- `WelcomeForm.cs`, `PrerequisitesForm.cs`, `ConfigurationForm.cs`, `ProgressForm.cs`, `CompletionForm.cs`: Wizard forms

## Critical Environment Variables

**ALWAYS set these in build scripts** (see `build-chapter6-fixed.sh:6-9`):
```bash
export LFS=/mnt/lfs                        # Root of LFS filesystem
export LFS_TGT=x86_64-lfs-linux-gnu       # Target triplet for cross-compilation
export PATH=/tools/bin:/usr/bin:/bin      # Toolchain-first PATH
export MAKEFLAGS="-j$(nproc)"             # Parallel builds
```

**Frontend env vars** (`.env.local` in `lfs-learning-platform/`):
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=xxx          # Firebase web SDK config
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
GOOGLE_APPLICATION_CREDENTIALS=path.json  # Server-side Firebase Admin
```

## Key Workflows

### 1. Frontend Development
```bash
cd lfs-learning-platform
npm install                    # Install deps (Next.js 16, Tailwind 4, Framer Motion)
npm run dev                    # Start dev server (localhost:3000)
npm run build                  # Build for production
netlify deploy --prod          # Deploy to Netlify (live site)
```

**Frontend structure**:
- `app/`: Next.js App Router pages (`install/`, `learn/`, `dashboard/`)
- `components/wizard/`: Multi-step installation wizard components
- `lib/firebase.ts`: Firebase client SDK initialization (auth, Firestore)
- `lib/build-client.ts`: API client for triggering builds (interfaces with `/api/build`)

### 2. Local LFS Build (PowerShell → WSL)
**On Windows**, use PowerShell scripts that invoke WSL:
```powershell
.\BUILD-LFS-CORRECT.ps1        # Builds Chapter 6 tools via WSL
.\CHECK_BUILD_STATUS.ps1       # Monitors build progress
.\build-next-package.ps1       # Step-by-step package builds
```

**On Linux/WSL directly**:
```bash
# Set up environment (CRITICAL - do this first)
export LFS=/mnt/lfs
sudo mkdir -pv $LFS
sudo chown -v $USER $LFS

# Run main build orchestrator
bash lfs-build.sh              # Full build pipeline
# OR run specific stages
bash build-chapter6-fixed.sh   # Chapter 6 tools
bash build-bootable-kernel.sh  # Kernel + ISO creation
```

**Build script pattern** (see `lfs-build.sh:1-80`):
1. **Diagnostics first**: Log PATH, gcloud, node versions before any logic
2. **Validate LFS vars**: Fail early if `$LFS` or `$LFS_TGT` unset
3. **Source caching**: Downloads to `$LFS/sources`, check if exists before wget
4. **Firestore logging**: Use `helpers/firestore-logger.js` for remote tracking
5. **Cleanup on error**: `trap` handlers to unmount/cleanup on failure

### 3. Firebase Deployment
```bash
# Deploy Firestore rules (ALWAYS test locally first)
firebase deploy --only firestore:rules

# Deploy Cloud Functions (triggers Cloud Run jobs)
cd functions && npm install && cd ..
firebase deploy --only functions

# Test locally with emulators
firebase emulators:start       # Ports: Auth(9099), Firestore(8080), Functions(5001)
```

**Functions architecture** (`functions/index.js`):
- `onBuildSubmitted`: Firestore trigger → publishes to Pub/Sub topic `lfs-build-requests`
- `triggerBuildViaCloudRun`: HTTP endpoint → triggers Cloud Run Job `lfs-builder`
- **Uses Cloud Run Execution API** (not Cloud Build) for job orchestration

### 4. Testing
```bash
cd lfs-learning-platform
npm test                       # Vitest unit tests (__tests__/)
npm run test:coverage          # Generate coverage report
```

**Test patterns** (`lfs-learning-platform/vitest.config.ts`):
- Tests in `__tests__/**/*.test.{ts,tsx}`
- Setup file: `__tests__/setup.ts`
- Use `@testing-library/react` for component tests

## Project-Specific Patterns

### Build Script Naming Convention
- `build-*.sh`: Automated build scripts (e.g., `build-gcc-pass1.sh`)
- `BUILD-*.ps1`: Windows entry points (e.g., `BUILD-LFS-CORRECT.ps1`)
- `*-chapter*.sh`: Stage-specific scripts (e.g., `build-chapter6-fixed.sh`)
- `test-*.sh`: Validation scripts (e.g., `test-toolchain.sh`)

### Firestore Schema
```javascript
// builds/{buildId}
{
  userId: string,
  projectName: string,
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED',
  startTime: Timestamp,
  endTime: Timestamp?,
  config: { /* LFS build options */ }
}

// buildLogs/{logId}
{
  buildId: string,
  stage: string,           // e.g., 'chapter5', 'kernel'
  timestamp: Timestamp,
  message: string
}
```

**Security**: Firestore rules (`firestore.rules`) are WIDE OPEN (`allow read, write: if true`) for `/builds` and `/buildLogs`—tighten for production!

### TypeScript Interfaces (Frontend)
Key types in `lib/build-client.ts`:
```typescript
interface BuildOptions {
  kernelVersion?: string;
  optimization?: string;
  options?: {
    includeKernel?: boolean;
    includeNetwork?: boolean;
  };
}

interface BuildResponse {
  success: boolean;
  buildId: string;
  message: string;
  config: any;
}
```

### Component Patterns
**Wizard pattern** (`app/install/page.tsx`):
- Multi-step form with localStorage persistence
- Platform detection (Windows vs Linux) for command adaptation
- Copyable command blocks with `CommandBlock.tsx` component

**React Server Components**: Use `'use client'` directive only when needed (state, browser APIs, Framer Motion).

## Common Pitfalls

### 1. LFS Path Confusion
❌ **Wrong**: `export LFS=/home/user/lfs` (arbitrary path)  
✅ **Correct**: `export LFS=/mnt/lfs` (standard LFS convention)

### 2. Cross-Compilation Target
❌ **Wrong**: `LFS_TGT=$(uname -m)-linux-gnu` (missing `-lfs-`)  
✅ **Correct**: `LFS_TGT=x86_64-lfs-linux-gnu`

### 3. PowerShell WSL Invocation
❌ **Wrong**: `wsl bash build-script.sh` (no absolute path)  
✅ **Correct**: `wsl -d Athena bash -c "chmod +x '/mnt/c/...path/script.sh' && bash '/mnt/c/...path/script.sh'"`

### 4. Firebase Client vs Admin SDK
- **Client SDK** (`firebase`): Use in `lfs-learning-platform/` for browser
- **Admin SDK** (`firebase-admin`): Use in `functions/` and `helpers/` for server
- **Never mix**: Don't import both in the same file

## Integration Points

### Frontend → Backend
1. User submits build in wizard → POST to `/api/build` (Next.js API route)
2. API route creates Firestore doc in `/builds/{buildId}`
3. Firestore trigger fires `onBuildSubmitted` function
4. Function publishes to Pub/Sub OR triggers Cloud Run Job
5. Cloud Run Job executes `lfs-build.sh` with config from env var `LFS_CONFIG_JSON`

### Build Scripts → Firestore
```bash
# Log to Firestore from Bash (uses Node.js helper)
node /app/helpers/firestore-logger.js "$BUILD_ID" "chapter5" "RUNNING" "Building GCC..."
```

**Helper dependencies** (`helpers/package.json`): `firebase-admin`, `@google-cloud/storage`

## Quick Reference

### Key Files
- `lfs-build.sh`: Main orchestrator (80+ lines of diagnostics)
- `BUILD-LFS-CORRECT.ps1`: Windows entry point
- `functions/index.js`: Cloud Functions (Pub/Sub, Cloud Run API)
- `lfs-learning-platform/lib/firebase.ts`: Firebase client init
- `docs/LOCAL-LFS-BUILD-ARCHITECTURE.md`: Detailed architecture doc
- `installer/LFSInstaller/Program.cs`: Native Windows installer entry point
- `installer/INSTALLER-ARCHITECTURE.md`: Installer design and workflow documentation
- `installer/BUILD-GUIDE.md`: How to build the installer (dotnet/WiX)

### Key Directories
- `THESIS-ISCS/`: Bachelor's thesis content (Vilnius University ISCS)
  - `00-initial-pages/` through `08-annexes/`: Thesis chapters
  - `diagrams/`: UML diagrams, flowcharts, architecture diagrams
  - `screenshots/`: UI screenshots for thesis documentation
- `installer/`: Native Windows installer components
  - `LFSInstaller/`: C# Windows Forms project (.NET 8.0)
    - `Forms/`: WelcomeForm, PrerequisitesForm, ConfigurationForm, ProgressForm, CompletionForm
    - `Core/`: InstallationManager, InstallationConfig
  - `WiX/`: MSI installer configuration (Product.wxs)
- `helpers/`: Node.js helpers (firestore-logger.js, gcs-uploader.js)
- `lfs-learning-platform/`: Next.js frontend application

### Essential Commands
```bash
# Check LFS environment
echo $LFS $LFS_TGT $PATH | grep -q "/tools/bin" && echo "OK" || echo "MISSING"

# Verify toolchain (after Chapter 5)
echo 'int main(){}' | $LFS_TGT-gcc -xc -
readelf -l a.out | grep ld-linux    # Should show /lib64/ld-linux-x86-64.so.2

# Deploy everything
cd lfs-learning-platform && netlify deploy --prod    # Frontend
firebase deploy --only functions,firestore:rules     # Backend
```

---

**See** `README.md` for build instructions, `docs/LOCAL-LFS-BUILD-ARCHITECTURE.md` for architecture deep-dive.

## Thesis-Specific Workflows

### Working with THESIS-ISCS Documentation

**Directory structure** (Vilnius University ISCS format):
```
THESIS-ISCS/
├── 00-initial-pages/          # Title pages, ToC, abbreviations
├── 01-introduction/           # Research problem, objectives, methods
├── 02-analytical-part/        # Problem analysis, requirements
├── 03-technical-task/         # Formal specification (24 FRs)
├── 04-project-part/           # System design, UML diagrams
├── 05-software-implementation/ # Implementation details
├── 06-conclusions/            # Results, evaluation
├── 07-final-pages/            # References, appendices
├── 08-annexes/                # Source code samples
├── diagrams/                  # Mermaid.js diagrams
└── screenshots/               # UI screenshots for figures
```

**Key thesis patterns**:
- All sections reference specific **Functional Requirements (FN-X)** and **Non-Functional Requirements (NFR-X)**
- Use **Lithuanian + English** bilingual terminology (see `00-initial-pages/06-list-of-abbreviations.md`)
- Screenshots must map to specific tables/figures (see `UPDATED-SCREENSHOT-REQUIREMENTS.md`)
- UML diagrams use **Mermaid.js** syntax (see `MERMAID-DIAGRAM-CODES.md`)

**Generating thesis artifacts**:
```bash
# Create diagrams (Mermaid.js in diagrams/)
cd THESIS-ISCS/diagrams
# Edit .mmd files, render with VS Code Mermaid plugin

# Capture screenshots for figures
cd lfs-learning-platform
npm run dev
# Navigate to pages specified in PRECISE-SCREENSHOT-LOCATIONS.md

# View thesis structure
cat THESIS-ISCS/INDEX.md       # Master index
cat THESIS-ISCS/README.md      # Status tracker
```

**When editing thesis content**:
- Maintain **ISCS methodological requirements** (see `ISCS_Methodological_requirements.txt`)
- Cross-reference functional requirements (24 FRs across 4 categories)
- Include **Table X** and **Figure X** captions following ISCS format
- Verify against `FUNCTIONAL-REQUIREMENTS.md` and `NON-FUNCTIONAL-REQUIREMENTS.md`