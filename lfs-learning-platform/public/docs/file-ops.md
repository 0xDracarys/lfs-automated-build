---
title: File & Directory Operations
description: Reference for navigating directories, creating symlinks, copy, move, and recursive folder deletions.
---

# File & Directory Operations

Essential commands to navigate and manage directories within LFS filesystem structure.

## 1. Safe Deletion & Backup
Use `cp` and `mv` with backup option:
```bash
cp --backup=numbered source_file dest_file
```

## 2. Symbolic & Hard Links
Links allow multiple paths to reference the same file or directory:
```bash
# Create symbolic link
ln -s /usr/bin/bash /bin/sh
```
