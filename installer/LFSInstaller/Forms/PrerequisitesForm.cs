using System;
using System.Diagnostics;
using System.Management;
using System.Windows.Forms;

namespace LFSInstaller.Forms
{
    /// <summary>
    /// Prerequisites check form - validates system requirements
    /// </summary>
    public partial class PrerequisitesForm : Form
    {
        private Label lblTitle;
        private Label lblChecking;
        private ListView listViewChecks;
        private Button btnNext;
        private Button btnBack;
        private Button btnCancel;
        private bool _allChecksPassed = false;

        public PrerequisitesForm()
        {
            InitializeComponent();
            PerformSystemChecks();
        }

        private void InitializeComponent()
        {
            this.lblTitle = new Label();
            this.lblChecking = new Label();
            this.listViewChecks = new ListView();
            this.btnNext = new Button();
            this.btnBack = new Button();
            this.btnCancel = new Button();
            this.SuspendLayout();

            // lblTitle
            this.lblTitle.AutoSize = true;
            this.lblTitle.Font = new System.Drawing.Font("Segoe UI", 14F, System.Drawing.FontStyle.Bold);
            this.lblTitle.Location = new System.Drawing.Point(30, 30);
            this.lblTitle.Name = "lblTitle";
            this.lblTitle.Size = new System.Drawing.Size(250, 25);
            this.lblTitle.Text = "System Requirements Check";

            // lblChecking
            this.lblChecking.Font = new System.Drawing.Font("Segoe UI", 9.75F);
            this.lblChecking.Location = new System.Drawing.Point(30, 70);
            this.lblChecking.Name = "lblChecking";
            this.lblChecking.Size = new System.Drawing.Size(560, 30);
            this.lblChecking.Text = "Verifying that your system meets the minimum requirements...";

            // listViewChecks
            this.listViewChecks.Location = new System.Drawing.Point(30, 110);
            this.listViewChecks.Name = "listViewChecks";
            this.listViewChecks.Size = new System.Drawing.Size(560, 180);
            this.listViewChecks.View = View.Details;
            this.listViewChecks.FullRowSelect = true;
            this.listViewChecks.GridLines = true;
            this.listViewChecks.Columns.Add("Requirement", 350);
            this.listViewChecks.Columns.Add("Status", 100);
            this.listViewChecks.Columns.Add("Details", 100);

            // btnNext
            this.btnNext.Font = new System.Drawing.Font("Segoe UI", 9F);
            this.btnNext.Location = new System.Drawing.Point(490, 320);
            this.btnNext.Name = "btnNext";
            this.btnNext.Size = new System.Drawing.Size(100, 30);
            this.btnNext.Text = "Next >";
            this.btnNext.Enabled = false;
            this.btnNext.Click += new EventHandler(this.btnNext_Click);

            // btnBack
            this.btnBack.Font = new System.Drawing.Font("Segoe UI", 9F);
            this.btnBack.Location = new System.Drawing.Point(380, 320);
            this.btnBack.Name = "btnBack";
            this.btnBack.Size = new System.Drawing.Size(100, 30);
            this.btnBack.Text = "< Back";
            this.btnBack.Click += new EventHandler(this.btnBack_Click);

            // btnCancel
            this.btnCancel.Font = new System.Drawing.Font("Segoe UI", 9F);
            this.btnCancel.Location = new System.Drawing.Point(270, 320);
            this.btnCancel.Name = "btnCancel";
            this.btnCancel.Size = new System.Drawing.Size(100, 30);
            this.btnCancel.Text = "Cancel";
            this.btnCancel.Click += new EventHandler(this.btnCancel_Click);

            // PrerequisitesForm
            this.ClientSize = new System.Drawing.Size(624, 370);
            this.Controls.Add(this.lblTitle);
            this.Controls.Add(this.lblChecking);
            this.Controls.Add(this.listViewChecks);
            this.Controls.Add(this.btnNext);
            this.Controls.Add(this.btnBack);
            this.Controls.Add(this.btnCancel);
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.MinimizeBox = false;
            this.Name = "PrerequisitesForm";
            this.StartPosition = FormStartPosition.CenterScreen;
            this.Text = "LFS Builder Setup - Prerequisites";
            this.ResumeLayout(false);
        }

        private void PerformSystemChecks()
        {
            _allChecksPassed = true;

            // Check 1: Windows Version
            CheckWindowsVersion();

            // Check 2: RAM
            CheckRAM();

            // Check 3: Disk Space
            CheckDiskSpace();

            // Check 4: CPU Cores
            CheckCPUCores();

            // Check 5: Virtualization
            CheckVirtualization();

            btnNext.Enabled = _allChecksPassed;
            if (_allChecksPassed)
            {
                lblChecking.Text = "✓ All system requirements met. Click Next to continue.";
                lblChecking.ForeColor = System.Drawing.Color.Green;
            }
            else
            {
                lblChecking.Text = "✗ Some requirements not met. Please resolve issues before continuing.";
                lblChecking.ForeColor = System.Drawing.Color.Red;
            }
        }

        private void CheckWindowsVersion()
        {
            var osVersion = Environment.OSVersion.Version;
            bool passed = osVersion.Major >= 10 && osVersion.Build >= 19041;

            var item = new ListViewItem("Windows 10 version 2004+ or Windows 11");
            item.SubItems.Add(passed ? "✓ Pass" : "✗ Fail");
            item.SubItems.Add($"Build {osVersion.Build}");
            item.ForeColor = passed ? System.Drawing.Color.Green : System.Drawing.Color.Red;
            listViewChecks.Items.Add(item);

            if (!passed) _allChecksPassed = false;
        }

        private void CheckRAM()
        {
            ulong totalRAM = 0;
            try
            {
                using var searcher = new ManagementObjectSearcher("SELECT TotalPhysicalMemory FROM Win32_ComputerSystem");
                foreach (ManagementObject obj in searcher.Get())
                {
                    totalRAM = (ulong)obj["TotalPhysicalMemory"];
                }
            }
            catch { }

            double ramGB = totalRAM / (1024.0 * 1024.0 * 1024.0);
            bool passed = ramGB >= 8;

            var item = new ListViewItem("Minimum 8 GB RAM");
            item.SubItems.Add(passed ? "✓ Pass" : "✗ Fail");
            item.SubItems.Add($"{ramGB:F1} GB");
            item.ForeColor = passed ? System.Drawing.Color.Green : System.Drawing.Color.Red;
            listViewChecks.Items.Add(item);

            if (!passed) _allChecksPassed = false;
        }

        private void CheckDiskSpace()
        {
            var drive = new System.IO.DriveInfo("C");
            double freeSpaceGB = drive.AvailableFreeSpace / (1024.0 * 1024.0 * 1024.0);
            bool passed = freeSpaceGB >= 30;

            var item = new ListViewItem("Minimum 30 GB free disk space");
            item.SubItems.Add(passed ? "✓ Pass" : "✗ Fail");
            item.SubItems.Add($"{freeSpaceGB:F1} GB");
            item.ForeColor = passed ? System.Drawing.Color.Green : System.Drawing.Color.Red;
            listViewChecks.Items.Add(item);

            if (!passed) _allChecksPassed = false;
        }

        private void CheckCPUCores()
        {
            int cores = Environment.ProcessorCount;
            bool passed = cores >= 2;

            var item = new ListViewItem("Minimum 2 CPU cores");
            item.SubItems.Add(passed ? "✓ Pass" : "✗ Fail");
            item.SubItems.Add($"{cores} cores");
            item.ForeColor = passed ? System.Drawing.Color.Green : System.Drawing.Color.Red;
            listViewChecks.Items.Add(item);

            if (!passed) _allChecksPassed = false;
        }

        private void CheckVirtualization()
        {
            bool virtEnabled = false;
            try
            {
                using var process = new Process();
                process.StartInfo.FileName = "powershell.exe";
                process.StartInfo.Arguments = "-NoProfile -Command \"(Get-WmiObject Win32_ComputerSystem).HypervisorPresent\"";
                process.StartInfo.UseShellExecute = false;
                process.StartInfo.RedirectStandardOutput = true;
                process.StartInfo.CreateNoWindow = true;
                process.Start();

                string output = process.StandardOutput.ReadToEnd();
                process.WaitForExit();

                virtEnabled = output.Trim().ToLower() == "true";
            }
            catch { }

            var item = new ListViewItem("Virtualization enabled in BIOS");
            item.SubItems.Add(virtEnabled ? "✓ Pass" : "⚠ Warning");
            item.SubItems.Add(virtEnabled ? "Enabled" : "Check BIOS");
            item.ForeColor = virtEnabled ? System.Drawing.Color.Green : System.Drawing.Color.Orange;
            listViewChecks.Items.Add(item);

            // Don't fail for virtualization - just warn
        }

        private void btnNext_Click(object sender, EventArgs e)
        {
            var configForm = new ConfigurationForm();
            configForm.Show();
            this.Hide();
        }

        private void btnBack_Click(object sender, EventArgs e)
        {
            var welcomeForm = new WelcomeForm();
            welcomeForm.Show();
            this.Close();
        }

        private void btnCancel_Click(object sender, EventArgs e)
        {
            var result = MessageBox.Show(
                "Are you sure you want to cancel the installation?",
                "Confirm Cancel",
                MessageBoxButtons.YesNo,
                MessageBoxIcon.Question
            );

            if (result == DialogResult.Yes)
            {
                Application.Exit();
            }
        }
    }
}
