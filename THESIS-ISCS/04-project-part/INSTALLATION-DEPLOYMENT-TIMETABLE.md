# Installation and Deployment Timetable

## Overview

This document provides a comprehensive deployment schedule for the LFS Automated Build System, including phases, activities, durations, prerequisites, and deliverables as required by ISCS methodology Section 2.3.5 (Project Part - Plan of Measures for Deployment).

---

## 1. Deployment Timeline Overview

**Total Estimated Time:** 4-8 hours (depending on network speed and hardware)
**Target Platforms:** Windows 10/11 with WSL2, Linux Native (Ubuntu 22.04/24.04, Debian 11+)
**Prerequisites:** 20GB free disk space, 4GB RAM minimum, stable internet connection

---

## 2. Phase-Based Deployment Schedule

### Phase 1: System Prerequisites and WSL2 Setup

**Duration:** 20-45 minutes
**Prerequisite:** Windows 10 version 2004+ or Windows 11, Administrator access
**Target:** Prepare host environment for LFS development

| Step | Activity | Commands | Duration | Deliverable |
|------|----------|----------|----------|-------------|
| 1.1 | Enable Windows Subsystem for Linux | `dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart` | 2 min | WSL feature enabled |
| 1.2 | Enable Virtual Machine Platform | `dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart` | 2 min | Virtualization enabled |
| 1.3 | System restart | Reboot required | 5 min | Features activated |
| 1.4 | Download WSL2 Linux kernel update | Download from Microsoft | 3 min | Kernel package |
| 1.5 | Install WSL2 kernel update | Run MSI installer | 2 min | Updated kernel |
| 1.6 | Set WSL2 as default version | `wsl --set-default-version 2` | 1 min | WSL2 configured |
| 1.7 | Install Ubuntu 22.04 distribution | `wsl --install -d Ubuntu-22.04` | 10-30 min | Ubuntu installed |
| 1.8 | Create Linux user account | Interactive prompts | 2 min | User created |
| 1.9 | Verify WSL installation | `wsl --list --verbose` | 1 min | Installation verified |

**Critical Success Factors:**
- BIOS virtualization enabled (Intel VT-x/AMD-V)
- Sufficient disk space (C: drive with 30GB+ free)
- Stable internet (for 200MB+ Ubuntu download)

**Troubleshooting Time Buffer:** +15 minutes for common issues:
- Virtualization not enabled: BIOS configuration required
- Network timeouts: Retry download with `wsl --install`
- WSL2 kernel missing: Manual download from Microsoft

**Verification Commands:**
```bash
# Check WSL version
wsl --status

# Verify Ubuntu version
wsl -d Ubuntu-22.04 -- lsb_release -a

# Expected output: Ubuntu 22.04.3 LTS
```

---

### Phase 2: LFS Mount Point Creation

**Duration:** 5-8 minutes
**Prerequisite:** Phase 1 completed, WSL2 running
**Target:** Create LFS build directory structure

| Step | Activity | Commands | Duration | Deliverable |
|------|----------|----------|----------|-------------|
| 2.1 | Create LFS mount point | `sudo mkdir -pv /mnt/lfs` | 1 min | Directory created |
| 2.2 | Set ownership to user | `sudo chown -v $USER /mnt/lfs` | 1 min | Permissions granted |
| 2.3 | Verify write permissions | `touch /mnt/lfs/test && rm /mnt/lfs/test` | 1 min | Write access confirmed |
| 2.4 | Create source directory | `mkdir -pv /mnt/lfs/sources` | 1 min | Sources directory |
| 2.5 | Create tools directory | `mkdir -pv /mnt/lfs/tools` | 1 min | Tools directory |
| 2.6 | Set directory permissions | `chmod -v a+wt /mnt/lfs/sources` | 1 min | Sticky bit set |

**Verification:**
```bash
# Check directory structure
ls -la /mnt/lfs/
# Expected: sources/ and tools/ directories with correct ownership

# Verify permissions
stat /mnt/lfs
# Expected: Owner: <your-username>, Mode: 0755
```

---

### Phase 3: Source Package Downloads

**Duration:** 15-45 minutes (network-dependent)
**Prerequisite:** Phase 2 completed, 2GB+ free space
**Target:** Download all LFS 12.0 toolchain source packages

**Option A: Pre-compiled Toolchain Download (Fast)**

| Step | Activity | Commands | Duration | Size |
|------|----------|----------|----------|------|
| 3A.1 | Download pre-built archive | `wget https://storage.googleapis.com/lfs-artifacts/lfs-chapter5-toolchain.tar.gz` | 10-20 min | 436 MB |
| 3A.2 | Verify checksum | `md5sum lfs-chapter5-toolchain.tar.gz` | 1 min | Hash verified |
| 3A.3 | Extract to /mnt/lfs | `tar -xzf lfs-chapter5-toolchain.tar.gz -C /mnt/lfs` | 3-5 min | Tools extracted |
| 3A.4 | Verify extraction | `ls /mnt/lfs/tools/bin/` | 1 min | Binaries present |

**Option B: Source Package Download (Full Build)**

| Step | Activity | Target | Duration | Size |
|------|----------|--------|----------|------|
| 3B.1 | Download Binutils 2.41 | GNU FTP | 2 min | 27 MB |
| 3B.2 | Download GCC 13.2.0 | GNU FTP | 8 min | 87 MB |
| 3B.3 | Download Glibc 2.38 | GNU FTP | 6 min | 18 MB |
| 3B.4 | Download Linux headers 6.4.12 | kernel.org | 5 min | 135 MB |
| 3B.5 | Download remaining 14 packages | Various sources | 10 min | 120 MB |
| 3B.6 | Verify all checksums | MD5SUMS file | 2 min | All verified |

**Package List (18 total):**
1. M4 1.4.19 (1.6 MB)
2. Ncurses 6.4 (3.6 MB)
3. Bash 5.2.15 (10.3 MB)
4. Coreutils 9.3 (5.8 MB)
5. Diffutils 3.10 (1.6 MB)
6. File 5.45 (1.2 MB)
7. Findutils 4.9.0 (2.1 MB)
8. Gawk 5.2.2 (3.3 MB)
9. Grep 3.11 (1.7 MB)
10. Gzip 1.12 (1.2 MB)
11. Make 4.4.1 (2.3 MB)
12. Patch 2.7.6 (766 KB)
13. Sed 4.9 (1.3 MB)
14. Tar 1.35 (2.9 MB)
15. Xz 5.4.4 (1.2 MB)
16. Binutils 2.41 (27 MB)
17. GCC 13.2.0 (87 MB)
18. Linux API Headers 6.4.12 (135 MB)
19. Glibc 2.38 (18 MB)
20. Libstdc++ (part of GCC)

**Total Download Size:** ~350 MB (source packages)

**Download Script:**
```bash
#!/bin/bash
cd /mnt/lfs/sources

# Download packages with retry
packages=(
  "https://ftp.gnu.org/gnu/m4/m4-1.4.19.tar.xz"
  "https://ftp.gnu.org/gnu/ncurses/ncurses-6.4.tar.gz"
  # ... (18 packages total)
)

for url in "${packages[@]}"; do
  wget --retry-connrefused --waitretry=5 --read-timeout=20 "$url"
done

# Verify checksums
wget https://www.linuxfromscratch.org/lfs/downloads/stable/md5sums
md5sum -c md5sums 2>&1 | grep -v 'OK$'
```

---

### Phase 4: LFS User Creation

**Duration:** 5-8 minutes
**Prerequisite:** Phase 3 completed
**Target:** Create isolated build user with restricted environment

| Step | Activity | Commands | Duration | Deliverable |
|------|----------|----------|----------|-------------|
| 4.1 | Create lfs user | `sudo groupadd lfs && sudo useradd -s /bin/bash -g lfs -m -k /dev/null lfs` | 1 min | User created |
| 4.2 | Set password for lfs | `sudo passwd lfs` | 1 min | Password set |
| 4.3 | Grant ownership of directories | `sudo chown -v lfs /mnt/lfs/{tools,sources}` | 1 min | Ownership transferred |
| 4.4 | Switch to lfs user | `su - lfs` | 1 min | User context switched |
| 4.5 | Create .bash_profile | See configuration below | 2 min | Profile configured |
| 4.6 | Create .bashrc | See configuration below | 2 min | Shell configured |

**Configuration Files:**

**~/.bash_profile:**
```bash
exec env -i HOME=$HOME TERM=$TERM PS1='\u:\w\$ ' /bin/bash
```

**~/.bashrc:**
```bash
set +h
umask 022
LFS=/mnt/lfs
LC_ALL=POSIX
LFS_TGT=$(uname -m)-lfs-linux-gnu
PATH=/usr/bin
if [ ! -L /bin ]; then PATH=/bin:$PATH; fi
PATH=$LFS/tools/bin:$PATH
CONFIG_SITE=$LFS/usr/share/config.site
export LFS LC_ALL LFS_TGT PATH CONFIG_SITE
export MAKEFLAGS="-j$(nproc)"
```

**Verification:**
```bash
# Check environment variables
echo $LFS
# Expected: /mnt/lfs

echo $LFS_TGT
# Expected: x86_64-lfs-linux-gnu

echo $PATH
# Expected: /mnt/lfs/tools/bin:/usr/bin:/bin
```

---

### Phase 5: Environment Configuration

**Duration:** 3-5 minutes
**Prerequisite:** Phase 4 completed, lfs user active
**Target:** Configure build environment variables

| Step | Activity | Purpose | Duration | Verification |
|------|----------|---------|----------|--------------|
| 5.1 | Export LFS variable | Define root directory | 1 min | `echo $LFS` |
| 5.2 | Export LFS_TGT | Set target triplet | 1 min | `echo $LFS_TGT` |
| 5.3 | Configure PATH | Prioritize tools | 1 min | `which gcc` |
| 5.4 | Set MAKEFLAGS | Enable parallel builds | 1 min | `echo $MAKEFLAGS` |
| 5.5 | Source .bashrc | Apply configurations | 1 min | Variables active |

**Critical Environment Variables:**
```bash
LFS=/mnt/lfs                          # Root of LFS filesystem
LFS_TGT=x86_64-lfs-linux-gnu         # Target architecture triplet
PATH=/mnt/lfs/tools/bin:/usr/bin     # Toolchain-first PATH
MAKEFLAGS="-j$(nproc)"               # Parallel compilation (4 cores = -j4)
LC_ALL=POSIX                         # Locale for consistent builds
```

---

### Phase 6: Tool Verification

**Duration:** 5-10 minutes
**Prerequisite:** Phase 5 completed
**Target:** Verify host system has required tools

| Tool | Required Version | Verification Command | Expected Output |
|------|------------------|----------------------|-----------------|
| Bash | 3.2+ | `bash --version` | GNU bash, version 5.x |
| GCC | 5.1+ | `gcc --version` | gcc (Ubuntu) 11.4.0 |
| Make | 4.0+ | `make --version` | GNU Make 4.3 |
| Bison | 2.7+ | `bison --version` | bison (GNU Bison) 3.8 |
| Gawk | 4.0+ | `gawk --version` | GNU Awk 5.1.0 |
| M4 | 1.4.10+ | `m4 --version` | m4 (GNU M4) 1.4.18 |
| Perl | 5.8.8+ | `perl -v` | perl 5, version 34 |
| Python | 3.4+ | `python3 --version` | Python 3.10.12 |
| Texinfo | 5.0+ | `makeinfo --version` | texinfo 6.8 |

**Version Check Script:**
```bash
#!/bin/bash
# version-check.sh from LFS book

export LC_ALL=C
bash --version | head -n1 | cut -d" " -f2-4
MYSH=$(readlink -f /bin/sh)
echo "/bin/sh -> $MYSH"
echo $MYSH | grep -q bash || echo "ERROR: /bin/sh does not point to bash"

echo -n "Binutils: "; ld --version | head -n1 | cut -d" " -f3-
bison --version | head -n1

# ... (20+ tool checks)

echo "All version checks passed!"
```

**If Tools Missing:**
```bash
# Install missing tools on Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y build-essential bison gawk m4 texinfo
```

---

### Phase 7: Chroot Environment Setup

**Duration:** 10-15 minutes
**Prerequisite:** Chapter 5 toolchain built (Option A or full build)
**Target:** Prepare chroot jail for Chapter 6+ builds

| Step | Activity | Commands | Duration | Deliverable |
|------|----------|----------|----------|-------------|
| 7.1 | Create essential directories | `mkdir -pv $LFS/{etc,var,usr/{bin,lib,sbin}}` | 2 min | Directory tree |
| 7.2 | Create /tools symlink | `ln -sv $LFS/tools /` | 1 min | Symlink created |
| 7.3 | Create device nodes | `mknod -m 600 $LFS/dev/console c 5 1` | 2 min | Devices ready |
| 7.4 | Mount virtual filesystems | See mount commands below | 3 min | VFS mounted |
| 7.5 | Enter chroot | `chroot "$LFS" /tools/bin/env -i ...` | 1 min | Chroot entered |
| 7.6 | Create directory structure | Chapter 6 directory creation | 3 min | Full structure |
| 7.7 | Configure essential files | /etc/passwd, /etc/group | 2 min | Files configured |

**Mount Virtual Filesystems:**
```bash
# Mount proc, sysfs, devpts, tmpfs
sudo mount -v --bind /dev $LFS/dev
sudo mount -vt devpts devpts $LFS/dev/pts -o gid=5,mode=620
sudo mount -vt proc proc $LFS/proc
sudo mount -vt sysfs sysfs $LFS/sys
sudo mount -vt tmpfs tmpfs $LFS/run

# If /dev/shm is a separate partition
if [ -h $LFS/dev/shm ]; then
  mkdir -pv $LFS/$(readlink $LFS/dev/shm)
fi
```

**Chroot Entry Command:**
```bash
sudo chroot "$LFS" /usr/bin/env -i   \
    HOME=/root                        \
    TERM="$TERM"                      \
    PS1='(lfs chroot) \u:\w\$ '       \
    PATH=/usr/bin:/usr/sbin           \
    /bin/bash --login
```

---

### Phase 8: Package Integrity Verification

**Duration:** 5-10 minutes
**Prerequisite:** Phase 3 completed, all sources downloaded
**Target:** Verify all packages are uncorrupted

| Step | Activity | Method | Duration | Deliverable |
|------|----------|--------|----------|-------------|
| 8.1 | Download MD5 checksums | wget from LFS website | 1 min | md5sums file |
| 8.2 | Verify all packages | `md5sum -c md5sums` | 3 min | All OK |
| 8.3 | List verified packages | `ls -lh /mnt/lfs/sources/` | 1 min | Package list |
| 8.4 | Check disk usage | `du -sh /mnt/lfs/sources/` | 1 min | ~350MB used |

**Verification Script:**
```bash
#!/bin/bash
cd /mnt/lfs/sources

echo "Downloading LFS 12.0 checksums..."
wget -q https://www.linuxfromscratch.org/lfs/downloads/12.0/md5sums

echo "Verifying package integrity..."
md5sum -c md5sums 2>&1 | tee verify.log

# Check for failures
if grep -q 'FAILED' verify.log; then
  echo "ERROR: Some packages failed verification!"
  grep 'FAILED' verify.log
  exit 1
else
  echo "SUCCESS: All packages verified!"
fi
```

---

### Phase 9: System Configuration Files

**Duration:** 8-12 minutes
**Prerequisite:** Phase 7 completed, inside chroot
**Target:** Create essential system configuration files

| File | Purpose | Content Summary | Duration |
|------|---------|-----------------|----------|
| /etc/passwd | User accounts | root, bin, daemon, etc. | 2 min |
| /etc/group | User groups | root, bin, sys, etc. | 2 min |
| /etc/hosts | Hostname resolution | localhost, 127.0.0.1 | 1 min |
| /etc/hostname | System hostname | lfs-system | 1 min |
| /etc/fstab | Filesystem table | /, /boot, swap | 3 min |
| /etc/profile | Shell environment | System-wide profile | 2 min |

**/etc/passwd:**
```
root:x:0:0:root:/root:/bin/bash
bin:x:1:1:bin:/dev/null:/usr/bin/false
daemon:x:6:6:Daemon User:/dev/null:/usr/bin/false
messagebus:x:18:18:D-Bus Message Daemon User:/run/dbus:/usr/bin/false
uuidd:x:80:80:UUID Generation Daemon User:/dev/null:/usr/bin/false
nobody:x:65534:65534:Unprivileged User:/dev/null:/usr/bin/false
```

**/etc/group:**
```
root:x:0:
bin:x:1:daemon
sys:x:2:
kmem:x:3:
tape:x:4:
tty:x:5:
daemon:x:6:
```

---

### Phase 10: Kernel Configuration and Build

**Duration:** 25-40 minutes
**Prerequisite:** Chapter 6 completed (82 packages built)
**Target:** Build bootable Linux kernel 6.4.12

| Step | Activity | Commands | Duration | Deliverable |
|------|----------|----------|----------|-------------|
| 10.1 | Extract Linux source | `tar -xf linux-6.4.12.tar.xz` | 2 min | Source tree |
| 10.2 | Generate default config | `make defconfig` | 1 min | .config file |
| 10.3 | Customize kernel config | `make menuconfig` (optional) | 5 min | Custom config |
| 10.4 | Compile kernel | `make -j$(nproc)` | 20-30 min | vmlinuz |
| 10.5 | Install kernel modules | `make modules_install` | 3 min | Modules installed |
| 10.6 | Install kernel image | `cp -v arch/x86/boot/bzImage /boot/vmlinuz-6.4.12-lfs` | 1 min | Kernel copied |
| 10.7 | Install System.map | `cp -v System.map /boot/System.map-6.4.12` | 1 min | Map installed |

**Kernel Configuration Essentials:**
- Enable: EXT4 filesystem, networking, device drivers
- Disable: Modules not needed for boot
- Processor: x86_64, SMP support, 4 cores

**Build Commands:**
```bash
cd /sources/linux-6.4.12

# Clean build
make mrproper

# Default configuration
make defconfig

# Customize (optional)
# make menuconfig

# Compile kernel (parallel)
make -j$(nproc)

# Install
make modules_install
cp -v arch/x86/boot/bzImage /boot/vmlinuz-6.4.12-lfs
cp -v System.map /boot/System.map-6.4.12
cp -v .config /boot/config-6.4.12
```

**Verification:**
```bash
ls -lh /boot/
# Expected: vmlinuz-6.4.12-lfs (~8-10MB)

file /boot/vmlinuz-6.4.12-lfs
# Expected: Linux kernel x86 boot executable
```

---

### Phase 11: Bootloader Installation (GRUB)

**Duration:** 8-15 minutes
**Prerequisite:** Phase 10 completed, kernel built
**Target:** Install GRUB2 bootloader for system boot

| Step | Activity | Commands | Duration | Deliverable |
|------|----------|----------|----------|-------------|
| 11.1 | Install GRUB packages | Already built in Chapter 8 | 0 min | GRUB installed |
| 11.2 | Create GRUB config dir | `mkdir -pv /boot/grub` | 1 min | Directory created |
| 11.3 | Generate GRUB config | `grub-mkconfig -o /boot/grub/grub.cfg` | 2 min | grub.cfg created |
| 11.4 | Install GRUB to disk | `grub-install /dev/sda` | 3 min | Bootloader installed |
| 11.5 | Verify GRUB installation | `grub-install --version` | 1 min | GRUB 2.06 |

**GRUB Configuration:**
```bash
# Generate automatic config
grub-mkconfig -o /boot/grub/grub.cfg

# Manual /boot/grub/grub.cfg (alternative):
cat > /boot/grub/grub.cfg << "EOF"
set default=0
set timeout=5

insmod ext2
set root=(hd0,1)

menuentry "LFS 12.0 (Linux 6.4.12)" {
    linux /boot/vmlinuz-6.4.12-lfs root=/dev/sda2 ro
}
EOF
```

**Install to MBR:**
```bash
# For BIOS systems
grub-install /dev/sda

# For UEFI systems
grub-install --target=x86_64-efi --efi-directory=/boot/efi --bootloader-id=LFS
```

---

### Phase 12: Final System Configuration

**Duration:** 10-15 minutes
**Prerequisite:** Phase 11 completed, bootloader installed
**Target:** Complete system setup for first boot

| Step | Activity | Purpose | Duration | Deliverable |
|------|----------|---------|----------|-------------|
| 12.1 | Set root password | `passwd` | 1 min | Password set |
| 12.2 | Configure network | Edit /etc/sysconfig/ifconfig.eth0 | 3 min | Network configured |
| 12.3 | Create /etc/resolv.conf | DNS configuration | 2 min | DNS working |
| 12.4 | Configure system clock | Edit /etc/sysconfig/clock | 2 min | Clock configured |
| 12.5 | Create /etc/inputrc | Readline config | 2 min | Shell behavior set |
| 12.6 | Set console keymap | /etc/sysconfig/console | 2 min | Keyboard configured |
| 12.7 | Exit chroot | `logout` | 1 min | Chroot exited |
| 12.8 | Unmount filesystems | `umount -v $LFS/dev/pts`, etc. | 2 min | Clean unmount |

**Network Configuration:**
```bash
# /etc/sysconfig/ifconfig.eth0
ONBOOT=yes
IFACE=eth0
SERVICE=ipv4-static
IP=192.168.1.100
GATEWAY=192.168.1.1
PREFIX=24
BROADCAST=192.168.1.255
```

**/etc/resolv.conf:**
```
nameserver 8.8.8.8
nameserver 8.8.4.4
```

**System Clock:**
```bash
# /etc/sysconfig/clock
UTC=1
CLOCKPARAMS=
```

---

## 3. Deployment Milestones

### Milestone Checklist

| Milestone | Phases | Duration | Verification | Status Indicator |
|-----------|--------|----------|--------------|------------------|
| **M1: Host Preparation** | 1-2 | 25-53 min | WSL running, LFS directory created | ✓ Green |
| **M2: Source Acquisition** | 3 | 15-45 min | All packages downloaded & verified | ✓ Green |
| **M3: Build Environment** | 4-6 | 13-23 min | lfs user active, tools verified | ✓ Green |
| **M4: Chroot Ready** | 7-8 | 15-25 min | Chroot accessible, packages verified | ○ Yellow |
| **M5: System Config** | 9 | 8-12 min | Config files created | ○ Yellow |
| **M6: Bootable Kernel** | 10-11 | 33-55 min | Kernel + GRUB installed | ○ Yellow |
| **M7: Production Ready** | 12 | 10-15 min | Network configured, ready to boot | ○ Red |

**Status Legend:**
- ✓ Green: No dependencies, can start immediately
- ○ Yellow: Depends on previous milestone completion
- ○ Red: Critical path, requires all previous milestones

---

## 4. Alternative Deployment Paths

### Path A: Cloud Build (Recommended for Learning)

**Total Duration:** 50-60 minutes (hands-off)
**Prerequisites:** Firebase account, credit card for Cloud Run

| Step | Activity | Interface | Duration |
|------|----------|-----------|----------|
| 1 | Register account | Web UI | 3 min |
| 2 | Configure build options | Build wizard | 5 min |
| 3 | Submit build | Click "Submit" | 1 min |
| 4 | Monitor progress | Log viewer | 45-55 min |
| 5 | Download artifact | Signed URL | 5 min |

**Advantages:**
- No local resources consumed
- Guaranteed build environment
- Reproducible results
- Automated artifact storage

### Path B: Local Full Build

**Total Duration:** 4-8 hours
**Prerequisites:** Phases 1-9 completed

| Chapter | Packages | Duration | Cumulative |
|---------|----------|----------|------------|
| Chapter 5 | 18 packages | 45-60 min | 0:45-1:00 |
| Chapter 6 | 82 packages | 2:30-3:30 | 3:15-4:30 |
| Chapter 7 | Config files | 10-15 min | 3:25-4:45 |
| Chapter 8 | Kernel | 25-40 min | 3:50-5:25 |
| Chapter 9 | GRUB | 8-15 min | 3:58-5:40 |
| Testing | Verification | 15-30 min | 4:13-6:10 |

**Advantages:**
- Full control over build
- Learning experience
- Customizable kernel
- No cloud costs

---

## 5. Resource Requirements by Phase

### Disk Space Timeline

| Phase | Cumulative Usage | Description |
|-------|------------------|-------------|
| Phase 1-2 | 0 GB | Directory structure only |
| Phase 3 | 0.35 GB | Source packages downloaded |
| Phase 5 | 0.35 GB | Environment configured |
| Phase 7 | 1.2 GB | Chroot directories created |
| Chapter 5 | 3.5 GB | Toolchain built |
| Chapter 6 | 8.2 GB | Full system built |
| Chapter 8 | 9.5 GB | Kernel added |
| Final | 10.2 GB | Complete LFS system |

### Network Bandwidth

| Activity | Download Size | Upload Size |
|----------|---------------|-------------|
| WSL2 Ubuntu installation | 200 MB | 0 MB |
| Source packages (Option B) | 350 MB | 0 MB |
| Pre-built toolchain (Option A) | 436 MB | 0 MB |
| Cloud build submission | 2 KB | 0 MB |
| Artifact download | 520 MB | 0 MB |
| **Total (Cloud path)** | **1.2 GB** | **2 KB** |
| **Total (Local path)** | **550 MB** | **0 MB** |

### CPU Utilization

| Phase | CPU Load | Cores Used | Duration |
|-------|----------|------------|----------|
| Download phases | 5-10% | 1 | Variable |
| Compilation (GCC) | 85-95% | All (4) | 12-15 min |
| Compilation (Glibc) | 80-90% | All (4) | 18-22 min |
| Kernel build | 90-95% | All (4) | 20-30 min |
| Configuration | <5% | 1 | Minimal |

---

## 6. Critical Path Analysis

### Dependencies Chart

```
Phase 1 (WSL Setup)
    │
    ├──> Phase 2 (Mount Points)
    │       │
    │       └──> Phase 3 (Downloads)
    │               │
    │               ├──> Phase 4 (LFS User)
    │               │       │
    │               │       └──> Phase 5 (Environment)
    │               │               │
    │               │               └──> Phase 6 (Verify Tools)
    │               │                       │
    │               └───────────────────────┴──> Phase 7 (Chroot)
    │                                               │
    │                                               └──> Phase 8 (Verify Packages)
    │                                                       │
    │                                                       └──> Phase 9 (System Config)
    │                                                               │
    │                                                               └──> Phase 10 (Kernel)
    │                                                                       │
    │                                                                       └──> Phase 11 (GRUB)
    │                                                                               │
    └───────────────────────────────────────────────────────────────────────────────└──> Phase 12 (Final)
```

**Critical Path Duration:** 25 + 5 + 30 + 5 + 3 + 5 + 10 + 5 + 8 + 30 + 10 + 10 = **146 minutes minimum**

**With build time:** 146 + 180 (Chapter 5-6) = **326 minutes (5.4 hours)**

---

## 7. Rollback and Recovery Procedures

### Snapshot Points

| Snapshot | Phase Completed | Recovery Time | Disk Image Size |
|----------|-----------------|---------------|-----------------|
| SP1 | Phase 2 | 30 min | 0 GB |
| SP2 | Phase 3 | 20 min | 0.35 GB |
| SP3 | Phase 7 | 15 min | 1.2 GB |
| SP4 | Chapter 5 | 10 min | 3.5 GB |
| SP5 | Chapter 6 | 5 min | 8.2 GB |

**Recovery Commands:**
```bash
# Save snapshot after Phase 7
sudo tar -czf /backup/lfs-phase7-snapshot.tar.gz /mnt/lfs

# Restore from snapshot
sudo rm -rf /mnt/lfs/*
sudo tar -xzf /backup/lfs-phase7-snapshot.tar.gz -C /
```

---

## 8. Automated Deployment Scripts

### PowerShell Orchestration Script

**File:** `BUILD-LFS-CORRECT.ps1`

**Execution:**
```powershell
.\BUILD-LFS-CORRECT.ps1 -Phase All -Verbose
```

**Automated Steps:**
1. Checks WSL2 availability
2. Verifies disk space (20GB+ required)
3. Invokes `lfs-build.sh` in WSL
4. Monitors build progress via `CURRENT_BUILD_INFO.txt`
5. Displays real-time status updates
6. Handles errors with automatic retry (3 attempts)
7. Outputs final build report

**Duration:** 4-6 hours unattended

---

## References

- Installation wizard stages: `lfs-learning-platform/lib/data/wizard-stages.ts`
- Build orchestration: `lfs-build.sh`, `BUILD-LFS-CORRECT.ps1`
- LFS Book 12.0: https://www.linuxfromscratch.org/lfs/view/12.0/
- Deployment documentation: `docs/LOCAL-LFS-BUILD-ARCHITECTURE.md`
