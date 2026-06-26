const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.local' });

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
if (serviceAccount.private_key) {
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'alfs-bd1e0',
  });
}

const db = admin.firestore();

async function checkLogs() {
  const buildId = '5GRu4oTofCa8jtITjQMl';
  const buildDoc = await db.collection('builds').doc(buildId).get();
  if (buildDoc.exists) {
    console.log('Build status:', buildDoc.data().status);
    console.log('Build progress:', buildDoc.data().progress);
  } else {
    console.log('Build doc not found.');
  }

  const logsSnapshot = await db.collection('buildLogs')
    .limit(20)
    .get();

  if (logsSnapshot.empty) {
    console.log('No logs found for this build yet.');
    return;
  }

  logsSnapshot.forEach(doc => {
    const data = doc.data();
    console.log(`[${data.level}] ${data.message}`);
  });
}

checkLogs().catch(console.error);
