---
title: Sentinel AI LFS System Overview & Internal Architecture
description: Comprehensive technical architecture of the automated Linux From Scratch build pipeline and cloud infrastructure.
---

# System Overview & Internal Engineering Architecture

This document synthesizes Sentinel AI's internal engineering notes on our **Automated Linux From Scratch (LFS) Build System**, covering both local compilation pipelines and Google Cloud / Firebase hybrid orchestration.

---

## Architecture Blueprint

```
+-----------------------------------------------------------------------+
|                      SENTINEL AI PLATFORM                             |
|                                                                       |
|   +--------------------+       +----------------------------------+   |
|   |  Next.js Frontend  | <---> |  Firebase Firestore & Auth       |   |
|   |  (Interactive UI)  |       |  (Build Queue & Status Logs)     |   |
|   +--------------------+       +----------------------------------+   |
|             |                                   ^                     |
|             v                                   |                     |
|   +--------------------+               +--------------------------+   |
|   |  Cloud Run / Local | ------------> | Google Cloud Build API   |   |
|   |  Build Trigger     |               | (Isolated Containers)    |   |
|   +--------------------+               +--------------------------+   |
+-----------------------------------------------------------------------+
```

---

## Core Components

### 1. Build Orchestration Engine
- **Local Scripts**: Automated shell and PowerShell pipelines (`START_REAL_BUILD.ps1`, `lfs-build.sh`, `build-minimal-bootable.sh`) manage multi-stage toolchain compilation.
- **Cloud Orchestration**: Uses **Google Cloud Build** (`cloudbuild.yaml`) to run clean, isolated container builds with zero host contamination.

### 2. State & Progress Tracking
- **Firestore Database**: Tracks live build queue (`queued`, `pending`, `building`, `completed`, `failed`) and stores step-by-step compilation logs.
- **Real-time Telemetry**: Builds emit progress events during compilation of `binutils`, `gcc`, `glibc`, and the `6.4.12` Linux Kernel.

---

## Build Phase Lifecycle

### Phase I: Toolchain Construction (`Chapter 5`)
1. **Binutils Pass 1**: Assembler and linker for target architecture.
2. **GCC Pass 1**: Initial cross-compiler without C++ or thread support.
3. **Linux API Headers**: Exposes kernel system calls to userspace C library.
4. **Glibc**: The foundational C standard library compiled against target headers.
5. **Libstdc++ Pass 1**: Standard C++ library runtime.

### Phase II: Native Chroot Environment (`Chapter 6-8`)
- Mounts virtual kernel filesystems (`/dev`, `/proc`, `/sys`, `/run`).
- Enters `chroot` environment with clean environment variables (`HOME=/root`, `TERM=$TERM`).
- Compiles native core utilities and builds the bootable **Linux Kernel (`bzImage`)**.

---

## Verification & Output Artifacts

Upon successful build completion, the pipeline outputs:
- `lfs-system.tar.gz` — Complete root filesystem archive.
- `vmlinuz-6.4.12-lfs` — Bootable compressed Linux kernel.
- `System.map-6.4.12` — Kernel symbol lookup table.
