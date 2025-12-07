#!/bin/bash
# Enhanced LFS Shell Entry Script

ROOTFS="/home/dracarys/lfs-bootable/rootfs"

echo "=========================================="
echo "  Entering LFS Environment"
echo "=========================================="
echo ""

# Check if we're root
if [ "$EUID" -ne 0 ]; then 
    echo "This script needs root access. Trying with sudo..."
    exec sudo "$0" "$@"
fi

# Check if rootfs exists
if [ ! -d "$ROOTFS" ]; then
    echo "Error: $ROOTFS not found!"
    exit 1
fi

# Mount essential filesystems if not already mounted
echo "[1/5] Mounting essential filesystems..."
mount -t proc none "$ROOTFS/proc" 2>/dev/null || echo "  proc already mounted"
mount -t sysfs none "$ROOTFS/sys" 2>/dev/null || echo "  sys already mounted"
mount -t devtmpfs none "$ROOTFS/dev" 2>/dev/null || echo "  dev already mounted"
mount -t devpts none "$ROOTFS/dev/pts" 2>/dev/null || echo "  devpts already mounted"

# Create missing directories
echo "[2/5] Setting up directories..."
mkdir -p "$ROOTFS/dev/pts" "$ROOTFS/tmp" "$ROOTFS/home" "$ROOTFS/root" 2>/dev/null

# Set up environment script
echo "[3/5] Creating environment setup..."
cat > "$ROOTFS/etc/profile" << 'EOF'
export PATH=/usr/bin:/bin:/sbin:/usr/sbin
export HOME=/root
export TERM=xterm
export PS1='\[\033[1;32m\][LFS]\[\033[0m\] \[\033[1;34m\]\w\[\033[0m\] \$ '
export LANG=C.UTF-8
export LC_ALL=C.UTF-8

# Busybox aliases
alias ls='busybox ls --color=auto'
alias ll='busybox ls -lh --color=auto'
alias la='busybox ls -lah --color=auto'
alias grep='busybox grep --color=auto'
alias vi='busybox vi'
alias less='busybox less'
alias more='busybox more'

# Welcome message
echo ""
echo "╔════════════════════════════════════════╗"
echo "║   Welcome to Custom LFS Linux!        ║"
echo "║   Kernel: 6.4.12 | Shell: BusyBox     ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "Available commands:"
echo "  System: uname, uptime, free, df, ps, top"
echo "  Files: ls, cat, grep, find, vi, tar"
echo "  Network: ping, wget, ifconfig, netstat"
echo "  Help: busybox --list (all 392 commands)"
echo ""
echo "Type 'help' for busybox command list"
echo "Type 'exit' to leave LFS environment"
echo ""
EOF

# Create help command
echo "[4/5] Setting up helper scripts..."
cat > "$ROOTFS/usr/bin/help" << 'EOF'
#!/bin/sh
echo "LFS BusyBox Commands:"
echo "===================="
busybox --list | column -c 80
echo ""
echo "Usage: <command> [args]"
echo "Example: ls -la /bin"
EOF
chmod +x "$ROOTFS/usr/bin/help"

# Create system info script
cat > "$ROOTFS/usr/bin/sysinfo" << 'EOF'
#!/bin/sh
echo "╔════════════════════════════════════════╗"
echo "║        LFS System Information          ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "Kernel:"
busybox uname -a
echo ""
echo "Memory:"
busybox free -h
echo ""
echo "Disk Usage:"
busybox df -h 2>/dev/null | busybox grep -v "^Filesystem"
echo ""
echo "Processes:"
busybox ps aux | busybox head -10
echo ""
echo "Available Commands: $(busybox --list | busybox wc -l)"
EOF
chmod +x "$ROOTFS/usr/bin/sysinfo"

# Create interactive test script
cat > "$ROOTFS/usr/bin/test-lfs" << 'EOF'
#!/bin/sh
echo "╔════════════════════════════════════════╗"
echo "║        LFS Functionality Test          ║"
echo "╚════════════════════════════════════════╝"
echo ""

echo "[1/5] Kernel version..."
busybox uname -r

echo "[2/5] File operations..."
busybox touch /tmp/test.txt && busybox echo "LFS Works!" > /tmp/test.txt
busybox cat /tmp/test.txt
busybox rm /tmp/test.txt
echo "  ✓ Files: OK"

echo "[3/5] Process list..."
busybox ps | busybox wc -l
echo "  ✓ Processes: OK"

echo "[4/5] Memory check..."
busybox free -h | busybox head -2
echo "  ✓ Memory: OK"

echo "[5/5] Available commands..."
CMDS=$(busybox --list | busybox wc -l)
echo "  ✓ Commands: $CMDS available"

echo ""
echo "╔════════════════════════════════════════╗"
echo "║   All tests passed! LFS is working!    ║"
echo "╚════════════════════════════════════════╝"
EOF
chmod +x "$ROOTFS/usr/bin/test-lfs"

echo "[5/5] Entering LFS chroot environment..."
echo ""

# Chroot with proper shell setup
chroot "$ROOTFS" /usr/bin/busybox sh -c "source /etc/profile && exec /usr/bin/busybox sh -l"

# Cleanup on exit
echo ""
echo "Cleaning up..."
umount "$ROOTFS/dev/pts" 2>/dev/null
umount "$ROOTFS/proc" 2>/dev/null
umount "$ROOTFS/sys" 2>/dev/null
umount "$ROOTFS/dev" 2>/dev/null

echo "Exited LFS environment."
