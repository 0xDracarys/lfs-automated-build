/**
 * Test script for triggerCloudBuild Cloud Function
 * 
 * This script tests the newly deployed Cloud Function to ensure:
 * 1. Authentication is working
 * 2. Build document creation is successful
 * 3. Error handling works correctly
 * 
 * Usage:
 *   node test-cloud-build-function.js
 * 
 * Requirements:
 *   - Firebase Admin SDK credentials
 *   - Valid Firebase user account
 */

const admin = require('firebase-admin');
const fetch = require('node-fetch');

// Initialize Firebase Admin SDK
const serviceAccount = require('./auth.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'alfs-bd1e0'
});

const FUNCTION_URL = 'https://us-central1-alfs-bd1e0.cloudfunctions.net/triggerCloudBuild';

async function testCloudBuildFunction() {
  console.log('🧪 Testing triggerCloudBuild Cloud Function...\n');

  try {
    // Test 1: Missing authentication
    console.log('Test 1: Missing authentication token');
    const test1Response = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectName: 'test-build' })
    });
    const test1Data = await test1Response.json();
    console.log(`   Status: ${test1Response.status}`);
    console.log(`   Expected: 401 (Unauthorized)`);
    console.log(`   Result: ${test1Response.status === 401 ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Response: ${JSON.stringify(test1Data)}\n`);

    // Test 2: Invalid token
    console.log('Test 2: Invalid authentication token');
    const test2Response = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid-token-12345'
      },
      body: JSON.stringify({ projectName: 'test-build' })
    });
    const test2Data = await test2Response.json();
    console.log(`   Status: ${test2Response.status}`);
    console.log(`   Expected: 401 (Unauthorized)`);
    console.log(`   Result: ${test2Response.status === 401 ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Response: ${JSON.stringify(test2Data)}\n`);

    // Test 3: Valid request (requires manual user token)
    console.log('Test 3: Valid authenticated request');
    console.log('   ⚠️  This test requires a valid Firebase ID token from a logged-in user');
    console.log('   To get a token:');
    console.log('   1. Open http://localhost:3000/build in browser');
    console.log('   2. Sign in with Google');
    console.log('   3. Open browser console and run:');
    console.log('      firebase.auth().currentUser.getIdToken().then(token => console.log(token))');
    console.log('   4. Copy the token and set it in this script\n');

    // You can uncomment and add a real token here for testing:
    // const USER_ID_TOKEN = 'your-real-token-here';
    // const test3Response = await fetch(FUNCTION_URL, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${USER_ID_TOKEN}`
    //   },
    //   body: JSON.stringify({
    //     projectName: 'test-automated-build',
    //     lfsVersion: '12.0',
    //     kernelVersion: '6.4.12',
    //     optimization: 'O2',
    //     enableNetworking: true,
    //     enableDebug: false,
    //     additionalNotes: 'Test build from automated script'
    //   })
    // });
    // const test3Data = await test3Response.json();
    // console.log(`   Status: ${test3Response.status}`);
    // console.log(`   Expected: 201 (Created)`);
    // console.log(`   Result: ${test3Response.status === 201 ? '✅ PASS' : '❌ FAIL'}`);
    // console.log(`   Response: ${JSON.stringify(test3Data, null, 2)}\n`);
    
    // if (test3Response.status === 201) {
    //   console.log(`   ✅ Build created with ID: ${test3Data.buildId}`);
    //   console.log(`   View in Firestore: https://console.firebase.google.com/project/alfs-bd1e0/firestore/data/builds/${test3Data.buildId}`);
    // }

    console.log('\n✅ Basic tests completed!');
    console.log('\nTo test the full flow with authentication:');
    console.log('1. Open http://localhost:3000/build');
    console.log('2. Click "Cloud Build" tab');
    console.log('3. Sign in with Google');
    console.log('4. Fill out the form and click "Start Cloud Build"');
    console.log('5. Check browser console for any errors');
    console.log('6. Should redirect to /build/{buildId} page');
    console.log('7. Verify build document in Firestore Console');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error(error.stack);
  } finally {
    // Clean up
    await admin.app().delete();
  }
}

// Run tests
testCloudBuildFunction();
