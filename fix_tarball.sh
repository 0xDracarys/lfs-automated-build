#!/bin/bash
set -e

echo 'Extracting tarball...'
mkdir -p /tmp/lfs-fix
cd /tmp/lfs-fix
rm -rf ./*
tar xzf /mnt/c/Users/jayma/Documents/Bhasker/LFS-cloud/lfs-system.tar.gz

echo 'Fixing symlinks...'
rm -rf bin lib sbin
ln -s usr/bin bin
ln -s usr/lib lib
ln -s usr/sbin sbin

echo 'Creating /etc/wsl.conf for proper boot...'
mkdir -p etc
cat << 'EOF' > etc/wsl.conf
[boot]
systemd=true

[automount]
enabled=true
EOF

echo 'Repackaging fixed tarball (this may take a minute)...'
tar czf /mnt/c/Users/jayma/Documents/Bhasker/LFS-cloud/lfs-system-fixed.tar.gz .
echo 'Done fixing tarball!'
