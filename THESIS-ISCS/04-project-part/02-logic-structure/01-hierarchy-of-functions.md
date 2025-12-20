# 2.2.1 Hierarchy of Functions

<!-- Word count target: 600-800 words (2-3 pages) -->
<!-- Must include Figure 5 (Use Case Diagram) and Figure 6 (Function Hierarchy) -->

---

## Introduction to Functional Hierarchy Analysis

The functional hierarchy of the LFS Automated Build System represents a comprehensive decomposition of system capabilities across multiple architectural layers, spanning from user-facing interactions through backend orchestration to low-level build execution primitives. This hierarchical organization is fundamental to understanding how the system transforms user intent—embodied in a simple build submission request—into a complex cascade of operations involving cross-compilation toolchain bootstrapping, chroot environment isolation, package dependency resolution, and multi-stage compilation workflows that ultimately produce a bootable Linux From Scratch system artifact.

The architectural significance of this functional decomposition lies in its ability to bridge three distinct execution contexts that operate at fundamentally different abstraction levels. At the highest level, the Next.js-based learning platform provides rich, interactive user interfaces through React components that handle authentication flows via Firebase Auth, render educational content with syntax-highlighted code examples using Prism.js, and establish real-time data subscriptions to Firestore collections for monitoring build progress. This frontend layer encapsulates all user-facing functionality including the multi-step build wizard that validates configuration parameters, the terminal emulation subsystem powered by xterm.js that simulates bash command execution for educational purposes, and the comprehensive progress tracking dashboard that provides granular visibility into package-level compilation status through WebSocket-like Firestore listeners.

At the middleware layer, Firebase Cloud Functions serve as the critical orchestration backbone that mediates between the stateless frontend and the stateful build infrastructure. The `onBuildSubmitted` function, triggered by Firestore document creation events, implements a sophisticated state machine that transitions builds through well-defined lifecycle phases (SUBMITTED → PENDING → RUNNING → COMPLETED/FAILED) while enforcing quota policies, validating build configurations against LFS 12.0 specification constraints, and publishing build requests to Google Cloud Pub/Sub topics for asynchronous processing. This event-driven architecture ensures loose coupling between user interactions and resource-intensive compilation jobs, enabling horizontal scalability to support concurrent builds across multiple users while maintaining strict isolation guarantees through containerization.

The deepest architectural layer encompasses the actual LFS build execution environment, orchestrated through a meticulously designed hierarchy of Bash scripts that run within WSL2 (Windows Subsystem for Linux) on Windows hosts or natively on Linux systems. The PowerShell wrapper `BUILD-LFS-CORRECT.ps1` serves as the host-side entry point, invoking WSL-hosted scripts like `init-lfs-env.sh` that establish the critical `$LFS` environment variable pointing to `/mnt/lfs`, configure the cross-compilation target triplet `$LFS_TGT=x86_64-lfs-linux-gnu`, and set parallel make flags `MAKEFLAGS=-j$(nproc)` to maximize CPU utilization during compilation. The `build-lfs-complete-local.sh` script orchestrates the Chapter 5 toolchain build, methodically compiling the 18 foundational packages (Binutils Pass 1, GCC Pass 1, Linux API Headers, Glibc, Libstdc++) in strict dependency order, each with carefully tuned `./configure` flags like `--disable-shared` and `--with-sysroot=$LFS` that enforce host independence.

The chroot transition, managed by `chroot-and-build.sh`, represents the most architecturally significant state change in the entire build pipeline. This script binds critical virtual filesystems (`/dev`, `/proc`, `/sys`, `/run`) from the host into the `/mnt/lfs` root, then executes `sudo chroot "$LFS" /usr/bin/env -i` to create a hermetically sealed execution environment where the newly built toolchain compiles the final system packages (Chapter 6-8) using only its own libraries and headers, completely isolated from host system dependencies. Inside the chroot, `build-lfs-in-chroot.sh` drives the final compilation stages, implementing structured logging through `tee -a "$BUILDLOG"` to capture compilation output for post-mortem analysis, updating `CURRENT_BUILD_INFO.txt` with package-level status markers, and ultimately producing a minimal bootable system image deposited in `lfs-output/` for distribution.

This three-tier functional architecture (frontend React components → Firebase middleware → Bash/chroot build execution) embodies a deliberate separation of concerns that aligns with the ISCS methodological requirement for clear functional decomposition. Each layer operates at its natural abstraction level—the UI layer handles human interaction patterns, the middleware layer manages stateful coordination and resource scheduling, and the execution layer implements low-level compilation primitives—yet they interoperate seamlessly through well-defined interfaces (REST APIs, Firestore collections, filesystem artifacts) to deliver the system's core value proposition: making the notoriously complex LFS build process accessible, reproducible, and educational for students without deep Linux expertise.

---

## System Actors

The system interacts with the following external actors:

1. **End User (Authenticated)**: Individual accessing the learning platform and submitting builds
2. **Anonymous Visitor**: Unauthenticated user viewing public content
3. **System Administrator**: User with elevated privileges for system management
4. **Google Cloud Platform**: External cloud infrastructure providing compute, storage, database
5. **LFS Mirror Servers**: External servers hosting source package downloads
6. **Firebase Services**: Backend-as-a-Service provider (Authentication, Firestore, Functions)

---

## Use Case Diagram Description

**Primary Use Cases:**

### UC-1: User Authentication
- **Actor**: Anonymous Visitor, End User
- **Description**: User creates account or logs in using email/password or OAuth provider
- **Preconditions**: User has valid email or OAuth account
- **Main Flow**:
  1. User navigates to login page
  2. User enters credentials or selects OAuth provider
  3. System validates credentials with Firebase Auth
  4. System creates authenticated session
  5. User redirected to dashboard
- **Alternative Flow**: Registration for new users
- **Postconditions**: User session established, JWT token stored

### UC-2: Browse Learning Modules
- **Actor**: End User
- **Description**: User accesses structured LFS tutorials
- **Main Flow**:
  1. User navigates to learning platform
  2. System displays 8 module categories
  3. User selects module
  4. System displays content with code examples
  5. System tracks progress in Firestore
- **Includes**: UC-1 (User Authentication)

### UC-3: Practice Commands in Terminal
- **Actor**: End User
- **Description**: User interacts with browser-based terminal emulator
- **Main Flow**:
  1. User opens terminal interface
  2. System loads xterm.js emulator
  3. User types Linux commands
  4. System simulates command execution (read-only)
  5. System displays output
- **Includes**: UC-2 (Browse Learning Modules)

### UC-4: Submit Build Request
- **Actor**: End User
- **Description**: User initiates automated LFS build
- **Main Flow**:
  1. User navigates to build wizard
  2. User configures build parameters
  3. System validates configuration
  4. System creates Firestore build document
  5. System triggers Cloud Function (onBuildSubmitted)
  6. System displays build status page
- **Includes**: UC-1 (User Authentication)
- **Preconditions**: User authenticated, quota not exceeded

### UC-5: Monitor Build Progress
- **Actor**: End User
- **Description**: User observes real-time build status
- **Main Flow**:
  1. User accesses build status page
  2. System subscribes to Firestore updates
  3. System displays current status (PENDING/RUNNING/COMPLETED/FAILED)
  4. System streams logs as they arrive
  5. System updates progress bar
- **Includes**: UC-4 (Submit Build Request)
- **Extends**: Real-time log streaming

### UC-6: Download Build Artifacts
- **Actor**: End User
- **Description**: User retrieves successfully built artifacts
- **Main Flow**:
  1. User views completed build
  2. System generates signed GCS URL
  3. User clicks download link
  4. Browser downloads TAR archive from GCS
- **Includes**: UC-5 (Monitor Build Progress)
- **Preconditions**: Build status is COMPLETED

### UC-7: Execute Build in Cloud
- **Actor**: Google Cloud Platform (triggered by Cloud Function)
- **Description**: Automated LFS compilation in Docker container
- **Main Flow**:
  1. Cloud Function publishes Pub/Sub message
  2. Cloud Run instantiates Docker container
  3. Container executes `lfs-build.sh` orchestration script
  4. Script downloads source packages
  5. Script compiles packages in sequence
  6. Script uploads logs to Firestore
  7. Script uploads artifacts to GCS
  8. Container terminates
- **Triggered by**: UC-4 (Submit Build Request)

### UC-8: Manage System (Admin)
- **Actor**: System Administrator
- **Description**: Administrative system management
- **Main Flow**:
  1. Admin authenticates with admin role
  2. Admin accesses admin dashboard
  3. Admin views all builds, users, metrics
  4. Admin performs actions (cancel builds, adjust quotas)
- **Includes**: UC-1 (User Authentication)

---

**[INSERT FIGURE 15 HERE]**

**Figure 15. UML Use Case Diagram – LFS Automated Build System**

This UML Use Case Diagram (created in draw.io using standard UML notation with actors represented as stick figures and use cases as ellipses) provides a comprehensive visual representation of the eight primary system interactions and their relationships. The diagram positions the "LFS Automated Build System" boundary box at the center, with four actors positioned around the perimeter: End User (Authenticated) on the left, Anonymous Visitor on the upper left, System Administrator on the right, and external systems (Google Cloud Platform, LFS Mirror Servers, Firebase Services) on the bottom. Inside the boundary, eight use cases are arranged hierarchically: UC-1 (User Authentication) at the top center, UC-2 (Browse Learning Modules) and UC-3 (Practice Commands in Terminal) in the upper tier showing «include» relationships to UC-1, UC-4 (Submit Build Request) in the middle tier with an «include» to UC-2, UC-5 (Monitor Build Progress) with an «include» to UC-4, UC-6 (Download Build Artifacts) with an «include» to UC-5, UC-7 (Execute Local Build) with a «triggered by» relationship to UC-4, and UC-8 (Manage System) on the right with an «include» to UC-1. The diagram uses dashed arrows with «include» stereotypes to show mandatory sub-functionality relationships (e.g., browsing learning modules requires authentication) and solid arrows to represent actor-to-use-case associations (e.g., End User → Submit Build Request). The external system actors connect to UC-4 and UC-7 with dashed lines indicating system-to-system interfaces (Firebase Services validates authentication tokens, GCP executes cloud builds, LFS Mirror Servers provide source packages). Color-coding differentiates use case categories: blue for authentication/user management (UC-1), green for learning platform interactions (UC-2, UC-3), orange for build lifecycle operations (UC-4, UC-5, UC-6, UC-7), and purple for administration (UC-8). This diagram fulfills ISCS Requirement 4.2.1 by capturing all functional interactions described in Sections 4.2.1.1 through 4.2.1.8, demonstrating traceability to code implementations: UC-1 traces to `app/(dashboard)/auth/` components and Firebase Auth SDK calls, UC-2 to `app/learn/page.tsx` lines 40-120, UC-3 to `components/lfs/terminal.tsx` with xterm.js integration, UC-4 to `functions/index.js` lines 100-150 (`submitBuild` endpoint), UC-5 to `components/lfs/build-progress.tsx` with Firestore `onSnapshot` listeners, UC-6 to `helpers/gcs-uploader.js` artifact retrieval methods, UC-7 to `BUILD-LFS-CORRECT.ps1` and related bash scripts, and UC-8 to `app/admin/page.tsx` admin dashboard. The diagram serves as a high-level contract specification for stakeholder validation and developer implementation guidance.

---

## Hierarchy of Computerised Functions

**Figure 6** illustrates the functional decomposition:

```
LFS Automated Build System
│
├── 1. User Management
│   ├── 1.1 Registration
│   ├── 1.2 Authentication
│   ├── 1.3 Profile Management
│   └── 1.4 Session Management
│
├── 2. Learning Platform
│   ├── 2.1 Module Navigation
│   ├── 2.2 Content Rendering (Markdown)
│   ├── 2.3 Progress Tracking
│   ├── 2.4 Terminal Emulation
│   └── 2.5 Code Syntax Highlighting
│
├── 3. Build Management
│   ├── 3.1 Build Submission
│   │   ├── 3.1.1 Configuration Validation
│   │   ├── 3.1.2 Quota Enforcement
│   │   └── 3.1.3 Queue Management
│   ├── 3.2 Build Execution
│   │   ├── 3.2.1 Container Instantiation
│   │   ├── 3.2.2 Package Download
│   │   ├── 3.2.3 Compilation Orchestration
│   │   └── 3.2.4 Error Handling
│   ├── 3.3 Progress Monitoring
│   │   ├── 3.3.1 Status Updates
│   │   ├── 3.3.2 Log Streaming
│   │   └── 3.3.3 Resource Tracking
│   └── 3.4 Artifact Management
│       ├── 3.4.1 Artifact Upload to GCS
│       ├── 3.4.2 Metadata Storage
│       ├── 3.4.3 Signed URL Generation
│       └── 3.4.4 Retention Policy Enforcement
│
├── 4. Data Management
│   ├── 4.1 Firestore Operations
│   │   ├── 4.1.1 Read/Write Builds
│   │   ├── 4.1.2 Read/Write Build Logs
│   │   ├── 4.1.3 Read/Write User Progress
│   │   └── 4.1.4 Security Rule Enforcement
│   ├── 4.2 Cloud Storage Operations
│   │   ├── 4.2.1 Artifact Upload
│   │   ├── 4.2.2 Artifact Download
│   │   └── 4.2.3 Lifecycle Management
│   └── 4.3 Authentication Operations
│       ├── 4.3.1 Token Verification
│       ├── 4.3.2 User Lookup
│       └── 4.3.3 OAuth Integration
│
└── 5. Administration
    ├── 5.1 User Management
    ├── 5.2 Build Management
    ├── 5.3 Analytics Dashboard
    └── 5.4 System Configuration
```

---

## Functional Grouping Analysis

**Frontend Functions** (executed in browser):
- User interface rendering (Next.js React components)
- Form validation (build wizard)
- Real-time data subscription (Firestore listeners)
- Client-side routing (Next.js router)

**Backend Functions** (executed on GCP):
- Authentication (Firebase Auth)
- Database operations (Firestore)
- Build orchestration (Cloud Functions)
- Container execution (Cloud Run)
- Artifact storage (Cloud Storage)

**External Dependencies**:
- LFS source packages (kernel.org, gnu.org mirrors)
- OAuth providers (Google, GitHub)
- GCP infrastructure (compute, networking)

---

## Local Build Execution Functions (WSL/Bash Layer)

The actual LFS compilation is orchestrated through a sophisticated hierarchy of Bash scripts that operate within WSL2:

**5. Local Build Orchestration (PowerShell Entry Points)**
- **5.1** `BUILD-LFS-CORRECT.ps1`: Main entry wrapper for Windows hosts
  - **5.1.1** WSL distribution selection and validation
  - **5.1.2** Path translation (Windows → WSL mount points)
  - **5.1.3** Script execution delegation to bash
- **5.2** `CHECK_BUILD_STATUS.ps1`: Build progress monitoring
- **5.3** `ENTER-LFS-SHELL.ps1`: Interactive chroot session management

**6. Environment Initialization Functions (`init-lfs-env.sh`)**
- **6.1** LFS directory structure creation (`/mnt/lfs`, `/tools`, `/sources`)
- **6.2** Environment variable configuration
  - **6.2.1** `$LFS` root path establishment
  - **6.2.2** `$LFS_TGT` cross-compilation triplet definition
  - **6.2.3** `$PATH` prioritization for temporary toolchain
  - **6.2.4** `$MAKEFLAGS` parallel compilation optimization
- **6.3** Ownership and permission management (lfs user creation)
- **6.4** `/tools` symlink establishment

**7. Toolchain Build Functions (`build-lfs-complete-local.sh`)**
- **7.1** Package Download and Verification
  - **7.1.1** LFS 12.0 source tarball retrieval from mirrors
  - **7.1.2** SHA256 checksum validation
  - **7.1.3** Extraction to `$LFS/sources`
- **7.2** Binutils Pass 1 Compilation
  - **7.2.1** Configure with `--target=$LFS_TGT`, `--with-sysroot=$LFS`
  - **7.2.2** Parallel make execution
  - **7.2.3** Installation to `/tools`
- **7.3** GCC Pass 1 Compilation
  - **7.3.1** MPFR/GMP/MPC dependency integration
  - **7.3.2** Libstdc++ prerequisites
  - **7.3.3** Cross-compiler build with `--disable-shared`
- **7.4** Linux API Headers Installation
- **7.5** Glibc Cross-Compilation
- **7.6** Libstdc++ Pass 2 Compilation

**8. Chroot Transition Functions (`chroot-and-build.sh`)**
- **8.1** Virtual Filesystem Binding
  - **8.1.1** `/dev` bind mount for device access
  - **8.1.2** `/proc`, `/sys`, `/run` kernel interface mounts
  - **8.1.3** `/dev/pts` pseudo-terminal mount
  - **8.1.4** `/dev/shm` shared memory mount
- **8.2** Chroot Execution Environment Setup
  - **8.2.1** Clean environment creation (`env -i`)
  - **8.2.2** Minimal `$PATH` definition using only chroot tools
  - **8.2.3** Privilege escalation via `sudo chroot`
- **8.3** Build Script Invocation (`/build-lfs-in-chroot.sh`)
- **8.4** Cleanup and Unmounting on Completion

**9. In-Chroot Build Functions (`build-lfs-in-chroot.sh`)**
- **9.1** Final Toolchain Recompilation (Pass 2)
  - **9.1.1** GCC recompilation using chroot environment
  - **9.1.2** Binutils rebuild for host independence verification
- **9.2** System Package Compilation (Chapter 6-8)
  - **9.2.1** Coreutils, Bash, Sed, Grep (core utilities)
  - **9.2.2** Systemd, Udev (init system and device management)
  - **9.2.3** Python, Perl (scripting languages)
  - **9.2.4** Network tools (iproute2, dhcpcd)
- **9.3** Kernel Compilation (`build-bootable-kernel.sh`)
  - **9.3.1** Kernel configuration (`make menuconfig` or defaults)
  - **9.3.2** Kernel image build (`make bzImage`)
  - **9.3.3** Kernel modules compilation
  - **9.3.4** Installation to `/boot`
- **9.4** Bootloader Configuration (GRUB)
- **9.5** Structured Logging and Progress Tracking
  - **9.5.1** `$BUILDLOG` timestamped output capture
  - **9.5.2** `CURRENT_BUILD_INFO.txt` package status updates
  - **9.5.3** Error detection and early termination

**10. Artifact Management Functions**
- **10.1** Local Artifact Generation
  - **10.1.1** TAR archive creation from `/mnt/lfs`
  - **10.1.2** Metadata file generation (build-metadata-*.txt)
  - **10.1.3** Log file consolidation
- **10.2** Cloud Artifact Upload (when Firebase configured)
  - **10.2.1** Google Cloud Storage bucket initialization
  - **10.2.2** Signed URL generation for download links
  - **10.2.3** Firestore document updates with artifact references

---

## Cross-Layer Function Interactions

The system's architecture requires careful coordination across execution boundaries:

**Frontend ↔ Firebase Middleware**:
- React components submit build requests via Firestore SDK (`addDoc` to `builds` collection)
- Cloud Functions respond to Firestore triggers (`onCreate` for `builds/{buildId}`)
- Real-time updates flow through Firestore listeners (`onSnapshot` subscriptions)

**Firebase Middleware ↔ Build Execution**:
- Cloud Functions publish to Pub/Sub topics (`lfs-build-requests`)
- Cloud Run Jobs consume Pub/Sub messages and execute Docker containers
- Containerized `lfs-build.sh` logs to Firestore via `helpers/firestore-logger.js`

**Local Build (PowerShell ↔ WSL ↔ Chroot)**:
- PowerShell translates Windows paths to WSL mount points (`/mnt/c/...`)
- WSL bash scripts create chroot environment at `/mnt/lfs`
- Chroot execution isolates build from host using kernel namespacing

---

## Implementation Language Distribution

| Function Category | Implementation Language | Execution Environment |
|-------------------|------------------------|----------------------|
| Frontend UI | TypeScript + React | Browser (client-side) |
| Build Wizard | TypeScript + React | Browser (client-side) |
| Terminal Emulator | TypeScript + xterm.js | Browser (client-side) |
| Cloud Functions | JavaScript (Node.js) | Firebase Functions (GCP) |
| Build Orchestration | Bash Shell Scripts | WSL2 / Linux Host |
| PowerShell Wrappers | PowerShell 5.1+ | Windows Host |
| Containerized Build | Bash + Dockerfile | Docker / Cloud Run |
| Firestore Rules | Firebase Rules Language | Firebase Security |

This polyglot architecture maximizes each language's strengths: TypeScript provides type safety for complex frontend logic, JavaScript enables rapid serverless function development with Node.js ecosystem access, Bash offers unparalleled control over Linux build primitives, and PowerShell bridges Windows host automation, while Firebase Rules enforces declarative security policies at the data layer.

---

**[INSERT FIGURE 16 HERE]**

**Figure 16. System Context Diagram – LFS Build System in Enterprise Environment**

This system context diagram (created in draw.io using rounded rectangles for systems and solid arrows for data flows) illustrates how the LFS Automated Build System integrates within a broader enterprise infrastructure and interacts with six external entities. The central "LFS Automated Build System" box is positioned in the middle, containing three internal subsystems represented as nested boxes: "Learning Platform (Next.js)" at the top, "Firebase Middleware (Functions + Firestore)" in the center, and "Build Execution Layer (Bash + Chroot)" at the bottom, with bidirectional arrows showing their interactions (e.g., "Build Submission Request" flowing from Learning Platform to Firebase, "Real-time Progress Updates" flowing back). Six external entities surround the central system: "End User" on the left sending "HTTP Requests (Web UI)" and receiving "Build Status/Logs/Artifacts", "Google Cloud Platform" on the right providing "Compute (Cloud Run), Storage (GCS), Database (Firestore)" and receiving "API Calls + Billing", "LFS Mirror Servers" at the bottom-left providing "Source Packages (.tar.xz)" in response to "HTTP Download Requests", "Firebase Services" at the bottom-center exchanging "Auth Tokens, Firestore Writes, Function Invocations", "System Administrator" on the upper-right sending "Admin Commands" and receiving "Metrics/Logs", and "Windows/Linux Host OS" at the bottom-right providing "WSL2 Kernel, Filesystem Mounts, Process Isolation" to the Build Execution Layer. Each data flow arrow is labeled with specific protocols or data types (e.g., "HTTPS + JWT", "Pub/Sub Messages", "chroot syscalls", "Signed URLs for GCS"). The diagram uses color-coding to distinguish data flow types: blue for user-facing interactions, orange for cloud service integrations, green for build execution interfaces, and purple for administrative operations. This context diagram fulfills ISCS Requirement 4.2.1 by clearly demarcating the system boundary and showing that the LFS system does not operate in isolation—it relies on external package mirrors for source code, GCP for scalable infrastructure, Firebase for authentication and real-time data sync, and the host OS for low-level virtualization and filesystem primitives. The diagram traces to architectural decisions documented in Section 4.1.2 (Design Constraints): dependency on WSL2/Linux (Constraint 1) is visible through the "Windows/Linux Host OS" entity, cloud service reliance appears through the "Google Cloud Platform" entity, and security isolation (Constraint 5) is represented by the "chroot syscalls" flow. Code references include `functions/index.js` lines 60-250 (Firebase Middleware interactions), `BUILD-LFS-CORRECT.ps1` lines 1-200 (host OS automation), `build-lfs-complete-local.sh` lines 30-500 (LFS Mirror downloads via wget), and `lfs-learning-platform/app/` route handlers (End User HTTP endpoints). This diagram serves as a high-level communication tool for stakeholders unfamiliar with the technical implementation, showing how the system fits within existing IT infrastructure and depends on external services for core functionality.

---

<!-- 
EXTRACTION SOURCE:
- Use cases derived from user workflow documentation
- Function hierarchy extracted from:
  - `lfs-learning-platform/app/` (frontend structure)
  - `functions/index.js` (backend functions)
  - `lfs-build.sh` (build orchestration)
-->
