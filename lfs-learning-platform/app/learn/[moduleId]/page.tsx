'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Module, Lesson } from '@/lib/types/learning';
import { ALL_MODULES } from '@/lib/data/modules';
import { ChevronLeft, CheckCircle } from 'lucide-react';

export default function ModuleDetailPage() {
  const params = useParams();
  const moduleId = params?.moduleId as string;
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Find module from sample data
    const found = ALL_MODULES.find(m => m.id === moduleId);
    setModule(found || null);
    setLoading(false);
  }, [moduleId]);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-400">Loading module...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!module) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="text-center">
            <p className="text-slate-400 mb-4">Module not found</p>
            <Link href="/learn" className="text-blue-400 hover:text-blue-300">
              Back to modules
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-slate-900 border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <Link
              href="/learn"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Back to Modules
            </Link>

            <h1 className="text-4xl font-bold text-white mb-2">{module.title}</h1>
            <p className="text-slate-300">{module.description}</p>

            <div className="flex gap-4 mt-4 flex-wrap">
              <div className="px-4 py-2 bg-slate-800 rounded-lg text-slate-300">
                <span className="font-semibold">{module.lessons.length}</span> lessons
              </div>
              <div className="px-4 py-2 bg-slate-800 rounded-lg text-slate-300">
                <span className="font-semibold">
                  {module.lessons.reduce((sum, l) => sum + l.duration, 0)}
                </span>{' '}
                minutes
              </div>
              <div className={`px-4 py-2 rounded-lg font-semibold ${
                module.difficulty.toLowerCase() === 'beginner' ? 'bg-green-900/50 text-green-200' :
                module.difficulty.toLowerCase() === 'intermediate' ? 'bg-yellow-900/50 text-yellow-200' :
                'bg-red-900/50 text-red-200'
              }`}>
                {module.difficulty}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Lessons List */}
            <div className="lg:col-span-3">
              <h2 className="text-2xl font-bold text-white mb-6">Lessons</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {module.lessons.map((lesson, idx) => (
                  <Link key={lesson.id} href={`/learn/${moduleId}/${lesson.id}`}>
                    <div className="group p-6 bg-slate-900 border border-slate-700 rounded-lg hover:border-blue-500 hover:bg-slate-800 transition-all cursor-pointer">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 font-bold">
                            {idx + 1}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                              {lesson.title}
                            </h3>
                            <p className="text-sm text-slate-400">{lesson.duration} minutes</p>
                          </div>
                        </div>
                        <CheckCircle className="w-5 h-5 text-slate-600 group-hover:text-blue-400 transition-colors" />
                      </div>
                      <p className="text-slate-400 text-sm mb-4">{lesson.description}</p>

                      <div className="flex gap-2 flex-wrap">
                        <span className="text-xs px-2 py-1 bg-slate-700 text-slate-300 rounded">
                          {lesson.faqs.length} FAQs
                        </span>
                        <span className="text-xs px-2 py-1 bg-slate-700 text-slate-300 rounded">
                          {lesson.quiz.length} questions
                        </span>
                        <span className="text-xs px-2 py-1 bg-slate-700 text-slate-300 rounded">
                          {lesson.funFacts.length} fun facts
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Module Stats */}
            <div className="lg:col-span-3 mt-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-900/50 to-slate-900 p-6 rounded-lg border border-blue-700/50">
                  <p className="text-slate-300 text-sm mb-2">Total Content</p>
                  <p className="text-3xl font-bold text-blue-400">
                    {module.lessons.reduce((sum, l) => sum + l.faqs.length + l.interestingFacts.length + l.funFacts.length, 0)}
                  </p>
                  <p className="text-slate-400 text-xs mt-1">insights & facts</p>
                </div>

                <div className="bg-gradient-to-br from-purple-900/50 to-slate-900 p-6 rounded-lg border border-purple-700/50">
                  <p className="text-slate-300 text-sm mb-2">Total Questions</p>
                  <p className="text-3xl font-bold text-purple-400">
                    {module.lessons.reduce((sum, l) => sum + l.quiz.length, 0)}
                  </p>
                  <p className="text-slate-400 text-xs mt-1">to master</p>
                </div>

                <div className="bg-gradient-to-br from-green-900/50 to-slate-900 p-6 rounded-lg border border-green-700/50">
                  <p className="text-slate-300 text-sm mb-2">Estimated Time</p>
                  <p className="text-3xl font-bold text-green-400">
                    {Math.round(module.lessons.reduce((sum, l) => sum + l.duration, 0) / 60)}h
                  </p>
                  <p className="text-slate-400 text-xs mt-1">to complete</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

