using System;
using System.IO;
using System.Windows.Forms;
using LFSInstaller.Core;

namespace LFSInstaller.Forms
{
    /// <summary>
    /// Configuration form - allows user to customize installation settings
    /// </summary>
    public partial class ConfigurationForm : Form
    {
        private Label lblTitle;
        private Label lblInstallPath;
        private TextBox txtInstallPath;
        private Button btnBrowse;
        private Label lblDistro;
        private ComboBox cboDistro;
        private Label lblOptions;
        private CheckBox chkDesktopShortcut;
        private CheckBox chkStartMenuShortcut;
        private CheckBox chkLaunchAfterInstall;
        private CheckBox chkAutoUpdates;
        private Label lblCores;
        private NumericUpDown numCores;
        private Button btnNext;
        private Button btnBack;
        private Button btnCancel;

        public InstallationConfig Config { get; private set; }

        public ConfigurationForm()
        {
            Config = new InstallationConfig();
            InitializeComponent();
            LoadDefaultValues();
        }

        private void InitializeComponent()
        {
            this.lblTitle = new Label();
            this.lblInstallPath = new Label();
            this.txtInstallPath = new TextBox();
            this.btnBrowse = new Button();
            this.lblDistro = new Label();
            this.cboDistro = new ComboBox();
            this.lblOptions = new Label();
            this.chkDesktopShortcut = new CheckBox();
            this.chkStartMenuShortcut = new CheckBox();
            this.chkLaunchAfterInstall = new CheckBox();
            this.chkAutoUpdates = new CheckBox();
            this.lblCores = new Label();
            this.numCores = new NumericUpDown();
            this.btnNext = new Button();
            this.btnBack = new Button();
            this.btnCancel = new Button();
            ((System.ComponentModel.ISupportInitialize)(this.numCores)).BeginInit();
            this.SuspendLayout();

            // lblTitle
            this.lblTitle.AutoSize = true;
            this.lblTitle.Font = new System.Drawing.Font("Segoe UI", 14F, System.Drawing.FontStyle.Bold);
            this.lblTitle.Location = new System.Drawing.Point(30, 30);
            this.lblTitle.Text = "Installation Configuration";

            // lblInstallPath
            this.lblInstallPath.AutoSize = true;
            this.lblInstallPath.Location = new System.Drawing.Point(30, 80);
            this.lblInstallPath.Text = "Installation Directory:";

            // txtInstallPath
            this.txtInstallPath.Location = new System.Drawing.Point(30, 105);
            this.txtInstallPath.Size = new System.Drawing.Size(450, 23);
            this.txtInstallPath.Text = @"C:\LFSBuilder";

            // btnBrowse
            this.btnBrowse.Location = new System.Drawing.Point(490, 103);
            this.btnBrowse.Size = new System.Drawing.Size(100, 27);
            this.btnBrowse.Text = "Browse...";
            this.btnBrowse.Click += new EventHandler(this.btnBrowse_Click);

            // lblDistro
            this.lblDistro.AutoSize = true;
            this.lblDistro.Location = new System.Drawing.Point(30, 145);
            this.lblDistro.Text = "Linux Distribution:";

            // cboDistro
            this.cboDistro.DropDownStyle = ComboBoxStyle.DropDownList;
            this.cboDistro.Location = new System.Drawing.Point(30, 170);
            this.cboDistro.Size = new System.Drawing.Size(200, 23);
            this.cboDistro.Items.AddRange(new object[] { "Ubuntu", "Debian", "Ubuntu-20.04", "Ubuntu-22.04" });
            this.cboDistro.SelectedIndex = 0;

            // lblCores
            this.lblCores.AutoSize = true;
            this.lblCores.Location = new System.Drawing.Point(250, 145);
            this.lblCores.Text = "Build Cores:";

            // numCores
            this.numCores.Location = new System.Drawing.Point(250, 170);
            this.numCores.Size = new System.Drawing.Size(80, 23);
            this.numCores.Minimum = 1;
            this.numCores.Maximum = Environment.ProcessorCount;
            this.numCores.Value = Environment.ProcessorCount;

            // lblOptions
            this.lblOptions.AutoSize = true;
            this.lblOptions.Font = new System.Drawing.Font("Segoe UI", 10F, System.Drawing.FontStyle.Bold);
            this.lblOptions.Location = new System.Drawing.Point(30, 215);
            this.lblOptions.Text = "Additional Options:";

            // chkDesktopShortcut
            this.chkDesktopShortcut.AutoSize = true;
            this.chkDesktopShortcut.Checked = true;
            this.chkDesktopShortcut.Location = new System.Drawing.Point(30, 245);
            this.chkDesktopShortcut.Text = "Create desktop shortcut";

            // chkStartMenuShortcut
            this.chkStartMenuShortcut.AutoSize = true;
            this.chkStartMenuShortcut.Checked = true;
            this.chkStartMenuShortcut.Location = new System.Drawing.Point(30, 270);
            this.chkStartMenuShortcut.Text = "Create Start Menu shortcuts";

            // chkLaunchAfterInstall
            this.chkLaunchAfterInstall.AutoSize = true;
            this.chkLaunchAfterInstall.Checked = true;
            this.chkLaunchAfterInstall.Location = new System.Drawing.Point(300, 245);
            this.chkLaunchAfterInstall.Text = "Launch LFS Builder after installation";

            // chkAutoUpdates
            this.chkAutoUpdates.AutoSize = true;
            this.chkAutoUpdates.Checked = true;
            this.chkAutoUpdates.Location = new System.Drawing.Point(300, 270);
            this.chkAutoUpdates.Text = "Enable automatic updates";

            // btnNext
            this.btnNext.Location = new System.Drawing.Point(490, 320);
            this.btnNext.Size = new System.Drawing.Size(100, 30);
            this.btnNext.Text = "Next >";
            this.btnNext.Click += new EventHandler(this.btnNext_Click);

            // btnBack
            this.btnBack.Location = new System.Drawing.Point(380, 320);
            this.btnBack.Size = new System.Drawing.Size(100, 30);
            this.btnBack.Text = "< Back";
            this.btnBack.Click += new EventHandler(this.btnBack_Click);

            // btnCancel
            this.btnCancel.Location = new System.Drawing.Point(270, 320);
            this.btnCancel.Size = new System.Drawing.Size(100, 30);
            this.btnCancel.Text = "Cancel";
            this.btnCancel.Click += new EventHandler(this.btnCancel_Click);

            // ConfigurationForm
            this.ClientSize = new System.Drawing.Size(624, 370);
            this.Controls.Add(this.lblTitle);
            this.Controls.Add(this.lblInstallPath);
            this.Controls.Add(this.txtInstallPath);
            this.Controls.Add(this.btnBrowse);
            this.Controls.Add(this.lblDistro);
            this.Controls.Add(this.cboDistro);
            this.Controls.Add(this.lblCores);
            this.Controls.Add(this.numCores);
            this.Controls.Add(this.lblOptions);
            this.Controls.Add(this.chkDesktopShortcut);
            this.Controls.Add(this.chkStartMenuShortcut);
            this.Controls.Add(this.chkLaunchAfterInstall);
            this.Controls.Add(this.chkAutoUpdates);
            this.Controls.Add(this.btnNext);
            this.Controls.Add(this.btnBack);
            this.Controls.Add(this.btnCancel);
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.MinimizeBox = false;
            this.Name = "ConfigurationForm";
            this.StartPosition = FormStartPosition.CenterScreen;
            this.Text = "LFS Builder Setup - Configuration";
            ((System.ComponentModel.ISupportInitialize)(this.numCores)).EndInit();
            this.ResumeLayout(false);
            this.PerformLayout();
        }

        private void LoadDefaultValues()
        {
            txtInstallPath.Text = Config.InstallationPath;
            cboDistro.SelectedItem = Config.LinuxDistribution;
            numCores.Value = Config.BuildCores;
            chkDesktopShortcut.Checked = Config.CreateDesktopShortcut;
            chkStartMenuShortcut.Checked = Config.CreateStartMenuShortcut;
            chkLaunchAfterInstall.Checked = Config.LaunchAfterInstall;
            chkAutoUpdates.Checked = Config.EnableAutoUpdates;
        }

        private void SaveConfiguration()
        {
            Config.InstallationPath = txtInstallPath.Text;
            Config.LinuxDistribution = cboDistro.SelectedItem?.ToString() ?? "Ubuntu";
            Config.BuildCores = (int)numCores.Value;
            Config.CreateDesktopShortcut = chkDesktopShortcut.Checked;
            Config.CreateStartMenuShortcut = chkStartMenuShortcut.Checked;
            Config.LaunchAfterInstall = chkLaunchAfterInstall.Checked;
            Config.EnableAutoUpdates = chkAutoUpdates.Checked;
        }

        private void btnBrowse_Click(object sender, EventArgs e)
        {
            using var folderDialog = new FolderBrowserDialog
            {
                Description = "Select installation directory",
                SelectedPath = txtInstallPath.Text
            };

            if (folderDialog.ShowDialog() == DialogResult.OK)
            {
                txtInstallPath.Text = folderDialog.SelectedPath;
            }
        }

        private void btnNext_Click(object sender, EventArgs e)
        {
            // Validate installation path
            if (string.IsNullOrWhiteSpace(txtInstallPath.Text))
            {
                MessageBox.Show("Please select an installation directory.", "Validation Error", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            // Check if directory exists and is not empty
            if (Directory.Exists(txtInstallPath.Text) && Directory.GetFileSystemEntries(txtInstallPath.Text).Length > 0)
            {
                var result = MessageBox.Show(
                    "The selected directory is not empty. Files may be overwritten.\n\nContinue anyway?",
                    "Directory Not Empty",
                    MessageBoxButtons.YesNo,
                    MessageBoxIcon.Warning
                );

                if (result != DialogResult.Yes)
                    return;
            }

            SaveConfiguration();

            var progressForm = new ProgressForm(Config);
            progressForm.Show();
            this.Hide();
        }

        private void btnBack_Click(object sender, EventArgs e)
        {
            var prereqForm = new PrerequisitesForm();
            prereqForm.Show();
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
