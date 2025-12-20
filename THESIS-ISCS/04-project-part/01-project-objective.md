# 4.1 Project Objectives and Constraints

## 4.1.1 Project Objectives

The LFS Automated Build System aims to address five specific, measurable objectives derived from the Introduction (Section 1.3):

### Objective 1: Automate the Local LFS 12.0 Toolchain Build (Chapter 5)

**Target**: Eliminate manual shell interaction while building the 18 Chapter 5 packages on a Windows host via WSL2 and chroot.

**Measurable Criteria**:
- `BUILD-LFS-CORRECT.ps1` drives the entire flow without manual package commands
- `init-lfs-env.sh` and `build-lfs-complete-local.sh` prepare `/mnt/lfs`, `/tools`, and the LFS user
- `chroot-and-build.sh` executes the chroot stage non-interactively
- **Success Metric**: End-to-end Chapter 5 build completes with no manual commands and produces a populated `/mnt/lfs/tools`

**Implementation**: PowerShell entrypoint → WSL bash scripts orchestrating downloads, extraction, and per-package builds with logged output.

---

### Objective 2: Ensure Reproducible, Host-Independent Environments

**Target**: Guarantee identical toolchain outputs regardless of host variability (Windows versions, WSL images).

**Measurable Criteria**:
- `/mnt/lfs` created via `init-lfs-env.sh` with controlled permissions and ownership
- `$LFS_TGT` and PATH set deterministically; `/tools` takes precedence
- Two-pass binutils/GCC process runs inside chroot to remove host libc dependence
- **Success Metric**: Hash-stable toolchain artifacts across repeated local runs with identical sources

**Implementation**: Strict environment export in scripts, verified by repeating builds using the same tarballs and comparing SHA256 in `lfs-output/build-metadata-*.txt`.

---

### Objective 3: Provide Build Observability and Recovery

**Target**: Enable users to monitor build progress without SSHing into WSL.

**Measurable Criteria**:
- Logs emitted to `BUILDLOG` via `build-lfs-in-chroot.sh` and persisted in `lfs-output/`
- `CURRENT_BUILD_INFO.txt` updated per package with status, duration, and package name
- Recovery guidance documented for rerunning failed packages after cleanup
- **Success Metric**: Operators can identify the failing package and resume from the next package without a full restart

**Implementation**: Local log files are first-class; `helpers/firestore-logger.js` remains optional for UI streaming when Firebase is configured.

---

### Objective 4: Generate Minimal Bootable Output

**Target**: Produce a minimal bootable artifact (kernel + init scripts) when time permits, using the same chroot environment.

**Measurable Criteria**:
- `build-minimal-bootable.sh` runs inside chroot after toolchain completion
- Boot files deposited under `/boot` and packaged into an image artifact
- **Success Metric**: Artifact file present in `lfs-output/` and verified via QEMU/VM boot (manual check)

**Implementation**: Optional post-toolchain step triggered via PowerShell flag; relies on the same `/mnt/lfs` mount and environment exports.

---

### Objective 5: Surface the Build Workflow in the Learning Platform

**Target**: Present the automated build flow and logs inside the Next.js/React learning platform for instructional use.

**Measurable Criteria**:
- Build submission wizard posts to Firestore when configured
- Log viewer renders streamed logs when Firestore logging is enabled, otherwise links to local BUILDLOG
- Progress indicators map to package boundaries from `CURRENT_BUILD_INFO.txt`
- **Success Metric**: Learners can submit a build (cloud or local bridge) and observe package-level progress

**Implementation**: `lfs-learning-platform` components (wizard + log viewer) backed by optional Firestore; local runs can export logs for upload.

---

**[INSERT FIGURE 13 HERE]**

**Figure 13. Project Objectives Hierarchy Diagram**

This hierarchical tree diagram (created in draw.io using orthogonal connectors and rounded rectangles) visualizes the decomposition of the five primary project objectives (Section 4.1.1) into their supporting measurable criteria and implementation strategies. The top node, "LFS Automated Build System Objectives," branches into five second-level nodes representing each objective: Objective 1 (Automate Local LFS 12.0 Toolchain Build), Objective 2 (Ensure Reproducible, Host-Independent Environments), Objective 3 (Provide Build Observability and Recovery), Objective 4 (Generate Minimal Bootable Output), and Objective 5 (Surface Build Workflow in Learning Platform). Each objective node further branches into 3-4 leaf nodes representing measurable criteria (e.g., "BUILD-LFS-CORRECT.ps1 drives entire flow," "Hash-stable toolchain artifacts," "Logs emitted to BUILDLOG") and implementation details (e.g., "PowerShell entrypoint → WSL bash scripts," "Strict environment export in scripts," "Local log files first-class"). Color-coding distinguishes objective types: Objective 1 (purple, automation focus), Objective 2 (orange, reproducibility), Objective 3 (blue, observability), Objective 4 (green, bootable output), Objective 5 (teal, learning platform integration). The diagram demonstrates traceability from high-level goals to concrete success metrics, enabling stakeholders to verify that each objective is measurably defined and implementable through specific script components. All objectives trace to Section 1.3 in the Introduction and to the core build scripts (`BUILD-LFS-CORRECT.ps1`, `init-lfs-env.sh`, `build-lfs-complete-local.sh`, `chroot-and-build.sh`, `build-minimal-bootable.sh`) and the learning platform codebase (`lfs-learning-platform/` components).

---

## 4.1.2 Design Constraints

### Technical Constraints

**Constraint 1: WSL2 Host Dependency**
- **Impact**: Requires Windows 10/11 with WSL2 and virtualization enabled
- **Mitigation**: PowerShell wrappers validate prerequisites and launch Ubuntu image; native Linux hosts documented as fallback

**Constraint 2: Filesystem Mount Permissions**
- **Impact**: `/mnt/lfs` must be owned by the `lfs` user for toolchain installs; incorrect ownership causes widespread failures
- **Mitigation**: `init-lfs-env.sh` enforces ownership and aborts if mount is misconfigured

**Constraint 3: Long Build Time on Modest Hardware**
- **Impact**: GCC/glibc compilation can exceed 5–8 hours on 4-core laptops
- **Mitigation**: MAKEFLAGS defaults to `-j$(nproc)`; resume guidance included; optional cache of downloaded tarballs in `sources/`

---

### Architectural Constraints

**Constraint 4: Local-First Execution**
- **Implication**: No persistent cloud state; all artifacts live on host disk under `/mnt/lfs` and `lfs-output/`
- **Design Decision**: Keep orchestration purely bash + PowerShell; Firestore logging is optional
- **Tradeoff**: Manual artifact backup/retention required; easier offline reproducibility

**Constraint 5: Chroot Execution Requires Privileged Operations**
- **Implication**: Scripts must be run with `sudo` inside WSL; PowerShell wrappers prompt the user
- **Security Mitigation**: Chroot only against `/mnt/lfs`; uses minimal bind mounts; no network access inside chroot during sensitive stages

---

**[INSERT FIGURE 14 HERE]**

**Figure 14. Constraint-Solution Mapping Matrix Diagram**

This matrix diagram (created in draw.io using a table layout with color-coded cells) maps the five design constraints (Section 4.1.2) to their corresponding mitigation solutions and architectural decisions. The horizontal axis lists the constraints: WSL2 Host Dependency (Constraint 1), Filesystem Mount Permissions (Constraint 2), Long Build Time on Modest Hardware (Constraint 3), Local-First Execution (Constraint 4), and Chroot Execution Requires Privileged Operations (Constraint 5). The vertical axis categorizes solution types: Validation/Detection (purple cells), Automation/Scripting (blue cells), Performance Optimization (orange cells), and Security Mitigation (green cells). Each cell contains either a checkmark (✓) indicating that the solution type addresses the constraint, or a specific implementation reference (e.g., "PowerShell prerequisite check" for Constraint 1 + Validation, "`init-lfs-env.sh` ownership enforcement" for Constraint 2 + Automation, "MAKEFLAGS -j$(nproc)" for Constraint 3 + Performance, "Manual artifact backup guidance" for Constraint 4 + Automation, "`sudo` prompts + minimal bind mounts" for Constraint 5 + Security). The diagram clearly demonstrates that multiple solution types combine to address each constraint, highlighting the project's layered approach to risk mitigation. For example, Constraint 1 (WSL2 dependency) is mitigated through validation scripts (`BUILD-LFS-CORRECT.ps1` prerequisite checks) and documentation (native Linux fallback instructions). Constraint 3 (long build time) is addressed via performance optimization (parallel make flags) and automation (resume guidance via `CURRENT_BUILD_INFO.txt`). This matrix fulfills ISCS Requirement 4.1.2 by explicitly showing how each constraint influences design decisions and validates completeness of the mitigation strategy (all constraints have at least two solution types applied). References include `BUILD-LFS-CORRECT.ps1` lines 15-30 (validation), `init-lfs-env.sh` lines 40-60 (ownership), `build-lfs-complete-local.sh` lines 20-25 (MAKEFLAGS), and `README.md` Section 3 (recovery guidance). The matrix serves as a traceability artifact connecting Section 1.4 (Constraints Overview) to Section 4.4 (Implementation Details), demonstrating fulfillment of Accessibility (NFR-P02).

---

### Technology Stack Constraints

From `package.json`, shell scripts, and host setup:

| Technology | Version | Constraint Reason |
|------------|---------|-------------------|
| **Node.js** | 20.x | Matches Next.js frontend and optional Functions emulator |
| **Next.js** | 16.0.1 | Current UI stack in `lfs-learning-platform` |
| **React** | 19.2.0 | Next.js 16 peer dependency |
| **WSL2 Ubuntu** | 22.04 | Verified host for bash scripts |
| **GCC (LFS)** | 13.2.0 | Required by LFS 12.0 specification |
| **PowerShell** | 7.x (or Windows PowerShell 5.1+) | Hosts entry scripts and launches WSL |

---

## 4.1.3 Success Criteria

### Functional Success Criteria

| Criterion | Measurement Method | Target Value | Actual Result |
|-----------|-------------------|--------------|---------------|
| Build Automation | Manual intervention count | 0 steps | Pending latest local run |
| Build Success Rate | (Successful builds / Total builds) × 100 | ≥ 90% | Pending |
| Build Time | Wall-clock on 4-core laptop | Documented in `build-metadata-*` | Pending |
| Log Availability | BUILDLOG present with package markers | 100% | Pending |
| Artifact Integrity | SHA256 hash verification | 100% match | Pending |

---

### Non-Functional Success Criteria

| Criterion | Measurement Method | Target Value | Actual Result |
|-----------|-------------------|--------------|---------------|
| Local Resource Usage | Peak RAM during GCC/glibc | ≤ 9GB | Pending |
| UI Responsiveness | Time to Interactive (TTI) | ≤ 2 seconds | As measured by Next.js build |
| Code Coverage | Vitest test coverage percentage | ≥ 80% | Pending |
| Log Retention | BUILDLOG persisted per run | 100% | Pending |
| Security Compliance | Chroot isolation scope | `/mnt/lfs` only | Verified in scripts |

**Evidence Source**: `BUILDLOG`, `CURRENT_BUILD_INFO.txt`, `lfs-output/build-metadata-*.txt`, Vitest coverage reports (frontend).

---

## 4.1.4 Out of Scope

The following capabilities are explicitly excluded from this project:

1. **Fully automated cloud builds**: Cloud Run/Jobs flow is deferred; current focus is local WSL + chroot
2. **Multi-Architecture Support**: ARM64, RISC-V builds require separate toolchains
3. **Package Customization**: User-selectable build flags beyond predefined script options
4. **Artifact Hosting**: Long-term storage/retention beyond local disk and manual backups
5. **Advanced Admin UI**: Build quota management and multi-tenant dashboards are out of scope

---

<!--
EXTRACTION SOURCES:
- Introduction objectives: Section 1.3
- PowerShell / bash scripts: BUILD-LFS-CORRECT.ps1, init-lfs-env.sh, build-lfs-complete-local.sh, chroot-and-build.sh
- Current logs: BUILDLOG, CURRENT_BUILD_INFO.txt, lfs-output/build-metadata-*.txt
- Frontend stack: lfs-learning-platform/package.json
-->
