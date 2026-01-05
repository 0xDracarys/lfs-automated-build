using System;
using System.IO;
using System.Text;

namespace LFSInstaller.Core
{
    /// <summary>
    /// Centralized logging system for the installer
    /// Writes to both file and provides events for UI updates
    /// </summary>
    public class InstallerLogger
    {
        private static InstallerLogger _instance;
        private static readonly object _lock = new object();
        private readonly string _logFilePath;
        private readonly StreamWriter _logWriter;

        public event EventHandler<string> LogMessageReceived;

        private InstallerLogger()
        {
            // Create log file in temp directory
            string tempPath = Path.GetTempPath();
            _logFilePath = Path.Combine(tempPath, $"LFSInstaller_{DateTime.Now:yyyyMMdd_HHmmss}.log");

            try
            {
                _logWriter = new StreamWriter(_logFilePath, append: true, Encoding.UTF8)
                {
                    AutoFlush = true
                };

                WriteHeader();
            }
            catch (Exception ex)
            {
                // Fallback: If we can't create log file, continue without file logging
                System.Diagnostics.Debug.WriteLine($"Failed to create log file: {ex.Message}");
            }
        }

        /// <summary>
        /// Gets the singleton instance of the logger
        /// </summary>
        public static InstallerLogger Instance
        {
            get
            {
                if (_instance == null)
                {
                    lock (_lock)
                    {
                        if (_instance == null)
                        {
                            _instance = new InstallerLogger();
                        }
                    }
                }
                return _instance;
            }
        }

        /// <summary>
        /// Gets the path to the log file
        /// </summary>
        public string LogFilePath => _logFilePath;

        /// <summary>
        /// Writes log file header with system information
        /// </summary>
        private void WriteHeader()
        {
            var header = new StringBuilder();
            header.AppendLine("========================================");
            header.AppendLine($"LFS Builder Installer Log");
            header.AppendLine($"Version: 1.0.0");
            header.AppendLine($"Date: {DateTime.Now:yyyy-MM-dd HH:mm:ss}");
            header.AppendLine($"OS: {Environment.OSVersion}");
            header.AppendLine($"Machine: {Environment.MachineName}");
            header.AppendLine($"User: {Environment.UserName}");
            header.AppendLine($"64-bit OS: {Environment.Is64BitOperatingSystem}");
            header.AppendLine($"CPU Cores: {Environment.ProcessorCount}");
            header.AppendLine("========================================");

            _logWriter?.WriteLine(header.ToString());
        }

        /// <summary>
        /// Logs an information message
        /// </summary>
        public void Info(string message)
        {
            Log("INFO", message);
        }

        /// <summary>
        /// Logs a warning message
        /// </summary>
        public void Warning(string message)
        {
            Log("WARN", message);
        }

        /// <summary>
        /// Logs an error message
        /// </summary>
        public void Error(string message)
        {
            Log("ERROR", message);
        }

        /// <summary>
        /// Logs an exception with stack trace
        /// </summary>
        public void Error(string message, Exception ex)
        {
            var errorMessage = new StringBuilder();
            errorMessage.AppendLine(message);
            errorMessage.AppendLine($"Exception: {ex.GetType().Name}");
            errorMessage.AppendLine($"Message: {ex.Message}");
            errorMessage.AppendLine($"Stack Trace: {ex.StackTrace}");

            if (ex.InnerException != null)
            {
                errorMessage.AppendLine($"Inner Exception: {ex.InnerException.Message}");
            }

            Log("ERROR", errorMessage.ToString());
        }

        /// <summary>
        /// Logs a debug message (only in debug builds)
        /// </summary>
        public void Debug(string message)
        {
#if DEBUG
            Log("DEBUG", message);
#endif
        }

        /// <summary>
        /// Logs a stage transition (e.g., "Starting Stage 3: Configuration")
        /// </summary>
        public void Stage(string stageName)
        {
            var separator = new string('-', 50);
            Log("STAGE", $"{separator}\n{stageName}\n{separator}");
        }

        /// <summary>
        /// Core logging method
        /// </summary>
        private void Log(string level, string message)
        {
            string timestamp = DateTime.Now.ToString("HH:mm:ss.fff");
            string logEntry = $"[{timestamp}] [{level}] {message}";

            // Write to file
            _logWriter?.WriteLine(logEntry);

            // Raise event for UI updates
            LogMessageReceived?.Invoke(this, logEntry);

            // Also write to debug output
            System.Diagnostics.Debug.WriteLine(logEntry);
        }

        /// <summary>
        /// Closes the log file and cleans up resources
        /// </summary>
        public void Close()
        {
            _logWriter?.WriteLine("\n========================================");
            _logWriter?.WriteLine($"Log closed at {DateTime.Now:yyyy-MM-dd HH:mm:ss}");
            _logWriter?.WriteLine("========================================");
            _logWriter?.Flush();
            _logWriter?.Close();
        }

        /// <summary>
        /// Opens the log file in the default text editor
        /// </summary>
        public void OpenLogFile()
        {
            try
            {
                if (File.Exists(_logFilePath))
                {
                    System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo
                    {
                        FileName = _logFilePath,
                        UseShellExecute = true
                    });
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to open log file: {ex.Message}");
            }
        }
    }
}
