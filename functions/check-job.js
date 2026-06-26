const { google } = require('googleapis');

async function checkCloudRunJob() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });

  const run = google.run({ version: 'v2', auth });
  
  try {
    const parent = 'projects/alfs-bd1e0/locations/us-central1/jobs/lfs-builder';
    
    // Get executions for the job
    const res = await run.projects.locations.jobs.executions.list({
      parent: parent,
      pageSize: 5
    });
    
    console.log('Recent Executions:');
    if (res.data.executions && res.data.executions.length > 0) {
      res.data.executions.forEach(exec => {
        console.log(`Execution: ${exec.name}`);
        console.log(`  Created: ${exec.createTime}`);
        console.log(`  State: ${exec.jobExecution?.state || 'Unknown'} / Completion: ${exec.jobExecution?.completionStatus || ''}`);
        
        // Also log condition states
        if (exec.conditions) {
            exec.conditions.forEach(c => {
                if(c.state !== 'CONDITION_SUCCEEDED' && c.state !== 'CONDITION_STATE_UNSPECIFIED') {
                    console.log(`  Condition ${c.type}: ${c.state} - ${c.message}`);
                }
            });
        }
      });
    } else {
      console.log('No executions found for lfs-builder.');
    }
  } catch (err) {
    console.error('Error fetching executions:', err.message);
  }
}

checkCloudRunJob();
