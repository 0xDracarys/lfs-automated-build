'use client';

import { useState, useEffect } from 'react';
import { DottedSurface } from '@/components/ui/dotted-surface';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import EnhancedModuleList from '@/components/module-list-enhanced';
import { Module } from '@/lib/types/learning';
import { ALL_MODULES } from '@/lib/data/modules';

export default function LearnPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load sample modules (Firebase integration can be added later)
    setModules(ALL_MODULES);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-400">Loading modules...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black relative overflow-hidden">
        <DottedSurface className="opacity-20" />
        
        <div className="relative z-10 container mx-auto px-4 py-8">
          <EnhancedModuleList modules={modules} />
        </div>
      </div>
    </ProtectedRoute>
  );
}

