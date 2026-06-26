const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Use application default credentials (gcloud auth already set up)
initializeApp({ projectId: 'alfs-bd1e0' });
const db = getFirestore();

async function run() {
  const buildId = process.argv[2];
  if (!buildId) { console.error('Usage: node cancel-build.js <buildId>'); process.exit(1); }
  
  await db.collection('builds').doc(buildId).update({
    status: 'failed',
    error: 'Cancelled by admin',
    completedAt: new Date().toISOString()
  });
  console.log(`Build ${buildId} cancelled successfully`);
  process.exit(0);
}

run().catch(e => { console.error(e.message); process.exit(1); });
