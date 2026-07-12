---
title: Downloading Kernel Sources & Patches
description: Guidelines on downloading and verifying stable Linux kernel tarballs and applying platform patches.
---

# Downloading Kernel Sources & Patches

Before building the kernel, download the source tarball from official repositories.

## 1. Kernel Version Selection
For the current LFS 12.0 build, we standardize on the **Linux 6.4.12** stable kernel.

## 2. Download Command
Use wget to download directly into your sources folder:
```bash
cd $LFS/sources
wget https://cdn.kernel.org/pub/linux/kernel/v6.x/linux-6.4.12.tar.xz
```

## 3. Verify Integrity
Verify the signature or checksum to ensure file integrity:
```bash
wget https://cdn.kernel.org/pub/linux/kernel/v6.x/linux-6.4.12.tar.sign
xz -cd linux-6.4.12.tar.xz | gpg --verify linux-6.4.12.tar.sign -
```
