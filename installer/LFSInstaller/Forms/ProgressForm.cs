using System;
using System.Windows.Forms;
using LFSInstaller.Core;

namespace LFSInstaller.Forms
{
    /// <summary>
    /// Progress form - displays installation progress with real-time updates
    /// </summary>
    public partial class ProgressForm : Form
    {
        private Label lblTitle;
        private Label lblStatus;
        private ProgressBar progressBar;
        private TextBox txtLog;
        private Button btnCancel;
        private InstallationManager _installManager;
        private bool _installationComplete = false;

        public ProgressForm(InstallationConfig config)
        {
            InitializeComponent();
            _installManager = new InstallationManager(config);
            SetupEventHandlers();
        }

        private void InitializeComponent()
        {
            this.lblTitle = new Label();
            this.lblStatus = new Label();
            this.progressBar = new ProgressBar();
            this.txtLog = new TextBox();
            this.btnCancel = new Button();
            this.SuspendLayout();

            // lblTitle
            this.lblTitle.AutoSize = true;
            this.lblTitle.Font = new System.Drawing.Font("Segoe UI", 14F, System.Drawing.FontStyle.Bold);
            this.lblTitle.Location = new System.Drawing.Point(30, 30);
            this.lblTitle.Text = "Installing LFS Builder";

            // lblStatus
            this.lblStatus.Location = new System.Drawing.Point(30, 70);
            this.lblStatus.Size = new System.Drawing.Size(560, 23);
            this.lblStatus.Text = "Preparing installation...";

            // progressBar
            this.progressBar.Location = new System.Drawing.Point(30, 100);
            this.progressBar.Size = new System.Drawing.Size(560, 30);
            this.progressBar.Style = ProgressBarStyle.Blocks;

            // txtLog
            this.txtLog.Location = new System.Drawing.Point(30, 145);
            this.txtLog.Multiline = true;
            this.txtLog.ReadOnly = true;
            this.txtLog.ScrollBars = ScrollBars.Vertical;
            this.txtLog.Size = new System.Drawing.Size(560, 140);
            this.txtLog.Font = new System.Drawing.Font("Consolas", 9F);

            // btnCancel
            this.btnCancel.Location = new System.Drawing.Point(490, 320);
            this.btnCancel.Size = new System.Drawing.Size(100, 30);
            this.btnCancel.Text = "Cancel";
            this.btnCancel.Click += new EventHandler(this.btnCancel_Click);

            // ProgressForm
            this.ClientSize = new System.Drawing.Size(624, 370);
            this.Controls.Add(this.lblTitle);
            this.Controls.Add(this.lblStatus);
            this.Controls.Add(this.progressBar);
            this.Controls.Add(this.txtLog);
            this.Controls.Add(this.btnCancel);
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.MinimizeBox = false;
            this.Name = "ProgressForm";
            this.StartPosition = FormStartPosition.CenterScreen;
            this.Text = "LFS Builder Setup - Installing";
            this.FormClosing += new FormClosingEventHandler(this.ProgressForm_FormClosing);
            this.Load += new EventHandler(this.ProgressForm_Load);
            this.ResumeLayout(false);
            this.PerformLayout();
        }

        private void SetupEventHandlers()
        {
            _installManager.ProgressChanged += (sender, e) =>
            {
                if (InvokeRequired)
                {
                    Invoke(new Action(() =>
                    {
                        progressBar.Value = e.Percentage;
                        AppendLog($"[{e.Percentage}%] {e.Message}");
                    }));
                }
            };

            _installManager.StatusChanged += (sender, status) =>
            {
                if (InvokeRequired)
                {
                    Invoke(new Action(() => lblStatus.Text = status));
                }
            };

            _installManager.LogMessage += (sender, message) =>
            {
                if (InvokeRequired)
                {
                    Invoke(new Action(() => AppendLog(message)));
                }
            };
        }

        private async void ProgressForm_Load(object sender, EventArgs e)
        {
            // Start installation process
            AppendLog("Starting installation...");

            bool success = await _installManager.InstallAsync();

            _installationComplete = true;
            btnCancel.Text = "Close";

            if (success)
            {
                AppendLog("\n✓ Installation completed successfully!");
                var completionForm = new CompletionForm();
                completionForm.Show();
                this.Hide();
            }
            else
            {
                AppendLog("\n✗ Installation failed. Please check the log for details.");
                MessageBox.Show(
                    "Installation failed. Please check the log for details and try again.",
                    "Installation Failed",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error
                );
            }
        }

        private void AppendLog(string message)
        {
            txtLog.AppendText($"{DateTime.Now:HH:mm:ss} {message}\r\n");
        }

        private void btnCancel_Click(object sender, EventArgs e)
        {
            if (_installationComplete)
            {
                Application.Exit();
            }
            else
            {
                var result = MessageBox.Show(
                    "Are you sure you want to cancel the installation?\n\nCanceling may leave your system in an incomplete state.",
                    "Confirm Cancel",
                    MessageBoxButtons.YesNo,
                    MessageBoxIcon.Warning
                );

                if (result == DialogResult.Yes)
                {
                    Application.Exit();
                }
            }
        }

        private void ProgressForm_FormClosing(object sender, FormClosingEventArgs e)
        {
            if (!_installationComplete && e.CloseReason == CloseReason.UserClosing)
            {
                e.Cancel = true;
                btnCancel_Click(sender, e);
            }
        }
    }
}
