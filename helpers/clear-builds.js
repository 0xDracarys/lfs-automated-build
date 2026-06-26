const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        projectId: 'alfs-bd1e0',
    });
}

const db = admin.firestore();

async function clearActiveBuilds() {
    console.log("Looking for active builds...");
    const buildsRef = db.collection('builds');
    
    // Find PENDING builds
    const pendingQuery = await buildsRef.where('status', 'in', ['PENDING', 'RUNNING']).get();
    
    if (pendingQuery.empty) {
        console.log("No active builds found.");
        return;
    }
    
    const batch = db.batch();
    let count = 0;
    
    pendingQuery.forEach((doc) => {
        console.log(`Canceling build: ${doc.id}`);
        batch.update(doc.ref, { 
            status: 'CANCELLED',
            updatedAt: new Date().toISOString(),
            logs: admin.firestore.FieldValue.arrayUnion({
                timestamp: new Date().toISOString(),
                type: 'system',
                message: 'Build forcefully cancelled by admin'
            })
        });
        count++;
    });
    
    await batch.commit();
    console.log(`Successfully cancelled ${count} builds.`);
}

clearActiveBuilds().catch(console.error);
