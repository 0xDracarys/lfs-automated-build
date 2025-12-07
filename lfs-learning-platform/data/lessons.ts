export interface Lesson {
  id: number;
  title: string;
  duration: string;
  content: string;
  commands?: { description: string; command: string }[];
}

export interface Module {
  id: number;
  title: string;
  description: string;
  lessons: Lesson[];
}

export const modulesData: Module[] = [
  {
    id: 1,
    title: "Environment Setup",
    description: "Prepare your system for building LFS",
    lessons: [
      {
        id: 1,
        title: "Prerequisites",
        duration: "10 min",
        content: `# Prerequisites for LFS Build

Before starting, ensure your host system has all required tools.

## Required Packages

Install these on Ubuntu/Debian:
\`\`\`bash
sudo apt update
sudo apt install -y build-essential bison flex texinfo gawk patch wget xz-utils
\`\`\`

## Verify Installation

Run these commands to verify each tool is available.`,
        commands: [
          { description: "Check Bash version (needs 3.2+)", command: "bash --version" },
          { description: "Check GCC version (needs 5.2+)", command: "gcc --version" },
          { description: "Check Make version (needs 4.0+)", command: "make --version" },
          { description: "Check Bison version", command: "bison --version" },
          { description: "Check available disk space (need 10GB+)", command: "df -h" },
        ]
      },
      {
        id: 2,
        title: "Create LFS Directory",
        duration: "5 min",
        content: `# Setting Up the LFS Directory

Create the directory structure where we'll build our Linux system.

## Directory Structure

- \`/mnt/lfs\` - Root of our new system
- \`/mnt/lfs/sources\` - Downloaded source tarballs
- \`/mnt/lfs/tools\` - Temporary toolchain`,
        commands: [
          { description: "Set LFS variable", command: "export LFS=/mnt/lfs" },
          { description: "Create LFS root directory", command: "sudo mkdir -pv $LFS" },
          { description: "Take ownership", command: "sudo chown -v $USER $LFS" },
          { description: "Create directory structure", command: "mkdir -pv $LFS/{bin,boot,etc,lib,lib64,sbin,usr,var,tools,sources}" },
          { description: "Create usr subdirectories", command: "mkdir -pv $LFS/usr/{bin,lib,sbin,include}" },
          { description: "Set sources permissions", command: "chmod -v a+wt $LFS/sources" },
          { description: "Create /tools symlink", command: "sudo ln -sv $LFS/tools /tools" },
        ]
      },
      {
        id: 3,
        title: "Environment Variables",
        duration: "5 min",
        content: `# Configure Build Environment

Set up environment variables that will be used throughout the build process.

## Key Variables

- \`LFS\` - Points to /mnt/lfs
- \`LFS_TGT\` - Target triplet for cross-compilation
- \`PATH\` - Prioritizes our tools directory
- \`MAKEFLAGS\` - Enables parallel compilation`,
        commands: [
          { description: "Set LFS root", command: "export LFS=/mnt/lfs" },
          { description: "Set target triplet", command: "export LFS_TGT=$(uname -m)-lfs-linux-gnu" },
          { description: "Set PATH", command: "export PATH=/tools/bin:/usr/bin:/bin" },
          { description: "Enable parallel make", command: "export MAKEFLAGS=\"-j$(nproc)\"" },
          { description: "Set locale", command: "export LC_ALL=POSIX" },
        ]
      }
    ]
  },
  {
    id: 2,
    title: "Download Sources",
    description: "Get all required source packages",
    lessons: [
      {
        id: 1,
        title: "Core Toolchain Sources",
        duration: "15 min",
        content: `# Download Core Packages

These are the essential packages for building the cross-toolchain.

## Packages

- **Binutils 2.41** - Assembler and linker
- **GCC 13.2.0** - GNU Compiler Collection
- **Linux 6.4.12** - Kernel headers
- **Glibc 2.38** - GNU C Library`,
        commands: [
          { description: "Change to sources directory", command: "cd $LFS/sources" },
          { description: "Download Binutils", command: "wget https://ftp.osuosl.org/pub/lfs/lfs-packages/12.0/binutils-2.41.tar.xz" },
          { description: "Download GCC", command: "wget https://ftp.osuosl.org/pub/lfs/lfs-packages/12.0/gcc-13.2.0.tar.xz" },
          { description: "Download Linux kernel", command: "wget https://ftp.osuosl.org/pub/lfs/lfs-packages/12.0/linux-6.4.12.tar.xz" },
          { description: "Download Glibc", command: "wget https://ftp.osuosl.org/pub/lfs/lfs-packages/12.0/glibc-2.38.tar.xz" },
        ]
      },
      {
        id: 2,
        title: "GCC Prerequisites",
        duration: "5 min",
        content: `# GCC Prerequisites

GCC requires these math libraries to be present in its source tree.

## Required Libraries

- **MPFR** - Multiple Precision Floating-Point
- **GMP** - GNU Multiple Precision Arithmetic
- **MPC** - Multiple Precision Complex`,
        commands: [
          { description: "Download MPFR", command: "wget https://ftp.osuosl.org/pub/lfs/lfs-packages/12.0/mpfr-4.2.0.tar.xz" },
          { description: "Download GMP", command: "wget https://ftp.osuosl.org/pub/lfs/lfs-packages/12.0/gmp-6.3.0.tar.xz" },
          { description: "Download MPC", command: "wget https://ftp.osuosl.org/pub/lfs/lfs-packages/12.0/mpc-1.3.1.tar.gz" },
        ]
      }
    ]
  },
  {
    id: 3,
    title: "Build Toolchain",
    description: "Compile the cross-compilation toolchain",
    lessons: [
      {
        id: 1,
        title: "Binutils Pass 1",
        duration: "15 min",
        content: `# Building Binutils (Pass 1)

Binutils provides the assembler and linker needed by GCC.

## What Gets Built

- **as** - GNU Assembler
- **ld** - GNU Linker
- **ar** - Archive utility
- **objdump** - Object file analyzer`,
        commands: [
          { description: "Go to sources", command: "cd $LFS/sources" },
          { description: "Extract Binutils", command: "tar -xf binutils-2.41.tar.xz" },
          { description: "Enter directory", command: "cd binutils-2.41" },
          { description: "Create build directory", command: "mkdir -v build && cd build" },
          { description: "Configure", command: "../configure --prefix=/tools --with-sysroot=$LFS --target=$LFS_TGT --disable-nls --enable-gprofng=no --disable-werror" },
          { description: "Compile", command: "make" },
          { description: "Install", command: "make install" },
          { description: "Cleanup", command: "cd $LFS/sources && rm -rf binutils-2.41" },
        ]
      },
      {
        id: 2,
        title: "GCC Pass 1",
        duration: "60 min",
        content: `# Building GCC (Pass 1)

The first GCC pass creates a cross-compiler that runs on the host but produces code for LFS.

## Configuration Notes

- \`--target=$LFS_TGT\` - Cross-compile for LFS
- \`--with-newlib\` - No C library yet
- \`--without-headers\` - No system headers yet
- \`--disable-shared\` - Static libraries only`,
        commands: [
          { description: "Extract GCC", command: "cd $LFS/sources && tar -xf gcc-13.2.0.tar.xz && cd gcc-13.2.0" },
          { description: "Extract MPFR", command: "tar -xf ../mpfr-4.2.0.tar.xz && mv mpfr-4.2.0 mpfr" },
          { description: "Extract GMP", command: "tar -xf ../gmp-6.3.0.tar.xz && mv gmp-6.3.0 gmp" },
          { description: "Extract MPC", command: "tar -xf ../mpc-1.3.1.tar.gz && mv mpc-1.3.1 mpc" },
          { description: "Fix for x86_64", command: "case $(uname -m) in x86_64) sed -e '/m64=/s/lib64/lib/' -i.orig gcc/config/i386/t-linux64 ;; esac" },
          { description: "Create build dir", command: "mkdir -v build && cd build" },
          { description: "Configure GCC", command: "../configure --target=$LFS_TGT --prefix=/tools --with-glibc-version=2.38 --with-sysroot=$LFS --with-newlib --without-headers --enable-default-pie --enable-default-ssp --disable-nls --disable-shared --disable-multilib --disable-threads --disable-libatomic --disable-libgomp --disable-libquadmath --disable-libssp --disable-libvtv --disable-libstdcxx --enable-languages=c,c++" },
          { description: "Compile (takes ~1 hour)", command: "make" },
          { description: "Install", command: "make install" },
          { description: "Create limits.h", command: "cd .. && cat gcc/limitx.h gcc/glimits.h gcc/limity.h > $(dirname $($LFS_TGT-gcc -print-libgcc-file-name))/install-tools/include/limits.h" },
          { description: "Cleanup", command: "cd $LFS/sources && rm -rf gcc-13.2.0" },
        ]
      },
      {
        id: 3,
        title: "Linux Headers",
        duration: "10 min",
        content: `# Installing Linux API Headers

The kernel headers define the interface between user-space programs and the kernel.

## What Gets Installed

Header files in \`$LFS/usr/include\` that define:
- System calls
- Data structures
- Constants`,
        commands: [
          { description: "Extract kernel", command: "cd $LFS/sources && tar -xf linux-6.4.12.tar.xz && cd linux-6.4.12" },
          { description: "Clean source tree", command: "make mrproper" },
          { description: "Build headers", command: "make headers" },
          { description: "Remove non-headers", command: "find usr/include -type f ! -name '*.h' -delete" },
          { description: "Install headers", command: "cp -rv usr/include $LFS/usr/" },
          { description: "Cleanup", command: "cd $LFS/sources && rm -rf linux-6.4.12" },
        ]
      },
      {
        id: 4,
        title: "Glibc",
        duration: "30 min",
        content: `# Building Glibc

The GNU C Library provides the core system functions that all programs use.

## Key Functions

- Memory allocation (malloc)
- File I/O (open, read, write)
- Process control (fork, exec)
- String handling`,
        commands: [
          { description: "Extract Glibc", command: "cd $LFS/sources && tar -xf glibc-2.38.tar.xz && cd glibc-2.38" },
          { description: "Create lib64 symlink (x86_64)", command: "case $(uname -m) in x86_64) ln -sfv ../lib/ld-linux-x86-64.so.2 $LFS/lib64 ;; esac" },
          { description: "Create build directory", command: "mkdir -v build && cd build" },
          { description: "Set sbin directory", command: "echo 'rootsbindir=/usr/sbin' > configparms" },
          { description: "Configure Glibc", command: "../configure --prefix=/usr --host=$LFS_TGT --build=$(../scripts/config.guess) --enable-kernel=3.2 --with-headers=$LFS/usr/include libc_cv_slibdir=/lib" },
          { description: "Compile", command: "make" },
          { description: "Install", command: "make DESTDIR=$LFS install" },
          { description: "Fix ldd paths", command: "sed '/RTLDLIST=/s@/usr@@g' -i $LFS/usr/bin/ldd" },
          { description: "Cleanup", command: "cd $LFS/sources && rm -rf glibc-2.38" },
        ]
      },
      {
        id: 5,
        title: "Verify Toolchain",
        duration: "5 min",
        content: `# Verify the Toolchain

Test that the cross-compiler works correctly and links against our new Glibc.

## Expected Output

The readelf command should show:
\`[Requesting program interpreter: /lib64/ld-linux-x86-64.so.2]\``,
        commands: [
          { description: "Create test program", command: "echo 'int main(){}' | $LFS_TGT-gcc -xc -" },
          { description: "Check dynamic linker", command: "readelf -l a.out | grep ld-linux" },
          { description: "Remove test file", command: "rm -v a.out" },
        ]
      }
    ]
  },
  {
    id: 4,
    title: "Kernel Compilation",
    description: "Build and configure the Linux kernel",
    lessons: [
      {
        id: 1,
        title: "Kernel Configuration",
        duration: "20 min",
        content: `# Configuring the Linux Kernel

The kernel configuration determines what features and drivers are included.

## Configuration Methods

- \`make menuconfig\` - Text-based menu (recommended)
- \`make defconfig\` - Default configuration
- \`make oldconfig\` - Update existing config`,
        commands: [
          { description: "Extract kernel", command: "cd $LFS/sources && tar -xf linux-6.4.12.tar.xz && cd linux-6.4.12" },
          { description: "Clean source tree", command: "make mrproper" },
          { description: "Start configuration", command: "make menuconfig" },
        ]
      },
      {
        id: 2,
        title: "Compile Kernel",
        duration: "30 min",
        content: `# Compiling the Kernel

Build the kernel image and modules.

## Output Files

- \`arch/x86/boot/bzImage\` - Compressed kernel
- \`System.map\` - Symbol table
- Kernel modules in various directories`,
        commands: [
          { description: "Compile kernel", command: "make" },
          { description: "Install modules", command: "make modules_install INSTALL_MOD_PATH=$LFS" },
          { description: "Copy kernel image", command: "cp -v arch/x86/boot/bzImage $LFS/boot/vmlinuz-6.4.12-lfs" },
          { description: "Copy System.map", command: "cp -v System.map $LFS/boot/System.map-6.4.12" },
          { description: "Copy config", command: "cp -v .config $LFS/boot/config-6.4.12" },
        ]
      }
    ]
  }
];

export function getModuleById(id: number): Module | undefined {
  return modulesData.find(m => m.id === id);
}

export function getLesson(moduleId: number, lessonId: number): Lesson | undefined {
  const module = getModuleById(moduleId);
  return module?.lessons.find(l => l.id === lessonId);
}
