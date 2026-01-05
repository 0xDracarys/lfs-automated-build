'use client';

import { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getAuth } from 'firebase/auth';

export default function TestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const runTest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        throw new Error('Please sign in first');
      }

      const functions = getFunctions();
      const testBuildComplete = httpsCallable(functions, 'testBuildComplete');

      console.log('🧪 Starting test build...');
      const response = await testBuildComplete({
        config: {
          kernelVersion: '6.4.12',
          optimization: 'O2'
        }
      });

      console.log('✅ Test completed:', response.data);
      setResult(response.data);

    } catch (err: any) {
      console.error('❌ Test failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 Cloud Build Testing
          </h1>
          <p className="text-gray-600 mb-8">
            Test the complete build pipeline including email notifications (logs only)
          </p>

          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="font-semibold text-blue-900 mb-2">What this tests:</h2>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>✅ Firestore document creation</li>
                <li>✅ Status updates (RUNNING → SUCCESS)</li>
                <li>✅ Email notification trigger</li>
                <li>✅ Download URL generation</li>
                <li>✅ Cloud Functions logging</li>
              </ul>
            </div>

            <button
              onClick={runTest}
              disabled={loading}
              className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? '🔄 Running Test...' : '▶️ Run Test Build'}
            </button>

            {result && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">✅ Test Successful!</h3>
                <div className="text-sm text-green-800 space-y-2">
                  <p><strong>Build ID:</strong> <code className="bg-green-100 px-2 py-1 rounded">{result.buildId}</code></p>
                  <p><strong>Message:</strong> {result.message}</p>
                  <p className="text-xs mt-3">{result.tip}</p>
                  
                  <div className="mt-4 pt-4 border-t border-green-300">
                    <p className="font-semibold mb-2">Next Steps:</p>
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                      <li>Open <a href="https://console.firebase.google.com/project/alfs-bd1e0/functions/logs" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Firebase Console Logs</a></li>
                      <li>Look for "[TEST MODE] Email notification triggered"</li>
                      <li>Check the email content in the logs</li>
                      <li>View build in <a href="/dashboard" className="text-blue-600 underline">Dashboard</a></li>
                    </ol>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-900 mb-2">❌ Test Failed</h3>
                <p className="text-sm text-red-800">{error}</p>
                {error.includes('sign in') && (
                  <p className="text-xs text-red-700 mt-2">
                    Please <a href="/auth/signin" className="underline">sign in</a> first.
                  </p>
                )}
              </div>
            )}

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">📋 Testing Checklist:</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" disabled checked />
                  <span>Email function logs to console (not sent)</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" disabled checked />
                  <span>Creates Firestore build document</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" disabled checked />
                  <span>Updates status RUNNING → SUCCESS</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" disabled checked />
                  <span>Generates mock download URLs</span>
                </label>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Note:</h3>
              <p className="text-sm text-yellow-800">
                Email sending is in TEST MODE - emails will be logged to Cloud Functions console 
                but not actually sent. To enable real emails, uncomment the code in 
                <code className="bg-yellow-100 px-2 py-1 rounded mx-1">sendBuildCompleteEmail</code> function.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
