/**
 * Firebase Admin SDK for Server-Side Operations
 * Used in API routes to access Firestore with admin privileges
 */

import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK (singleton pattern)
if (!admin.apps.length) {
  try {
    // Try to use service account credentials from environment
    const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    const serviceAccount = serviceAccountStr
      ? JSON.parse(serviceAccountStr.replace(/^\uFEFF/, '').trim())
      : undefined;

    if (serviceAccount && serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }

    admin.initializeApp({
      credential: serviceAccount
        ? admin.credential.cert(serviceAccount)
        : admin.credential.applicationDefault(),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'alfs-bd1e0',
    });

    console.log('✅ Firebase Admin SDK initialized');
  } catch (error) {
    console.error('❌ Firebase Admin SDK initialization error:', error);
    throw error;
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export const adminStorage = admin.storage();

export default admin;
