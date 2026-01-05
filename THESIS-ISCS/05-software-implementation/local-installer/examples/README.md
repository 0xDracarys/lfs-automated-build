# Installation Examples and Test Outputs

## Overview

This folder contains real examples from LFS Builder installer testing, demonstrating the installer's operation on various Windows configurations.

## Contents

### 1. Installation Logs

Example log files from successful and failed installations:

- `install-success-win11.log` - Successful installation on Windows 11 Pro
- `install-success-win10.log` - Successful installation on Windows 10 Build 19045
- `install-fail-no-virt.log` - Failed installation due to disabled virtualization
- `install-warn-low-ram.log` - Warning scenario with 8GB RAM (minimum)

### 2. System Check Outputs

WMI query results and system validation checks:

- `prereq-check-pass.txt` - All requirements met
- `prereq-check-fail-windows-version.txt` - Windows version too old
- `wmi-query-results.txt` - Sample WMI queries for RAM, CPU, virtualization

### 3. WSL Installation Output

Command outputs from WSL2 installation stages:

- `dism-enable-wsl.txt` - DISM feature enablement output
- `wsl-install-ubuntu.txt` - Ubuntu installation via `wsl --install`
- `wsl-status.txt` - Output of `wsl --status` after installation

### 4. Configuration Files

Generated configuration files during installation:

- `installation-config.json` - InstallationConfig serialized
- `lfs-env-vars.ps1` - PowerShell profile additions
- `shortcut-targets.txt` - Desktop and Start Menu shortcut paths

### 5. Screenshots

UI screenshots for thesis documentation (linked to diagrams/screenshots/ parent folder):

- Step 1: Welcome screen
- Step 2: Prerequisites check (pass/fail scenarios)
- Step 3: Configuration form
- Step 4: Progress bar during installation
- Step 5: Completion screen

## Test Environments

**Table E.1** - Test Environment Matrix

| Environment | OS Version | RAM | Result | Log File |
|-------------|-----------|-----|--------|----------|
| Test VM 1 | Windows 11 Pro 22H2 | 16 GB | ✅ Success | install-success-win11.log |
| Test VM 2 | Windows 10 Pro 19045 | 8 GB | ✅ Success | install-success-win10.log |
| Test VM 3 | Windows 10 Home 19041 | 16 GB | ✅ Success | install-success-win10-home.log |
| Test VM 4 | Windows 10 Pro 18363 | 12 GB | ❌ Fail (OS) | prereq-check-fail-windows-version.txt |
| Physical PC | Windows 11 Home | 32 GB | ✅ Success | install-success-physical.log |

Source: compiled by author based on testing.

## Adding New Examples

When adding new test outputs:

1. **File naming**: Use pattern `{type}-{scenario}-{os}.{ext}`
2. **Include metadata**: Add comment header with date, tester, system specs
3. **Redact sensitive data**: Remove usernames, paths with personal info
4. **Update this README**: Add entry to appropriate section above

## Usage in Thesis

These examples support:

- **Section 5.3.5**: Testing and Validation - real test results
- **Section 6**: Conclusions - success rate statistics
- **Annexes**: Full log outputs as supporting documentation

## Example Log Format

```
[2024-12-21 10:15:32] Installer started (version 1.0.0)
[2024-12-21 10:15:33] Detected Windows 11 Pro Build 22621
[2024-12-21 10:15:34] RAM: 16384 MB (requirement: 8192 MB) - PASS
[2024-12-21 10:15:35] Disk space: 250 GB (requirement: 30 GB) - PASS
[2024-12-21 10:15:36] CPU cores: 8 (requirement: 2) - PASS
[2024-12-21 10:15:37] Virtualization: Enabled (Intel VT-x) - PASS
[2024-12-21 10:15:38] WSL2: Not installed - INFO
[2024-12-21 10:15:39] All prerequisites met. Proceeding to configuration.
```

## Navigation

- 🏠 [Back to Local Installer Documentation](../README.md)
- 📊 [Testing and Validation Details](../05-testing-validation.md)
