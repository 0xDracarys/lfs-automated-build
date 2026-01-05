using System;
using System.IO;
using System.Text.Json;
using System.Collections.Generic;

namespace LFSInstaller.Core
{
    /// <summary>
    /// Structured JSON logger for better parsing and automated error detection
    /// </summary>
    public class StructuredLogger
    {
        private readonly string _logFilePath;
        private readonly List<LogEntry> _entries;
        private readonly string _sessionId;

        public StructuredLogger(string logDirectory = null)
        {
            _sessionId = Guid.NewGuid().ToString("N").Substring(0, 8);
            _entries = new List<LogEntry>();
            
            if (string.IsNullOrEmpty(logDirectory))
            {
                logDirectory = Path.Combine(Path.GetTempPath(), "LFSInstaller", "Logs");
            }
            
            Directory.CreateDirectory(logDirectory);
            _logFilePath = Path.Combine(logDirectory, $"install-{DateTime.Now:yyyyMMdd-HHmmss}-{_sessionId}.json");
        }

        public void Log(LogLevel level, string message, string step = null, Dictionary<string, object> metadata = null)
        {
            var entry = new LogEntry
            {
                Timestamp = DateTime.UtcNow,
                SessionId = _sessionId,
                Level = level,
                Step = step ?? "General",
                Message = message,
                Metadata = metadata ?? new Dictionary<string, object>()
            };

            _entries.Add(entry);

            // Also write to console for real-time feedback
            var color = level switch
            {
                LogLevel.Debug => ConsoleColor.Gray,
                LogLevel.Info => ConsoleColor.Cyan,
                LogLevel.Warning => ConsoleColor.Yellow,
                LogLevel.Error => ConsoleColor.Red,
                LogLevel.Critical => ConsoleColor.Magenta,
                _ => ConsoleColor.White
            };

            var originalColor = Console.ForegroundColor;
            Console.ForegroundColor = color;
            Console.WriteLine($"[{level}] {step}: {message}");
            Console.ForegroundColor = originalColor;
        }

        public void LogError(string message, Exception ex, string step = null)
        {
            var metadata = new Dictionary<string, object>
            {
                ["ExceptionType"] = ex.GetType().Name,
                ["StackTrace"] = ex.StackTrace ?? "No stack trace available",
                ["Source"] = ex.Source ?? "Unknown"
            };

            if (ex.InnerException != null)
            {
                metadata["InnerException"] = ex.InnerException.Message;
            }

            Log(LogLevel.Error, $"{message}: {ex.Message}", step, metadata);
        }

        public void SaveToFile()
        {
            try
            {
                var logData = new
                {
                    SessionId = _sessionId,
                    StartTime = _entries.Count > 0 ? _entries[0].Timestamp : DateTime.UtcNow,
                    EndTime = DateTime.UtcNow,
                    TotalEntries = _entries.Count,
                    ErrorCount = _entries.FindAll(e => e.Level == LogLevel.Error || e.Level == LogLevel.Critical).Count,
                    WarningCount = _entries.FindAll(e => e.Level == LogLevel.Warning).Count,
                    Entries = _entries
                };

                var options = new JsonSerializerOptions
                {
                    WriteIndented = true,
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                };

                var json = JsonSerializer.Serialize(logData, options);
                File.WriteAllText(_logFilePath, json);

                Console.WriteLine($"\nLog saved to: {_logFilePath}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to save log file: {ex.Message}");
            }
        }

        public string GetLogFilePath() => _logFilePath;

        public IReadOnlyList<LogEntry> GetCriticalErrors()
        {
            return _entries.FindAll(e => e.Level == LogLevel.Critical || e.Level == LogLevel.Error).AsReadOnly();
        }

        public IReadOnlyList<LogEntry> GetWarnings()
        {
            return _entries.FindAll(e => e.Level == LogLevel.Warning).AsReadOnly();
        }
    }

    public class LogEntry
    {
        public DateTime Timestamp { get; set; }
        public string SessionId { get; set; } = string.Empty;
        public LogLevel Level { get; set; }
        public string Step { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public Dictionary<string, object> Metadata { get; set; } = new();
    }

    public enum LogLevel
    {
        Debug = 0,
        Info = 1,
        Warning = 2,
        Error = 3,
        Critical = 4
    }
}
