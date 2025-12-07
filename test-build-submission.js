/**
 * Test Script: Submit a Build to Firestore
 * This script simulates a user submitting a build request
 * It should trigger the entire pipeline:
 * 1. onBuildSubmitted Cloud Function (Firestore trigger)
 * 2. Pub/Sub message published to 'lfs-build-requests'
 * 3. executeLfsBuild Cloud Function (Pub/Sub trigger)
 * 4. Cloud Run Job execution
 */

const admin = require('firebase-admin');
const serviceAccount = require('./auth.json');

// Initialize Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function submitTestBuild() {
    console.log('[TEST] Submitting test build to Firestore...');
    
    const buildData = {
        userId: 'test-user-' + Date.now(),
        email: 'test@example.com',
        projectName: 'test-lfs-project',
        lfsVersion: '1.0.0',
        status: 'submitted',
        submittedAt: admin.firestore.FieldValue.serverTimestamp(),
        buildOptions: {
            targetPlatform: 'linux',
            optimization: 'release'
        },
        additionalNotes: 'Test build from automation script'
    };

    try {
        const docRef = await db.collection('builds').add(buildData);
        console.log('[TEST] ✅ Build document created with ID:', docRef.id);
        console.log('[TEST] Wait 5 seconds for Cloud Function to process...');
        
        // Wait 5 seconds
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Check the build status
        const buildDoc = await db.collection('builds').doc(docRef.id).get();
        const updatedData = buildDoc.data();
        
        console.log('\n[TEST] 📊 Build Status After 5 Seconds:');
        console.log('  - Build ID:', docRef.id);
        console.log('  - Status:', updatedData.status);
        console.log('  - Trace ID:', updatedData.traceId || 'N/A');
        console.log('  - Pending At:', updatedData.pendingAt ? updatedData.pendingAt.toDate().toISOString() : 'N/A');
        console.log('  - Started At:', updatedData.startedAt ? updatedData.startedAt.toDate().toISOString() : 'N/A');
        console.log('  - Error:', updatedData.error || 'None');
        
        if (updatedData.cloudRunExecution) {
            console.log('\n[TEST] ☁️ Cloud Run Execution:');
            console.log('  - Name:', updatedData.cloudRunExecution.name);
            console.log('  - Create Time:', updatedData.cloudRunExecution.createTime);
        }
        
        console.log('\n[TEST] 🔍 Next Steps:');
        console.log('  1. Check Cloud Functions logs:');
        console.log('     gcloud functions logs read onBuildSubmitted --project=alfs-bd1e0 --region=us-central1 --limit=10');
        console.log('  2. Check Pub/Sub messages:');
        console.log('     gcloud pubsub topics publish lfs-build-requests --message=\'{"buildId":"' + docRef.id + '"}\'');
        console.log('  3. Check executeLfsBuild logs:');
        console.log('     gcloud functions logs read executeLfsBuild --project=alfs-bd1e0 --region=us-central1 --limit=10');
        
        process.exit(0);
    } catch (error) {
        console.error('[TEST] ❌ Error:', error.message);
        process.exit(1);
    }
}

submitTestBuild();
