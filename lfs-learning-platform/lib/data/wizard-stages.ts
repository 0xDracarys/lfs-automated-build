/**
 * LFS Installer Wizard Stage Definitions
 * 
 * Defines all 12 stages of the LFS installation process with:
 * - Metadata (title, description, time estimates)
 * - Platform-specific commands
 * - Troubleshooting information
 */

import { StageInfo, StageCommand, TroubleshootingItem } from '@/lib/types/wizard';

// ============================================================================
// Stage 1: Platform Setup
// ============================================================================

const stage1Commands: StageCommand[] = [
  // Windows WSL Setup
  {
    id: 'wsl-install',
    description: 'Install Windows Subsystem for Linux',
    command: 'wsl --install -d Ubuntu',
    platforms: ['windows'],
    warningMessage: 'Run PowerShell as Administrator',
    requiresSudo: false,
  },
  {
    id: 'wsl-restart',
    description: 'Restart your computer after WSL installation',
    command: '# Restart your computer, then open Ubuntu from Start menu',
    platforms: ['windows'],
  },
  {
    id: 'wsl-update',
    description: 'Update WSL packages',
    command: 'sudo apt update && sudo apt upgrade -y',
    platforms: ['windows'],
    requiresSudo: true,
  },
  // Ubuntu/Debian Setup
  {
    id: 'ubuntu-deps',
    description: 'Install build dependencies',
    command: 'sudo apt install -y build-essential bison gawk texinfo',
    platforms: ['linux'],
    distros: ['ubuntu', 'debian'],
    requiresSudo: true,
  },
  // Fedora Setup
  {
    id: 'fedora-deps',
    description: 'Install build dependencies',
    command: 'sudo dnf groupinstall -y "Development Tools" && sudo dnf install -y bison gawk texinfo',
    platforms: ['linux'],
    distros: ['fedora'],
    requiresSudo: true,
  },
  // Arch Setup
  {
    id: 'arch-deps',
    description: 'Install build dependencies',
    command: 'sudo pacman -S --needed base-devel bison gawk texinfo',
    platforms: ['linux'],
    distros: ['arch'],
    requiresSudo: true,
  },
  // Version check (all platforms)
  {
    id: 'version-check',
    description: 'Verify all required tools are installed',
    command: `bash -c 'echo "Checking versions..."; gcc --version | head -1; make --version | head -1; bash --version | head -1'`,
    platforms: ['windows', 'linux'],
  },
];

const stage1Troubleshooting: TroubleshootingItem[] = [
  {
    error: 'WSL installation fails with error 0x80370102',
    solution: 'Enable virtualization in BIOS/UEFI settings. Look for "Intel VT-x" or "AMD-V".',
  },
  {
    error: 'Package not found errors on Ubuntu',
    solution: 'Run "sudo apt update" first to refresh package lists.',
    commands: ['sudo apt update'],
  },
  {
    error: 'Permission denied when running commands',
    solution: 'Make sure to use "sudo" for commands that require root privileges.',
  },
];

// ============================================================================
// Stage 2: Mount Point Creation
// ============================================================================

const stage2Commands: StageCommand[] = [
  {
    id: 'set-lfs-var',
    description: 'Set the LFS environment variable',
    command: 'export LFS=/mnt/lfs',
    platforms: ['windows', 'linux'],
  },
  {
    id: 'create-lfs-dir',
    description: 'Create the LFS directory',
    command: 'sudo mkdir -pv $LFS',
    platforms: ['windows', 'linux'],
    requiresSudo: true,
  },
  {
    id: 'create-sources-dir',
    description: 'Create the sources directory',
    command: 'sudo mkdir -pv $LFS/sources',
    platforms: ['windows', 'linux'],
    requiresSudo: true,
  },
  {
    id: 'set-permissions',
    description: 'Set directory permissions',
    command: 'sudo chmod -v a+wt $LFS/sources',
    platforms: ['windows', 'linux'],
    requiresSudo: true,
  },
  {
    id: 'create-tools-dir',
    description: 'Create the tools directory',
    command: 'sudo mkdir -pv $LFS/tools',
    platforms: ['windows', 'linux'],
    requiresSudo: true,
  },
  {
    id: 'create-tools-symlink',
    description: 'Create symlink for tools (optional but recommended)',
    command: 'sudo ln -sv $LFS/tools /',
    platforms: ['linux'],
    isOptional: true,
    requiresSudo: true,
  },
  {
    id: 'verify-mount',
    description: 'Verify the directory structure',
    command: 'ls -la $LFS',
    platforms: ['windows', 'linux'],
  },
];

const stage2Troubleshooting: TroubleshootingItem[] = [
  {
    error: 'mkdir: cannot create directory: Permission denied',
    solution: 'Use sudo before the mkdir command.',
    commands: ['sudo mkdir -pv /mnt/lfs'],
  },
  {
    error: '$LFS variable is empty',
    solution: 'Make sure to run "export LFS=/mnt/lfs" first, or add it to your ~/.bashrc',
    commands: ['echo "export LFS=/mnt/lfs" >> ~/.bashrc', 'source ~/.bashrc'],
  },
];

// ============================================================================
// Stage 3: Source Downloads
// ============================================================================

const stage3Commands: StageCommand[] = [
  {
    id: 'download-toolchain',
    description: 'Download the pre-built LFS toolchain (recommended)',
    command: 'wget "https://firebasestorage.googleapis.com/v0/b/alfs-bd1e0.firebasestorage.app/o/lfs-12.0-toolchain.tar.gz?alt=media" -O $LFS/sources/lfs-toolchain.tar.gz',
    platforms: ['windows', 'linux'],
  },
  {
    id: 'verify-download',
    description: 'Verify the download size (should be ~436 MB)',
    command: 'ls -lh $LFS/sources/lfs-toolchain.tar.gz',
    platforms: ['windows', 'linux'],
  },
  {
    id: 'extract-toolchain',
    description: 'Extract the toolchain',
    command: 'cd $LFS && sudo tar -xzf sources/lfs-toolchain.tar.gz',
    platforms: ['windows', 'linux'],
    requiresSudo: true,
  },
  {
    id: 'verify-extraction',
    description: 'Verify extraction was successful',
    command: 'ls -la $LFS/tools/bin | head -10',
    platforms: ['windows', 'linux'],
  },
];

const stage3Troubleshooting: TroubleshootingItem[] = [
  {
    error: 'wget: command not found',
    solution: 'Install wget using your package manager.',
    commands: ['sudo apt install wget', 'sudo dnf install wget', 'sudo pacman -S wget'],
  },
  {
    error: 'Download is very slow',
    solution: 'The toolchain is 436 MB. On slow connections, this may take 10-30 minutes.',
  },
  {
    error: 'tar: Error opening archive',
    solution: 'The download may be corrupted. Delete and re-download the file.',
    commands: ['rm $LFS/sources/lfs-toolchain.tar.gz'],
  },
];

// ============================================================================
// Stage 4: LFS User Creation
// ============================================================================

const stage4Commands: StageCommand[] = [
  {
    id: 'create-lfs-group',
    description: 'Create the lfs group',
    command: 'sudo groupadd lfs',
    platforms: ['windows', 'linux'],
    requiresSudo: true,
  },
  {
    id: 'create-lfs-user',
    description: 'Create the lfs user',
    command: 'sudo useradd -s /bin/bash -g lfs -m -k /dev/null lfs',
    platforms: ['windows', 'linux'],
    requiresSudo: true,
  },
  {
    id: 'set-lfs-password',
    description: 'Set password for lfs user (optional)',
    command: 'sudo passwd lfs',
    platforms: ['windows', 'linux'],
    isOptional: true,
    requiresSudo: true,
  },
  {
    id: 'grant-ownership',
    description: 'Grant lfs user ownership of LFS directories',
    command: 'sudo chown -v lfs $LFS/{tools,sources}',
    platforms: ['windows', 'linux'],
    requiresSudo: true,
  },
  {
    id: 'grant-lfs-ownership',
    description: 'Grant lfs user ownership of LFS root',
    command: 'sudo chown -v lfs $LFS',
    platforms: ['windows', 'linux'],
    requiresSudo: true,
  },
  {
    id: 'switch-to-lfs',
    description: 'Switch to the lfs user',
    command: 'su - lfs',
    platforms: ['windows', 'linux'],
  },
];

const stage4Troubleshooting: TroubleshootingItem[] = [
  {
    error: 'useradd: group lfs does not exist',
    solution: 'Create the group first with "sudo groupadd lfs".',
  },
  {
    error: 'useradd: user lfs already exists',
    solution: 'The user already exists. You can skip this step or delete and recreate.',
    commands: ['sudo userdel -r lfs'],
  },
];

// ============================================================================
// Stage 5: Cross-Toolchain Setup
// ============================================================================

const stage5Commands: StageCommand[] = [
  {
    id: 'setup-bash-profile',
    description: 'Create .bash_profile for lfs user',
    command: `cat > ~/.bash_profile << "EOF"
exec env -i HOME=$HOME TERM=$TERM PS1='\\u:\\w\\$ ' /bin/bash
EOF`,
    platforms: ['windows', 'linux'],
  },
  {
    id: 'setup-bashrc',
    description: 'Create .bashrc for lfs user',
    command: `cat > ~/.bashrc << "EOF"
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
EOF`,
    platforms: ['windows', 'linux'],
  },
  {
    id: 'source-bashrc',
    description: 'Load the new environment',
    command: 'source ~/.bash_profile',
    platforms: ['windows', 'linux'],
  },
  {
    id: 'verify-env',
    description: 'Verify environment variables',
    command: 'echo "LFS=$LFS" && echo "LFS_TGT=$LFS_TGT" && echo "PATH=$PATH"',
    platforms: ['windows', 'linux'],
  },
  {
    id: 'verify-toolchain',
    description: 'Verify toolchain is accessible',
    command: '$LFS/tools/bin/x86_64-lfs-linux-gnu-gcc --version',
    platforms: ['windows', 'linux'],
  },
];

const stage5Troubleshooting: TroubleshootingItem[] = [
  {
    error: 'gcc: command not found',
    solution: 'Make sure the toolchain was extracted correctly and PATH is set.',
    commands: ['ls $LFS/tools/bin/', 'echo $PATH'],
  },
  {
    error: 'LFS variable is not set',
    solution: 'Source your .bashrc file again.',
    commands: ['source ~/.bashrc', 'echo $LFS'],
  },
];

// ============================================================================
// Stage 6: Temporary Tools (Simplified - using pre-built)
// ============================================================================

const stage6Commands: StageCommand[] = [
  {
    id: 'verify-tools',
    description: 'Verify temporary tools are present',
    command: 'ls $LFS/tools/bin/ | wc -l',
    platforms: ['windows', 'linux'],
  },
  {
    id: 'test-bash',
    description: 'Test bash from toolchain',
    command: '$LFS/tools/bin/bash --version',
    platforms: ['windows', 'linux'],
  },
  {
    id: 'test-make',
    description: 'Test make from toolchain',
    command: '$LFS/tools/bin/make --version',
    platforms: ['windows', 'linux'],
  },
  {
    id: 'backup-tools',
    description: 'Backup the tools directory (recommended)',
    command: 'cd $LFS && sudo tar -czvf tools-backup.tar.gz tools/',
    platforms: ['windows', 'linux'],
    isOptional: true,
    requiresSudo: true,
  },
];

const stage6Troubleshooting: TroubleshootingItem[] = [
  {
    error: 'Tools directory is empty',
    solution: 'Re-extract the toolchain from Stage 3.',
  },
];

// ============================================================================
// Stage 7: Chroot Environment Setup
// ============================================================================

const stage7Commands: StageCommand[] = [
  {
    id: 'create-dirs',
    description: 'Create essential directories in LFS',
    command: `sudo mkdir -pv $LFS/{dev,proc,sys,run}`,
    platforms: ['windows', 'linux'],
    requiresSudo: true,
  },
  {
    id: 'mount-dev',
    description: 'Mount /dev',
    command: 'sudo mount -v --bind /dev $LFS/dev',
    platforms: ['windows', 'linux'],
    requiresSudo: true,
  },
  {
    id: 'mount-devpts',
    description: 'Mount /dev/pts',
    command: 'sudo mount -vt devpts devpts -o gid=5,mode=0620 $LFS/dev/pts',
    platforms: ['windows', 'linux'],
    requiresSudo: true,
  },
  {
    id: 'mount-proc',
    description: 'Mount /proc',
    command: 'sudo mount -vt proc proc $LFS/proc',
    platforms: ['windows', 'linux'],
    requiresSudo: true,
  },
  {
    id: 'mount-sys',
    description: 'Mount /sys',
    command: 'sudo mount -vt sysfs sysfs $LFS/sys',
    platforms: ['windows', 'linux'],
    requiresSudo: true,
  },
  {
    id: 'mount-run',
    description: 'Mount /run',
    command: 'sudo mount -vt tmpfs tmpfs $LFS/run',
    platforms: ['windows', 'linux'],
    requiresSudo: true,
  },
  {
    id: 'enter-chroot',
    description: 'Enter the chroot environment',
    command: `sudo chroot "$LFS" /tools/bin/env -i \\
    HOME=/root \\
    TERM="$TERM" \\
    PS1='(lfs chroot) \\u:\\w\\$ ' \\
    PATH=/usr/bin:/usr/sbin:/tools/bin \\
    /tools/bin/bash --login`,
    platforms: ['windows', 'linux'],
    requiresSudo: true,
    warningMessage: 'This will enter the LFS chroot environment. Type "exit" to leave.',
  },
];

const stage7Troubleshooting: TroubleshootingItem[] = [
  {
    error: 'mount: /mnt/lfs/dev: mount point does not exist',
    solution: 'Create the directory first.',
    commands: ['sudo mkdir -pv $LFS/dev'],
  },
  {
    error: 'chroot: failed to run command',
    solution: 'Make sure /tools/bin/bash exists and is executable.',
    commands: ['ls -la $LFS/tools/bin/bash'],
  },
];

// ============================================================================
// Stages 8-12: Simplified for pre-built toolchain users
// ============================================================================

const stage8Commands: StageCommand[] = [
  {
    id: 'info',
    description: 'Note: With the pre-built toolchain, core packages are already compiled',
    command: '# The pre-built toolchain includes compiled packages',
    platforms: ['windows', 'linux'],
  },
  {
    id: 'verify-glibc',
    description: 'Verify glibc is present',
    command: 'ls $LFS/tools/lib/libc.so*',
    platforms: ['windows', 'linux'],
  },
  {
    id: 'verify-gcc',
    description: 'Verify GCC is present',
    command: '$LFS/tools/bin/*-gcc --version',
    platforms: ['windows', 'linux'],
  },
];

const stage9Commands: StageCommand[] = [
  {
    id: 'create-etc',
    description: 'Create /etc directory',
    command: 'sudo mkdir -pv $LFS/etc',
    platforms: ['windows', 'linux'],
    requiresSudo: true,
  },
  {
    id: 'create-hostname',
    description: 'Set hostname',
    command: 'echo "lfs" | sudo tee $LFS/etc/hostname',
    platforms: ['windows', 'linux'],
    requiresSudo: true,
  },
  {
    id: 'create-hosts',
    description: 'Create /etc/hosts',
    command: `echo "127.0.0.1 localhost lfs" | sudo tee $LFS/etc/hosts`,
    platforms: ['windows', 'linux'],
    requiresSudo: true,
  },
  {
    id: 'create-passwd',
    description: 'Create /etc/passwd',
    command: `cat << "EOF" | sudo tee $LFS/etc/passwd
root:x:0:0:root:/root:/bin/bash
EOF`,
    platforms: ['windows', 'linux'],
    requiresSudo: true,
  },
];

const stage10Commands: StageCommand[] = [
  {
    id: 'kernel-info',
    description: 'Note: Kernel compilation requires additional setup',
    command: '# Download kernel source from kernel.org if building from scratch',
    platforms: ['windows', 'linux'],
  },
  {
    id: 'download-kernel',
    description: 'Download Linux kernel (if building from scratch)',
    command: 'wget https://cdn.kernel.org/pub/linux/kernel/v6.x/linux-6.4.12.tar.xz -P $LFS/sources/',
    platforms: ['windows', 'linux'],
    isOptional: true,
  },
];

const stage11Commands: StageCommand[] = [
  {
    id: 'grub-info',
    description: 'Note: GRUB installation depends on your boot setup',
    command: '# GRUB configuration varies by system (BIOS vs UEFI)',
    platforms: ['windows', 'linux'],
  },
];

const stage12Commands: StageCommand[] = [
  {
    id: 'exit-chroot',
    description: 'Exit the chroot environment',
    command: 'exit',
    platforms: ['windows', 'linux'],
  },
  {
    id: 'unmount-virtual',
    description: 'Unmount virtual filesystems',
    command: `sudo umount $LFS/dev/pts
sudo umount $LFS/{sys,proc,run,dev}`,
    platforms: ['windows', 'linux'],
    requiresSudo: true,
  },
  {
    id: 'final-message',
    description: 'Congratulations!',
    command: '# Your LFS system is ready! You can boot from the ISO or continue building.',
    platforms: ['windows', 'linux'],
  },
];

// ============================================================================
// Complete Stage Definitions
// ============================================================================

export const STAGES: StageInfo[] = [
  {
    id: 1,
    title: 'Platform Setup',
    shortTitle: 'Setup',
    description: 'Install WSL (Windows) or build dependencies (Linux) to prepare your system for LFS building.',
    estimatedTime: '15-30 min',
    diskSpace: '2 GB',
    prerequisites: [],
    commands: stage1Commands,
    troubleshooting: stage1Troubleshooting,
    icon: 'Monitor',
  },
  {
    id: 2,
    title: 'Mount Point Creation',
    shortTitle: 'Mount',
    description: 'Create the /mnt/lfs directory structure where your LFS system will be built.',
    estimatedTime: '5 min',
    diskSpace: '10 GB',
    prerequisites: [1],
    commands: stage2Commands,
    troubleshooting: stage2Troubleshooting,
    icon: 'FolderOpen',
  },
  {
    id: 3,
    title: 'Source Downloads',
    shortTitle: 'Download',
    description: 'Download the pre-built LFS toolchain (436 MB) containing all compiled packages.',
    estimatedTime: '10-30 min',
    diskSpace: '2 GB',
    prerequisites: [2],
    commands: stage3Commands,
    troubleshooting: stage3Troubleshooting,
    icon: 'Download',
  },
  {
    id: 4,
    title: 'LFS User Creation',
    shortTitle: 'User',
    description: 'Create a dedicated lfs user account for building with limited privileges.',
    estimatedTime: '5 min',
    diskSpace: '0',
    prerequisites: [3],
    commands: stage4Commands,
    troubleshooting: stage4Troubleshooting,
    icon: 'User',
  },
  {
    id: 5,
    title: 'Environment Setup',
    shortTitle: 'Environment',
    description: 'Configure environment variables and verify the toolchain is working.',
    estimatedTime: '10 min',
    diskSpace: '0',
    prerequisites: [4],
    commands: stage5Commands,
    troubleshooting: stage5Troubleshooting,
    icon: 'Settings',
  },
  {
    id: 6,
    title: 'Verify Temporary Tools',
    shortTitle: 'Tools',
    description: 'Verify the pre-built temporary tools are present and working.',
    estimatedTime: '5 min',
    diskSpace: '0',
    prerequisites: [5],
    commands: stage6Commands,
    troubleshooting: stage6Troubleshooting,
    icon: 'Wrench',
  },
  {
    id: 7,
    title: 'Chroot Environment',
    shortTitle: 'Chroot',
    description: 'Mount virtual filesystems and enter the isolated LFS build environment.',
    estimatedTime: '10 min',
    diskSpace: '0',
    prerequisites: [6],
    commands: stage7Commands,
    troubleshooting: stage7Troubleshooting,
    icon: 'Terminal',
  },
  {
    id: 8,
    title: 'Verify Core Packages',
    shortTitle: 'Packages',
    description: 'Verify the pre-built core packages (GCC, Glibc, etc.) are present.',
    estimatedTime: '5 min',
    diskSpace: '0',
    prerequisites: [7],
    commands: stage8Commands,
    troubleshooting: [],
    icon: 'Package',
  },
  {
    id: 9,
    title: 'System Configuration',
    shortTitle: 'Config',
    description: 'Configure basic system files like hostname, hosts, and passwd.',
    estimatedTime: '15 min',
    diskSpace: '0',
    prerequisites: [8],
    commands: stage9Commands,
    troubleshooting: [],
    icon: 'FileText',
  },
  {
    id: 10,
    title: 'Kernel Setup',
    shortTitle: 'Kernel',
    description: 'Information about kernel compilation (optional for pre-built users).',
    estimatedTime: '1-2 hours',
    diskSpace: '1 GB',
    prerequisites: [9],
    commands: stage10Commands,
    troubleshooting: [],
    icon: 'Cpu',
  },
  {
    id: 11,
    title: 'Bootloader Setup',
    shortTitle: 'GRUB',
    description: 'Information about GRUB bootloader installation.',
    estimatedTime: '30 min',
    diskSpace: '100 MB',
    prerequisites: [10],
    commands: stage11Commands,
    troubleshooting: [],
    icon: 'HardDrive',
  },
  {
    id: 12,
    title: 'Final Steps',
    shortTitle: 'Finish',
    description: 'Exit chroot, unmount filesystems, and prepare to boot your LFS system.',
    estimatedTime: '10 min',
    diskSpace: '0',
    prerequisites: [11],
    commands: stage12Commands,
    troubleshooting: [],
    icon: 'CheckCircle',
  },
];

/**
 * Get a stage by ID
 */
export function getStageById(id: number): StageInfo | undefined {
  return STAGES.find(stage => stage.id === id);
}

/**
 * Get commands filtered by platform and distro
 */
export function getFilteredCommands(
  stage: StageInfo,
  platform: string,
  distro?: string | null
): StageCommand[] {
  return stage.commands.filter(cmd => {
    // Check platform
    if (!cmd.platforms.includes(platform as 'windows' | 'linux' | 'macos')) {
      return false;
    }
    // Check distro if specified
    if (cmd.distros && distro && !cmd.distros.includes(distro as 'ubuntu' | 'debian' | 'fedora' | 'arch' | 'other')) {
      return false;
    }
    return true;
  });
}

/**
 * Get total estimated time for all stages
 */
export function getTotalEstimatedTime(): string {
  return '2-4 hours';
}

/**
 * Get total disk space required
 */
export function getTotalDiskSpace(): string {
  return '15 GB';
}
