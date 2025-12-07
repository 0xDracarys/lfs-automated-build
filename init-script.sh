#!/bin/sh

echo ""
echo "========================================="
echo "   Welcome to Custom LFS Linux!"
echo "   Kernel: 6.4.12"
echo "   Built with GCC 13.2.0 Toolchain"
echo "========================================="
echo ""

# Mount essential filesystems
mount -t proc none /proc
mount -t sysfs none /sys
mount -t devtmpfs none /dev

echo "System initialized successfully!"
echo ""
echo "Type 'uname -a' to see kernel info"
echo "Type 'ls /bin' to see available commands"
echo ""

# Drop to shell
exec /bin/sh
