const admin = require('firebase-admin');

// Ensure we load the .env.local file
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

async function checkBuild() {
  const buildId = 'JaScFAwd9h0ZG5i8ClrE';
  const doc = await db.collection('builds').doc(buildId).get();
  
  if (!doc.exists) {
    console.log('No such build document!');
    return;
  }
  
  console.log('Build Data:', JSON.stringify(doc.data(), null, 2));

  // Check logs subcollection
  const logs = await db.collection('builds').doc(buildId).collection('logs').orderBy('timestamp').get();
  console.log(`Found ${logs.size} logs`);
  logs.forEach(l => console.log(l.data()));
}

checkBuild().catch(console.error);
