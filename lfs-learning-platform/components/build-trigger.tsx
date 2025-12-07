'use client';

import { useState } from 'react';
import { startAndMonitorBuild, BuildStatus } from '@/lib/build-client';

export default function BuildTrigger() {
  const [loading, setLoading] = useState(false);
  const [buildId, setBuildId] = useState<string>('');
  const [logs, setLogs] = useState<string>('');
  const [status, setStatus] = useState<string>('idle');

  const handleStartBuild = async () => {
    setLoading(true);
    setStatus('starting');
    setLogs('Initializing build process...\n');

    try {
      await startAndMonitorBuild(
        {
          kernelVersion: '6.4.12',
          optimization: 'balanced',
          scriptType: 'default',
        },
        (update: BuildStatus) => {
          setBuildId(update.buildId);
          setLogs(update.logs);
          setStatus('running');
        },
        (complete: BuildStatus) => {
          setBuildId(complete.buildId);
          setLogs(complete.logs);
          setStatus('complete');
          setLoading(false);
        }
      );
    } catch (error: any) {
      setStatus('error');
      setLogs(prev => prev + `\nERROR: ${error.message}\n`);
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg border border-slate-700">
      <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
        🔨 LFS Build Trigger
      </h2>

      <div className="mb-6">
        <button
          onClick={handleStartBuild}
          disabled={loading}
          className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
            loading
              ? 'bg-slate-600 text-slate-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
          }`}
        >
          {loading ? '⏳ Building...' : '▶ Start LFS Build'}
        </button>

        {buildId && (
          <div className="mt-4 p-3 bg-slate-700 rounded text-sm text-slate-100">
            <strong>Build ID:</strong> {buildId}
          </div>
        )}
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-slate-300">Status:</span>
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              status === 'idle'
                ? 'bg-slate-600 text-slate-200'
                : status === 'running'
                ? 'bg-yellow-600 text-yellow-100'
                : status === 'complete'
                ? 'bg-green-600 text-green-100'
                : 'bg-red-600 text-red-100'
            }`}
          >
            {status.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="bg-slate-950 rounded-lg p-4 border border-slate-700">
        <div className="text-xs text-slate-400 mb-2">Build Logs:</div>
        <pre className="text-xs text-slate-300 overflow-x-auto max-h-96 overflow-y-auto font-mono">
          {logs || 'No logs yet...'}
        </pre>
      </div>

      <div className="mt-4 p-3 bg-slate-700 rounded-lg text-sm text-slate-200">
        <p className="font-semibold mb-2">ℹ️ Backend Information:</p>
        <ul className="space-y-1 text-slate-300">
          <li>• Triggers: PowerShell scripts from <code className="text-blue-300">/scripts/</code> directory</li>
          <li>• Connects: Frontend → Backend build system</li>
          <li>• Output: <code className="text-blue-300">/builds/[buildId]/</code></li>
          <li>• Logs: Real-time monitoring available</li>
        </ul>
      </div>
    </div>
  );
}
