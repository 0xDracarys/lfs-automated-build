---
title: Command Line File Transfers
description: Transferring scripts and sources securely over FTP/SSH/HTTP protocols (wget, curl, rsync).
---

# Command Line File Transfers

Download and sync files from command-line.

## 1. Resuming Downloads
```bash
wget -c https://ftp.gnu.org/gnu/gcc/gcc-13.2.0/gcc-13.2.0.tar.xz
```

## 2. Directory Synchronization
```bash
rsync -avz /source/dir /dest/dir
```
