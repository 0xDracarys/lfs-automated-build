---
title: Build System Guide
description: Learn how to use the automated LFS build system
---

# Build System Guide

Build your own Linux From Scratch system using our automated cloud-based build pipeline.

## Overview

The **LFS Build System** automates the complex process of building Linux From Scratch. What typically takes days of manual work is streamlined into a monitored, reproducible process.

### Key Features

- ✅ **Automated Building**: Hands-free LFS compilation
- ✅ **Cloud-Powered**: Runs on Google Cloud infrastructure
- ✅ **Real-Time Monitoring**: Watch logs as your system builds
- ✅ **Configurable**: Customize your build parameters
- ✅ **Reproducible**: Same configuration = same result
- ✅ **Downloadable**: Get your completed system image

## Build Process

### Phase 1: Preparation (5-10 minutes)

- Set up build environment
- Download source packages
- Verify checksums
- Prepare toolchain

### Phase 2: Toolchain (30-45 minutes)

- Build cross-compilation toolchain
- Compile binutils
- Build GCC pass 1
- Build glibc
- Build GCC pass 2

### Phase 3: Basic System (1-2 hours)

- Chroot into build environment
- Build essential packages:
  - Kernel headers
  - Glibc
  - GCC
  - Binutils
  - System libraries

### Phase 4: System Configuration (30-45 minutes)

- Configure bootloader
- Set up networking
- Create system users
- Configure services

### Phase 5: Finalization (15-30 minutes)

- Clean temporary files
- Generate system image
- Create checksums
- Package for download

## Using the Build System

### Step 1: Configure Your Build

Navigate to [/build](/build) and configure:

```javascript
{
  version: "12.0",           // LFS version
  architecture: "x86_64",    // CPU architecture
  optimization: "O2",        // Compiler optimization
  parallelJobs: 4,          // Parallel compilation
  includeOptional: true,    // Include optional packages
  customizations: {
    kernel: "6.6.1",        // Kernel version
    bootloader: "GRUB",     // GRUB or systemd-boot
    initSystem: "systemd"   // systemd or SysVinit
  }
}
```

### Step 2: Launch Build

Click **"Start Build"** to begin. Your build will:

1. Queue in the build system
2. Allocate cloud resources
3. Begin execution
4. Stream logs in real-time

### Step 3: Monitor Progress

The build page shows:

- **Current Phase**: What's building now
- **Progress Bar**: Overall completion percentage
- **Live Logs**: Scrolling terminal output
- **Time Elapsed**: How long the build has run
- **Estimated Time**: Remaining build time

### Step 4: Download

When complete, download:

- **System Image**: Bootable .img or .iso file
- **Build Logs**: Complete compilation logs
- **Package List**: All installed packages
- **Configuration**: Build settings for reproduction

## Configuration Options

### LFS Version

Choose your LFS version:

- `12.0` - Latest stable (recommended)
- `11.3` - Previous stable
- `development` - Bleeding edge (experimental)

### Architecture

Target architecture:

- `x86_64` - 64-bit Intel/AMD (most common)
- `i686` - 32-bit Intel/AMD (legacy)
- `aarch64` - 64-bit ARM (Raspberry Pi, etc.)
- `riscv64` - RISC-V (experimental)

### Optimization Levels

Compiler optimization:

- `O0` - No optimization (debugging)
- `O1` - Basic optimization
- `O2` - Recommended (balanced)
- `O3` - Aggressive (may break some packages)
- `Os` - Size optimization (embedded systems)

### Parallel Jobs

Number of simultaneous compilation jobs:

```bash
# Recommended: Number of CPU cores
parallelJobs: 4

# More cores = faster builds (up to diminishing returns)
# Too many can exhaust memory
```

### Optional Packages

Include additional software:

```javascript
optionalPackages: {
  development: true,    // Dev tools (GCC, make, etc.)
  networking: true,     // Network utilities
  xorg: false,         // X Window System
  desktopEnvironment: "none",  // "gnome", "kde", "xfce", "none"
  textEditor: "vim",   // "vim", "emacs", "nano"
  browser: "none"      // "firefox", "chromium", "none"
}
```

## Build Customization

### Custom Kernel Configuration

Provide `.config` file:

```bash
# Use menuconfig to generate
make menuconfig

# Upload resulting .config
# System will use your configuration
```

### Additional Packages

Add packages not in standard LFS:

```javascript
additionalPackages: [
  {
    name: "htop",
    url: "https://github.com/htop-dev/htop/releases/...",
    checksum: "sha256:abc123..."
  }
]
```

### Post-Build Scripts

Run commands after build completes:

```bash
# post-build.sh
#!/bin/bash

# Install additional software
# Configure services
# Add users
# Customize environment
```

## Monitoring and Debugging

### Real-Time Logs

Watch build progress:

```bash
[Phase 2/5] Building Toolchain
[00:15:32] Compiling binutils-2.41...
[00:16:45] ✓ binutils installed
[00:16:46] Compiling gcc-13.2.0 (pass 1)...
[00:18:23] Running: make -j4
[00:25:45] ✓ GCC pass 1 complete
```

### Build Metrics

Track performance:

- **Packages Built**: 85/120
- **Success Rate**: 100%
- **Average Build Time**: 3.2 minutes/package
- **Total Data**: 4.2 GB
- **Estimated Completion**: 45 minutes

### Error Handling

If build fails:

1. **Review Logs**: Check error message
2. **Common Issues**:
   - Missing dependency
   - Checksum mismatch
   - Compilation error
   - Out of disk space
3. **Retry Build**: Fix configuration and retry
4. **Contact Support**: If issue persists

## Advanced Features

### Build Caching

Speed up rebuilds:

```javascript
caching: {
  enabled: true,
  packages: true,     // Cache compiled packages
  toolchain: true,    // Cache toolchain
  sources: true       // Cache source downloads
}
```

### Distributed Builds

Use multiple machines:

```javascript
distributed: {
  enabled: true,
  nodes: ["node1", "node2", "node3"],
  coordinator: "node1"
}
```

### Custom Repositories

Use alternative package sources:

```javascript
repositories: [
  {
    name: "custom",
    url: "https://my-repo.com/packages/",
    priority: 10
  }
]
```

## Best Practices

### 1. Start Simple

Begin with default configuration. Customize after successful build.

### 2. Save Configurations

Export your config for future builds:

```bash
# Download config.json
# Save for reproducible builds
```

### 3. Monitor First Build

Watch the first build carefully. Note any warnings or unusual behavior.

### 4. Test Before Customizing

Ensure default build works before adding customizations.

### 5. Document Changes

Keep notes on configuration changes and reasons.

## Troubleshooting

### Build Won't Start

**Symptoms**: Build button disabled or error on start

**Solutions**:
- Check you're logged in
- Verify configuration is valid
- Ensure no active builds
- Check system status page

### Build Stuck

**Symptoms**: Progress bar not moving, no new logs

**Solutions**:
- Wait 5 minutes (some packages take time)
- Check if logs still updating
- Cancel and restart if truly stuck

### Build Failed

**Symptoms**: Build stops with error

**Solutions**:
- Read error message in logs
- Check package build logs
- Try with default configuration
- Report bug if reproducible

### Download Failed

**Symptoms**: Can't download completed build

**Solutions**:
- Check internet connection
- Try again in a few minutes
- Use alternative download link
- Contact support

## Example Builds

### Minimal Desktop System

```javascript
{
  version: "12.0",
  architecture: "x86_64",
  optimization: "O2",
  optionalPackages: {
    xorg: true,
    desktopEnvironment: "xfce",
    browser: "firefox",
    textEditor: "vim"
  }
}
```

### Development Workstation

```javascript
{
  version: "12.0",
  architecture: "x86_64",
  optimization: "O2",
  optionalPackages: {
    development: true,
    xorg: true,
    desktopEnvironment: "gnome"
  },
  additionalPackages: [
    "git", "docker", "nodejs", "python3"
  ]
}
```

### Server Build

```javascript
{
  version: "12.0",
  architecture: "x86_64",
  optimization: "Os",
  optionalPackages: {
    xorg: false,
    networking: true
  },
  additionalPackages: [
    "nginx", "postgresql", "redis"
  ]
}
```

## API Access

### Programmatic Builds

Trigger builds via API:

```bash
curl -X POST https://api.lfslearning.com/builds \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d @build-config.json
```

### Check Build Status

```bash
curl https://api.lfslearning.com/builds/$BUILD_ID \
  -H "Authorization: Bearer $TOKEN"
```

### Download Results

```bash
curl https://api.lfslearning.com/builds/$BUILD_ID/download \
  -H "Authorization: Bearer $TOKEN" \
  -o lfs-system.img
```

---

**Next Steps**:
- [Start Your First Build →](/build)
- [Build Configuration Reference →](/docs/build-config)
- [Deployment Guide →](/docs/deployment)
