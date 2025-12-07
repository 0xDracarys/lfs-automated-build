/**
 * Additional Learning Modules
 * Complete LFS course content covering all build stages
 */

import { Module } from '@/lib/types/learning';

export const MODULE_4: Module = {
  id: '4',
  title: 'Cross-Compilation Toolchain',
  description: 'Build Binutils, GCC, and Glibc - the foundation of your LFS system',
  icon: 'layers',
  duration: '120 min',
  difficulty: 'Advanced',
  totalLessons: 4,
  color: 'from-orange-500 to-red-500',
  interestingFacts: [],
  funFacts: [],
  lessons: [
    {
      id: 'lesson-4-1',
      moduleId: '4',
      title: 'Binutils Pass 1',
      description: 'Build the assembler and linker',
      content: `<h2>Building Binutils (Pass 1)</h2>
<p>Binutils provides the assembler (as) and linker (ld) that GCC needs. This is the first package we build because both GCC and Glibc depend on it.</p>

<h3>What Binutils Provides:</h3>
<ul>
  <li><strong>as</strong> - GNU Assembler</li>
  <li><strong>ld</strong> - GNU Linker</li>
  <li><strong>ar</strong> - Archive utility for static libraries</li>
  <li><strong>objdump</strong> - Object file analyzer</li>
  <li><strong>strip</strong> - Remove symbols from binaries</li>
</ul>

<h3>Why Two Passes?</h3>
<p>We build a cross-compiler first (Pass 1) that runs on the host but produces code for LFS. Later, we rebuild everything natively inside the LFS system.</p>`,
      duration: 30,
      order: 1,
      codeExamples: [
        {
          id: 'ce-4-1-1',
          title: 'Configure and Build Binutils',
          code: `cd $LFS/sources
tar -xf binutils-2.41.tar.xz
cd binutils-2.41
mkdir -v build && cd build

../configure --prefix=$LFS/tools \\
  --with-sysroot=$LFS \\
  --target=$LFS_TGT \\
  --disable-nls \\
  --enable-gprofng=no \\
  --disable-werror

make
make install`,
          language: 'bash',
          explanation: 'Configure builds for the target triplet, installs to $LFS/tools'
        }
      ],
      faqs: [
        { id: 'faq-4-1-1', question: 'What is a target triplet?', answer: 'A target triplet like x86_64-lfs-linux-gnu describes the CPU architecture, vendor, and OS. It tells the compiler what kind of code to generate.', category: 'Compilation' }
      ],
      interestingFacts: [
        { id: 'if-4-1-1', title: 'Binutils History', description: 'Binutils has been part of GNU since 1988 and is essential for any compiled language.', category: 'History', source: 'GNU Project' }
      ],
      funFacts: [
        { id: 'ff-4-1-1', fact: 'The GNU linker can handle over 100 different object file formats!', difficulty: 'medium' }
      ],
      quiz: [
        { id: 'q-4-1-1', question: 'What does the assembler (as) do?', options: ['Compiles C code', 'Converts assembly to machine code', 'Links object files', 'Manages packages'], correctAnswer: 1, explanation: 'The assembler converts human-readable assembly language into machine code object files.', difficulty: 'easy' }
      ]
    },
    {
      id: 'lesson-4-2',
      moduleId: '4',
      title: 'GCC Pass 1',
      description: 'Build the cross-compiler',
      content: `<h2>Building GCC (Pass 1)</h2>
<p>GCC (GNU Compiler Collection) is the heart of the toolchain. This first pass creates a cross-compiler that runs on your host but produces code for the LFS target.</p>

<h3>GCC Prerequisites:</h3>
<ul>
  <li><strong>GMP</strong> - GNU Multiple Precision Arithmetic Library</li>
  <li><strong>MPFR</strong> - Multiple Precision Floating-Point</li>
  <li><strong>MPC</strong> - Multiple Precision Complex</li>
</ul>

<h3>Key Configure Options:</h3>
<ul>
  <li><code>--target=$LFS_TGT</code> - Cross-compile for LFS</li>
  <li><code>--with-newlib</code> - No C library available yet</li>
  <li><code>--without-headers</code> - No system headers yet</li>
  <li><code>--disable-shared</code> - Static libraries only</li>
</ul>`,
      duration: 45,
      order: 2,
      codeExamples: [
        {
          id: 'ce-4-2-1',
          title: 'Build GCC Pass 1',
          code: `cd $LFS/sources
tar -xf gcc-13.2.0.tar.xz
cd gcc-13.2.0

# Extract prerequisites into GCC source tree
tar -xf ../mpfr-4.2.0.tar.xz && mv mpfr-4.2.0 mpfr
tar -xf ../gmp-6.3.0.tar.xz && mv gmp-6.3.0 gmp
tar -xf ../mpc-1.3.1.tar.gz && mv mpc-1.3.1 mpc

# Fix for x86_64
case $(uname -m) in
  x86_64) sed -e '/m64=/s/lib64/lib/' -i.orig gcc/config/i386/t-linux64 ;;
esac

mkdir build && cd build
../configure --target=$LFS_TGT --prefix=$LFS/tools \\
  --with-glibc-version=2.38 --with-sysroot=$LFS \\
  --with-newlib --without-headers \\
  --enable-languages=c,c++ --disable-shared

make && make install`,
          language: 'bash',
          explanation: 'This builds a minimal cross-compiler. Takes about 1 hour.'
        }
      ],
      faqs: [
        { id: 'faq-4-2-1', question: 'Why does GCC take so long to compile?', answer: 'GCC is a massive project with millions of lines of code. It also bootstraps itself multiple times to ensure correctness.', category: 'Performance' }
      ],
      interestingFacts: [],
      funFacts: [
        { id: 'ff-4-2-1', fact: 'GCC supports over 60 different programming languages through its frontend architecture!', difficulty: 'hard' }
      ],
      quiz: [
        { id: 'q-4-2-1', question: 'Why do we use --with-newlib in Pass 1?', options: ['For better performance', 'Because Glibc is not built yet', 'To enable debugging', 'For smaller binaries'], correctAnswer: 1, explanation: 'We use --with-newlib because the C library (Glibc) has not been built yet. This tells GCC not to expect one.', difficulty: 'medium' }
      ]
    },

    {
      id: 'lesson-4-3',
      moduleId: '4',
      title: 'Linux API Headers',
      description: 'Install kernel headers for userspace',
      content: `<h2>Linux API Headers</h2>
<p>The Linux kernel exposes an API that userspace programs use to interact with the kernel. These headers define system calls, data structures, and constants.</p>

<h3>What Gets Installed:</h3>
<ul>
  <li>System call definitions</li>
  <li>Data structures (file descriptors, signals, etc.)</li>
  <li>Constants and macros</li>
  <li>ioctl definitions for device drivers</li>
</ul>

<h3>Important Note:</h3>
<p>We only install the headers, not the kernel itself. The kernel will be compiled later after all packages are built.</p>`,
      duration: 15,
      order: 3,
      codeExamples: [
        {
          id: 'ce-4-3-1',
          title: 'Install Linux Headers',
          code: `cd $LFS/sources
tar -xf linux-6.4.12.tar.xz
cd linux-6.4.12

make mrproper        # Clean source tree
make headers         # Generate headers
find usr/include -type f ! -name '*.h' -delete
cp -rv usr/include $LFS/usr`,
          language: 'bash',
          explanation: 'Extract headers from kernel source and install to $LFS/usr/include'
        }
      ],
      faqs: [
        { id: 'faq-4-3-1', question: 'Why do we need kernel headers?', answer: 'Glibc and other programs need to know how to communicate with the kernel. The headers define the interface.', category: 'System' }
      ],
      interestingFacts: [],
      funFacts: [
        { id: 'ff-4-3-1', fact: 'The Linux kernel has over 400 system calls that userspace programs can use!', difficulty: 'easy' }
      ],
      quiz: [
        { id: 'q-4-3-1', question: 'What does "make mrproper" do?', options: ['Compiles the kernel', 'Cleans all generated files', 'Installs modules', 'Configures options'], correctAnswer: 1, explanation: 'make mrproper removes all generated files, ensuring a clean source tree.', difficulty: 'easy' }
      ]
    },
    {
      id: 'lesson-4-4',
      moduleId: '4',
      title: 'Glibc - The C Library',
      description: 'Build the GNU C Library',
      content: `<h2>Building Glibc</h2>
<p>Glibc (GNU C Library) is the most important library in a Linux system. Almost every program depends on it for basic functionality.</p>

<h3>What Glibc Provides:</h3>
<ul>
  <li><strong>Memory allocation</strong> - malloc, free, realloc</li>
  <li><strong>File I/O</strong> - open, read, write, close</li>
  <li><strong>Process control</strong> - fork, exec, wait</li>
  <li><strong>String handling</strong> - strcpy, strlen, strcmp</li>
  <li><strong>Math functions</strong> - sin, cos, sqrt</li>
  <li><strong>Dynamic linking</strong> - ld-linux.so</li>
</ul>

<h3>The Dynamic Linker:</h3>
<p>Glibc includes ld-linux.so, which loads shared libraries at runtime. This is why the "interpreter" in ELF binaries points to it.</p>`,
      duration: 30,
      order: 4,
      codeExamples: [
        {
          id: 'ce-4-4-1',
          title: 'Build Glibc',
          code: `cd $LFS/sources
tar -xf glibc-2.38.tar.xz
cd glibc-2.38

# Create lib64 symlink for x86_64
case $(uname -m) in
  x86_64) ln -sfv ../lib/ld-linux-x86-64.so.2 $LFS/lib64 ;;
esac

mkdir build && cd build
../configure --prefix=/usr --host=$LFS_TGT \\
  --build=$(../scripts/config.guess) \\
  --enable-kernel=4.14 \\
  --with-headers=$LFS/usr/include

make
make DESTDIR=$LFS install`,
          language: 'bash',
          explanation: 'Glibc is installed to $LFS with DESTDIR to avoid overwriting host files'
        }
      ],
      faqs: [
        { id: 'faq-4-4-1', question: 'What is DESTDIR?', answer: 'DESTDIR prepends a path to all installation directories. This lets us install to $LFS instead of the host system.', category: 'Build System' }
      ],
      interestingFacts: [
        { id: 'if-4-4-1', title: 'Glibc Size', description: 'Glibc is over 1 million lines of code and has been in development since 1988.', category: 'History', source: 'GNU Project' }
      ],
      funFacts: [
        { id: 'ff-4-4-1', fact: 'The printf function in Glibc supports over 20 different format specifiers!', difficulty: 'medium' }
      ],
      quiz: [
        { id: 'q-4-4-1', question: 'What is the dynamic linker?', options: ['A text editor', 'Loads shared libraries at runtime', 'A compiler', 'A debugger'], correctAnswer: 1, explanation: 'The dynamic linker (ld-linux.so) loads shared libraries when a program starts.', difficulty: 'medium' }
      ]
    }
  ],
  tags: ['toolchain', 'gcc', 'glibc', 'binutils', 'cross-compilation']
};


export const MODULE_5: Module = {
  id: '5',
  title: 'Chroot Environment',
  description: 'Enter the isolated LFS environment and build temporary tools',
  icon: 'box',
  duration: '90 min',
  difficulty: 'Intermediate',
  totalLessons: 3,
  color: 'from-purple-500 to-pink-500',
  interestingFacts: [],
  funFacts: [],
  lessons: [
    {
      id: 'lesson-5-1',
      moduleId: '5',
      title: 'Preparing for Chroot',
      description: 'Set up virtual filesystems and ownership',
      content: `<h2>Preparing the Chroot Environment</h2>
<p>Before entering chroot, we need to set up virtual filesystems that the LFS system will need to function.</p>

<h3>Virtual Filesystems:</h3>
<ul>
  <li><strong>/dev</strong> - Device files (bind mount from host)</li>
  <li><strong>/proc</strong> - Process information filesystem</li>
  <li><strong>/sys</strong> - System and hardware information</li>
  <li><strong>/run</strong> - Runtime variable data</li>
</ul>

<h3>Why Change Ownership?</h3>
<p>We change ownership to root because the LFS system should be owned by root, not your regular user account.</p>`,
      duration: 20,
      order: 1,
      codeExamples: [
        {
          id: 'ce-5-1-1',
          title: 'Mount Virtual Filesystems',
          code: `# Change ownership to root
sudo chown -R root:root $LFS/{usr,lib,var,etc,bin,sbin,tools}
case $(uname -m) in
  x86_64) sudo chown -R root:root $LFS/lib64 ;;
esac

# Create mount points
mkdir -pv $LFS/{dev,proc,sys,run}

# Mount virtual filesystems
sudo mount -v --bind /dev $LFS/dev
sudo mount -v --bind /dev/pts $LFS/dev/pts
sudo mount -vt proc proc $LFS/proc
sudo mount -vt sysfs sysfs $LFS/sys
sudo mount -vt tmpfs tmpfs $LFS/run`,
          language: 'bash',
          explanation: 'These mounts give the chroot environment access to essential kernel interfaces'
        }
      ],
      faqs: [
        { id: 'faq-5-1-1', question: 'What is a bind mount?', answer: 'A bind mount makes a directory appear in two places. We bind /dev so the chroot can access device files.', category: 'Filesystems' }
      ],
      interestingFacts: [],
      funFacts: [
        { id: 'ff-5-1-1', fact: 'The /proc filesystem is entirely virtual - it exists only in memory and is generated by the kernel!', difficulty: 'easy' }
      ],
      quiz: [
        { id: 'q-5-1-1', question: 'Why do we mount /proc in the chroot?', options: ['For extra storage', 'Programs need process information', 'For network access', 'For sound'], correctAnswer: 1, explanation: 'Many programs read /proc to get information about running processes and system state.', difficulty: 'easy' }
      ]
    },
    {
      id: 'lesson-5-2',
      moduleId: '5',
      title: 'Entering Chroot',
      description: 'Enter the isolated environment',
      content: `<h2>Entering the Chroot Environment</h2>
<p>The chroot command changes the apparent root directory. Once inside, the LFS directory becomes "/" and you cannot access the host system.</p>

<h3>The Chroot Command:</h3>
<p>We use env -i to clear all environment variables, then set only what we need for a clean build environment.</p>

<h3>Inside Chroot:</h3>
<ul>
  <li>$LFS becomes /</li>
  <li>$LFS/usr becomes /usr</li>
  <li>Host system is inaccessible</li>
  <li>Only LFS tools are available</li>
</ul>`,
      duration: 15,
      order: 2,
      codeExamples: [
        {
          id: 'ce-5-2-1',
          title: 'Enter Chroot',
          code: `sudo chroot "$LFS" /usr/bin/env -i \\
  HOME=/root \\
  TERM="$TERM" \\
  PS1='(lfs chroot) \\u:\\w\\$ ' \\
  PATH=/usr/bin:/usr/sbin \\
  /bin/bash --login

# You are now inside the LFS system!
# The prompt shows: (lfs chroot) root:/#`,
          language: 'bash',
          explanation: 'This enters the chroot with a clean environment'
        }
      ],
      faqs: [
        { id: 'faq-5-2-1', question: 'Can I break my host system from chroot?', answer: 'No, chroot isolates you from the host. However, be careful with mounted filesystems like /dev.', category: 'Safety' }
      ],
      interestingFacts: [],
      funFacts: [
        { id: 'ff-5-2-1', fact: 'Chroot has been used since 1979 and was one of the first containerization technologies!', difficulty: 'medium' }
      ],
      quiz: [
        { id: 'q-5-2-1', question: 'What does chroot do?', options: ['Changes user', 'Changes root directory', 'Changes permissions', 'Changes network'], correctAnswer: 1, explanation: 'Chroot changes the apparent root directory for the current process and its children.', difficulty: 'easy' }
      ]
    },
    {
      id: 'lesson-5-3',
      moduleId: '5',
      title: 'Creating Directory Structure',
      description: 'Build the FHS-compliant directory tree',
      content: `<h2>Creating the Directory Structure</h2>
<p>Linux follows the Filesystem Hierarchy Standard (FHS) which defines where files should be located.</p>

<h3>Key Directories:</h3>
<ul>
  <li><strong>/bin</strong> - Essential user binaries</li>
  <li><strong>/sbin</strong> - System binaries</li>
  <li><strong>/etc</strong> - Configuration files</li>
  <li><strong>/var</strong> - Variable data (logs, mail, etc.)</li>
  <li><strong>/usr</strong> - User programs and data</li>
  <li><strong>/home</strong> - User home directories</li>
  <li><strong>/root</strong> - Root user's home</li>
  <li><strong>/tmp</strong> - Temporary files</li>
</ul>`,
      duration: 20,
      order: 3,
      codeExamples: [
        {
          id: 'ce-5-3-1',
          title: 'Create Directory Structure',
          code: `# Inside chroot
mkdir -pv /{boot,home,mnt,opt,srv}
mkdir -pv /etc/{opt,sysconfig}
mkdir -pv /lib/firmware
mkdir -pv /media/{floppy,cdrom}
mkdir -pv /usr/{,local/}{include,src}
mkdir -pv /usr/local/{bin,lib,sbin}
mkdir -pv /usr/{,local/}share/{color,dict,doc,info,locale,man}
mkdir -pv /var/{cache,local,log,mail,opt,spool}
mkdir -pv /var/lib/{color,misc,locate}

ln -sfv /run /var/run
ln -sfv /run/lock /var/lock

install -dv -m 0750 /root
install -dv -m 1777 /tmp /var/tmp`,
          language: 'bash',
          explanation: 'Creates the standard Linux directory hierarchy'
        }
      ],
      faqs: [
        { id: 'faq-5-3-1', question: 'What is the sticky bit (1777)?', answer: 'The sticky bit on /tmp means users can only delete their own files, even though everyone can write there.', category: 'Permissions' }
      ],
      interestingFacts: [],
      funFacts: [
        { id: 'ff-5-3-1', fact: 'The /usr directory originally stood for "user" but now contains most system programs!', difficulty: 'easy' }
      ],
      quiz: [
        { id: 'q-5-3-1', question: 'Where are system configuration files stored?', options: ['/bin', '/etc', '/var', '/usr'], correctAnswer: 1, explanation: '/etc contains system-wide configuration files.', difficulty: 'easy' }
      ]
    }
  ],
  tags: ['chroot', 'filesystem', 'environment', 'isolation']
};


export const MODULE_6: Module = {
  id: '6',
  title: 'Building System Packages',
  description: 'Compile essential system utilities and libraries',
  icon: 'package',
  duration: '180 min',
  difficulty: 'Advanced',
  totalLessons: 3,
  color: 'from-green-500 to-teal-500',
  interestingFacts: [],
  funFacts: [],
  lessons: [
    {
      id: 'lesson-6-1',
      moduleId: '6',
      title: 'Core Utilities',
      description: 'Build coreutils, bash, and essential tools',
      content: `<h2>Building Core System Utilities</h2>
<p>These packages provide the basic commands every Linux user needs.</p>

<h3>GNU Coreutils:</h3>
<ul>
  <li><strong>File commands:</strong> ls, cp, mv, rm, mkdir, chmod</li>
  <li><strong>Text commands:</strong> cat, head, tail, sort, uniq</li>
  <li><strong>Shell utilities:</strong> echo, printf, test, expr</li>
</ul>

<h3>Bash Shell:</h3>
<p>The Bourne Again Shell is the default command interpreter. It provides scripting capabilities, job control, and command history.</p>`,
      duration: 60,
      order: 1,
      codeExamples: [
        {
          id: 'ce-6-1-1',
          title: 'Build Coreutils',
          code: `cd /sources
tar -xf coreutils-9.3.tar.xz && cd coreutils-9.3

./configure --prefix=/usr \\
  --enable-no-install-program=kill,uptime

make
make install

# Move programs to correct locations
mv -v /usr/bin/chroot /usr/sbin`,
          language: 'bash',
          explanation: 'Coreutils provides 100+ essential commands'
        }
      ],
      faqs: [
        { id: 'faq-6-1-1', question: 'Why exclude kill and uptime?', answer: 'These are provided by other packages (util-linux and procps-ng) with more features.', category: 'Build' }
      ],
      interestingFacts: [],
      funFacts: [
        { id: 'ff-6-1-1', fact: 'GNU Coreutils contains over 100 individual programs!', difficulty: 'easy' }
      ],
      quiz: [
        { id: 'q-6-1-1', question: 'Which package provides the ls command?', options: ['Bash', 'Coreutils', 'Util-linux', 'Findutils'], correctAnswer: 1, explanation: 'GNU Coreutils provides ls and many other basic file commands.', difficulty: 'easy' }
      ]
    },
    {
      id: 'lesson-6-2',
      moduleId: '6',
      title: 'System Libraries',
      description: 'Build zlib, bzip2, xz, and other libraries',
      content: `<h2>Essential System Libraries</h2>
<p>These libraries provide compression, encryption, and other fundamental capabilities.</p>

<h3>Compression Libraries:</h3>
<ul>
  <li><strong>Zlib</strong> - DEFLATE compression (used by gzip, PNG)</li>
  <li><strong>Bzip2</strong> - Better compression ratio than gzip</li>
  <li><strong>XZ Utils</strong> - LZMA compression (best ratio)</li>
  <li><strong>Zstd</strong> - Fast compression by Facebook</li>
</ul>

<h3>Other Libraries:</h3>
<ul>
  <li><strong>Readline</strong> - Command line editing</li>
  <li><strong>Ncurses</strong> - Terminal UI library</li>
  <li><strong>OpenSSL</strong> - Cryptography and TLS</li>
</ul>`,
      duration: 45,
      order: 2,
      codeExamples: [
        {
          id: 'ce-6-2-1',
          title: 'Build Zlib',
          code: `cd /sources
tar -xf zlib-1.2.13.tar.xz && cd zlib-1.2.13

./configure --prefix=/usr
make
make install

# Remove static library
rm -fv /usr/lib/libz.a`,
          language: 'bash',
          explanation: 'Zlib is used by many programs for compression'
        }
      ],
      faqs: [
        { id: 'faq-6-2-1', question: 'Why remove static libraries?', answer: 'Shared libraries save disk space and memory. Static libraries are only needed for special cases.', category: 'Libraries' }
      ],
      interestingFacts: [],
      funFacts: [
        { id: 'ff-6-2-1', fact: 'Zlib compression is used in PNG images, HTTP compression, and git!', difficulty: 'medium' }
      ],
      quiz: [
        { id: 'q-6-2-1', question: 'Which compression has the best ratio?', options: ['Gzip', 'Bzip2', 'XZ/LZMA', 'Zstd'], correctAnswer: 2, explanation: 'XZ/LZMA typically achieves the best compression ratio, though it is slower.', difficulty: 'medium' }
      ]
    },
    {
      id: 'lesson-6-3',
      moduleId: '6',
      title: 'Development Tools',
      description: 'Build GCC, Binutils, and development packages',
      content: `<h2>Final System Compiler</h2>
<p>Now we rebuild GCC and Binutils natively inside the LFS system. This creates the final compiler that will be used for all future compilation.</p>

<h3>Why Rebuild?</h3>
<ul>
  <li>The cross-compiler was built on the host</li>
  <li>Native compiler is optimized for LFS</li>
  <li>All paths point to LFS locations</li>
  <li>No dependencies on host system</li>
</ul>

<h3>GCC Languages:</h3>
<p>We enable C, C++, and optionally Fortran, Go, and other languages.</p>`,
      duration: 75,
      order: 3,
      codeExamples: [
        {
          id: 'ce-6-3-1',
          title: 'Build Final GCC',
          code: `cd /sources
tar -xf gcc-13.2.0.tar.xz && cd gcc-13.2.0

# Extract prerequisites
tar -xf ../mpfr-4.2.0.tar.xz && mv mpfr-4.2.0 mpfr
tar -xf ../gmp-6.3.0.tar.xz && mv gmp-6.3.0 gmp
tar -xf ../mpc-1.3.1.tar.gz && mv mpc-1.3.1 mpc

mkdir build && cd build
../configure --prefix=/usr \\
  --enable-languages=c,c++ \\
  --with-system-zlib \\
  --enable-default-pie \\
  --enable-default-ssp

make
make install

# Create cc symlink
ln -sv gcc /usr/bin/cc`,
          language: 'bash',
          explanation: 'This is the final, native GCC for your LFS system'
        }
      ],
      faqs: [
        { id: 'faq-6-3-1', question: 'What is PIE?', answer: 'Position Independent Executable - a security feature that randomizes where code is loaded in memory.', category: 'Security' }
      ],
      interestingFacts: [],
      funFacts: [
        { id: 'ff-6-3-1', fact: 'GCC can compile itself! This is called bootstrapping and ensures compiler correctness.', difficulty: 'hard' }
      ],
      quiz: [
        { id: 'q-6-3-1', question: 'What does SSP stand for?', options: ['System Security Protocol', 'Stack Smashing Protection', 'Secure Socket Protocol', 'Static Symbol Processing'], correctAnswer: 1, explanation: 'Stack Smashing Protection detects buffer overflows that could be exploited.', difficulty: 'medium' }
      ]
    }
  ],
  tags: ['packages', 'compilation', 'libraries', 'gcc']
};


export const MODULE_7: Module = {
  id: '7',
  title: 'Linux Kernel Compilation',
  description: 'Configure, compile, and install the Linux kernel',
  icon: 'cpu',
  duration: '90 min',
  difficulty: 'Advanced',
  totalLessons: 3,
  color: 'from-red-500 to-orange-500',
  interestingFacts: [],
  funFacts: [],
  lessons: [
    {
      id: 'lesson-7-1',
      moduleId: '7',
      title: 'Kernel Configuration',
      description: 'Configure kernel options with menuconfig',
      content: `<h2>Configuring the Linux Kernel</h2>
<p>The kernel configuration determines what features, drivers, and options are included in your kernel.</p>

<h3>Configuration Methods:</h3>
<ul>
  <li><strong>make menuconfig</strong> - Text-based menu (recommended)</li>
  <li><strong>make defconfig</strong> - Default configuration</li>
  <li><strong>make oldconfig</strong> - Update existing config</li>
  <li><strong>make xconfig</strong> - Qt-based GUI</li>
</ul>

<h3>Essential Options:</h3>
<ul>
  <li>Processor type and features</li>
  <li>Filesystem support (ext4, etc.)</li>
  <li>Device drivers for your hardware</li>
  <li>Networking support</li>
</ul>`,
      duration: 30,
      order: 1,
      codeExamples: [
        {
          id: 'ce-7-1-1',
          title: 'Configure Kernel',
          code: `cd /sources
tar -xf linux-6.4.12.tar.xz && cd linux-6.4.12

# Clean source tree
make mrproper

# Start with default config
make defconfig

# Customize with menu
make menuconfig

# Important: Enable these for LFS
# - General setup -> POSIX Message Queues
# - Processor type -> Symmetric multi-processing
# - File systems -> ext4, proc, sysfs
# - Device Drivers -> your hardware`,
          language: 'bash',
          explanation: 'menuconfig provides an interactive way to configure the kernel'
        }
      ],
      faqs: [
        { id: 'faq-7-1-1', question: 'Should I use modules or built-in?', answer: 'Built-in (Y) is simpler for essential drivers. Modules (M) save memory for rarely-used drivers.', category: 'Configuration' }
      ],
      interestingFacts: [
        { id: 'if-7-1-1', title: 'Kernel Options', description: 'The Linux kernel has over 15,000 configuration options!', category: 'Kernel', source: 'kernel.org' }
      ],
      funFacts: [
        { id: 'ff-7-1-1', fact: 'A minimal kernel config can result in a kernel under 1MB!', difficulty: 'hard' }
      ],
      quiz: [
        { id: 'q-7-1-1', question: 'What does make mrproper do?', options: ['Compiles kernel', 'Removes all generated files', 'Installs modules', 'Shows config'], correctAnswer: 1, explanation: 'make mrproper removes all generated files for a clean build.', difficulty: 'easy' }
      ]
    },
    {
      id: 'lesson-7-2',
      moduleId: '7',
      title: 'Compiling the Kernel',
      description: 'Build the kernel image and modules',
      content: `<h2>Compiling the Kernel</h2>
<p>Kernel compilation creates the bootable kernel image and loadable modules.</p>

<h3>Output Files:</h3>
<ul>
  <li><strong>vmlinuz</strong> - Compressed kernel image</li>
  <li><strong>System.map</strong> - Symbol table for debugging</li>
  <li><strong>*.ko files</strong> - Kernel modules</li>
</ul>

<h3>Compilation Time:</h3>
<p>Depends on your CPU and configuration. With -j$(nproc), expect 15-60 minutes.</p>`,
      duration: 35,
      order: 2,
      codeExamples: [
        {
          id: 'ce-7-2-1',
          title: 'Compile and Install Kernel',
          code: `# Compile kernel (uses all CPU cores)
make -j$(nproc)

# Install modules
make modules_install

# Install kernel image
cp -iv arch/x86/boot/bzImage /boot/vmlinuz-6.4.12-lfs-12.0

# Install supporting files
cp -iv System.map /boot/System.map-6.4.12
cp -iv .config /boot/config-6.4.12

# Install documentation (optional)
install -d /usr/share/doc/linux-6.4.12
cp -r Documentation/* /usr/share/doc/linux-6.4.12`,
          language: 'bash',
          explanation: 'The kernel is installed to /boot for the bootloader to find'
        }
      ],
      faqs: [
        { id: 'faq-7-2-1', question: 'What is bzImage?', answer: 'bzImage is a compressed kernel image. The "bz" stands for "big zImage" - it can be larger than the original zImage format.', category: 'Kernel' }
      ],
      interestingFacts: [],
      funFacts: [
        { id: 'ff-7-2-1', fact: 'The Linux kernel is compiled by over 15,000 developers worldwide!', difficulty: 'easy' }
      ],
      quiz: [
        { id: 'q-7-2-1', question: 'Where is the kernel image installed?', options: ['/usr/bin', '/boot', '/lib', '/etc'], correctAnswer: 1, explanation: 'The kernel image is installed to /boot where the bootloader can find it.', difficulty: 'easy' }
      ]
    },
    {
      id: 'lesson-7-3',
      moduleId: '7',
      title: 'Kernel Modules',
      description: 'Understanding and managing kernel modules',
      content: `<h2>Kernel Modules</h2>
<p>Modules are pieces of kernel code that can be loaded and unloaded at runtime.</p>

<h3>Module Commands:</h3>
<ul>
  <li><strong>lsmod</strong> - List loaded modules</li>
  <li><strong>modprobe</strong> - Load module with dependencies</li>
  <li><strong>rmmod</strong> - Remove a module</li>
  <li><strong>modinfo</strong> - Show module information</li>
</ul>

<h3>Module Location:</h3>
<p>Modules are installed to /lib/modules/$(uname -r)/</p>`,
      duration: 25,
      order: 3,
      codeExamples: [
        {
          id: 'ce-7-3-1',
          title: 'Working with Modules',
          code: `# List loaded modules
lsmod

# Load a module
modprobe ext4

# Show module info
modinfo ext4

# Remove a module
rmmod ext4

# Generate module dependencies
depmod -a`,
          language: 'bash',
          explanation: 'Modules allow adding functionality without rebooting'
        }
      ],
      faqs: [
        { id: 'faq-7-3-1', question: 'When should I use modules vs built-in?', answer: 'Use built-in for essential boot drivers. Use modules for optional hardware or features you rarely need.', category: 'Modules' }
      ],
      interestingFacts: [],
      funFacts: [
        { id: 'ff-7-3-1', fact: 'A typical Linux system has hundreds of available modules but only loads a few dozen!', difficulty: 'medium' }
      ],
      quiz: [
        { id: 'q-7-3-1', question: 'Which command loads a module with dependencies?', options: ['insmod', 'modprobe', 'rmmod', 'lsmod'], correctAnswer: 1, explanation: 'modprobe automatically loads required dependencies, unlike insmod.', difficulty: 'easy' }
      ]
    }
  ],
  tags: ['kernel', 'compilation', 'modules', 'boot']
};

export const MODULE_8: Module = {
  id: '8',
  title: 'System Configuration & Boot',
  description: 'Configure bootloader, networking, and finalize the system',
  icon: 'settings',
  duration: '60 min',
  difficulty: 'Intermediate',
  totalLessons: 2,
  color: 'from-indigo-500 to-blue-500',
  interestingFacts: [],
  funFacts: [],
  lessons: [
    {
      id: 'lesson-8-1',
      moduleId: '8',
      title: 'GRUB Bootloader',
      description: 'Install and configure GRUB',
      content: `<h2>Installing GRUB</h2>
<p>GRUB (GRand Unified Bootloader) loads the Linux kernel when your computer starts.</p>

<h3>GRUB Components:</h3>
<ul>
  <li><strong>Stage 1</strong> - In MBR, loads Stage 2</li>
  <li><strong>Stage 2</strong> - Full GRUB with menu</li>
  <li><strong>grub.cfg</strong> - Configuration file</li>
</ul>

<h3>Boot Process:</h3>
<ol>
  <li>BIOS/UEFI loads GRUB</li>
  <li>GRUB shows menu</li>
  <li>GRUB loads kernel and initramfs</li>
  <li>Kernel takes over</li>
</ol>`,
      duration: 30,
      order: 1,
      codeExamples: [
        {
          id: 'ce-8-1-1',
          title: 'Install GRUB',
          code: `# Install GRUB to MBR (replace sda with your disk)
grub-install /dev/sda

# Create GRUB configuration
cat > /boot/grub/grub.cfg << "EOF"
set default=0
set timeout=5

insmod ext2
set root=(hd0,2)

menuentry "GNU/Linux, Linux 6.4.12-lfs-12.0" {
  linux /boot/vmlinuz-6.4.12-lfs-12.0 root=/dev/sda2 ro
}
EOF`,
          language: 'bash',
          explanation: 'Adjust partition numbers for your system'
        }
      ],
      faqs: [
        { id: 'faq-8-1-1', question: 'What is (hd0,2)?', answer: 'GRUB notation: hd0 is first disk, 2 is third partition (GRUB counts from 0 for disks, 1 for partitions).', category: 'GRUB' }
      ],
      interestingFacts: [],
      funFacts: [
        { id: 'ff-8-1-1', fact: 'GRUB can boot over 20 different operating systems!', difficulty: 'easy' }
      ],
      quiz: [
        { id: 'q-8-1-1', question: 'Where is GRUB Stage 1 installed?', options: ['/boot', 'MBR', '/etc', 'RAM'], correctAnswer: 1, explanation: 'GRUB Stage 1 is installed in the Master Boot Record of the disk.', difficulty: 'medium' }
      ]
    },
    {
      id: 'lesson-8-2',
      moduleId: '8',
      title: 'Final Configuration',
      description: 'Configure fstab, hostname, and system files',
      content: `<h2>Final System Configuration</h2>
<p>These configuration files are essential for a working system.</p>

<h3>Key Files:</h3>
<ul>
  <li><strong>/etc/fstab</strong> - Filesystem mount table</li>
  <li><strong>/etc/hostname</strong> - System hostname</li>
  <li><strong>/etc/hosts</strong> - Static host resolution</li>
  <li><strong>/etc/passwd</strong> - User accounts</li>
  <li><strong>/etc/group</strong> - Group definitions</li>
</ul>`,
      duration: 30,
      order: 2,
      codeExamples: [
        {
          id: 'ce-8-2-1',
          title: 'Create fstab',
          code: `cat > /etc/fstab << "EOF"
# <device>     <mount>  <type>  <options>         <dump> <pass>
/dev/sda2      /        ext4    defaults          1      1
/dev/sda1      swap     swap    pri=1             0      0
proc           /proc    proc    nosuid,noexec     0      0
sysfs          /sys     sysfs   nosuid,noexec     0      0
devpts         /dev/pts devpts  gid=5,mode=620    0      0
tmpfs          /run     tmpfs   defaults          0      0
EOF

# Set hostname
echo "lfs" > /etc/hostname

# Create release files
echo 12.0 > /etc/lfs-release`,
          language: 'bash',
          explanation: 'fstab tells the system what to mount at boot'
        }
      ],
      faqs: [
        { id: 'faq-8-2-1', question: 'What do dump and pass mean in fstab?', answer: 'Dump is for backup tools (usually 0). Pass is fsck order: 1 for root, 2 for others, 0 to skip.', category: 'Configuration' }
      ],
      interestingFacts: [],
      funFacts: [
        { id: 'ff-8-2-1', fact: 'The /etc/fstab format has remained largely unchanged since the 1980s!', difficulty: 'medium' }
      ],
      quiz: [
        { id: 'q-8-2-1', question: 'What file defines filesystem mounts?', options: ['/etc/mtab', '/etc/fstab', '/etc/mounts', '/etc/disks'], correctAnswer: 1, explanation: '/etc/fstab (filesystem table) defines what filesystems to mount at boot.', difficulty: 'easy' }
      ]
    }
  ],
  tags: ['grub', 'boot', 'configuration', 'fstab']
};

export const ADDITIONAL_MODULES = [MODULE_4, MODULE_5, MODULE_6, MODULE_7, MODULE_8];
