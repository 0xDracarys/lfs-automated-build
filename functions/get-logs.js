const { google } = require('googleapis');

async function getLogs() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });

  const logging = google.logging({ version: 'v2', auth });
  
  try {
    const res = await logging.entries.list({
      requestBody: {
        resourceNames: ['projects/alfs-bd1e0'],
        filter: 'resource.type="cloud_run_job" AND resource.labels.job_name="lfs-builder"',
        orderBy: 'timestamp desc',
        pageSize: 30
      }
    });
    
    if (res.data.entries && res.data.entries.length > 0) {
      console.log('Recent logs from Cloud Run Job lfs-builder:');
      res.data.entries.reverse().forEach(entry => {
        const msg = entry.textPayload || (entry.jsonPayload ? JSON.stringify(entry.jsonPayload) : '');
        console.log(`[${entry.timestamp}] ${entry.severity || 'INFO'}: ${msg}`);
      });
    } else {
      console.log('No logs found.');
    }
  } catch (err) {
    console.error('Error fetching logs:', err.message);
  }
}

getLogs();
