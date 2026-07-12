---
title: User Permissions & Ownership
description: Understanding chmod, chown, user groups, and the Linux permission matrix.
---

# User Permissions & Ownership

Control system security settings by modifying read, write, and execute bits.

## 1. Modifying Permissions
Grant execute permission:
```bash
chmod +x start-build.sh
```

## 2. Taking Ownership
Change owner and group:
```bash
sudo chown -R lfs:lfs $LFS
```
