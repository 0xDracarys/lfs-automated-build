using System;
using System.Windows.Forms;

namespace LFSInstaller
{
    /// <summary>
    /// Main entry point for the LFS Builder Installer
    /// </summary>
    static class Program
    {
        /// <summary>
        /// The main entry point for the application.
        /// </summary>
        [STAThread]
        static void Main()
        {
            // Enable visual styles for modern Windows look
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.SetHighDpiMode(HighDpiMode.SystemAware);

            // Check if running as administrator
            if (!IsRunningAsAdministrator())
            {
                MessageBox.Show(
                    "This installer requires administrator privileges to install WSL2 and configure the system.\n\n" +
                    "Please right-click the installer and select 'Run as Administrator'.",
                    "Administrator Rights Required",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Warning
                );
                return;
            }

            // Start the installation wizard
            Application.Run(new Forms.WelcomeForm());
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
