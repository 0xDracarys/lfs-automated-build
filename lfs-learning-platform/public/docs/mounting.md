---
title: Mounting & Unmounting Partitions
description: Mounting temporary partitions, loop mounts, and managing /etc/fstab config files.
---

# Mounting & Unmounting Partitions

Mount disk targets to filesystem paths.

## 1. Mounting target partition
```bash
mount -v -t ext4 /dev/sdb1 $LFS
```
