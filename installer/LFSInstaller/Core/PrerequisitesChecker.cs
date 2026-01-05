using System;
using System.Collections.Generic;
using System.Management;

namespace LFSInstaller.Core
{
    /// <summary>
    /// Validates system prerequisites before installation
    /// </summary>
    public class PrerequisitesChecker
    {
        private readonly InstallerLogger _logger = InstallerLogger.Instance;

        public class CheckResult
        {
            public string Name { get; set; }
            public bool Passed { get; set; }
            public string Message { get; set; }
            public CheckSeverity Severity { get; set; }
            public string Details { get; set; }
        }

        public enum CheckSeverity
        {
            Critical,    // Must pass to continue
            Warning,     // Can continue with warning
            Info         // Informational only
        }

        /// <summary>
        /// Runs all system prerequisite checks
        /// </summary>
        public List<CheckResult> RunAllChecks()
        {
            _logger.Stage("Running System Prerequisites Checks");

            var results = new List<CheckResult>
            {
                CheckWindowsVersion(),
                CheckRAM(),
                CheckDiskSpace(),
                CheckCPUCores(),
                CheckVirtualization(),
                CheckWSL2Status(),
                CheckAdministratorRights()
            };

            // Log summary
            int passed = 0;
            int warnings = 0;
            int failed = 0;

            foreach (var result in results)
            {
                if (result.Passed)
                    passed++;
                else if (result.Severity == CheckSeverity.Warning)
                    warnings++;
                else
                    failed++;

                string status = result.Passed ? "✓ PASS" : "✗ FAIL";
                _logger.Info($"{status}: {result.Name} - {result.Message}");
            }

            _logger.Info($"Prerequisites Summary: {passed} passed, {warnings} warnings, {failed} failed");

            return results;
        }

        /// <summary>
        /// Checks if Windows version meets minimum requirements (Build 19041+)
        /// </summary>
        private CheckResult CheckWindowsVersion()
        {
            try
            {
                var version = Environment.OSVersion.Version;
                int build = version.Build;

                // WSL2 requires Windows 10 Build 19041 (2004) or later
                const int MinBuild = 19041;

                bool passed = build >= MinBuild;

                return new CheckResult
                {
                    Name = "Windows Version",
                    Passed = passed,
                    Severity = CheckSeverity.Critical,
                    Message = passed
                        ? $"Windows Build {build} (meets requirement)"
                        : $"Windows Build {build} (requires {MinBuild}+)",
                    Details = $"OS: {Environment.OSVersion.VersionString}"
                };
            }
            catch (Exception ex)
            {
                _logger.Error("Failed to check Windows version", ex);
                return new CheckResult
                {
                    Name = "Windows Version",
                    Passed = false,
                    Severity = CheckSeverity.Critical,
                    Message = "Unable to determine Windows version",
                    Details = ex.Message
                };
            }
        }

        /// <summary>
        /// Checks if system has sufficient RAM (minimum 8 GB)
        /// </summary>
        private CheckResult CheckRAM()
        {
            try
            {
                long totalRAM = 0;

                using (var searcher = new ManagementObjectSearcher("SELECT TotalPhysicalMemory FROM Win32_ComputerSystem"))
                {
                    foreach (ManagementObject obj in searcher.Get())
                    {
                        totalRAM = Convert.ToInt64(obj["TotalPhysicalMemory"]);
                        break;
                    }
                }

                long ramGB = totalRAM / (1024 * 1024 * 1024);
                const long MinRAMGB = 8;

                bool passed = ramGB >= MinRAMGB;

                return new CheckResult
                {
                    Name = "RAM",
                    Passed = passed,
                    Severity = CheckSeverity.Critical,
                    Message = passed
                        ? $"{ramGB} GB (meets requirement)"
                        : $"{ramGB} GB (requires {MinRAMGB} GB minimum)",
                    Details = $"Total Physical Memory: {totalRAM:N0} bytes"
                };
            }
            catch (Exception ex)
            {
                _logger.Error("Failed to check RAM", ex);
                return new CheckResult
                {
                    Name = "RAM",
                    Passed = false,
                    Severity = CheckSeverity.Critical,
                    Message = "Unable to determine RAM",
                    Details = ex.Message
                };
            }
        }

        /// <summary>
        /// Checks if system has sufficient disk space (minimum 30 GB)
        /// </summary>
        private CheckResult CheckDiskSpace()
        {
            try
            {
                var drives = System.IO.DriveInfo.GetDrives();
                long maxAvailable = 0;
                string driveName = "";

                foreach (var drive in drives)
                {
                    if (drive.DriveType == System.IO.DriveType.Fixed && drive.IsReady)
                    {
                        if (drive.AvailableFreeSpace > maxAvailable)
                        {
                            maxAvailable = drive.AvailableFreeSpace;
                            driveName = drive.Name;
                        }
                    }
                }

                long availableGB = maxAvailable / (1024 * 1024 * 1024);
                const long MinDiskGB = 30;

                bool passed = availableGB >= MinDiskGB;

                return new CheckResult
                {
                    Name = "Disk Space",
                    Passed = passed,
                    Severity = CheckSeverity.Critical,
                    Message = passed
                        ? $"{availableGB} GB available on {driveName} (meets requirement)"
                        : $"{availableGB} GB available (requires {MinDiskGB} GB minimum)",
                    Details = $"Largest drive: {driveName} with {maxAvailable:N0} bytes free"
                };
            }
            catch (Exception ex)
            {
                _logger.Error("Failed to check disk space", ex);
                return new CheckResult
                {
                    Name = "Disk Space",
                    Passed = false,
                    Severity = CheckSeverity.Critical,
                    Message = "Unable to determine disk space",
                    Details = ex.Message
                };
            }
        }

        /// <summary>
        /// Checks CPU core count (minimum 2 cores recommended)
        /// </summary>
        private CheckResult CheckCPUCores()
        {
            try
            {
                int cores = Environment.ProcessorCount;
                const int MinCores = 2;

                // This is a warning, not critical
                bool passed = cores >= MinCores;

                return new CheckResult
                {
                    Name = "CPU Cores",
                    Passed = passed,
                    Severity = passed ? CheckSeverity.Info : CheckSeverity.Warning,
                    Message = passed
                        ? $"{cores} cores detected"
                        : $"{cores} cores (recommend {MinCores}+ for better performance)",
                    Details = $"Processor Count: {cores}"
                };
            }
            catch (Exception ex)
            {
                _logger.Error("Failed to check CPU cores", ex);
                return new CheckResult
                {
                    Name = "CPU Cores",
                    Passed = true, // Non-critical
                    Severity = CheckSeverity.Info,
                    Message = "Unable to determine CPU cores",
                    Details = ex.Message
                };
            }
        }

        /// <summary>
        /// Checks if hardware virtualization is enabled (required for WSL2)
        /// </summary>
        private CheckResult CheckVirtualization()
        {
            try
            {
                bool virtEnabled = false;
                string virtType = "Unknown";

                using (var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_Processor"))
                {
                    foreach (ManagementObject obj in searcher.Get())
                    {
                        var virtFirmware = obj["VirtualizationFirmwareEnabled"];
                        if (virtFirmware != null && (bool)virtFirmware)
                        {
                            virtEnabled = true;
                            
                            // Try to detect Intel VT-x or AMD-V
                            string name = obj["Name"]?.ToString() ?? "";
                            virtType = name.Contains("Intel") ? "Intel VT-x" : "AMD-V";
                            break;
                        }
                    }
                }

                return new CheckResult
                {
                    Name = "Virtualization",
                    Passed = virtEnabled,
                    Severity = CheckSeverity.Critical,
                    Message = virtEnabled
                        ? $"Enabled ({virtType})"
                        : "Disabled - must be enabled in BIOS/UEFI",
                    Details = virtEnabled
                        ? $"Hardware virtualization ({virtType}) is enabled"
                        : "Please reboot and enable VT-x/AMD-V in BIOS settings"
                };
            }
            catch (Exception ex)
            {
                _logger.Error("Failed to check virtualization", ex);
                return new CheckResult
                {
                    Name = "Virtualization",
                    Passed = false,
                    Severity = CheckSeverity.Critical,
                    Message = "Unable to determine virtualization status",
                    Details = ex.Message
                };
            }
        }

        /// <summary>
        /// Checks if WSL2 is already installed (informational)
        /// </summary>
        private CheckResult CheckWSL2Status()
        {
            try
            {
                var startInfo = new System.Diagnostics.ProcessStartInfo
                {
                    FileName = "wsl",
                    Arguments = "--status",
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                };

                using (var process = System.Diagnostics.Process.Start(startInfo))
                {
                    process.WaitForExit();
                    
                    bool isInstalled = process.ExitCode == 0;

                    return new CheckResult
                    {
                        Name = "WSL2 Status",
                        Passed = true, // Always pass (we'll install if needed)
                        Severity = CheckSeverity.Info,
                        Message = isInstalled
                            ? "Already installed"
                            : "Not installed (will be installed during setup)",
                        Details = isInstalled
                            ? "WSL2 is already configured on this system"
                            : "WSL2 will be installed and configured"
                    };
                }
            }
            catch
            {
                // WSL command not found = not installed
                return new CheckResult
                {
                    Name = "WSL2 Status",
                    Passed = true,
                    Severity = CheckSeverity.Info,
                    Message = "Not installed (will be installed during setup)",
                    Details = "WSL2 components will be installed"
                };
            }
        }

        /// <summary>
        /// Checks if running with administrator privileges
        /// </summary>
        private CheckResult CheckAdministratorRights()
        {
            try
            {
                var identity = System.Security.Principal.WindowsIdentity.GetCurrent();
                var principal = new System.Security.Principal.WindowsPrincipal(identity);
                bool isAdmin = principal.IsInRole(System.Security.Principal.WindowsBuiltInRole.Administrator);

                return new CheckResult
                {
                    Name = "Administrator Rights",
                    Passed = isAdmin,
                    Severity = CheckSeverity.Critical,
                    Message = isAdmin
                        ? "Running with administrator privileges"
                        : "Not running as administrator",
                    Details = isAdmin
                        ? "Installer has sufficient privileges"
                        : "Please restart installer with 'Run as Administrator'"
                };
            }
            catch (Exception ex)
            {
                _logger.Error("Failed to check administrator rights", ex);
                return new CheckResult
                {
                    Name = "Administrator Rights",
                    Passed = false,
                    Severity = CheckSeverity.Critical,
                    Message = "Unable to determine administrator status",
                    Details = ex.Message
                };
            }
        }

        /// <summary>
        /// Determines if installation can proceed based on check results
        /// </summary>
        public bool CanProceed(List<CheckResult> results)
        {
            foreach (var result in results)
            {
                if (!result.Passed && result.Severity == CheckSeverity.Critical)
                {
                    _logger.Warning($"Cannot proceed: {result.Name} check failed");
                    return false;
                }
            }

            _logger.Info("All critical prerequisites met - installation can proceed");
            return true;
        }
    }
}
