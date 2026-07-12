---
title: Linux Kernel 6.4.12 Compilation & Architecture Notes
description: Detailed technical guide on compiling a bootable monolithic Linux Kernel from source for LFS.
---

# Linux Kernel 6.4.12 Architecture & Build Guide

Compiling the Linux Kernel is the defining milestone of the LFS journey. This note covers our configuration choices and build automation for kernel `v6.4.12`.

---

## 1. Cleaning & Defconfig

Before configuring the kernel tree, ensure no previous build artifacts remain:

```bash
cd /mnt/lfs/sources/linux-6.4.12
make mrproper
make defconfig
```

---

## 2. Essential Configuration Flags

To ensure our LFS kernel boots cleanly on both virtual machines (QEMU/KVM) and physical hardware, we enable key drivers:

- `CONFIG_BLK_DEV_INITRD=y` — Initial RAM disk support
- `CONFIG_EXT4_FS=y` — ext4 root filesystem driver compiled directly into the kernel
- `CONFIG_VIRTIO_BLK=y` — High-speed virtual disk drivers
- `CONFIG_NETDEVICES=y` — Core networking stack

---

## 3. Compiling the Kernel Image (`bzImage`)

Compile the compressed bootable kernel image and modules:

```bash
make -j$(nproc) bzImage
make -j$(nproc) modules
make modules_install
```

---

## 4. Installing Boot Artifacts

Copy the kernel image and symbol lookup table to `/boot`:

```bash
cp -v arch/x86/boot/bzImage /boot/vmlinuz-6.4.12-lfs
cp -v System.map /boot/System.map-6.4.12
cp -v .config /boot/config-6.4.12
```

Your LFS kernel image is now ready for GRUB or direct QEMU/Syslinux bootloader integration!
