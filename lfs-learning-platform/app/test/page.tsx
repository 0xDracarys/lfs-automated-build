'use client';

import { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getAuth } from 'firebase/auth';
import { Terminal, CheckCircle2, Play, RefreshCw, AlertCircle } from 'lucide-react';

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

      console.log('Starting test build...');
      const response = await testBuildComplete({
        config: {
          testMode: true,
          timestamp: new Date().toISOString()
        }
      });

      console.log('Test completed successfully:', response.data);
      setResult(response.data);
    } catch (err: any) {
      console.error('Test failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent pt-24 pb-20 px-4 font-sora text-white">
      <div className="max-w-3xl mx-auto">
        <div className="bg-black/65 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8">
          <div className="flex items-center gap-3 mb-2">
            <Terminal className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-white uppercase tracking-tight">
              Cloud Build Testing Pipeline
            </h1>
          </div>
          <p className="text-gray-400 mb-8 font-light">
            Test the complete build pipeline including event triggers and Firestore state changes
          </p>

          <div className="space-y-6">
            <div className="bg-black/40 border border-white/10 rounded-xl p-5">
              <h2 className="font-bold text-primary text-sm uppercase tracking-wider mb-3">Verification Checklist:</h2>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>Firestore document creation & logging</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>Status updates (RUNNING to SUCCESS)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>Event notification trigger validation</span>
                </li>
              </ul>
            </div>

            <button
              onClick={runTest}
              disabled={loading}
              className={`w-full py-4 px-6 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                loading 
                  ? 'bg-white/10 text-gray-400 cursor-not-allowed border border-white/10' 
                  : 'bg-primary text-black hover:bg-primary/90 shadow-lg shadow-primary/20'
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Running Test Pipeline...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Run Test Build</span>
                </>
              )}
            </button>

            {result && (
              <div className="bg-black/60 border border-primary/40 rounded-xl p-5">
                <div className="flex items-center gap-2 text-primary font-bold mb-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Test Successful!</span>
                </div>
                <div className="text-sm text-gray-300 space-y-2">
                  <p><strong>Build ID:</strong> <code className="bg-primary/10 text-primary px-2 py-0.5 rounded font-mono text-xs">{result.buildId}</code></p>
                  <p><strong>Message:</strong> {result.message}</p>
                  <p className="text-xs text-gray-400 mt-2">{result.tip}</p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5">
                <div className="flex items-center gap-2 text-red-400 font-bold mb-2">
                  <AlertCircle className="w-5 h-5" />
                  <span>Test Error</span>
                </div>
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
