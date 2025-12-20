# Functional Requirements

## 1. User Authentication and Authorization

### 1.1 User Registration
The system shall support user registration with email and password credentials. Upon registration, the system shall validate email format, enforce password strength requirements (minimum 8 characters, including uppercase, lowercase, and numbers), and send email verification links. User accounts shall be stored in Firebase Authentication with unique user identifiers.

### 1.2 OAuth Authentication
The system shall support OAuth 2.0 authentication through Google and GitHub identity providers. Users shall be able to sign in using their existing Google or GitHub accounts without creating separate credentials. The system shall retrieve user profile information (name, email, avatar) from OAuth providers and store it in Firestore.

### 1.3 Session Management
The system shall maintain persistent user sessions across browser sessions using Firebase Authentication tokens. Session tokens shall expire after 1 hour of inactivity, requiring re-authentication. The system shall provide a "Remember Me" option to extend session duration to 30 days.

### 1.4 Role-Based Access Control
The system shall enforce role-based access control with two roles: standard users and administrators. Standard users shall access build submission, monitoring, and learning modules. Administrators shall additionally access system metrics, user management, and manual build control. Role assignments shall be stored in Firestore user documents.

---

## 2. Build Submission and Configuration

### 2.1 Web-Based Build Submission
Users shall submit LFS build requests through a web form interface located at `/build`. The form shall present build configuration options including target architecture (x86_64, aarch64), optional components (kernel, networking tools), and optimization levels (default, performance, size-optimized).

### 2.2 Build Configuration Validation
The system shall validate all build configurations before acceptance. Validation checks shall include: supported architecture verification, valid option combinations, available build capacity, and user quota limits. Invalid configurations shall be rejected with specific error messages guiding users to correct their inputs.

### 2.3 Build Queue Management
When build execution resources are unavailable, the system shall queue build requests in Firestore with PENDING status. Queued builds shall be processed in first-in-first-out order. Users shall receive notifications when their queued builds begin execution. The maximum queue length shall be 50 requests.

### 2.4 Local Build Configuration Export
Users on the installation wizard page (`/install`) shall generate platform-specific build scripts for local execution. The system shall detect the user's operating system (Windows, Linux, macOS) and generate appropriate scripts (PowerShell for Windows, Bash for Linux/macOS) with pre-configured environment variables and package sources.

---

## 3. Automated Build Execution

### 3.1 LFS Chapter 5 Build Automation
The system shall execute LFS 12.0 Chapter 5 toolchain builds without manual intervention. Build execution shall follow the official LFS book sequence: binutils pass 1, GCC pass 1, Linux API headers, glibc, libstdc++, binutils pass 2, GCC pass 2, and remaining toolchain packages (18 total packages). Build scripts (`build-lfs-complete-local.sh`, `chroot-and-build.sh`) shall orchestrate this sequence.

### 3.2 Source Package Management
The system shall download source packages from official LFS mirrors specified in `wget-list-sysv`. Before compilation, the system shall verify package integrity by comparing MD5 checksums against `md5sums` file. Failed checksum verification shall abort the build with a detailed error message. Downloaded packages shall be cached in `$LFS/sources` to avoid re-downloading on subsequent builds.

### 3.3 Dependency Order Enforcement
The system shall execute build steps in correct dependency order as specified by LFS 12.0 documentation. Critical dependencies such as building glibc only after GCC pass 1 shall be enforced through script sequencing. The build orchestrator shall verify prerequisite packages are successfully installed before proceeding to dependent packages.

### 3.4 Build Failure Handling
When a package build fails, the system shall immediately halt execution, log the error details (exit code, stderr output, failing command), and update build status to FAILED. The system shall preserve the build environment state to enable debugging. Users shall receive failure notifications with links to relevant log sections and recovery instructions.

### 3.5 Environment Isolation
Local builds shall execute within isolated chroot environments under `/mnt/lfs`. Environment variables `$LFS`, `$LFS_TGT`, and `$PATH` shall be set deterministically in `init-lfs-env.sh`. Cloud builds shall execute in isolated Docker containers with no network access after package download. Container filesystem shall be read-only except for `/tmp` and build directories.

---

## 4. Real-Time Monitoring and Logging

### 4.1 Build Status Tracking
The system shall maintain build status through five states: PENDING (queued), RUNNING (executing), COMPLETED (successful), FAILED (error occurred), and CANCELLED (user-terminated). Status updates shall be written to Firestore `builds` collection in real-time. Users shall view current build status on their dashboard at `/dashboard`.

### 4.2 Compilation Log Streaming
During build execution, the system shall stream compilation logs to authenticated users in real-time. Local builds shall write logs to `BUILDLOG` file and `lfs-output/build-log-*.txt`. Cloud builds shall use `helpers/firestore-logger.js` to write log entries to Firestore `buildLogs` collection. The web interface shall display logs with automatic scrolling and syntax highlighting.

### 4.3 Progress Percentage Calculation
The system shall track build progress as a percentage based on completed package count. Progress calculation formula: `(completed_packages / total_packages) * 100`. For Chapter 5 builds, total_packages equals 18. Current package name and progress percentage shall be stored in `CURRENT_BUILD_INFO.txt` for local builds and Firestore for cloud builds.

### 4.4 Resource Utilization Monitoring
The system shall record resource utilization metrics including CPU usage percentage, memory consumption (MB), disk I/O (MB/s), and build duration per package. Local builds shall use PowerShell `Get-Counter` cmdlets to sample metrics every 30 seconds. Cloud builds shall retrieve metrics from Cloud Run Jobs API. Metrics shall be stored in `lfs-output/build-metadata-*.txt` files.

---

## 5. Artifact Storage and Retrieval

### 5.1 Artifact Preservation
Upon successful build completion, the system shall create TAR.GZ archives of compiled toolchains. Archive contents shall include `/mnt/lfs/tools` directory (436 MB for full Chapter 5 toolchain) and build metadata files. Local builds shall store archives in `lfs-output/` directory. Cloud builds shall upload archives to Google Cloud Storage buckets.

### 5.2 Artifact Metadata Management
Each artifact shall have associated metadata including build configuration (architecture, options), timestamp, file size, MD5 checksum, and builder user ID. Metadata shall be stored in Firestore `artifacts` collection with references to Cloud Storage object paths. The system shall support metadata-based artifact search and filtering.

### 5.3 Secure Artifact Downloads
Users shall download artifacts through time-limited signed URLs generated by Firebase Cloud Functions. Signed URLs shall be valid for 1 hour and permit single-use downloads. The system shall log all download events with user ID and timestamp. Download links shall be presented on the build completion page and `/downloads` page.

### 5.4 Artifact Retention Policy
The system shall automatically delete artifacts after 30 days to manage storage costs. Before deletion, users shall receive email notifications 7 days in advance with options to extend retention. Extended retention shall be available for up to 90 days with manual approval. Artifact deletion shall trigger cleanup of associated Firestore metadata and Cloud Storage objects.

---

## 6. Learning Platform Integration

### 6.1 Structured Tutorial System
The system shall provide a minimum of 8 structured learning modules covering LFS concepts. Module 1 (Introduction to LFS), Module 2 (Build Environment Setup), Module 3 (Cross-Toolchain), Module 4 (System Configuration), Module 5 (Kernel Compilation), Module 6 (Bootloader Setup), Module 7 (Networking), Module 8 (Package Management). Each module shall contain 4-6 lessons with estimated completion times, learning objectives, and quizzes.

### 6.2 Interactive Terminal Emulation
The system shall offer browser-based terminal emulation using xterm.js library for command practice. The terminal component (`components/terminal/Terminal.tsx`) shall support basic Linux commands (ls, cd, cat, grep, echo, pwd) through a simulated filesystem. Terminal sessions shall be sandboxed and isolated per user. Command history and output shall be preserved during user sessions.

### 6.3 Progress Tracking
The system shall track user progress through learning modules with granularity at the lesson level. Completed lessons shall be marked with checkmarks in the module navigation. Overall progress percentage shall be calculated as `(completed_lessons / total_lessons) * 100` and displayed on the dashboard. Progress data shall be stored in Firestore `userProgress` collection indexed by user ID.

### 6.4 Content-Build Linking
Tutorial content shall include direct links to corresponding build stages. For example, Module 3 Lesson 2 (Building GCC Pass 1) shall link to the GCC build logs and relevant source code in the GitHub repository. The wizard on `/install` page shall display tutorial context-aware tips during each installation step. Links shall open in new tabs to preserve user workflow.

### 6.5 Code Syntax Highlighting
All command examples and code snippets in tutorial content shall be rendered with syntax highlighting using Prism.js library. Supported languages include Bash, C, Makefile, and configuration files. Code blocks shall include copy-to-clipboard buttons for easy command execution. Syntax highlighting themes shall adapt to user-selected light or dark mode.

---

## 7. Administrative Functions

### 7.1 System Metrics Dashboard
Administrators shall access a comprehensive metrics dashboard at `/admin/metrics` displaying total build count, success rate percentage, average build duration, concurrent user count, storage utilization, and error rate. Metrics shall be visualized using Recharts library with line graphs (build counts over time), pie charts (build status distribution), and bar charts (per-package build durations).

### 7.2 User Build Management
Administrators shall view all user builds in a searchable, filterable table at `/admin/builds`. Table columns shall include build ID, user email, submission time, status, duration, and actions. Administrators shall cancel running builds, retry failed builds, or delete build records. Bulk actions shall be supported for multiple builds. Changes shall be audited in Firestore `adminActions` collection.

### 7.3 Manual Build Triggering
Administrators shall manually trigger builds for testing purposes through the admin interface. Manual builds shall bypass user quota limits and queue restrictions. Administrators shall specify all build configuration parameters including non-standard architectures and experimental options. Manual builds shall be clearly labeled in logs and UI to distinguish from user-initiated builds.

### 7.4 System Configuration Management
Administrators shall configure system parameters through a settings page at `/admin/settings`. Configurable parameters include maximum concurrent builds (default: 10), per-user build quota (default: 5 per day), artifact retention period (default: 30 days), and queue length limit (default: 50). Configuration changes shall require confirmation and take effect immediately without system restart.

### 7.5 Analytics and Reporting
The system shall provide aggregated analytics including build success rates by date range, most popular learning modules by view count, user engagement metrics (average session duration, lessons completed per user), and system health indicators (uptime percentage, error rates by component). Reports shall be exportable as CSV files for offline analysis. Analytics data shall be computed daily by Firebase Cloud Functions and cached in Firestore.

---

## Summary

This document specifies 32 detailed functional requirements across 7 major categories: authentication and authorization (4 requirements), build submission and configuration (4 requirements), automated build execution (5 requirements), real-time monitoring and logging (4 requirements), artifact storage and retrieval (4 requirements), learning platform integration (5 requirements), and administrative functions (5 requirements). Each requirement describes the system behavior from a user or administrator perspective, specifies the implementation approach using actual system components (filenames, API endpoints, data structures), and defines measurable acceptance criteria. These requirements derive from the problem analysis in Chapter 1.1, information flows in Chapter 1.2, and user needs identified through LFS community feedback and manual build process observation. Implementation evidence exists in the codebase: authentication uses Firebase Auth SDK in `lib/firebase.ts`, build orchestration scripts (`BUILD-LFS-CORRECT.ps1`, `lfs-build.sh`, `build-lfs-complete-local.sh`), Firestore data models in `functions/index.js`, and Next.js pages under `lfs-learning-platform/app/`. All requirements are testable and traceable to specific system components.
