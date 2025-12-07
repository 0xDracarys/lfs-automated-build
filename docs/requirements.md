---
title: System Requirements
description: Hardware and software prerequisites for building LFS
---

# System Requirements

Before starting your Linux From Scratch build, ensure your system meets these requirements.

## Hardware Requirements

### Minimum Specifications
- **CPU**: 64-bit processor (x86_64/amd64)
- **RAM**: 4GB (8GB+ recommended for faster builds)
- **Disk Space**: 20GB free space minimum
- **Internet**: Stable connection for downloading packages (~500MB)

### Recommended Specifications
- **CPU**: Multi-core processor (4+ cores ideal)
- **RAM**: 8GB or more
- **Disk Space**: 30GB+ (for comfort and experiments)
- **SSD**: Significantly faster build times

## Software Requirements

### Host System
You need a working Linux distribution as your host:
- Ubuntu 20.04+, Debian 11+, Fedora 35+, openSUSE, Arch Linux
- Or any modern Linux distribution

### Required Packages

#### Debian/Ubuntu:
```bash
sudo apt install build-essential bison flex texinfo gawk m4 \
  wget cpio python3 bc rsync
```

#### Fedora/RHEL:
```bash
sudo dnf groupinstall "Development Tools"
sudo dnf install bison flex texinfo gawk m4 wget cpio python3 bc rsync
```

#### Arch Linux:
```bash
sudo pacman -S base-devel bison flex texinfo gawk m4 wget cpio python bc rsync
```

## Version Requirements

Your host system tools must meet these minimum versions:

| Tool | Minimum Version | Check Command |
|------|----------------|---------------|
| Bash | 3.2 | `bash --version` |
| Binutils | 2.13.1 | `ld --version` |
| Bison | 2.7 | `bison --version` |
| Coreutils | 6.9 | `ls --version` |
| GCC | 5.1 | `gcc --version` |
| Gawk | 4.0.1 | `gawk --version` |
| Make | 4.0 | `make --version` |
| Patch | 2.5.4 | `patch --version` |
| Perl | 5.8.8 | `perl -V:version` |
| Python | 3.4 | `python3 --version` |
| Sed | 4.1.5 | `sed --version` |
| Tar | 1.22 | `tar --version` |
| Texinfo | 4.7 | `makeinfo --version` |
| Xz | 5.0.0 | `xz --version` |

### Version Check Script

Save this as `version-check.sh`:

```bash
#!/bin/bash
# LFS Version Check Script

export LC_ALL=C
bash --version | head -n1 | cut -d" " -f2-4
MYSH=$(readlink -f /bin/sh)
echo "/bin/sh -> $MYSH"
echo $MYSH | grep -q bash || echo "ERROR: /bin/sh does not point to bash"
unset MYSH

echo -n "Binutils: "; ld --version | head -n1 | cut -d" " -f3-
bison --version | head -n1

if [ -h /usr/bin/yacc ]; then
  echo "/usr/bin/yacc -> `readlink -f /usr/bin/yacc`";
elif [ -x /usr/bin/yacc ]; then
  echo yacc is `/usr/bin/yacc --version | head -n1`
else
  echo "yacc not found"
fi

echo -n "Coreutils: "; chown --version | head -n1 | cut -d")" -f2
diff --version | head -n1
find --version | head -n1
gawk --version | head -n1

if [ -h /usr/bin/awk ]; then
  echo "/usr/bin/awk -> `readlink -f /usr/bin/awk`";
elif [ -x /usr/bin/awk ]; then
  echo awk is `/usr/bin/awk --version | head -n1`
else
  echo "awk not found"
fi

gcc --version | head -n1
g++ --version | head -n1
grep --version | head -n1
gzip --version | head -n1
cat /proc/version
m4 --version | head -n1
make --version | head -n1
patch --version | head -n1
echo Perl `perl -V:version`
python3 --version
sed --version | head -n1
tar --version | head -n1
makeinfo --version | head -n1
xz --version | head -n1

echo 'int main(){}' > dummy.c && g++ -o dummy dummy.c
if [ -x dummy ]
  then echo "g++ compilation OK";
  else echo "g++ compilation failed"; fi
rm -f dummy.c dummy
```

Run it:
```bash
bash version-check.sh
```

## Time Requirements

Approximate build times (varies by hardware):

| Hardware | Time |
|----------|------|
| Modern i7/Ryzen 7 (8 cores, SSD) | 3-5 hours |
| i5/Ryzen 5 (4 cores, SSD) | 6-10 hours |
| i3/Older CPU (2 cores, HDD) | 15-24 hours |
| Virtual Machine | 12-20 hours |

**Your Time**: 2-4 hours active work + build time

## Disk Space Breakdown

| Component | Space Required |
|-----------|---------------|
| Source packages | ~500 MB |
| Build directory | ~10 GB (temporary) |
| Final LFS system | ~2-4 GB |
| **Total during build** | **~15 GB** |
| **After cleanup** | **~3-5 GB** |

## Network Requirements

### Bandwidth
- Download ~500MB of source packages
- Can download in advance (recommended)

### Mirrors
Use nearby mirrors for faster downloads:
- Official: `ftp.gnu.org`
- Kernel: `www.kernel.org`
- Sourceforge mirrors

## Knowledge Prerequisites

### Required Knowledge
- ✅ Basic Linux commands (cd, ls, mkdir, etc.)
- ✅ Text editor usage (vi, nano, or emacs)
- ✅ Understanding of file permissions
- ✅ Command line comfort

### Helpful (Not Required)
- Understanding of compilation process
- Basic scripting knowledge
- Familiarity with make and configure

### Not Required
- C programming
- Advanced Linux administration
- Kernel development experience

## Testing Your System

Before proceeding, verify:

```bash
# Check available disk space
df -h /path/to/lfs/partition

# Check RAM
free -h

# Check CPU cores
nproc

# Check kernel version
uname -r

# Verify all required tools
for tool in bash bc bison bzip2 gawk gcc make patch perl python3 sed tar; do
  which $tool > /dev/null && echo "✓ $tool" || echo "✗ $tool MISSING"
done
```

## Virtual Machine Considerations

Building LFS in a VM is supported:

### Pros
- Safe testing environment
- Easy snapshots/backups
- Can experiment freely

### Cons
- Slower build times (no hardware acceleration)
- Need more host RAM (8GB+ recommended)
- Nested virtualization may cause issues

### Recommended VM Settings
- **RAM**: 4GB minimum, 8GB ideal
- **Disk**: 30GB thin-provisioned
- **CPUs**: 2-4 cores
- **Type**: VirtualBox, VMware, or KVM

## Next Steps

System ready? Let's prepare your build environment:

1. ✅ [Prepare Build Environment →](/docs/preparation)
2. ✅ [Quick Start Guide →](/docs/quickstart)

---

**Your system is ready to build LFS!** 🚀
