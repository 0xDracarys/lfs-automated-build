"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle, XCircle, ExternalLink, Copy, Check } from "lucide-react";
import { auth, db } from "@/lib/firebase";

export default function FirebaseSetupPage() {
  const [copied, setCopied] = useState(false);
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const setupSteps = [
    {
      title: "Enable Email/Password Authentication",
      url: `https://console.firebase.google.com/project/${projectId}/authentication/providers`,
      steps: [
        'Click "Get started" (if first time)',
        'Find "Email/Password" in the list',
        'Toggle "Enable" to ON',
        'Click "Save"'
      ]
    },
    {
      title: "Enable Google Sign-In",
      url: `https://console.firebase.google.com/project/${projectId}/authentication/providers`,
      steps: [
        'Find "Google" in the list',
        'Toggle "Enable" to ON',
        'Enter your support email',
        'Click "Save"'
      ]
    },
    {
      title: "Create Firestore Database",
      url: `https://console.firebase.google.com/project/${projectId}/firestore`,
      steps: [
        'Click "Create database"',
        'Choose "Start in test mode"',
        'Select your region',
        'Click "Enable"'
      ]
    }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Firebase Setup Required</h1>
          <p className="text-gray-400">Complete these steps to enable authentication</p>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <XCircle className="h-6 w-6 text-yellow-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-yellow-400 mb-2">Authentication Not Configured</h3>
              <p className="text-sm text-gray-300">
                Your Firebase project exists, but authentication methods have not been enabled yet.
                Follow the steps below to set it up.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {setupSteps.map((step, index) => (
            <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold">
                  Step {index + 1}: {step.title}
                </h3>
                <a
                  href={step.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg transition-colors text-sm"
                >
                  Open Console <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              
              <ol className="space-y-2">
                {step.steps.map((instruction, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500/20 text-green-400 text-sm font-semibold flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-gray-300">{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-green-500/10 border border-green-500/30 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-green-400 mb-2">After Completing Setup</h3>
              <p className="text-sm text-gray-300 mb-4">
                Once you have enabled authentication, come back here and try signing up again.
                The changes take effect immediately.
              </p>
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all"
              >
                Go to Sign Up
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="font-semibold mb-4">Your Firebase Project</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
              <span className="text-gray-400">Project ID:</span>
              <div className="flex items-center gap-2">
                <code className="text-green-400">{projectId}</code>
                <button
                  onClick={() => copyToClipboard(projectId || '')}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                  {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
              <span className="text-gray-400">Console:</span>
              <a
                href={`https://console.firebase.google.com/project/${projectId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                Open Project <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-400">
          <Link href="/" className="hover:text-white transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
