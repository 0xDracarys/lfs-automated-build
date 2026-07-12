---
title: Environment Preparation & Partition Setup
description: Step-by-step guide to setting up the $LFS environment variable, dedicated partitions, and isolated build directories.
---

# Environment Preparation

To ensure a clean separation between your host operating system and your new LFS build, follow these exact preparation steps.

---

## 1. Setting the `$LFS` Variable

Always define the `$LFS` environment variable pointing to your mount point:

```bash
export LFS=/mnt/lfs
echo $LFS
```

To make this persistent across terminal sessions, add it to your profile:

```bash
echo "export LFS=/mnt/lfs" >> ~/.bashrc
source ~/.bashrc
```

---

## 2. Creating the Directory Hierarchy

Create the primary mount point and required subdirectories:

```bash
sudo mkdir -pv $LFS
sudo mkdir -pv $LFS/sources
sudo mkdir -pv $LFS/tools

# Make directories writable by current user during initial build
sudo chmod -v a+wt $LFS/sources
```

---

## 3. Creating Essential Compatibility Symlinks

Before compiling the cross-toolchain, create symbolic links so binaries can be located consistently inside `/tools`:

```bash
sudo ln -sv $LFS/tools /
```

---

## 4. Downloading Source Tarballs

Verify and download all necessary LFS 12.0 / Kernel 6.4 source archives into `$LFS/sources`:

```bash
cd $LFS/sources
wget https://ftp.gnu.org/gnu/gcc/gcc-13.2.0/gcc-13.2.0.tar.xz
wget https://ftp.gnu.org/gnu/glibc/glibc-2.38.tar.xz
wget https://cdn.kernel.org/pub/linux/kernel/v6.x/linux-6.4.12.tar.xz
```

Once downloaded, you are ready to begin compiling your first cross-compiler toolchain.
