---
title: Kernel Configuration Guide
description: Using menuconfig to customize your Linux kernel
---

# Kernel Configuration

Configure your Linux kernel using menuconfig.

## Basic Configuration

```bash
cd linux-6.4.12
make menuconfig
```

## Essential Options

### Enable
- **General setup** → Local version (add "-lfs")
- **Processor type** → Your CPU family
- **Device Drivers** → Your hardware drivers
- **File systems** → ext4, proc, sysfs, devtmpfs
- **Networking support** → TCP/IP networking

### Disable
- Unnecessary drivers you don't have
- Debug options (for production)
- Module versioning (unless needed)

## Save Configuration

Save as `.config` and exit.

## Next Steps

```bash
make
make modules_install
cp arch/x86/boot/bzImage /boot/vmlinuz-6.4.12-lfs
```

→ [Compile Kernel](/docs/kernel-compile)
