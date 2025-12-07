"use client";

import { useState } from "react";
import Link from "next/link";
import { Terminal, Search, Copy, Check, ChevronDown, ChevronRight, Folder, FolderOpen, Play, AlertTriangle } from "lucide-react";
import { DottedSurface } from "@/components/ui/dotted-surface";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

interface Command {
  cmd: string;
  desc: string;
  warning?: string;
}

interface CommandCategory {
  id: string;
  title: string;
  description: string;
  chapter?: string;
  commands: Command[];
}

export default function CommandsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedCommand, setCopiedCommand] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["lfs-setup"]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCommand(text);
    setTimeout(() => setCopiedCommand(""), 2000);
  };

  const copyAllCommands = (commands: Command[]) => {
    const allCmds = commands.map(c => c.cmd).join('\n');
    navigator.clipboard.writeText(allCmds);
    setCopiedCommand("all");
    setTimeout(() => setCopiedCommand(""), 2000);
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const commandCategories: CommandCategory[] = [
    {
      id: "lfs-setup",
      title: "1. Environment Setup",
      description: "Prepare your host system and create the LFS directory structure",
      chapter: "Chapter 2-4",
      commands: [
        { cmd: "export LFS=/mnt/lfs", desc: "Set the LFS environment variable" },
        { cmd: "sudo mkdir -pv $LFS", desc: "Create the LFS mount point" },
        { cmd: "sudo chown -v $USER $LFS", desc: "Take ownership of the LFS directory" },
        { cmd: "mkdir -pv $LFS/{etc,var} $LFS/usr/{bin,lib,sbin}", desc: "Create essential directories" },
        { cmd: "for i in bin lib sbin; do ln -sv usr/$i $LFS/$i; done", desc: "Create compatibility symlinks" },
        { cmd: "case $(uname -m) in x86_64) mkdir -pv $LFS/lib64 ;; esac", desc: "Create lib64 for 64-bit systems" },
        { cmd: "mkdir -pv $LFS/tools", desc: "Create tools directory for cross-toolchain" },
        { cmd: "mkdir -pv $LFS/sources", desc: "Create sources directory" },
        { cmd: "chmod -v a+wt $LFS/sources", desc: "Set sticky bit on sources" },
      ]
    },
    {
      id: "lfs-env-vars",
      title: "2. Environment Variables",
      description: "Configure shell environment for LFS build",
      chapter: "Chapter 4",
      commands: [
        { cmd: "export LFS=/mnt/lfs", desc: "LFS root directory" },
        { cmd: "export LFS_TGT=$(uname -m)-lfs-linux-gnu", desc: "Target triplet for cross-compilation" },
        { cmd: "export PATH=/usr/bin", desc: "Reset PATH" },
        { cmd: "if [ ! -L /bin ]; then PATH=/bin:$PATH; fi", desc: "Add /bin if not symlinked" },
        { cmd: "export PATH=$LFS/tools/bin:$PATH", desc: "Add tools to PATH" },
        { cmd: "export CONFIG_SITE=$LFS/usr/share/config.site", desc: "Set config site" },
        { cmd: "export MAKEFLAGS='-j$(nproc)'", desc: "Enable parallel compilation" },
        { cmd: "export LC_ALL=POSIX", desc: "Set locale for consistent builds" },
      ]
    },
    {
      id: "binutils-pass1",
      title: "3. Binutils Pass 1",
      description: "Build the assembler and linker (first pass)",
      chapter: "Chapter 5.2",
      commands: [
        { cmd: "cd $LFS/sources", desc: "Change to sources directory" },
        { cmd: "tar -xf binutils-2.41.tar.xz", desc: "Extract Binutils" },
        { cmd: "cd binutils-2.41", desc: "Enter source directory" },
        { cmd: "mkdir -v build && cd build", desc: "Create and enter build directory" },
        { cmd: "../configure --prefix=$LFS/tools --with-sysroot=$LFS --target=$LFS_TGT --disable-nls --enable-gprofng=no --disable-werror", desc: "Configure Binutils" },
        { cmd: "make", desc: "Compile Binutils" },
        { cmd: "make install", desc: "Install Binutils" },
        { cmd: "cd $LFS/sources && rm -rf binutils-2.41", desc: "Cleanup" },
      ]
    },
    {
      id: "gcc-pass1",
      title: "4. GCC Pass 1",
      description: "Build the cross-compiler (first pass)",
      chapter: "Chapter 5.3",
      commands: [
        { cmd: "cd $LFS/sources && tar -xf gcc-13.2.0.tar.xz && cd gcc-13.2.0", desc: "Extract GCC" },
        { cmd: "tar -xf ../mpfr-4.2.0.tar.xz && mv -v mpfr-4.2.0 mpfr", desc: "Extract MPFR" },
        { cmd: "tar -xf ../gmp-6.3.0.tar.xz && mv -v gmp-6.3.0 gmp", desc: "Extract GMP" },
        { cmd: "tar -xf ../mpc-1.3.1.tar.gz && mv -v mpc-1.3.1 mpc", desc: "Extract MPC" },
        { cmd: "case $(uname -m) in x86_64) sed -e '/m64=/s/lib64/lib/' -i.orig gcc/config/i386/t-linux64 ;; esac", desc: "Fix for x86_64" },
        { cmd: "mkdir -v build && cd build", desc: "Create build directory" },
        { cmd: "../configure --target=$LFS_TGT --prefix=$LFS/tools --with-glibc-version=2.38 --with-sysroot=$LFS --with-newlib --without-headers --enable-default-pie --enable-default-ssp --disable-nls --disable-shared --disable-multilib --disable-threads --disable-libatomic --disable-libgomp --disable-libquadmath --disable-libssp --disable-libvtv --disable-libstdcxx --enable-languages=c,c++", desc: "Configure GCC" },
        { cmd: "make", desc: "Compile GCC (takes ~1 hour)", warning: "This step takes a long time" },
        { cmd: "make install", desc: "Install GCC" },
        { cmd: "cd .. && cat gcc/limitx.h gcc/glimits.h gcc/limity.h > `dirname $($LFS_TGT-gcc -print-libgcc-file-name)`/include/limits.h", desc: "Create limits.h" },
        { cmd: "cd $LFS/sources && rm -rf gcc-13.2.0", desc: "Cleanup" },
      ]
    },

    {
      id: "linux-headers",
      title: "5. Linux API Headers",
      description: "Install kernel headers for userspace programs",
      chapter: "Chapter 5.4",
      commands: [
        { cmd: "cd $LFS/sources && tar -xf linux-6.4.12.tar.xz && cd linux-6.4.12", desc: "Extract Linux kernel" },
        { cmd: "make mrproper", desc: "Clean source tree" },
        { cmd: "make headers", desc: "Build headers" },
        { cmd: "find usr/include -type f ! -name '*.h' -delete", desc: "Remove non-header files" },
        { cmd: "cp -rv usr/include $LFS/usr", desc: "Install headers" },
        { cmd: "cd $LFS/sources && rm -rf linux-6.4.12", desc: "Cleanup" },
      ]
    },
    {
      id: "glibc",
      title: "6. Glibc",
      description: "Build the GNU C Library",
      chapter: "Chapter 5.5",
      commands: [
        { cmd: "cd $LFS/sources && tar -xf glibc-2.38.tar.xz && cd glibc-2.38", desc: "Extract Glibc" },
        { cmd: "case $(uname -m) in i?86) ln -sfv ld-linux.so.2 $LFS/lib/ld-lsb.so.3 ;; x86_64) ln -sfv ../lib/ld-linux-x86-64.so.2 $LFS/lib64 && ln -sfv ../lib/ld-linux-x86-64.so.2 $LFS/lib64/ld-lsb-x86-64.so.3 ;; esac", desc: "Create symlinks" },
        { cmd: "patch -Np1 -i ../glibc-2.38-fhs-1.patch", desc: "Apply FHS patch" },
        { cmd: "mkdir -v build && cd build", desc: "Create build directory" },
        { cmd: "echo 'rootsbindir=/usr/sbin' > configparms", desc: "Set sbin directory" },
        { cmd: "../configure --prefix=/usr --host=$LFS_TGT --build=$(../scripts/config.guess) --enable-kernel=4.14 --with-headers=$LFS/usr/include libc_cv_slibdir=/usr/lib", desc: "Configure Glibc" },
        { cmd: "make", desc: "Compile Glibc" },
        { cmd: "make DESTDIR=$LFS install", desc: "Install Glibc" },
        { cmd: "sed '/RTLDLIST=/s@/usr@@g' -i $LFS/usr/bin/ldd", desc: "Fix ldd script" },
        { cmd: "cd $LFS/sources && rm -rf glibc-2.38", desc: "Cleanup" },
      ]
    },
    {
      id: "libstdcpp",
      title: "7. Libstdc++",
      description: "Build the C++ standard library",
      chapter: "Chapter 5.6",
      commands: [
        { cmd: "cd $LFS/sources && tar -xf gcc-13.2.0.tar.xz && cd gcc-13.2.0", desc: "Extract GCC" },
        { cmd: "mkdir -v build && cd build", desc: "Create build directory" },
        { cmd: "../libstdc++-v3/configure --host=$LFS_TGT --build=$(../config.guess) --prefix=/usr --disable-multilib --disable-nls --disable-libstdcxx-pch --with-gxx-include-dir=/tools/$LFS_TGT/include/c++/13.2.0", desc: "Configure Libstdc++" },
        { cmd: "make", desc: "Compile Libstdc++" },
        { cmd: "make DESTDIR=$LFS install", desc: "Install Libstdc++" },
        { cmd: "rm -v $LFS/usr/lib/lib{stdc++,stdc++fs,supc++}.la", desc: "Remove libtool archives" },
        { cmd: "cd $LFS/sources && rm -rf gcc-13.2.0", desc: "Cleanup" },
      ]
    },
    {
      id: "cross-tools",
      title: "8. Cross Compiling Temporary Tools",
      description: "Build essential tools using the cross-toolchain",
      chapter: "Chapter 6",
      commands: [
        { cmd: "# M4", desc: "--- M4 Macro Processor ---" },
        { cmd: "cd $LFS/sources && tar -xf m4-1.4.19.tar.xz && cd m4-1.4.19", desc: "Extract M4" },
        { cmd: "./configure --prefix=/usr --host=$LFS_TGT --build=$(build-aux/config.guess)", desc: "Configure M4" },
        { cmd: "make && make DESTDIR=$LFS install", desc: "Build and install M4" },
        { cmd: "cd $LFS/sources && rm -rf m4-1.4.19", desc: "Cleanup" },
        { cmd: "# Ncurses", desc: "--- Ncurses Library ---" },
        { cmd: "cd $LFS/sources && tar -xf ncurses-6.4.tar.gz && cd ncurses-6.4", desc: "Extract Ncurses" },
        { cmd: "sed -i s/mawk// configure", desc: "Ensure gawk is used" },
        { cmd: "mkdir build && pushd build && ../configure && make -C include && make -C progs tic && popd", desc: "Build tic for host" },
        { cmd: "./configure --prefix=/usr --host=$LFS_TGT --build=$(./config.guess) --mandir=/usr/share/man --with-manpage-format=normal --with-shared --without-normal --with-cxx-shared --without-debug --without-ada --disable-stripping --enable-widec", desc: "Configure Ncurses" },
        { cmd: "make && make DESTDIR=$LFS TIC_PATH=$(pwd)/build/progs/tic install", desc: "Build and install" },
        { cmd: "echo 'INPUT(-lncursesw)' > $LFS/usr/lib/libncurses.so", desc: "Create compatibility symlink" },
        { cmd: "cd $LFS/sources && rm -rf ncurses-6.4", desc: "Cleanup" },
      ]
    },

    {
      id: "more-temp-tools",
      title: "9. More Temporary Tools",
      description: "Build bash, coreutils, and other essential tools",
      chapter: "Chapter 6",
      commands: [
        { cmd: "# Bash", desc: "--- Bash Shell ---" },
        { cmd: "cd $LFS/sources && tar -xf bash-5.2.15.tar.gz && cd bash-5.2.15", desc: "Extract Bash" },
        { cmd: "./configure --prefix=/usr --build=$(sh support/config.guess) --host=$LFS_TGT --without-bash-malloc", desc: "Configure Bash" },
        { cmd: "make && make DESTDIR=$LFS install", desc: "Build and install Bash" },
        { cmd: "ln -sv bash $LFS/bin/sh", desc: "Create sh symlink" },
        { cmd: "cd $LFS/sources && rm -rf bash-5.2.15", desc: "Cleanup" },
        { cmd: "# Coreutils", desc: "--- GNU Coreutils ---" },
        { cmd: "cd $LFS/sources && tar -xf coreutils-9.3.tar.xz && cd coreutils-9.3", desc: "Extract Coreutils" },
        { cmd: "./configure --prefix=/usr --host=$LFS_TGT --build=$(build-aux/config.guess) --enable-install-program=hostname --enable-no-install-program=kill,uptime gl_cv_macro_MB_CUR_MAX_good=y", desc: "Configure Coreutils" },
        { cmd: "make && make DESTDIR=$LFS install", desc: "Build and install" },
        { cmd: "mv -v $LFS/usr/bin/chroot $LFS/usr/sbin", desc: "Move chroot to sbin" },
        { cmd: "mkdir -pv $LFS/usr/share/man/man8 && mv -v $LFS/usr/share/man/man1/chroot.1 $LFS/usr/share/man/man8/chroot.8 && sed -i 's/\"1\"/\"8\"/' $LFS/usr/share/man/man8/chroot.8", desc: "Fix man page" },
        { cmd: "cd $LFS/sources && rm -rf coreutils-9.3", desc: "Cleanup" },
        { cmd: "# File", desc: "--- File Command ---" },
        { cmd: "cd $LFS/sources && tar -xf file-5.45.tar.gz && cd file-5.45", desc: "Extract File" },
        { cmd: "mkdir build && pushd build && ../configure --disable-bzlib --disable-libseccomp --disable-xzlib --disable-zlib && make && popd", desc: "Build for host" },
        { cmd: "./configure --prefix=/usr --host=$LFS_TGT --build=$(./config.guess)", desc: "Configure for target" },
        { cmd: "make FILE_COMPILE=$(pwd)/build/src/file && make DESTDIR=$LFS install", desc: "Build and install" },
        { cmd: "rm -v $LFS/usr/lib/libmagic.la", desc: "Remove libtool archive" },
        { cmd: "cd $LFS/sources && rm -rf file-5.45", desc: "Cleanup" },
      ]
    },
    {
      id: "chroot-prep",
      title: "10. Entering Chroot",
      description: "Prepare and enter the chroot environment",
      chapter: "Chapter 7",
      commands: [
        { cmd: "sudo chown -R root:root $LFS/{usr,lib,var,etc,bin,sbin,tools}", desc: "Change ownership to root" },
        { cmd: "case $(uname -m) in x86_64) sudo chown -R root:root $LFS/lib64 ;; esac", desc: "Change lib64 ownership" },
        { cmd: "mkdir -pv $LFS/{dev,proc,sys,run}", desc: "Create virtual filesystem directories" },
        { cmd: "sudo mount -v --bind /dev $LFS/dev", desc: "Mount /dev" },
        { cmd: "sudo mount -v --bind /dev/pts $LFS/dev/pts", desc: "Mount /dev/pts" },
        { cmd: "sudo mount -vt proc proc $LFS/proc", desc: "Mount /proc" },
        { cmd: "sudo mount -vt sysfs sysfs $LFS/sys", desc: "Mount /sys" },
        { cmd: "sudo mount -vt tmpfs tmpfs $LFS/run", desc: "Mount /run" },
        { cmd: "if [ -h $LFS/dev/shm ]; then mkdir -pv $LFS/$(readlink $LFS/dev/shm); else sudo mount -t tmpfs -o nosuid,nodev tmpfs $LFS/dev/shm; fi", desc: "Mount /dev/shm" },
      ]
    },
    {
      id: "chroot-enter",
      title: "11. Chroot Commands",
      description: "Enter chroot and set up the environment",
      chapter: "Chapter 7.4",
      commands: [
        { cmd: "sudo chroot \"$LFS\" /usr/bin/env -i HOME=/root TERM=\"$TERM\" PS1='(lfs chroot) \\u:\\w\\$ ' PATH=/usr/bin:/usr/sbin /bin/bash --login", desc: "Enter chroot environment", warning: "Run this as root" },
        { cmd: "mkdir -pv /{boot,home,mnt,opt,srv}", desc: "Create top-level directories" },
        { cmd: "mkdir -pv /etc/{opt,sysconfig}", desc: "Create /etc subdirectories" },
        { cmd: "mkdir -pv /lib/firmware", desc: "Create firmware directory" },
        { cmd: "mkdir -pv /media/{floppy,cdrom}", desc: "Create media directories" },
        { cmd: "mkdir -pv /usr/{,local/}{include,src}", desc: "Create usr directories" },
        { cmd: "mkdir -pv /usr/local/{bin,lib,sbin}", desc: "Create local directories" },
        { cmd: "mkdir -pv /usr/{,local/}share/{color,dict,doc,info,locale,man}", desc: "Create share directories" },
        { cmd: "mkdir -pv /usr/{,local/}share/{misc,terminfo,zoneinfo}", desc: "Create more share directories" },
        { cmd: "mkdir -pv /usr/{,local/}share/man/man{1..8}", desc: "Create man directories" },
        { cmd: "mkdir -pv /var/{cache,local,log,mail,opt,spool}", desc: "Create var directories" },
        { cmd: "mkdir -pv /var/lib/{color,misc,locate}", desc: "Create var/lib directories" },
        { cmd: "ln -sfv /run /var/run", desc: "Create /var/run symlink" },
        { cmd: "ln -sfv /run/lock /var/lock", desc: "Create /var/lock symlink" },
        { cmd: "install -dv -m 0750 /root", desc: "Create root home" },
        { cmd: "install -dv -m 1777 /tmp /var/tmp", desc: "Create tmp directories" },
      ]
    },

    {
      id: "essential-files",
      title: "12. Essential Files & Symlinks",
      description: "Create essential system files",
      chapter: "Chapter 7.5-7.6",
      commands: [
        { cmd: "ln -sv /proc/self/mounts /etc/mtab", desc: "Create mtab symlink" },
        { cmd: "cat > /etc/hosts << EOF\n127.0.0.1  localhost $(hostname)\n::1        localhost\nEOF", desc: "Create /etc/hosts" },
        { cmd: "cat > /etc/passwd << \"EOF\"\nroot:x:0:0:root:/root:/bin/bash\nbin:x:1:1:bin:/dev/null:/usr/bin/false\ndaemon:x:6:6:Daemon User:/dev/null:/usr/bin/false\nmessagebus:x:18:18:D-Bus Message Daemon User:/run/dbus:/usr/bin/false\nnobody:x:65534:65534:Unprivileged User:/dev/null:/usr/bin/false\nEOF", desc: "Create /etc/passwd" },
        { cmd: "cat > /etc/group << \"EOF\"\nroot:x:0:\nbin:x:1:daemon\nsys:x:2:\nkmem:x:3:\ntape:x:4:\ntty:x:5:\ndaemon:x:6:\nfloppy:x:7:\ndisk:x:8:\nlp:x:9:\ndialout:x:10:\naudio:x:11:\nvideo:x:12:\nutmp:x:13:\nusb:x:14:\ncdrom:x:15:\nadm:x:16:\nmessagebus:x:18:\ninput:x:24:\nmail:x:34:\nkvm:x:61:\nwheel:x:97:\nusers:x:999:\nnogroup:x:65534:\nEOF", desc: "Create /etc/group" },
        { cmd: "touch /var/log/{btmp,lastlog,faillog,wtmp}", desc: "Create log files" },
        { cmd: "chgrp -v utmp /var/log/lastlog", desc: "Set lastlog group" },
        { cmd: "chmod -v 664  /var/log/lastlog", desc: "Set lastlog permissions" },
        { cmd: "chmod -v 600  /var/log/btmp", desc: "Set btmp permissions" },
      ]
    },
    {
      id: "gettext-bison",
      title: "13. Gettext & Bison",
      description: "Build internationalization and parser tools",
      chapter: "Chapter 7.7-7.8",
      commands: [
        { cmd: "cd /sources && tar -xf gettext-0.22.tar.xz && cd gettext-0.22", desc: "Extract Gettext" },
        { cmd: "./configure --disable-shared", desc: "Configure Gettext" },
        { cmd: "make", desc: "Build Gettext" },
        { cmd: "cp -v gettext-tools/src/{msgfmt,msgmerge,xgettext} /usr/bin", desc: "Install essential tools" },
        { cmd: "cd /sources && rm -rf gettext-0.22", desc: "Cleanup" },
        { cmd: "cd /sources && tar -xf bison-3.8.2.tar.xz && cd bison-3.8.2", desc: "Extract Bison" },
        { cmd: "./configure --prefix=/usr --docdir=/usr/share/doc/bison-3.8.2", desc: "Configure Bison" },
        { cmd: "make && make install", desc: "Build and install Bison" },
        { cmd: "cd /sources && rm -rf bison-3.8.2", desc: "Cleanup" },
      ]
    },
    {
      id: "perl-python",
      title: "14. Perl & Python",
      description: "Build scripting languages",
      chapter: "Chapter 7.9-7.10",
      commands: [
        { cmd: "cd /sources && tar -xf perl-5.38.0.tar.xz && cd perl-5.38.0", desc: "Extract Perl" },
        { cmd: "sh Configure -des -Dprefix=/usr -Dvendorprefix=/usr -Duseshrplib -Dprivlib=/usr/lib/perl5/5.38/core_perl -Darchlib=/usr/lib/perl5/5.38/core_perl -Dsitelib=/usr/lib/perl5/5.38/site_perl -Dsitearch=/usr/lib/perl5/5.38/site_perl -Dvendorlib=/usr/lib/perl5/5.38/vendor_perl -Dvendorarch=/usr/lib/perl5/5.38/vendor_perl", desc: "Configure Perl" },
        { cmd: "make && make install", desc: "Build and install Perl" },
        { cmd: "cd /sources && rm -rf perl-5.38.0", desc: "Cleanup" },
        { cmd: "cd /sources && tar -xf Python-3.11.4.tar.xz && cd Python-3.11.4", desc: "Extract Python" },
        { cmd: "./configure --prefix=/usr --enable-shared --without-ensurepip", desc: "Configure Python" },
        { cmd: "make && make install", desc: "Build and install Python" },
        { cmd: "cd /sources && rm -rf Python-3.11.4", desc: "Cleanup" },
      ]
    },
    {
      id: "texinfo-util",
      title: "15. Texinfo & Util-linux",
      description: "Build documentation and system utilities",
      chapter: "Chapter 7.11-7.12",
      commands: [
        { cmd: "cd /sources && tar -xf texinfo-7.0.3.tar.xz && cd texinfo-7.0.3", desc: "Extract Texinfo" },
        { cmd: "./configure --prefix=/usr", desc: "Configure Texinfo" },
        { cmd: "make && make install", desc: "Build and install Texinfo" },
        { cmd: "cd /sources && rm -rf texinfo-7.0.3", desc: "Cleanup" },
        { cmd: "cd /sources && tar -xf util-linux-2.39.1.tar.xz && cd util-linux-2.39.1", desc: "Extract Util-linux" },
        { cmd: "mkdir -pv /var/lib/hwclock", desc: "Create hwclock directory" },
        { cmd: "./configure ADJTIME_PATH=/var/lib/hwclock/adjtime --libdir=/usr/lib --runstatedir=/run --docdir=/usr/share/doc/util-linux-2.39.1 --disable-chfn-chsh --disable-login --disable-nologin --disable-su --disable-setpriv --disable-runuser --disable-pylibmount --disable-static --without-python", desc: "Configure Util-linux" },
        { cmd: "make && make install", desc: "Build and install Util-linux" },
        { cmd: "cd /sources && rm -rf util-linux-2.39.1", desc: "Cleanup" },
      ]
    },

    {
      id: "cleanup-backup",
      title: "16. Cleanup & Backup",
      description: "Clean temporary files and backup the toolchain",
      chapter: "Chapter 7.13-7.14",
      commands: [
        { cmd: "rm -rf /usr/share/{info,man,doc}/*", desc: "Remove documentation" },
        { cmd: "find /usr/{lib,libexec} -name \\*.la -delete", desc: "Remove libtool archives" },
        { cmd: "rm -rf /tools", desc: "Remove temporary tools" },
        { cmd: "# Exit chroot and backup", desc: "--- Backup Commands (run outside chroot) ---" },
        { cmd: "exit", desc: "Exit chroot environment" },
        { cmd: "sudo umount $LFS/dev/pts $LFS/{sys,proc,run,dev}", desc: "Unmount virtual filesystems" },
        { cmd: "cd $LFS && sudo tar -cJpf $HOME/lfs-temp-tools-12.0.tar.xz .", desc: "Create backup archive", warning: "This creates a large backup file" },
      ]
    },
    {
      id: "kernel-build",
      title: "17. Linux Kernel",
      description: "Configure and compile the Linux kernel",
      chapter: "Chapter 10.3",
      commands: [
        { cmd: "cd /sources && tar -xf linux-6.4.12.tar.xz && cd linux-6.4.12", desc: "Extract kernel source" },
        { cmd: "make mrproper", desc: "Clean source tree" },
        { cmd: "make defconfig", desc: "Create default config (or use menuconfig)" },
        { cmd: "make menuconfig", desc: "Interactive kernel configuration", warning: "Optional - customize kernel options" },
        { cmd: "make", desc: "Compile the kernel", warning: "Takes 30-60 minutes" },
        { cmd: "make modules_install", desc: "Install kernel modules" },
        { cmd: "cp -iv arch/x86/boot/bzImage /boot/vmlinuz-6.4.12-lfs-12.0", desc: "Install kernel image" },
        { cmd: "cp -iv System.map /boot/System.map-6.4.12", desc: "Install System.map" },
        { cmd: "cp -iv .config /boot/config-6.4.12", desc: "Save kernel config" },
        { cmd: "install -d /usr/share/doc/linux-6.4.12", desc: "Create doc directory" },
        { cmd: "cp -r Documentation/* /usr/share/doc/linux-6.4.12", desc: "Install documentation" },
      ]
    },
    {
      id: "grub-setup",
      title: "18. GRUB Bootloader",
      description: "Install and configure GRUB",
      chapter: "Chapter 10.4",
      commands: [
        { cmd: "cd /sources && tar -xf grub-2.06.tar.xz && cd grub-2.06", desc: "Extract GRUB" },
        { cmd: "./configure --prefix=/usr --sysconfdir=/etc --disable-efiemu --disable-werror", desc: "Configure GRUB" },
        { cmd: "make && make install", desc: "Build and install GRUB" },
        { cmd: "grub-install /dev/sda", desc: "Install GRUB to disk", warning: "Replace /dev/sda with your boot disk" },
        { cmd: "cat > /boot/grub/grub.cfg << \"EOF\"\nset default=0\nset timeout=5\n\ninsmod ext2\nset root=(hd0,2)\n\nmenuentry \"GNU/Linux, Linux 6.4.12-lfs-12.0\" {\n        linux   /boot/vmlinuz-6.4.12-lfs-12.0 root=/dev/sda2 ro\n}\nEOF", desc: "Create GRUB config", warning: "Adjust partition numbers for your system" },
      ]
    },
    {
      id: "final-config",
      title: "19. Final System Configuration",
      description: "Configure the final LFS system",
      chapter: "Chapter 9",
      commands: [
        { cmd: "echo \"lfs\" > /etc/hostname", desc: "Set hostname" },
        { cmd: "cat > /etc/hosts << \"EOF\"\n127.0.0.1 localhost\n127.0.1.1 lfs\n::1       localhost ip6-localhost ip6-loopback\nff02::1   ip6-allnodes\nff02::2   ip6-allrouters\nEOF", desc: "Configure /etc/hosts" },
        { cmd: "cat > /etc/inittab << \"EOF\"\nid:3:initdefault:\n\nsi::sysinit:/etc/rc.d/init.d/rc S\n\nl0:0:wait:/etc/rc.d/init.d/rc 0\nl1:S1:wait:/etc/rc.d/init.d/rc 1\nl2:2:wait:/etc/rc.d/init.d/rc 2\nl3:3:wait:/etc/rc.d/init.d/rc 3\nl4:4:wait:/etc/rc.d/init.d/rc 4\nl5:5:wait:/etc/rc.d/init.d/rc 5\nl6:6:wait:/etc/rc.d/init.d/rc 6\n\nca:12345:ctrlaltdel:/sbin/shutdown -t1 -a -r now\n\nsu:S06:once:/sbin/sulogin\ns1:1:respawn:/sbin/sulogin\n\n1:2345:respawn:/sbin/agetty --noclear tty1 9600\n2:2345:respawn:/sbin/agetty tty2 9600\n3:2345:respawn:/sbin/agetty tty3 9600\n4:2345:respawn:/sbin/agetty tty4 9600\n5:2345:respawn:/sbin/agetty tty5 9600\n6:2345:respawn:/sbin/agetty tty6 9600\nEOF", desc: "Create /etc/inittab" },
        { cmd: "cat > /etc/fstab << \"EOF\"\n# <file system>  <mount point>  <type>  <options>  <dump>  <pass>\n/dev/sda2        /              ext4    defaults   1       1\n/dev/sda1        swap           swap    pri=1      0       0\nproc             /proc          proc    nosuid,noexec,nodev 0 0\nsysfs            /sys           sysfs   nosuid,noexec,nodev 0 0\ndevpts           /dev/pts       devpts  gid=5,mode=620 0 0\ntmpfs            /run           tmpfs   defaults   0 0\ndevtmpfs         /dev           devtmpfs mode=0755,nosuid 0 0\nEOF", desc: "Create /etc/fstab", warning: "Adjust partitions for your system" },
      ]
    },
    {
      id: "lfs-release",
      title: "20. LFS Release Files",
      description: "Create release identification files",
      chapter: "Chapter 11",
      commands: [
        { cmd: "echo 12.0 > /etc/lfs-release", desc: "Create LFS release file" },
        { cmd: "cat > /etc/lsb-release << \"EOF\"\nDISTRIB_ID=\"Linux From Scratch\"\nDISTRIB_RELEASE=\"12.0\"\nDISTRIB_CODENAME=\"Sam's LFS\"\nDISTRIB_DESCRIPTION=\"Linux From Scratch\"\nEOF", desc: "Create LSB release file" },
        { cmd: "cat > /etc/os-release << \"EOF\"\nNAME=\"Linux From Scratch\"\nVERSION=\"12.0\"\nID=lfs\nPRETTY_NAME=\"Linux From Scratch 12.0\"\nVERSION_CODENAME=\"Sam's LFS\"\nHOME_URL=\"https://lfs-by-sam.netlify.app\"\nEOF", desc: "Create OS release file" },
        { cmd: "logout", desc: "Exit chroot - System is ready!" },
      ]
    },
  ];


  const allCommands = commandCategories.flatMap(cat => 
    cat.commands.map(cmd => ({ ...cmd, category: cat.title, chapter: cat.chapter }))
  );

  const filteredCommands = searchQuery
    ? allCommands.filter(cmd =>
        cmd.cmd.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cmd.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cmd.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null;

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-black text-white relative overflow-hidden">
        <DottedSurface className="opacity-20" />
      
        {/* Hero Section */}
        <section className="relative pt-32 pb-12 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-6">
                <Terminal className="h-4 w-4 text-green-400" />
                <span className="text-sm text-green-400">LFS 12.0 Build Commands</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-green-400 via-emerald-500 to-cyan-500 bg-clip-text text-transparent">
                Build Commands
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
                Complete step-by-step commands to build Linux From Scratch 12.0 from source
              </p>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search commands... (e.g., 'gcc', 'kernel', 'configure')"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-500 focus:outline-none focus:border-green-500/50 focus:bg-white/10 transition-all"
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap justify-center gap-6 mt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">{commandCategories.length}</div>
                  <div className="text-sm text-gray-400">Build Stages</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">{allCommands.length}</div>
                  <div className="text-sm text-gray-400">Commands</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">12.0</div>
                  <div className="text-sm text-gray-400">LFS Version</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Warning Banner */}
        <section className="px-6 pb-8">
          <div className="container mx-auto max-w-6xl">
            <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-200 font-medium">Important: Run these commands in order</p>
                <p className="text-yellow-200/70 text-sm">These commands build a complete LFS system. Run them sequentially on a Linux host system with at least 10GB free space.</p>
              </div>
            </div>
          </div>
        </section>


        {/* Commands Display */}
        <section className="relative py-8 px-6 pb-20">
          <div className="container mx-auto max-w-6xl">
            {/* Search Results */}
            {filteredCommands && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6">
                  {filteredCommands.length} result{filteredCommands.length !== 1 ? 's' : ''} found
                </h2>
                <div className="space-y-3">
                  {filteredCommands.map((cmd, i) => (
                    <div
                      key={i}
                      className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-r from-white/5 to-transparent p-4 hover:border-green-500/30 hover:bg-white/10 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <code className="text-green-400 font-mono text-sm break-all">{cmd.cmd}</code>
                            <span className="text-xs text-gray-500 px-2 py-1 rounded-full bg-white/5 shrink-0">
                              {cmd.chapter}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400">{cmd.desc}</p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(cmd.cmd)}
                          className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-green-500/30 transition-all shrink-0"
                          title="Copy command"
                        >
                          {copiedCommand === cmd.cmd ? (
                            <Check className="h-4 w-4 text-green-400" />
                          ) : (
                            <Copy className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Category View */}
            {!filteredCommands && (
              <div className="space-y-6">
                {commandCategories.map((category) => {
                  const isExpanded = expandedCategories.includes(category.id);
                  return (
                    <div
                      key={category.id}
                      className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent overflow-hidden"
                    >
                      {/* Category Header */}
                      <button
                        onClick={() => toggleCategory(category.id)}
                        className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          {isExpanded ? (
                            <FolderOpen className="h-6 w-6 text-green-400" />
                          ) : (
                            <Folder className="h-6 w-6 text-gray-400" />
                          )}
                          <div className="text-left">
                            <div className="flex items-center gap-3">
                              <h3 className="text-xl font-bold">{category.title}</h3>
                              {category.chapter && (
                                <span className="text-xs text-blue-400 px-2 py-1 rounded-full bg-blue-500/10">
                                  {category.chapter}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-400">{category.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-500 px-3 py-1 rounded-full bg-white/5">
                            {category.commands.length} commands
                          </span>
                          {isExpanded ? (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </button>

                      {/* Commands List */}
                      {isExpanded && (
                        <div className="border-t border-white/10 p-6">
                          <div className="flex justify-end mb-4">
                            <button
                              onClick={() => copyAllCommands(category.commands)}
                              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 transition-all text-sm"
                            >
                              {copiedCommand === "all" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                              Copy All Commands
                            </button>
                          </div>
                          <div className="space-y-3">
                            {category.commands.map((cmd, i) => (
                              <div
                                key={i}
                                className={`group relative overflow-hidden rounded-xl border p-4 transition-all duration-300 ${
                                  cmd.warning 
                                    ? 'border-yellow-500/30 bg-yellow-500/5 hover:border-yellow-500/50' 
                                    : 'border-white/10 bg-gradient-to-r from-white/5 to-transparent hover:border-green-500/30 hover:bg-white/10'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1 min-w-0">
                                    <code className="text-green-400 font-mono text-sm block mb-2 break-all whitespace-pre-wrap">
                                      $ {cmd.cmd}
                                    </code>
                                    <p className="text-sm text-gray-400">{cmd.desc}</p>
                                    {cmd.warning && (
                                      <p className="text-xs text-yellow-400 mt-2 flex items-center gap-1">
                                        <AlertTriangle className="h-3 w-3" />
                                        {cmd.warning}
                                      </p>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => copyToClipboard(cmd.cmd)}
                                    className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-green-500/30 transition-all shrink-0"
                                    title="Copy command"
                                  >
                                    {copiedCommand === cmd.cmd ? (
                                      <Check className="h-4 w-4 text-green-400" />
                                    ) : (
                                      <Copy className="h-4 w-4 text-gray-400" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>


        {/* CTA Section */}
        <section className="relative py-20 px-6 bg-gradient-to-b from-black via-green-950/10 to-black">
          <div className="container mx-auto max-w-4xl">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-green-900/20 via-emerald-900/20 to-cyan-900/20 p-12 text-center backdrop-blur-sm">
              <div className="relative z-10">
                <h2 className="text-4xl font-bold mb-6">Ready to Build?</h2>
                <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                  Learn the concepts behind each command in our interactive modules
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/learn"
                    className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300"
                  >
                    Start Learning
                  </Link>
                  <Link
                    href="/terminal"
                    className="px-8 py-4 border border-white/20 rounded-full font-semibold hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Try Terminal
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative border-t border-white/10 py-12 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2">
                <Terminal className="h-5 w-5 text-blue-400" />
                <span className="font-bold">Sam's LFS</span>
              </div>
              <p className="text-sm text-gray-400">
                Build your own Linux system from source
              </p>
              <div className="flex gap-6">
                <Link href="/learn" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Learn
                </Link>
                <Link href="/docs" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Docs
                </Link>
                <Link href="/downloads" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Downloads
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </ProtectedRoute>
  );
}
