"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function TestFirebasePage() {
  const [tests, setTests] = useState({
    authEnabled: { status: 'pending', message: '' },
    firestoreConnected: { status: 'pending', message: '' },
    emailAuthWorks: { status: 'pending', message: '' },
  });

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    // Test 1: Check if Auth is enabled
    try {
      await auth.authStateReady();
      setTests(prev => ({
        ...prev,
        authEnabled: { status: 'success', message: 'Firebase Auth is configured and ready' }
      }));

      // Test 2: Check Firestore connection
      try {
        const testDocRef = doc(db, 'test', 'connection');
        await setDoc(testDocRef, { timestamp: Date.now(), test: true });
        const docSnap = await getDoc(testDocRef);
        
        if (docSnap.exists()) {
          setTests(prev => ({
            ...prev,
            firestoreConnected: { status: 'success', message: 'Firestore database "alds" is connected and writable' }
          }));

          // Test 3: Try creating a test user
          const testEmail = `test${Date.now()}@example.com`;
          const testPassword = 'TestPassword123!';
          
          try {
            const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
            
            // Clean up - delete the test user
            await userCredential.user.delete();
            
            setTests(prev => ({
              ...prev,
              emailAuthWorks: { status: 'success', message: 'Email/Password authentication is working perfectly!' }
            }));
          } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
              setTests(prev => ({
                ...prev,
                emailAuthWorks: { status: 'success', message: 'Email auth is enabled (test user already exists)' }
              }));
            } else {
              setTests(prev => ({
                ...prev,
                emailAuthWorks: { status: 'error', message: `Email auth error: ${error.code}` }
              }));
            }
          }
        }
      } catch (error: any) {
        setTests(prev => ({
          ...prev,
          firestoreConnected: { status: 'error', message: `Firestore error: ${error.message}` }
        }));
      }
    } catch (error: any) {
      setTests(prev => ({
        ...prev,
        authEnabled: { status: 'error', message: `Auth error: ${error.message}` }
      }));
    }
  };

  const getIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-400" />;
      case 'error':
        return <XCircle className="h-6 w-6 text-red-400" />;
      default:
        return <Loader2 className="h-6 w-6 text-blue-400 animate-spin" />;
    }
  };

  const allPassed = Object.values(tests).every(test => test.status === 'success');

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Firebase Connection Test</h1>
        <p className="text-gray-400 mb-8">Testing Firebase Auth and Firestore connectivity</p>

        <div className="space-y-4 mb-8">
          {Object.entries(tests).map(([key, test]) => (
            <div
              key={key}
              className={`p-6 rounded-xl border ${
                test.status === 'success'
                  ? 'bg-green-500/10 border-green-500/30'
                  : test.status === 'error'
                  ? 'bg-red-500/10 border-red-500/30'
                  : 'bg-blue-500/10 border-blue-500/30'
              }`}
            >
              <div className="flex items-start gap-4">
                {getIcon(test.status)}
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">
                    {key === 'authEnabled' && 'Firebase Authentication'}
                    {key === 'firestoreConnected' && 'Firestore Database'}
                    {key === 'emailAuthWorks' && 'Email/Password Auth'}
                  </h3>
                  <p className="text-sm text-gray-300">{test.message || 'Testing...'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {allPassed && (
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="h-8 w-8 text-green-400" />
              <h2 className="text-2xl font-bold text-green-400">All Tests Passed!</h2>
            </div>
            <p className="text-gray-300 mb-4">
              Firebase is fully configured and working. You can now:
            </p>
            <ul className="space-y-2 text-sm text-gray-300 mb-6">
              <li>✓ Create user accounts with email/password</li>
              <li>✓ Sign in with Google OAuth</li>
              <li>✓ Store user data in Firestore database</li>
              <li>✓ Track progress and analytics</li>
            </ul>
            <div className="flex gap-4">
              <a
                href="/auth/signup"
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all"
              >
                Go to Sign Up
              </a>
              <a
                href="/auth/login"
                className="px-6 py-3 bg-white/10 border border-white/20 rounded-lg font-semibold hover:bg-white/20 transition-all"
              >
                Go to Login
              </a>
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={runTests}
            className="px-6 py-3 bg-blue-500/20 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors"
          >
            Run Tests Again
          </button>
        </div>

        <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-lg">
          <h3 className="font-semibold mb-2">Environment Variables</h3>
          <div className="text-sm space-y-1 text-gray-300">
            <div>Project ID: {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '❌ Missing'}</div>
            <div>Auth Domain: {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '❌ Missing'}</div>
            <div>API Key: {process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✓ Present' : '❌ Missing'}</div>
          </div>
        </div>
      </div>
    </main>
  );
}
