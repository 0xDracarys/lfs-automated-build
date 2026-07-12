---
title: Introduction to Linux From Scratch (LFS)
description: Discover how Sentinel AI's LFS Automated Build System compiles customized, bootable Linux distributions from source.
---

# Introduction to Linux From Scratch (LFS)

Welcome to **Sentinel AI** — the automated **Linux From Scratch (LFS) Learning & Build Platform**. Linux From Scratch is a project that provides you with step-by-step instructions for building your own custom Linux system entirely from source code.

---

## Why Build Linux From Scratch?

Building an LFS system teaches you how a Linux distribution works internally. Instead of relying on pre-compiled distributions like Ubuntu, Debian, or Arch, you construct every layer from the ground up:

1. **Complete Control**: You decide exactly which packages, libraries, and compiler flags go into your operating system.
2. **Deep Kernel & Toolchain Insight**: Understand how the **GNU C Library (glibc)**, **GCC Compiler Toolchain**, and **Linux Kernel** interact.
3. **Security & Minimal Footprint**: Eliminate unwanted background services, telemetry, and bloated dependencies.

---

## Sentinel AI LFS Architecture Overview

Our internal build pipeline automates the traditional multi-day LFS compilation process into an interactive, reproducible engineering pipeline:

```
+-------------------+      +--------------------+      +--------------------+
|  Host Toolchain   | ---> |  Cross-Compilation | ---> |   Chroot Native    |
| (Binutils / GCC)  |      |  Temporary System  |      |   Build & Kernel   |
+-------------------+      +--------------------+      +--------------------+
```

### 1. Phase 1: Host Preparation & Cross-Toolchain
- Compiles an isolated cross-compiler (`binutils-pass1`, `gcc-pass1`, `linux-headers`, `glibc`).
- Prevents host system libraries from leaking into or polluting the LFS target environment.

### 2. Phase 2: Temporary Build Tools
- Compiles fundamental utilities (`m4`, `ncurses`, `bash`, `coreutils`, `diffutils`, `make`) using the cross-toolchain inside `/mnt/lfs/tools`.

### 3. Phase 3: Entering Chroot & Compiling Final System
- Transitions into an isolated virtual root environment (`chroot /mnt/lfs`).
- Builds the final, highly optimized native software packages and custom **Linux 6.4+ Kernel (`bzImage`)**.

---

## Key System Directories

| Directory Path | Purpose in LFS Pipeline |
| :--- | :--- |
| `/mnt/lfs` | Root mount point for target LFS filesystem |
| `/mnt/lfs/sources` | Downloaded tarballs and patches (`gcc`, `glibc`, `linux`) |
| `/mnt/lfs/tools` | Temporary cross-compilation toolchain directory |
| `/mnt/lfs/boot` | Bootloader configuration, Linux kernel (`bzImage`), and `System.map` |

---

## Next Steps

Explore the rest of the documentation to get started:
- [System Requirements](/docs/requirements) — Hardware specifications & host dependencies.
- [Environment Preparation](/docs/preparation) — Setting up `$LFS`, partitions, and user accounts.
- [System Overview & Architecture](/docs/system-overview) — Deep dive into Sentinel AI internal build engineering notes.
