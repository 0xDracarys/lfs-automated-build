---
title: Essential LFS Commands & Reference
description: Quick reference for the most critical Linux From Scratch build commands and filesystem operations.
---

# Essential LFS Commands

Here is the authoritative reference sheet for core LFS compilation and system setup commands.

---

## 1. Environment & Chroot Preparation

```bash
# Export LFS variable
export LFS=/mnt/lfs

# Mount kernel virtual filesystems before chroot
sudo mount -v --bind /dev $LFS/dev
sudo mount -vt devpts devpts $LFS/dev/pts -o gid=5,mode=620
sudo mount -vt proc proc $LFS/proc
sudo mount -vt sysfs sysfs $LFS/sys
sudo mount -vt tmpfs tmpfs $LFS/run
```

---

## 2. Entering Chroot

```bash
sudo chroot "$LFS" /usr/bin/env -i \
    HOME=/root \
    TERM="$TERM" \
    PS1='(lfs chroot) \u:\w\$ ' \
    PATH=/usr/bin:/usr/sbin \
    /bin/bash --login
```

---

## 3. Parallel Compilation Standard

Always leverage multi-core compilation during GCC and Linux build stages:

```bash
make -j$(nproc)
make install
```
