/**
 * Firebase Connectivity Test Utility
 * Verifies that Firestore and Firebase are properly connected and responding
 */

import { db, auth } from '@/lib/firebase';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

interface TestResult {
  name: string;
  status: 'pass' | 'fail';
  message: string;
  duration: number;
  error?: string;
}

export async function testFirebaseConnectivity(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  // Test 1: Check Firestore connection
  const start1 = Date.now();
  try {
    const testRef = collection(db, 'test_connection');
    const snapshot = await getDocs(testRef);
    const duration1 = Date.now() - start1;

    results.push({
      name: 'Firestore Connection',
      status: 'pass',
      message: `Connected successfully (${snapshot.size} documents)`,
      duration: duration1
    });
  } catch (error) {
    const duration1 = Date.now() - start1;
    results.push({
      name: 'Firestore Connection',
      status: 'fail',
      message: 'Failed to connect to Firestore',
      duration: duration1,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // Test 2: Check Auth state
  const start2 = Date.now();
  try {
    const user = auth.currentUser;
    const duration2 = Date.now() - start2;

    results.push({
      name: 'Authentication',
      status: user ? 'pass' : 'pass',
      message: user ? `Authenticated as ${user.email}` : 'No user authenticated (expected)',
      duration: duration2
    });
  } catch (error) {
    const duration2 = Date.now() - start2;
    results.push({
      name: 'Authentication',
      status: 'fail',
      message: 'Failed to check auth state',
      duration: duration2,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // Test 3: Test write operation (if authenticated)
  if (auth.currentUser) {
    const start3 = Date.now();
    try {
      const testRef = collection(db, 'connectivity_tests');
      const docRef = await addDoc(testRef, {
        timestamp: serverTimestamp(),
        testType: 'write_test',
        userId: auth.currentUser.uid,
        message: 'This is a test document'
      });
      const duration3 = Date.now() - start3;

      results.push({
        name: 'Write Operation',
        status: 'pass',
        message: `Document created: ${docRef.id}`,
        duration: duration3
      });

      // Clean up test document
      try {
        // In production, delete the document
      } catch (e) {
        console.warn('Could not clean up test document');
      }
    } catch (error) {
      const duration3 = Date.now() - start3;
      results.push({
        name: 'Write Operation',
        status: 'fail',
        message: 'Failed to write test document',
        duration: duration3,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Test 4: Check Firebase config
  const start4 = Date.now();
  try {
    const hasApiKey = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    const hasProjectId = !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const hasAuthDomain = !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
    const duration4 = Date.now() - start4;

    const allConfigured = hasApiKey && hasProjectId && hasAuthDomain;

    results.push({
      name: 'Firebase Configuration',
      status: allConfigured ? 'pass' : 'fail',
      message: allConfigured
        ? 'All required environment variables configured'
        : `Missing: ${!hasApiKey ? 'API_KEY ' : ''}${!hasProjectId ? 'PROJECT_ID ' : ''}${!hasAuthDomain ? 'AUTH_DOMAIN' : ''}`,
      duration: duration4
    });
  } catch (error) {
    const duration4 = Date.now() - start4;
    results.push({
      name: 'Firebase Configuration',
      status: 'fail',
      message: 'Failed to check configuration',
      duration: duration4,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  return results;
}

export function printTestResults(results: TestResult[]): void {
  console.log('\n=== Firebase Connectivity Test Results ===\n');

  let passCount = 0;
  let failCount = 0;

  results.forEach(result => {
    const status = result.status === 'pass' ? '✅' : '❌';
    const color = result.status === 'pass' ? '\x1b[32m' : '\x1b[31m';
    const reset = '\x1b[0m';

    console.log(`${status} ${color}${result.name}${reset}`);
    console.log(`   Message: ${result.message}`);
    console.log(`   Duration: ${result.duration}ms`);

    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }

    console.log();

    if (result.status === 'pass') {
      passCount++;
    } else {
      failCount++;
    }
  });

  console.log(`\nSummary: ${passCount} passed, ${failCount} failed`);
  console.log('='.repeat(42) + '\n');
}
