using System;
using System.Windows.Forms;

namespace LFSInstaller.Forms
{
    /// <summary>
    /// Welcome screen - first step of the installation wizard
    /// </summary>
    public partial class WelcomeForm : Form
    {
        public WelcomeForm()
        {
            InitializeComponent();
        }

        private void btnNext_Click(object sender, EventArgs e)
        {
            // Navigate to prerequisites check
            var prereqForm = new PrerequisitesForm();
            prereqForm.Show();
            this.Hide();
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
