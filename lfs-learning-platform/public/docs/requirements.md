---
title: System Requirements for Building LFS
description: Detailed hardware specifications, host distribution packages, and verification scripts required to compile Linux From Scratch.
---

# System Requirements

Before compiling Linux From Scratch using Sentinel AI scripts or manually, your host environment must satisfy specific hardware and software prerequisites.

---

## Hardware Specifications

| Resource | Minimum Required | Recommended (Sentinel High-Speed Build) |
| :--- | :--- | :--- |
| **CPU Cores** | 2 Cores | **8+ Cores** (`make -j$(nproc)` parallel builds) |
| **RAM** | 4 GB | **16 GB+** (reduces swap thrashing during GCC compile) |
| **Free Storage** | 30 GB | **50 GB+ NVMe SSD** (fast source extraction & linking) |

---

## Host Operating System & Packages

Your host distribution (Ubuntu 22.04+, Debian 12+, Arch, or Fedora) must have the following development tools installed:

### Essential Development Tools
```bash
sudo apt-get update && sudo apt-get install -y \
  build-essential \
  bison \
  flex \
  gawk \
  texinfo \
  python3 \
  libncurses5-dev \
  rsync \
  curl \
  wget
```

---

## Verifying Your Host Environment

Run our automated verification script (`VALIDATE-LFS-ENV.sh`) or check version compatibility manually:

```bash
# Verify GNU Bash version (must be >= 4.0)
bash --version | head -n1

# Verify GCC and Binutils versions
gcc --version | head -n1
ld --version | head -n1

# Check symbolic link for /bin/sh (must point to bash)
readlink -f /bin/sh
```

> [!IMPORTANT]
> If `/bin/sh` points to `dash` (default on Ubuntu/Debian), you must reconfigure it to point to `bash` using `sudo dpkg-reconfigure -plow dash` before building LFS.
