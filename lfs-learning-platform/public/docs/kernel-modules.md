---
title: Kernel Modules & Device Drivers
description: How to manage, load, and configure dynamic kernel modules (kmod, lsmod, modprobe).
---

# Kernel Modules & Device Drivers

Kernel modules are dynamic components loaded into the kernel on-demand without rebooting.

## 1. Checking Loaded Modules
Use `lsmod` to list current kernel modules:
```bash
lsmod
```

## 2. Manually Loading Modules
Load a driver or module with `modprobe`:
```bash
modprobe e1000e   # Example network driver
```

## 3. Automating Modprobe on Boot
List module names inside `/etc/sysconfig/modules` to load them automatically at system startup.
