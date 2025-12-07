'use client';

import dynamic from 'next/dynamic';

const Penguin3D = dynamic(() => import('@/components/ui/penguin-3d'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-800">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-white">Loading 3D Penguin...</p>
      </div>
    </div>
  )
});

export default function TestPenguinPage() {
  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          3D Penguin Test Page
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Small container */}
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-2 border-blue-500/30 rounded-2xl p-4">
            <h2 className="text-xl font-bold mb-4">Small (300px)</h2>
            <div className="h-[300px] bg-gray-900/50 rounded-xl">
              <Penguin3D />
            </div>
          </div>
          
          {/* Medium container */}
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-2 border-purple-500/30 rounded-2xl p-4">
            <h2 className="text-xl font-bold mb-4">Medium (400px)</h2>
            <div className="h-[400px] bg-gray-900/50 rounded-xl">
              <Penguin3D />
            </div>
          </div>
        </div>
        
        {/* Large container */}
        <div className="mt-8 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-2 border-green-500/30 rounded-2xl p-4">
          <h2 className="text-xl font-bold mb-4">Large (600px)</h2>
          <div className="h-[600px] bg-gray-900/50 rounded-xl">
            <Penguin3D />
          </div>
        </div>
        
        <div className="mt-8 p-6 bg-blue-500/10 border border-blue-500/30 rounded-xl">
          <h3 className="font-bold mb-2">Instructions:</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li>The penguin should auto-rotate</li>
            <li>You can drag to rotate manually</li>
            <li>Check browser console for any errors</li>
            <li>If you see "🐧 Tux" text, the component is loading</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
