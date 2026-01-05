using System;
using System.Diagnostics;
using System.IO;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace LFSInstaller.Core
{
    /// <summary>
    /// Manages the installation process including WSL2 setup and LFS configuration
    /// </summary>
    public class InstallationManager
    {
        public event EventHandler<ProgressEventArgs>? ProgressChanged;
        public event EventHandler<string>? StatusChanged;
        public event EventHandler<string>? LogMessage;

        private readonly InstallationConfig _config;
        private readonly StructuredLogger _logger;

        public InstallationManager(InstallationConfig config)
        {
            _config = config;
            _logger = new StructuredLogger();
        }

        /// <summary>
        /// Executes the complete installation process
        /// </summary>
        public async Task<bool> InstallAsync()
        {
            _logger.Log(LogLevel.Info, "Starting LFS Builder installation", "Installation");
            
            try
            {
                OnStatusChanged("Starting installation...");
                OnProgressChanged(0, "Initializing");

                // Step 1: Check prerequisites (10%)
                _logger.Log(LogLevel.Info, "Checking system prerequisites", "Prerequisites");
                if (!await CheckPrerequisitesAsync())
                {
                    _logger.Log(LogLevel.Critical, "Prerequisites check FAILED", "Prerequisites");
                    return false;
                }

                // Step 2: Enable WSL2 feature (25%)
                _logger.Log(LogLevel.Info, "Enabling WSL2 features", "WSL2");
                if (!await EnableWSL2Async())
                {
                    _logger.Log(LogLevel.Critical, "WSL2 enablement FAILED", "WSL2");
                    return false;
                }

                // Step 3: Install Linux distribution (50%)
                _logger.Log(LogLevel.Info, "Installing Linux distribution", "Linux");
                if (!await InstallLinuxDistributionAsync())
                {
                    _logger.Log(LogLevel.Critical, "Linux distribution installation FAILED", "Linux");
                    return false;
                }

                // Step 4: Configure LFS environment (70%)
                _logger.Log(LogLevel.Info, "Configuring LFS environment", "LFS");
                if (!await ConfigureLFSEnvironmentAsync())
                {
                    _logger.Log(LogLevel.Critical, "LFS configuration FAILED", "LFS");
                    return false;
                }

                // Step 5: Create shortcuts (90%)
                _logger.Log(LogLevel.Info, "Creating shortcuts", "Shortcuts");
                if (!await CreateShortcutsAsync())
                {
                    _logger.Log(LogLevel.Critical, "Shortcut creation FAILED", "Shortcuts");
                    return false;
                }

                // Step 6: Finalize (100%)
                OnProgressChanged(100, "Installation complete!");
                OnStatusChanged("LFS Builder installed successfully");
                _logger.Log(LogLevel.Info, "Installation completed successfully", "Installation");

                _logger.SaveToFile();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError("Installation failed with unexpected error", ex, "Installation");
                OnLogMessage($"Installation failed: {ex.Message}");
                _logger.SaveToFile();
                return false;
            }
        }

        private async Task<bool> CheckPrerequisitesAsync()
        {
            OnStatusChanged("Checking system requirements...");
            OnProgressChanged(5, "Checking Windows version");

            // Check Windows version (Windows 10 2004+ or Windows 11)
            var osVersion = Environment.OSVersion.Version;
            if (osVersion.Major < 10 || (osVersion.Major == 10 && osVersion.Build < 19041))
            {
                OnLogMessage("Error: Windows 10 version 2004 (Build 19041) or higher is required");
                return false;
            }

            OnProgressChanged(10, "Prerequisites check complete");
            return true;
        }

        private async Task<bool> EnableWSL2Async()
        {
            OnStatusChanged("Enabling WSL2 feature...");
            OnProgressChanged(15, "Enabling Virtual Machine Platform");

            try
            {
                // Enable Virtual Machine Platform
                await ExecutePowerShellAsync(
                    "dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart"
                );

                OnProgressChanged(20, "Enabling Windows Subsystem for Linux");

                // Enable WSL
                await ExecutePowerShellAsync(
                    "dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart"
                );

                OnProgressChanged(25, "WSL2 features enabled");
                return true;
            }
            catch (Exception ex)
            {
                OnLogMessage($"Failed to enable WSL2: {ex.Message}");
                return false;
            }
        }

        private async Task<bool> InstallLinuxDistributionAsync()
        {
            OnStatusChanged("Installing Linux distribution...");
            OnProgressChanged(30, "Downloading Ubuntu");

            try
            {
                // Set WSL2 as default
                await ExecutePowerShellAsync("wsl --set-default-version 2");

                OnProgressChanged(35, "Installing Ubuntu distribution");

                // Install Ubuntu (or specified distribution)
                var distro = _config.LinuxDistribution ?? "Ubuntu";
                await ExecutePowerShellAsync($"wsl --install -d {distro}");

                OnProgressChanged(50, "Linux distribution installed");
                return true;
            }
            catch (Exception ex)
            {
                OnLogMessage($"Failed to install Linux distribution: {ex.Message}");
                return false;
            }
        }

        private async Task<bool> ConfigureLFSEnvironmentAsync()
        {
            OnStatusChanged("Configuring LFS environment...");
            OnProgressChanged(55, "Creating LFS directory structure");

            try
            {
                // Copy build scripts to WSL
                var scriptsPath = Path.Combine(_config.InstallationPath, "scripts");
                OnProgressChanged(60, "Copying build scripts");

                // Set up LFS environment variables
                var setupScript = @"
export LFS=/mnt/lfs
export LFS_TGT=x86_64-lfs-linux-gnu
export PATH=/tools/bin:/usr/bin:/bin
export MAKEFLAGS=""-j$(nproc)""
sudo mkdir -pv $LFS
sudo chown -v $USER $LFS
";

                var scriptFile = Path.Combine(Path.GetTempPath(), "setup-lfs.sh");
                await File.WriteAllTextAsync(scriptFile, setupScript);

                OnProgressChanged(65, "Configuring environment variables");

                // Execute setup script in WSL
                await ExecuteWSLCommandAsync("bash " + ConvertToWSLPath(scriptFile));

                OnProgressChanged(70, "LFS environment configured");
                return true;
            }
            catch (Exception ex)
            {
                OnLogMessage($"Failed to configure LFS environment: {ex.Message}");
                return false;
            }
        }

        private async Task<bool> CreateShortcutsAsync()
        {
            OnStatusChanged("Creating shortcuts...");
            OnProgressChanged(90, "Creating desktop shortcuts");

            try
            {
                // Create desktop shortcut
                var desktopPath = Environment.GetFolderPath(Environment.SpecialFolder.Desktop);
                CreateShortcut(
                    Path.Combine(desktopPath, "LFS Builder.lnk"),
                    "wsl.exe",
                    "bash -c 'cd ~/lfs-automated && bash lfs-build.sh'",
                    "Launch LFS Builder"
                );

                // Create Start Menu shortcut
                var startMenuPath = Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.StartMenu),
                    "Programs",
                    "LFS Builder"
                );
                Directory.CreateDirectory(startMenuPath);

                CreateShortcut(
                    Path.Combine(startMenuPath, "LFS Builder.lnk"),
                    "wsl.exe",
                    "bash -c 'cd ~/lfs-automated && bash lfs-build.sh'",
                    "Launch LFS Builder"
                );

                OnProgressChanged(95, "Shortcuts created");
                return true;
            }
            catch (Exception ex)
            {
                OnLogMessage($"Failed to create shortcuts: {ex.Message}");
                return false;
            }
        }

        private async Task ExecutePowerShellAsync(string command)
        {
            OnLogMessage($"Executing: {command}");
            
            var startInfo = new ProcessStartInfo
            {
                FileName = "powershell.exe",
                Arguments = $"-NoProfile -ExecutionPolicy Bypass -Command \"{command}\"",
                UseShellExecute = false,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                CreateNoWindow = true,
                Verb = "runas" // Request elevation if needed
            };

            using var process = Process.Start(startInfo);
            if (process == null)
                throw new Exception("Failed to start PowerShell process");

            var output = await process.StandardOutput.ReadToEndAsync();
            var error = await process.StandardError.ReadToEndAsync();

            await process.WaitForExitAsync();

            if (!string.IsNullOrWhiteSpace(output))
                OnLogMessage($"Output: {output.Trim()}");

            if (!string.IsNullOrWhiteSpace(error))
                OnLogMessage($"Error: {error.Trim()}");

            if (process.ExitCode != 0)
                throw new Exception($"Command failed with exit code {process.ExitCode}. Error: {error}");
        }

        private async Task ExecuteWSLCommandAsync(string command)
        {
            var startInfo = new ProcessStartInfo
            {
                FileName = "wsl.exe",
                Arguments = $"-e bash -c \"{command.Replace("\"", "\\\"")}\"",
                UseShellExecute = false,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                CreateNoWindow = true
            };

            using var process = Process.Start(startInfo);
            if (process == null)
                throw new Exception("Failed to start WSL process");

            var output = await process.StandardOutput.ReadToEndAsync();
            var error = await process.StandardError.ReadToEndAsync();

            await process.WaitForExitAsync();

            if (!string.IsNullOrWhiteSpace(output))
                OnLogMessage(output);

            if (!string.IsNullOrWhiteSpace(error))
                OnLogMessage($"Error: {error}");
        }

        private string ConvertToWSLPath(string windowsPath)
        {
            // Convert C:\path\to\file to /mnt/c/path/to/file
            var path = windowsPath.Replace("\\", "/");
            if (path.Length >= 2 && path[1] == ':')
            {
                var drive = char.ToLower(path[0]);
                path = $"/mnt/{drive}{path.Substring(2)}";
            }
            return path;
        }

        private void CreateShortcut(string shortcutPath, string targetPath, string arguments, string description)
        {
            // Using IWshRuntimeLibrary would require COM references
            // For simplicity, we'll use PowerShell to create shortcuts
            var script = $@"
$WScriptShell = New-Object -ComObject WScript.Shell
$Shortcut = $WScriptShell.CreateShortcut('{shortcutPath}')
$Shortcut.TargetPath = '{targetPath}'
$Shortcut.Arguments = '{arguments}'
$Shortcut.Description = '{description}'
$Shortcut.Save()
";
            ExecutePowerShellAsync(script).Wait();
        }

        protected virtual void OnProgressChanged(int percentage, string message)
        {
            ProgressChanged?.Invoke(this, new ProgressEventArgs(percentage, message));
        }

        protected virtual void OnStatusChanged(string status)
        {
            StatusChanged?.Invoke(this, status);
        }

        protected virtual void OnLogMessage(string message)
        {
            LogMessage?.Invoke(this, message);
        }
    }

    public class ProgressEventArgs : EventArgs
    {
        public int Percentage { get; }
        public string Message { get; }

        public ProgressEventArgs(int percentage, string message)
        {
            Percentage = percentage;
            Message = message;
        }
    }
}
