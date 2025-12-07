---
title: Preparation
description: Setting up your build environment for LFS
---

# Preparation

Prepare your system for building Linux From Scratch.

## Create LFS Partition

```bash
# Create a new partition (example: /dev/sda3)
sudo fdisk /dev/sda

# Create ext4 filesystem
sudo mkfs -v -t ext4 /dev/sda3

# Create mount point
export LFS=/mnt/lfs
sudo mkdir -pv $LFS

# Mount partition
sudo mount -v -t ext4 /dev/sda3 $LFS
```

## Download Packages

All required packages (~500MB):

```bash
cd $LFS
mkdir -v sources
chmod -v a+wt sources
cd sources

# Download wget-list (list of all packages)
wget https://www.linuxfromscratch.org/lfs/downloads/stable/wget-list

# Download all packages
wget --input-file=wget-list --continue --directory-prefix=$LFS/sources
```

## Create Directory Structure

```bash
mkdir -pv $LFS/{etc,var} $LFS/usr/{bin,lib,sbin}

for i in bin lib sbin; do
  ln -sv usr/$i $LFS/$i
done

case $(uname -m) in
  x86_64) mkdir -pv $LFS/lib64 ;;
esac

mkdir -pv $LFS/tools
```

## Create LFS User

```bash
# Create lfs user
sudo groupadd lfs
sudo useradd -s /bin/bash -g lfs -m -k /dev/null lfs

# Set password
sudo passwd lfs

# Grant ownership
sudo chown -v lfs $LFS/{usr{,/*},lib,var,etc,bin,sbin,tools}
case $(uname -m) in
  x86_64) sudo chown -v lfs $LFS/lib64 ;;
esac
```

## Configure Environment

Create `~/.bash_profile`:

```bash
exec env -i HOME=$HOME TERM=$TERM PS1='\u:\w\$ ' /bin/bash
```

Create `~/.bashrc`:

```bash
set +h
umask 022
LFS=/mnt/lfs
LC_ALL=POSIX
LFS_TGT=$(uname -m)-lfs-linux-gnu
PATH=/usr/bin
if [ ! -L /bin ]; then PATH=/bin:$PATH; fi
PATH=$LFS/tools/bin:$PATH
CONFIG_SITE=$LFS/usr/share/config.site
export LFS LC_ALL LFS_TGT PATH CONFIG_SITE
```

Load the environment:

```bash
source ~/.bash_profile
```

## Verify Setup

```bash
echo $LFS      # Should show /mnt/lfs
echo $LFS_TGT  # Should show x86_64-lfs-linux-gnu
ls -la $LFS    # Should show directories
```

Ready to build? → [Quick Start Guide](/docs/quickstart)
