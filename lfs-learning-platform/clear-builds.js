require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

async function deleteAllBuilds() {
  try {
    const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    const cleanStr = serviceAccountStr 
        ? serviceAccountStr.replace(/^\uFEFF/, '').trim().replace(/^['"]|['"]$/g, '')
        : undefined;
    const serviceAccount = cleanStr ? JSON.parse(cleanStr) : undefined;

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });

    const db = admin.firestore();
    const buildsRef = db.collection('builds');
    const snapshot = await buildsRef.get();

    if (snapshot.empty) {
      console.log('No matching documents.');
      return;
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log('Successfully deleted all build documents.');
  } catch (error) {
    console.error('Error deleting documents: ', error);
  } finally {
    process.exit(0);
  }
}

deleteAllBuilds();
