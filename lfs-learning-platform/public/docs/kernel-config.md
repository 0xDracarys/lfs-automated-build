---
title: Configuring the Linux Kernel
description: Detailed walkthrough on using menuconfig to select drivers, file systems, and processor architecture options.
---

# Configuring the Linux Kernel

Configure system drivers and parameters using the interactive configuration menu.

## 1. Entering Configuration Menu
Extract the source and run menuconfig:
```bash
tar -xf linux-6.4.12.tar.xz && cd linux-6.4.12
make menuconfig
```

## 2. Crucial Drivers & Built-ins
Ensure critical hardware drivers are compiled directly into the kernel (`[Y]` instead of `[M]`):
- **Filesystem**: Support for Ext4 (`CONFIG_EXT4_FS=y`)
- **Virtualization**: VirtIO Block & Network drivers for QEMU (`CONFIG_VIRTIO_BLK=y`, `CONFIG_VIRTIO_NET=y`)
- **Graphics**: Framebuffer Console support (`CONFIG_FB=y`)
