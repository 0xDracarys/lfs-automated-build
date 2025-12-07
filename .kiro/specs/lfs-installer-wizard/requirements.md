# Requirements Document

## Introduction

The LFS Installer Wizard is a comprehensive, interactive installation guide that helps users set up and build Linux From Scratch locally on their Windows (via WSL) or native Linux systems. The wizard divides the complex LFS build process into 10+ manageable stages, tracks progress, provides troubleshooting help, generates executable scripts, and ultimately allows users to boot into an LFS shell environment. It covers the complete LFS journey from initial setup through kernel compilation and system configuration.

## Glossary

- **LFS**: Linux From Scratch - a project that provides step-by-step instructions for building a custom Linux system from source code
- **WSL**: Windows Subsystem for Linux - allows running Linux on Windows
- **Toolchain**: The collection of compilers, linkers, and libraries needed to build software (GCC, Binutils, Glibc)
- **Cross-Compiler**: A compiler that runs on one system but produces code for another
- **Chroot**: Change root - a Unix operation that changes the apparent root directory
- **LFS Shell**: A terminal environment running within the LFS system
- **Stage**: A discrete phase of the LFS installation process
- **Installation Wizard**: An interactive UI that guides users through multi-step processes
- **Kernel**: The core of the operating system that manages hardware and system resources
- **GRUB**: Grand Unified Bootloader - software that loads the operating system
- **Fstab**: File system table - configuration file for mounting filesystems

## Requirements

### Requirement 1: Platform Detection & Welcome

**User Story:** As a user, I want the wizard to detect my operating system and provide a personalized welcome, so that I see relevant instructions from the start.

#### Acceptance Criteria

1. WHEN a user opens the wizard THEN the Wizard SHALL detect the operating system (Windows/Linux/macOS)
2. WHEN the OS is detected THEN the Wizard SHALL display a welcome screen with platform-specific information
3. WHEN on Windows THEN the Wizard SHALL indicate that WSL is required and estimate total build time
4. WHEN on Linux THEN the Wizard SHALL indicate native build support and estimate total build time
5. WHEN on macOS THEN the Wizard SHALL indicate that a Linux VM is recommended

### Requirement 2: Windows WSL Setup (Stage 1)

**User Story:** As a Windows user, I want to set up WSL and prepare my system for LFS building, so that I can build Linux From Scratch on my Windows machine.

#### Acceptance Criteria

1. WHEN a Windows user starts Stage 1 THEN the Wizard SHALL provide PowerShell commands to enable WSL
2. WHEN WSL needs installation THEN the Wizard SHALL provide the command: wsl --install -d Ubuntu
3. WHEN WSL is installed THEN the Wizard SHALL guide the user to create a Linux username and password
4. WHEN setup is complete THEN the Wizard SHALL verify WSL is working with a test command
5. WHEN verification fails THEN the Wizard SHALL provide troubleshooting steps for common WSL issues

### Requirement 3: Linux Dependencies Setup (Stage 1 Alt)

**User Story:** As a Linux user, I want to install required build dependencies, so that I have all tools needed for LFS compilation.

#### Acceptance Criteria

1. WHEN a Linux user starts Stage 1 THEN the Wizard SHALL detect the Linux distribution
2. WHEN on Ubuntu/Debian THEN the Wizard SHALL provide apt-get commands for dependencies
3. WHEN on Fedora/RHEL THEN the Wizard SHALL provide dnf commands for dependencies
4. WHEN on Arch THEN the Wizard SHALL provide pacman commands for dependencies
5. WHEN dependencies are installed THEN the Wizard SHALL run version-check.sh to verify all tools

### Requirement 4: Disk Partition & Mount Setup (Stage 2)

**User Story:** As a user, I want to create a dedicated partition or directory for LFS, so that my LFS build is isolated from my host system.

#### Acceptance Criteria

1. WHEN the user reaches Stage 2 THEN the Wizard SHALL explain partition vs directory options
2. WHEN using a directory THEN the Wizard SHALL provide commands to create /mnt/lfs with proper permissions
3. WHEN using a partition THEN the Wizard SHALL provide fdisk/parted commands with safety warnings
4. WHEN the mount point exists THEN the Wizard SHALL provide commands to set $LFS environment variable
5. WHEN setup is complete THEN the Wizard SHALL verify the mount point has at least 10GB free space

### Requirement 5: Source Downloads (Stage 3)

**User Story:** As a user, I want to download all required source packages, so that I have everything needed for the LFS build.

#### Acceptance Criteria

1. WHEN the user reaches Stage 3 THEN the Wizard SHALL provide two options: wget-list or pre-built toolchain
2. WHEN choosing wget-list THEN the Wizard SHALL provide commands to download all ~90 source packages
3. WHEN choosing pre-built toolchain THEN the Wizard SHALL provide the 436 MB toolchain download link
4. WHEN downloads complete THEN the Wizard SHALL provide md5sum verification commands
5. WHEN verification passes THEN the Wizard SHALL display a summary of downloaded packages

### Requirement 6: LFS User Creation (Stage 4)

**User Story:** As a user, I want to create a dedicated LFS user account, so that the build process runs with limited privileges for safety.

#### Acceptance Criteria

1. WHEN the user reaches Stage 4 THEN the Wizard SHALL provide commands to create the lfs user
2. WHEN creating the user THEN the Wizard SHALL set up proper group membership and home directory
3. WHEN the user is created THEN the Wizard SHALL provide commands to grant ownership of $LFS directories
4. WHEN ownership is set THEN the Wizard SHALL provide commands to switch to the lfs user
5. WHEN switched THEN the Wizard SHALL provide bash profile setup for the lfs user

### Requirement 7: Cross-Toolchain Build (Stage 5)

**User Story:** As a user, I want to build or install the cross-compilation toolchain, so that I can compile packages for the LFS target system.

#### Acceptance Criteria

1. WHEN the user reaches Stage 5 THEN the Wizard SHALL check if pre-built toolchain was downloaded
2. WHEN pre-built toolchain exists THEN the Wizard SHALL provide extraction commands
3. WHEN building from source THEN the Wizard SHALL provide commands for Binutils Pass 1, GCC Pass 1, Linux Headers, Glibc, Libstdc++
4. WHEN each package builds THEN the Wizard SHALL provide verification commands
5. WHEN toolchain is complete THEN the Wizard SHALL verify gcc and ld work correctly

### Requirement 8: Temporary Tools Build (Stage 6)

**User Story:** As a user, I want to build the temporary tools needed inside chroot, so that I have a minimal system to continue building.

#### Acceptance Criteria

1. WHEN the user reaches Stage 6 THEN the Wizard SHALL list all temporary tools to build (M4, Ncurses, Bash, Coreutils, etc.)
2. WHEN building each tool THEN the Wizard SHALL provide configure, make, and install commands
3. WHEN a build fails THEN the Wizard SHALL provide common error solutions and log file locations
4. WHEN all tools are built THEN the Wizard SHALL provide commands to strip debug symbols
5. WHEN stripping is complete THEN the Wizard SHALL backup the temporary tools

### Requirement 9: Chroot Environment Setup (Stage 7)

**User Story:** As a user, I want to enter the chroot environment, so that I can build the final LFS system isolated from the host.

#### Acceptance Criteria

1. WHEN the user reaches Stage 7 THEN the Wizard SHALL provide commands to mount virtual filesystems (proc, sys, dev)
2. WHEN filesystems are mounted THEN the Wizard SHALL provide the chroot command with proper environment
3. WHEN entering chroot THEN the Wizard SHALL provide commands to create essential directories
4. WHEN directories exist THEN the Wizard SHALL provide commands to create essential files and symlinks
5. WHEN setup is complete THEN the Wizard SHALL verify the chroot environment is working

### Requirement 10: Basic System Build (Stage 8)

**User Story:** As a user, I want to build the core LFS packages inside chroot, so that I have a functional base system.

#### Acceptance Criteria

1. WHEN the user reaches Stage 8 THEN the Wizard SHALL list all core packages (Glibc, Binutils, GCC, etc.)
2. WHEN building each package THEN the Wizard SHALL provide detailed build instructions with test commands
3. WHEN tests fail THEN the Wizard SHALL indicate which failures are acceptable vs critical
4. WHEN GCC is built THEN the Wizard SHALL provide sanity check commands to verify the toolchain
5. WHEN all packages are built THEN the Wizard SHALL provide cleanup commands

### Requirement 11: System Configuration (Stage 9)

**User Story:** As a user, I want to configure my LFS system (network, bootscripts, fstab), so that it can boot and function properly.

#### Acceptance Criteria

1. WHEN the user reaches Stage 9 THEN the Wizard SHALL provide network configuration commands
2. WHEN configuring network THEN the Wizard SHALL create /etc/hosts, /etc/hostname, and network scripts
3. WHEN configuring boot THEN the Wizard SHALL provide commands to set up bootscripts and init
4. WHEN configuring fstab THEN the Wizard SHALL generate /etc/fstab based on user's partition setup
5. WHEN configuration is complete THEN the Wizard SHALL create /etc/os-release and /etc/lfs-release

### Requirement 12: Kernel Compilation (Stage 10)

**User Story:** As a user, I want to compile and install the Linux kernel, so that my LFS system can boot.

#### Acceptance Criteria

1. WHEN the user reaches Stage 10 THEN the Wizard SHALL provide kernel source extraction commands
2. WHEN configuring kernel THEN the Wizard SHALL provide make menuconfig or a recommended .config file
3. WHEN compiling kernel THEN the Wizard SHALL provide make commands with parallel job options
4. WHEN kernel is compiled THEN the Wizard SHALL provide commands to install modules and kernel image
5. WHEN installation is complete THEN the Wizard SHALL verify kernel and initramfs are in /boot

### Requirement 13: GRUB Bootloader Setup (Stage 11)

**User Story:** As a user, I want to install and configure GRUB, so that I can boot into my LFS system.

#### Acceptance Criteria

1. WHEN the user reaches Stage 11 THEN the Wizard SHALL detect if UEFI or BIOS boot is needed
2. WHEN on BIOS THEN the Wizard SHALL provide grub-install commands for MBR
3. WHEN on UEFI THEN the Wizard SHALL provide grub-install commands for EFI partition
4. WHEN GRUB is installed THEN the Wizard SHALL provide grub.cfg generation commands
5. WHEN configuration is complete THEN the Wizard SHALL provide commands to verify GRUB installation

### Requirement 14: Final Steps & LFS Shell (Stage 12)

**User Story:** As a user who has completed all stages, I want to finalize my LFS system and boot into it, so that I can use my custom Linux.

#### Acceptance Criteria

1. WHEN the user reaches Stage 12 THEN the Wizard SHALL provide commands to exit chroot cleanly
2. WHEN exiting chroot THEN the Wizard SHALL provide commands to unmount virtual filesystems
3. WHEN ready to boot THEN the Wizard SHALL provide reboot instructions with boot menu guidance
4. WHEN LFS boots THEN the Wizard SHALL provide first-boot checklist (login, network, basic commands)
5. WHEN all checks pass THEN the Wizard SHALL display congratulations and next steps (BLFS)

### Requirement 15: Progress Tracking & Persistence

**User Story:** As a user, I want my progress saved automatically, so that I can continue from where I left off.

#### Acceptance Criteria

1. WHEN the wizard loads THEN the Wizard SHALL restore progress from local storage
2. WHEN a stage is completed THEN the Wizard SHALL save progress to local storage immediately
3. WHEN displaying progress THEN the Wizard SHALL show a visual progress bar with percentage
4. WHEN viewing stages THEN the Wizard SHALL indicate completed, current, and locked stages
5. WHEN resetting progress THEN the Wizard SHALL confirm before clearing all saved data

### Requirement 16: Script Generation

**User Story:** As a user, I want to generate downloadable scripts for each stage, so that I can run commands without manual copying.

#### Acceptance Criteria

1. WHEN viewing a stage THEN the Wizard SHALL provide a "Download Script" button
2. WHEN downloading THEN the Wizard SHALL generate a .sh file with all stage commands
3. WHEN generating scripts THEN the Wizard SHALL include error handling and progress output
4. WHEN generating full script THEN the Wizard SHALL combine all stages into one master script
5. WHEN scripts are downloaded THEN the Wizard SHALL provide chmod +x instructions

### Requirement 17: Troubleshooting & Help

**User Story:** As a user encountering errors, I want contextual troubleshooting help, so that I can resolve issues without external research.

#### Acceptance Criteria

1. WHEN a common error occurs THEN the Wizard SHALL display relevant troubleshooting tips
2. WHEN viewing a stage THEN the Wizard SHALL provide a "Common Issues" expandable section
3. WHEN stuck THEN the Wizard SHALL provide links to LFS book chapters and community resources
4. WHEN needing help THEN the Wizard SHALL provide a way to contact support or report issues
5. WHEN troubleshooting THEN the Wizard SHALL suggest diagnostic commands to run

### Requirement 18: Time Estimates & Requirements

**User Story:** As a user, I want to see time estimates and system requirements for each stage, so that I can plan my build session.

#### Acceptance Criteria

1. WHEN viewing a stage THEN the Wizard SHALL display estimated time to complete
2. WHEN viewing requirements THEN the Wizard SHALL show disk space needed for that stage
3. WHEN starting the wizard THEN the Wizard SHALL display total estimated time (4-8 hours)
4. WHEN a stage is CPU-intensive THEN the Wizard SHALL recommend running overnight or in background
5. WHEN displaying estimates THEN the Wizard SHALL adjust based on detected system specs if possible
