const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.local' });

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
if (serviceAccount.private_key) {
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'alfs-bd1e0',
});

const db = admin.firestore();

async function cancelBuild() {
  const buildId = 'JaScFAwd9h0ZG5i8ClrE';
  await db.collection('builds').doc(buildId).update({
    status: 'failed',
    error: 'Build cancelled manually via script to unblock user',
    completedAt: new Date().toISOString()
  });
  console.log(`Build ${buildId} cancelled.`);
}

cancelBuild().catch(console.error);
