---
title: Kernel Compilation Troubleshooting
description: Resolving common compiler errors, unresolved symbol links, and missing firmware header problems.
---

# Kernel Compilation Troubleshooting

Identify and resolve compile-time warnings and boot errors.

## 1. Missing Compiler Headers
If the compilation fails with missing ssl headers:
```bash
# Fix: Install openssl dev packages on host
sudo apt-get install libssl-dev
```

## 2. Boot Panic: Unable to mount root fs
If the system boots into a panic:
- **Cause**: Ext4 filesystem driver was compiled as a module (`m`) instead of built-in (`y`).
- **Resolution**: Re-run `make menuconfig`, find Ext4 filesystem, and change its state to built-in.
