---
title: Quick Start Guide — Build LFS in 5 Steps
description: Fast-track automated Linux From Scratch build pipeline using Sentinel AI automation scripts.
---

# Quick Start Guide

Want to build a bootable Linux From Scratch system quickly? Follow these 5 steps using Sentinel AI's automated scripts.

---

## Step 1: Clone & Initialize Environment

```bash
git clone https://github.com/SentinelAI/lfs-automated.git
cd lfs-automated
chmod +x *.sh
```

---

## Step 2: Run Environment Validator

Validate that your host machine meets all LFS prerequisites:

```bash
./VALIDATE-LFS-ENV.sh
```

---

## Step 3: Execute Full Automated Build

Launch the end-to-end automated LFS build script. This script automatically handles Binutils, GCC, Glibc, Native Utilities, and Kernel 6.4.12 compilation:

```bash
# Run local automated build with maximum CPU cores
sudo ./build-lfs-complete-local.sh --jobs=$(nproc)
```

---

## Step 4: Monitor Live Progress

If running via Cloud Build or background task, check build progress in real time:

```bash
./MONITOR_BUILD.ps1 -Follow
```

---

## Step 5: Boot & Verify Your New Kernel

Once output archives are generated in `lfs-output/`, verify your bootable kernel image:

```bash
ls -lh lfs-output/
# Output:
# lfs-system.tar.gz
# vmlinuz-6.4.12-lfs
```
