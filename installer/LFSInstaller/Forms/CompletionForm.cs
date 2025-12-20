using System;
using System.Diagnostics;
using System.Windows.Forms;

namespace LFSInstaller.Forms
{
    /// <summary>
    /// Completion form - final screen showing installation success
    /// </summary>
    public partial class CompletionForm : Form
    {
        private Label lblTitle;
        private Label lblSuccess;
        private Label lblDescription;
        private CheckBox chkLaunchNow;
        private PictureBox pictureBoxSuccess;
        private Button btnFinish;

        public CompletionForm()
        {
            InitializeComponent();
        }

        private void InitializeComponent()
        {
            this.lblTitle = new Label();
            this.lblSuccess = new Label();
            this.lblDescription = new Label();
            this.chkLaunchNow = new CheckBox();
            this.pictureBoxSuccess = new PictureBox();
            this.btnFinish = new Button();
            ((System.ComponentModel.ISupportInitialize)(this.pictureBoxSuccess)).BeginInit();
            this.SuspendLayout();

            // lblTitle
            this.lblTitle.AutoSize = true;
            this.lblTitle.Font = new System.Drawing.Font("Segoe UI", 18F, System.Drawing.FontStyle.Bold);
            this.lblTitle.Location = new System.Drawing.Point(180, 30);
            this.lblTitle.Text = "Installation Complete";
            this.lblTitle.ForeColor = System.Drawing.Color.Green;

            // pictureBoxSuccess
            this.pictureBoxSuccess.Location = new System.Drawing.Point(30, 30);
            this.pictureBoxSuccess.Size = new System.Drawing.Size(128, 128);
            // Set success icon/image here

            // lblSuccess
            this.lblSuccess.AutoSize = true;
            this.lblSuccess.Font = new System.Drawing.Font("Segoe UI", 12F, System.Drawing.FontStyle.Bold);
            this.lblSuccess.Location = new System.Drawing.Point(180, 80);
            this.lblSuccess.Text = "✓ LFS Builder has been successfully installed";
            this.lblSuccess.ForeColor = System.Drawing.Color.Green;

            // lblDescription
            this.lblDescription.Font = new System.Drawing.Font("Segoe UI", 9.75F);
            this.lblDescription.Location = new System.Drawing.Point(180, 120);
            this.lblDescription.Size = new System.Drawing.Size(420, 120);
            this.lblDescription.Text = "LFS Builder is now ready to use!\n\n" +
                "What's been installed:\n" +
                "• WSL2 with Ubuntu Linux\n" +
                "• LFS build environment configured\n" +
                "• Build scripts and tools\n" +
                "• Desktop and Start Menu shortcuts\n\n" +
                "Click Finish to exit setup.";

            // chkLaunchNow
            this.chkLaunchNow.AutoSize = true;
            this.chkLaunchNow.Checked = true;
            this.chkLaunchNow.Font = new System.Drawing.Font("Segoe UI", 9.75F);
            this.chkLaunchNow.Location = new System.Drawing.Point(180, 260);
            this.chkLaunchNow.Text = "Launch LFS Builder now";

            // btnFinish
            this.btnFinish.Font = new System.Drawing.Font("Segoe UI", 9F);
            this.btnFinish.Location = new System.Drawing.Point(490, 320);
            this.btnFinish.Size = new System.Drawing.Size(100, 30);
            this.btnFinish.Text = "Finish";
            this.btnFinish.Click += new EventHandler(this.btnFinish_Click);

            // CompletionForm
            this.ClientSize = new System.Drawing.Size(624, 370);
            this.Controls.Add(this.lblTitle);
            this.Controls.Add(this.pictureBoxSuccess);
            this.Controls.Add(this.lblSuccess);
            this.Controls.Add(this.lblDescription);
            this.Controls.Add(this.chkLaunchNow);
            this.Controls.Add(this.btnFinish);
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.MinimizeBox = false;
            this.Name = "CompletionForm";
            this.StartPosition = FormStartPosition.CenterScreen;
            this.Text = "LFS Builder Setup - Complete";
            ((System.ComponentModel.ISupportInitialize)(this.pictureBoxSuccess)).EndInit();
            this.ResumeLayout(false);
            this.PerformLayout();
        }

        private void btnFinish_Click(object sender, EventArgs e)
        {
            if (chkLaunchNow.Checked)
            {
                try
                {
                    // Launch LFS Builder
                    var startInfo = new ProcessStartInfo
                    {
                        FileName = "wsl.exe",
                        Arguments = "bash -c 'cd ~/lfs-automated && bash lfs-build.sh'",
                        UseShellExecute = false
                    };
                    Process.Start(startInfo);
                }
                catch (Exception ex)
                {
                    MessageBox.Show(
                        $"Failed to launch LFS Builder: {ex.Message}\n\nYou can launch it manually from the desktop shortcut.",
                        "Launch Error",
                        MessageBoxButtons.OK,
                        MessageBoxIcon.Warning
                    );
                }
            }

            Application.Exit();
        }
    }
}
