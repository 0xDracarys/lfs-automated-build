---
title: Package Compilations & Tarballs
description: Step-by-step generic configuration, compilation, and clean installation of standard packages.
---

# Package Compilations & Tarballs

Compile standard tarball packages using GNU autotools.

## 1. Standard Compile Flow
```bash
./configure --prefix=/usr --sysconfdir=/etc
make -j$(nproc)
make install
```
