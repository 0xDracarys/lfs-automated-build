const admin = require('firebase-admin');
// Rely on ADC or environment
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();
const buildId = 'aDtFPD9eB8xn5IguCNS7';

async function fixZombie() {
    console.log(`Fixing zombie build ${buildId}...`);
    try {
        const docRef = db.collection('builds').doc(buildId);
        const doc = await docRef.get();

        if (!doc.exists) {
            console.log('Document does not exist!');
            return;
        }

        console.log('Current Status:', doc.data().status);

        await docRef.update({
            status: 'CANCELLED',
            error: 'Force cancelled by admin script',
            completedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log('SUCCESS: Build marked as CANCELLED');
    } catch (e) {
        console.error('ERROR:', e);
    }
}

fixZombie();
