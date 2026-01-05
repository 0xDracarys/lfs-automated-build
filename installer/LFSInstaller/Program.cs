using System;
using System.IO;
using System.Windows.Forms;

namespace LFSInstaller
{
    /// <summary>
    /// Main entry point for the LFS Builder Installer
    /// </summary>
    static class Program
    {
        private static string logPath = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "LFSInstaller",
            "startup.log"
        );

        /// <summary>
        /// The main entry point for the application.
        /// </summary>
        [STAThread]
        static void Main()
        {
            try
            {
                // Create log directory
                Directory.CreateDirectory(Path.GetDirectoryName(logPath));
                File.WriteAllText(logPath, $"[{DateTime.Now}] Installer starting...\n");

                // Enable visual styles for modern Windows look
                Application.EnableVisualStyles();
                Application.SetCompatibleTextRenderingDefault(false);
                Application.SetHighDpiMode(HighDpiMode.SystemAware);

                Log("Visual styles enabled");

                // Check if running as administrator
                if (!IsRunningAsAdministrator())
                {
                    Log("Not running as administrator - showing warning");
                    MessageBox.Show(
                        "This installer requires administrator privileges to install WSL2 and configure the system.\n\n" +
                        "Please right-click the installer and select 'Run as Administrator'.",
                        "Administrator Rights Required",
                        MessageBoxButtons.OK,
                        MessageBoxIcon.Warning
                    );
                    Log("Exiting due to insufficient privileges");
                    return;
                }

                Log("Running as administrator - starting wizard");

                // Set up global exception handler
                Application.ThreadException += Application_ThreadException;
                AppDomain.CurrentDomain.UnhandledException += CurrentDomain_UnhandledException;

                // Start the installation wizard
                Log("Creating WelcomeForm...");
                var welcomeForm = new Forms.WelcomeForm();
                Log("Showing WelcomeForm...");
                Application.Run(welcomeForm);
                Log("Application exited normally");
            }
            catch (Exception ex)
            {
                Log($"FATAL ERROR: {ex.Message}\nStack: {ex.StackTrace}");
                MessageBox.Show(
                    $"A fatal error occurred:\n\n{ex.Message}\n\nLog file: {logPath}",
                    "Installer Error",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error
                );
            }
        }

        private static void Application_ThreadException(object sender, System.Threading.ThreadExceptionEventArgs e)
        {
            Log($"Thread Exception: {e.Exception.Message}\n{e.Exception.StackTrace}");
            MessageBox.Show(
                $"An error occurred:\n\n{e.Exception.Message}\n\nLog: {logPath}",
                "Error",
                MessageBoxButtons.OK,
                MessageBoxIcon.Error
            );
        }

        private static void CurrentDomain_UnhandledException(object sender, UnhandledExceptionEventArgs e)
        {
            var ex = e.ExceptionObject as Exception;
            Log($"Unhandled Exception: {ex?.Message}\n{ex?.StackTrace}");
            MessageBox.Show(
                $"A critical error occurred:\n\n{ex?.Message}\n\nLog: {logPath}",
                "Critical Error",
                MessageBoxButtons.OK,
                MessageBoxIcon.Error
            );
        }

        private static void Log(string message)
        {
            try
            {
                File.AppendAllText(logPath, $"[{DateTime.Now:HH:mm:ss}] {message}\n");
            }
            catch
            {
                // Silently fail if logging fails
            }
        }

        /// <summary>
        /// Checks if the application is running with administrator privileges
        /// </summary>
        private static bool IsRunningAsAdministrator()
        {
            var identity = System.Security.Principal.WindowsIdentity.GetCurrent();
            var principal = new System.Security.Principal.WindowsPrincipal(identity);
            return principal.IsInRole(System.Security.Principal.WindowsBuiltInRole.Administrator);
        }
    }
}
