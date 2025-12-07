---
title: Downloading Kernel Source
description: Where and how to get Linux kernel source code
---

# Downloading Kernel Source

Get the Linux kernel source code for your LFS build.

## Official Sources
`ash
# From kernel.org
wget https://cdn.kernel.org/pub/linux/kernel/v6.x/linux-6.4.12.tar.xz

# Verify signature
wget https://cdn.kernel.org/pub/linux/kernel/v6.x/linux-6.4.12.tar.sign
xz -cd linux-6.4.12.tar.xz | gpg --verify linux-6.4.12.tar.sign -
`

## Extract
`ash
tar xvf linux-6.4.12.tar.xz
cd linux-6.4.12
`

→ [Configure Kernel](/docs/kernel-config)
