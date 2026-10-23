// Import the functions you need from the SDKs you need
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAnalytics, Analytics } from 'firebase/analytics';
import { getAuth, Auth } from 'firebase/auth';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
let app: FirebaseApp;
let db: Firestore;
let auth: Auth;
let analytics: Analytics | null = null;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
} else {
  app = getApps()[0];
  db = getFirestore(app);
  auth = getAuth(app);
}

/**
 * GDPR / ePrivacy: Google Analytics is DISABLED BY DEFAULT.
 * It only initializes after the user explicitly accepts via the consent
 * banner (components/gdpr/ConsentBanner). Nothing imports `analytics`
 * directly, so lazy init here is safe.
 */
export function initAnalyticsIfConsented(): void {
  if (analytics || typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem('lfs-gdpr-consent-v1');
    if (raw && raw.includes('"analytics":true')) {
      analytics = getAnalytics(getApps()[0]);
    }
  } catch {
    /* storage blocked or no consent — stays off */
  }
}

export { db, auth, app, analytics };
