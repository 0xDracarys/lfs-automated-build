using System;

namespace LFSInstaller.Core
{
    /// <summary>
    /// Configuration settings for the LFS Builder installation
    /// </summary>
    public class InstallationConfig
    {
        /// <summary>
        /// Installation directory path (default: C:\LFSBuilder)
        /// </summary>
        public string InstallationPath { get; set; } = @"C:\LFSBuilder";

        /// <summary>
        /// Linux distribution to install (default: Ubuntu)
        /// </summary>
        public string LinuxDistribution { get; set; } = "Ubuntu";

        /// <summary>
        /// LFS version to use (default: 12.0)
        /// </summary>
        public string LFSVersion { get; set; } = "12.0";

        /// <summary>
        /// Create desktop shortcut
        /// </summary>
        public bool CreateDesktopShortcut { get; set; } = true;

        /// <summary>
        /// Create Start Menu shortcuts
        /// </summary>
        public bool CreateStartMenuShortcut { get; set; } = true;

        /// <summary>
        /// Automatically start LFS Builder after installation
        /// </summary>
        public bool LaunchAfterInstall { get; set; } = true;

        /// <summary>
        /// Number of CPU cores to use for parallel builds
        /// </summary>
        public int BuildCores { get; set; } = Environment.ProcessorCount;

        /// <summary>
        /// Enable automatic updates
        /// </summary>
        public bool EnableAutoUpdates { get; set; } = true;

        /// <summary>
        /// Send anonymous usage statistics
        /// </summary>
        public bool SendUsageStatistics { get; set; } = false;
    }
}
